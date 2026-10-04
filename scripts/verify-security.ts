import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runSecurityTests() {
  console.log("==================================================");
  console.log("RUNNING LIVE FIRESTORE SECURITY & ACCESS AUDIT");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: Public Read of Published Apps (Should Succeed)
  try {
    const q = query(collection(db, "apps"), where("published", "==", true));
    const snap = await getDocs(q);
    console.log(`✔ TEST 1 PASSED: Public read of published apps allowed (${snap.size} apps returned)`);
    passed++;
  } catch (err: any) {
    console.error("✖ TEST 1 FAILED: Public read of published apps failed:", err.message);
    failed++;
  }

  // Test 2: Unauthenticated Write to Apps (Must be DENIED)
  try {
    const fakeDoc = doc(db, "apps", "hacker-app");
    await setDoc(fakeDoc, {
      name: "Malicious App",
      slug: "malicious-app",
      published: true,
    });
    console.error("✖ TEST 2 FAILED: Public write to apps was PERMITTED (Critical security breach!)");
    failed++;
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      console.log("✔ TEST 2 PASSED: Public write to apps strictly DENIED (permission-denied)");
      passed++;
    } else {
      console.error("✖ TEST 2 FAILED: Unexpected error on public write:", err.message);
      failed++;
    }
  }

  // Test 3: Unauthenticated Write to Admins (Must be DENIED)
  try {
    const fakeAdminDoc = doc(db, "admins", "hacker-uid");
    await setDoc(fakeAdminDoc, {
      email: "hacker@evil.com",
      role: "superadmin",
    });
    console.error("✖ TEST 3 FAILED: Public write to admins was PERMITTED!");
    failed++;
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      console.log("✔ TEST 3 PASSED: Public privilege escalation to /admins strictly DENIED");
      passed++;
    } else {
      console.error("✖ TEST 3 FAILED: Unexpected error on admin write:", err.message);
      failed++;
    }
  }

  // Test 4: Unauthenticated Write to Settings (Must be DENIED)
  try {
    const settingsDoc = doc(db, "settings", "global");
    await setDoc(settingsDoc, { studioName: "Defaced Studio" }, { merge: true });
    console.error("✖ TEST 4 FAILED: Public write to settings was PERMITTED!");
    failed++;
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      console.log("✔ TEST 4 PASSED: Public write to settings strictly DENIED");
      passed++;
    } else {
      console.error("✖ TEST 4 FAILED: Unexpected error on settings write:", err.message);
      failed++;
    }
  }

  // Test 5: Public Creation of Approved Review (Must be DENIED)
  try {
    const fakeReviewDoc = doc(db, "reviews", "fake-approved-review");
    await setDoc(fakeReviewDoc, {
      name: "Fake User",
      email: "fake@test.com",
      service: "Website Development",
      rating: 5,
      review: "This is a fake review bypassing moderation.",
      status: "approved", // Bypassing pending state
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.error("✖ TEST 5 FAILED: Direct creation of 'approved' review was PERMITTED!");
    failed++;
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      console.log("✔ TEST 5 PASSED: Bypassing review moderation strictly DENIED");
      passed++;
    } else {
      console.error("✖ TEST 5 FAILED: Unexpected error on review write:", err.message);
      failed++;
    }
  }

  // Test 6: Public Read of Reviews (Only Approved should be readable)
  try {
    const q = query(collection(db, "reviews"), where("status", "==", "approved"));
    const snap = await getDocs(q);
    console.log(`✔ TEST 6 PASSED: Public read of approved reviews allowed (${snap.size} reviews)`);
    passed++;
  } catch (err: any) {
    console.error("✖ TEST 6 FAILED: Public read of approved reviews failed:", err.message);
    failed++;
  }

  console.log("==================================================");
  console.log(`SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
