import { NextRequest } from "next/server";
import crypto from "crypto";
import { firebaseConfig } from "@/lib/firebase";
import { BOOTSTRAP_ADMIN_EMAILS } from "@/lib/auth";

export interface VerifiedAdminUser {
  uid: string;
  email: string;
  emailVerified?: boolean;
  adminClaim?: boolean;
  authType: "firebase-token" | "server-secret";
}

export interface ServerAuthResult {
  authorized: boolean;
  user?: VerifiedAdminUser;
  error?: string;
  statusCode: number;
}

// In-memory cache for Google's public x509 signing certificates
interface CertsCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certsCache: CertsCache | null = null;

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

/**
 * Fetch and cache Google's public certificates for Firebase ID Token verification.
 */
async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certsCache && certsCache.expiresAt > now) {
    return certsCache.certs;
  }

  try {
    const res = await fetch(GOOGLE_CERTS_URL, {
      method: "GET",
      // Keep timeout reasonable
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Google certs endpoint returned HTTP ${res.status}`);
    }

    const certs = (await res.json()) as Record<string, string>;

    // Parse max-age from Cache-Control header if available
    let maxAgeSeconds = 3600; // default 1 hour
    const cacheControl = res.headers.get("cache-control");
    if (cacheControl) {
      const match = cacheControl.match(/max-age=(\d+)/i);
      if (match && match[1]) {
        maxAgeSeconds = Math.max(300, parseInt(match[1], 10));
      }
    }

    certsCache = {
      certs,
      expiresAt: now + maxAgeSeconds * 1000,
    };

    return certs;
  } catch (err) {
    console.warn("Failed to fetch Google public certificates:", err);
    // If we have an existing cache, use it as fallback
    if (certsCache && Object.keys(certsCache.certs).length > 0) {
      return certsCache.certs;
    }
    throw err;
  }
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Get the list of authorized administrator emails from environment variables or bootstrap.
 */
export function getAuthorizedAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_ALLOWED_EMAILS;
  if (envEmails && typeof envEmails === "string") {
    return envEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return BOOTSTRAP_ADMIN_EMAILS.map((e) => e.trim().toLowerCase());
}

/**
 * Validate server-to-server secret if explicitly configured with sufficient entropy.
 * Disallows known insecure defaults, empty secrets, and short secrets.
 */
function verifyConfiguredAdminSecret(providedSecret: string): boolean {
  const configuredSecret = process.env.ADMIN_SECRET_KEY;
  if (!configuredSecret || typeof configuredSecret !== "string") {
    return false;
  }

  const trimmed = configuredSecret.trim();
  // Require high entropy: minimum 32 characters, preventing legacy or weak passcodes
  if (trimmed.length < 32) {
    return false;
  }

  return timingSafeEqualStrings(providedSecret.trim(), trimmed);
}

/**
 * Verifies a Firebase Authentication ID Token (JWT) on the server.
 * Validates header, standard claims, project ID, expiration, and RSA-SHA256 signature.
 */
export async function verifyFirebaseIdToken(token: string): Promise<{
  valid: boolean;
  payload?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    admin?: boolean;
  };
  error?: string;
}> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing token" };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed token: expected 3 segments" };
  }

  let header: { alg?: string; kid?: string; typ?: string };
  let payload: {
    iss?: string;
    aud?: string;
    auth_time?: number;
    user_id?: string;
    sub?: string;
    iat?: number;
    exp?: number;
    email?: string;
    email_verified?: boolean;
    admin?: boolean;
  };

  try {
    header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return { valid: false, error: "Failed to decode token segments" };
  }

  if (header.alg !== "RS256" || !header.kid || typeof header.kid !== "string") {
    return { valid: false, error: "Unsupported algorithm or missing kid" };
  }

  const expectedProjectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Claim: exp (expiration)
  if (typeof payload.exp !== "number" || payload.exp <= nowInSeconds) {
    return { valid: false, error: "Token has expired" };
  }

  // Claim: iat (issued at) with 300s clock skew tolerance
  if (typeof payload.iat !== "number" || payload.iat > nowInSeconds + 300) {
    return { valid: false, error: "Token issued in the future" };
  }

  // Claim: aud (audience) must equal Firebase Project ID
  if (payload.aud !== expectedProjectId) {
    return { valid: false, error: "Token audience mismatch for project" };
  }

  // Claim: iss (issuer)
  const expectedIssuer = `https://securetoken.google.com/${expectedProjectId}`;
  if (payload.iss !== expectedIssuer) {
    return { valid: false, error: "Token issuer mismatch" };
  }

  // Claim: sub (subject/UID)
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub !== payload.user_id) {
    return { valid: false, error: "Invalid token subject or user_id mismatch" };
  }

  // Signature verification against Google Public x509 Certs
  try {
    const certs = await getGooglePublicCerts();
    const cert = certs[header.kid];

    if (!cert) {
      return { valid: false, error: "Certificate kid not found in Google public keys" };
    }

    const dataToVerify = Buffer.from(`${parts[0]}.${parts[1]}`);
    const signature = Buffer.from(parts[2], "base64url");

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(dataToVerify);
    const isSignatureValid = verifier.verify(cert, signature);

    if (!isSignatureValid) {
      return { valid: false, error: "Cryptographic signature verification failed" };
    }

    return {
      valid: true,
      payload: {
        uid: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        admin: payload.admin === true,
      },
    };
  } catch (certErr) {
    console.warn("Direct certificate signature verification error:", certErr);

    // Fallback: Verify via Firebase Identity Toolkit if cert download failed
    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey;
    if (apiKey) {
      try {
        const lookupRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
            signal: AbortSignal.timeout(5000),
          }
        );

        if (lookupRes.ok) {
          const lookupData = (await lookupRes.json()) as {
            users?: Array<{
              localId: string;
              email?: string;
              emailVerified?: boolean;
            }>;
          };
          const user = lookupData.users?.[0];
          if (user && user.localId === payload.sub) {
            return {
              valid: true,
              payload: {
                uid: user.localId,
                email: user.email || payload.email,
                email_verified: user.emailVerified,
                admin: payload.admin === true,
              },
            };
          }
        }
      } catch (lookupErr) {
        console.warn("Identity Toolkit fallback error:", lookupErr);
      }
    }

    return {
      valid: false,
      error: "Unable to verify token signature with Google authentication authority",
    };
  }
}

/**
 * Evaluates administrator authorization for a cryptographically verified token payload.
 *
 * Authorization Rules:
 * - Email allowlist authorization (ADMIN_ALLOWED_EMAILS / BOOTSTRAP_ADMIN_EMAILS) strictly
 *   requires email_verified === true.
 * - Firebase Admin custom claim (admin === true) is trusted only when embedded in the verified token payload.
 * - Unverified emails and non-allowlisted accounts without admin claims are denied (403).
 */
export function evaluateAdminAuthorization(payload: {
  uid: string;
  email?: string;
  email_verified?: boolean;
  admin?: boolean;
}): { authorized: boolean; reason?: string } {
  const userEmail = (payload.email || "").toLowerCase().trim();
  const allowedAdminEmails = getAuthorizedAdminEmails();
  const isEmailVerified = payload.email_verified === true;
  const isEmailOnAllowlist = Boolean(userEmail && allowedAdminEmails.includes(userEmail));
  const isEmailAuthorized = Boolean(isEmailOnAllowlist && isEmailVerified);
  const hasAdminClaim = Boolean(payload.admin === true);

  if (!isEmailAuthorized && !hasAdminClaim) {
    if (isEmailOnAllowlist && !isEmailVerified) {
      return {
        authorized: false,
        reason: `Email address (${userEmail}) is in the administrator allowlist but has not been verified in Firebase Authentication.`,
      };
    }
    return {
      authorized: false,
      reason: `User (${userEmail || payload.uid}) is not an authorized administrator.`,
    };
  }

  return { authorized: true };
}

/**
 * Universal server-side administrator authorization verifier.
 * Authenticates incoming NextRequest using:
 * 1. Verified Firebase Auth ID Token in Authorization: Bearer <token>
 * 2. Secure high-entropy server secret in Authorization: Bearer <secret> or x-admin-secret (CLI/automation only)
 *
 * Explicitly rejects:
 * - Missing credentials (401)
 * - Query parameter credentials like ?key= (401)
 * - User-supplied email headers like x-admin-email without tokens (401)
 * - Forged or expired tokens (401)
 * - Authenticated non-admin accounts (403)
 */
export async function verifyAdminRequest(req: NextRequest): Promise<ServerAuthResult> {
  // Disallow query parameter authentication
  const url = req.nextUrl;
  if (url.searchParams.has("key") || url.searchParams.has("adminKey") || url.searchParams.has("secret")) {
    return {
      authorized: false,
      error: "Query parameter authentication is strictly prohibited for privileged endpoints.",
      statusCode: 401,
    };
  }

  // Extract Authorization header
  const authHeader = req.headers.get("authorization") || "";
  let bearerToken = "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    bearerToken = authHeader.slice(7).trim();
  }

  const headerSecret = req.headers.get("x-admin-secret")?.trim() || "";

  // 1. Check for configured server secret (server-to-server / automated tasks)
  const candidateSecret = headerSecret || bearerToken;
  if (candidateSecret && verifyConfiguredAdminSecret(candidateSecret)) {
    return {
      authorized: true,
      user: {
        uid: "system-admin-secret",
        email: "system-automation@imdad.builds",
        adminClaim: true,
        authType: "server-secret",
      },
      statusCode: 200,
    };
  }

  // 2. Must have a bearer token to proceed with Firebase Auth verification
  if (!bearerToken) {
    return {
      authorized: false,
      error: "Unauthorized: Missing administrator credentials. Provide a valid Bearer token.",
      statusCode: 401,
    };
  }

  // 3. Verify the Firebase ID Token
  const tokenResult = await verifyFirebaseIdToken(bearerToken);
  if (!tokenResult.valid || !tokenResult.payload) {
    return {
      authorized: false,
      error: `Unauthorized: ${tokenResult.error || "Invalid or expired administrator token."}`,
      statusCode: 401,
    };
  }

  // 4. Authorize against trusted server-side identity
  const authEval = evaluateAdminAuthorization(tokenResult.payload);
  if (!authEval.authorized) {
    return {
      authorized: false,
      error: `Forbidden: ${authEval.reason}`,
      statusCode: 403,
    };
  }

  const hasAdminClaim = Boolean(tokenResult.payload.admin === true);

  return {
    authorized: true,
    user: {
      uid: tokenResult.payload.uid,
      email: tokenResult.payload.email || "",
      emailVerified: tokenResult.payload.email_verified,
      adminClaim: hasAdminClaim,
      authType: "firebase-token",
    },
    statusCode: 200,
  };
}
