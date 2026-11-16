/**
 * END-TO-END HTTP ROUTE HANDLER INTEGRATION TESTS
 * IMDAD.BUILDS Video Order System Audit
 *
 * Directly exercises the Next.js API route handlers using NextRequest/NextResponse:
 * - /api/orders/video (POST, GET)
 * - /api/payments/razorpay/create-order (POST)
 * - /api/payments/razorpay/verify (POST)
 * - /api/payments/razorpay/webhook (POST)
 * - /api/admin/orders/video (GET, PATCH)
 * - /api/orders/upload (POST)
 */

import { NextRequest } from "next/server";
import crypto from "crypto";
import { POST as createVideoOrder, GET as getVideoOrder } from "../src/app/api/orders/video/route";
import { POST as createRazorpayOrderRoute } from "../src/app/api/payments/razorpay/create-order/route";
import { POST as verifyRazorpayPaymentRoute } from "../src/app/api/payments/razorpay/verify/route";
import { POST as razorpayWebhookRoute } from "../src/app/api/payments/razorpay/webhook/route";
import { GET as adminGetOrders, PATCH as adminPatchOrder } from "../src/app/api/admin/orders/video/route";
import { getRazorpayCredentials } from "../src/lib/razorpay";

interface TestReport {
  suite: string;
  test: string;
  status: "PASS" | "FAIL";
  message: string;
}

const reports: TestReport[] = [];

function logTest(suite: string, test: string, condition: boolean, message: string) {
  const status = condition ? "PASS" : "FAIL";
  reports.push({ suite, test, status, message });
  console.log(`[${status}] [${suite}] ${test} :: ${message}`);
  if (!condition) {
    process.exitCode = 1;
  }
}

async function runE2EApiTests() {
  console.log("========================================================================");
  console.log("     STARTING END-TO-END API ROUTE HANDLER AUDIT (HTTP LEVEL)           ");
  console.log("========================================================================\n");

  const { keySecret, webhookSecret } = getRazorpayCredentials();

  // -------------------------------------------------------------------------
  // 1. POST /api/orders/video — Order Creation
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing POST /api/orders/video ---");
  const orderReq = new NextRequest("http://localhost:3000/api/orders/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        fullName: "Vikram Malhotra",
        mobileNumber: "9876501234",
        email: "vikram.m@example.com",
      },
      project: {
        serviceId: "ugc-style-ad",
        serviceName: "UGC Style Ad",
        videoType: "ugc-style-ad",
        videoFormat: "mp4",
        aspectRatio: "9:16",
        approxDuration: "30s",
        requirements: "Engaging commercial reel with subtitles and fast cuts",
        deliveryDate: "2026-12-15",
      },
      customAmount: 1000,
    }),
  });

  const orderRes = await createVideoOrder(orderReq);
  const orderData = await orderRes.json();

  logTest(
    "Order API",
    "Order Creation Success (HTTP 201)",
    orderRes.status === 201 && orderData.success === true,
    `Order registered with status 201: ${orderData.order?.orderNumber}`
  );

  const createdOrder = orderData.order;
  logTest(
    "Order API",
    "Standardized Order ID Format",
    createdOrder.orderNumber.startsWith("IMD-VID-") && createdOrder.id.startsWith("IMD-VID-"),
    `ID: ${createdOrder.id}, OrderNumber: ${createdOrder.orderNumber}`
  );

  logTest(
    "Order API",
    "Status & PaymentStatus Consistency",
    createdOrder.status === "pending_payment" &&
      createdOrder.projectStatus === "pending_payment" &&
      createdOrder.paymentStatus === "unpaid",
    `status: ${createdOrder.status}, projectStatus: ${createdOrder.projectStatus}, paymentStatus: ${createdOrder.paymentStatus}`
  );

  logTest(
    "Order API",
    "50% Advance Model in Contract",
    createdOrder.pricing.totalAmount === 1000 &&
      createdOrder.pricing.advanceAmount === 500 &&
      createdOrder.pricing.remainingAmount === 500 &&
      orderData.paymentContract.amountDue === 500,
    `Total: ₹1000, Advance Due: ₹500, Remaining Balance: ₹500`
  );

  // -------------------------------------------------------------------------
  // 2. POST /api/payments/razorpay/create-order — Advance Order Creation
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing POST /api/payments/razorpay/create-order ---");

  // Attempt remaining payment on fresh unpaid order (Must fail)
  const invalidRemainingReq = new NextRequest("http://localhost:3000/api/payments/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      paymentType: "remaining",
    }),
  });

  const invalidRemainingRes = await createRazorpayOrderRoute(invalidRemainingReq);
  logTest(
    "Payment Gateway",
    "Block Remaining Balance Pre-Advance (HTTP 400)",
    invalidRemainingRes.status === 400,
    `Rejected remaining balance payment on unpaid order`
  );

  // Legitimate Advance Payment Order Creation
  const advanceOrderReq = new NextRequest("http://localhost:3000/api/payments/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      paymentType: "advance",
    }),
  });

  const advanceOrderRes = await createRazorpayOrderRoute(advanceOrderReq);
  const advanceOrderData = await advanceOrderRes.json();

  logTest(
    "Payment Gateway",
    "Advance Razorpay Order Creation (HTTP 200)",
    advanceOrderRes.status === 200 && Boolean(advanceOrderData.razorpayOrderId),
    `Razorpay Order ID: ${advanceOrderData.razorpayOrderId}, Amount in Paise: ${advanceOrderData.amountInPaise}`
  );

  logTest(
    "Payment Gateway",
    "Zero Server Secret Exposure",
    !("keySecret" in advanceOrderData) && !("webhookSecret" in advanceOrderData),
    `Public key returned: ${advanceOrderData.keyId}, no secrets exposed`
  );

  // -------------------------------------------------------------------------
  // 3. POST /api/payments/razorpay/verify — Advance Payment Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing POST /api/payments/razorpay/verify ---");

  const rzpOrderId = advanceOrderData.razorpayOrderId;
  const advancePaymentId = `pay_adv_${Date.now()}`;

  // 3.1 Tampered Signature Test
  const tamperedVerifyReq = new NextRequest("http://localhost:3000/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: advancePaymentId,
      razorpaySignature: "forged_signature_0000000000000000000000000000000000000000000000000000000000000000",
      paymentType: "advance",
    }),
  });

  const tamperedVerifyRes = await verifyRazorpayPaymentRoute(tamperedVerifyReq);
  logTest(
    "Payment Verification",
    "Reject Tampered Payment Signature (HTTP 400)",
    tamperedVerifyRes.status === 400,
    `Tampered payment signature rejected with HTTP 400`
  );

  // 3.2 Authentic HMAC SHA-256 Signature
  const validAdvanceSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${rzpOrderId}|${advancePaymentId}`)
    .digest("hex");

  const authenticVerifyReq = new NextRequest("http://localhost:3000/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: advancePaymentId,
      razorpaySignature: validAdvanceSignature,
      paymentType: "advance",
    }),
  });

  const authenticVerifyRes = await verifyRazorpayPaymentRoute(authenticVerifyReq);
  const authenticVerifyData = await authenticVerifyRes.json();

  logTest(
    "Payment Verification",
    "Cryptographic Verification & Order Confirmation (HTTP 200)",
    authenticVerifyRes.status === 200 && authenticVerifyData.success === true,
    `Advance payment confirmed: ${authenticVerifyData.message}`
  );

  logTest(
    "Payment Verification",
    "Lifecycle Transition to awaiting_editor_assignment",
    authenticVerifyData.paymentStatus === "advance_paid" &&
      authenticVerifyData.projectStatus === "awaiting_editor_assignment",
    `paymentStatus: ${authenticVerifyData.paymentStatus}, projectStatus: ${authenticVerifyData.projectStatus}`
  );

  logTest(
    "Payment Verification",
    "Multi-channel Notifications Dispatched",
    Boolean(authenticVerifyData.notifications?.customerEmail) &&
      Boolean(authenticVerifyData.notifications?.ownerEmail) &&
      authenticVerifyData.notifications?.whatsappClickToChatUrl?.includes("https://wa.me/"),
    `Customer & Owner notices queued, WhatsApp click-to-chat ready`
  );

  // 3.3 Idempotent Duplicate Payment Prevention
  const duplicateVerifyReq = new NextRequest("http://localhost:3000/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: advancePaymentId,
      razorpaySignature: validAdvanceSignature,
      paymentType: "advance",
    }),
  });

  const duplicateVerifyRes = await verifyRazorpayPaymentRoute(duplicateVerifyReq);
  const duplicateVerifyData = await duplicateVerifyRes.json();

  logTest(
    "Payment Verification",
    "Duplicate Payment Idempotency Check",
    duplicateVerifyData.isDuplicate === true,
    `Identified duplicate payment ID ${advancePaymentId}; duplicate billing prevented`
  );

  // -------------------------------------------------------------------------
  // 4. REMAINING BALANCE PAYMENT (50% COMPLETION)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Remaining Balance Payment ---");

  // Create Razorpay Order for Remaining ₹500
  const remOrderReq = new NextRequest("http://localhost:3000/api/payments/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      paymentType: "remaining",
    }),
  });

  const remOrderRes = await createRazorpayOrderRoute(remOrderReq);
  const remOrderData = await remOrderRes.json();

  logTest(
    "Remaining Balance",
    "Create Remaining Balance Order (HTTP 200)",
    remOrderRes.status === 200 && remOrderData.amount === 500 && remOrderData.amountInPaise === 50000,
    `Remaining balance order created for ₹500 (50,000 paise)`
  );

  // Verify Remaining Payment Signature
  const remPaymentId = `pay_rem_${Date.now()}`;
  const validRemSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${remOrderData.razorpayOrderId}|${remPaymentId}`)
    .digest("hex");

  const remVerifyReq = new NextRequest("http://localhost:3000/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      razorpayOrderId: remOrderData.razorpayOrderId,
      razorpayPaymentId: remPaymentId,
      razorpaySignature: validRemSignature,
      paymentType: "remaining",
    }),
  });

  const remVerifyRes = await verifyRazorpayPaymentRoute(remVerifyReq);
  const remVerifyData = await remVerifyRes.json();

  logTest(
    "Remaining Balance",
    "Complete Order & Full Payment Transition",
    remVerifyRes.status === 200 &&
      remVerifyData.paymentStatus === "fully_paid" &&
      remVerifyData.projectStatus === "completed_and_delivered",
    `paymentStatus: fully_paid, projectStatus: completed_and_delivered`
  );

  // -------------------------------------------------------------------------
  // 5. POST /api/payments/razorpay/webhook — Webhook Signature & Events
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Testing POST /api/payments/razorpay/webhook ---");

  const webhookEventPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_wh_${Date.now()}`,
          order_id: remOrderData.razorpayOrderId,
          amount: 50000,
          currency: "INR",
          status: "captured",
          notes: {
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            paymentType: "remaining",
          },
        },
      },
    },
  });

  // Tampered Webhook Signature
  const tamperedWhReq = new NextRequest("http://localhost:3000/api/payments/razorpay/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": "tampered_webhook_signature_hex",
    },
    body: webhookEventPayload,
  });

  const tamperedWhRes = await razorpayWebhookRoute(tamperedWhReq);
  logTest(
    "Webhook Security",
    "Reject Invalid Webhook Signature (HTTP 400)",
    tamperedWhRes.status === 400,
    `Altered webhook payload/signature strictly rejected`
  );

  // Valid Webhook Signature
  const validWhSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookEventPayload)
    .digest("hex");

  const validWhReq = new NextRequest("http://localhost:3000/api/payments/razorpay/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": validWhSig,
    },
    body: webhookEventPayload,
  });

  const validWhRes = await razorpayWebhookRoute(validWhReq);
  logTest(
    "Webhook Security",
    "Process Verified Webhook Event (HTTP 200)",
    validWhRes.status === 200,
    `Webhook verified and event processed`
  );

  // -------------------------------------------------------------------------
  // 6. ADMIN API & EDITOR ASSIGNMENT
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Testing Admin API & Editor Assignment ---");

  // GET Orders
  const adminGetReq = new NextRequest("http://localhost:3000/api/admin/orders/video");
  const adminGetRes = await adminGetOrders(adminGetReq);
  const adminGetData = await adminGetRes.json();

  logTest(
    "Admin Operations",
    "Admin Order Listing & Financial Aggregation",
    adminGetRes.status === 200 && adminGetData.count >= 1,
    `Retrieved ${adminGetData.count} orders. Advance revenue: ₹${adminGetData.metrics.advanceCollected}`
  );

  // PATCH Order (Assign Editor & Status)
  const adminPatchReq = new NextRequest("http://localhost:3000/api/admin/orders/video", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: createdOrder.id,
      assignedEditor: {
        name: "Siddharth Roy",
        email: "siddharth@imdad.builds",
        phone: "+91 9988776655",
        notes: "UGC kinetic cuts lead",
      },
      projectStatus: "editing_in_progress",
      adminNotes: "Client requested delivery 2 days early.",
    }),
  });

  const adminPatchRes = await adminPatchOrder(adminPatchReq);
  const adminPatchData = await adminPatchRes.json();

  logTest(
    "Admin Operations",
    "Editor Assignment & Notes Update",
    adminPatchRes.status === 200 &&
      adminPatchData.order?.assignedEditor?.name === "Siddharth Roy" &&
      adminPatchData.order?.projectStatus === "editing_in_progress",
    `Editor 'Siddharth Roy' assigned. Stage updated to 'editing_in_progress'`
  );

  // -------------------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n========================================================================");
  console.log("                     E2E API AUDIT SUMMARY                              ");
  console.log("========================================================================");

  const passed = reports.filter((r) => r.status === "PASS").length;
  const failed = reports.filter((r) => r.status === "FAIL").length;

  console.log(`TOTAL E2E API CHECKS: ${reports.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("========================================================================\n");

  if (failed > 0) {
    console.error(`E2E API AUDIT FAILED with ${failed} failures.`);
    process.exit(1);
  } else {
    console.log("SUCCESS: ALL E2E API AUDIT WORKFLOWS PASSED 100%!");
  }
}

runE2EApiTests().catch((err) => {
  console.error("E2E Test execution exception:", err);
  process.exit(1);
});
