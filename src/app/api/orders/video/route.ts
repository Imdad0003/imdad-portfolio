import { NextRequest, NextResponse } from "next/server";
import {
  validateCustomerInfo,
  validateProjectDetails,
  buildVideoOrder,
  preparePaymentHandoffContract,
  persistVideoOrder,
  getVideoOrderById,
} from "@/lib/video-order-service";
import { VideoOrderCustomerInfo, VideoOrderProjectDetails } from "@/types/video-order";

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
 * Retrieve Order by Order ID or Order Number
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

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

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[VideoOrderAPI] Fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}
