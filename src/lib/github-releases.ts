/**
 * GitHub Releases Server-Side Client for Official App Distribution
 * Handles authenticated release creation and binary asset uploading without exposing tokens to client-side code.
 */

export interface GitHubConfig {
  token: string | null;
  owner: string;
  repo: string;
  isConfigured: boolean;
}

export interface CreateReleaseParams {
  tag: string;
  name: string;
  body: string;
  draft?: boolean;
  prerelease?: boolean;
}

export interface GitHubReleaseResponse {
  id: number;
  tagName: string;
  name: string;
  body: string;
  htmlUrl: string;
  uploadUrl: string;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
}

export interface UploadAssetParams {
  uploadUrl: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType?: string;
  releaseId?: number;
}

export interface GitHubAssetResponse {
  id: number;
  name: string;
  size: number;
  downloadUrl: string; // Direct browser download URL
  contentType: string;
  createdAt: string;
}

export function getGitHubConfig(): GitHubConfig {
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_RELEASE_TOKEN ||
    process.env.GITHUB_PAT ||
    null;

  const owner = process.env.GITHUB_OWNER || "Imdad0003";
  const repo = process.env.GITHUB_REPO || "imdad-portfolio";

  return {
    token,
    owner,
    repo,
    isConfigured: Boolean(token && token.trim().length > 0),
  };
}

/**
 * Creates or retrieves a GitHub release by tag.
 */
export async function createGitHubRelease(
  params: CreateReleaseParams
): Promise<GitHubReleaseResponse> {
  const config = getGitHubConfig();
  if (!config.isConfigured || !config.token) {
    throw new Error(
      "GitHub Releases integration is not configured. Server environment variable GITHUB_TOKEN is missing."
    );
  }

  const endpoint = `https://api.github.com/repos/${config.owner}/${config.repo}/releases`;

  const payload = {
    tag_name: params.tag,
    target_commitish: "main",
    name: params.name,
    body: params.body,
    draft: params.draft ?? false,
    prerelease: params.prerelease ?? false,
    generate_release_notes: false,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "IMDAD-BUILDS-App-Release-Manager",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // If tag already exists, try fetching the existing release
    if (res.status === 422) {
      const getExisting = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/releases/tags/${encodeURIComponent(params.tag)}`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "IMDAD-BUILDS-App-Release-Manager",
          },
        }
      );
      if (getExisting.ok) {
        const data = await getExisting.json();
        return {
          id: data.id,
          tagName: data.tag_name,
          name: data.name,
          body: data.body,
          htmlUrl: data.html_url,
          uploadUrl: data.upload_url,
          draft: data.draft,
          prerelease: data.prerelease,
          createdAt: data.created_at,
        };
      }
    }

    const errText = await res.text();
    throw new Error(`GitHub Release creation failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    tagName: data.tag_name,
    name: data.name,
    body: data.body,
    htmlUrl: data.html_url,
    uploadUrl: data.upload_url,
    draft: data.draft,
    prerelease: data.prerelease,
    createdAt: data.created_at,
  };
}

import https from "node:https";

/**
 * Uploads an APK binary asset directly to the GitHub release.
 * Uses node:https with streaming socket writes and generous timeouts to prevent
 * undici/fetch HeadersTimeoutError (UND_ERR_HEADERS_TIMEOUT) on large APK binaries.
 */
export async function uploadGitHubReleaseAsset(
  params: UploadAssetParams
): Promise<GitHubAssetResponse> {
  const config = getGitHubConfig();
  if (!config.isConfigured || !config.token) {
    throw new Error("GitHub Token missing for asset upload.");
  }

  // uploadUrl is formatted like: https://uploads.github.com/repos/owner/repo/releases/123/assets{?name,label}
  const cleanUrl = params.uploadUrl.replace(/\{.*?\}/, "");
  const targetUrl = `${cleanUrl}?name=${encodeURIComponent(params.fileName)}`;
  const parsed = new URL(targetUrl);

  return new Promise<GitHubAssetResponse>((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "IMDAD-BUILDS-App-Release-Manager",
          "Content-Type": params.contentType || "application/octet-stream",
          "Content-Length": String(params.fileBuffer.length),
          Connection: "close",
        },
        timeout: 900000, // 15 minutes timeout for large binary uploads
      },
      (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", async () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(responseData);
              resolve({
                id: data.id,
                name: data.name,
                size: data.size,
                downloadUrl: data.browser_download_url,
                contentType: data.content_type,
                createdAt: data.created_at,
              });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              reject(new Error(`Failed to parse GitHub asset response (${msg}): ${responseData}`));
            }
          } else if (res.statusCode === 422 && params.releaseId) {
            // Asset duplicate recovery logic: safe idempotent recovery
            try {
              const listRes = await fetch(
                `https://api.github.com/repos/${config.owner}/${config.repo}/releases/${params.releaseId}/assets`,
                {
                  headers: {
                    Authorization: `Bearer ${config.token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                    "User-Agent": "IMDAD-BUILDS-App-Release-Manager",
                  },
                }
              );
              if (listRes.ok) {
                const assets: Array<{
                  id: number;
                  name: string;
                  size: number;
                  browser_download_url: string;
                  content_type: string;
                  created_at: string;
                }> = await listRes.json();
                const existing = assets.find((a) => a.name === params.fileName);
                if (existing) {
                  resolve({
                    id: existing.id,
                    name: existing.name,
                    size: existing.size,
                    downloadUrl: existing.browser_download_url,
                    contentType: existing.content_type,
                    createdAt: existing.created_at,
                  });
                  return;
                }
              }
            } catch (checkErr) {
              console.warn("Failed to check existing release assets on 422:", checkErr);
            }
            reject(new Error(`GitHub Release asset upload failed (422): ${responseData}`));
          } else {
            reject(new Error(`GitHub Release asset upload failed (${res.statusCode}): ${responseData}`));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("GitHub Release asset upload timed out."));
    });

    // Write fileBuffer directly to request stream
    req.end(params.fileBuffer);
  });
}

/**
 * Verifies repository accessibility and token permissions for APK distribution.
 */
export async function verifyGitHubRepositoryAccess(): Promise<{
  ok: boolean;
  status: number;
  message: string;
  repo?: string;
}> {
  const config = getGitHubConfig();
  if (!config.isConfigured || !config.token) {
    return {
      ok: false,
      status: 401,
      message: "GITHUB_TOKEN is not configured in server environment variables.",
    };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "IMDAD-BUILDS-App-Release-Manager",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        status: res.status,
        message: `Repository ${config.owner}/${config.repo} verified and accessible.`,
        repo: data.full_name,
      };
    }

    const err = await res.text();
    return {
      ok: false,
      status: res.status,
      message: `GitHub repository check failed (${res.status}): ${err}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 500,
      message: `Network failure connecting to GitHub API: ${msg}`,
    };
  }
}

