import { NextRequest, NextResponse } from "next/server";
import {
  validateCustomerInfo,
  validateProjectDetails,
  buildVideoOrder,
  preparePaymentHandoffContract,
  persistVideoOrder,
  getVideoOrderById,
  updateVideoOrder,
  verifyOrderAccessToken,
  sanitizeOrderForPublic,
  generateOrderAccessToken,
} from "@/lib/video-order-service";
import { VideoOrderCustomerInfo, VideoOrderProjectDetails } from "@/types/video-order";
import { verifyAdminRequest } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Video Editing Order Collection & Creation API Endpoint
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Responsibilities:
 * 1. Validate complete customer details (Full name, 10-digit mobile, email)
 * 2. Validate video specifications (Type, Format, Aspect Ratio, Duration, Requirements, Delivery Date, Reference)
 * 3. Enforce 50% advance pricing model (e.g. ₹1,000 total -> ₹500 advance, ₹500 remaining)
 * 4. Persist order with status: "pending_payment" and paymentStatus: "unpaid"
 * 5. Provide structured payment handoff contract for Agent 03 (Payment Workflow / Razorpay)
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

    const customer: Partial<VideoOrderCustomerInfo> = body.customer || {};
    const project: Partial<VideoOrderProjectDetails> = body.project || {};
    const deliveryOptionId: string = body.deliveryOptionId || "standard";
    const customAmount: number = typeof body.customAmount === "number" ? body.customAmount : 0;

    // 1. Validate Customer Information
    const customerValidation = validateCustomerInfo(customer);
    if (!customerValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer information validation failed.",
          errors: customerValidation.errors,
        },
        { status: 400 }
      );
    }

    // 2. Validate Project Details
    const projectValidation = validateProjectDetails(project);
    if (!projectValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Project specifications validation failed.",
          errors: projectValidation.errors,
        },
        { status: 400 }
      );
    }

    // 3. Build Verified Order Object
    const verifiedOrder = buildVideoOrder(
      customer as VideoOrderCustomerInfo,
      project as VideoOrderProjectDetails,
      {
        deliveryOptionId,
        customAmount,
        uploadedFiles: project.uploadedFiles || [],
      }
    );

    // 4. Persist to Firestore
    await persistVideoOrder(verifiedOrder);

    // 5. Generate Payment Handoff Contract for Agent 03
    const paymentContract = preparePaymentHandoffContract(verifiedOrder);

    return NextResponse.json(
      {
        success: true,
        message: "Video editing order created successfully. Ready for 50% advance payment.",
        order: verifiedOrder,
        paymentContract,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[VideoOrderAPI] Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while creating the video order." },
      { status: 500 }
    );
  }
}

/**
 * Retrieve Order with Strict Access Control & PII Protection
 *
 * Rules:
 * 1. Authenticated administrators receive the complete order.
 * 2. Authorized customers with valid cryptographic accessToken receive the complete order.
 * 3. Legacy orders without accessToken can be securely claimed by matching registered email.
 * 4. Unauthenticated public queries receive strictly sanitized tracking data (zero PII, no phone/email/requirements/file keys).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token") || req.headers.get("x-order-token");
    const format = searchParams.get("format");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId query parameter." },
        { status: 400 }
      );
    }

    const order = await getVideoOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // 1. Authenticated Admin Authorization Check
    const adminAuth = await verifyAdminRequest(req);
    if (adminAuth.authorized) {
      return NextResponse.json({
        success: true,
        order,
        accessLevel: "admin",
      });
    }

    // 2. Cryptographic Order Access Token Verification
    if (token && verifyOrderAccessToken(order, token)) {
      return NextResponse.json({
        success: true,
        order,
        accessLevel: "owner",
      });
    }

    // 3. Backward-Compatible Migration Path for Legacy Orders without Access Token
    const storedHash = (order.metadata?.accessTokenHash as string) || "";
    if (!storedHash) {
      const email =
        searchParams.get("email")?.trim().toLowerCase() ||
        req.headers.get("x-customer-email")?.trim().toLowerCase();

      if (email && email === order.customer.email.toLowerCase()) {
        const { rawToken, tokenHash } = generateOrderAccessToken();
        const updated = await updateVideoOrder(order.id, {
          metadata: {
            ...(order.metadata || {}),
            accessTokenHash: tokenHash,
            legacyMigratedAt: new Date().toISOString(),
          },
        });

        const activeOrder = updated || {
          ...order,
          metadata: { ...(order.metadata || {}), accessTokenHash: tokenHash },
        };
        activeOrder.accessToken = rawToken;

        return NextResponse.json({
          success: true,
          order: activeOrder,
          accessToken: rawToken,
          accessLevel: "owner",
          migrated: true,
        });
      }
    }

    // 4. Reject Explicit Private Request without Token
    if (format === "private" || format === "full") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Valid customer order access token required to view private details.",
        },
        { status: 401 }
      );
    }

    // 5. Unauthenticated Public Query: Return Sanitized Order (Zero PII)
    const sanitized = sanitizeOrderForPublic(order);
    return NextResponse.json({
      success: true,
      order: sanitized,
      isSanitized: true,
      accessLevel: "public",
      message: "Public tracking summary. Private customer details and uploaded assets require the order access token.",
    });
  } catch (error) {
    console.error("[VideoOrderAPI] Fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}
