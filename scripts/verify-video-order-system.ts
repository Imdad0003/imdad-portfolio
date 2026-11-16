/**
 * Verification & Audit Suite for Video Editing Order Collection System
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Verifies:
 * 1. Admin Compatibility Configuration & Data Structures
 * 2. Customer Information Validation (Name, Mobile, Email)
 * 3. Video Project Specifications Validation (Type, Format, Aspect Ratio, Duration, Brief, Deadline, Reference)
 * 4. 50% Advance Pricing Model Formula
 * 5. Secure Private File Upload Validation (MIME enforcement, 50MB limit, non-public vault path)
 * 6. Video Order Creation API & Payment Contract for Agent 03
 * 7. Integrated AI Agent Conversational Flow & State Extraction
 */

import { NextRequest } from "next/server";
import { defaultVideoOrderConfig } from "../src/data/video-order-config";
import {
  validateCustomerInfo,
  validateProjectDetails,
  calculateOrderPricing,
  buildVideoOrder,
  preparePaymentHandoffContract,
} from "../src/lib/video-order-service";
import {
  extractVideoOrderState,
  getNextVideoOrderQuestion,
} from "../src/lib/video-order-extractor";
import { POST as orderPost, GET as orderGet } from "../src/app/api/orders/video/route";
import { POST as uploadPost } from "../src/app/api/orders/upload/route";
import { GET as configGet } from "../src/app/api/admin/orders/video/config/route";
import { POST as chatPost } from "../src/app/api/chat/route";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ${colors.green}✔ [PASS]${colors.reset} ${testName}`);
  } else {
    failed++;
    console.error(`  ${colors.red}✖ [FAIL]${colors.reset} ${testName}`);
    if (detail) console.error(`    ${colors.yellow}Detail: ${detail}${colors.reset}`);
  }
}

async function runTestSuite() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`  IMDAD.BUILDS — VIDEO EDITING ORDER COLLECTION AUDIT (AGENT 02)      `);
  console.log(`======================================================================${colors.reset}\n`);

  // STAGE 1: Admin Compatibility Configuration & Data Structures
  console.log(`[STAGE 1] Admin Compatibility & Editable Configuration Structures`);
  assert(defaultVideoOrderConfig.serviceOptions.length >= 6, "Service options contain at least 6 packages");
  assert(
    defaultVideoOrderConfig.serviceOptions.some((s) => s.id === "product-reel" && s.startingPrice === 999),
    "Default Product Reel service configured with ₹999 starting price"
  );
  assert(
    defaultVideoOrderConfig.videoFormats.some((f) => f.id === "mp4" && f.recommended),
    "MP4 format configured as recommended video format"
  );
  assert(
    defaultVideoOrderConfig.aspectRatios.some((r) => r.id === "9:16" && r.recommended),
    "9:16 vertical ratio configured as recommended for Reels & Shorts"
  );
  assert(
    defaultVideoOrderConfig.deliveryOptions.some((d) => d.id === "standard" && d.extraCharge === 0),
    "Standard delivery tier configured with ₹0 extra charge"
  );
  assert(
    defaultVideoOrderConfig.uploadSettings.maxFileSizeMb === 50,
    "File upload limit configured to 50MB per file"
  );
  assert(
    defaultVideoOrderConfig.uploadSettings.privateAccessOnly === true,
    "File upload settings strictly enforce privateAccessOnly (no public exposure)"
  );

  const configReq = new NextRequest("http://localhost:3000/api/admin/orders/video/config");
  const configRes = await configGet();
  const configData = await configRes.json();
  assert(configRes.status === 200 && configData.success === true, "GET /api/admin/orders/video/config returns HTTP 200 with configuration");

  // STAGE 2: Customer Information Validation
  console.log(`\n[STAGE 2] Customer Information Validation`);
  const invalidCustomer = validateCustomerInfo({ fullName: "A", mobileNumber: "123", email: "bad-email" });
  assert(!invalidCustomer.valid, "Rejects invalid customer info (< 2 char name, < 10 digit phone, invalid email)");
  assert(Boolean(invalidCustomer.errors.fullName && invalidCustomer.errors.mobileNumber && invalidCustomer.errors.email), "Flags specific error fields for name, mobile, and email");

  const validCustomer = validateCustomerInfo({
    fullName: "Aarav Sharma",
    mobileNumber: "9876543210",
    email: "aarav@example.com",
  });
  assert(validCustomer.valid, "Accepts valid customer information (Aarav Sharma, 9876543210, aarav@example.com)");

  // STAGE 3: Project Specifications Validation
  console.log(`\n[STAGE 3] Video Project Specifications Validation`);
  const invalidProject = validateProjectDetails({ videoType: "", approxDuration: "" });
  assert(!invalidProject.valid, "Rejects project with missing type, format, aspect ratio, duration, requirements, and delivery date");

  const validProject = validateProjectDetails({
    serviceId: "product-reel",
    serviceName: "Product Reel",
    videoType: "Product Reel",
    videoFormat: "mp4",
    aspectRatio: "9:16",
    approxDuration: "30 seconds",
    requirements: "Fast-paced cuts with kinetic captions and 3-second hook",
    deliveryDate: "Within 48 hours",
  });
  assert(validProject.valid, "Accepts complete project specifications");

  // STAGE 4: 50% Advance Pricing Calculation Formula
  console.log(`\n[STAGE 4] 50% Advance Pricing Calculation Formula`);
  const price1000 = calculateOrderPricing("custom", { customAmount: 1000 });
  assert(price1000.totalAmount === 1000, "Calculates ₹1,000 total amount");
  assert(price1000.advanceAmount === 500, "Calculates exact 50% advance (₹500)");
  assert(price1000.remainingAmount === 500, "Calculates remaining balance (₹500)");

  const price999 = calculateOrderPricing("product-reel");
  assert(price999.totalAmount === 999, "Calculates ₹999 package total for Product Reel");
  assert(price999.advanceAmount === 500, "Calculates rounded 50% advance for ₹999 (₹500)");
  assert(price999.remainingAmount === 499, "Calculates remaining balance for ₹999 (₹499)");
  assert(price999.advanceAmount + price999.remainingAmount === price999.totalAmount, "Advance + Remaining exactly equals totalAmount");

  // STAGE 5: Secure Private File Upload
  console.log(`\n[STAGE 5] Secure Private File Upload Validation`);
  // 5.1 Rejects Disallowed MIME type
  const badFormData = new FormData();
  badFormData.append("file", new File([Buffer.from("malicious binary")], "payload.exe", { type: "application/x-msdownload" }));
  const badUploadReq = new NextRequest("http://localhost:3000/api/orders/upload", {
    method: "POST",
    body: badFormData,
  });
  const badUploadRes = await uploadPost(badUploadReq);
  assert(badUploadRes.status === 400, "Rejects disallowed executable MIME type with HTTP 400");

  // 5.2 Accepts Allowed Media File & Generates Secure Non-Public Reference
  const goodFormData = new FormData();
  const sampleAudioBuffer = Buffer.from("ID3\x03\x00\x00\x00\x00\x00\x00FakeMp3HeaderAudioDataForTesting");
  goodFormData.append("file", new File([sampleAudioBuffer], "voiceover-track.mp3", { type: "audio/mpeg" }));
  goodFormData.append("category", "voiceover");
  goodFormData.append("orderId", "test_ord_123");

  const goodUploadReq = new NextRequest("http://localhost:3000/api/orders/upload", {
    method: "POST",
    body: goodFormData,
  });
  const goodUploadRes = await uploadPost(goodUploadReq);
  assert(goodUploadRes.status === 201, "Accepts valid audio file upload with HTTP 201");
  const goodUploadData = await goodUploadRes.json();
  assert(goodUploadData.success === true, "Upload response indicates success: true");
  assert(
    goodUploadData.file.storagePath.startsWith("secure-vault/orders/"),
    `File stored in secure internal path (${goodUploadData.file.storagePath})`
  );
  assert(
    !goodUploadData.file.storagePath.includes("http://") && !goodUploadData.file.storagePath.includes("https://"),
    "Storage path is strictly internal and NOT a public web URL"
  );
  assert(goodUploadData.file.fileKey.startsWith("sec_"), "Generates tokenized file key for authenticated admin retrieval");

  // STAGE 6: Order Creation API & Agent 03 Payment Contract
  console.log(`\n[STAGE 6] Video Order Creation & Agent 03 Payment Contract`);
  const orderPayload = {
    customer: {
      fullName: "Vikram Malhotra",
      mobileNumber: "9876512345",
      email: "vikram@malhotrabrands.com",
    },
    project: {
      serviceId: "ugc-style-ad",
      serviceName: "UGC-Style Ad",
      videoType: "UGC-Style Ad",
      videoFormat: "mp4",
      aspectRatio: "9:16",
      approxDuration: "45 seconds",
      requirements: "Problem to solution hook, unboxing demonstration, high-CTR discount overlay",
      deliveryDate: "Within 48 hours",
      referenceVideoUrl: "https://instagram.com/reel/example_ref",
      uploadedFiles: [goodUploadData.file],
    },
    deliveryOptionId: "standard",
    customAmount: 1499,
  };

  const createOrderReq = new NextRequest("http://localhost:3000/api/orders/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  const createOrderRes = await orderPost(createOrderReq);
  assert(createOrderRes.status === 201, "POST /api/orders/video creates verified order with HTTP 201");
  const orderData = await createOrderRes.json();
  assert(orderData.success === true, "Order response reports success: true");
  assert(
    orderData.order.orderNumber.startsWith("ORD-VID-") || orderData.order.orderNumber.startsWith("IMD-VID-"),
    `Generated order number format verified (${orderData.order.orderNumber})`
  );
  assert(orderData.order.status === "pending_advance", "Order status initialized as 'pending_advance'");
  assert(orderData.order.paymentStatus === "unpaid", "Order paymentStatus initialized as 'unpaid' (not marked as paid)");
  assert(orderData.order.pricing.totalAmount === 1499, "Total amount verified as ₹1,499");
  assert(orderData.order.pricing.advanceAmount === 750, "50% advance amount verified as ₹750");
  assert(orderData.order.project.uploadedFiles.length === 1, "Uploaded file reference saved against order");

  // Agent 03 Payment Contract Verification
  const contract = orderData.paymentContract;
  assert(Boolean(contract && contract.orderId && contract.orderNumber), "Payment contract generated with orderId and orderNumber");
  assert(contract.amountDue === 750, "Payment contract specifies amountDue as exact 50% advance (₹750)");
  assert(contract.totalOrderAmount === 1499, "Payment contract preserves totalOrderAmount (₹1,499)");
  assert(contract.remainingBalance === 749, "Payment contract specifies remainingBalance (₹749)");
  assert(contract.currency === "INR", "Payment contract currency is 'INR'");
  assert(contract.customer.email === "vikram@malhotrabrands.com", "Payment contract customer email matches");

  // STAGE 7: Conversational AI Agent State Machine & Extraction
  console.log(`\n[STAGE 7] Conversational AI Agent State Machine & Natural Question Flow`);
  const chatMessagesStep1 = [
    { role: "user", content: "I would like to order video editing for my brand." },
  ];
  const step1State = extractVideoOrderState(chatMessagesStep1);
  const step1Question = getNextVideoOrderQuestion(step1State, chatMessagesStep1[0].content);
  assert(!step1Question.isComplete, "Step 1: Recognizes order intent and identifies missing fields");
  assert(step1Question.reply.includes("aspect ratio"), "Step 1: Naturally asks for video type and aspect ratio (one question)");

  // Simulate multi-turn conversation collecting all 10 customer items
  const fullConversation = [
    { role: "user", content: "I need a 9:16 vertical Product Reel in MP4 format." },
    { role: "assistant", content: step1Question.reply },
    { role: "user", content: "Duration should be 30 seconds with fast cuts and bold animated subtitles." },
    { role: "assistant", content: "When do you need this delivered by?" },
    { role: "user", content: "Delivery within 48 hours. Reference style is https://instagram.com/reel/example." },
    { role: "assistant", content: "Could you share your Full Name, 10-digit WhatsApp number, and Email address?" },
    { role: "user", content: "My name is Priya Nair, phone 9876543210, email priya@nair.com." },
  ];

  const fullState = extractVideoOrderState(fullConversation);
  assert(fullState.fullName === "Priya Nair", "Extracted Full Name: 'Priya Nair'");
  assert(fullState.mobileNumber === "9876543210", "Extracted Mobile: '9876543210'");
  assert(fullState.email === "priya@nair.com", "Extracted Email: 'priya@nair.com'");
  assert(fullState.aspectRatio === "9:16", "Extracted Aspect Ratio: '9:16'");
  assert(fullState.videoFormat === "mp4", "Extracted Video Format: 'mp4'");
  assert(Boolean(fullState.approxDuration?.includes("30")), "Extracted Duration: 30 seconds");
  assert(Boolean(fullState.deliveryDate?.toLowerCase().includes("48 hours")), "Extracted Delivery Date: 'within 48 hours'");
  assert(fullState.referenceVideoUrl === "https://instagram.com/reel/example", "Extracted Reference Video Link");

  const fullStep = getNextVideoOrderQuestion(fullState, "My name is Priya Nair, phone 9876543210, email priya@nair.com.");
  assert(fullStep.isComplete === true, "Conversation state machine reports order collection isComplete: true");
  assert(Boolean(fullStep.videoOrderSummary), "Produces verified videoOrderSummary data object");
  assert(fullStep.videoOrderSummary?.pricing.totalAmount === 999, "Order summary pricing total is ₹999");
  assert(fullStep.videoOrderSummary?.pricing.advanceAmount === 500, "Order summary 50% advance is ₹500");
  assert(fullStep.videoOrderSummary?.pricing.remainingAmount === 499, "Order summary remaining balance is ₹499");

  // STAGE 8: Integrated Chat Endpoint Execution (/api/chat)
  console.log(`\n[STAGE 8] Integrated Chat Endpoint (/api/chat)`);
  const chatReq = new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: fullConversation }),
  });
  const chatRes = await chatPost(chatReq);
  assert(chatRes.status === 200, "POST /api/chat returns HTTP 200");
  const chatData = await chatRes.json();
  assert(Boolean(chatData.reply), "Chat returns natural assistant reply");
  assert(Boolean(chatData.videoOrderSummary), "Chat returns attached videoOrderSummary card payload");
  assert(chatData.videoOrderSummary.customer.fullName === "Priya Nair", "Chat returns customer full name in summary");

  console.log(`\n======================================================================`);
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("Verification suite fatal error:", err);
  process.exit(1);
});
