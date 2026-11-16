/**
 * Comprehensive Automated Regression & State Management Test Suite
 * IMDAD.BUILDS AI Order Assistant — Conversation State Verification
 *
 * Verifies all 7 regression criteria:
 * 1. Customer answers “15” → duration saved.
 * 2. Customer answers “15s key product” → duration and editing direction saved.
 * 3. Customer provides multiple details in one message → all recognized fields saved.
 * 4. Customer gives a partial answer → only missing information requested.
 * 5. Customer sends another message → previously saved fields remain intact.
 * 6. Customer changes duration → duration updates without resetting other fields.
 * 7. The same question is never repeated when its required fields are already populated.
 *
 * Plus end-to-end bug reproduction verification:
 * - Assistant never repeats the combined duration + instructions question after "15"
 * - Assistant responds to "15s key product" with product query
 * - Preserves package (Product Reel, ₹999, 9:16) even when reference URLs are provided
 */

import { NextRequest } from "next/server";
import {
  extractVideoOrderState,
  getNextVideoOrderQuestion,
  ExtractedVideoOrderState,
} from "../src/lib/video-order-extractor";
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
  console.log(`\n${colors.bold}${colors.cyan}========================================================================`);
  console.log(`  IMDAD.BUILDS — CHATBOT CONVERSATION STATE REGRESSION AUDIT           `);
  console.log(`========================================================================${colors.reset}\n`);

  // --- REGRESSION TEST 1: Customer answers "15" -> duration saved ---
  console.log(`[TEST 1] Natural Language Duration Variations ("15", "15s", "15 sec", "15 seconds")`);
  const initialOrderState: ExtractedVideoOrderState = {
    serviceId: "product-reel",
    serviceName: "Product Reel",
    packagePrice: 999,
    aspectRatio: "9:16",
  };

  const messagesT1 = [
    { role: "user", content: "I want to order a Product Reel" },
    {
      role: "assistant",
      content:
        "Awesome choice — Product Reel in 9:16 format!\n\nWhat is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions (such as hook style, dynamic subtitles, audio vibe, or key product features)?",
    },
    { role: "user", content: "15" },
  ];

  const stateT1 = extractVideoOrderState(messagesT1, initialOrderState);
  assert(Boolean(stateT1.approxDuration), "Duration extracted from standalone '15'");
  assert(stateT1.approxDuration === "15s", `Duration normalized to '15s' (got '${stateT1.approxDuration}')`);
  assert(stateT1.serviceId === "product-reel", "Package ID preserved as 'product-reel'");
  assert(stateT1.packagePrice === 999, "Package price preserved as ₹999");
  assert(stateT1.aspectRatio === "9:16", "Aspect ratio preserved as '9:16'");

  const questionT1 = getNextVideoOrderQuestion(stateT1, "15");
  assert(!questionT1.reply.includes("What is the approximate video duration"), "Assistant does NOT ask for duration again");
  assert(questionT1.reply.includes("Got it — 15s!"), "Assistant acknowledges 15s duration");
  assert(questionT1.missingField === "requirements", "Missing field identified strictly as 'requirements'");

  // Also verify "15 sec" and "15 seconds"
  const stateSec = extractVideoOrderState([{ role: "user", content: "15 sec" }]);
  assert(stateSec.approxDuration === "15s", "Duration '15 sec' normalized to '15s'");
  const stateSeconds = extractVideoOrderState([{ role: "user", content: "15 seconds" }]);
  assert(stateSeconds.approxDuration === "15s", "Duration '15 seconds' normalized to '15s'");

  // --- REGRESSION TEST 2: Customer answers "15s key product" -> duration and editing direction saved ---
  console.log(`\n[TEST 2] Multi-intent extraction: Customer answers "15s key product"`);
  const messagesT2 = [
    { role: "user", content: "I would like to order the Product Reel package." },
    {
      role: "assistant",
      content:
        "What is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions?",
    },
    { role: "user", content: "15s key product" },
  ];

  const stateT2 = extractVideoOrderState(messagesT2, initialOrderState);
  assert(stateT2.approxDuration === "15s", "Duration '15s' extracted from compound message");
  assert(
    stateT2.requirements === "Highlight key product features",
    `Editing direction recognized as 'Highlight key product features' (got '${stateT2.requirements}')`
  );
  assert(stateT2.serviceId === "product-reel", "Service ID remains 'product-reel'");
  assert(stateT2.aspectRatio === "9:16", "Aspect ratio remains '9:16'");

  const questionT2 = getNextVideoOrderQuestion(stateT2, "15s key product");
  assert(
    !questionT2.reply.includes("approximate video duration"),
    "Assistant does NOT ask for duration again after '15s key product'"
  );
  assert(
    !questionT2.reply.includes("key editing instructions"),
    "Assistant does NOT ask for generic editing instructions again"
  );
  assert(
    questionT2.reply.includes("Which product are we creating this reel for?"),
    "Assistant asks the exact next genuinely missing question: 'Which product are we creating this reel for?'"
  );
  assert(questionT2.missingField === "productDetails", "Identifies missing field strictly as 'productDetails'");

  // --- REGRESSION TEST 3: Multiple details in one message ---
  console.log(`\n[TEST 3] Customer provides multiple details in one message`);
  const singleMessageAllDetails = [
    {
      role: "user",
      content:
        "I need a 15s Product Reel in 9:16 vertical MP4 for GlowSerum face oil by Friday. My name is Priya Nair, phone 9876543210, email priya@nair.com. Hook: highlight key product features.",
    },
  ];

  const stateT3 = extractVideoOrderState(singleMessageAllDetails);
  assert(stateT3.serviceId === "product-reel", "Recognized service: Product Reel");
  assert(stateT3.aspectRatio === "9:16", "Recognized aspect ratio: 9:16");
  assert(stateT3.videoFormat === "mp4", "Recognized format: mp4");
  assert(stateT3.approxDuration === "15s", "Recognized duration: 15s");
  assert(Boolean(stateT3.requirements?.includes("key product features")), "Recognized requirements");
  assert(stateT3.deliveryDate === "by Friday", "Recognized delivery date: 'by Friday'");
  assert(stateT3.fullName === "Priya Nair", "Recognized full name: 'Priya Nair'");
  assert(stateT3.mobileNumber === "9876543210", "Recognized mobile: '9876543210'");
  assert(stateT3.email === "priya@nair.com", "Recognized email: 'priya@nair.com'");

  const stepT3 = getNextVideoOrderQuestion(stateT3, singleMessageAllDetails[0].content);
  assert(stepT3.isComplete === true, "State machine completes order from single multi-field message");
  assert(Boolean(stepT3.videoOrderSummary), "Generates complete videoOrderSummary object");

  // --- REGRESSION TEST 4: Partial answer -> only missing information requested ---
  console.log(`\n[TEST 4] Partial answer -> only missing information requested`);
  const partialState: ExtractedVideoOrderState = {
    serviceId: "product-reel",
    serviceName: "Product Reel",
    packagePrice: 999,
    aspectRatio: "9:16",
    videoFormat: "mp4",
    approxDuration: "15s",
    requirements: "Highlight key product features for GlowSerum",
    productDetails: "GlowSerum",
    // Missing: deliveryDate, contactInfo
  };

  const partialQ = getNextVideoOrderQuestion(partialState, "GlowSerum");
  assert(
    !partialQ.reply.includes("What is the approximate video duration"),
    "Does not ask for duration (already populated)"
  );
  assert(
    !partialQ.reply.includes("aspect ratio"),
    "Does not ask for aspect ratio (already populated)"
  );
  assert(partialQ.reply.includes("delivery date or target turnaround"), "Asks for next missing field: delivery date");
  assert(partialQ.missingField === "deliveryDate", "Flags 'deliveryDate' as missing");

  // Populate deliveryDate, now missing only contact info
  partialState.deliveryDate = "within 48 hours";
  const contactQ = getNextVideoOrderQuestion(partialState, "within 48 hours");
  assert(contactQ.missingField === "contactInfo", "Flags 'contactInfo' as missing");
  assert(contactQ.reply.includes("Full Name, 10-digit WhatsApp number, and Email address"), "Asks for contact details");

  // --- REGRESSION TEST 5: Subsequent messages preserve previously saved fields ---
  console.log(`\n[TEST 5] Subsequent messages preserve previously saved fields`);
  const multiStepConversation = [
    { role: "user", content: "I would like to order the Product Reel package." },
    { role: "assistant", content: "What duration and editing instructions?" },
    { role: "user", content: "15s key product" },
    { role: "assistant", content: "Great! Which product are we creating this reel for? Please share its name and key features." },
    { role: "user", content: "Aura Glow serum with vitamin C" },
    { role: "assistant", content: "When do you need this delivered by?" },
    { role: "user", content: "by Friday" },
  ];

  const accumulatedState = extractVideoOrderState(multiStepConversation, initialOrderState);
  assert(accumulatedState.serviceId === "product-reel", "Step 5: serviceId preserved across all turns");
  assert(accumulatedState.approxDuration === "15s", "Step 5: duration preserved across all turns");
  assert(accumulatedState.aspectRatio === "9:16", "Step 5: aspectRatio preserved across all turns");
  assert(Boolean(accumulatedState.productDetails?.includes("Aura Glow")), "Step 5: productDetails preserved");
  assert(accumulatedState.deliveryDate === "by Friday", "Step 5: deliveryDate saved");

  // Reference URL should not overwrite package
  multiStepConversation.push({
    role: "user",
    content: "Here is a reference link for inspiration: https://youtube.com/watch?v=sample123",
  });
  const stateWithRef = extractVideoOrderState(multiStepConversation, accumulatedState);
  assert(stateWithRef.serviceId === "product-reel", "YouTube reference link does NOT alter package to youtube-longform");
  assert(stateWithRef.packagePrice === 999, "Package price remains ₹999");
  assert(stateWithRef.referenceVideoUrl === "https://youtube.com/watch?v=sample123", "Reference URL saved correctly");

  // --- REGRESSION TEST 6: Customer changes duration without resetting other fields ---
  console.log(`\n[TEST 6] Customer updates duration -> updates without resetting other fields`);
  multiStepConversation.push({
    role: "user",
    content: "Actually, please make the duration 30s instead.",
  });
  const updatedState = extractVideoOrderState(multiStepConversation, stateWithRef);
  assert(updatedState.approxDuration === "30s", "Duration successfully updated from '15s' to '30s'");
  assert(updatedState.serviceId === "product-reel", "Service ID still 'product-reel' after duration update");
  assert(updatedState.packagePrice === 999, "Package price still ₹999");
  assert(updatedState.aspectRatio === "9:16", "Aspect ratio still '9:16'");
  assert(updatedState.deliveryDate === "by Friday", "Delivery date still 'by Friday'");
  assert(Boolean(updatedState.productDetails?.includes("Aura Glow")), "Product details intact");

  // --- REGRESSION TEST 7: Question is never repeated when required fields are populated ---
  console.log(`\n[TEST 7] Prevention of repeated questions when fields are populated`);
  const testConversation = [
    { role: "user", content: "Product Reel" },
    {
      role: "assistant",
      content:
        "Awesome choice — Product Reel in 9:16 format!\n\nWhat is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions?",
    },
    { role: "user", content: "15" },
  ];

  const t7State = extractVideoOrderState(testConversation, initialOrderState);
  const t7Reply1 = getNextVideoOrderQuestion(t7State, "15").reply;
  assert(
    !t7Reply1.includes("What is the approximate video duration"),
    "Turn 1: After '15', assistant DOES NOT repeat duration question"
  );

  testConversation.push({ role: "assistant", content: t7Reply1 });
  testConversation.push({ role: "user", content: "15s key product" });

  const t7State2 = extractVideoOrderState(testConversation, t7State);
  const t7Reply2 = getNextVideoOrderQuestion(t7State2, "15s key product").reply;
  assert(
    !t7Reply2.includes("What is the approximate video duration"),
    "Turn 2: After '15s key product', assistant DOES NOT repeat duration question"
  );
  assert(
    t7Reply2.includes("Which product are we creating this reel for?"),
    "Turn 2: Assistant asks for the product details explicitly"
  );
  assert(t7Reply2 !== t7Reply1, "Assistant reply changed progressively between turns (no loops)");

  // --- REGRESSION TEST 8: End-to-End Chat API Endpoint (/api/chat) ---
  console.log(`\n[TEST 8] End-to-End POST /api/chat execution`);
  const chatApiReq = new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "I want to order a Product Reel" },
        {
          role: "assistant",
          content:
            "What is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions?",
        },
        { role: "user", content: "15" },
      ],
      orderState: {
        serviceId: "product-reel",
        serviceName: "Product Reel",
        packagePrice: 999,
        aspectRatio: "9:16",
      },
    }),
  });

  const chatApiRes = await chatPost(chatApiReq);
  assert(chatApiRes.status === 200, "POST /api/chat returns HTTP 200");
  const chatApiData = await chatApiRes.json();
  assert(chatApiData.videoOrderState?.approxDuration === "15s", "Chat API returned updated videoOrderState with '15s'");
  assert(
    !chatApiData.reply.includes("What is the approximate video duration"),
    "Chat API reply acknowledges duration and does NOT repeat question"
  );

  console.log(`\n========================================================================`);
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
