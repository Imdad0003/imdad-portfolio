import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  IdTokenResult,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const BOOTSTRAP_ADMIN_EMAILS = ["imdad.builds@gmail.com"];

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Validates whether an authenticated Firebase user has administrative privileges.
 * Validates against:
 * 1. Bootstrapped admin email (imdad.builds@gmail.com)
 * 2. Firebase Auth custom claim (`admin === true`)
 * 3. Firestore `admins/{uid}` document existence
 */
export async function verifyAdminStatus(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;

  const normalizedEmail = user.email.toLowerCase().trim();

  // 1. Bootstrapped admin email check
  if (BOOTSTRAP_ADMIN_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  // 2. Custom claims check
  try {
    const tokenResult: IdTokenResult = await user.getIdTokenResult();
    if (tokenResult.claims && tokenResult.claims.admin === true) {
      return true;
    }
  } catch (err) {
    console.warn("Failed to check user custom claims:", err);
  }

  // 3. Firestore admins registry check
  if (db) {
    try {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        return true;
      }
    } catch (err) {
      console.warn("Failed to check admins collection:", err);
    }
  }

  return false;
}

/**
 * Sign in as an administrator using Firebase Email/Password Authentication.
 * Automatically verifies admin authorization upon successful sign-in.
 */
export async function adminSignIn(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Authentication is not initialized.");
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const isAuthorized = await verifyAdminStatus(userCredential.user);

  if (!isAuthorized) {
    await signOut(auth);
    throw new Error(
      `Access Denied: ${userCredential.user.email} is not authorized for the Studio Admin CMS.`
    );
  }

  return userCredential.user;
}

/**
 * Sign in as an administrator using Firebase Google Authentication.
 * Automatically verifies admin authorization upon successful sign-in.
 */
export async function adminSignInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Authentication is not initialized.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const userCredential = await signInWithPopup(auth, provider);
  const isAuthorized = await verifyAdminStatus(userCredential.user);

  if (!isAuthorized) {
    await signOut(auth);
    throw new Error(
      `Access Denied: ${userCredential.user.email} is not authorized for the Studio Admin CMS.`
    );
  }

  return userCredential.user;
}

/**
 * Sign out the currently authenticated administrator.
 */
export async function adminSignOut(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Send password reset email to administrator.
 */
export async function adminSendPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error("Firebase Authentication is not initialized.");
  }
  await sendPasswordResetEmail(auth, email.trim());
}
