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

// Fallback intelligent sales assistant engine when GEMINI_API_KEY is not configured or API is unreachable
function generateSmartFallback(messages: Array<{ role: string; content: string }>): {
  reply: string;
  projectSummary?: {
    service: string;
    requirement: string;
    scope: string;
    pricingNote: string;
  } | null;
} {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const lower = lastUserMessage.toLowerCase();
  const conversationText = messages.map((m) => m.content).join(" ").toLowerCase();

  // 1. Studio Apps: WishMusic & WishTracking & EasyXo
  if (lower.includes("wishmusic") || lower.includes("music app") || lower.includes("audio player")) {
    return {
      reply: `WishMusic is a high-fidelity tactile audio player app designed and engineered by IMDAD.BUILDS. It features a low-latency audio engine, offline caching, lossless FLAC/ALAC support, and album-artwork adaptive themes with zero telemetry bloat.\n\nIt is currently in active Alpha development for iOS, Android, and Web.\n\nExplore WishMusic → /apps/wishmusic\n\nWould you like to join the early beta waitlist or discuss building a custom mobile app?`,
    };
  }

  if (lower.includes("wishtrack") || lower.includes("habit") || lower.includes("tracker")) {
    return {
      reply: `WishTracking is a minimalist, anti-social momentum and habit tracker engineered by IMDAD.BUILDS. It rejects social scoreboards and telemetry bloat in favor of 100% on-device SQLite storage, two-tap completion logging, and compound momentum curves.\n\nExplore WishTracking → /apps/wishtracking\n\nWould you like early access or want to discuss an application build?`,
    };
  }

  // 2. EasyXo explicit question
  if (lower.includes("easyxo")) {
    return {
      reply: `EasyXo is an e-commerce brand founded and operated by Imdad. It is an active commercial venture selling across Amazon, Flipkart, Meesho, and its own direct-to-consumer storefront at https://easyxo.in (Instagram: @easyxo_official).\n\nIt serves as real-world proof of work for our e-commerce architecture, marketplace SEO, and high-retention creative media.\n\nAre you looking to build or scale an e-commerce brand of your own?`,
    };
  }

  // 2. E-commerce / Marketplace Experience & Proof of Work
  if (
    lower.includes("experience") ||
    lower.includes("proof") ||
    lower.includes("credibility") ||
    lower.includes("sold on") ||
    lower.includes("real experience")
  ) {
    return {
      reply: `I am an active e-commerce operator and builder myself. EasyXo is an e-commerce brand I built and run, where I personally handle everything from marketplace listings and high-converting product creatives to store operations and advertising.\n\nWant to see a real e-commerce project I've built? Visit EasyXo → https://easyxo.in\n\nWhat kind of e-commerce store or marketplace listings are you looking to launch?`,
    };
  }

  // 3. Package Calculator inquiry
  if (
    lower.includes("calculator") ||
    lower.includes("built a package") ||
    lower.includes("estimated total")
  ) {
    return {
      reply: `Thank you for configuring a custom package! I've noted your selections.\n\nAll rates shown on the website are transparent starting estimates. Final pricing depends on project scope, complexity, and assets provided.\n\nWould you like me to help you review the deliverables, or discuss it directly on WhatsApp or Instagram?`,
      projectSummary: {
        service: "Custom Package Configuration",
        requirement: "Custom project bundle configured via website calculator",
        scope: "Tailored multi-deliverable scope",
        pricingNote: "Calculated based on selected units. Final quote confirmed on review.",
      },
    };
  }

  // 4. Complex multi-service launch project
  if (
    lower.includes("launch") &&
    (lower.includes("brand") || lower.includes("store") || lower.includes("website") || lower.includes("amazon"))
  ) {
    return {
      reply: `That sounds like an exciting launch! 🚀 We can bundle your product creative deck, marketplace listing optimization, and custom storefront into a cohesive launch package.\n\nTo give you an accurate starting estimate, what kind of product are you launching?`,
    };
  }

  // 5. Social Media Strategy & Planning
  if (
    lower.includes("social") ||
    lower.includes("content planning") ||
    lower.includes("creative strategy") ||
    lower.includes("instagram") ||
    lower.includes("reels")
  ) {
    const hasNiche =
      conversationText.includes("brand") ||
      conversationText.includes("clothing") ||
      conversationText.includes("fashion") ||
      conversationText.includes("food") ||
      conversationText.includes("fitness") ||
      conversationText.includes("beauty") ||
      conversationText.includes("tech") ||
      conversationText.includes("store");

    const hasPlatform =
      conversationText.includes("instagram") ||
      conversationText.includes("youtube") ||
      conversationText.includes("linkedin") ||
      conversationText.includes("facebook") ||
      conversationText.includes("meta");

    if (lower.includes("strategy") || lower.includes("planning") || (!hasNiche && messages.length <= 1)) {
      return {
        reply: `Got it! A solid content plan and creative direction make a huge difference.\n\nAre you looking for a one-off strategy roadmap you can execute yourself, or ongoing monthly content creation and management?`,
      };
    }

    if (!hasPlatform && messages.length <= 3) {
      return {
        reply: `Got it. Which platform matters most right now — Instagram, YouTube, LinkedIn, or multiple platforms?`,
      };
    }

    return {
      reply: `Perfect. Based on what you need, I'd recommend starting with Social Media Starter — starting from ₹4,999/month (includes 12 curated creatives, captions, and strategy calendar).\n\nIf you'd also like ongoing posting, reels, and full account management, our Social Media Growth package (starting from ₹9,999/month) may be a better fit.\n\nWant me to break down what's included?`,
      projectSummary: {
        service: "Social Media Strategy & Planning",
        requirement: "Content planning & creative calendar",
        scope: "Monthly campaign retainer",
        pricingNote: "Starter from ₹4,999/mo | Growth from ₹9,999/mo",
      },
    };
  }

  // 6. Product Images / Creatives (Checked before general marketplace listing)
  if (
    lower.includes("image") ||
    lower.includes("photo") ||
    lower.includes("creative") ||
    lower.includes("infographic")
  ) {
    if (lower.includes("7") || lower.includes("deck") || lower.includes("popular")) {
      return {
        reply: `For a 7-image Amazon listing creative deck (including hero shot, infographic callouts, and dimension graphics), our Popular 7-Image Deck starts at ₹799 (or ₹1,499 for the Premium Deck with 3D/lifestyle rendering).\n\nDo you already have raw photos of your product, or are you starting from scratch?`,
        projectSummary: {
          service: "Product Listing Creatives",
          requirement: "7-image marketplace infographic deck",
          scope: "1 Product / 7 Creatives",
          pricingNote: "Popular 7-Image Deck: ₹799 | Premium: ₹1,499",
        },
      };
    }

    if (lower.includes("10")) {
      return {
        reply: `For a comprehensive 10-image deck, the estimated starting price is ₹999 for the Best Value 10-Image Deck (or ₹1,999 for Premium 10 Images).\n\nDo you already have raw photos of your product, or are you starting from scratch?`,
        projectSummary: {
          service: "Product Listing Creatives",
          requirement: "10-image marketplace infographic deck",
          scope: "1 Product / 10 Creatives",
          pricingNote: "Best Value 10-Image Deck: ₹999 | Premium: ₹1,999",
        },
      };
    }

    return {
      reply: `I design conversion-engineered product creatives built to increase marketplace conversions. Rates start from ₹149 for single images, ₹799 for the Popular 7-Image Deck, and ₹999 for the Best Value 10-Image Deck.\n\nHow many products do you need creatives for?`,
    };
  }

  // 7. Marketplace Listing Setup (Amazon / Flipkart / Meesho)
  if (
    lower.includes("amazon") ||
    lower.includes("flipkart") ||
    lower.includes("meesho") ||
    lower.includes("listing") ||
    lower.includes("catalog")
  ) {
    const match =
      lower.match(/(\d+)\s*(?:[a-z]+\s+)*(?:product|item|listing|sku)/i) ||
      lower.match(/(\d+)\s*(?:product|item|listing|sku)/i) ||
      lower.match(/(\d+)/);
    const count = match ? parseInt(match[1], 10) : null;

    if (count && count > 0) {
      const startEst = (count * 799).toLocaleString("en-IN");
      const proEst = (count * 1999).toLocaleString("en-IN");
      return {
        reply: `For ${count} Amazon products, listing setup and optimization starts from ₹799/product (estimated starting total ₹${startEst}).\n\nIf you want full competitor research, keyword indexing, and high-conversion SEO bullet points, our recommended Amazon Listing Pro package is ₹1,999/product (starting total ₹${proEst}). Final pricing depends on scope and complexity.\n\nWhat category are your products in?`,
        projectSummary: {
          service: "Marketplace Listing Optimization",
          requirement: `${count} product listing setup & SEO`,
          scope: `${count} SKUs`,
          pricingNote: `Starting from ₹${startEst} (Pro: ₹${proEst})`,
        },
      };
    }

    return {
      reply: `I handle complete marketplace listing setup and optimization across Amazon (starting from ₹799/product), Flipkart (starting from ₹699/product), and Meesho (starting from ₹499/product).\n\nOur recommended package is Amazon Listing Pro (₹1,999/product), which includes SEO title, bullet points, search keywords, and competitor research.\n\nHow many products are you planning to list?`,
    };
  }

  // 8. Website & Storefront Development
  if (
    lower.includes("website") ||
    lower.includes("store") ||
    lower.includes("shopify") ||
    lower.includes("wordpress") ||
    lower.includes("landing page")
  ) {
    if (lower.includes("shopify") || lower.includes("ecommerce") || lower.includes("e-commerce")) {
      return {
        reply: `For an online store with direct checkout, Shopify store setups start from ₹12,999 and custom full-stack e-commerce stores start from ₹15,999 (including payment gateway integration).\n\nHow many products are you planning to sell initially?`,
        projectSummary: {
          service: "E-Commerce Website Development",
          requirement: "Online store setup with payment integration",
          scope: "Storefront & Catalog",
          pricingNote: "Shopify from ₹12,999 | Custom from ₹15,999",
        },
      };
    }

    if (lower.includes("landing") || lower.includes("single page")) {
      return {
        reply: `For a high-converting standalone landing page, the estimated starting price is ₹4,999.\n\nDo you already have your copy and brand assets ready, or will you need design from scratch?`,
        projectSummary: {
          service: "Landing Page Development",
          requirement: "High-conversion standalone landing page",
          scope: "Single page responsive design",
          pricingNote: "Starting from ₹4,999",
        },
      };
    }

    return {
      reply: `Awesome — I can definitely help with that. Is this an online store with direct checkout (like Shopify/e-commerce), or an informational business website?`,
    };
  }

  // 9. Video & UGC Ads
  if (
    lower.includes("video") ||
    lower.includes("ugc") ||
    lower.includes("reel") ||
    lower.includes("short")
  ) {
    return {
      reply: `Short-form video and UGC-style ads are built specifically to hook viewers in the first 3 seconds on Meta and Instagram.\n\nRates start from ₹799 for basic product videos, ₹999 for product reels, and ₹1,499 for UGC-style video ads (3-ad packages start from ₹3,999).\n\nHow many video creatives would you like to test?`,
    };
  }

  // 10. Pricing & Rates General Inquiry
  if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("rate") ||
    lower.includes("kitna") ||
    lower.includes("pricing") ||
    lower.includes("how much")
  ) {
    return {
      reply: `All services are quoted transparently with scope-based starting rates:\n• Amazon Listings: Starting from ₹799 / product (Pro package: ₹1,999)\n• Product Listing Creatives: Starting from ₹799 (7-image deck)\n• Video & UGC Ads: Starting from ₹799\n• Websites & Shopify: Starting from ₹4,999\n• Social Media Plans: Starting from ₹4,999 / month\n• Meta Ads Setup: Starting from ₹2,999 (Ad spend is separate)\n• Business Setup Support: Starting from ₹299 (Govt fees separate)\n\nFinal pricing depends on project scope, complexity and requirements. Which service would you like an estimate for?`,
    };
  }

  // 11. Business Setup / GST / Trademark
  if (
    lower.includes("gst") ||
    lower.includes("trademark") ||
    lower.includes("udyam") ||
    lower.includes("registration")
  ) {
    return {
      reply: `I provide step-by-step documentation guidance and portal walkthroughs for GST Registration Assistance (starting from ₹499), Udyam Registration (starting from ₹299), and Trademark Application Assistance (starting from ₹999).\n\nNote: Government fees and third-party charges, if applicable, are separate. Which stage of business setup are you currently at?`,
    };
  }

  // 12. Unrelated / General conversation fallback
  if (
    lower.includes("weather") ||
    lower.includes("capital") ||
    lower.includes("france") ||
    lower.includes("who are you") ||
    lower.includes("joke")
  ) {
    const triviaAnswer = lower.includes("france") ? "Paris is the capital of France! As for me, my " : "My ";
    return {
      reply: `I'm Imdad's AI Sales & Project Assistant! 😊 ${triviaAnswer}specialty is helping you scope digital projects—from marketplace listings and conversion creatives to custom websites and social media strategy.\n\nWhat are you looking to build or scale for your business?`,
    };
  }

  // 13. Default helpful, human greeting
  return {
    reply: `Hi! I'm Imdad's project assistant. I help brands and founders scope their digital projects and estimate transparent pricing.\n\nWhat are you looking to build or scale for your business?`,
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    // If API Key is present, query Google Gemini API server-side
    if (apiKey) {
      try {
        const pricingSchedule = allServices
          .map((s) => `- ${s.name}: ${formatPrice(s)}${s.note ? ` (${s.note})` : ""}`)
          .join("\n");

        const systemPrompt = `You are the AI Studio Assistant representing IMDAD.BUILDS — an independent digital product studio & product lab founded by Imdad.
Imdad is a Product Creator, Software Builder & Digital Business Specialist, Founder of EasyXo, WishMusic, and WishTracking.
Studio Motto / Tagline: "Powered by imdad.builds" • "Building digital products, apps & experiences."

Tone & Persona:
- Professional, technical, concise, human, authentic, and product-focused.
- Act like an experienced digital product studio consultant, NOT a generic agency salesperson or robotic FAQ.
- Speak about building real software, tactile mobile apps, high-speed storefronts, and conversion-engineered media.
- Use emojis sparingly.
- Avoid generic agency buzzwords or hollow marketing slogans.

STUDIO PORTFOLIO & ECOSYSTEM:
1. WishMusic: Tactile audio player app engineered for low latency, gapless playback, and local caching. iOS, Android & Web. Status: In Development (Alpha).
2. WishTracking: Minimalist, anti-social momentum and habit tracker with zero ads, on-device SQLite, and compound trajectory curves. Status: In Development / Early Beta.
3. EasyXo (https://easyxo.in, Instagram: https://www.instagram.com/easyxo_official): Imdad's OWN founder-operated e-commerce brand. Live active business selling across Amazon, Flipkart, Meesho, and direct-to-consumer Razorpay checkout.
- STRICT RULE: EasyXo is Imdad's OWN venture. NEVER describe EasyXo as a "client project". It is living proof of firsthand e-commerce and creative execution.

STUDIO DISCIPLINES:
1. Website Development: Modern Next.js applications, portfolio sites, conversion landing pages, and custom storefronts.
2. App Development: Cross-platform iOS & Android mobile apps with tactile feel and zero telemetry bloat.
3. E-Commerce Architecture: Marketplace indexing (Amazon, Flipkart, Meesho), catalog SEO, and turnkey direct-to-consumer storefronts.
4. Video Editing: 9:16 vertical short-form reels, shorts, and 3-second hook direct-response ads for Meta & Instagram.
5. Social Media: Structured 30-day content pillars, objection-busting carousels, and founder brand roadmaps.

ONE QUESTION AT A TIME RULE (CRITICAL):
- Never interrogate the customer with 3-4 questions at once.
- Ask a MAXIMUM of ONE primary question per assistant message.
- NEVER ask questions whose answers are already provided in the conversation.

SMART PRICING RECOMMENDATION RULES:
Official Pricing Schedule:
${pricingSchedule}

- Ground all quotes strictly in the Official Pricing Schedule above. Never invent prices or guarantee business metrics.
- Always use starting price phrasing: "Starting from ₹X" or "The estimated starting price is ₹X."
- For app development or custom architecture: "Pricing is scoped bespoke based on features and platform requirements."
- For Meta Ads: always state "Ad spend is separate."

WEBSITE DESTINATIONS:
- Studio Apps: /apps (or /apps/wishmusic, /apps/wishtracking, /apps/easyxo)
- Studio Services: /services (or /services/website-development, /services/app-development, /services/ecommerce, /services/video-editing, /services/social-media)
- Case Studies: /projects
- Studio Intake & Contact: /contact or WhatsApp (+91 7352608269, https://wa.me/917352608269)
- Instagram: @imdad.builds (${siteConfig.contact.instagramUrl})`;

        // Format Gemini contents (Gemini 3.8 turn-validation compliant)
        const contents = messages.slice(-6).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }],
              },
              contents,
            }),
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
    const fallbackResult = generateSmartFallback(messages);
    return NextResponse.json({
      reply: fallbackResult.reply,
      projectSummary: fallbackResult.projectSummary || null,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply:
          "Looks like the assistant is temporarily unavailable. You can still contact Imdad directly via WhatsApp (+91 7352608269), Instagram, or the inquiry form below.",
        isError: true,
      },
      { status: 500 }
    );
  }
}
