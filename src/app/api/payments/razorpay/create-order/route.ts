import { NextRequest, NextResponse } from "next/server";
import { getVideoOrderById } from "@/lib/video-order-service";
import { createRazorpayOrder, getRazorpayCredentials } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * Diagnostic and Readiness Verification Endpoint for Razorpay Configuration
 * Reports variable availability, format, and alignment without leaking secrets.
 */
export async function GET() {
  const isProd = process.env.NODE_ENV === "production";
  const rawKeyId = process.env.RAZORPAY_KEY_ID || "";
  const rawPubKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const rawWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  const keyId = rawKeyId.trim();
  const pubKeyId = rawPubKeyId.trim();
  const keySecret = rawKeySecret.trim();
  const webhookSecret = rawWebhookSecret.trim();

  const keyIdPrefix = keyId ? keyId.substring(0, 8) : "NOT_SET";
  const pubKeyIdPrefix = pubKeyId ? pubKeyId.substring(0, 8) : "NOT_SET";

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isProduction: isProd,
    variables: {
      RAZORPAY_KEY_ID: {
        configured: Boolean(keyId),
        prefix: keyIdPrefix,
        length: keyId.length,
        hasWhitespace: rawKeyId.length !== keyId.length,
        isLiveKey: keyId.startsWith("rzp_live_"),
        isTestKey: keyId.startsWith("rzp_test_"),
      },
      NEXT_PUBLIC_RAZORPAY_KEY_ID: {
        configured: Boolean(pubKeyId),
        prefix: pubKeyIdPrefix,
        length: pubKeyId.length,
        hasWhitespace: rawPubKeyId.length !== pubKeyId.length,
        isLiveKey: pubKeyId.startsWith("rzp_live_"),
        isTestKey: pubKeyId.startsWith("rzp_test_"),
      },
      RAZORPAY_KEY_SECRET: {
        configured: Boolean(keySecret),
        length: keySecret.length,
        hasWhitespace: rawKeySecret.length !== keySecret.length,
      },
      RAZORPAY_WEBHOOK_SECRET: {
        configured: Boolean(webhookSecret),
        length: webhookSecret.length,
        hasWhitespace: rawWebhookSecret.length !== webhookSecret.length,
      },
    },
    consistency: {
      keysMatch: Boolean(keyId && pubKeyId && keyId === pubKeyId),
      credentialsPairConfigured: Boolean(keyId && keySecret),
      webhookConfigured: Boolean(webhookSecret),
    },
  });
}

/**
 * Backend Razorpay Order Creation API Endpoint
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Responsibilities:
 * 1. Validate order existence
 * 2. Look up authoritative pricing from stored order (NEVER trust client-sent amounts)
 * 3. Enforce 50% advance payment model
 * 4. Create Razorpay order on backend (in paise)
 * 5. Return order details and public key to frontend without exposing secret keys
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { orderId, paymentType = "advance" } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'orderId' parameter." },
        { status: 400 }
      );
    }

    // 1. Fetch Authoritative Order from Database
    const order = await getVideoOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order with ID '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // 2. Determine and Validate Payment Amount
    let targetAmount = 0;
    let description = "";

    if (paymentType === "advance") {
      if (order.paymentStatus === "advance_paid" || order.paymentStatus === "fully_paid") {
        return NextResponse.json(
          {
            success: false,
            error: "Advance payment has already been completed for this order.",
            paymentStatus: order.paymentStatus,
          },
          { status: 400 }
        );
      }
      targetAmount = order.pricing.advanceAmount;
      description = `50% Advance for ${order.project.serviceName} (${order.orderNumber})`;
    } else if (paymentType === "remaining") {
      if (order.paymentStatus !== "advance_paid") {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot pay remaining balance before advance payment is received.",
            paymentStatus: order.paymentStatus,
          },
          { status: 400 }
        );
      }
      targetAmount = order.pricing.remainingAmount;
      description = `Remaining Balance for ${order.project.serviceName} (${order.orderNumber})`;
    } else if (paymentType === "full") {
      if (order.paymentStatus === "fully_paid") {
        return NextResponse.json(
          { success: false, error: "This order is already fully paid." },
          { status: 400 }
        );
      }
      targetAmount = order.pricing.totalAmount;
      description = `Full Payment for ${order.project.serviceName} (${order.orderNumber})`;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid paymentType. Must be 'advance', 'remaining', or 'full'." },
        { status: 400 }
      );
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Computed payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    // 3. Create Razorpay Order via Server-side Engine
    const razorpayOrder = await createRazorpayOrder({
      orderId: order.id,
      orderNumber: `${order.orderNumber}-${paymentType}`,
      amount: targetAmount,
      receipt: `${order.orderNumber}-${paymentType}`,
      currency: "INR",
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        serviceName: order.project.serviceName,
        paymentType,
        customerName: order.customer.fullName,
        customerEmail: order.customer.email,
        customerPhone: order.customer.mobileNumber,
      },
    });

    const { keyId } = getRazorpayCredentials();

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: targetAmount, // in INR for frontend display
      amountInPaise: razorpayOrder.amount, // in paise for Razorpay Checkout
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      description,
      keyId, // Safe public key ID for checkout
      paymentType,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        pricing: order.pricing,
        projectStatus: order.projectStatus,
      },
    });
  } catch (error) {
    console.error("[RazorpayCreateOrderAPI] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create Razorpay payment order.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
