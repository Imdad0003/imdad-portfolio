/**
 * Direct client-side unsigned upload to Cloudinary.
 * Used for admin media assets (app logos, project covers, screenshots, etc.)
 * eliminating Firebase Storage Blaze dependencies.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: "fhyy9rxd",
  uploadPreset: "imdad_unsigned",
  uploadEndpoint: "https://api.cloudinary.com/v1_1/fhyy9rxd/image/upload",
} as const;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: {
    message: string;
  };
}

export async function uploadToCloudinary(
  file: File,
  options?: {
    folder?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  if (options?.onProgress && typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", CLOUDINARY_CONFIG.uploadEndpoint);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
            resolve(data.secure_url);
          } else {
            const msg = data.error?.message || `Upload failed with status ${xhr.status}`;
            reject(new Error(msg));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err instanceof Error ? err.message : String(err)}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during Cloudinary upload"));
      };

      xhr.send(formData);
    });
  }

  const res = await fetch(CLOUDINARY_CONFIG.uploadEndpoint, {
    method: "POST",
    body: formData,
  });

  const data: CloudinaryUploadResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.error?.message || `Cloudinary upload failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  if (!data.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }

  return data.secure_url;
}
