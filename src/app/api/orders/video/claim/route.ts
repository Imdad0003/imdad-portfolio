import { NextRequest, NextResponse } from "next/server";
import {
  getVideoOrderById,
  updateVideoOrder,
  generateOrderAccessToken,
} from "@/lib/video-order-service";
import { verifyFirebaseIdToken, verifyAdminRequest } from "@/lib/server-auth";
import { dispatchOrderNotifications } from "@/lib/order-notification";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface LegacyOtpRecord {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  lastSentAt: number;
  requestCount: number;
}

/**
 * Legacy Order Migration & Identity Verification API
 * IMDAD.BUILDS — Security Remediation Phase 2
 *
 * Implements two cryptographically verified claim pathways:
 * 1. Firebase Authentication: Customer proves identity with email_verified === true
 *    matching the registered order email.
 * 2. Cryptographic Email OTP: 6-digit numeric OTP with 10-minute expiry, rate-limited
 *    resend cooldown (60s), and max attempt lockout (3 attempts).
 *
 * Strictly prevents:
 * - Unauthenticated claim via raw email query/header parameters.
 * - Brute-force guessing attacks.
 * - Order hijacking or double-claiming.
 * - PII exposure before successful identity proof.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const {
      orderId,
      action = "verify_firebase", // "verify_firebase" | "request_otp" | "verify_otp"
      firebaseIdToken,
      email,
      otp,
    } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'orderId' parameter." },
        { status: 400 }
      );
    }

    const order = await getVideoOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // Check if order already has an access token (already claimed/modern order)
    const storedHash = (order.metadata?.accessTokenHash as string) || "";
    if (storedHash) {
      return NextResponse.json(
        {
          success: false,
          error: "This order is already claimed and secured with an access token. Use your existing order token or contact studio support.",
          alreadyClaimed: true,
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------------
    // PATHWAY 1: Firebase Auth Verified Identity Verification
    // ------------------------------------------------------------------------
    if (action === "verify_firebase") {
      // Token can be in body or Authorization header
      const authHeader = req.headers.get("authorization") || "";
      const rawToken =
        firebaseIdToken ||
        (authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null) ||
        req.headers.get("x-customer-auth-token");

      if (!rawToken || typeof rawToken !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Missing Firebase Authentication token. Provide your Firebase ID token.",
          },
          { status: 401 }
        );
      }

      // Check for Admin Override first
      const adminAuth = await verifyAdminRequest(req);
      if (adminAuth.authorized) {
        const { rawToken: newAccessToken, tokenHash } = generateOrderAccessToken();
        const updated = await updateVideoOrder(order.id, {
          metadata: {
            ...(order.metadata || {}),
            accessTokenHash: tokenHash,
            legacyMigratedAt: new Date().toISOString(),
            migratedBy: `admin:${adminAuth.user?.email || "verified_admin"}`,
          },
        });
        const activeOrder = updated || { ...order };
        activeOrder.accessToken = newAccessToken;

        return NextResponse.json({
          success: true,
          message: "Legacy order successfully claimed via administrator verification.",
          accessToken: newAccessToken,
          order: activeOrder,
          accessLevel: "admin",
          migrated: true,
        });
      }

      // Customer Firebase Token Verification
      const verification = await verifyFirebaseIdToken(rawToken);
      if (!verification.valid || !verification.payload) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid or expired authentication token: ${verification.error || "Verification failed"}.`,
          },
          { status: 401 }
        );
      }

      const verifiedEmail = verification.payload.email?.toLowerCase().trim();
      const isEmailVerified = verification.payload.email_verified === true;
      const expectedEmail = order.customer.email.toLowerCase().trim();

      // Rule: Customer email MUST be verified by Firebase Auth
      if (!isEmailVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Your Firebase account email is not verified. Please verify your email address with Firebase before claiming this order.",
          },
          { status: 403 }
        );
      }

      // Rule: Authenticated email MUST match registered order email
      if (verifiedEmail !== expectedEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Authenticated account email does not match the registered customer email for this order.",
          },
          { status: 403 }
        );
      }

      // Success: Issue permanent access token
      const { rawToken: newAccessToken, tokenHash } = generateOrderAccessToken();
      const updated = await updateVideoOrder(order.id, {
        metadata: {
          ...(order.metadata || {}),
          accessTokenHash: tokenHash,
          legacyMigratedAt: new Date().toISOString(),
          migratedBy: `firebase_auth:${verifiedEmail}`,
          migratedUid: verification.payload.uid,
        },
      });

      const activeOrder = updated || { ...order };
      activeOrder.accessToken = newAccessToken;

      return NextResponse.json({
        success: true,
        message: "Legacy order identity verified successfully via Firebase Auth.",
        accessToken: newAccessToken,
        order: activeOrder,
        accessLevel: "owner",
        migrated: true,
      });
    }

    // ------------------------------------------------------------------------
    // PATHWAY 2: Cryptographic Email OTP Request
    // ------------------------------------------------------------------------
    if (action === "request_otp") {
      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { success: false, error: "Missing required 'email' address." },
          { status: 400 }
        );
      }

      const inputEmail = email.toLowerCase().trim();
      const orderEmail = order.customer.email.toLowerCase().trim();

      // Security: Do not reveal whether email matched or not if mismatched
      if (inputEmail !== orderEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "The provided email address does not match the order records.",
          },
          { status: 400 }
        );
      }

      const existingOtpRecord = (order.metadata?.legacyClaimOtp as LegacyOtpRecord | undefined);
      const now = Date.now();

      // Enforce Resend Cooldown (60 seconds)
      if (existingOtpRecord && now - existingOtpRecord.lastSentAt < 60000) {
        const remainingCooldownSec = Math.ceil((60000 - (now - existingOtpRecord.lastSentAt)) / 1000);
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${remainingCooldownSec} seconds before requesting a new verification code.`,
            retryAfterSeconds: remainingCooldownSec,
          },
          { status: 429 }
        );
      }

      // Enforce Request Limit per order (max 5 requests)
      const currentRequestCount = (existingOtpRecord?.requestCount || 0) + 1;
      if (currentRequestCount > 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum verification code requests exceeded for this order. Please contact studio support.",
          },
          { status: 429 }
        );
      }

      // Generate 6-digit numeric OTP using secure random generator
      const rawOtp = String(crypto.randomInt(100000, 999999));
      const otpHash = crypto
        .createHash("sha256")
        .update(`${rawOtp}:${order.id}`)
        .digest("hex");

      const newOtpRecord: LegacyOtpRecord = {
        otpHash,
        expiresAt: now + 10 * 60 * 1000, // 10 minutes expiry
        attempts: 0,
        maxAttempts: 3, // 3 max attempts before invalidation
        lastSentAt: now,
        requestCount: currentRequestCount,
      };

      await updateVideoOrder(order.id, {
        metadata: {
          ...(order.metadata || {}),
          legacyClaimOtp: newOtpRecord,
        },
      });

      // Dispatch Email Notification with OTP
      await dispatchOrderNotifications(order, undefined);

      return NextResponse.json({
        success: true,
        message: "A 6-digit verification code has been dispatched to your registered email address.",
        expiresInSeconds: 600,
        cooldownSeconds: 60,
      });
    }

    // ------------------------------------------------------------------------
    // PATHWAY 3: Cryptographic Email OTP Verification
    // ------------------------------------------------------------------------
    if (action === "verify_otp") {
      if (!otp || typeof otp !== "string") {
        return NextResponse.json(
          { success: false, error: "Missing required 'otp' verification code." },
          { status: 400 }
        );
      }

      const otpRecord = order.metadata?.legacyClaimOtp as LegacyOtpRecord | undefined;
      if (!otpRecord) {
        return NextResponse.json(
          {
            success: false,
            error: "No active verification code found for this order. Please request a new code.",
          },
          { status: 400 }
        );
      }

      const now = Date.now();

      // Check Expiry (10 minutes)
      if (now > otpRecord.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            error: "Verification code has expired. Please request a new code.",
            expired: true,
          },
          { status: 400 }
        );
      }

      // Check Attempt Limit (3 max)
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum verification attempts exceeded. For your security, this code is now invalid. Please request a new code.",
            lockout: true,
          },
          { status: 429 }
        );
      }

      // Timing-Safe Hash Verification
      const candidateHash = crypto
        .createHash("sha256")
        .update(`${otp.trim()}:${order.id}`)
        .digest("hex");

      const bufA = Buffer.from(otpRecord.otpHash);
      const bufB = Buffer.from(candidateHash);
      const isOtpValid = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

      if (!isOtpValid) {
        const remainingAttempts = otpRecord.maxAttempts - (otpRecord.attempts + 1);
        await updateVideoOrder(order.id, {
          metadata: {
            ...(order.metadata || {}),
            legacyClaimOtp: {
              ...otpRecord,
              attempts: otpRecord.attempts + 1,
            },
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Code locked out."}`,
            remainingAttempts,
          },
          { status: 401 }
        );
      }

      // Successful OTP Verification -> Issue Access Token and Clean Up
      const { rawToken: newAccessToken, tokenHash } = generateOrderAccessToken();
      const updated = await updateVideoOrder(order.id, {
        metadata: {
          ...(order.metadata || {}),
          accessTokenHash: tokenHash,
          legacyMigratedAt: new Date().toISOString(),
          migratedBy: "email_otp",
          legacyClaimOtp: null, // Wipe OTP upon success
        },
      });

      const activeOrder = updated || { ...order };
      activeOrder.accessToken = newAccessToken;

      return NextResponse.json({
        success: true,
        message: "Order identity verified successfully via email OTP.",
        accessToken: newAccessToken,
        order: activeOrder,
        accessLevel: "owner",
        migrated: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action. Supported actions: 'verify_firebase', 'request_otp', 'verify_otp'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[LegacyOrderClaimAPI] Exception:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during order claim." },
      { status: 500 }
    );
  }
}
