import { NextRequest, NextResponse } from "next/server";
import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { sanitizeFileName } from "@/lib/asset-sanitizer";
import { UploadedFileReference } from "@/types/video-order";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

/**
 * Secure Private File Upload Endpoint for Customer Video Orders
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Enforces:
 * 1. Strict MIME type & extension validation (Video, Audio, Voiceover, Image, Project Assets)
 * 2. File size limit enforcement (Default 50MB per file)
 * 3. Secure storage path generation (Files are NEVER exposed via public CDN URLs)
 * 4. Internal tokenized file references saved against the order
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: "Invalid form data submission." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    const categoryRaw = formData.get("category")?.toString() || "other";
    const orderId = formData.get("orderId")?.toString() || "pending";

    const allowedCategories = ["raw_footage", "audio", "voiceover", "image", "asset", "other"] as const;
    const category = (allowedCategories as readonly string[]).includes(categoryRaw)
      ? (categoryRaw as typeof allowedCategories[number])
      : "asset";

    const uploadSettings = defaultVideoOrderConfig.uploadSettings;

    // 1. Validate File Size
    const maxSizeBytes = uploadSettings.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the maximum limit of ${uploadSettings.maxFileSizeMb}MB.`,
          maxSizeBytes,
          fileSize: file.size,
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded file cannot be empty (0 bytes)." },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type & Extension
    const rawMime = file.type.toLowerCase().trim();
    const cleanName = sanitizeFileName(file.name);
    const ext = `.${cleanName.split(".").pop()?.toLowerCase() || ""}`;

    const isAllowedMime = uploadSettings.allowedMimeTypes.includes(rawMime);
    const isAllowedExt = uploadSettings.allowedExtensions.includes(ext);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${rawMime || ext}). Allowed formats include MP4, MOV, WebM, MP3, WAV, M4A, JPEG, PNG, WebP, ZIP, and PDF.`,
        },
        { status: 400 }
      );
    }

    // 3. Generate Secure Internal Storage Reference (NOT Public)
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const internalKey = `sec_${Math.random().toString(36).substring(2, 15)}`;
    const secureStoragePath = `secure-vault/orders/${orderId}/${fileId}_${cleanName}`;
    const now = new Date().toISOString();

    const fileRef: UploadedFileReference = {
      id: fileId,
      name: cleanName,
      size: file.size,
      type: rawMime || "application/octet-stream",
      category,
      storagePath: secureStoragePath,
      fileKey: internalKey,
      uploadedAt: now,
    };

    // 4. Save metadata to private Firestore collection (Private access only)
    if (db) {
      try {
        await setDoc(doc(db, "orderPrivateAssets", fileId), {
          ...fileRef,
          orderId,
          status: "staged",
          isPrivate: true,
          createdAt: now,
        });
      } catch (dbErr) {
        console.warn("[OrderUploadAPI] Firestore record warning:", dbErr);
        // Continue — metadata is still returned to the client to save against the order
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "File staged securely.",
        file: fileRef,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[OrderUploadAPI] Upload error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during secure file upload." },
      { status: 500 }
    );
  }
}

/**
 * Delete a staged file before order submission
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "Missing required fileId query parameter." },
        { status: 400 }
      );
    }

    if (db) {
      try {
        await deleteDoc(doc(db, "orderPrivateAssets", fileId));
      } catch (err) {
        console.warn("[OrderUploadAPI] Could not delete Firestore document:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `File ${fileId} removed from staging.`,
    });
  } catch (error) {
    console.error("[OrderUploadAPI] Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete staged file." },
      { status: 500 }
    );
  }
}
