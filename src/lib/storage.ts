import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export type AssetCategory = "apps" | "projects" | "services" | "general";

/**
 * Checks if Firebase Storage instance is initialized and available.
 */
export function isStorageAvailable(): boolean {
  return Boolean(storage);
}

/**
 * Upload an image asset to Firebase Storage under the appropriate category path.
 * Enforces size (< 10MB) and image MIME type constraints matching storage.rules.
 *
 * @param file - The HTML File object to upload
 * @param category - Category folder ("apps" | "projects" | "services" | "general")
 * @returns The public HTTPS download URL for the uploaded asset
 */
export async function uploadStudioAsset(
  file: File,
  category: AssetCategory = "general"
): Promise<string> {
  if (!storage) {
    throw new Error(
      "Firebase Storage is not initialized. Please verify storageBucket in your Firebase configuration."
    );
  }

  // Validate image type
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Only image files (JPEG, PNG, WebP, SVG) are allowed.");
  }

  // Validate size (10MB limit matching storage.rules)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 10MB limit. Please upload an optimized image.");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filePath = `studio-assets/${category}/${Date.now()}_${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      category,
    },
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}
