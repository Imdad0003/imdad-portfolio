/**
 * IMDAD.BUILDS — Firebase Storage Security Rules & Asset Guard Audit
 *
 * Performs static and logical security analysis on storage.rules and client-side sanitizers:
 * 1. Storage Rules parsing & structure verification
 * 2. Scoped public read enforcement (studio-assets only, staging strictly private)
 * 3. Safe deletion check (ensures request.resource is never accessed on delete)
 * 4. Size and MIME restrictions (images <= 15MB, videos <= 50MB, APKs <= 150MB)
 * 5. Stored XSS defense on vector graphics (SVG script, entity obfuscation, event handlers)
 * 6. Fallback default deny on unmapped paths
 */

import fs from "fs";
import path from "path";
import {
  validateSvgContent,
  sanitizeFileName,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_MEDIA_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "../src/lib/asset-sanitizer";

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

async function auditStorageSecurity() {
  console.log(`\n${colors.bold}${colors.cyan}==========================================================`);
  console.log(`  IMDAD.BUILDS — STORAGE SECURITY & RULES AUDIT           `);
  console.log(`==========================================================${colors.reset}\n`);

  const storageRulesPath = path.resolve(process.cwd(), "storage.rules");
  assert(fs.existsSync(storageRulesPath), "storage.rules file exists in project root");

  const rulesContent = fs.readFileSync(storageRulesPath, "utf8");

  // -------------------------------------------------------------
  // TEST GROUP 1: Storage Rules Logical Structure
  // -------------------------------------------------------------
  console.log(`[STAGE 1] Security Rules Syntax & Administrative Controls`);

  assert(
    rulesContent.includes("function isAdmin()"),
    "isAdmin() helper function is defined in storage.rules"
  );
  assert(
    rulesContent.includes("imdad.builds@gmail.com"),
    "isAdmin() strictly binds to authorized admin email (imdad.builds@gmail.com)"
  );
  assert(
    rulesContent.includes("request.auth.token.admin == true"),
    "isAdmin() verifies admin custom claim"
  );

  // -------------------------------------------------------------
  // TEST GROUP 2: Safe Deletion & Null-Safety Handling
  // -------------------------------------------------------------
  console.log(`\n[STAGE 2] Delete Operations & request.resource Null-Safety`);

  // Ensure 'allow delete' never checks request.resource
  const lines = rulesContent.split("\n");
  let deleteRuleHasResourceCheck = false;
  for (const line of lines) {
    if (line.includes("allow delete:") && line.includes("request.resource")) {
      deleteRuleHasResourceCheck = true;
    }
  }
  assert(
    !deleteRuleHasResourceCheck,
    "No 'allow delete' rule inspects request.resource (prevents runtime null crashes on delete)"
  );

  assert(
    rulesContent.includes("allow delete: if isAdmin();"),
    "Administrative deletion is explicitly isolated with 'allow delete: if isAdmin();'"
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: Scoped Access & Private APK Isolation
  // -------------------------------------------------------------
  console.log(`\n[STAGE 3] Storage Scoping & Staging APK Privacy`);

  // Check that staging APKs are NOT publicly readable
  const stagingApkMatch = rulesContent.match(/match \/staging\/apk\/\{appId\}\/\{fileName\} \{([\s\S]*?)\}/);
  assert(Boolean(stagingApkMatch), "match /staging/apk/{appId}/{fileName} block is defined");

  if (stagingApkMatch) {
    const stagingBlock = stagingApkMatch[1];
    assert(
      stagingBlock.includes("allow read: if isAdmin();"),
      "Staging APK binaries are strictly private to administrators (allow read: if isAdmin())"
    );
    assert(
      !stagingBlock.includes("allow read: if true"),
      "Public read is strictly prohibited for staging APK binaries"
    );
    assert(
      stagingBlock.includes("150 * 1024 * 1024"),
      "Staging APK uploads enforce maximum size limit of 150 MB"
    );
  }

  // Check that studio assets are public read, admin write
  const studioAssetsMatch = rulesContent.match(/match \/studio-assets\/\{allPaths=\*\*\} \{([\s\S]*?)\}/);
  assert(Boolean(studioAssetsMatch), "match /studio-assets/{allPaths=**} block is defined");

  if (studioAssetsMatch) {
    const studioBlock = studioAssetsMatch[1];
    assert(
      studioBlock.includes("allow read: if true;"),
      "Studio assets allow public read for published portfolio/app media"
    );
    assert(
      studioBlock.includes("allow create, update: if isAdmin()"),
      "Studio asset modifications require administrator authentication"
    );
  }

  // Default deny fallback
  const fallbackMatch = rulesContent.match(/match \/\{allPaths=\*\*\} \{([\s\S]*?)\}/);
  assert(Boolean(fallbackMatch), "Root wildcard fallback match /{allPaths=**} exists");

  if (fallbackMatch) {
    const fallbackBlock = fallbackMatch[1];
    assert(
      fallbackBlock.includes("allow read, write: if false;"),
      "Root wildcard enforces default deny (allow read, write: if false;)"
    );
  }

  // -------------------------------------------------------------
  // TEST GROUP 4: MIME Whitelist & Stored XSS Mitigation
  // -------------------------------------------------------------
  console.log(`\n[STAGE 4] MIME Type Whitelist & Advanced Stored XSS Prevention`);

  assert(
    ALLOWED_IMAGE_TYPES.includes("image/jpeg") &&
    ALLOWED_IMAGE_TYPES.includes("image/png") &&
    ALLOWED_IMAGE_TYPES.includes("image/webp") &&
    ALLOWED_IMAGE_TYPES.includes("image/svg+xml"),
    "Asset sanitizer whitelists JPEG, PNG, WEBP, and sanitized SVG"
  );

  assert(
    MAX_IMAGE_SIZE_BYTES === 15 * 1024 * 1024,
    "Maximum image size boundary is strictly set to 15 MB"
  );
  assert(
    MAX_VIDEO_SIZE_BYTES === 50 * 1024 * 1024,
    "Maximum video size boundary is strictly set to 50 MB"
  );

  // SVG Security: Script tag injection
  const scriptSvg = `<svg viewBox="0 0 100 100"><script>alert(1)</script></svg>`;
  assert(!validateSvgContent(scriptSvg).safe, "SVG with <script> tag is strictly rejected");

  // SVG Security: Inline event handler
  const onloadSvg = `<svg viewBox="0 0 100 100" onload="fetch('/steal')"></svg>`;
  assert(!validateSvgContent(onloadSvg).safe, "SVG with inline onload= handler is strictly rejected");

  // SVG Security: javascript: href
  const hrefSvg = `<svg><a href="javascript:alert(document.cookie)"><circle r="10"/></a></svg>`;
  assert(!validateSvgContent(hrefSvg).safe, "SVG with javascript: URL is strictly rejected");

  // SVG Security: Obfuscated HTML entities (j&#x61;vascript:)
  const obfuscatedSvg = `<svg><a href="j&#x61;vascript:alert(1)"><circle r="10"/></a></svg>`;
  assert(!validateSvgContent(obfuscatedSvg).safe, "SVG with XML entity-encoded javascript: URL is strictly rejected");

  // SVG Security: Dangerous foreignObject or iframe tags
  const foreignSvg = `<svg><foreignObject width="100" height="100"><iframe src="http://evil.com"/></foreignObject></svg>`;
  assert(!validateSvgContent(foreignSvg).safe, "SVG with <foreignObject> or <iframe> is strictly rejected");

  // SVG Security: CSS @import inside <style>
  const cssSvg = `<svg><style>@import 'http://evil.com/xss.css';</style></svg>`;
  assert(!validateSvgContent(cssSvg).safe, "SVG with CSS @import in <style> tag is strictly rejected");

  // Clean SVG passes
  const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#935073"/></svg>`;
  assert(validateSvgContent(cleanSvg).safe, "Authentic vector SVG with clean geometry passes validation");

  console.log(`\n${colors.bold}${colors.cyan}==========================================================`);
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==========================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

auditStorageSecurity().catch((err) => {
  console.error("Storage audit failed:", err);
  process.exit(1);
});
