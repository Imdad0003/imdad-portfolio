/**
 * Authenticated, server-validated Cloudinary upload for admin media assets.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: "fhyy9rxd",
  uploadEndpoint: "/api/admin/media",
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
  const folderParts = options?.folder?.split("/").filter(Boolean) || [];
  const studioAssetsIndex = folderParts.indexOf("studio-assets");
  const category = (studioAssetsIndex >= 0 ? folderParts[studioAssetsIndex + 1] : folderParts[0]) || "general";
  formData.append("category", category);

  // The API is intentionally admin-only. Obtain a fresh Firebase ID token at the
  // boundary instead of trusting a client-supplied user identity in the body.
  const { auth } = await import("@/lib/firebase");
  const idToken = await auth?.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error("Administrator authentication is required to upload media.");
  }

  if (options?.onProgress && typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", CLOUDINARY_CONFIG.uploadEndpoint);
      xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as { asset?: { url?: string }; error?: string };
          if (xhr.status >= 200 && xhr.status < 300 && data.asset?.url) {
            resolve(data.asset.url);
          } else {
            const msg = data.error || `Upload failed with status ${xhr.status}`;
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
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({})) as { asset?: { url?: string }; error?: string };
  if (!res.ok) {
    const errorMsg = data?.error || `Cloudinary upload failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  if (!data.asset?.url) {
    throw new Error("Cloudinary response missing secure_url");
  }

  return data.asset.url;
}
