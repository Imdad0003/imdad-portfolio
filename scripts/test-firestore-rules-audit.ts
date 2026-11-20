/**
 * Live Firestore Rules Security Verification Suite
 * Tests actual Firestore rules enforcement for all collections in priority audit.
 */

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
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB9Kv3Vh1ecOQlD1zg6wSzMvsjjiUZjMVw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "imdadbuilds-ead39.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imdadbuilds-ead39",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runFirestoreRulesAudit() {
  console.log("================================================================================");
  console.log("🛡️ RUNNING LIVE FIRESTORE RULES SECURITY AUDIT");
  console.log("================================================================================\n");

  let total = 0;
  let passed = 0;

  function assert(condition: boolean, title: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] Rule Check ${total}: ${title}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Rule Check ${total}: ${title}`);
      if (detail) console.error(`   └─ ${detail}`);
      throw new Error(`Security assertion failed: ${title}`);
    }
  }

  // --------------------------------------------------------------------------------
  // 1. videoOrders Collection Access Control
  // --------------------------------------------------------------------------------
  console.log("--- 1. Auditing videoOrders Security Rules ---");

  // 1.1 Unauthenticated Direct Document Read
  let directReadBlocked = false;
  try {
    const snap = await getDoc(doc(db, "videoOrders", "IMD-VID-202611-9426"));
    // If not thrown, check if it was permitted
    console.log("Direct read returned exists:", snap.exists());
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      directReadBlocked = true;
    }
  }
  assert(
    directReadBlocked,
    "Unauthenticated direct read of /videoOrders/{orderId} is strictly DENIED",
    "Clients cannot bypass the API layer to read customer orders directly from Firestore"
  );

  // 1.2 Unauthenticated List Query
  let listQueryBlocked = false;
  try {
    const q = query(collection(db, "videoOrders"));
    await getDocs(q);
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      listQueryBlocked = true;
    }
  }
  assert(
    listQueryBlocked,
    "Unauthenticated list query on /videoOrders is strictly DENIED",
    "Public visitors cannot scrape or enumerate the video orders database"
  );

  // 1.3 Unauthenticated Update / Payment Status Tampering
  let updateBlocked = false;
  try {
    await updateDoc(doc(db, "videoOrders", "IMD-VID-202611-9426"), {
      paymentStatus: "fully_paid",
      projectStatus: "completed_and_delivered",
      assignedEditor: "malicious-actor",
    });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      updateBlocked = true;
    }
  }
  assert(
    updateBlocked,
    "Unauthenticated update / payment bypass on /videoOrders is strictly DENIED",
    "Clients cannot tamper with paymentStatus, projectStatus, or assignedEditor"
  );

  // 1.4 Unauthenticated Delete
  let deleteBlocked = false;
  try {
    await deleteDoc(doc(db, "videoOrders", "IMD-VID-202611-9426"));
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      deleteBlocked = true;
    }
  }
  assert(
    deleteBlocked,
    "Unauthenticated deletion of /videoOrders is strictly DENIED",
    "Only verified administrators can delete order records"
  );

  // --------------------------------------------------------------------------------
  // 2. mediaAssets Collection Access Control
  // --------------------------------------------------------------------------------
  console.log("\n--- 2. Auditing mediaAssets Security Rules ---");

  // 2.1 Unauthenticated Read of Media Assets
  let mediaReadBlocked = false;
  try {
    await getDocs(collection(db, "mediaAssets"));
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      mediaReadBlocked = true;
    }
  }
  assert(
    mediaReadBlocked,
    "Unauthenticated read of /mediaAssets is strictly DENIED (Admin Only)",
    "Media asset inventory is protected from unauthorized public enumeration"
  );

  // 2.2 Unauthenticated Write to Media Assets
  let mediaWriteBlocked = false;
  try {
    await setDoc(doc(db, "mediaAssets", "unauthorized-asset"), {
      id: "unauthorized-asset",
      url: "https://evil.com/fake.jpg",
      name: "Fake Asset",
    });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      mediaWriteBlocked = true;
    }
  }
  assert(
    mediaWriteBlocked,
    "Unauthenticated write to /mediaAssets is strictly DENIED",
    "Only verified administrators can register or modify media assets"
  );

  // --------------------------------------------------------------------------------
  // 3. siteContent & settings Access Control
  // --------------------------------------------------------------------------------
  console.log("\n--- 3. Auditing siteContent & settings Security Rules ---");

  // 3.1 Unauthenticated Write to siteContent/main
  let siteContentWriteBlocked = false;
  try {
    await setDoc(doc(db, "siteContent", "main"), { hero: { headline: "Defaced" } }, { merge: true });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      siteContentWriteBlocked = true;
    }
  }
  assert(
    siteContentWriteBlocked,
    "Unauthenticated write to /siteContent/main is strictly DENIED",
    "Public visitors cannot modify public production homepage content"
  );

  // 3.2 Unauthenticated Write to siteContent/draft
  let draftWriteBlocked = false;
  try {
    await setDoc(doc(db, "siteContent", "draft"), { hero: { headline: "Defaced Draft" } }, { merge: true });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      draftWriteBlocked = true;
    }
  }
  assert(
    draftWriteBlocked,
    "Unauthenticated write to /siteContent/draft is strictly DENIED",
    "Staging draft content is protected from unauthorized tampering"
  );

  // 3.3 Unauthenticated Write to settings/global
  let settingsWriteBlocked = false;
  try {
    await setDoc(doc(db, "settings", "global"), { studioName: "Hacked Studio" }, { merge: true });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      settingsWriteBlocked = true;
    }
  }
  assert(
    settingsWriteBlocked,
    "Unauthenticated write to /settings/global is strictly DENIED",
    "Global site settings are locked to verified administrators"
  );

  // --------------------------------------------------------------------------------
  // 4. orderConfigurations Access Control
  // --------------------------------------------------------------------------------
  console.log("\n--- 4. Auditing orderConfigurations Security Rules ---");

  // 4.1 Public Read of Order Form Configurations (Intended for Client Order Form)
  let orderConfigReadAllowed = false;
  try {
    const snap = await getDoc(doc(db, "orderConfigurations", "video-editing"));
    orderConfigReadAllowed = true;
  } catch {
    orderConfigReadAllowed = false;
  }
  assert(
    orderConfigReadAllowed,
    "Public read of /orderConfigurations/video-editing is ALLOWED",
    "Permits ordering form and chatbot to fetch current pricing and video options"
  );

  // 4.2 Unauthenticated Write to Order Configurations (Must be DENIED)
  let orderConfigWriteBlocked = false;
  try {
    await setDoc(doc(db, "orderConfigurations", "video-editing"), { priceTamper: true }, { merge: true });
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      orderConfigWriteBlocked = true;
    }
  }
  assert(
    orderConfigWriteBlocked,
    "Unauthenticated write to /orderConfigurations is strictly DENIED",
    "Pricing and options cannot be altered by clients"
  );

  // --------------------------------------------------------------------------------
  // 5. orderPrivateAssets Access Control
  // --------------------------------------------------------------------------------
  console.log("\n--- 5. Auditing orderPrivateAssets Security Rules ---");

  // 5.1 Unauthenticated Read of Private Assets
  let privateAssetReadBlocked = false;
  try {
    await getDocs(collection(db, "orderPrivateAssets"));
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message?.includes("Missing or insufficient permissions")) {
      privateAssetReadBlocked = true;
    }
  }
  assert(
    privateAssetReadBlocked,
    "Unauthenticated read of /orderPrivateAssets is strictly DENIED (Admin Only)",
    "Customer raw footage and delivery assets are guarded from public scraping"
  );

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${passed}/${total} LIVE FIRESTORE RULES SECURITY CHECKS PASSED WITH 100% SUCCESS!`);
  console.log("================================================================================\n");
}

runFirestoreRulesAudit().catch((err) => {
  console.error("Firestore Rules Audit Failed:", err);
  process.exit(1);
});
