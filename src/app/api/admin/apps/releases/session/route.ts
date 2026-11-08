import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAdminRequest } from "@/lib/server-auth";
import { sanitizeFileName } from "@/lib/asset-sanitizer";

export const dynamic = "force-dynamic";

const MAX_APK_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

/**
 * Admin APK Upload Session API
 *
 * Authorizes the administrator and initializes a short-lived, authenticated upload session.
 * Generates an isolated staging path in storage for large APK binaries (up to 150 MB).
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
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const stagingPath = `staging/apk/${appId}/${Date.now()}_${randomSuffix}_${sanitizedName}`;
    const sessionId = `session_${Date.now()}_${randomSuffix}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    const storageBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "imdadbuilds-ead39.firebasestorage.app";

    return NextResponse.json(
      {
        sessionId,
        appId,
        fileName: sanitizedName,
        stagingPath,
        storageBucket,
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
