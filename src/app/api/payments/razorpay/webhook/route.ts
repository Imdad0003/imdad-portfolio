import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  getVideoOrderById,
  getVideoOrderByNumber,
  updateVideoOrder,
} from "@/lib/video-order-service";
import { dispatchOrderNotifications } from "@/lib/order-notification";
import { OrderPaymentRecord } from "@/types/video-order";

export const dynamic = "force-dynamic";

/**
 * Razorpay Webhook Endpoint
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Responsibilities:
 * 1. Cryptographic HMAC-SHA256 verification of x-razorpay-signature header
 * 2. Idempotent processing of payment.captured, payment.failed, and order.paid
 * 3. Graceful handling of duplicates, cancellations, and failures
 * 4. Audit logging and status updates
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // 1. Verify Webhook Signature
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error("[RazorpayWebhook] Signature verification failed.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const event = String(payload.event || "");
    const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as Record<string, unknown>;
    const payment = paymentEntity?.entity as Record<string, unknown> | undefined;

    console.log(`[RazorpayWebhook] Received event: ${event}`);

    if (!payment) {
      // Event does not contain payment entity (could be subscription, etc.)
      return NextResponse.json({ status: "acknowledged", event });
    }

    const razorpayPaymentId = String(payment.id || "");
    const razorpayOrderId = String(payment.order_id || "");
    const amountInPaise = Number(payment.amount || 0);
    const amountInINR = Math.round(amountInPaise / 100);
    const notes = (payment.notes || {}) as Record<string, string>;

    const orderId = notes.orderId;
    const orderNumber = notes.orderNumber;
    const paymentType = (notes.paymentType as "advance" | "remaining" | "full") || "advance";

    // 2. Resolve Target Order
    let targetOrder = orderId ? await getVideoOrderById(orderId) : null;
    if (!targetOrder && orderNumber) {
      targetOrder = await getVideoOrderByNumber(orderNumber);
    }

    if (!targetOrder) {
      console.warn(
        `[RazorpayWebhook] Could not associate payment ${razorpayPaymentId} with any video order.`
      );
      return NextResponse.json({
        status: "ignored",
        reason: "Order not found for given notes.",
      });
    }

    // 3. Handle Specific Webhook Events
    if (event === "payment.captured" || event === "order.paid") {
      const existingPayments = targetOrder.payments || [];
      const alreadyProcessed = existingPayments.some(
        (p) => p.razorpayPaymentId === razorpayPaymentId
      );

      if (alreadyProcessed) {
        console.log(
          `[RazorpayWebhook] Payment ${razorpayPaymentId} already processed for order ${targetOrder.orderNumber}.`
        );
        return NextResponse.json({ status: "ok", duplicate: true });
      }

      const newPaymentRecord: OrderPaymentRecord = {
        id: `pay_rec_wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        paymentType,
        amount: amountInINR,
        currency: "INR",
        razorpayOrderId,
        razorpayPaymentId,
        method: String(payment.method || "online"),
        status: "captured",
        capturedAt: new Date().toISOString(),
        receiptNumber: `${targetOrder.orderNumber}-${paymentType.toUpperCase()}`,
      };

      const newPaymentStatus =
        paymentType === "remaining" || paymentType === "full" ? "fully_paid" : "advance_paid";

      const newProjectStatus =
        paymentType === "remaining" || paymentType === "full"
          ? "completed_and_delivered"
          : "awaiting_editor_assignment";

      const updatedOrder = await updateVideoOrder(targetOrder.id, {
        paymentStatus: newPaymentStatus,
        projectStatus: newProjectStatus,
        status: newPaymentStatus === "fully_paid" ? "completed" : "advance_received",
        payments: [...existingPayments, newPaymentRecord],
      });

      if (updatedOrder) {
        // Multi-channel notifications
        const notifResult = await dispatchOrderNotifications(updatedOrder, newPaymentRecord);
        await updateVideoOrder(updatedOrder.id, {
          notifications: [
            ...(updatedOrder.notifications || []),
            notifResult.customerEmail,
            notifResult.ownerEmail,
            notifResult.whatsapp,
          ],
        });
      }

      return NextResponse.json({ status: "processed", event, paymentId: razorpayPaymentId });
    }

    if (event === "payment.failed") {
      const existingPayments = targetOrder.payments || [];
      const failedRecord: OrderPaymentRecord = {
        id: `pay_failed_${Date.now()}`,
        paymentType,
        amount: amountInINR,
        currency: "INR",
        razorpayOrderId,
        razorpayPaymentId,
        status: "failed",
        capturedAt: new Date().toISOString(),
        receiptNumber: `${targetOrder.orderNumber}-FAILED`,
        errorReason: String(payment.error_description || "Payment attempt failed at gateway"),
      };

      await updateVideoOrder(targetOrder.id, {
        payments: [...existingPayments, failedRecord],
        paymentStatus: targetOrder.paymentStatus === "advance_paid" ? "advance_paid" : "failed",
      });

      return NextResponse.json({ status: "recorded_failure", event });
    }

    return NextResponse.json({ status: "ignored_event", event });
  } catch (error) {
    console.error("[RazorpayWebhook] Exception:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error." },
      { status: 500 }
    );
  }
}
