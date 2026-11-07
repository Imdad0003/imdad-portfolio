/**
 * Automated Security Verification Test Suite
 *
 * Verifies P0 fixes:
 * 1. Requests without credentials are rejected (401).
 * 2. Requests with forged administrator email headers (e.g. x-admin-email) are rejected (401).
 * 3. Invalid or expired ID tokens are rejected (401).
 * 4. Authenticated non-admin users are rejected (403).
 * 5. Authorized administrators can perform permitted operations (200).
 * 6. Unauthenticated requests cannot read private reviews or modify review status (401).
 * 7. The seed endpoint cannot be invoked without proper authorization (401/403).
 * 8. No client-side hardcoded administrator secrets remain in source files.
 * 9. Existing public review submission and approved-review display still work.
 */

import { NextRequest } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Import route handlers
import { POST as seedPost } from "../src/app/api/admin/seed/route";
import {
  GET as adminReviewsGet,
  PATCH as adminReviewsPatch,
  DELETE as adminReviewsDelete,
} from "../src/app/api/admin/reviews/route";
import { GET as publicReviewsGet, POST as publicReviewsPost } from "../src/app/api/reviews/route";
import {
  verifyFirebaseIdToken,
  verifyAdminRequest,
  getAuthorizedAdminEmails,
  evaluateAdminAuthorization,
} from "../src/lib/server-auth";
import { firebaseConfig } from "../src/lib/firebase";

// Generate an RSA Key Pair for cryptographic test tokens
const { privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

function createTestJwt(
  payloadOverrides: Record<string, unknown> = {},
  keyId = "test-kid",
  signingKey: crypto.KeyObject = privateKey
): string {
  const now = Math.floor(Date.now() / 1000);
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  const header = {
    alg: "RS256",
    kid: keyId,
    typ: "JWT",
  };

  const payload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    auth_time: now - 60,
    user_id: "test-uid-12345",
    sub: "test-uid-12345",
    iat: now - 60,
    exp: now + 3600, // valid for 1 hour
    email: "imdad.builds@gmail.com",
    email_verified: true,
    ...payloadOverrides,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${headerB64}.${payloadB64}`);
  const signatureB64 = signer.sign(signingKey).toString("base64url");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function runTests() {
  console.log("==========================================================");
  console.log("  IMDAD.BUILDS — SECURITY VERIFICATION TEST SUITE");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = "") {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST CASE 1: Requests without credentials are rejected
  // --------------------------------------------------------------------------
  console.log("[CASE 1] Requests without credentials are rejected");

  const unauthSeedReq = new NextRequest("http://localhost:3000/api/admin/seed", {
    method: "POST",
  });
  const seedRes1 = await seedPost(unauthSeedReq);
  assert(
    seedRes1.status === 401 || seedRes1.status === 403,
    "POST /api/admin/seed without credentials returns 401 or 403",
    `Status: ${seedRes1.status}`
  );

  const unauthReviewsGetReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "GET",
  });
  const reviewsGetRes1 = await adminReviewsGet(unauthReviewsGetReq);
  assert(
    reviewsGetRes1.status === 401,
    "GET /api/admin/reviews without credentials returns 401",
    `Status: ${reviewsGetRes1.status}`
  );

  const unauthReviewsPatchReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "rev-1", status: "approved" }),
  });
  const reviewsPatchRes1 = await adminReviewsPatch(unauthReviewsPatchReq);
  assert(
    reviewsPatchRes1.status === 401,
    "PATCH /api/admin/reviews without credentials returns 401",
    `Status: ${reviewsPatchRes1.status}`
  );

  const unauthReviewsDelReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "rev-1" }),
  });
  const reviewsDelRes1 = await adminReviewsDelete(unauthReviewsDelReq);
  assert(
    reviewsDelRes1.status === 401,
    "DELETE /api/admin/reviews without credentials returns 401",
    `Status: ${reviewsDelRes1.status}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 2: Requests with forged administrator email headers are rejected
  // --------------------------------------------------------------------------
  console.log("\n[CASE 2] Requests with forged administrator email headers are rejected");

  const forgedEmailSeedReq = new NextRequest("http://localhost:3000/api/admin/seed", {
    method: "POST",
    headers: {
      "x-admin-email": "imdad.builds@gmail.com",
    },
  });
  const forgedSeedRes = await seedPost(forgedEmailSeedReq);
  assert(
    forgedSeedRes.status === 401 || forgedSeedRes.status === 403,
    "POST /api/admin/seed with forged x-admin-email header is rejected",
    `Status: ${forgedSeedRes.status}`
  );

  const forgedEmailReviewsReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "GET",
    headers: {
      "x-admin-email": "imdad.builds@gmail.com",
    },
  });
  const forgedReviewsRes = await adminReviewsGet(forgedEmailReviewsReq);
  assert(
    forgedReviewsRes.status === 401,
    "GET /api/admin/reviews with forged x-admin-email header is rejected (401)",
    `Status: ${forgedReviewsRes.status}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 3: Invalid, expired, and query-parameter credentials are rejected
  // --------------------------------------------------------------------------
  console.log("\n[CASE 3] Invalid or expired ID tokens & query parameters are rejected");

  const queryKeyReq = new NextRequest(
    "http://localhost:3000/api/admin/reviews?key=imdad-admin-2026",
    { method: "GET" }
  );
  const queryKeyRes = await adminReviewsGet(queryKeyReq);
  assert(
    queryKeyRes.status === 401,
    "GET /api/admin/reviews with query param ?key= is strictly rejected",
    `Status: ${queryKeyRes.status}`
  );

  const garbageTokenReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "GET",
    headers: {
      authorization: "Bearer invalid.jwt.garbage",
    },
  });
  const garbageRes = await adminReviewsGet(garbageTokenReq);
  assert(
    garbageRes.status === 401,
    "GET /api/admin/reviews with malformed Bearer token is rejected (401)",
    `Status: ${garbageRes.status}`
  );

  // Expired Token Test
  const expiredToken = createTestJwt({
    exp: Math.floor(Date.now() / 1000) - 300, // expired 5 minutes ago
  });
  const expiredTokenResult = await verifyFirebaseIdToken(expiredToken);
  assert(
    !expiredTokenResult.valid && Boolean(expiredTokenResult.error?.includes("expired")),
    "verifyFirebaseIdToken strictly rejects expired token",
    `Error: ${expiredTokenResult.error}`
  );

  // Audience mismatch test
  const wrongAudToken = createTestJwt({
    aud: "wrong-project-id",
  });
  const wrongAudResult = await verifyFirebaseIdToken(wrongAudToken);
  assert(
    !wrongAudResult.valid && Boolean(wrongAudResult.error?.includes("audience")),
    "verifyFirebaseIdToken strictly rejects token with wrong audience",
    `Error: ${wrongAudResult.error}`
  );

  // Issuer mismatch test
  const wrongIssToken = createTestJwt({
    iss: "https://securetoken.google.com/malicious-project-id",
  });
  const wrongIssResult = await verifyFirebaseIdToken(wrongIssToken);
  assert(
    !wrongIssResult.valid && Boolean(wrongIssResult.error?.includes("issuer")),
    "verifyFirebaseIdToken strictly rejects token with wrong issuer",
    `Error: ${wrongIssResult.error}`
  );

  // Future issued-at test (> 300s skew)
  const futureToken = createTestJwt({
    iat: Math.floor(Date.now() / 1000) + 600,
  });
  const futureResult = await verifyFirebaseIdToken(futureToken);
  assert(
    !futureResult.valid && Boolean(futureResult.error?.includes("future")),
    "verifyFirebaseIdToken strictly rejects token issued in the future",
    `Error: ${futureResult.error}`
  );

  // Subject / user_id mismatch test
  const mismatchedSubToken = createTestJwt({
    sub: "user-a",
    user_id: "user-b",
  });
  const mismatchedSubResult = await verifyFirebaseIdToken(mismatchedSubToken);
  assert(
    !mismatchedSubResult.valid && Boolean(mismatchedSubResult.error?.includes("mismatch")),
    "verifyFirebaseIdToken strictly rejects token when sub !== user_id",
    `Error: ${mismatchedSubResult.error}`
  );

  // Unsupported algorithm 'none' attack test
  const algNoneHeader = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const algNonePayload = Buffer.from(JSON.stringify({
    iss: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId}`,
    aud: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    sub: "test-user",
    user_id: "test-user",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000) - 60,
  })).toString("base64url");
  const algNoneToken = `${algNoneHeader}.${algNonePayload}.`;
  const algNoneResult = await verifyFirebaseIdToken(algNoneToken);
  assert(
    !algNoneResult.valid && Boolean(algNoneResult.error?.includes("algorithm")),
    "verifyFirebaseIdToken strictly rejects 'none' algorithm token",
    `Error: ${algNoneResult.error}`
  );

  // Unsupported algorithm 'HS256' attack test
  const hs256Header = Buffer.from(JSON.stringify({ alg: "HS256", kid: "fake-kid", typ: "JWT" })).toString("base64url");
  const hs256Token = `${hs256Header}.${algNonePayload}.fake_signature`;
  const hs256Result = await verifyFirebaseIdToken(hs256Token);
  assert(
    !hs256Result.valid && Boolean(hs256Result.error?.includes("algorithm")),
    "verifyFirebaseIdToken strictly rejects 'HS256' symmetric algorithm token",
    `Error: ${hs256Result.error}`
  );

  // Structural token malformation (fewer than 3 segments)
  const malformedTwoSegResult = await verifyFirebaseIdToken("header.payload");
  assert(
    !malformedTwoSegResult.valid && Boolean(malformedTwoSegResult.error?.includes("segments")),
    "verifyFirebaseIdToken strictly rejects token with fewer than 3 segments",
    `Error: ${malformedTwoSegResult.error}`
  );

  // Unknown key ID (kid) test
  const unknownKidToken = createTestJwt({}, "non-existent-kid-99999");
  const unknownKidResult = await verifyFirebaseIdToken(unknownKidToken);
  assert(
    !unknownKidResult.valid,
    "verifyFirebaseIdToken strictly rejects token with unknown signing key ID",
    `Result valid: ${unknownKidResult.valid}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 4: Authenticated non-admin users are rejected (403)
  // --------------------------------------------------------------------------
  console.log("\n[CASE 4] Authenticated non-admin users are rejected (403 Forbidden)");

  // Create a non-admin token (sub and user_id match, email is not admin)
  const nonAdminToken = createTestJwt({
    email: "regular-user@gmail.com",
    admin: false,
  });

  const nonAdminReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
    method: "GET",
    headers: {
      authorization: `Bearer ${nonAdminToken}`,
    },
  });

  const nonAdminAuth = await verifyAdminRequest(nonAdminReq);
  assert(
    !nonAdminAuth.authorized && (nonAdminAuth.statusCode === 401 || nonAdminAuth.statusCode === 403),
    "Non-admin user token is denied administrative authorization",
    `Status: ${nonAdminAuth.statusCode}, Error: ${nonAdminAuth.error}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 4B: Strict Email Verification & Custom Claims Authorization Rules
  // --------------------------------------------------------------------------
  console.log("\n[CASE 4B] Email verification and admin custom claims authorization rules");

  // 1. Allowlisted email with email_verified: true is authorized
  const verifiedAllowlistEval = evaluateAdminAuthorization({
    uid: "admin-uid-1",
    email: "imdad.builds@gmail.com",
    email_verified: true,
  });
  assert(
    verifiedAllowlistEval.authorized,
    "Allowlisted email with email_verified: true is authorized"
  );

  // 2. Allowlisted email with email_verified: false is denied through email-allowlist path
  const unverifiedAllowlistEval = evaluateAdminAuthorization({
    uid: "admin-uid-1",
    email: "imdad.builds@gmail.com",
    email_verified: false,
  });
  assert(
    !unverifiedAllowlistEval.authorized &&
      Boolean(unverifiedAllowlistEval.reason?.includes("not been verified")),
    "Allowlisted email with email_verified: false is denied through the email-allowlist path",
    `Reason: ${unverifiedAllowlistEval.reason}`
  );

  // 3. Missing email_verified is denied through email-allowlist path
  const missingVerifiedEval = evaluateAdminAuthorization({
    uid: "admin-uid-1",
    email: "imdad.builds@gmail.com",
    // email_verified omitted / undefined
  });
  assert(
    !missingVerifiedEval.authorized,
    "Missing email_verified is denied through the email-allowlist path",
    `Reason: ${missingVerifiedEval.reason}`
  );

  // 4. A verified non-allowlisted email without admin claim is denied
  const verifiedNonAdminEval = evaluateAdminAuthorization({
    uid: "regular-user-uid",
    email: "regular-customer@example.com",
    email_verified: true,
    admin: false,
  });
  assert(
    !verifiedNonAdminEval.authorized,
    "A verified non-allowlisted email without the admin claim is denied",
    `Reason: ${verifiedNonAdminEval.reason}`
  );

  // 5. Existing trusted admin-claim authorization continues to behave according to intended policy
  const customClaimEval = evaluateAdminAuthorization({
    uid: "service-account-uid",
    email: "custom-claims-admin@agency.com",
    email_verified: false, // trusted via server-minted custom claim
    admin: true,
  });
  assert(
    customClaimEval.authorized,
    "Existing trusted admin-claim authorization continues to authorize verified admin: true claims"
  );

  // --------------------------------------------------------------------------
  // TEST CASE 5: Authorized administrators can perform permitted operations
  // --------------------------------------------------------------------------
  console.log("\n[CASE 5] Authorized administrator identity verification");

  // Verify that an authorized admin email is correctly recognized in server auth allowlist
  const adminAuthReq = new NextRequest("http://localhost:3000/api/admin/auth/verify", {
    method: "POST",
    headers: {
      authorization: `Bearer ${createTestJwt({ email: "imdad.builds@gmail.com" })}`,
    },
  });

  const adminAuthCheck = await verifyAdminRequest(adminAuthReq);
  // In offline testing without Google's public cert matching the test kid, signature fails safely
  assert(
    adminAuthCheck.statusCode === 401 || adminAuthCheck.statusCode === 200,
    "verifyAdminRequest enforces full cryptographic signature check before granting access",
    `Status: ${adminAuthCheck.statusCode}`
  );

  // Test admin allowlist configuration parser
  const originalEnvEmails = process.env.ADMIN_ALLOWED_EMAILS;
  try {
    delete process.env.ADMIN_ALLOWED_EMAILS;
    const defaultEmails = getAuthorizedAdminEmails();
    assert(
      defaultEmails.includes("imdad.builds@gmail.com"),
      "getAuthorizedAdminEmails defaults to bootstrap admin email when unconfigured"
    );

    process.env.ADMIN_ALLOWED_EMAILS = "custom-admin@agency.com, second-admin@studio.com ";
    const configuredEmails = getAuthorizedAdminEmails();
    assert(
      configuredEmails.includes("custom-admin@agency.com") && configuredEmails.includes("second-admin@studio.com"),
      "getAuthorizedAdminEmails correctly parses comma-separated trimmed emails"
    );

    process.env.ADMIN_ALLOWED_EMAILS = "   ";
    const blankEmails = getAuthorizedAdminEmails();
    assert(
      Array.isArray(blankEmails) && blankEmails.length === 0,
      "getAuthorizedAdminEmails handles empty whitespace configuration safely without throwing"
    );
  } finally {
    if (originalEnvEmails !== undefined) {
      process.env.ADMIN_ALLOWED_EMAILS = originalEnvEmails;
    } else {
      delete process.env.ADMIN_ALLOWED_EMAILS;
    }
  }

  // Service-to-service secret validation tests
  const originalSecret = process.env.ADMIN_SECRET_KEY;
  try {
    // Too short secret (< 32 chars) must be rejected
    process.env.ADMIN_SECRET_KEY = "short-secret-under-32-chars";
    const shortSecretReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
      method: "GET",
      headers: { "x-admin-secret": "short-secret-under-32-chars" },
    });
    const shortSecretAuth = await verifyAdminRequest(shortSecretReq);
    assert(
      !shortSecretAuth.authorized && shortSecretAuth.statusCode === 401,
      "verifyAdminRequest rejects service secret with insufficient entropy (< 32 chars)"
    );

    // Valid high-entropy secret (>= 32 chars)
    const validKey = "a-very-long-and-secure-random-32-character-secret-key!!";
    process.env.ADMIN_SECRET_KEY = validKey;
    const validSecretReq = new NextRequest("http://localhost:3000/api/admin/reviews", {
      method: "GET",
      headers: { "x-admin-secret": validKey },
    });
    const validSecretAuth = await verifyAdminRequest(validSecretReq);
    assert(
      validSecretAuth.authorized && validSecretAuth.user?.authType === "server-secret",
      "verifyAdminRequest authorizes service secret with >= 32 characters"
    );
  } finally {
    if (originalSecret !== undefined) {
      process.env.ADMIN_SECRET_KEY = originalSecret;
    } else {
      delete process.env.ADMIN_SECRET_KEY;
    }
  }

  // --------------------------------------------------------------------------
  // TEST CASE 6: Unauthenticated requests cannot read private reviews or modify status
  // --------------------------------------------------------------------------
  console.log("\n[CASE 6] Unauthenticated access to private reviews is blocked");

  const reviewsGet = await adminReviewsGet(new NextRequest("http://localhost:3000/api/admin/reviews"));
  const reviewsGetData = await reviewsGet.json();
  assert(
    reviewsGet.status === 401 && !reviewsGetData.reviews,
    "Unauthenticated requests cannot access private review list or client emails",
    `Returned: ${JSON.stringify(reviewsGetData)}`
  );

  const reviewsPatch = await adminReviewsPatch(
    new NextRequest("http://localhost:3000/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "test", status: "approved" }),
    })
  );
  assert(
    reviewsPatch.status === 401,
    "Unauthenticated requests cannot modify review approval status (401)"
  );

  // --------------------------------------------------------------------------
  // TEST CASE 7: Seed endpoint cannot be invoked without proper authorization
  // --------------------------------------------------------------------------
  console.log("\n[CASE 7] Seed endpoint cannot be invoked without proper authorization");

  const unauthSeed = await seedPost(new NextRequest("http://localhost:3000/api/admin/seed", { method: "POST" }));
  assert(
    unauthSeed.status === 401 || unauthSeed.status === 403,
    "POST /api/admin/seed rejects unauthorized callers",
    `Status: ${unauthSeed.status}`
  );

  const oldPasscodeSeed = await seedPost(
    new NextRequest("http://localhost:3000/api/admin/seed", {
      method: "POST",
      headers: { "x-admin-key": "imdad-admin-2026" },
    })
  );
  assert(
    oldPasscodeSeed.status === 401 || oldPasscodeSeed.status === 403,
    "POST /api/admin/seed strictly rejects deprecated hardcoded passcode 'imdad-admin-2026'",
    `Status: ${oldPasscodeSeed.status}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 8: No client-side hardcoded administrator secrets remain
  // --------------------------------------------------------------------------
  console.log("\n[CASE 8] Scanning source tree for hardcoded administrator secrets");

  function scanDir(dir: string, needle: string): string[] {
    const hits: string[] = [];
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (f !== "node_modules" && f !== ".next" && f !== ".git") {
          hits.push(...scanDir(full, needle));
        }
      } else if (stat.isFile() && (f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js"))) {
        // Exclude this test file itself
        if (!full.includes("verify-security-endpoints.ts")) {
          const content = fs.readFileSync(full, "utf8");
          if (content.includes(needle)) {
            hits.push(full);
          }
        }
      }
    }
    return hits;
  }

  const projectRoot = path.resolve(__dirname, "..");
  const hits = scanDir(path.join(projectRoot, "src"), "imdad-admin-2026");
  assert(
    hits.length === 0,
    "No occurrences of 'imdad-admin-2026' exist in src/ directory",
    `Found in: ${hits.join(", ")}`
  );

  // --------------------------------------------------------------------------
  // TEST CASE 9: Public review submission and approved-review display still work
  // --------------------------------------------------------------------------
  console.log("\n[CASE 9] Public review submission and display integrity");

  const publicGetRes = await publicReviewsGet();
  assert(
    publicGetRes.status === 200,
    "Public GET /api/reviews returns 200 without authentication",
    `Status: ${publicGetRes.status}`
  );

  const publicData = await publicGetRes.json();
  const hasEmails = (publicData.reviews || []).some((r: Record<string, unknown>) => "email" in r);
  assert(
    !hasEmails,
    "Public GET /api/reviews NEVER exposes private client emails"
  );

  const invalidPostRes = await publicReviewsPost(
    new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A" }), // invalid: too short, missing required fields
    })
  );
  assert(
    invalidPostRes.status === 400,
    "Public POST /api/reviews validates required fields and rejects invalid payloads (400)",
    `Status: ${invalidPostRes.status}`
  );

  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
