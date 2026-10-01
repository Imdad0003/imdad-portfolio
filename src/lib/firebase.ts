import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

/**
 * Firebase Web App Configuration
 * Grounded in environment variables (NEXT_PUBLIC_*) to prevent hardcoding secrets.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase application singleton.
 * Prevents re-initialization during Next.js Hot Module Replacement (HMR) and SSR cycles.
 */
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Export initialized Firebase app instance.
 */
export { app };
export default app;

/* 
 ============================================================================
  Future Service Integrations (Add when ready; do NOT initialize prematurely):
 ============================================================================
 
 // 1. Cloud Firestore:
 // import { getFirestore } from "firebase/firestore";
 // export const db = getFirestore(app);

 // 2. Firebase Authentication:
 // import { getAuth } from "firebase/auth";
 // export const auth = getAuth(app);

 // 3. Firebase Storage:
 // import { getStorage } from "firebase/storage";
 // export const storage = getStorage(app);

 // 4. Firebase Analytics (Client-only / browser environment):
 // import { getAnalytics, isSupported } from "firebase/analytics";
 // export const getAnalyticsInstance = async () => {
 //   if (typeof window !== "undefined" && await isSupported()) {
 //     return getAnalytics(app);
 //   }
 //   return null;
 // };
 ============================================================================
*/
