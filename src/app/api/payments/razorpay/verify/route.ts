import { NextRequest, NextResponse } from "next/server";
import { getVideoOrderById, updateVideoOrder, verifyOrderAccessToken } from "@/lib/video-order-service";
import { verifyPaymentSignature, fetchRazorpayPayment } from "@/lib/razorpay";
import { dispatchOrderNotifications } from "@/lib/order-notification";
import { verifyAdminRequest } from "@/lib/server-auth";
import { OrderPaymentRecord, VideoOrder } from "@/types/video-order";

export const dynamic = "force-dynamic";

/**
 * Server-Side Razorpay Payment Verification API Endpoint
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Responsibilities:
 * 1. Cryptographic HMAC-SHA256 signature verification (Server-Side ONLY)
 * 2. Idempotency & duplicate payment prevention
 * 3. 50% Advance Model state machine transitions:
 *    - Advance: paymentStatus -> 'advance_paid', projectStatus -> 'payment_confirmed' (transitioning to 'awaiting_editor_assignment')
 *    - Remaining: paymentStatus -> 'fully_paid', projectStatus -> 'completed_and_delivered'
 * 4. Multi-channel notification dispatch (Customer email, Business owner email, WhatsApp)
 * 5. Update audit trail in order history
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

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentType = "advance",
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required verification fields (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature).",
        },
        { status: 400 }
      );
    }

    // 1. Fetch Authoritative Order
    const order = await getVideoOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // 2. Authorization Check: Require valid customer order access token or verified admin identity
    const authHeader = req.headers.get("authorization") || "";
    const orderToken =
      req.headers.get("x-order-token") ||
      (authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null) ||
      (typeof body.token === "string" ? body.token : null);

    const adminAuth = await verifyAdminRequest(req);
    const isOwner = orderToken ? verifyOrderAccessToken(order, orderToken) : false;

    if (!adminAuth.authorized && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: A valid customer order access token (in 'x-order-token' header) or administrator credentials are required to verify payment.",
        },
        { status: 401 }
      );
    }

    // 2. Prevent Duplicate Payment Processing (Idempotency Check)
    const existingPayments = order.payments || [];
    const duplicatePayment = existingPayments.find(
      (p) => p.razorpayPaymentId === razorpayPaymentId
    );

    if (duplicatePayment) {
      console.warn(`[PaymentVerifyAPI] Duplicate payment detected for ${razorpayPaymentId}`);
      return NextResponse.json({
        success: true,
        message: "Payment has already been processed.",
        isDuplicate: true,
        order,
        paymentRecord: duplicatePayment,
      });
    }

    // 3. Perform Server-Side Cryptographic Signature Verification
    const verification = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verification.valid) {
      console.error(
        `[PaymentVerifyAPI] Cryptographic signature verification failed for Order: ${order.orderNumber}`
      );
      return NextResponse.json(
        {
          success: false,
          error: "Payment signature verification failed. Untrusted or altered transaction data.",
          reason: verification.reason,
        },
        { status: 400 }
      );
    }

    // 4. Construct Verified Payment Record
    const paidAmount =
      paymentType === "remaining"
        ? order.pricing.remainingAmount
        : paymentType === "full"
        ? order.pricing.totalAmount
        : order.pricing.advanceAmount;

    const paymentRecord: OrderPaymentRecord = {
      id: `pay_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentType,
      amount: paidAmount,
      currency: "INR",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: "captured",
      capturedAt: new Date().toISOString(),
      receiptNumber: `${order.orderNumber}-${paymentType.toUpperCase()}`,
    };

    // 5. Update Order Status in 50% Advance Pipeline
    const newPaymentStatus =
      paymentType === "remaining" || paymentType === "full" ? "fully_paid" : "advance_paid";

    const newProjectStatus =
      paymentType === "remaining" || paymentType === "full"
        ? "completed_and_delivered"
        : "payment_confirmed"; // Ready for awaiting_editor_assignment

    const updatedPayments = [...existingPayments, paymentRecord];

    // 6. Update in Database
    const updatedOrder = await updateVideoOrder(order.id, {
      paymentStatus: newPaymentStatus,
      projectStatus: newProjectStatus,
      status: newPaymentStatus === "fully_paid" ? "completed" : "advance_received",
      payments: updatedPayments,
    });

    const activeOrder: VideoOrder = updatedOrder || {
      ...order,
      paymentStatus: newPaymentStatus,
      projectStatus: newProjectStatus,
      status: newPaymentStatus === "fully_paid" ? "completed" : "advance_received",
      payments: updatedPayments,
    };

    // 7. Dispatch Multi-channel Notifications
    const notificationsResult = await dispatchOrderNotifications(activeOrder, paymentRecord);
    const existingNotifications = activeOrder.notifications || [];
    const updatedNotifications = [
      ...existingNotifications,
      notificationsResult.customerEmail,
      notificationsResult.ownerEmail,
      notificationsResult.whatsapp,
    ];

    // Update notifications in order record
    await updateVideoOrder(activeOrder.id, {
      notifications: updatedNotifications,
      // Transition project status to awaiting_editor_assignment after payment confirmation
      projectStatus:
        newProjectStatus === "payment_confirmed"
          ? "awaiting_editor_assignment"
          : newProjectStatus,
    });

    return NextResponse.json({
      success: true,
      message:
        paymentType === "advance"
          ? `50% Advance Payment of ₹${paidAmount} verified successfully. Order confirmed.`
          : `Payment of ₹${paidAmount} verified successfully.`,
      orderNumber: activeOrder.orderNumber,
      paymentStatus: newPaymentStatus,
      projectStatus:
        newProjectStatus === "payment_confirmed"
          ? "awaiting_editor_assignment"
          : newProjectStatus,
      paymentRecord,
      order: activeOrder,
      notifications: {
        customerEmail: notificationsResult.customerEmail.status,
        ownerEmail: notificationsResult.ownerEmail.status,
        whatsapp: notificationsResult.whatsapp.status,
        whatsappClickToChatUrl: notificationsResult.whatsapp.details,
      },
    });
  } catch (error) {
    console.error("[RazorpayVerifyAPI] Exception:", error);
    return NextResponse.json(
      { success: false, error: "Internal error occurred while verifying payment." },
      { status: 500 }
    );
  }
}
