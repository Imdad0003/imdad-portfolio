import { NextRequest, NextResponse } from "next/server";
import { allServices, formatPrice } from "@/data/pricing";
import { siteConfig } from "@/data/config";

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 25; // max requests per minute

  const timestamps = rateLimitMap.get(ip) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    return true;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  return false;
}

// Fallback intelligent sales assistant engine when GEMINI_API_KEY is not configured
function generateSmartFallback(lastUserMessage: string, historyLength: number): {
  reply: string;
  projectSummary?: {
    service: string;
    requirement: string;
    scope: string;
    pricingNote: string;
  } | null;
} {
  const lower = lastUserMessage.toLowerCase();

  // Package Calculator inquiry
  if (lower.includes("calculator") || lower.includes("built a package") || lower.includes("estimated total")) {
    return {
      reply: `Thank you for building a custom package! I've noted your configuration details.\n\nAll rates shown on the website are transparent starting estimates. Final quote may vary slightly depending on your exact product requirements and creative assets provided.\n\nWould you like to send this inquiry directly to Imdad or discuss it on WhatsApp / Instagram?`,
      projectSummary: {
        service: "Custom Package Configuration",
        requirement: "Custom project bundle configured via website calculator",
        scope: "Tailored multi-deliverable scope",
        pricingNote: "Calculated based on selected units and deliverables. Final quote confirmed on review.",
      },
    };
  }

  // E-commerce / Marketplace
  if (lower.includes("amazon") || lower.includes("flipkart") || lower.includes("meesho") || lower.includes("listing") || lower.includes("e-commerce") || lower.includes("ecommerce")) {
    if (lower.includes("sku") || lower.includes("product") || lower.includes("5") || lower.includes("10") || lower.includes("new") || historyLength > 3) {
      return {
        reply: `Got it. For your marketplace listing project, here is a structured summary based on your details:\n\nAmazon listings start at ₹799/product, Flipkart at ₹699, Meesho at ₹499, and the 3-in-1 multi-marketplace bundle is ₹1,999/product. If you need 7-image listing infographic sets included, we can bundle them together.\n\nWould you like to send this project inquiry directly to Imdad or discuss it on WhatsApp / Instagram?`,
        projectSummary: {
          service: "Marketplace Listing & Cataloging",
          requirement: "Listing setup, keyword indexing & product positioning",
          scope: "Custom SKU volume",
          pricingNote: "Amazon starts at ₹799/product, Flipkart at ₹699, Meesho at ₹499. Final quote depends on SKU volume and creative assets.",
        },
      };
    }

    return {
      reply: `Sure! I can help with Amazon (Starting at ₹799/product), Flipkart (Starting at ₹699/product), and Meesho (Starting at ₹499/product) listing setup and optimization.\n\nRecommended package: Amazon Listing Pro (₹1,999/product) includes title, bullets, description, search keywords, competitor research, and optimization.\n\nWhat is your product category and how many SKUs are you planning to list?`,
    };
  }

  // Product Images / Creatives
  if (lower.includes("image") || lower.includes("photo") || lower.includes("creative") || lower.includes("infographic")) {
    if (lower.includes("deck") || lower.includes("ready") || lower.includes("sample") || historyLength > 2) {
      return {
        reply: `Understood. Product creatives are designed specifically for marketplace conversions—main hero shots, dimension diagrams, and lifestyle graphics.\n\nRecommended: The Popular 7-Image Deck is ₹799, and the Best Value 10-Image Deck is ₹999.\n\nHere is your project summary:`,
        projectSummary: {
          service: "Product Listing Creatives",
          requirement: "Marketplace listing infographic deck (7–10 images)",
          scope: "Conversion-engineered visual deck",
          pricingNote: "7-Image deck: ₹799 | 10-Image deck: ₹999. Final quote depends on product count and raw photos provided.",
        },
      };
    }

    return {
      reply: `I can help design conversion-engineered product creatives.\n\nTransparent Rates:\n• 1 Image: ₹149\n• 5 Images: ₹599\n• 7 Images (Popular): ₹799\n• 10 Images (Best Value): ₹999\n• Premium 7 Images: ₹1,499\n• Premium 10 Images: ₹1,999\n\nHow many products/decks are you looking to create, and do you already have raw product photos?`,
    };
  }

  // Website & Digital
  if (lower.includes("website") || lower.includes("store") || lower.includes("shopify") || lower.includes("wordpress") || lower.includes("smartbiz")) {
    return {
      reply: `I build fast, responsive business and e-commerce websites with smooth Razorpay payment integration.\n\nPricing:\n• Landing Page: Starting at ₹4,999\n• Business Website: Starting at ₹9,999\n• E-commerce Website: Starting at ₹15,999\n• Shopify Store: Starting at ₹12,999\n• WordPress Website: Starting at ₹9,999\n• Payment Gateway Integration: Starting at ₹1,999\n\nIs this an online store with direct checkout or an informational brand website?`,
    };
  }

  // Video / UGC Ads
  if (lower.includes("video") || lower.includes("ugc") || lower.includes("reel") || lower.includes("short")) {
    return {
      reply: `Short-form video and UGC-style ads are built specifically to hook viewers in the first 3 seconds on Meta and Instagram.\n\nPricing:\n• Basic Product Video: Starting at ₹799\n• Product Reel: Starting at ₹999\n• UGC-Style Ad: Starting at ₹1,499\n• AI UGC Ad: Starting at ₹1,499\n• Premium Ad Creative: Starting at ₹2,499\n• 3 Ad Package: ₹3,999\n• 5 Ad Package: ₹5,999\n\nHow many video creatives would you like to test?`,
    };
  }

  // Business Setup / GST / Trademark
  if (lower.includes("gst") || lower.includes("trademark") || lower.includes("udyam") || lower.includes("registration") || lower.includes("setup")) {
    return {
      reply: `I provide step-by-step documentation guidance and portal walkthroughs for:\n• GST Registration Assistance: Starting at ₹499\n• Udyam Registration Assistance: Starting at ₹299\n• Trademark Application Assistance: Starting at ₹999\n\n*Important note:* This is process guidance and documentation support, not legal or chartered accountant tax representation. Government fees and third-party charges, if applicable, are separate.\n\nWhich stage of business setup are you currently at?`,
    };
  }

  // Social Media & Ads
  if (lower.includes("social") || lower.includes("instagram") || lower.includes("meta") || lower.includes("ad") || lower.includes("marketing")) {
    return {
      reply: `I help brands with social media growth and Meta ad campaigns:\n\nSocial Media:\n• Starter: ₹4,999 / month (12 creatives, captions, ideas)\n• Growth (Popular): ₹9,999 / month (16–20 creatives, strategy, reels)\n• Full Management: Starting at ₹14,999 / month\n\nDigital Marketing:\n• Meta Ads Setup: Starting at ₹2,999\n• Meta Ads Management: Starting at ₹5,999 / month\n• Meta Ads + Creative: Starting at ₹9,999 / month\n*(Note: Ad spend is paid directly to Meta and is separate.)*\n\nWhich service are you interested in?`,
    };
  }

  // Pricing Inquiry
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("kitna") || lower.includes("budget")) {
    return {
      reply: `All our prices are transparent and visible directly on the website:\n• Amazon Listings: Starting at ₹799 / product (Pro package: ₹1,999)\n• Product Creatives: ₹149 (1 image), ₹799 (7-image deck), ₹999 (10-image deck)\n• Video & UGC Ads: Starting at ₹799\n• Websites & Shopify: Starting at ₹4,999\n• Social Media Plans: Starting at ₹4,999 / month\n• Meta Ads: Starting at ₹2,999 (Ad spend separate)\n• Business Setup Support: Starting at ₹299 (Govt fees separate)\n\nFinal quote may vary depending on project scope. Which service would you like an estimate for?`,
    };
  }

  // Default helpful response
  return {
    reply: `Hi! I'm Imdad's project assistant. I can help you understand services, estimate project scopes, and connect directly with Imdad.\n\nWhat are you looking to build for your business?\n- Marketplace listings (Amazon, Flipkart, Meesho)\n- Product listing creatives & infographics (7-image & 10-image decks)\n- E-commerce websites & landing pages\n- UGC-style video ads & Reels\n- AI generative workflows\n- Business setup assistance (GST, Udyam, Trademark)\n\nTell me a little about your product!`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          reply: "You're sending messages a bit too fast. Please wait a moment before sending another message.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "Please provide a valid message to get started." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    // If API Key is present, query Google Gemini API server-side
    if (apiKey) {
      try {
        const pricingSchedule = allServices
          .map((s) => `- ${s.name}: ${formatPrice(s)}${s.note ? ` (${s.note})` : ""}`)
          .join("\n");

        const systemPrompt = `You are Imdad's AI Sales & Project Assistant on his personal portfolio website.
Imdad is an E-commerce Entrepreneur & Digital Business Specialist, Founder of EasyXo.
Tone: Professional, friendly, direct, helpful, concise, business-focused. Never use robotic phrases or long walls of text.
Transparent: You are an AI assistant representing Imdad. Imdad is an active entrepreneur/operator.

Official Service Pricing Schedule:
${pricingSchedule}

Pricing rules:
- Always quote the exact prices from the Official Service Pricing Schedule above. Never invent prices or discounts.
- Note: "All prices shown are starting prices unless mentioned otherwise. Final pricing may vary depending on project scope, complexity and requirements."
- For Meta Ads, always clearly state: "Ad spend is separate."
- For Business Setup (GST, Udyam, Trademark), always state: "Government fees, professional fees and third-party charges, if applicable, are separate." Position these services as process guidance / documentation support, never legal or CA representation.

Lead qualification:
- Ask 1 to 2 targeted questions at a time to understand their product, volume, and needs.
- When enough details are known, provide a concise:
PROJECT SUMMARY
Service: [Name]
Requirement: [Short summary]
Estimated Scope: [Small / Medium / Large]
Next Step: Send project inquiry or discuss on WhatsApp / Instagram (@imdad.builds)

Encourage direct contact when the project gets specific:
- Instagram: ${siteConfig.contact.instagramHandle} (${siteConfig.contact.instagramUrl})
- WhatsApp & Contact Form`;

        // Format Gemini contents
        const contents = [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I will represent Imdad accurately as his AI sales and project assistant." }] },
          ...messages.slice(-6).map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const replyText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm here to help. Could you tell me more about your product or what you'd like to build?";

          // Check if response contains a project summary
          let projectSummary = null;
          if (replyText.includes("PROJECT SUMMARY")) {
            projectSummary = {
              service: "Project Inquiry",
              requirement: "Based on our conversation",
              scope: "Tailored scope",
              pricingNote: "Scope-dependent investment",
            };
          }

          return NextResponse.json({
            reply: replyText,
            projectSummary,
          });
        }
      } catch (err) {
        console.error("Gemini API error, falling back to smart sales engine:", err);
      }
    }

    // Fallback engine (used when no API key is provided or API is unreachable)
    const fallbackResult = generateSmartFallback(lastMessage, messages.length);
    return NextResponse.json({
      reply: fallbackResult.reply,
      projectSummary: fallbackResult.projectSummary || null,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply:
          "Looks like the assistant is temporarily unavailable. You can still contact Imdad directly via WhatsApp, Instagram, or the inquiry form below.",
        isError: true,
      },
      { status: 500 }
    );
  }
}
