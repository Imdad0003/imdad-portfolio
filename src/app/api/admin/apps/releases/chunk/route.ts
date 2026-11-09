import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";
import { getStagingSession, saveStagingChunk } from "@/lib/staging-chunks";

export const dynamic = "force-dynamic";

/**
 * Admin APK Chunk Upload API
 *
 * Receives individual binary chunks (typically ~700 KB, safely under Vercel's 4.5 MB limit),
 * validates administrator authorization, and stages them in Firestore until all chunks
 * are assembled for server-side verification and publication.
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

    const contentType = req.headers.get("content-type") || "";
    let sessionId: string = "";
    let chunkIndex: number = -1;
    let totalChunks: number = 0;
    let chunkBase64: string = "";
    let chunkSize: number = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      sessionId = String(formData.get("sessionId") || "");
      chunkIndex = Number(formData.get("chunkIndex") ?? -1);
      totalChunks = Number(formData.get("totalChunks") ?? 0);
      const chunkFile = formData.get("chunk") as File | null;

      if (!chunkFile) {
        return NextResponse.json({ error: "Missing chunk binary." }, { status: 400 });
      }

      const arrayBuf = await chunkFile.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      chunkSize = buf.length;
      chunkBase64 = buf.toString("base64");
    } else {
      const body = await req.json();
      sessionId = String(body.sessionId || "");
      chunkIndex = Number(body.chunkIndex ?? -1);
      totalChunks = Number(body.totalChunks ?? 0);
      chunkBase64 = String(body.data || "");
      chunkSize = Buffer.from(chunkBase64, "base64").length;
    }

    if (!sessionId || chunkIndex < 0 || totalChunks <= 0 || !chunkBase64) {
      return NextResponse.json(
        { error: "Invalid chunk payload: sessionId, chunkIndex, totalChunks, and data are required." },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await getStagingSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: `Upload session '${sessionId}' not found or expired.` },
        { status: 404 }
      );
    }

    // Save chunk document
    await saveStagingChunk(sessionId, {
      index: chunkIndex,
      data: chunkBase64,
      size: chunkSize,
      receivedAt: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        sessionId,
        chunkIndex,
        totalChunks,
        size: chunkSize,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Chunk upload error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to upload chunk: ${msg}` },
      { status: 500 }
    );
  }
}
