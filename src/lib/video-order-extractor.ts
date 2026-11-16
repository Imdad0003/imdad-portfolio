/**
 * Conversational Extractor & State Machine for Video Editing Orders
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Intelligently analyzes conversation history to extract the 10 customer order attributes:
 * 1. Full name
 * 2. Mobile number
 * 3. Email address
 * 4. Video editing type
 * 5. Video format
 * 6. Aspect ratio
 * 7. Approximate duration
 * 8. Editing requirements & instructions
 * 9. Required delivery date
 * 10. Reference video or style (optional)
 *
 * Implements one-at-a-time natural questioning and produces verified order summary data.
 */

import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { calculateOrderPricing } from "@/lib/video-order-service";

export interface ExtractedVideoOrderState {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  serviceId?: string;
  serviceName?: string;
  videoType?: string;
  videoFormat?: string;
  aspectRatio?: string;
  approxDuration?: string;
  requirements?: string;
  deliveryDate?: string;
  referenceVideoUrl?: string;
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

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:(?:\+?91[\-\s]?)?[6789]\d{9}|\b\d{10}\b)/;

/**
 * Extracts order intent and parameters from conversation messages.
 */
export function extractVideoOrderState(
  messages: Array<{ role: string; content: string }>
): ExtractedVideoOrderState {
  const fullText = messages.map((m) => m.content).join("\n");
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const userText = userMessages.join("\n");
  const state: ExtractedVideoOrderState = {};

  // 1. Email Extraction
  const emailMatch = fullText.match(EMAIL_REGEX);
  if (emailMatch) {
    state.email = emailMatch[0].trim().toLowerCase();
  }

  // 2. Phone Extraction
  const phoneMatch = fullText.match(PHONE_REGEX);
  if (phoneMatch) {
    const digits = phoneMatch[0].replace(/\D/g, "");
    state.mobileNumber = digits.length > 10 ? digits.slice(-10) : digits;
  }

  // 3. Name Extraction
  for (const msg of userMessages) {
    const nameExplicit =
      msg.match(/(?:my name is|i am|name is|i'm|name:)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i) ||
      msg.match(/^([A-Za-z]+(?:\s+[A-Za-z]+))\s*,\s*(?:\d{10}|[a-zA-Z0-9._%+-]+@)/i);
    if (nameExplicit && nameExplicit[1]) {
      const candidate = nameExplicit[1].trim();
      if (!candidate.toLowerCase().includes("video") && candidate.length > 2) {
        state.fullName = candidate;
        break;
      }
    }
  }

  // 4. Aspect Ratio Extraction (Check user messages first)
  if (/9\s*:\s*16|vertical|reels?|shorts?|story|stories/i.test(userText)) {
    state.aspectRatio = "9:16";
  } else if (/16\s*:\s*9|horizontal|landscape|youtube|widescreen/i.test(userText)) {
    state.aspectRatio = "16:9";
  } else if (/1\s*:\s*1|square|feed/i.test(userText)) {
    state.aspectRatio = "1:1";
  } else if (/4\s*:\s*5|portrait/i.test(userText)) {
    state.aspectRatio = "4:5";
  }

  // 5. Video Format Extraction (Check user messages)
  if (/\b(?:mov|prores|quicktime)\b/i.test(userText)) {
    state.videoFormat = "mov";
  } else if (/\bwebm\b/i.test(userText)) {
    state.videoFormat = "webm";
  } else if (/\bmkv\b/i.test(userText)) {
    state.videoFormat = "mkv";
  } else if (/\bmp4|h\.?264\b/i.test(userText)) {
    state.videoFormat = "mp4";
  }

  // 6. Video Type / Package Extraction (Based on user selections)
  const explicitIdMatch = userText.match(/(?:service\s*id|package\s*id):\s*([a-z0-9-]+)/i);
  if (explicitIdMatch && explicitIdMatch[1]) {
    const rawId = explicitIdMatch[1].trim().toLowerCase();
    const normalizedId = rawId === "pkg-reel-starter" ? "product-reel"
      : rawId === "pkg-youtube-creator" ? "youtube-longform"
      : rawId === "pkg-cinematic-ad" ? "premium-ad-creative"
      : rawId === "pkg-monthly-retainer" ? "monthly-retainer"
      : rawId;

    const matchedService = defaultVideoOrderConfig.serviceOptions.find((s) => s.id === normalizedId);
    if (matchedService) {
      state.serviceId = matchedService.id;
      state.serviceName = matchedService.name;
      state.videoType = matchedService.name;
    }
  }

  if (!state.serviceId) {
    if (/retainer|monthly/i.test(userText)) {
      state.serviceId = "monthly-retainer";
      state.serviceName = "Creator Studio Retainer";
      state.videoType = "Creator Studio Retainer";
    } else if (/ugc\s*ad|ugc-style|creator\s*style|creator\s*ad/i.test(userText)) {
      state.serviceId = "ugc-style-ad";
      state.serviceName = "UGC-Style Ad";
      state.videoType = "UGC-Style Ad";
    } else if (/ai\s*ugc|ai\s*avatar|avatar\s*ad/i.test(userText)) {
      state.serviceId = "ai-ugc-ad";
      state.serviceName = "AI UGC Ad";
      state.videoType = "AI UGC Ad";
    } else if (/commercial|premium|motion\s*design|kinetic/i.test(userText)) {
      state.serviceId = "premium-ad-creative";
      state.serviceName = "Premium Ad Creative";
      state.videoType = "Premium Ad Creative";
    } else if (/basic\s*product|product\s*showcase|clean\s*cut/i.test(userText)) {
      state.serviceId = "basic-product-video";
      state.serviceName = "Basic Product Video";
      state.videoType = "Basic Product Video";
    } else if (/youtube|long\s*form|vlog|episode/i.test(userText)) {
      state.serviceId = "youtube-longform";
      state.serviceName = "YouTube / Long-Form Edit";
      state.videoType = "YouTube / Long-Form Edit";
    } else if (/reel|short|instagram|tiktok/i.test(userText)) {
      state.serviceId = "product-reel";
      state.serviceName = "Product Reel";
      state.videoType = "Product Reel";
    }
  }

  // 7. Duration Extraction
  const durationMatch =
    userText.match(/(\d{1,3})\s*(?:sec(?:onds?)?|s)\b/i) ||
    userText.match(/(\d{1,2})\s*(?:min(?:utes?)?|m)\b/i) ||
    userText.match(/(?:duration|length):\s*([^\n,]+)/i);
  if (durationMatch) {
    state.approxDuration = durationMatch[0].trim();
  }

  // 8. Delivery Date / Timeline Extraction
  const deliveryMatch =
    userText.match(/(?:within\s*\d+\s*(?:hours|days)|by\s+[a-zA-Z]+|urgent|rush|tomorrow|next\s+week|\d+\s*(?:hours|days))/i) ||
    userText.match(/(?:delivery|timeline|deadline):\s*([^\n,]+)/i);
  if (deliveryMatch) {
    state.deliveryDate = deliveryMatch[0].trim();
  }

  // 9. Reference Link Extraction
  const urlMatch = userText.match(/https?:\/\/(?:www\.)?(?:instagram\.com|youtube\.com|youtu\.be|tiktok\.com|drive\.google\.com|dropbox\.com)[^\s]+/i);
  if (urlMatch) {
    state.referenceVideoUrl = urlMatch[0].trim().replace(/[.,;:]+$/, "");
  }

  // 10. Requirements / Instructions Extraction
  for (const msg of userMessages) {
    if (
      msg.toLowerCase().includes("hook") ||
      msg.toLowerCase().includes("caption") ||
      msg.toLowerCase().includes("music") ||
      msg.toLowerCase().includes("cut") ||
      msg.toLowerCase().includes("pacing") ||
      msg.toLowerCase().includes("text") ||
      msg.toLowerCase().includes("color") ||
      msg.toLowerCase().includes("instructions")
    ) {
      state.requirements = msg.trim();
      break;
    }
  }

  return state;
}

/**
 * Determines what information is still missing and formats the next single question.
 */
export function getNextVideoOrderQuestion(
  state: ExtractedVideoOrderState,
  lastUserMessage: string
): {
  reply: string;
  isComplete: boolean;
  videoOrderSummary?: VideoOrderSummaryData;
} {
  // If defaults can be inferred gracefully:
  const serviceId = state.serviceId || "product-reel";
  const serviceName = state.serviceName || "Product Reel";
  const videoFormat = state.videoFormat || "mp4";
  const aspectRatio = state.aspectRatio || "9:16";

  // Step 1: Missing Video Type or Aspect Ratio
  if (!state.serviceId && !state.aspectRatio) {
    return {
      reply: `I'd love to help craft your video! 🎬\n\nTo get started, what type of video are you creating (e.g. Product Reel at ₹999, Basic Product Showcase at ₹799, or UGC-Style Ad at ₹1,499), and what aspect ratio do you need (9:16 vertical for Reels/Shorts, 16:9 landscape, or 1:1 square)?`,
      isComplete: false,
    };
  }

  // Step 2: Missing Duration or Requirements
  if (!state.approxDuration || !state.requirements) {
    return {
      reply: `Awesome choice — ${serviceName} in ${aspectRatio} format!\n\nWhat is the approximate video duration (e.g., 15s, 30s, 60s), and what are your key editing instructions (such as hook style, dynamic subtitles, audio vibe, or key product features)?`,
      isComplete: false,
    };
  }

  // Step 3: Missing Delivery Timeline
  if (!state.deliveryDate) {
    return {
      reply: `Got it! Noted your duration (${state.approxDuration}) and instructions.\n\nWhen is your required delivery date or target turnaround (e.g. within 48 hours, by Friday, or same-day rush)? Also, if you have a reference video link or style benchmark, feel free to include it!`,
      isComplete: false,
    };
  }

  // Step 4: Missing Contact Details (Name, Phone, Email)
  const hasName = Boolean(state.fullName && state.fullName.length >= 2);
  const hasPhone = Boolean(state.mobileNumber && state.mobileNumber.length >= 10);
  const hasEmail = Boolean(state.email && EMAIL_REGEX.test(state.email));

  if (!hasName || !hasPhone || !hasEmail) {
    const missingFields: string[] = [];
    if (!hasName) missingFields.push("Full Name");
    if (!hasPhone) missingFields.push("10-digit WhatsApp number");
    if (!hasEmail) missingFields.push("Email address");

    return {
      reply: `Almost done! Could you please share your ${missingFields.join(", ")} so we can generate your order summary?`,
      isComplete: false,
    };
  }

  // ALL 10 ATTRIBUTES ARE COLLECTED! Build verified summary.
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
