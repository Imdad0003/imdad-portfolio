import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";
import {
  getOrCreateMediaRelease,
  uploadGitHubReleaseAsset,
  deleteGitHubReleaseAsset,
} from "@/lib/github-releases";
import { sanitizeFileName } from "@/lib/asset-sanitizer";
import { VisualImage } from "@/types/wishmusic-visuals";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Admin Image Upload Route
 * Streams uploaded image directly to GitHub Releases (wishmusic-media tag).
 * Returns persistent Fastly CDN download URL without modifying repository git tree.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized." },
        { status: authResult.statusCode }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as string) || "general";
    const customTitle = (formData.get("title") as string) || "";
    const customCaption = (formData.get("caption") as string) || "";
    const customAlt = (formData.get("altText") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${file.type}). Allowed formats: JPEG, PNG, WebP.`,
        },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 15 MB.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize file name
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase() || ".webp";
    const baseName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, "")).substring(0, 30);
    const targetFileName = `wm_${section}_${Date.now()}_${baseName}${ext}`;

    // Get or create dedicated media release
    const mediaRelease = await getOrCreateMediaRelease("wishmusic-media");

    // Upload to GitHub Releases CDN
    const uploadedAsset = await uploadGitHubReleaseAsset({
      uploadUrl: mediaRelease.uploadUrl,
      fileName: targetFileName,
      fileBuffer: buffer,
      contentType: file.type,
      releaseId: mediaRelease.id,
    });

    const visualImage: VisualImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: uploadedAsset.downloadUrl,
      thumbnailUrl: uploadedAsset.downloadUrl,
      fileName: targetFileName,
      fileSize: file.size,
      title: customTitle || file.name,
      caption: customCaption,
      altText: customAlt || customTitle || file.name,
      uploadedAt: new Date().toISOString(),
      githubAssetId: uploadedAsset.id,
    };

    return NextResponse.json({
      success: true,
      asset: visualImage,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Visual image upload error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * Delete image asset from GitHub Release.
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized." },
        { status: authResult.statusCode }
      );
    }

    const { searchParams } = new URL(req.url);
    const assetIdStr = searchParams.get("assetId");
    if (!assetIdStr) {
      return NextResponse.json({ error: "Missing assetId parameter." }, { status: 400 });
    }

    const assetId = parseInt(assetIdStr, 10);
    if (isNaN(assetId) || assetId <= 0) {
      return NextResponse.json({ error: "Invalid assetId." }, { status: 400 });
    }

    const deleted = await deleteGitHubReleaseAsset(assetId);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Visual image delete error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
