import { NextRequest, NextResponse } from "next/server";
import { ResumeInputPayloadSchema } from "@/types/resume";
import { generateResumeWithGemini4Hydrogen } from "@/lib/resume-ai";
import { getSettings } from "@/lib/cms";

// In-memory rate limiting map: IP -> { count: number; resetAt: number }
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerDay = 15): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const record = ipRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + oneDayMs });
    return { allowed: true, remaining: maxPerDay - 1 };
  }

  if (record.count >= maxPerDay) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxPerDay - record.count };
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP identification & Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // 2. Fetch admin config
    let modelToUse = "gemini-4-hydrogen";
    let isServiceEnabled = true;
    let isMaintenance = false;
    let maxLimit = 15;

    try {
      const settings = await getSettings();
      const cfg = (settings as any)?.resumeBuilder;
      if (cfg) {
        if (cfg.enabled === false) isServiceEnabled = false;
        if (cfg.maintenanceMode === true) isMaintenance = true;
        if (cfg.aiModel) modelToUse = cfg.aiModel;
        if (cfg.dailyIpLimit) maxLimit = cfg.dailyIpLimit;
      }
    } catch {
      // Fallback to safe defaults
    }

    if (!isServiceEnabled || isMaintenance) {
      return NextResponse.json(
        {
          error: "AI Resume Builder is currently undergoing maintenance. Please check back shortly.",
          code: "MAINTENANCE_MODE",
        },
        { status: 503 }
      );
    }

    const { allowed, remaining } = checkRateLimit(ip, maxLimit);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Daily generation limit of ${maxLimit} resumes reached for your network. Please try again tomorrow.`,
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    // 3. Request size check (Max 60KB to prevent payload flooding)
    const rawBody = await req.text();
    if (rawBody.length > 60000) {
      return NextResponse.json(
        { error: "Payload exceeds maximum allowed size (60KB).", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format in request body.", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    // 4. Validate input payload with Zod
    const validation = ResumeInputPayloadSchema.safeParse(parsedJson);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .slice(0, 4)
        .join("; ");

      return NextResponse.json(
        {
          error: `Form validation failed: ${errorMessages}`,
          code: "VALIDATION_ERROR",
          issues: validation.error.issues,
        },
        { status: 422 }
      );
    }

    // 5. Generate Resume with Gemini 4 Hydrogen
    const result = await generateResumeWithGemini4Hydrogen(validation.data, modelToUse);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
        },
        { status: result.code === "RATE_LIMITED" ? 429 : 502 }
      );
    }

    // 6. Return successful validated resume
    return NextResponse.json({
      success: true,
      resume: result.data,
      remainingGenerationsToday: remaining,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        error: `Unexpected server error occurred: ${message}`,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
