import {
  ref,
  deleteObject,
} from "firebase/storage";
import { storage, getFirebaseStorage } from "@/lib/firebase";
import { validateMediaFile } from "@/lib/asset-sanitizer";
import { uploadToCloudinary } from "@/lib/cloudinary";

export type AssetCategory = "apps" | "projects" | "services" | "general";

export interface UploadProgressInfo {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface ResumableUploadHandle {
  promise: Promise<string>;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

/**
 * Checks if media asset storage is available.
 * Client-side Cloudinary unsigned upload is always available.
 */
export function isStorageAvailable(): boolean {
  return true;
}

/**
 * Upload an asset with progress tracking, client-side validation,
 * and direct unsigned Cloudinary storage.
 *
 * @param file - The HTML File object to upload
 * @param category - Category folder ("apps" | "projects" | "services" | "general")
 * @param options - Additional options (custom subfolder, progress callback, allowVideo)
 */
export function uploadStudioAssetResumable(
  file: File,
  category: AssetCategory = "general",
  options?: {
    subfolder?: string;
    onProgress?: (progress: UploadProgressInfo) => void;
    allowVideo?: boolean;
  }
): ResumableUploadHandle {
  let isCancelled = false;
  const folder = `studio-assets/${category}${options?.subfolder ? `/${options.subfolder.replace(/^\/+|\/+$/g, "")}` : ""}`;

  const promise = new Promise<string>((resolve, reject) => {
    validateMediaFile(file, { allowVideo: options?.allowVideo ?? true })
      .then((valResult) => {
        if (!valResult.valid) {
          reject(new Error(valResult.error || "File validation failed."));
          return;
        }

        if (isCancelled) {
          reject(new Error("Upload cancelled by user."));
          return;
        }

        uploadToCloudinary(file, {
          folder,
          onProgress: (percent) => {
            if (options?.onProgress) {
              const bytesTransferred = Math.round((file.size * percent) / 100);
              options.onProgress({
                percentage: percent,
                bytesTransferred,
                totalBytes: file.size,
              });
            }
          },
        })
          .then((url) => {
            if (isCancelled) {
              reject(new Error("Upload cancelled by user."));
            } else {
              resolve(url);
            }
          })
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });

  return {
    promise,
    cancel: () => {
      isCancelled = true;
    },
    pause: () => {},
    resume: () => {},
  };
}

/**
 * Standard upload asset wrapper using direct Cloudinary unsigned upload.
 *
 * @param file - The HTML File object to upload
 * @param category - Category folder ("apps" | "projects" | "services" | "general")
 * @returns The public HTTPS download URL for the uploaded asset
 */
export async function uploadStudioAsset(
  file: File,
  category: AssetCategory = "general"
): Promise<string> {
  return uploadToCloudinary(file, { folder: `studio-assets/${category}` });
}

/**
 * Deletes an uploaded asset if it resides in Firebase Storage.
 * Cloudinary assets do not require deletion from client.
 */
export async function deleteStudioAsset(urlOrPath: string): Promise<void> {
  if (urlOrPath.includes("cloudinary.com")) {
    // Cloudinary unsigned upload deletion is restricted on client for security
    return;
  }

  const storageInstance = storage || getFirebaseStorage();
  if (!storageInstance) {
    return;
  }

  try {
    let storagePath = urlOrPath;

    // If it's a full Firebase Storage download URL, extract the object path
    if (urlOrPath.includes("firebasestorage.googleapis.com")) {
      const match = urlOrPath.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        storagePath = decodeURIComponent(match[1]);
      }
    }

    const fileRef = ref(storageInstance, storagePath);
    await deleteObject(fileRef);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Storage delete notice (asset may already be removed):", errorMsg);
  }
}
