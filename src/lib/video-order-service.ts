/**
 * Video Editing Order Service Layer
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Implements strict validation, 50% advance pricing calculation,
 * order generation, and Agent 03 payment workflow handoff contract.
 */

import {
  VideoOrder,
  VideoOrderCustomerInfo,
  VideoOrderProjectDetails,
  VideoOrderPricing,
  PaymentInitiationContract,
  UploadedFileReference,
  SanitizedVideoOrder,
} from "@/types/video-order";
import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates customer information fields.
 */
export function validateCustomerInfo(customer: Partial<VideoOrderCustomerInfo>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!customer.fullName || typeof customer.fullName !== "string" || customer.fullName.trim().length < 2) {
    errors.fullName = "Please provide your full name (at least 2 characters).";
  }

  if (!customer.mobileNumber || typeof customer.mobileNumber !== "string") {
    errors.mobileNumber = "Please enter your WhatsApp / mobile phone number.";
  } else {
    const digits = customer.mobileNumber.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number.";
    }
  }

  if (!customer.email || typeof customer.email !== "string" || !EMAIL_REGEX.test(customer.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates project specifications and requirements.
 */
export function validateProjectDetails(project: Partial<VideoOrderProjectDetails>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!project.videoType || typeof project.videoType !== "string" || !project.videoType.trim()) {
    errors.videoType = "Please select a video editing type.";
  }

  if (!project.videoFormat || typeof project.videoFormat !== "string" || !project.videoFormat.trim()) {
    errors.videoFormat = "Please specify the preferred video format (e.g. MP4, MOV).";
  }

  if (!project.aspectRatio || typeof project.aspectRatio !== "string" || !project.aspectRatio.trim()) {
    errors.aspectRatio = "Please select an aspect ratio (e.g. 9:16, 16:9, 1:1, custom).";
  }

  if (!project.approxDuration || typeof project.approxDuration !== "string" || !project.approxDuration.trim()) {
    errors.approxDuration = "Please specify approximate video duration (e.g. 30s, 60s).";
  }

  if (!project.requirements || typeof project.requirements !== "string" || project.requirements.trim().length < 5) {
    errors.requirements = "Please provide editing instructions or requirements (at least 5 characters).";
  }

  if (!project.deliveryDate || typeof project.deliveryDate !== "string" || !project.deliveryDate.trim()) {
    errors.deliveryDate = "Please provide a required delivery date or timeframe.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates order pricing with 50% advance amount formula.
 *
 * Example:
 * Total: ₹1,000
 * Advance (50%): ₹500
 * Remaining: ₹500
 */
export function calculateOrderPricing(
  serviceId: string,
  options?: {
    deliveryOptionId?: string;
    customAmount?: number;
    addonsPrice?: number;
  }
): VideoOrderPricing {
  const service = defaultVideoOrderConfig.serviceOptions.find((s) => s.id === serviceId);
  const delivery = defaultVideoOrderConfig.deliveryOptions.find(
    (d) => d.id === (options?.deliveryOptionId || "standard")
  );

  let packagePrice = service ? service.startingPrice : 999;
  if (options?.customAmount && options.customAmount > 0) {
    packagePrice = options.customAmount;
  }

  const addonsPrice = options?.addonsPrice || 0;
  const deliveryFee = delivery ? delivery.extraCharge : 0;
  const totalAmount = Math.max(1, packagePrice + addonsPrice + deliveryFee);

  const advancePercentage = 50;
  // Calculate exact 50% advance
  const advanceAmount = Math.round(totalAmount * 0.5);
  const remainingAmount = totalAmount - advanceAmount;

  return {
    packagePrice,
    addonsPrice,
    deliveryFee,
    totalAmount,
    advancePercentage,
    advanceAmount,
    remainingAmount,
    currency: "INR",
  };
}

/**
 * Generates human-friendly, high-entropy cryptographic order numbers.
 * Format: IMD-VID-YYYYMM-<8 HEX DIGITS> (e.g. IMD-VID-202611-F8A29B3C)
 * Entropy: 4.29+ billion combinations per month.
 */
export function generateOrderNumber(sequence?: number): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (typeof sequence === "number") {
    const formattedSeq = String(sequence).padStart(3, "0");
    return `IMD-VID-${formattedSeq}`;
  }
  // Cryptographically secure 8-character hex string (4 random bytes)
  const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `IMD-VID-${yearMonth}-${randomSuffix}`;
}

/**
 * Generates a cryptographically secure customer order access token and its SHA-256 storage hash.
 */
export function generateOrderAccessToken(): { rawToken: string; tokenHash: string } {
  const rawToken = "ord_tok_" + crypto.randomBytes(24).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

/**
 * Computes SHA-256 hash of an order access token.
 */
export function hashOrderAccessToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Verifies whether a provided access token matches an order's stored token hash.
 * Uses timing-safe string comparison to protect against side-channel attacks.
 */
export function verifyOrderAccessToken(order: VideoOrder, rawToken?: string | null): boolean {
  if (!rawToken || typeof rawToken !== "string") return false;
  const storedHash = (order.metadata?.accessTokenHash as string) || "";
  if (!storedHash || typeof storedHash !== "string") return false;

  const candidateHash = hashOrderAccessToken(rawToken);
  const bufA = Buffer.from(storedHash);
  const bufB = Buffer.from(candidateHash);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitizes an order for public/unauthenticated queries.
 * Completely strips all customer PII (phone, email, name), creative requirements,
 * uploaded file storage paths, and internal file keys.
 */
export function sanitizeOrderForPublic(order: VideoOrder): SanitizedVideoOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    serviceCategory: "video-editing",
    project: {
      serviceName: order.project.serviceName,
      videoType: order.project.videoType,
      videoFormat: order.project.videoFormat,
      aspectRatio: order.project.aspectRatio,
      approxDuration: order.project.approxDuration,
      deliveryDate: order.project.deliveryDate,
    },
    pricing: order.pricing,
    status: order.status,
    paymentStatus: order.paymentStatus,
    projectStatus: order.projectStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    isSanitized: true,
  };
}

/**
 * Builds the complete verified VideoOrder model with cryptographic access control.
 */
export function buildVideoOrder(
  customer: VideoOrderCustomerInfo,
  project: VideoOrderProjectDetails,
  options?: {
    deliveryOptionId?: string;
    customAmount?: number;
    uploadedFiles?: UploadedFileReference[];
  }
): VideoOrder {
  const pricing = calculateOrderPricing(project.serviceId, {
    deliveryOptionId: options?.deliveryOptionId,
    customAmount: options?.customAmount,
  });

  const now = new Date().toISOString();
  const orderNumber = generateOrderNumber();
  const orderId = orderNumber; // Standardized uniform Order ID

  const { rawToken, tokenHash } = generateOrderAccessToken();

  return {
    id: orderId,
    orderNumber,
    serviceCategory: "video-editing",
    customer: {
      fullName: customer.fullName.trim(),
      mobileNumber: customer.mobileNumber.trim(),
      email: customer.email.trim().toLowerCase(),
    },
    project: {
      ...project,
      uploadedFiles: options?.uploadedFiles || project.uploadedFiles || [],
    },
    pricing,
    status: "pending_payment",
    paymentStatus: "unpaid",
    projectStatus: "pending_payment",
    assignedEditor: null,
    payments: [],
    notifications: [],
    createdAt: now,
    updatedAt: now,
    metadata: {
      source: "integrated_ai_agent",
      advanceRequirement: "50_percent",
      accessTokenHash: tokenHash,
    },
    accessToken: rawToken,
  };
}

/**
 * Prepares the standardized payment initiation contract to hand off to Agent 03.
 *
 * NOTE: Agent 02 does NOT mark orders as paid or initialize Razorpay directly.
 * We pass this verified contract to the payment coordinator.
 */
export function preparePaymentHandoffContract(order: VideoOrder): PaymentInitiationContract {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.customer.fullName,
      email: order.customer.email,
      phone: order.customer.mobileNumber,
    },
    amountDue: order.pricing.advanceAmount, // 50% advance due immediately
    totalOrderAmount: order.pricing.totalAmount,
    remainingBalance: order.pricing.remainingAmount,
    currency: "INR",
    description: `50% Advance for ${order.project.serviceName} (${order.orderNumber})`,
    notes: {
      serviceName: order.project.serviceName,
      aspectRatio: order.project.aspectRatio,
      duration: order.project.approxDuration,
      deliveryDate: order.project.deliveryDate,
      filesCount: order.project.uploadedFiles?.length || 0,
    },
    createdAt: order.createdAt,
    accessToken: order.accessToken,
  };
}

// In-memory fallback map for orders when Firestore is running in disconnected / local dev mode
const memoryOrders = new Map<string, VideoOrder>();

/**
 * Persists order in Firestore database under /videoOrders/{orderId}
 */
export async function persistVideoOrder(order: VideoOrder): Promise<boolean> {
  memoryOrders.set(order.id, order);
  memoryOrders.set(order.orderNumber, order);

  if (!db) {
    console.warn("[VideoOrderService] Firestore not initialized, order cached in memory.");
    return true;
  }

  try {
    const orderRef = doc(db, "videoOrders", order.id);
    await setDoc(orderRef, order);
    return true;
  } catch (err) {
    console.error("[VideoOrderService] Error saving order to Firestore:", err);
    return false;
  }
}

/**
 * Retrieves order from Firestore by ID or Order Number
 */
export async function getVideoOrderById(orderIdOrNumber: string): Promise<VideoOrder | null> {
  if (!orderIdOrNumber) return null;

  // 1. Check in-memory by ID
  if (memoryOrders.has(orderIdOrNumber)) {
    return memoryOrders.get(orderIdOrNumber) || null;
  }

  // 2. Check in-memory by orderNumber
  for (const o of memoryOrders.values()) {
    if (o.orderNumber === orderIdOrNumber) {
      return o;
    }
  }

  if (!db) return null;

  // 3. Check Firestore by doc ID
  try {
    const orderRef = doc(db, "videoOrders", orderIdOrNumber);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      const order = snap.data() as VideoOrder;
      memoryOrders.set(order.id, order);
      memoryOrders.set(order.orderNumber, order);
      return order;
    }
  } catch (err) {
    console.warn("[VideoOrderService] Firestore getDoc warning:", err);
  }

  // 4. Fallback: Check Firestore by orderNumber field
  return getVideoOrderByNumber(orderIdOrNumber);
}

/**
 * Retrieves order from Firestore by Order Number (e.g. IMD-VID-202611-1234)
 */
export async function getVideoOrderByNumber(orderNumber: string): Promise<VideoOrder | null> {
  for (const o of memoryOrders.values()) {
    if (o.orderNumber === orderNumber) return o;
  }

  if (!db) return null;

  try {
    const q = query(collection(db, "videoOrders"), where("orderNumber", "==", orderNumber));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const order = snap.docs[0].data() as VideoOrder;
    memoryOrders.set(order.id, order);
    return order;
  } catch (err) {
    console.error("[VideoOrderService] Error fetching order by number:", err);
    return null;
  }
}

/**
 * Updates an existing video order with partial fields
 */
export async function updateVideoOrder(
  orderId: string,
  updates: Partial<VideoOrder>
): Promise<VideoOrder | null> {
  const existing = await getVideoOrderById(orderId);
  if (!existing) return null;

  const updated: VideoOrder = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  memoryOrders.set(orderId, updated);

  if (db) {
    try {
      const orderRef = doc(db, "videoOrders", orderId);
      await setDoc(orderRef, updated, { merge: true });
    } catch (err) {
      console.error("[VideoOrderService] Error updating order in Firestore:", err);
    }
  }

  return updated;
}

/**
 * Retrieves all video orders (for Admin portal)
 */
export async function listAllVideoOrders(): Promise<VideoOrder[]> {
  const resultsMap = new Map<string, VideoOrder>(memoryOrders);

  if (db) {
    try {
      const snap = await getDocs(collection(db, "videoOrders"));
      snap.forEach((d) => {
        const order = d.data() as VideoOrder;
        resultsMap.set(order.id, order);
      });
    } catch (err) {
      console.warn("[VideoOrderService] Firestore getDocs failed, returning memory store:", err);
    }
  }

  const list = Array.from(resultsMap.values());
  // Sort descending by createdAt
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}
