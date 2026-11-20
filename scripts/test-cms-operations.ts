/**
 * Automated Functional QA: CMS Operations Verification Suite
 * Tests actual Firestore persistence, draft/publish lifecycle, media library safety, and project editing.
 */

import {
  getSiteContent,
  saveSiteContentDraft,
  publishSiteContent,
  saveProjectAdmin,
  getAllProjectsAdmin,
  deleteProjectAdmin,
  saveMediaAssetAdmin,
  getAllMediaAssetsAdmin,
  checkAssetUsage,
  deleteMediaAssetAdmin,
  defaultSiteContent,
} from "../src/lib/cms";
import type { ProjectDocument, SiteContentDocument, MediaAssetDocument } from "../src/types/cms";

function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        cleaned[k] = v.map((item) =>
          typeof item === "object" && item !== null ? cleanUndefined(item) : item
        );
      } else if (typeof v === "object" && v !== null) {
        cleaned[k] = cleanUndefined(v);
      } else {
        cleaned[k] = v;
      }
    }
  }
  return cleaned as Partial<T>;
}

async function runCMSOperationsTest() {
  console.log("================================================================================");
  console.log("🛠️ TESTING ACTUAL CMS OPERATIONS & FIRESTORE INTEGRATION");
  console.log("================================================================================\n");

  let checksPassed = 0;
  let totalChecks = 0;

  function assert(condition: boolean, title: string, detail?: string) {
    totalChecks++;
    if (condition) {
      checksPassed++;
      console.log(`✅ [PASS] Check ${totalChecks}: ${title}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Check ${totalChecks}: ${title}`);
      if (detail) console.error(`   └─ ${detail}`);
      throw new Error(`Assertion failed: ${title}`);
    }
  }

  // --------------------------------------------------------------------------------
  // 1. EDIT HOMEPAGE HEADLINE & SAVE DRAFT
  // --------------------------------------------------------------------------------
  console.log("--- 1. Testing Homepage Headline Edit & Draft Persistence ---");
  const initialPublic = await getSiteContent();
  const originalHeadline = initialPublic.hero.headline;
  console.log(`Initial public headline: "${originalHeadline}"`);

  const testDraftHeadline = "QA Test: Engineering High-Performance Digital Experiences";
  const draftPayload: Partial<SiteContentDocument> = {
    ...initialPublic,
    hero: {
      ...initialPublic.hero,
      headline: testDraftHeadline,
    },
  };

  console.log(`Saving raw draft with headline and potential undefined fields: "${testDraftHeadline}"...`);
  // Directly passes draftPayload with undefined fields - cms.ts must sanitize internally!
  await saveSiteContentDraft(draftPayload);
  console.log("Draft saved successfully.");

  // --------------------------------------------------------------------------------
  // 2. REFRESH AND VERIFY PERSISTENCE
  // --------------------------------------------------------------------------------
  console.log("\n--- 2. Verifying Draft Persistence vs Public Content ---");
  const fetchedDraft = await getSiteContent({ isDraft: true });
  assert(
    fetchedDraft.hero.headline === testDraftHeadline,
    "Draft headline successfully persisted in Firestore (siteContent/draft)",
    `Persisted Draft Headline: "${fetchedDraft.hero.headline}"`
  );

  const freshPublicCheck = await getSiteContent();
  assert(
    freshPublicCheck.hero.headline === originalHeadline,
    "Public homepage remains unaffected while changes remain in Draft state",
    `Public Headline: "${freshPublicCheck.hero.headline}"`
  );

  // --------------------------------------------------------------------------------
  // 3. PREVIEW CHANGES
  // --------------------------------------------------------------------------------
  console.log("\n--- 3. Verifying Change Preview ---");
  const hasDiff = fetchedDraft.hero.headline !== freshPublicCheck.hero.headline;
  assert(
    hasDiff,
    "Preview accurately isolates staged draft changes from public production data",
    `Draft: "${fetchedDraft.hero.headline}" vs Public: "${freshPublicCheck.hero.headline}"`
  );

  // --------------------------------------------------------------------------------
  // 4. PUBLISH AND VERIFY PUBLIC HOMEPAGE UPDATES
  // --------------------------------------------------------------------------------
  console.log("\n--- 4. Publishing Draft to Public Production ---");
  await publishSiteContent(draftPayload, "imdad.builds@gmail.com");
  console.log("Publish completed.");

  const publishedPublic = await getSiteContent();
  assert(
    publishedPublic.hero.headline === testDraftHeadline,
    "Public homepage now serves the published headline",
    `Published Headline: "${publishedPublic.hero.headline}"`
  );
  assert(
    publishedPublic.publishedBy === "imdad.builds@gmail.com",
    "Publisher metadata recorded properly",
    `Published By: ${publishedPublic.publishedBy} at ${publishedPublic.publishedAt}`
  );

  // Restore original headline
  console.log("Restoring original headline to keep production data clean...");
  const restoredPayload: Partial<SiteContentDocument> = {
    ...publishedPublic,
    hero: {
      ...publishedPublic.hero,
      headline: defaultSiteContent.hero.headline,
    },
  };
  await publishSiteContent(restoredPayload, "imdad.builds@gmail.com");
  const restoredPublic = await getSiteContent();
  assert(
    restoredPublic.hero.headline === defaultSiteContent.hero.headline,
    "Restored clean original headline on public homepage",
    `Clean Headline: "${restoredPublic.hero.headline}"`
  );

  // --------------------------------------------------------------------------------
  // 5. UPLOAD AND SELECT AN IMAGE (MEDIA LIBRARY)
  // --------------------------------------------------------------------------------
  console.log("\n--- 5. Testing Media Library Asset Registration ---");
  const testAssetId = "qa-test-asset-" + Date.now();
  const testAssetUrl = `https://res.cloudinary.com/test/image/upload/v12345/studio-assets/projects/${testAssetId}.webp`;

  const assetPayload: Partial<MediaAssetDocument> & { id: string } = {
    id: testAssetId,
    name: `project-cover-${testAssetId}.webp`,
    alt: "QA Test Project Cover",
    url: testAssetUrl,
    fileSize: 184500,
    width: 1920,
    height: 1080,
    format: "webp",
    category: "projects",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveMediaAssetAdmin(assetPayload);
  console.log(`Saved media asset "${testAssetId}".`);

  const allAssets = await getAllMediaAssetsAdmin();
  const foundAsset = allAssets.find((a) => a.id === testAssetId);
  assert(
    foundAsset !== undefined && foundAsset.url === testAssetUrl,
    "Media asset successfully indexed and retrievable via getAllMediaAssetsAdmin()",
    `Retrieved Asset ID: ${foundAsset?.id}, URL: ${foundAsset?.url}`
  );

  // --------------------------------------------------------------------------------
  // 6. EDIT AN EXISTING PROJECT
  // --------------------------------------------------------------------------------
  console.log("\n--- 6. Testing Project Management Editing & Persistence ---");
  const testProjectId = "qa-test-project-" + Date.now();
  const projectPayload: Partial<ProjectDocument> & { id: string } = {
    id: testProjectId,
    name: "QA Automated Test Case Study",
    slug: `qa-test-case-study-${Date.now()}`,
    shortDescription: "Validating project lifecycle and dependency tracking",
    description: "Detailed case study description for automated QA verification.",
    category: "Digital Platforms",
    technologies: ["Next.js 16", "React 19", "Cloud Firestore"],
    scope: ["Architecture", "UI/UX", "Fullstack Implementation"],
    deliverables: ["Responsive Web Platform", "Automated Testing Suite"],
    featured: false,
    sortOrder: 999,
    status: "COMPLETED",
    coverImage: testAssetUrl, // Link the media asset here!
    published: true,
  };

  await saveProjectAdmin(projectPayload);
  console.log(`Created test project "${testProjectId}" referencing test asset URL.`);

  let allProjects = await getAllProjectsAdmin();
  let foundProject = allProjects.find((p) => p.id === testProjectId);
  assert(
    foundProject !== undefined && foundProject.name === projectPayload.name,
    "New project document created in Firestore",
    `Found project: "${foundProject?.name}" (ID: ${foundProject?.id})`
  );

  // Edit the project
  const updatedProjectName = "QA Automated Test Case Study (Updated)";
  await saveProjectAdmin({
    id: testProjectId,
    name: updatedProjectName,
  });
  console.log("Updated project title in Firestore.");

  allProjects = await getAllProjectsAdmin();
  foundProject = allProjects.find((p) => p.id === testProjectId);
  assert(
    foundProject?.name === updatedProjectName,
    "Project document edit successfully updated and verified in Firestore",
    `Updated project name: "${foundProject?.name}"`
  );

  // --------------------------------------------------------------------------------
  // 7. TEST SAFE DELETION & DEPENDENCY PROTECTION
  // --------------------------------------------------------------------------------
  console.log("\n--- 7. Testing Safe Deletion & Dependency Protection ---");
  // Check usage
  console.log(`Checking usage of asset URL: ${testAssetUrl}...`);
  const usageBefore = await checkAssetUsage(testAssetUrl);
  assert(
    usageBefore.inUse === true && usageBefore.locations.length > 0,
    "Dependency detector correctly flags asset in active use",
    `In use: ${usageBefore.inUse}, Locations: ${usageBefore.locations.join(", ")}`
  );

  // Attempt deletion while referenced
  console.log("Attempting to delete referenced media asset...");
  const deleteAttempt1 = await deleteMediaAssetAdmin(testAssetId, testAssetUrl);
  assert(
    deleteAttempt1.success === false && Boolean(deleteAttempt1.error),
    "Media library blocked deletion of asset in active use (Safe Deletion Protection)",
    `Rejection notice: "${deleteAttempt1.error}"`
  );

  // Clean up reference: Delete the test project
  console.log("Cleaning up referencing test project...");
  await deleteProjectAdmin(testProjectId);
  console.log(`Deleted test project "${testProjectId}".`);

  // Re-check usage
  const usageAfter = await checkAssetUsage(testAssetUrl);
  assert(
    usageAfter.inUse === false,
    "Dependency tracker confirms asset has 0 active references after project removal",
    `In use: ${usageAfter.inUse}`
  );

  // Delete asset now that references are clear
  console.log("Deleting unreferenced media asset...");
  const deleteAttempt2 = await deleteMediaAssetAdmin(testAssetId, testAssetUrl);
  assert(
    deleteAttempt2.success === true,
    "Asset cleanly deleted after references resolved",
    `Delete result: success = ${deleteAttempt2.success}`
  );

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${checksPassed}/${totalChecks} CMS OPERATIONS TESTS PASSED WITH 100% SUCCESS!`);
  console.log("================================================================================\n");
}

runCMSOperationsTest().catch((err) => {
  console.error("CMS Test Failure:", err);
  process.exit(1);
});
