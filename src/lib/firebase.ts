import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage as initFirebaseStorage, FirebaseStorage } from "firebase/storage";

/**
 * Firebase Web App Configuration
 * Uses environment variables with safe production project fallbacks
 * to guarantee build and runtime reliability.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB9Kv3Vh1ecOQlD1zg6wSzMvsjjiUZjMVw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "imdadbuilds-ead39.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imdadbuilds-ead39",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "imdadbuilds-ead39.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "204952338257",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:204952338257:web:7e0c0ae183ef1e8ace9d70",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1THVL0LDPJ",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your_firebase_api_key"
);

/**
 * Initialize Firebase application singleton.
 * Prevents re-initialization during Next.js Hot Module Replacement (HMR) and SSR cycles.
 */
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

/**
 * Lazy-load Firebase Storage only when explicitly accessed by CMS image/video tools.
 * Completely isolates the APK Release workflow and prevents any storage retry timers
 * from being instantiated.
 */
function getStorage(): FirebaseStorage | null {
  if (storageInstance) return storageInstance;
  if (!app || typeof window === "undefined") return null;
  try {
    storageInstance = initFirebaseStorage(app);
    return storageInstance;
  } catch (err) {
    console.warn("Firebase Storage lazy initialization notice:", err);
    return null;
  }
}

// Transparent Proxy export: allows existing CMS callers to access storage
// while guaranteeing zero initialization on APK and release management pages.
export const storage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    const instance = getStorage();
    if (!instance) return undefined;
    const value = (instance as unknown as Record<string, unknown>)[prop as string];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
  },
});

export { app, db, auth, firebaseConfig };
export default app;
