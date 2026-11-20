import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateMediaFile } from "@/lib/asset-sanitizer";
import { verifyAdminRequest } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "fhyy9rxd";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const allowedCategories = new Set(["logos", "hero", "apps", "projects", "services", "general"]);

function cloudinarySignature(params: Record<string, string | number>): string {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** Admin-only, server-validated Cloudinary upload. No unsigned preset is used. */
export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return failure(auth.error || "Unauthorized", auth.statusCode);
  if (!apiKey || !apiSecret) return failure("Cloudinary server credentials are not configured.", 503);

  try {
    const form = await req.formData();
    const file = form.get("file");
    const category = String(form.get("category") || "general");
    if (!(file instanceof File)) return failure("A media file is required.", 400);
    if (!allowedCategories.has(category)) return failure("Invalid media category.", 400);

    const validation = await validateMediaFile(file);
    if (!validation.valid) return failure(validation.error || "Invalid media file.", 400);

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `studio-assets/${category}`;
    const resourceType = validation.detectedType.startsWith("video/") ? "video" : "image";
    const signature = cloudinarySignature({ folder, timestamp });
    const cloudForm = new FormData();
    cloudForm.set("file", file, validation.sanitizedFileName);
    cloudForm.set("api_key", apiKey);
    cloudForm.set("timestamp", String(timestamp));
    cloudForm.set("folder", folder);
    cloudForm.set("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: cloudForm,
    });
    const result = await response.json().catch(() => null) as {
      secure_url?: string; public_id?: string; width?: number; height?: number; bytes?: number; format?: string; error?: { message?: string };
    } | null;
    if (!response.ok || !result?.secure_url || !result.public_id) {
      return failure(result?.error?.message || "Cloudinary rejected the upload.", 502);
    }
    return NextResponse.json({ success: true, asset: {
      url: result.secure_url, publicId: result.public_id, width: result.width,
      height: result.height, bytes: result.bytes, format: result.format,
    } });
  } catch (error) {
    console.error("[AdminMedia] Upload failed", error);
    return failure("Unable to upload media asset.", 500);
  }
}

/** Deletes the CDN object first. Callers remove Firestore metadata only after this succeeds. */
export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) return failure(auth.error || "Unauthorized", auth.statusCode);
  if (!apiKey || !apiSecret) return failure("Cloudinary server credentials are not configured.", 503);
  try {
    const body = await req.json().catch(() => null) as { publicId?: unknown; resourceType?: unknown } | null;
    const publicId = typeof body?.publicId === "string" ? body.publicId : "";
    const resourceType = body?.resourceType === "video" ? "video" : "image";
    if (!publicId || publicId.length > 500 || !publicId.startsWith("studio-assets/")) {
      return failure("Invalid Cloudinary public ID.", 400);
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const destroyForm = new URLSearchParams({
      public_id: publicId, api_key: apiKey, timestamp: String(timestamp),
      signature: cloudinarySignature({ public_id: publicId, timestamp }),
    });
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: destroyForm,
    });
    const result = await response.json().catch(() => null) as { result?: string; error?: { message?: string } } | null;
    if (!response.ok || (result?.result !== "ok" && result?.result !== "not found")) {
      return failure(result?.error?.message || "Cloudinary deletion failed; metadata was kept.", 502);
    }
    return NextResponse.json({ success: true, deleted: result?.result });
  } catch (error) {
    console.error("[AdminMedia] Delete failed", error);
    return failure("Unable to delete media asset.", 500);
  }
}
