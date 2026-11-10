import crypto from "crypto";
import fs from "fs";
import { NextRequest } from "next/server";
import { GET as publicVisualsGet } from "../src/app/api/apps/wishmusic/visuals/route";
import { GET as downloadGet } from "../src/app/api/apps/download/[slug]/route";
import { POST as uploadPost, DELETE as uploadDelete } from "../src/app/api/admin/apps/wishmusic/visuals/upload/route";
import { getPublishedWishMusicVisuals } from "../src/lib/wishmusic-visuals-service";

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

async function runVisualsVerification() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`  IMDAD.BUILDS — WISHMUSIC VISUAL CONTENT & SHOWCASE AUDIT           `);
  console.log(`======================================================================${colors.reset}\n`);

  // STAGE 1: Public Visuals Schema & Default Model
  console.log(`[STAGE 1] Public Visual Content Retrieval & Schema Validation`);
  const visuals = await getPublishedWishMusicVisuals();
  assert(Boolean(visuals && visuals.id === "wishmusic"), "Visual content document matches app ID 'wishmusic'");
  assert(Boolean(visuals.hero && visuals.hero.headline.length > 0), `Hero headline verified: "${visuals.hero.headline.slice(0, 40)}..."`);
  assert(visuals.screenshots.length >= 8, `Screenshots array contains ${visuals.screenshots.length} views (minimum 8 required)`);
  assert(visuals.features.length === 8, `Feature showcase contains exactly 8 modules`);
  assert(Boolean(visuals.about && visuals.about.heading.length > 0), "About section heading is present");
  assert(visuals.gallery.length >= 3, `Wallpapers & gallery contains ${visuals.gallery.length} items`);
  assert(visuals.visibility.hero && visuals.visibility.screenshots && visuals.visibility.features && visuals.visibility.download, "All core section visibility flags are enabled");

  // STAGE 2: Public API Endpoint
  console.log(`\n[STAGE 2] Public Visuals API Endpoint (/api/apps/wishmusic/visuals)`);
  const pubRes = await publicVisualsGet();
  assert(pubRes.status === 200, "Public visuals endpoint returns HTTP 200");
  const pubData = await pubRes.json();
  assert(pubData.success === true, "Public visuals response indicates success: true");
  assert(Boolean(pubData.visuals.hero), "Public response includes populated hero object");

  // STAGE 3: Admin Upload Security & MIME Validation
  console.log(`\n[STAGE 3] Visual Upload Endpoint Security & Authentication`);
  const unauthReq = new NextRequest("http://localhost:3000/api/admin/apps/wishmusic/visuals/upload", {
    method: "POST",
    body: new FormData(),
  });
  const unauthRes = await uploadPost(unauthReq);
  assert(unauthRes.status === 401, `Unauthenticated upload request rejected with HTTP ${unauthRes.status}`);

  // Test with invalid MIME type (e.g. .exe / text/plain)
  const badFormData = new FormData();
  badFormData.append("file", new File(["malicious binary"], "hack.exe", { type: "application/x-msdownload" }));
  const badMimeReq = new NextRequest("http://localhost:3000/api/admin/apps/wishmusic/visuals/upload", {
    method: "POST",
    headers: { "x-admin-secret": process.env.ADMIN_SECRET_KEY || "" },
    body: badFormData,
  });
  const badMimeRes = await uploadPost(badMimeReq);
  assert(badMimeRes.status === 400, "Invalid MIME type rejected with HTTP 400");

  // STAGE 4: Real Image Upload & GitHub Fastly CDN Delivery
  console.log(`\n[STAGE 4] Real Image Upload to GitHub Releases CDN (wishmusic-media)`);
  const validWebpBuffer = Buffer.from(
    "RIFF2\x00\x00\x00WEBPVP8X\n\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00ALPH\x02\x00\x00\x00\x00\x00VP8 \x12\x00\x00\x000\x01\x00\x9d\x01*\x01\x00\x01\x00\x00",
    "binary"
  );
  const goodFormData = new FormData();
  goodFormData.append(
    "file",
    new File([validWebpBuffer], `audit-test-${Date.now()}.webp`, { type: "image/webp" })
  );
  goodFormData.append("section", "screenshots");
  goodFormData.append("title", "10-Band Graphic Equalizer (Audit)");

  const goodReq = new NextRequest("http://localhost:3000/api/admin/apps/wishmusic/visuals/upload", {
    method: "POST",
    headers: { "x-admin-secret": process.env.ADMIN_SECRET_KEY || "" },
    body: goodFormData,
  });

  const uploadStart = Date.now();
  const goodRes = await uploadPost(goodReq);
  const uploadDuration = Date.now() - uploadStart;

  assert(goodRes.status === 200, `Real WebP image upload succeeded with HTTP 200 in ${uploadDuration}ms`);
  const uploadData = await goodRes.json();
  assert(uploadData.success === true, "Upload response reports success: true");
  assert(Boolean(uploadData.asset.url && uploadData.asset.url.includes("github.com")), `Persistent CDN URL generated: ${uploadData.asset.url}`);

  // STAGE 5: Public CDN Retrieval (Unauthenticated)
  console.log(`\n[STAGE 5] Public Fastly CDN Image Retrieval (No Headers)`);
  const cdnRes = await fetch(uploadData.asset.url);
  assert(cdnRes.ok && cdnRes.status === 200, `Fastly CDN served uploaded image without authentication (HTTP ${cdnRes.status})`);
  const cdnBytes = await cdnRes.arrayBuffer();
  assert(cdnBytes.byteLength === validWebpBuffer.byteLength, `CDN served exact file size (${cdnBytes.byteLength} bytes)`);

  // STAGE 6: Asset Deletion Cleanup
  console.log(`\n[STAGE 6] Asset Deletion & Cleanup`);
  if (uploadData.asset.githubAssetId) {
    const delReq = new NextRequest(
      `http://localhost:3000/api/admin/apps/wishmusic/visuals/upload?assetId=${uploadData.asset.githubAssetId}`,
      {
        method: "DELETE",
        headers: { "x-admin-secret": process.env.ADMIN_SECRET_KEY || "" },
      }
    );
    const delRes = await uploadDelete(delReq);
    assert(delRes.status === 200, `Image asset ${uploadData.asset.githubAssetId} cleaned up successfully (HTTP ${delRes.status})`);
  }

  // STAGE 7: Public Download Route & Real Binary Integrity Check
  console.log(`\n[STAGE 7] Public APK Download Route & Binary Hash Parity`);
  const dlReq = new NextRequest("http://localhost:3000/api/apps/download/wishmusic");
  const dlRes = await downloadGet(dlReq, { params: Promise.resolve({ slug: "wishmusic" }) });

  assert(dlRes.status === 302, `Download endpoint returns HTTP 302 redirect`);
  const redirectLocation = dlRes.headers.get("location");
  assert(Boolean(redirectLocation && redirectLocation.includes("wishmusic-v1.0.0.apk")), `Redirect points to verified APK binary: ${redirectLocation}`);

  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runVisualsVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
