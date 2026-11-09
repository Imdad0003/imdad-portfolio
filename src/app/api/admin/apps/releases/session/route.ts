import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAdminRequest } from "@/lib/server-auth";
import { sanitizeFileName } from "@/lib/asset-sanitizer";
import { saveStagingSession } from "@/lib/staging-chunks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_APK_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB
const CHUNK_SIZE_BYTES = 700 * 1024; // 700 KB per chunk (fits comfortably under Firestore 1MB document limit and Vercel 4.5 MB request limit)

/**
 * Admin APK Upload Session API
 *
 * Authorizes the administrator and initializes a short-lived, authenticated upload session.
 * Configures a chunked upload pipeline that bypasses Vercel's 4.5 MB body limit and
 * eliminates the need for Firebase Cloud Storage or Blaze billing.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized admin account." },
        { status: authResult.statusCode }
      );
    }

    const body = await req.json();
    const { appId, fileName, fileSize } = body;

    if (!appId || typeof appId !== "string") {
      return NextResponse.json({ error: "Missing or invalid appId." }, { status: 400 });
    }

    if (!fileName || typeof fileName !== "string" || !fileName.toLowerCase().endsWith(".apk")) {
      return NextResponse.json(
        { error: "Invalid fileName: Target release must have a .apk file extension." },
        { status: 400 }
      );
    }

    if (!fileSize || typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json({ error: "Invalid fileSize." }, { status: 400 });
    }

    if (fileSize > MAX_APK_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum supported limit (${(fileSize / (1024 * 1024)).toFixed(1)} MB > 150 MB).`,
        },
        { status: 413 }
      );
    }

    const sanitizedName = sanitizeFileName(fileName);
    const randomSuffix = crypto.randomBytes(6).toString("hex");
    const sessionId = `sess_${Date.now()}_${randomSuffix}`;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE_BYTES);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || undefined;

    // Persist session metadata
    await saveStagingSession(
      {
        sessionId,
        appId,
        fileName: sanitizedName,
        fileSize,
        chunkSize: CHUNK_SIZE_BYTES,
        totalChunks,
        adminEmail: authResult.user?.email || "admin",
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000,
        status: "active",
      },
      idToken
    );

    return NextResponse.json(
      {
        success: true,
        sessionId,
        appId,
        fileName: sanitizedName,
        fileSize,
        chunkSize: CHUNK_SIZE_BYTES,
        totalChunks,
        uploadDestination: "chunked",
        maxSizeBytes: MAX_APK_SIZE_BYTES,
        expiresAt,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Upload session creation error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to initialize upload session: ${msg}` },
      { status: 500 }
    );
  }
}
