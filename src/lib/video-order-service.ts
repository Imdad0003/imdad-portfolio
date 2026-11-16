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
} from "@/types/video-order";
import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

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
 * Generates human-friendly order numbers, e.g. IMD-VID-202611-9842 or IMD-VID-001
 */
export function generateOrderNumber(sequence?: number): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (typeof sequence === "number") {
    const formattedSeq = String(sequence).padStart(3, "0");
    return `IMD-VID-${formattedSeq}`;
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `IMD-VID-${yearMonth}-${randomSuffix}`;
}

/**
 * Builds the complete verified VideoOrder model
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
  const orderId = orderNumber; // Standardized uniform Order ID (e.g. IMD-VID-202611-1234)

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
    },
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
