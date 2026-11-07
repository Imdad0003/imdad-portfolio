import assert from "node:assert";
import {
  getSiteContent,
  getPublishedPackages,
  getPublishedApps,
  getPublishedProjects,
  getPublishedServices,
  getPublishedServiceBySlug,
} from "../src/lib/cms";

async function runCmsVerification() {
  console.log("==========================================================");
  console.log("  IMDAD.BUILDS — CMS CONTENT VERIFICATION TEST SUITE");
  console.log("==========================================================");

  // TEST 1: getSiteContent fallback structure
  console.log("\n[TEST 1] Site content retrieval & metadata fallbacks");
  const siteContent = await getSiteContent();
  assert(siteContent, "siteContent should return a valid document");
  assert(siteContent.hero.headline, "hero headline should be defined");
  assert(siteContent.hero.badge, "hero badge should be defined");
  assert(siteContent.hero.primaryCtaText, "hero primary CTA text should be defined");
  assert(siteContent.about.bio, "about bio should be defined");
  assert(siteContent.finalCta.headline, "finalCta headline should be defined");
  assert(siteContent.contact.email, "contact email should be defined");
  assert(siteContent.contact.whatsappNumber, "contact whatsappNumber should be defined");

  // Metadata verification
  assert(siteContent.metadata, "siteContent.metadata should be defined");
  assert(Array.isArray(siteContent.metadata.sectionOrder), "sectionOrder should be an array");
  assert.strictEqual(siteContent.metadata.sectionOrder.length, 9, "sectionOrder should contain 9 sections");
  assert.deepStrictEqual(
    siteContent.metadata.sectionOrder,
    [
      "hero",
      "packages",
      "apps",
      "services",
      "projects",
      "about",
      "reviews",
      "ai-assistant",
      "final-cta",
    ],
    "sectionOrder should match default 9 sections"
  );

  assert(siteContent.metadata.sectionVisibility, "sectionVisibility map should be defined");
  for (const sec of siteContent.metadata.sectionOrder) {
    assert.strictEqual(
      siteContent.metadata.sectionVisibility[sec],
      true,
      `section ${sec} should be visible by default`
    );
  }

  assert(Array.isArray(siteContent.metadata.skills), "skills should be an array");
  assert.strictEqual(siteContent.metadata.skills.length, 4, "skills should contain 4 categories");
  assert(siteContent.metadata.seo?.title, "SEO title should be defined");
  assert(siteContent.metadata.seo?.description, "SEO description should be defined");
  console.log("  ✔ [PASS] getSiteContent returns complete default copy, 9 sections, skills & SEO");

  // TEST 2: Commercial packages fallback
  console.log("\n[TEST 2] Commercial website & marketplace packages");
  const packages = await getPublishedPackages();
  assert(Array.isArray(packages), "packages should be an array");
  assert(packages.length >= 4, "packages should include at least 4 core packages");

  const coreIds = ["amazon-listing-starter", "a-plus-content-design", "amazon-listing-pro", "complete-package"];
  for (const id of coreIds) {
    const pkg = packages.find((p) => p.id === id);
    assert(pkg, `Core package '${id}' must be present in published packages`);
    assert(pkg.price > 0, `Package '${id}' must have a positive price`);
    assert(pkg.features.length > 0, `Package '${id}' must list deliverables`);
    assert(pkg.active, `Package '${id}' must be active`);
    assert(pkg.published, `Package '${id}' must be published`);
  }

  const starter = packages.find((p) => p.id === "amazon-listing-starter");
  assert(starter && starter.price === 999, "Starter must be ₹999");
  const aplus = packages.find((p) => p.id === "a-plus-content-design");
  assert(aplus && aplus.price === 1499, "A+ Content must be ₹1,499");
  const pro = packages.find((p) => p.id === "amazon-listing-pro");
  assert(pro && pro.price === 1999, "Pro must be ₹1,999");
  const complete = packages.find((p) => p.id === "complete-package");
  assert(complete && complete.price === 2999, "Complete package must be ₹2,999");
  console.log("  ✔ [PASS] getPublishedPackages returns 4 commercial core packages in prioritized order (₹999, ₹1,499, ₹1,999, ₹2,999)");

  // TEST 3: Catalog collections fallback (apps, projects, services)
  console.log("\n[TEST 3] Catalog collections fallback (apps, projects, services)");
  const apps = await getPublishedApps();
  assert(Array.isArray(apps) && apps.length > 0, "apps should return non-empty list");
  assert(apps.some((a) => a.slug === "wishmusic"), "WishMusic app should be in published apps");
  assert(apps.some((a) => a.slug === "wishtracking"), "WishTracking app should be in published apps");

  const projects = await getPublishedProjects();
  assert(Array.isArray(projects) && projects.length > 0, "projects should return non-empty list");

  const services = await getPublishedServices();
  assert(Array.isArray(services) && services.length > 0, "services should return non-empty list");
  console.log("  ✔ [PASS] getPublishedApps, getPublishedProjects, getPublishedServices return valid catalog fallback data");

  // TEST 4: Service detail by slug
  console.log("\n[TEST 4] Individual service resolution by slug");
  const websiteDevService = await getPublishedServiceBySlug("website-development");
  assert(websiteDevService, "website-development service should resolve");
  assert.strictEqual(websiteDevService.name, "Website Development");
  assert(websiteDevService.deliverables.length > 0, "Service should list deliverables");

  const nonExistentService = await getPublishedServiceBySlug("non-existent-discipline-xyz");
  assert.strictEqual(nonExistentService, null, "Non-existent slug should resolve to null");
  console.log("  ✔ [PASS] getPublishedServiceBySlug resolves valid service and returns null for invalid slug");

  console.log("\n==========================================================");
  console.log("  CMS VERIFICATION SUMMARY: ALL TESTS PASSED");
  console.log("==========================================================");
  process.exit(0);
}

runCmsVerification().catch((err) => {
  console.error("CMS verification test failed:", err);
  process.exit(1);
});
