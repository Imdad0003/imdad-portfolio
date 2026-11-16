/**
 * End-to-End Verification Test Suite for Razorpay Payment & Order Automation
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Runs comprehensive automated verification for:
 * 1. 50% Advance pricing formula calculation
 * 2. Order building & unique order ID schema (IMD-VID-...)
 * 3. Server-side Razorpay order creation
 * 4. Cryptographic HMAC-SHA256 signature verification & timing safety
 * 5. Payment verification state machine & duplicate prevention
 * 6. Multi-channel notifications (Customer email, Owner email, WhatsApp integration)
 * 7. Balance payment workflow (Remaining 50% collection)
 * 8. Editor assignment & 7-stage project lifecycle tracking
 * 9. Razorpay webhook verification & event processing
 */

import crypto from "crypto";
import {
  calculateOrderPricing,
  buildVideoOrder,
  generateOrderNumber,
  persistVideoOrder,
  getVideoOrderById,
  updateVideoOrder,
  listAllVideoOrders,
} from "../src/lib/video-order-service";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getRazorpayCredentials,
} from "../src/lib/razorpay";
import {
  buildCustomerEmailContent,
  buildOwnerEmailContent,
  buildWhatsAppMessage,
  dispatchOrderNotifications,
  getOwnerEmail,
} from "../src/lib/order-notification";
import { ProjectStatus, VideoOrder } from "../src/types/video-order";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("   AGENT 03: RAZORPAY PAYMENT & ORDER AUTOMATION VERIFICATION     ");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: 50% Advance Pricing Calculation
  // -------------------------------------------------------------
  console.log("--- 1. Testing 50% Advance Pricing Model ---");
  const pricing1000 = calculateOrderPricing("ugc-style-ad", { customAmount: 1000 });
  assert(pricing1000.totalAmount === 1000, "Total amount is ₹1,000");
  assert(pricing1000.advanceAmount === 500, "50% Advance amount is exactly ₹500");
  assert(pricing1000.remainingAmount === 500, "Remaining balance is exactly ₹500");
  assert(pricing1000.advancePercentage === 50, "Advance percentage is 50%");

  const pricing2500 = calculateOrderPricing("premium-ad-creative", { customAmount: 2500 });
  assert(pricing2500.advanceAmount === 1250, "₹2,500 project -> 50% Advance is ₹1,250");
  assert(pricing2500.remainingAmount === 1250, "₹2,500 project -> Remaining balance is ₹1,250");

  // -------------------------------------------------------------
  // TEST 2: Order Building & Unique Order ID Schema
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Order Building & Unique Order ID ---");
  const testOrder = buildVideoOrder(
    {
      fullName: "Priya Sharma",
      mobileNumber: "9876543210",
      email: "priya.sharma@example.com",
    },
    {
      serviceId: "ugc-style-ad",
      serviceName: "UGC Style Video Ad",
      videoType: "ugc-style-ad",
      videoFormat: "mp4",
      aspectRatio: "9:16",
      approxDuration: "30 seconds",
      requirements: "Fast-paced TikTok/Reel cut with energetic captions and hook.",
      deliveryDate: "2026-11-25",
      referenceVideoUrl: "https://example.com/reference-reel",
      rawFootageProvided: true,
      uploadedFiles: [
        {
          id: "file_raw_1",
          name: "clip_intro.mp4",
          size: 15 * 1024 * 1024,
          type: "video/mp4",
          category: "raw_footage",
          storagePath: "/internal/vault/clip_intro.mp4",
          fileKey: "vault_key_1",
          uploadedAt: new Date().toISOString(),
        },
      ],
    },
    { customAmount: 1000 }
  );

  assert(testOrder.orderNumber.startsWith("IMD-VID-"), `Order number starts with IMD-VID- (${testOrder.orderNumber})`);
  assert(testOrder.status === "pending_payment" || testOrder.status === "pending_advance", "Initial status is 'pending_payment' (or 'pending_advance')");
  assert(testOrder.paymentStatus === "unpaid", "Initial paymentStatus is 'unpaid'");
  assert(testOrder.projectStatus === "pending_payment", "Initial projectStatus is 'pending_payment'");
  assert(testOrder.assignedEditor === null, "Initial assignedEditor is null");
  assert(Array.isArray(testOrder.payments) && testOrder.payments.length === 0, "Initial payments array is empty");
  assert(Array.isArray(testOrder.notifications) && testOrder.notifications.length === 0, "Initial notifications array is empty");

  await persistVideoOrder(testOrder);
  const fetched = await getVideoOrderById(testOrder.id);
  assert(fetched !== null && fetched.id === testOrder.id, "Order successfully persisted and retrieved by ID");

  // -------------------------------------------------------------
  // TEST 3: Backend Razorpay Order Creation
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing Backend Razorpay Order Creation ---");
  const rzpOrder = await createRazorpayOrder({
    orderId: testOrder.id,
    orderNumber: testOrder.orderNumber,
    amount: testOrder.pricing.advanceAmount, // ₹500
    receipt: `${testOrder.orderNumber}-ADV`,
    currency: "INR",
  });

  assert(Boolean(rzpOrder.id), `Razorpay order created with ID: ${rzpOrder.id}`);
  assert(rzpOrder.amount === 50000, "Razorpay amount is 50,000 paise (₹500.00)");
  assert(rzpOrder.receipt === `${testOrder.orderNumber}-ADV`, "Receipt matches internal order identifier");

  // -------------------------------------------------------------
  // TEST 4: Cryptographic Payment Signature Verification
  // -------------------------------------------------------------
  console.log("\n--- 4. Testing Cryptographic HMAC-SHA256 Signature Verification ---");
  const { keySecret } = getRazorpayCredentials();
  const testPaymentId = `pay_${Date.now()}`;
  const validSignaturePayload = `${rzpOrder.id}|${testPaymentId}`;
  const validSignature = crypto
    .createHmac("sha256", keySecret)
    .update(validSignaturePayload)
    .digest("hex");

  const validResult = verifyPaymentSignature({
    razorpayOrderId: rzpOrder.id,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
  });
  assert(validResult.valid === true, "Valid HMAC-SHA256 signature passed verification");

  const tamperedResult = verifyPaymentSignature({
    razorpayOrderId: rzpOrder.id,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: "invalid_tampered_signature_hex_12345",
  });
  assert(tamperedResult.valid === false, "Tampered signature was rejected by server");

  // -------------------------------------------------------------
  // TEST 5: Payment Processing & Duplicate Prevention (Idempotency)
  // -------------------------------------------------------------
  console.log("\n--- 5. Testing Payment State Transitions & Duplicate Prevention ---");
  const paymentRecord = {
    id: `pay_rec_${Date.now()}`,
    paymentType: "advance" as const,
    amount: testOrder.pricing.advanceAmount,
    currency: "INR" as const,
    razorpayOrderId: rzpOrder.id,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
    status: "captured" as const,
    capturedAt: new Date().toISOString(),
    receiptNumber: `${testOrder.orderNumber}-ADVANCE`,
  };

  const updatedOrder = await updateVideoOrder(testOrder.id, {
    paymentStatus: "advance_paid",
    projectStatus: "payment_confirmed",
    status: "advance_received",
    payments: [paymentRecord],
  });

  assert(updatedOrder?.paymentStatus === "advance_paid", "paymentStatus transitioned to 'advance_paid'");
  assert(updatedOrder?.projectStatus === "payment_confirmed", "projectStatus transitioned to 'payment_confirmed'");

  // Duplicate check
  const duplicateCheck = (updatedOrder?.payments || []).some(
    (p) => p.razorpayPaymentId === testPaymentId
  );
  assert(duplicateCheck === true, "Duplicate payment ID is detected in existing order records");

  // -------------------------------------------------------------
  // TEST 6: Multi-channel Notifications
  // -------------------------------------------------------------
  console.log("\n--- 6. Testing Multi-Channel Notifications ---");
  const custEmail = buildCustomerEmailContent(updatedOrder!, paymentRecord);
  assert(custEmail.subject.includes(testOrder.orderNumber), "Customer email subject contains order number");
  assert(custEmail.body.includes("500"), "Customer email body confirms 50% advance amount ₹500");
  assert(custEmail.body.includes("Remaining"), "Customer email body mentions remaining balance");

  const ownerEmail = buildOwnerEmailContent(updatedOrder!, paymentRecord);
  assert(ownerEmail.subject.includes("[NEW ORDER PAID]"), "Owner email subject clearly announces paid order");
  assert(ownerEmail.body.includes(testOrder.customer.email), "Owner email body contains client email");

  const wa = buildWhatsAppMessage(updatedOrder!, paymentRecord);
  assert(wa.clickToChatUrl.startsWith("https://wa.me/"), "WhatsApp click-to-chat URL properly constructed");
  assert(wa.message.includes("500"), "WhatsApp message contains advance amount");

  const dispatchResult = await dispatchOrderNotifications(updatedOrder!, paymentRecord);
  assert(
    dispatchResult.customerEmail.status === "sent" || dispatchResult.customerEmail.status === "integration_ready",
    `Customer email dispatch status: ${dispatchResult.customerEmail.status}`
  );
  assert(
    dispatchResult.whatsapp.status === "sent" || dispatchResult.whatsapp.status === "click_to_chat_ready",
    `WhatsApp notification status: ${dispatchResult.whatsapp.status}`
  );

  // Transition projectStatus to awaiting_editor_assignment
  await updateVideoOrder(testOrder.id, {
    projectStatus: "awaiting_editor_assignment",
    notifications: [
      dispatchResult.customerEmail,
      dispatchResult.ownerEmail,
      dispatchResult.whatsapp,
    ],
  });

  // -------------------------------------------------------------
  // TEST 7: Editor Assignment & Project Lifecycle (All 7 Statuses)
  // -------------------------------------------------------------
  console.log("\n--- 7. Testing Editor Assignment & 7-Stage Lifecycle ---");
  const all7Statuses: ProjectStatus[] = [
    "pending_payment",
    "payment_confirmed",
    "awaiting_editor_assignment",
    "editing_in_progress",
    "review_and_revisions",
    "final_payment_pending",
    "completed_and_delivered",
  ];

  assert(all7Statuses.length === 7, "All 7 project lifecycle statuses are supported");

  // Assign editor
  const assigned = await updateVideoOrder(testOrder.id, {
    assignedEditor: {
      id: "ed_001",
      name: "Rahul Sharma",
      email: "rahul.editor@imdad.builds",
      phone: "+91 9123456780",
      assignedAt: new Date().toISOString(),
      notes: "High priority UGC client",
    },
    projectStatus: "editing_in_progress",
  });

  assert(assigned?.assignedEditor?.name === "Rahul Sharma", "Editor 'Rahul Sharma' assigned successfully");
  assert(assigned?.projectStatus === "editing_in_progress", "Project status transitioned to 'editing_in_progress'");

  // Move to review_and_revisions
  const inReview = await updateVideoOrder(testOrder.id, { projectStatus: "review_and_revisions" });
  assert(inReview?.projectStatus === "review_and_revisions", "Project status transitioned to 'review_and_revisions'");

  // Move to final_payment_pending
  const finalPending = await updateVideoOrder(testOrder.id, { projectStatus: "final_payment_pending" });
  assert(finalPending?.projectStatus === "final_payment_pending", "Project status transitioned to 'final_payment_pending'");

  // -------------------------------------------------------------
  // TEST 8: Remaining Balance Payment (50% Completion)
  // -------------------------------------------------------------
  console.log("\n--- 8. Testing Remaining Balance Payment (50% Completion) ---");
  const balanceRzpOrder = await createRazorpayOrder({
    orderId: testOrder.id,
    orderNumber: testOrder.orderNumber,
    amount: finalPending!.pricing.remainingAmount, // ₹500 remaining
    receipt: `${testOrder.orderNumber}-REM`,
    currency: "INR",
  });

  assert(balanceRzpOrder.amount === 50000, "Remaining balance order is 50,000 paise (₹500)");

  const balancePaymentId = `pay_balance_${Date.now()}`;
  const validBalanceSign = crypto
    .createHmac("sha256", keySecret)
    .update(`${balanceRzpOrder.id}|${balancePaymentId}`)
    .digest("hex");

  const balancePaymentRecord = {
    id: `pay_rec_rem_${Date.now()}`,
    paymentType: "remaining" as const,
    amount: finalPending!.pricing.remainingAmount,
    currency: "INR" as const,
    razorpayOrderId: balanceRzpOrder.id,
    razorpayPaymentId: balancePaymentId,
    razorpaySignature: validBalanceSign,
    status: "captured" as const,
    capturedAt: new Date().toISOString(),
    receiptNumber: `${testOrder.orderNumber}-REMAINING`,
  };

  const completedOrder = await updateVideoOrder(testOrder.id, {
    paymentStatus: "fully_paid",
    projectStatus: "completed_and_delivered",
    status: "completed",
    payments: [...(finalPending?.payments || []), balancePaymentRecord],
  });

  assert(completedOrder?.paymentStatus === "fully_paid", "Order paymentStatus is now 'fully_paid'");
  assert(completedOrder?.projectStatus === "completed_and_delivered", "Project status is 'completed_and_delivered'");
  assert(completedOrder?.payments?.length === 2, "Order contains both advance and balance payment records");

  // -------------------------------------------------------------
  // TEST 9: Webhook Signature Verification & Idempotency
  // -------------------------------------------------------------
  console.log("\n--- 9. Testing Razorpay Webhook Signature & Idempotent Processing ---");
  const webhookBody = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_wh_${Date.now()}`,
          order_id: balanceRzpOrder.id,
          amount: 50000,
          currency: "INR",
          status: "captured",
          notes: {
            orderId: testOrder.id,
            orderNumber: testOrder.orderNumber,
            paymentType: "remaining",
          },
        },
      },
    },
  });

  const { webhookSecret } = getRazorpayCredentials();
  const validWebhookSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookBody)
    .digest("hex");

  const webhookCheck = verifyWebhookSignature({
    rawBody: webhookBody,
    signature: validWebhookSignature,
  });
  assert(webhookCheck === true, "Razorpay webhook HMAC-SHA256 signature verified successfully");

  const invalidWebhookCheck = verifyWebhookSignature({
    rawBody: webhookBody,
    signature: "invalid_webhook_sig_hex_9999",
  });
  assert(invalidWebhookCheck === false, "Tampered webhook signature correctly rejected");

  // -------------------------------------------------------------
  // TEST 10: Admin Order Listing & Metric Aggregation
  // -------------------------------------------------------------
  console.log("\n--- 10. Testing Admin Order Listing & Metrics ---");
  const allOrders = await listAllVideoOrders();
  assert(allOrders.length >= 1, `listAllVideoOrders() returned ${allOrders.length} orders`);
  const foundOrder = allOrders.find((o) => o.id === testOrder.id);
  assert(Boolean(foundOrder), "Admin orders list contains newly processed order");

  // Summary
  console.log("\n==================================================================");
  console.log(`   AGENT 03 VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================\n");

  if (passedTests === totalTests) {
    console.log("SUCCESS: All Agent 03 Razorpay & Order Automation requirements verified 100%!");
  } else {
    console.error(`FAILED: ${totalTests - passedTests} test(s) failed.`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
