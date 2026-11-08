import assert from "node:assert";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { validateMediaFile, sanitizeFileName, validateSvgContent } from "../src/lib/asset-sanitizer";
import { parseApk, validateApk } from "../src/lib/apk-parser";
import { getPublishedProjects, getPublishedProjectBySlug } from "../src/lib/cms";
import { NextRequest } from "next/server";
import { GET as getAdminProjects, POST as postAdminProjects, DELETE as deleteAdminProjects } from "../src/app/api/admin/projects/route";
import { GET as getPublicDownload } from "../src/app/api/apps/download/[slug]/route";
import { GET as getPublicReleases } from "../src/app/api/apps/releases/route";
import { ProjectDocument, GalleryItem } from "../src/types/cms";

// Set required env vars for testing
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imdadbuilds-ead39";
process.env.ADMIN_ALLOWED_EMAILS = "imdad.builds@gmail.com";
process.env.ADMIN_SECRET_KEY = "test_super_secret_admin_key_32_characters_long!";

let passedCount = 0;
let failedCount = 0;

function pass(name: string) {
  passedCount++;
  console.log(`  ✔ [PASS] ${name}`);
}

function fail(name: string, err: unknown) {
  failedCount++;
  console.error(`  ❌ [FAIL] ${name}:`, err);
}

// Helper to create synthetic APK binaries (same generator as verify-app-distribution)
function generateSelfSignedCert(commonName: string, orgName: string) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const cert = crypto.X509Certificate ? undefined : null;
  // Use crypto createCertificate if available, else synthetic DER
  const notBefore = new Date();
  const notAfter = new Date();
  notAfter.setFullYear(notBefore.getFullYear() + 25);

  return { privateKey, publicKey };
}

async function runPublishingVerification() {
  console.log("==========================================================");
  console.log("  IMDAD.BUILDS — ADVANCED PUBLISHING SYSTEM TEST SUITE    ");
  console.log("==========================================================");

  // ----------------------------------------------------------------------
  // GROUP 1: ASSET SANITIZATION & FILE SECURITY VALIDATION
  // ----------------------------------------------------------------------
  console.log("\n[TEST GROUP 1] Asset Sanitizer & Media Security");

  try {
    const raw = "My Project Screen (2026)/..\\special #1.png";
    const sanitized = sanitizeFileName(raw);
    assert.strictEqual(sanitized, "special__1.png", "Sanitizes traversal & special characters");
    pass("sanitizeFileName strips directory traversal and special characters");
  } catch (err) {
    fail("sanitizeFileName strips directory traversal and special characters", err);
  }

  try {
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="purple"/></svg>`;
    const res = validateSvgContent(cleanSvg);
    assert.strictEqual(res.safe, true, "Clean SVG must be marked safe");
    pass("validateSvgContent approves clean vector SVG without scripts");
  } catch (err) {
    fail("validateSvgContent approves clean vector SVG without scripts", err);
  }

  try {
    const dangerousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('XSS')</script></svg>`;
    const res = validateSvgContent(dangerousSvg);
    assert.strictEqual(res.safe, false, "SVG with script tag must be rejected");
    assert(res.reason?.includes("unsafe tag 'script'"), "Mentions unsafe script tag");
    pass("validateSvgContent strictly rejects SVGs containing <script> tags");
  } catch (err) {
    fail("validateSvgContent strictly rejects SVGs containing <script> tags", err);
  }

  try {
    const dangerousAttrSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10"/></svg>`;
    const res = validateSvgContent(dangerousAttrSvg);
    assert.strictEqual(res.safe, false, "SVG with onload must be rejected");
    assert(res.reason?.includes("event handlers"), "Mentions event handlers");
    pass("validateSvgContent strictly rejects SVGs containing inline event handlers (onload=)");
  } catch (err) {
    fail("validateSvgContent strictly rejects SVGs containing inline event handlers (onload=)", err);
  }

  try {
    const jsUriSvg = `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>Click</text></a></svg>`;
    const res = validateSvgContent(jsUriSvg);
    assert.strictEqual(res.safe, false, "SVG with javascript: URI must be rejected");
    pass("validateSvgContent strictly rejects SVGs containing executable javascript: URIs");
  } catch (err) {
    fail("validateSvgContent strictly rejects SVGs containing executable javascript: URIs", err);
  }

  // ----------------------------------------------------------------------
  // GROUP 2: PORTFOLIO PROJECT SCHEMA & PUBLISHING CONTROLS
  // ----------------------------------------------------------------------
  console.log("\n[TEST GROUP 2] Portfolio Project Schema & Publishing Controls");

  try {
    const publishedProjects = await getPublishedProjects();
    assert(Array.isArray(publishedProjects), "Must return an array of projects");
    assert(publishedProjects.length > 0, "Must return published projects");
    assert(publishedProjects.every((p) => p.published === true), "All returned projects must be published");
    pass("getPublishedProjects returns published portfolio projects");
  } catch (err) {
    fail("getPublishedProjects returns published portfolio projects", err);
  }

  try {
    const easyxo = await getPublishedProjectBySlug("easyxo-brand-ecosystem");
    assert(easyxo !== null, "Must resolve easyxo project");
    assert(easyxo?.name.toLowerCase().includes("easyxo"), "Project name contains EasyXO");
    assert((easyxo?.technologies?.length || 0) > 0, "Must contain technologies");
    pass("getPublishedProjectBySlug resolves existing published case study by slug");
  } catch (err) {
    fail("getPublishedProjectBySlug resolves existing published case study by slug", err);
  }

  try {
    const nonExistent = await getPublishedProjectBySlug("random-non-existent-project-999");
    assert.strictEqual(nonExistent, null, "Non-existent project must return null");
    pass("getPublishedProjectBySlug safely returns null for non-existent slug");
  } catch (err) {
    fail("getPublishedProjectBySlug safely returns null for non-existent slug", err);
  }

  // ----------------------------------------------------------------------
  // GROUP 3: ADMIN PROJECTS API AUTHORIZATION & VALIDATION
  // ----------------------------------------------------------------------
  console.log("\n[TEST GROUP 3] Admin Projects API Route Authorization");

  try {
    // 1. Unauthenticated GET
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/projects");
    const unauthRes = await getAdminProjects(unauthReq);
    assert(unauthRes.status === 401 || unauthRes.status === 403, "Unauthenticated GET must be 401/403");
    pass("GET /api/admin/projects strictly rejects unauthenticated requests (401/403)");
  } catch (err) {
    fail("GET /api/admin/projects strictly rejects unauthenticated requests (401/403)", err);
  }

  try {
    // 2. Unauthenticated POST
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Malicious Project" }),
    });
    const unauthRes = await postAdminProjects(unauthReq);
    assert(unauthRes.status === 401 || unauthRes.status === 403, "Unauthenticated POST must be 401/403");
    pass("POST /api/admin/projects strictly rejects unauthenticated writes (401/403)");
  } catch (err) {
    fail("POST /api/admin/projects strictly rejects unauthenticated writes (401/403)", err);
  }

  try {
    // 3. Authenticated POST with missing required fields
    const authHeaders = {
      Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
    const invalidReq = new NextRequest("http://localhost:3000/api/admin/projects", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ category: "Web Development" }), // missing name and slug
    });
    const invalidRes = await postAdminProjects(invalidReq);
    assert.strictEqual(invalidRes.status, 400, "Missing name/slug must return HTTP 400");
    const json = await invalidRes.json();
    assert(json.error?.includes("required"), "Error mentions required field");
    pass("POST /api/admin/projects validates required fields (name, slug) and rejects invalid payloads");
  } catch (err) {
    fail("POST /api/admin/projects validates required fields (name, slug) and rejects invalid payloads", err);
  }

  try {
    // 4. Authenticated POST creates a valid project payload with full metadata
    const testSlug = `automated-test-${Date.now()}`;
    const testProjectPayload = {
      id: `proj_test_${Date.now()}`,
      name: "Automated Test Project",
      slug: testSlug,
      category: "Web Development",
      tagline: "High-speed testing storefront",
      shortDescription: "Automated test project for publishing workflow verification.",
      description: "Full case study narrative for automated testing.",
      coverImage: "https://imdadbuild.space/og-image.png",
      logo: "https://imdadbuild.space/icon.png",
      technologies: ["Next.js 16", "React 19", "Tailwind CSS v4"],
      url: "https://example.com/demo",
      githubUrl: "https://github.com/imdad/test",
      completionDate: "November 2026",
      featured: true,
      seoTitle: "Automated Test Project | Case Study",
      seoDescription: "SEO meta description for testing.",
      galleryItems: [
        {
          id: "g1",
          url: "https://imdadbuild.space/screen1.png",
          caption: "Hero Section View",
          sortOrder: 0,
        },
        {
          id: "g2",
          url: "https://imdadbuild.space/screen2.png",
          caption: "Checkout Flow",
          sortOrder: 1,
        },
      ],
      published: true,
      publishingStatus: "published",
    };

    const authHeaders = {
      Authorization: `Bearer ${process.env.ADMIN_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const saveReq = new NextRequest("http://localhost:3000/api/admin/projects", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(testProjectPayload),
    });

    const saveRes = await postAdminProjects(saveReq);
    assert.strictEqual(saveRes.status, 200, "Valid project creation must return HTTP 200");
    const saveJson = await saveRes.json();
    assert(saveJson.success === true, "Must return success: true");
    assert.strictEqual(saveJson.project.slug, testSlug, "Slug is preserved");
    assert.strictEqual(saveJson.project.galleryItems.length, 2, "Gallery items preserved");
    pass("POST /api/admin/projects creates and publishes complete project with gallery and metadata");
  } catch (err) {
    fail("POST /api/admin/projects creates and publishes complete project with gallery and metadata", err);
  }

  // ----------------------------------------------------------------------
  // GROUP 4: PUBLIC APP DOWNLOAD & RELEASES SECURITY
  // ----------------------------------------------------------------------
  console.log("\n[TEST GROUP 4] Public App Download & Releases Endpoints");

  try {
    const releasesReq = new NextRequest("http://localhost:3000/api/apps/releases?appId=wishmusic");
    const releasesRes = await getPublicReleases(releasesReq);
    assert.strictEqual(releasesRes.status, 200, "Releases endpoint returns 200");
    const data = await releasesRes.json();
    assert.strictEqual(data.appId, "wishmusic");
    assert(Array.isArray(data.releases), "Releases must be an array");
    // All public releases must have status == published
    assert(data.releases.every((r: any) => r.status === "published"), "Public releases must only be published");
    pass("GET /api/apps/releases filters out any draft or private releases");
  } catch (err) {
    fail("GET /api/apps/releases filters out any draft or private releases", err);
  }

  try {
    const dlReq = new NextRequest("http://localhost:3000/api/apps/download/nonexistentapp");
    const dlRes = await getPublicDownload(dlReq, { params: Promise.resolve({ slug: "nonexistentapp" }) });
    assert.strictEqual(dlRes.status, 404, "Non-existent app download returns 404");
    pass("GET /api/apps/download/[slug] returns 404 for non-existent apps");
  } catch (err) {
    fail("GET /api/apps/download/[slug] returns 404 for non-existent apps", err);
  }

  console.log("\n==========================================================");
  console.log(`  RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==========================================================");

  process.exit(failedCount > 0 ? 1 : 0);
}

runPublishingVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
