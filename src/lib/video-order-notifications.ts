/**
 * Video Order Notification Dispatcher
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Provides structured multi-channel notification dispatching for video editing orders:
 * 1. Customer confirmation email (50% advance received, specs, delivery date, remaining balance)
 * 2. Business owner notification email to imdad.builds@gmail.com
 * 3. WhatsApp click-to-chat deep link with order specifics
 * 4. Audit logging on the Firestore order document
 */

import { VideoOrder, OrderPaymentRecord, OrderNotificationRecord } from "@/types/video-order";
import {
  dispatchOrderNotifications,
  buildCustomerEmailContent,
  buildOwnerEmailContent,
  buildWhatsAppMessage,
  getOwnerEmail,
  NotificationDispatchResult,
} from "./order-notification";

export {
  dispatchOrderNotifications,
  buildCustomerEmailContent,
  buildOwnerEmailContent,
  buildWhatsAppMessage,
  getOwnerEmail,
};

export type { NotificationDispatchResult };

/**
 * High-level helper to dispatch all verified payment notifications
 * and return the structured notification records.
 */
export async function sendOrderPaymentNotifications(
  order: VideoOrder,
  latestPayment?: OrderPaymentRecord
): Promise<OrderNotificationRecord[]> {
  const result = await dispatchOrderNotifications(order, latestPayment);
  return [result.customerEmail, result.ownerEmail, result.whatsapp];
}
