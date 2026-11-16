/**
 * Order Notification Service
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Responsibilities:
 * 1. Customer Confirmation Email (Order ID, Service Details, Advance Paid, Remaining Balance)
 * 2. Business Owner Notification Email (imdad.builds@gmail.com)
 * 3. WhatsApp Integration (Official API if configured, otherwise Clean Integration-Ready + Pre-filled Click-to-Chat Deep Link)
 * 4. Audit logging of notification events on the order
 */

import { VideoOrder, OrderNotificationRecord, OrderPaymentRecord } from "@/types/video-order";
import { getWhatsAppUrl } from "@/data/config";

export interface NotificationDispatchResult {
  customerEmail: OrderNotificationRecord;
  ownerEmail: OrderNotificationRecord;
  whatsapp: OrderNotificationRecord;
}

const DEFAULT_OWNER_EMAIL = "imdad.builds@gmail.com";

export function getOwnerEmail(): string {
  return process.env.BUSINESS_NOTIFICATION_EMAIL || process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0] || DEFAULT_OWNER_EMAIL;
}

/**
 * Generates structured Customer Order Confirmation Email Content
 */
export function buildCustomerEmailContent(order: VideoOrder, latestPayment?: OrderPaymentRecord) {
  const isFinal = order.paymentStatus === "fully_paid";
  const subject = isFinal
    ? `[Payment Complete] Final Balance Received for Order ${order.orderNumber}`
    : `[Order Confirmed] 50% Advance Received for Order ${order.orderNumber}`;

  const paymentDetails = latestPayment
    ? `
Payment Reference: ${latestPayment.razorpayPaymentId}
Payment Amount: ₹${latestPayment.amount.toLocaleString("en-IN")} (${latestPayment.paymentType.toUpperCase()})
Receipt: ${latestPayment.receiptNumber}
Remaining Pending: ₹${order.pricing.remainingAmount.toLocaleString("en-IN")}
`
    : `
Advance Paid: ₹${order.pricing.advanceAmount.toLocaleString("en-IN")}
Remaining Pending: ₹${order.pricing.remainingAmount.toLocaleString("en-IN")}
`;

  const body = `
Dear ${order.customer.fullName},

Thank you for choosing IMDAD.BUILDS. We have successfully confirmed your video editing order!

ORDER SUMMARY:
----------------------------------------
Order ID: ${order.orderNumber}
Service: ${order.project.serviceName} (${order.project.videoType})
Format: ${order.project.videoFormat.toUpperCase()} (${order.project.aspectRatio})
Duration: ~${order.project.approxDuration}
Target Delivery: ${order.project.deliveryDate}
Total Project Value: ₹${order.pricing.totalAmount.toLocaleString("en-IN")}
${paymentDetails}

NEXT STEPS:
1. Your project is transitioning to "awaiting_editor_assignment" in our production pipeline.
2. An editor will be assigned to review your creative requirements and footage.
3. You will receive an initial cut for review and revisions.
4. Remaining balance of ₹${order.pricing.remainingAmount.toLocaleString("en-IN")} will only be due upon final watermark-free asset delivery.

Need instant updates? Connect directly on WhatsApp with your Order ID: ${order.orderNumber}
Best regards,
Imdad | IMDAD.BUILDS
https://imdad.builds
`;

  return { subject, body };
}

/**
 * Generates Business Owner Notification Email Content
 */
export function buildOwnerEmailContent(order: VideoOrder, latestPayment?: OrderPaymentRecord) {
  const subject = `[NEW ORDER PAID] ${order.orderNumber} - ₹${latestPayment?.amount || order.pricing.advanceAmount} Received`;

  const body = `
Hello Imdad,

A new video editing order has been confirmed with payment!

CLIENT DETAILS:
- Name: ${order.customer.fullName}
- Mobile / WhatsApp: ${order.customer.mobileNumber}
- Email: ${order.customer.email}

ORDER DETAILS:
- Order Number: ${order.orderNumber}
- Order ID: ${order.id}
- Service: ${order.project.serviceName}
- Video Type: ${order.project.videoType}
- Aspect Ratio: ${order.project.aspectRatio}
- Duration: ${order.project.approxDuration}
- Target Delivery: ${order.project.deliveryDate}
- Uploaded Files: ${order.project.uploadedFiles?.length || 0} file(s)
- Requirements: ${order.project.requirements}
- Reference URL: ${order.project.referenceVideoUrl || "None provided"}

FINANCIAL BREAKDOWN:
- Total Value: ₹${order.pricing.totalAmount}
- Advance Paid: ₹${order.pricing.advanceAmount}
- Remaining Balance: ₹${order.pricing.remainingAmount}
- Latest Payment ID: ${latestPayment?.razorpayPaymentId || "Verified"}

CURRENT PIPELINE STATUS:
- Project Status: ${order.projectStatus || "payment_confirmed"}
- Action Required: Assign editor in Admin Dashboard (/admin).
`;

  return { subject, body };
}

/**
 * Generates WhatsApp Deep Link & Message
 */
export function buildWhatsAppMessage(order: VideoOrder, latestPayment?: OrderPaymentRecord): {
  message: string;
  clickToChatUrl: string;
} {
  const message =
    `🎬 *IMDAD.BUILDS — Order Confirmed: ${order.orderNumber}*\n\n` +
    `Hello *${order.customer.fullName}*! Your 50% advance payment of *₹${latestPayment?.amount || order.pricing.advanceAmount}* has been verified.\n\n` +
    `📋 *Order Details:*\n` +
    `• Service: ${order.project.serviceName}\n` +
    `• Aspect Ratio: ${order.project.aspectRatio}\n` +
    `• Duration: ~${order.project.approxDuration}\n` +
    `• Target Delivery: ${order.project.deliveryDate}\n` +
    `• Remaining Balance: ₹${order.pricing.remainingAmount}\n\n` +
    `Our editing queue is preparing your project. You can reply directly here with any additional footage or notes!`;

  const clickToChatUrl = getWhatsAppUrl(message);
  return { message, clickToChatUrl };
}

/**
 * Dispatches notifications across Email & WhatsApp
 */
export async function dispatchOrderNotifications(
  order: VideoOrder,
  latestPayment?: OrderPaymentRecord
): Promise<NotificationDispatchResult> {
  const timestamp = new Date().toISOString();
  const ownerEmail = getOwnerEmail();

  // 1. Customer Email
  const customerContent = buildCustomerEmailContent(order, latestPayment);
  let customerStatus: OrderNotificationRecord["status"] = "integration_ready";
  let customerDetails = "Customer confirmation queued/prepared.";

  // If Resend or SendGrid API key exists, send real email; otherwise queue/log
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "IMDAD.BUILDS <orders@imdad.builds>",
          to: order.customer.email,
          subject: customerContent.subject,
          text: customerContent.body,
        }),
      });
      if (res.ok) {
        customerStatus = "sent";
        customerDetails = "Email delivered via Resend API.";
      }
    } catch (e) {
      console.error("[OrderNotification] Resend email dispatch failed:", e);
      customerStatus = "failed";
      customerDetails = "Delivery failed, logged locally.";
    }
  } else {
    // Log as integration-ready without falsely claiming SMTP dispatch succeeded
    customerDetails = `Email prepared for ${order.customer.email}. [SMTP provider not configured - integration ready]`;
  }

  const customerRecord: OrderNotificationRecord = {
    id: `notif_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "customer_email",
    recipient: order.customer.email,
    subject: customerContent.subject,
    status: customerStatus,
    details: customerDetails,
    timestamp,
  };

  // 2. Business Owner Email
  const ownerContent = buildOwnerEmailContent(order, latestPayment);
  let ownerStatus: OrderNotificationRecord["status"] = "integration_ready";
  let ownerDetails = `Owner notification prepared for ${ownerEmail}.`;

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "IMDAD.BUILDS Orders <orders@imdad.builds>",
          to: ownerEmail,
          subject: ownerContent.subject,
          text: ownerContent.body,
        }),
      });
      if (res.ok) {
        ownerStatus = "sent";
        ownerDetails = `Delivered to business owner (${ownerEmail}).`;
      }
    } catch (e) {
      console.error("[OrderNotification] Owner email failed:", e);
      ownerStatus = "failed";
      ownerDetails = "Delivery failed, logged locally.";
    }
  } else {
    ownerDetails = `Owner notification prepared for ${ownerEmail}. [SMTP provider not configured - integration ready]`;
  }

  const ownerRecord: OrderNotificationRecord = {
    id: `notif_own_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "owner_email",
    recipient: ownerEmail,
    subject: ownerContent.subject,
    status: ownerStatus,
    details: ownerDetails,
    timestamp,
  };

  // 3. WhatsApp Notification
  const { clickToChatUrl, message } = buildWhatsAppMessage(order, latestPayment);
  let whatsappStatus: OrderNotificationRecord["status"] = "click_to_chat_ready";
  let whatsappDetails = `Click-to-chat deep link generated: ${clickToChatUrl}`;

  // Check if Meta WhatsApp Cloud API credentials exist
  const waToken = process.env.WHATSAPP_API_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waToken && waPhoneId) {
    try {
      const cleanPhone = order.customer.mobileNumber.replace(/\D/g, "");
      const res = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message },
        }),
      });
      if (res.ok) {
        whatsappStatus = "sent";
        whatsappDetails = "Direct WhatsApp Cloud API template delivered.";
      }
    } catch (e) {
      console.error("[OrderNotification] WhatsApp API dispatch failed:", e);
      whatsappStatus = "failed";
      whatsappDetails = "WhatsApp Cloud API failed, click-to-chat URL available.";
    }
  }

  const whatsappRecord: OrderNotificationRecord = {
    id: `notif_wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: "whatsapp",
    recipient: order.customer.mobileNumber,
    status: whatsappStatus,
    details: whatsappDetails,
    timestamp,
  };

  return {
    customerEmail: customerRecord,
    ownerEmail: ownerRecord,
    whatsapp: whatsappRecord,
  };
}
