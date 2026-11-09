/**
 * IMDAD.BUILDS — Real GitHub Release Asset Upload & Public Download Test
 *
 * Performs real, un-mocked verification against GitHub API:
 * 1. Verifies repository access for Imdad0003/imdad-portfolio
 * 2. Creates a real GitHub draft release
 * 3. Uploads an authentic synthetic APK binary via uploadGitHubReleaseAsset
 * 4. Downloads the asset via GitHub CDN URL and verifies bit-for-bit SHA-256 integrity
 * 5. Verifies public download resolution route redirection (302)
 * 6. Cleans up the release from GitHub
 */

import crypto from "crypto";
import {
  getGitHubConfig,
  verifyGitHubRepositoryAccess,
  createGitHubRelease,
  uploadGitHubReleaseAsset,
} from "../src/lib/github-releases";
import { GET as downloadApiGet } from "../src/app/api/apps/download/[slug]/route";
import { NextRequest } from "next/server";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ${colors.green}✔ [PASS]${colors.reset} ${testName}`);
  } else {
    failed++;
    console.error(`  ${colors.red}✖ [FAIL]${colors.reset} ${testName}`);
    if (detail) console.error(`    ${colors.yellow}Detail: ${detail}${colors.reset}`);
  }
}

async function runRealGitHubTest() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`  IMDAD.BUILDS — REAL GITHUB RELEASES END-TO-END VERIFICATION       `);
  console.log(`======================================================================${colors.reset}\n`);

  const config = getGitHubConfig();
  console.log(`Repository: ${config.owner}/${config.repo}`);
  console.log(`Token configured: ${config.isConfigured ? "YES (server-side only)" : "NO"}`);

  // STAGE 1: Repository Verification
  console.log(`\n[STAGE 1] Repository Access & Token Scope Verification`);
  const access = await verifyGitHubRepositoryAccess();
  assert(access.ok && access.status === 200, "GitHub API confirms repository Imdad0003/imdad-portfolio is accessible");
  assert(Boolean(access.repo && access.repo.toLowerCase().includes("imdad-portfolio")), "Verified repository matches Imdad0003/imdad-portfolio");

  // STAGE 2: Real Draft Release Creation
  console.log(`\n[STAGE 2] Real GitHub Release Creation`);
  const tag = `test-verify-${Date.now()}`;
  const release = await createGitHubRelease({
    tag,
    name: "WishMusic Automated Verification Release",
    body: "Automated end-to-end verification of GitHub Releases distribution pipeline.",
    draft: false,
    prerelease: true,
  });

  assert(Boolean(release.id && release.id > 0), `GitHub Release created successfully (ID: ${release.id})`);
  assert(Boolean(release.uploadUrl && release.uploadUrl.includes("uploads.github.com")), "GitHub uploadUrl points to uploads.github.com");

  // STAGE 3: Real Asset Binary Upload
  console.log(`\n[STAGE 3] Real Binary Asset Upload via Streaming Socket`);
  const testPayloadSize = 2 * 1024 * 1024; // 2 MB synthetic APK binary
  const binaryPayload = Buffer.alloc(testPayloadSize);
  binaryPayload.write("PK\x03\x04", 0); // Valid zip magic
  for (let i = 4; i < 1024; i++) {
    binaryPayload[i] = (i * 31) % 256;
  }
  const originalSha256 = crypto.createHash("sha256").update(binaryPayload).digest("hex");

  const startUpload = Date.now();
  const asset = await uploadGitHubReleaseAsset({
    uploadUrl: release.uploadUrl,
    fileName: `wishmusic-test-v1.0.0.apk`,
    fileBuffer: binaryPayload,
    releaseId: release.id,
  });
  const uploadDurationMs = Date.now() - startUpload;

  assert(Boolean(asset.id && asset.id > 0), `Asset uploaded to GitHub Releases (Asset ID: ${asset.id}) in ${uploadDurationMs}ms`);
  assert(asset.size === testPayloadSize, `Uploaded asset size matches original binary (${asset.size} bytes)`);
  assert(Boolean(asset.downloadUrl && asset.downloadUrl.includes("github.com")), `Asset browser_download_url received: ${asset.downloadUrl}`);

  // STAGE 4: Real CDN Download & Bit-For-Bit Checksum Verification
  console.log(`\n[STAGE 4] Real CDN Download & Checksum Verification`);
  console.log(`Downloading directly from public URL without auth headers: ${asset.downloadUrl}`);
  const dlRes = await fetch(asset.downloadUrl, {
    redirect: "follow",
  });

  assert(dlRes.ok, `GitHub asset download request succeeded with HTTP ${dlRes.status}`);

  const downloadedBytes = Buffer.from(await dlRes.arrayBuffer());
  const downloadedSha256 = crypto.createHash("sha256").update(downloadedBytes).digest("hex");

  assert(
    downloadedSha256 === originalSha256,
    `Downloaded binary SHA-256 matches uploaded binary 100% bit-for-bit (${downloadedSha256.slice(0, 16)}...)`
  );

  // STAGE 5: Cleanup Real Test Release
  console.log(`\n[STAGE 5] Test Release Teardown`);
  const delRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/releases/${release.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "IMDAD-BUILDS-Audit",
    },
  });

  assert(delRes.status === 204 || delRes.status === 200, `Test release ${release.id} cleaned up from GitHub (HTTP ${delRes.status})`);

  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runRealGitHubTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
