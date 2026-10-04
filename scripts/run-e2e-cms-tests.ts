import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getPublishedApps,
  getPublishedAppBySlug,
  getPublishedProjects,
  getPublishedProjectBySlug,
  getPublishedServices,
  getPublishedServiceBySlug,
} from "../src/lib/cms";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "imdad.builds@gmail.com";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD || "";

async function runE2ETests() {
  console.log("==================================================");
  console.log("IMDAD.BUILDS — END-TO-END CMS VERIFICATION SUITE");
  console.log("==================================================");

  const results: Record<string, "PASS" | "FAIL"> = {
    "Admin login": "FAIL",
    "App CRUD": "FAIL",
    "App publish/unpublish": "FAIL",
    "Project CRUD": "FAIL",
    "Project publish/unpublish": "FAIL",
    "Service CRUD": "FAIL",
    "Service publish/unpublish": "FAIL",
    "Public privacy": "FAIL",
    "Admin authorization": "FAIL",
    "Persistence": "FAIL",
    "Cleanup": "FAIL",
    "TypeScript": "FAIL",
    "Production build": "FAIL",
  };

  try {
    // ----------------------------------------------------
    // TEST 1: ADMIN LOGIN & AUTH CHECKS
    // ----------------------------------------------------
    console.log("\n[TEST 1] ADMIN LOGIN & AUTHORIZATION");
    // Ensure signed out first
    await signOut(auth);

    // 1.1 Try invalid password
    let rejectedInvalid = false;
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, "WrongPassword123!");
    } catch {
      rejectedInvalid = true;
      console.log("  ✔ Unauthorized / wrong password rejected");
    }
    if (!rejectedInvalid) throw new Error("Invalid password was not rejected!");

    // 1.2 Try unlisted unauthorized account
    let rejectedUnlisted = false;
    try {
      await signInWithEmailAndPassword(auth, "unauthorized-user@test.com", "SomePassword123!");
    } catch {
      rejectedUnlisted = true;
      console.log("  ✔ Non-existent / unauthorized account rejected");
    }
    if (!rejectedUnlisted) throw new Error("Unlisted account was not rejected!");

    // 1.3 Sign in with legitimate admin credentials
    const adminCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    console.log(`  ✔ Legitimate admin login successful. UID: ${adminCred.user.uid}`);
    if (adminCred.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Admin email mismatch!");
    }

    // 1.4 Test logout
    await signOut(auth);
    console.log("  ✔ Admin logout successful");

    // 1.5 Re-authenticate for subsequent CRUD actions
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    console.log("  ✔ Re-authenticated as admin for CMS operations");

    results["Admin login"] = "PASS";
    results["Admin authorization"] = "PASS";

    // ----------------------------------------------------
    // TEST 2: CREATE TEST APP (published: false)
    // ----------------------------------------------------
    console.log("\n[TEST 2] CREATE TEST APP (Unpublished)");
    const testAppId = "cms-test-app";
    const testAppDocRef = doc(db, "apps", testAppId);

    const now = new Date().toISOString();
    await setDoc(testAppDocRef, {
      id: testAppId,
      name: "CMS Test App",
      slug: "cms-test-app",
      tagline: "Temporary Test Application",
      shortDescription: "A temporary test application created for CMS verification.",
      description: "Detailed description of the CMS test application verifying Firestore integration.",
      platform: ["Web"],
      status: "COMING_SOON",
      statusLabel: "Coming Soon",
      isNew: true,
      featured: false,
      sortOrder: 99,
      category: "Utility",
      accentColor: "#935073",
      version: "v0.0.1",
      releaseDate: "2026",
      features: [{ title: "Test Feature", description: "Verification feature description" }],
      technologies: ["Next.js", "Firestore"],
      published: false, // UNPUBLISHED
      createdAt: now,
      updatedAt: now,
    });

    const createdSnap = await getDoc(testAppDocRef);
    if (!createdSnap.exists()) throw new Error("Test app document was not found in Firestore!");
    console.log("  ✔ Document created in Firestore with published = false");

    // ----------------------------------------------------
    // TEST 3: UNPUBLISHED PRIVACY
    // ----------------------------------------------------
    console.log("\n[TEST 3] UNPUBLISHED PRIVACY CHECK");
    const publishedAppsBefore = await getPublishedApps();
    const foundInPublishedBefore = publishedAppsBefore.some((a) => a.slug === "cms-test-app");
    if (foundInPublishedBefore) {
      throw new Error("Unpublished app appeared in getPublishedApps()!");
    }
    console.log("  ✔ CMS Test App is NOT visible in public getPublishedApps()");

    const slugCheckUnpublished = await getPublishedAppBySlug("cms-test-app");
    if (slugCheckUnpublished !== null) {
      throw new Error("Unpublished app was returned by getPublishedAppBySlug()!");
    }
    console.log("  ✔ getPublishedAppBySlug('cms-test-app') returned null (hidden)");
    results["Public privacy"] = "PASS";

    // ----------------------------------------------------
    // TEST 4: PUBLISH TEST APP
    // ----------------------------------------------------
    console.log("\n[TEST 4] PUBLISH TEST APP");
    await updateDoc(testAppDocRef, {
      published: true,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ App updated to published = true");

    const publishedAppsAfter = await getPublishedApps();
    const foundInPublishedAfter = publishedAppsAfter.some((a) => a.slug === "cms-test-app");
    if (!foundInPublishedAfter) {
      throw new Error("Published app did NOT appear in getPublishedApps()!");
    }
    console.log("  ✔ CMS Test App successfully appeared in public getPublishedApps()");

    const slugCheckPublished = await getPublishedAppBySlug("cms-test-app");
    if (!slugCheckPublished || slugCheckPublished.name !== "CMS Test App") {
      throw new Error("getPublishedAppBySlug('cms-test-app') failed to return published app!");
    }
    console.log("  ✔ Dynamic route getPublishedAppBySlug('cms-test-app') successfully resolved");

    // ----------------------------------------------------
    // TEST 5: EDIT TEST APP
    // ----------------------------------------------------
    console.log("\n[TEST 5] EDIT TEST APP");
    await updateDoc(testAppDocRef, {
      name: "CMS Test App Updated",
      shortDescription: "Updated short description for verification.",
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ App updated: Name='CMS Test App Updated'");

    const updatedApp = await getPublishedAppBySlug("cms-test-app");
    if (!updatedApp || updatedApp.name !== "CMS Test App Updated") {
      throw new Error("Updated name was not reflected!");
    }
    if (updatedApp.shortDescription !== "Updated short description for verification.") {
      throw new Error("Updated short description was not reflected!");
    }
    console.log("  ✔ Public app details match updated values");
    results["App CRUD"] = "PASS";

    // ----------------------------------------------------
    // TEST 6: UNPUBLISH TEST APP
    // ----------------------------------------------------
    console.log("\n[TEST 6] UNPUBLISH TEST APP");
    await updateDoc(testAppDocRef, {
      published: false,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ App updated to published = false");

    const publishedAppsAfterUnpublish = await getPublishedApps();
    const foundAfterUnpublish = publishedAppsAfterUnpublish.some((a) => a.slug === "cms-test-app");
    if (foundAfterUnpublish) {
      throw new Error("Unpublished app still appears in getPublishedApps()!");
    }
    console.log("  ✔ App disappeared from public getPublishedApps()");

    const slugCheckAfterUnpublish = await getPublishedAppBySlug("cms-test-app");
    if (slugCheckAfterUnpublish !== null) {
      throw new Error("Unpublished app was returned by getPublishedAppBySlug()!");
    }
    console.log("  ✔ getPublishedAppBySlug('cms-test-app') returned null");
    results["App publish/unpublish"] = "PASS";

    // ----------------------------------------------------
    // TEST 7: DELETE TEST APP
    // ----------------------------------------------------
    console.log("\n[TEST 7] DELETE TEST APP");
    await deleteDoc(testAppDocRef);
    const checkDeleted = await getDoc(testAppDocRef);
    if (checkDeleted.exists()) {
      throw new Error("Test app still exists in Firestore after deletion!");
    }
    console.log("  ✔ CMS Test App deleted from Firestore");

    // ----------------------------------------------------
    // TEST 8: PROJECT CRUD & PUBLISH/UNPUBLISH
    // ----------------------------------------------------
    console.log("\n[TEST 8] PROJECT CRUD & PUBLISH/UNPUBLISH");
    const testProjectId = "cms-test-project";
    const testProjectRef = doc(db, "projects", testProjectId);

    // Create unpublished project
    await setDoc(testProjectRef, {
      id: testProjectId,
      name: "CMS Test Project",
      slug: "cms-test-project",
      category: "Websites",
      tagline: "Test Project Tagline",
      description: "Detailed description of test project for verification.",
      shortDescription: "A temporary test project",
      technologies: ["React", "TypeScript"],
      scope: ["Design", "Engineering"],
      deliverables: ["Website"],
      status: "In Production",
      featured: true,
      highlight: "Test Project",
      sortOrder: 99,
      published: false, // Unpublished
      createdAt: now,
      updatedAt: now,
    });
    console.log("  ✔ Created CMS Test Project (published = false)");

    // Verify hidden
    const projectsBefore = await getPublishedProjects();
    if (projectsBefore.some((p) => p.slug === "cms-test-project")) {
      throw new Error("Unpublished project appeared in getPublishedProjects()!");
    }
    console.log("  ✔ Unpublished project hidden from public view");

    // Publish
    await updateDoc(testProjectRef, {
      published: true,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ Updated project to published = true");

    const projectsPublished = await getPublishedProjects();
    if (!projectsPublished.some((p) => p.slug === "cms-test-project")) {
      throw new Error("Published project did not appear in getPublishedProjects()!");
    }
    console.log("  ✔ Published project visible in public getPublishedProjects()");

    // Unpublish
    await updateDoc(testProjectRef, {
      published: false,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ Updated project to published = false");

    const projectsUnpublished = await getPublishedProjects();
    if (projectsUnpublished.some((p) => p.slug === "cms-test-project")) {
      throw new Error("Unpublished project still appeared in getPublishedProjects()!");
    }
    console.log("  ✔ Project hidden again after unpublishing");

    // Delete
    await deleteDoc(testProjectRef);
    const checkProjectDeleted = await getDoc(testProjectRef);
    if (checkProjectDeleted.exists()) {
      throw new Error("Test project still exists after deletion!");
    }
    console.log("  ✔ CMS Test Project deleted from Firestore");
    results["Project CRUD"] = "PASS";
    results["Project publish/unpublish"] = "PASS";

    // ----------------------------------------------------
    // TEST 9: SERVICE CRUD & PUBLISH/UNPUBLISH
    // ----------------------------------------------------
    console.log("\n[TEST 9] SERVICE CRUD & PUBLISH/UNPUBLISH");
    const testServiceId = "cms-test-service";
    const testServiceRef = doc(db, "services", testServiceId);

    // Create unpublished service
    await setDoc(testServiceRef, {
      id: testServiceId,
      name: "CMS Test Service",
      slug: "cms-test-service",
      category: "Engineering",
      shortDescription: "A temporary test service for CMS verification.",
      description: "Detailed description of the test service.",
      deliverables: ["Audit", "Report"],
      process: [{ step: "01", title: "Review", description: "Audit review" }],
      pricing: [{ tierName: "Standard", price: "₹10,000", deliverables: ["Report"] }],
      faq: [{ question: "Is this test?", answer: "Yes." }],
      featured: true,
      sortOrder: 99,
      published: false, // Unpublished
      createdAt: now,
      updatedAt: now,
    });
    console.log("  ✔ Created CMS Test Service (published = false)");

    // Verify hidden
    const servicesBefore = await getPublishedServices();
    if (servicesBefore.some((s) => s.slug === "cms-test-service")) {
      throw new Error("Unpublished service appeared in getPublishedServices()!");
    }
    console.log("  ✔ Unpublished service hidden from public view");

    // Publish
    await updateDoc(testServiceRef, {
      published: true,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ Updated service to published = true");

    const servicesPublished = await getPublishedServices();
    if (!servicesPublished.some((s) => s.slug === "cms-test-service")) {
      throw new Error("Published service did not appear in getPublishedServices()!");
    }
    console.log("  ✔ Published service visible in public getPublishedServices()");

    // Unpublish
    await updateDoc(testServiceRef, {
      published: false,
      updatedAt: new Date().toISOString(),
    });
    console.log("  ✔ Updated service to published = false");

    const servicesUnpublished = await getPublishedServices();
    if (servicesUnpublished.some((s) => s.slug === "cms-test-service")) {
      throw new Error("Unpublished service still appeared in getPublishedServices()!");
    }
    console.log("  ✔ Service hidden again after unpublishing");

    // Delete
    await deleteDoc(testServiceRef);
    const checkServiceDeleted = await getDoc(testServiceRef);
    if (checkServiceDeleted.exists()) {
      throw new Error("Test service still exists after deletion!");
    }
    console.log("  ✔ CMS Test Service deleted from Firestore");
    results["Service CRUD"] = "PASS";
    results["Service publish/unpublish"] = "PASS";

    // ----------------------------------------------------
    // TEST 10: PUBLIC SECURITY ENFORCEMENT
    // ----------------------------------------------------
    console.log("\n[TEST 10] PUBLIC SECURITY (Unauthenticated Access Denials)");
    // Sign out to act as unauthenticated public visitor
    await signOut(auth);

    // 10.1 Cannot create app
    let publicCreateAppBlocked = false;
    try {
      await setDoc(doc(db, "apps", "unauthorized-app"), {
        name: "Unauthorized App",
        slug: "unauthorized-app",
        published: true,
      });
    } catch {
      publicCreateAppBlocked = true;
    }
    if (!publicCreateAppBlocked) throw new Error("Public client was able to create app!");
    console.log("  ✔ Public creation of apps strictly blocked");

    // 10.2 Cannot update apps
    let publicUpdateAppBlocked = false;
    try {
      await updateDoc(doc(db, "apps", "wishmusic"), { name: "Hacked App" });
    } catch {
      publicUpdateAppBlocked = true;
    }
    if (!publicUpdateAppBlocked) throw new Error("Public client was able to update app!");
    console.log("  ✔ Public update of apps strictly blocked");

    // 10.3 Cannot delete apps
    let publicDeleteAppBlocked = false;
    try {
      await deleteDoc(doc(db, "apps", "wishmusic"));
    } catch {
      publicDeleteAppBlocked = true;
    }
    if (!publicDeleteAppBlocked) throw new Error("Public client was able to delete app!");
    console.log("  ✔ Public deletion of apps strictly blocked");

    // 10.4 Cannot create project
    let publicCreateProjectBlocked = false;
    try {
      await setDoc(doc(db, "projects", "unauthorized-project"), {
        name: "Unauthorized Project",
        slug: "unauthorized-project",
        published: true,
      });
    } catch {
      publicCreateProjectBlocked = true;
    }
    if (!publicCreateProjectBlocked) throw new Error("Public client was able to create project!");
    console.log("  ✔ Public creation of projects strictly blocked");

    // 10.5 Cannot update services
    let publicUpdateServiceBlocked = false;
    try {
      await updateDoc(doc(db, "services", "website-development"), { name: "Hacked Service" });
    } catch {
      publicUpdateServiceBlocked = true;
    }
    if (!publicUpdateServiceBlocked) throw new Error("Public client was able to update service!");
    console.log("  ✔ Public update of services strictly blocked");

    // 10.6 Cannot modify settings
    let publicModifySettingsBlocked = false;
    try {
      await updateDoc(doc(db, "settings", "global"), { studioName: "Hacked Studio" });
    } catch {
      publicModifySettingsBlocked = true;
    }
    if (!publicModifySettingsBlocked) throw new Error("Public client was able to modify settings!");
    console.log("  ✔ Public modification of settings strictly blocked");

    // 10.7 Cannot modify admins
    let publicModifyAdminBlocked = false;
    try {
      await setDoc(doc(db, "admins", "malicious-admin"), { email: "attacker@test.com" });
    } catch {
      publicModifyAdminBlocked = true;
    }
    if (!publicModifyAdminBlocked) throw new Error("Public client was able to modify admins collection!");
    console.log("  ✔ Public modification of admins collection strictly blocked");

    // ----------------------------------------------------
    // TEST 11: ADMIN PERSISTENCE ACROSS SESSIONS
    // ----------------------------------------------------
    console.log("\n[TEST 11] ADMIN PERSISTENCE");
    // Sign back in as admin
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    
    // Create a temporary persisted record
    const persistDocRef = doc(db, "apps", "cms-persist-test");
    await setDoc(persistDocRef, {
      id: "cms-persist-test",
      name: "Persist Test App",
      slug: "cms-persist-test",
      tagline: "Persistence Check",
      shortDescription: "Checking persistence across logout and login",
      description: "Description of persist test app",
      platform: ["Web"],
      status: "COMING_SOON",
      statusLabel: "Coming Soon",
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Logout
    await signOut(auth);
    console.log("  ✔ Admin logged out after saving test entity");

    // Login again
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    console.log("  ✔ Admin logged back in");

    // Verify document persisted exactly
    const persistSnap = await getDoc(persistDocRef);
    if (!persistSnap.exists() || persistSnap.data().name !== "Persist Test App") {
      throw new Error("Persisted entity was not found or data mismatched!");
    }
    console.log("  ✔ Entity persisted intact across session boundary");

    // Clean up
    await deleteDoc(persistDocRef);
    console.log("  ✔ Cleaned up temporary persist test entity");
    results["Persistence"] = "PASS";

    // ----------------------------------------------------
    // CLEANUP CONFIRMATION
    // ----------------------------------------------------
    console.log("\n[CLEANUP] VERIFYING PRODUCTION ZERO-DIRT STATE");
    const testIds = ["cms-test-app", "cms-persist-test", "cms-test-project", "cms-test-service"];
    let anyLeft = false;
    for (const id of testIds) {
      const a = await getDoc(doc(db, "apps", id));
      const p = await getDoc(doc(db, "projects", id));
      const s = await getDoc(doc(db, "services", id));
      if (a.exists() || p.exists() || s.exists()) {
        anyLeft = true;
        console.error(`  ✖ Residual document found: ${id}`);
      }
    }
    if (!anyLeft) {
      console.log("  ✔ 100% of temporary test records purged from production Firestore");
      results["Cleanup"] = "PASS";
    }

  } catch (err: any) {
    console.error("\n❌ E2E SUITE ERROR:", err.message);
  }

  console.log("\n==================================================");
  console.log("CMS END-TO-END TEST RESULTS");
  console.log("==================================================");
  for (const [testName, status] of Object.entries(results)) {
    console.log(`${testName.padEnd(28)}: ${status}`);
  }
  console.log("==================================================");

  const hasFails = Object.values(results).some((s) => s === "FAIL");
  process.exit(hasFails ? 1 : 0);
}

runE2ETests().catch((err) => {
  console.error("Fatal test failure:", err);
  process.exit(1);
});
