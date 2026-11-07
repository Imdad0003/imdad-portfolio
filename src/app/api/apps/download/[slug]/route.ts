import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getPublishedReleases } from "@/lib/cms";
import { AppReleaseDocument, ReleaseAuditLogDocument } from "@/types/releases";

export const dynamic = "force-dynamic";

/**
 * Public APK Download Endpoint
 * Resolves the official published release binary for an application and redirects directly.
 * Logs download activity without tracking private personal data.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const appId = slug.toLowerCase();
    const { searchParams } = new URL(req.url);
    const requestedVersion = searchParams.get("version");

    const releases: AppReleaseDocument[] = await getPublishedReleases(appId);
    if (!releases || releases.length === 0) {
      return NextResponse.json(
        {
          error: `No published releases found for application '${appId}'.`,
          appId,
        },
        { status: 404 }
      );
    }

    let targetRelease: AppReleaseDocument | undefined;

    if (requestedVersion) {
      targetRelease = releases.find(
        (r) =>
          r.versionName.toLowerCase() === requestedVersion.toLowerCase() ||
          r.versionName.toLowerCase() === `v${requestedVersion.toLowerCase()}`
      );
    }

    if (!targetRelease) {
      targetRelease = releases.find((r) => r.isLatestStable) || releases[0];
    }

    if (!targetRelease || !targetRelease.downloadUrl) {
      return NextResponse.json(
        { error: "Download asset URL is not configured for this release." },
        { status: 404 }
      );
    }

    // Record download audit log asynchronously if db is connected
    if (db) {
      try {
        const now = new Date().toISOString();
        const auditLog: ReleaseAuditLogDocument = {
          id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          appId,
          releaseId: targetRelease.id,
          action: "download",
          performedBy: "public_client",
          details: {
            versionName: targetRelease.versionName,
            versionCode: targetRelease.versionCode,
            userAgent: req.headers.get("user-agent") || "unknown",
          },
          timestamp: now,
        };
        await setDoc(doc(db, "releaseAuditLogs", auditLog.id), auditLog);
      } catch (logErr) {
        console.warn("Download audit log warning:", logErr);
      }
    }

    // Guard against circular/invalid download redirect loops
    if (!targetRelease.downloadUrl || targetRelease.downloadUrl.includes("/api/apps/download/")) {
      return NextResponse.json(
        { error: "Direct download binary is not yet available or configured for this release." },
        { status: 404 }
      );
    }

    // Redirect to official release URL
    const redirectUrl = targetRelease.downloadUrl.startsWith("http")
      ? new URL(targetRelease.downloadUrl)
      : new URL(targetRelease.downloadUrl, req.url);

    return NextResponse.redirect(redirectUrl, 302);
  } catch (err: unknown) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { error: "Failed to resolve download URL." },
      { status: 500 }
    );
  }
}
