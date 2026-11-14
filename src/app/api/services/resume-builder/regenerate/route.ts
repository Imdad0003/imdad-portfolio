import { NextRequest, NextResponse } from "next/server";
import { regenerateSectionWithGemini } from "@/lib/resume-ai";
import { z } from "zod";

const RegenerateRequestSchema = z.object({
  sectionType: z.enum(["summary", "experience_bullets", "project_bullets"]),
  targetTitle: z.string().min(2).max(150),
  targetJobDescription: z.string().max(5000).optional(),
  existingContent: z.string().min(2).max(3000),
  userNotes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid section regeneration request payload.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const { sectionType, targetTitle, targetJobDescription, existingContent, userNotes } = parsed.data;

    const result = await regenerateSectionWithGemini(sectionType, {
      targetTitle,
      targetJobDescription,
      existingContent,
      userNotes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, code: "REGEN_FAILED" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      result: result.result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg, code: "SERVER_ERROR" }, { status: 500 });
  }
}
