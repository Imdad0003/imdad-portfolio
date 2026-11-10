import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/admin/apps/releases/register/route";

function loadEnv() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const idx = t.indexOf("=");
      if (idx !== -1) {
        const k = t.slice(0, idx).trim();
        let v = t.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[k] = v;
      }
    }
  }
}

async function run() {
  loadEnv();
  console.log("\n========================================================");
  console.log("  TESTING ADMIN RELEASE REGISTRATION ENDPOINT");
  console.log("========================================================\n");

  const manifestPath = path.resolve(process.cwd(), "release-manifest.json");
  const validManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // TEST 1: Unauthenticated request rejection
  console.log("[TEST 1] Rejection of unauthenticated request");
  const unauthReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId: "wishmusic", manifest: validManifest }),
  });
  const unauthRes = await POST(unauthReq);
  if (unauthRes.status === 401 || unauthRes.status === 403) {
    console.log("  ✔ [PASS] Correctly rejected unauthenticated request (HTTP " + unauthRes.status + ")");
  } else {
    throw new Error(`Expected 401/403, got ${unauthRes.status}`);
  }

  // TEST 2: Missing manifest fields rejection
  console.log("\n[TEST 2] Rejection of malformed manifest");
  const malformedReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.ADMIN_SECRET_KEY || "",
    },
    body: JSON.stringify({ appId: "wishmusic", manifest: { ...validManifest, sha256: "" } }),
  });
  const malformedRes = await POST(malformedReq);
  if (malformedRes.status === 400) {
    console.log("  ✔ [PASS] Correctly rejected manifest with missing required fields (HTTP 400)");
  } else {
    throw new Error(`Expected 400, got ${malformedRes.status}`);
  }

  // TEST 3: Package mismatch rejection
  console.log("\n[TEST 3] Rejection of package name mismatch");
  const pkgMismatchReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.ADMIN_SECRET_KEY || "",
    },
    body: JSON.stringify({
      appId: "wishmusic",
      manifest: { ...validManifest, packageName: "com.malicious.fakeapp" },
    }),
  });
  const pkgMismatchRes = await POST(pkgMismatchReq);
  if (pkgMismatchRes.status === 400) {
    const data = await pkgMismatchRes.json();
    console.log("  ✔ [PASS] Package mismatch rejected: " + data.errors[0]);
  } else {
    throw new Error(`Expected 400, got ${pkgMismatchRes.status}`);
  }

  // TEST 4: Certificate fingerprint mismatch rejection
  console.log("\n[TEST 4] Rejection of unapproved signing certificate");
  const certMismatchReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.ADMIN_SECRET_KEY || "",
    },
    body: JSON.stringify({
      appId: "wishmusic",
      manifest: { ...validManifest, certificateFingerprintSha256: "00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF" },
    }),
  });
  const certMismatchRes = await POST(certMismatchReq);
  if (certMismatchRes.status === 400) {
    const data = await certMismatchRes.json();
    console.log("  ✔ [PASS] Certificate fingerprint mismatch rejected: " + data.errors[0]);
  } else {
    throw new Error(`Expected 400, got ${certMismatchRes.status}`);
  }

  // TEST 5: Real GitHub Asset verification
  console.log("\n[TEST 5] Live GitHub Asset Verification");
  const nonExistentReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": process.env.ADMIN_SECRET_KEY || "",
    },
    body: JSON.stringify({
      appId: "wishmusic",
      manifest: { ...validManifest, assetId: 999999999 },
    }),
  });
  const nonExistentRes = await POST(nonExistentReq);
  if (nonExistentRes.status === 400) {
    const data = await nonExistentRes.json();
    console.log("  ✔ [PASS] Correctly queried GitHub API and rejected non-existent asset: " + data.errors[0]);
  } else {
    throw new Error(`Expected 400, got ${nonExistentRes.status}`);
  }

  console.log("\n========================================================");
  console.log("  ALL REGISTRATION TESTS PASSED!                        ");
  console.log("========================================================\n");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
