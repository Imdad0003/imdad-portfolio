import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { storage, getFirebaseStorage } from "@/lib/firebase";
import { validateMediaFile, sanitizeFileName } from "@/lib/asset-sanitizer";

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
  task: UploadTask;
}

/**
 * Checks if Firebase Storage instance is initialized and available.
 */
export function isStorageAvailable(): boolean {
  return Boolean(storage || getFirebaseStorage());
}

/**
 * Upload an asset to Firebase Storage with progress tracking, pause/cancel support,
 * and security sanitization.
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
  const storageInstance = storage || getFirebaseStorage();
  if (!storageInstance) {
    throw new Error(
      "Firebase Storage is not initialized. Please verify storageBucket in your Firebase configuration."
    );
  }

  const sub = options?.subfolder ? `${options.subfolder.replace(/^\/+|\/+$/g, "")}/` : "";
  const sanitizedName = sanitizeFileName(file.name);
  const filePath = `studio-assets/${category}/${sub}${Date.now()}_${sanitizedName}`;
  const storageRef = ref(storageInstance, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "application/octet-stream",
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      category,
    },
  });

  const promise = new Promise<string>((resolve, reject) => {
    // Perform pre-upload validation asynchronously
    validateMediaFile(file, { allowVideo: options?.allowVideo ?? true })
      .then((valResult) => {
        if (!valResult.valid) {
          uploadTask.cancel();
          reject(new Error(valResult.error || "File validation failed."));
          return;
        }

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percentage = snapshot.totalBytes > 0
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              : 0;
            if (options?.onProgress) {
              options.onProgress({
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                percentage,
              });
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      })
      .catch((err) => {
        uploadTask.cancel();
        reject(err);
      });
  });

  return {
    promise,
    cancel: () => uploadTask.cancel(),
    pause: () => uploadTask.pause(),
    resume: () => uploadTask.resume(),
    task: uploadTask,
  };
}

/**
 * Standard upload asset wrapper for backwards compatibility.
 *
 * @param file - The HTML File object to upload
 * @param category - Category folder ("apps" | "projects" | "services" | "general")
 * @returns The public HTTPS download URL for the uploaded asset
 */
export async function uploadStudioAsset(
  file: File,
  category: AssetCategory = "general"
): Promise<string> {
  const handle = uploadStudioAssetResumable(file, category);
  return handle.promise;
}

/**
 * Deletes an uploaded asset from Firebase Storage.
 * Accepts either a full download URL (extracts path) or a relative storage path.
 */
export async function deleteStudioAsset(urlOrPath: string): Promise<void> {
  const storageInstance = storage || getFirebaseStorage();
  if (!storageInstance) {
    throw new Error("Firebase Storage is not initialized.");
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
    console.warn("Storage delete error (asset may already be removed):", errorMsg);
  }
}
