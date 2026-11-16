/**
 * Razorpay Payment Integration & Verification Utilities
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Implements:
 * 1. Server-side Razorpay client initialization
 * 2. Server-side order creation for 50% advance payments and balance payments
 * 3. Cryptographic HMAC SHA-256 payment signature verification with timingSafeEqual
 * 4. Webhook payload signature validation
 * 5. Safe credentials retrieval and offline test fallbacks
 */

import Razorpay from "razorpay";
import crypto from "crypto";

export interface RazorpayOrderResult {
  id: string; // Razorpay Order ID (e.g. order_OP92kd02...)
  amount: number; // in paise (e.g. 50000 for ₹500)
  amountDue: number;
  currency: string; // "INR"
  receipt: string; // Internal orderNumber
  status: string; // "created"
  keyId: string;
}

export interface CreateOrderParams {
  amount: number; // in INR (will be converted to paise)
  currency?: string; // Default: "INR"
  receipt: string; // e.g. IMD-VID-202611-1234
  notes?: Record<string, string>;
  orderId?: string;
  orderNumber?: string;
}

export interface VerifySignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyWebhookParams {
  rawBody: string;
  signature: string;
  secret?: string;
}

/**
 * Returns configured Razorpay credentials with safe test fallbacks.
 */
export function getRazorpayCredentials() {
  const isProd = process.env.NODE_ENV === "production";
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    (isProd ? "" : "rzp_test_imdad_builds");
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    (isProd ? "" : "rzp_secret_imdad_builds_mock_test");
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    (isProd ? "" : "rzp_webhook_secret_mock_test");

  const isConfigured = Boolean(keyId && keySecret);

  return { keyId, keySecret, webhookSecret, isConfigured };
}

let razorpayInstance: Razorpay | null = null;

/**
 * Returns an instance of Razorpay SDK.
 */
export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();
  if (process.env.NODE_ENV === "production" && !isConfigured) {
    throw new Error("Razorpay client cannot be initialized: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in production.");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

/**
 * Creates a Razorpay Order server-side.
 * Amount is converted to paise (1 INR = 100 paise).
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const { keyId, isConfigured } = getRazorpayCredentials();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !isConfigured) {
    throw new Error("Razorpay gateway order creation failed: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in production.");
  }

  const razorpay = getRazorpayClient();
  const amountInPaise = Math.round(params.amount * 100);

  // Clean receipt string (Razorpay limits receipt to 40 characters)
  const cleanReceipt = (params.receipt || params.orderNumber || "IMD-ORDER").slice(0, 40);

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: params.currency || "INR",
      receipt: cleanReceipt,
      notes: {
        orderId: params.orderId || "",
        orderNumber: params.orderNumber || "",
        ...(params.notes || {}),
      },
    });

    return {
      id: rzpOrder.id,
      amount: Number(rzpOrder.amount),
      amountDue: Number(rzpOrder.amount_due),
      currency: rzpOrder.currency,
      receipt: cleanReceipt,
      status: rzpOrder.status,
      keyId,
    };
  } catch (err: unknown) {
    if (isProd) {
      console.error("[Razorpay] API order creation failed in production:", err);
      throw new Error(`Razorpay gateway error: ${err instanceof Error ? err.message : "Order creation failed"}`);
    }
    console.warn("[Razorpay] API call failed in dev/test, generating authenticated mock order:", err);
    const mockId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id: mockId,
      amount: amountInPaise,
      amountDue: amountInPaise,
      currency: params.currency || "INR",
      receipt: cleanReceipt,
      status: "created",
      keyId,
    };
  }
}

/**
 * Verifies Razorpay Payment Signature using HMAC SHA-256 and timingSafeEqual.
 * Supports both object params and positional arguments.
 */
export function verifyPaymentSignature(
  paramsOrOrderId: VerifySignatureParams | string,
  razorpayPaymentId?: string,
  razorpaySignature?: string
): { valid: boolean; reason?: string } {
  let orderId = "";
  let paymentId = "";
  let signature = "";

  if (typeof paramsOrOrderId === "object") {
    orderId = paramsOrOrderId.razorpayOrderId;
    paymentId = paramsOrOrderId.razorpayPaymentId;
    signature = paramsOrOrderId.razorpaySignature;
  } else {
    orderId = paramsOrOrderId;
    paymentId = razorpayPaymentId || "";
    signature = razorpaySignature || "";
  }

  if (!orderId || !paymentId || !signature) {
    return { valid: false, reason: "Missing required signature verification parameters." };
  }

  const { keySecret } = getRazorpayCredentials();
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !keySecret) {
    return { valid: false, reason: "Server configuration error: RAZORPAY_KEY_SECRET is not configured in production." };
  }

  // Isolated test mock bypass allowed strictly in non-production test suites
  if (!isProd && signature === "test_signature_valid") {
    return { valid: true };
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const sigBuf = Buffer.from(signature, "utf8");

    if (expectedBuf.length !== sigBuf.length) {
      return { valid: false, reason: "Signature length mismatch." };
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, sigBuf);
    return {
      valid: isValid,
      reason: isValid ? undefined : "Signature mismatch.",
    };
  } catch (err) {
    console.error("[RazorpayService] Signature verification exception:", err);
    return { valid: false, reason: "Signature verification error." };
  }
}

/**
 * Alias for backward compatibility
 */
export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
) => verifyPaymentSignature(orderId, paymentId, signature).valid;

/**
 * Verifies Razorpay Webhook Signature using HMAC SHA-256 and timingSafeEqual.
 * Supports both object params and positional arguments.
 */
export function verifyWebhookSignature(
  paramsOrRawBody: VerifyWebhookParams | string,
  signatureArg?: string,
  secretOverride?: string
): boolean {
  let rawBody = "";
  let signature = "";
  let secret = "";

  if (typeof paramsOrRawBody === "object") {
    rawBody = paramsOrRawBody.rawBody;
    signature = paramsOrRawBody.signature;
    secret = paramsOrRawBody.secret || "";
  } else {
    rawBody = paramsOrRawBody;
    signature = signatureArg || "";
    secret = secretOverride || "";
  }

  if (!rawBody || !signature) {
    return false;
  }

  const { webhookSecret } = getRazorpayCredentials();
  const effectiveSecret = secret || webhookSecret;

  if (!effectiveSecret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", effectiveSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const sigBuf = Buffer.from(signature, "utf8");

    if (expectedBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

/**
 * Alias for backward compatibility
 */
export const verifyRazorpayWebhookSignature = verifyWebhookSignature;

/**
 * Fetches payment details from Razorpay API.
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const client = getRazorpayClient();
  try {
    return await client.payments.fetch(paymentId);
  } catch (err) {
    console.warn("[Razorpay] payments.fetch error:", err);
    return null;
  }
}
