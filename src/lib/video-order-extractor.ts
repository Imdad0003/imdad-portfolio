/**
 * Conversational Extractor & State Machine for Video Editing Orders
 * IMDAD.BUILDS — Agent 02 Specification & State Management Hardening
 *
 * Intelligently analyzes conversation history to extract the customer order attributes:
 * 1. Full name
 * 2. Mobile number
 * 3. Email address
 * 4. Video editing type / Package
 * 5. Video format
 * 6. Aspect ratio
 * 7. Approximate duration
 * 8. Editing requirements & instructions
 * 9. Product details (when applicable for product reels / ads)
 * 10. Required delivery date
 * 11. Reference video or style (optional)
 *
 * Implements one-at-a-time natural questioning, partial answer persistence,
 * multi-field extraction, and verified order summary generation.
 */

import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { calculateOrderPricing } from "@/lib/video-order-service";

export interface ExtractedVideoOrderState {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  serviceId?: string;
  serviceName?: string;
  packagePrice?: number;
  videoType?: string;
  videoFormat?: string;
  aspectRatio?: string;
  approxDuration?: string;
  requirements?: string;
  productDetails?: string;
  deliveryDate?: string;
  referenceVideoUrl?: string;
  lastQuestionField?: string;
}

export interface VideoOrderSummaryData {
  serviceId: string;
  serviceName: string;
  videoType: string;
  videoFormat: string;
  aspectRatio: string;
  approxDuration: string;
  requirements: string;
  deliveryDate: string;
  referenceVideoUrl?: string;
  customer: {
    fullName: string;
    mobileNumber: string;
    email: string;
  };
  pricing: {
    packagePrice: number;
    addonsPrice: number;
    deliveryFee: number;
    totalAmount: number;
    advancePercentage: number;
    advanceAmount: number;
    remainingAmount: number;
    currency: string;
  };
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_REGEX = /(?:(?:\+?91[\-\s]?)?[6789]\d{9}|\b\d{10}\b)/;

/**
 * Normalizes duration string variations into a clean representation.
 * Supports: "15", "15s", "15 sec", "15 seconds", "15 secs", "1 min", "60 seconds", etc.
 */
function normalizeDuration(raw: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();

  // If already like "15-30s" or "30s"
  if (/^\d{1,3}\s*[-–to]+\s*\d{1,3}\s*s?$/i.test(trimmed)) {
    return trimmed.endsWith("s") ? trimmed : `${trimmed}s`;
  }

  // "1 min" or "2 minutes"
  const minMatch = trimmed.match(/^(\d{1,2})\s*(?:min(?:utes?|s)?|m)$/i);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    return `${mins * 60}s`;
  }

  // "15 sec" / "15 seconds" / "15s" / "15"
  const secMatch = trimmed.match(/^(\d{1,3})\s*(?:sec(?:onds?|s)?|s)?$/i);
  if (secMatch) {
    const num = parseInt(secMatch[1], 10);
    if (num >= 5 && num <= 300) {
      return `${num}s`;
    }
  }

  return trimmed;
}

/**
 * Extracts order intent and parameters from conversation messages.
 * Preserves previously populated state and extracts multiple fields from single messages.
 */
export function extractVideoOrderState(
  messages: Array<{ role: string; content: string }>,
  existingState?: Partial<ExtractedVideoOrderState>
): ExtractedVideoOrderState {
  const state: ExtractedVideoOrderState = { ...(existingState || {}) };

  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);

  for (const msg of userMessages) {
    const cleanMsg = msg.trim();
    if (!cleanMsg) continue;

    // 1. Email Extraction
    const emailMatch = cleanMsg.match(EMAIL_REGEX);
    if (emailMatch) {
      state.email = emailMatch[0].trim().toLowerCase();
    }

    // 2. Phone Extraction
    const phoneMatch = cleanMsg.match(PHONE_REGEX);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g, "");
      state.mobileNumber = digits.length > 10 ? digits.slice(-10) : digits;
    }

    // 3. Name Extraction
    const nameExplicit =
      cleanMsg.match(/(?:my name is|i am|name is|i'm|name:)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i) ||
      cleanMsg.match(/^([A-Za-z]+(?:\s+[A-Za-z]+))\s*,\s*(?:\d{10}|[a-zA-Z0-9._%+-]+@)/i);
    if (nameExplicit && nameExplicit[1]) {
      const candidate = nameExplicit[1].trim();
      if (!candidate.toLowerCase().includes("video") && candidate.length > 2) {
        state.fullName = candidate;
      }
    } else if (!state.fullName && state.mobileNumber && state.email) {
      const parts = cleanMsg.split(/[,|\n]/).map((p) => p.trim());
      for (const part of parts) {
        if (
          /^[A-Za-z]{2,}(?:\s+[A-Za-z]{2,})+$/.test(part) &&
          !/video|order|reel|youtube|friday|delivery|seconds|urgent/i.test(part)
        ) {
          state.fullName = part;
          break;
        }
      }
    }

    // 4. Aspect Ratio Extraction
    if (/9\s*:\s*16|vertical|reels?|shorts?|story|stories|tiktok/i.test(cleanMsg)) {
      state.aspectRatio = "9:16";
    } else if (/16\s*:\s*9|horizontal|landscape|widescreen/i.test(cleanMsg)) {
      state.aspectRatio = "16:9";
    } else if (/1\s*:\s*1|square|feed/i.test(cleanMsg)) {
      state.aspectRatio = "1:1";
    } else if (/4\s*:\s*5|portrait/i.test(cleanMsg)) {
      state.aspectRatio = "4:5";
    }

    // 5. Video Format Extraction
    if (/\b(?:mov|prores|quicktime)\b/i.test(cleanMsg)) {
      state.videoFormat = "mov";
    } else if (/\bwebm\b/i.test(cleanMsg)) {
      state.videoFormat = "webm";
    } else if (/\bmkv\b/i.test(cleanMsg)) {
      state.videoFormat = "mkv";
    } else if (/\bmp4|h\.?264\b/i.test(cleanMsg)) {
      state.videoFormat = "mp4";
    }

    // 6. Video Type / Package Extraction
    // Check for explicit service/package ID
    const explicitIdMatch = cleanMsg.match(/(?:service\s*id|package\s*id):\s*([a-z0-9-]+)/i);
    if (explicitIdMatch && explicitIdMatch[1]) {
      const rawId = explicitIdMatch[1].trim().toLowerCase();
      const normalizedId =
        rawId === "pkg-reel-starter" ? "product-reel"
        : rawId === "pkg-youtube-creator" ? "youtube-longform"
        : rawId === "pkg-cinematic-ad" ? "premium-ad-creative"
        : rawId === "pkg-monthly-retainer" ? "monthly-retainer"
        : rawId;

      const matchedService = defaultVideoOrderConfig.serviceOptions.find((s) => s.id === normalizedId);
      if (matchedService) {
        state.serviceId = matchedService.id;
        state.serviceName = matchedService.name;
        state.packagePrice = matchedService.startingPrice;
        state.videoType = matchedService.name;
      }
    } else if (!state.serviceId) {
      if (/\bproduct\s*reel\b/i.test(cleanMsg)) {
        state.serviceId = "product-reel";
        state.serviceName = "Product Reel";
        state.packagePrice = 999;
        state.videoType = "Product Reel";
      } else if (/\bbasic\s*product\b/i.test(cleanMsg)) {
        state.serviceId = "basic-product-video";
        state.serviceName = "Basic Product Video";
        state.packagePrice = 799;
        state.videoType = "Basic Product Video";
      } else if (/\bugc\s*ad|\bugc-style|\bcreator\s*ad\b/i.test(cleanMsg)) {
        state.serviceId = "ugc-style-ad";
        state.serviceName = "UGC-Style Ad";
        state.packagePrice = 1499;
        state.videoType = "UGC-Style Ad";
      } else if (/\bai\s*ugc|\bai\s*avatar\b/i.test(cleanMsg)) {
        state.serviceId = "ai-ugc-ad";
        state.serviceName = "AI UGC Ad";
        state.packagePrice = 1499;
        state.videoType = "AI UGC Ad";
      } else if (/\bpremium\s*ad|commercial|\bmotion\s*design\b/i.test(cleanMsg)) {
        state.serviceId = "premium-ad-creative";
        state.serviceName = "Premium Ad Creative";
        state.packagePrice = 2499;
        state.videoType = "Premium Ad Creative";
      } else if (/\byoutube\s*longform|\blong\s*form\b/i.test(cleanMsg)) {
        state.serviceId = "youtube-longform";
        state.serviceName = "YouTube / Long-Form Edit";
        state.packagePrice = 1999;
        state.videoType = "YouTube / Long-Form Edit";
      } else if (/\bretainer|\bmonthly\b/i.test(cleanMsg)) {
        state.serviceId = "monthly-retainer";
        state.serviceName = "Creator Studio Retainer";
        state.packagePrice = 4999;
        state.videoType = "Creator Studio Retainer";
      } else if (/\breel|\bshort\b/i.test(cleanMsg)) {
        state.serviceId = "product-reel";
        state.serviceName = "Product Reel";
        state.packagePrice = 999;
        state.videoType = "Product Reel";
      }
    }

    // 7. Duration Extraction (Natural language variations: "15", "15s", "15 sec", "15 seconds", "15s key product", etc.)
    // Explicit range or value with units: e.g. "15-30s", "15s", "15 sec", "15 seconds", "1 min"
    const unitDurationMatch =
      cleanMsg.match(/\b(\d{1,3})\s*(?:to|-)\s*(\d{1,3})\s*(?:sec(?:onds?|s)?|s)\b/i) ||
      cleanMsg.match(/\b(\d{1,3})\s*(?:sec(?:onds?|s)?|s)\b/i) ||
      cleanMsg.match(/\b(\d{1,2})\s*(?:min(?:utes?|s)?|m)\b/i) ||
      cleanMsg.match(/(?:duration|length|approx|approximate|time):\s*([^\n,]+)/i);

    if (unitDurationMatch) {
      const normalized = normalizeDuration(unitDurationMatch[0]);
      if (normalized) {
        state.approxDuration = normalized;
      }
    } else {
      // Standalone number or number at start/end of message: e.g. "15", "15 key product", "make it 30"
      const numberMatch =
        cleanMsg.match(/^\s*(\d{1,3})\s*$/) ||
        cleanMsg.match(/(?:^|\b)(?:around|about|make it|approx|just|duration)?\s*(\d{1,3})\b(?!\s*[:\/\-])/i);

      if (numberMatch && numberMatch[1]) {
        const num = parseInt(numberMatch[1], 10);
        // Valid video duration (between 5 and 300 seconds)
        // Ensure it's not a phone number or year (e.g. 2026, 9876543210)
        if (num >= 5 && num <= 300 && cleanMsg.length <= 40) {
          state.approxDuration = `${num}s`;
        }
      }
    }

    // 8. Requirements / Instructions Extraction
    const lowerMsg = cleanMsg.toLowerCase();
    if (/key\s*product|product\s*features?|highlight\s*(?:key\s*)?product/i.test(lowerMsg)) {
      state.requirements = "Highlight key product features";
    } else if (
      lowerMsg.includes("hook") ||
      lowerMsg.includes("caption") ||
      lowerMsg.includes("subtitle") ||
      lowerMsg.includes("music") ||
      lowerMsg.includes("audio") ||
      lowerMsg.includes("cut") ||
      lowerMsg.includes("pacing") ||
      lowerMsg.includes("transition") ||
      lowerMsg.includes("b-roll") ||
      lowerMsg.includes("cinematic") ||
      lowerMsg.includes("text") ||
      lowerMsg.includes("color") ||
      lowerMsg.includes("instructions")
    ) {
      // Strip duration token if message combines duration and instruction (e.g. "15s fast cuts and subtitles")
      const cleaned = cleanMsg.replace(/\b\d{1,3}\s*(?:sec(?:onds?|s)?|s)\b/gi, "").trim();
      state.requirements = cleaned.length >= 3 ? cleaned : cleanMsg;
    }

    // 9. Product Details Extraction
    // If requirement is to highlight product features, extract the product name & specifics
    const productExplicit =
      cleanMsg.match(/(?:product\s*name\s*is|product\s*is|product\s*name:|product:|creating\s*(?:this\s*)?reel\s*for|reel\s*for|video\s*for|it'?s\s*for\s*(?:the\s*)?product|for)\s+([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)*?)(?=\s+(?:by|within|in|with|urgent|\d{10}|[.,\n])|$)/i) ||
      cleanMsg.match(/(?:name and key features|product details):\s*([^\n]+)/i);

    if (productExplicit && productExplicit[1]) {
      const prodCandidate = productExplicit[1].trim();
      if (
        prodCandidate.length >= 2 &&
        !/inspiration|example|reference|my brand|youtube|instagram|http|friday|tomorrow|hours|days|rush|urgent/i.test(prodCandidate)
      ) {
        state.productDetails = prodCandidate;
      }
    } else if (
      state.requirements &&
      /key\s*product|product\s*features?/i.test(state.requirements) &&
      !state.productDetails
    ) {
      // If customer provides product info in response to "Which product are we creating this reel for?"
      if (
        !/^\d{1,3}\s*(?:s|sec)?$/i.test(cleanMsg) &&
        !EMAIL_REGEX.test(cleanMsg) &&
        !PHONE_REGEX.test(cleanMsg) &&
        !/(?:within|by|hours|days|rush|tomorrow|next week)/i.test(cleanMsg) &&
        cleanMsg.length >= 3 &&
        !/^(?:15|30|60)s?\s*key\s*product$/i.test(cleanMsg) &&
        !/^key\s*product$/i.test(cleanMsg) &&
        !/inspiration|reference|youtube|instagram|http/i.test(cleanMsg)
      ) {
        state.productDetails = cleanMsg;
      }
    }

    if (state.productDetails) {
      state.requirements = `Highlight key product features for ${state.productDetails}`;
    }

    // 10. Delivery Date / Timeline Extraction
    const deliveryMatch =
      cleanMsg.match(/(?:within\s*\d+\s*(?:hours|days)|by\s+[a-zA-Z]+|urgent|rush|tomorrow|next\s+week|\d+\s*(?:hours|days))/i) ||
      cleanMsg.match(/(?:delivery|timeline|deadline):\s*([^\n,]+)/i);
    if (deliveryMatch) {
      state.deliveryDate = deliveryMatch[0].trim();
    }

    // 11. Reference Video URL Extraction (NEVER allow YouTube URLs to override serviceId!)
    const urlMatch = cleanMsg.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      state.referenceVideoUrl = urlMatch[0].trim().replace(/[.,;:]+$/, "");
    }
  }

  // Ensure default fallback values for coherent state
  if (state.serviceId) {
    const pkg = defaultVideoOrderConfig.serviceOptions.find((s) => s.id === state.serviceId);
    if (pkg) {
      state.serviceName = state.serviceName || pkg.name;
      state.packagePrice = state.packagePrice || pkg.startingPrice;
      state.videoType = state.videoType || pkg.name;
    }
  }

  return state;
}

/**
 * Determines what information is still missing and formats the next single question.
 * Strictly avoids asking for already-populated fields and preserves order state.
 */
export function getNextVideoOrderQuestion(
  state: ExtractedVideoOrderState,
  lastUserMessage: string
): {
  reply: string;
  isComplete: boolean;
  videoOrderSummary?: VideoOrderSummaryData;
  missingField?: string;
} {
  // Authoritative defaults
  const serviceId = state.serviceId || "product-reel";
  const serviceName = state.serviceName || "Product Reel";
  const videoFormat = state.videoFormat || "mp4";
  const aspectRatio = state.aspectRatio || (serviceId === "youtube-longform" ? "16:9" : "9:16");

  // Step 1: Missing Service / Package and Aspect Ratio
  if (!state.serviceId && !state.aspectRatio) {
    return {
      reply: `I'd love to help craft your video! 🎬\n\nTo get started, what type of video are you creating (e.g. Product Reel at ₹999, Basic Product Showcase at ₹799, or UGC-Style Ad at ₹1,499), and what aspect ratio do you need (9:16 vertical for Reels/Shorts, 16:9 landscape, or 1:1 square)?`,
      isComplete: false,
      missingField: "serviceId",
    };
  }

  if (!state.serviceId) {
    return {
      reply: `I'd love to help craft your video! 🎬\n\nTo get started, what type of video are you creating (e.g. Product Reel at ₹999, Basic Product Showcase at ₹799, or UGC-Style Ad at ₹1,499)?`,
      isComplete: false,
      missingField: "serviceId",
    };
  }

  // Step 2: Missing Aspect Ratio
  if (!state.aspectRatio) {
    return {
      reply: `Awesome choice — ${serviceName}! What aspect ratio do you need (e.g. 9:16 vertical for Reels/Shorts, 16:9 landscape for YouTube, or 1:1 square)?`,
      isComplete: false,
      missingField: "aspectRatio",
    };
  }

  // Step 3: Missing Duration AND Missing Requirements
  if (!state.approxDuration && !state.requirements) {
    return {
      reply: `Awesome choice — ${serviceName} in ${aspectRatio} format!\n\nWhat is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions (such as hook style, dynamic subtitles, audio vibe, or key product features)?`,
      isComplete: false,
      missingField: "durationAndRequirements",
    };
  }

  // Step 4: Has Requirements, Missing Duration
  if (!state.approxDuration) {
    return {
      reply: `Noted your editing instructions! What is the approximate video duration you'd like (e.g., 15s, 30s, 60s)?`,
      isComplete: false,
      missingField: "approxDuration",
    };
  }

  // Step 5: Has Duration, Missing Requirements
  if (!state.requirements) {
    return {
      reply: `Got it — ${state.approxDuration}! What are your key editing instructions (such as hook style, dynamic subtitles, audio vibe, or key product features)?`,
      isComplete: false,
      missingField: "requirements",
    };
  }

  // Step 6: Requirements is "Highlight key product features" BUT missing specific product details
  const isKeyProductRequirement =
    state.requirements &&
    /key\s*product|product\s*features?|highlight\s*(?:key\s*)?product/i.test(state.requirements);

  if (isKeyProductRequirement && !state.productDetails) {
    return {
      reply: `Great! Which product are we creating this reel for? Please share its name and key features.`,
      isComplete: false,
      missingField: "productDetails",
    };
  }

  // Step 7: Missing Delivery Timeline
  if (!state.deliveryDate) {
    const detailsNote = state.productDetails ? ` for ${state.productDetails}` : "";
    return {
      reply: `Got it! Noted your duration (${state.approxDuration}) and instructions${detailsNote}.\n\nWhen is your required delivery date or target turnaround (e.g. within 48 hours, by Friday, or same-day rush)? Also, if you have a reference video link or style benchmark, feel free to include it!`,
      isComplete: false,
      missingField: "deliveryDate",
    };
  }

  // Step 8: Missing Contact Details (Name, Phone, Email)
  const hasName = Boolean(state.fullName && state.fullName.trim().length >= 2);
  const hasPhone = Boolean(state.mobileNumber && state.mobileNumber.replace(/\D/g, "").length >= 10);
  const hasEmail = Boolean(state.email && EMAIL_REGEX.test(state.email));

  if (!hasName || !hasPhone || !hasEmail) {
    const missing: string[] = [];
    if (!hasName) missing.push("Full Name");
    if (!hasPhone) missing.push("10-digit WhatsApp number");
    if (!hasEmail) missing.push("Email address");

    const prefix = hasName ? `Thanks, ${state.fullName}!` : "Almost done!";
    const formattedMissing =
      missing.length === 3
        ? "Full Name, 10-digit WhatsApp number, and Email address"
        : missing.length === 2
        ? `${missing[0]} and ${missing[1]}`
        : missing[0];

    return {
      reply: `${prefix} Could you please share your ${formattedMissing} so we can generate your order summary?`,
      isComplete: false,
      missingField: "contactInfo",
    };
  }

  // Step 9: ALL 10 ATTRIBUTES ARE COLLECTED! Build verified summary.
  const pricing = calculateOrderPricing(serviceId);

  const summaryData: VideoOrderSummaryData = {
    serviceId,
    serviceName,
    videoType: serviceName,
    videoFormat,
    aspectRatio,
    approxDuration: state.approxDuration,
    requirements: state.requirements,
    deliveryDate: state.deliveryDate,
    referenceVideoUrl: state.referenceVideoUrl || undefined,
    customer: {
      fullName: state.fullName || "",
      mobileNumber: state.mobileNumber || "",
      email: state.email || "",
    },
    pricing: {
      packagePrice: pricing.packagePrice,
      addonsPrice: pricing.addonsPrice,
      deliveryFee: pricing.deliveryFee,
      totalAmount: pricing.totalAmount,
      advancePercentage: 50,
      advanceAmount: pricing.advanceAmount,
      remainingAmount: pricing.remainingAmount,
      currency: "INR",
    },
  };

  const reply = `Thank you, ${state.fullName}! 🎬\n\nI have compiled your complete Video Editing Order Summary:\n\n• Service: ${serviceName} (${aspectRatio} • ${videoFormat.toUpperCase()})\n• Duration: ${state.approxDuration}\n• Delivery Target: ${state.deliveryDate}\n• Client Contact: ${state.mobileNumber} • ${state.email}\n\n💰 Total Investment: ₹${pricing.totalAmount.toLocaleString("en-IN")}\n💳 50% Advance Due: ₹${pricing.advanceAmount.toLocaleString("en-IN")}\n⏳ Remaining on Completion: ₹${pricing.remainingAmount.toLocaleString("en-IN")}\n\nPlease review your order summary card below. You can also upload any raw footage, voiceovers, audio tracks, or brand assets (completely optional). When ready, proceed to the 50% advance to confirm your order!`;

  return {
    reply,
    isComplete: true,
    videoOrderSummary: summaryData,
  };
}
