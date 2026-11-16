/**
 * Video Editing Order Collection & Data Contracts for IMDAD.BUILDS
 * Agent 02 Specification: Customer Order Experience, AI Interaction & Optional File Uploads
 */

export type VideoEditingType =
  | "basic-product-video"
  | "product-reel"
  | "ugc-style-ad"
  | "ai-ugc-ad"
  | "premium-ad-creative"
  | "youtube-longform"
  | "custom";

export type VideoFormat = "mp4" | "mov" | "webm" | "mkv" | "custom";

export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5" | "custom";

export interface UploadedFileReference {
  id: string;
  name: string;
  size: number;
  type: string;
  category: "raw_footage" | "audio" | "voiceover" | "image" | "asset" | "other";
  storagePath: string; // Secure internal storage path (NOT exposed publicly)
  fileKey: string; // Internal identifier for authenticated retrieval
  uploadedAt: string;
}

export interface VideoOrderCustomerInfo {
  fullName: string;
  mobileNumber: string;
  email: string;
}

export interface VideoOrderProjectDetails {
  serviceId: string;
  serviceName: string;
  videoType: string;
  videoFormat: string;
  aspectRatio: string;
  approxDuration: string;
  requirements: string;
  deliveryDate: string;
  referenceVideoUrl?: string;
  rawFootageProvided?: boolean;
  uploadedFiles?: UploadedFileReference[];
}

export interface VideoOrderPricing {
  packagePrice: number;
  addonsPrice: number;
  deliveryFee: number;
  totalAmount: number;
  advancePercentage: number; // Always 50
  advanceAmount: number; // 50% of total
  remainingAmount: number; // 50% remaining on completion
  currency: "INR";
}

export type OrderPaymentStatus =
  | "unpaid"
  | "partial_pending"
  | "advance_paid"
  | "fully_paid"
  | "failed"
  | "refunded";

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "pending_advance" // alias for backwards compatibility
  | "advance_received"
  | "payment_confirmed"
  | "in_progress"
  | "review_ready"
  | "completed"
  | "cancelled";

/**
 * 7 Project Lifecycle Statuses for Video Orders
 */
export type ProjectStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "awaiting_editor_assignment"
  | "editing_in_progress"
  | "review_and_revisions"
  | "final_payment_pending"
  | "completed_and_delivered";

export interface AssignedEditor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedAt: string;
  notes?: string;
}

export interface OrderPaymentRecord {
  id: string; // e.g. pay_rec_1731715...
  paymentType: "advance" | "remaining" | "full";
  amount: number; // in INR
  currency: "INR";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  method?: string; // "upi" | "card" | "netbanking" | "wallet" | etc.
  status: "captured" | "failed" | "refunded";
  capturedAt: string;
  receiptNumber: string;
  errorReason?: string;
}

export interface OrderNotificationRecord {
  id: string;
  type: "customer_email" | "owner_email" | "whatsapp";
  recipient: string;
  subject?: string;
  status: "sent" | "failed" | "integration_ready" | "click_to_chat_ready";
  details?: string;
  timestamp: string;
}

export interface VideoOrder {
  id: string; // e.g. ord_vid_1731715200000_abc12
  orderNumber: string; // e.g. IMD-VID-202611-001
  serviceCategory: "video-editing";
  customer: VideoOrderCustomerInfo;
  project: VideoOrderProjectDetails;
  pricing: VideoOrderPricing;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  projectStatus?: ProjectStatus;
  assignedEditor?: AssignedEditor | null;
  payments?: OrderPaymentRecord[];
  notifications?: OrderNotificationRecord[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standardized handoff contract to Agent 03 (Payment Workflow / Razorpay)
 */
export interface PaymentInitiationContract {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  amountDue: number; // Advance amount in INR (50%)
  totalOrderAmount: number; // Total order value in INR
  remainingBalance: number; // Balance due upon delivery
  currency: "INR";
  description: string;
  notes: {
    serviceName: string;
    aspectRatio: string;
    duration: string;
    deliveryDate: string;
    filesCount: number;
  };
  createdAt: string;
}

/**
 * Admin Compatibility Schemas
 * Editable data structures for Video Editing options, formats, and upload limits
 */
export interface VideoServiceOption {
  id: string;
  name: string;
  startingPrice: number;
  description: string;
  typicalDuration: string;
  deliverables: string[];
  isPopular?: boolean;
}

export interface VideoFormatOption {
  id: string;
  label: string;
  extension: string;
  recommended?: boolean;
}

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  description: string;
  recommended?: boolean;
}

export interface DeliveryOption {
  id: string;
  label: string;
  days: number;
  extraCharge: number;
  isDefault?: boolean;
}

export interface FileUploadSettings {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFileSizeMb: number;
  maxTotalFiles: number;
  maxTotalSizeMb: number;
  storageProvider: "secure_internal_vault" | "firestore_private_chunks";
  privateAccessOnly: boolean;
}

export interface OrderFormField {
  id: keyof VideoOrderCustomerInfo | keyof VideoOrderProjectDetails | "general";
  fieldName: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: "text" | "tel" | "email" | "textarea" | "select" | "date";
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
}

export interface VideoOrderAdminConfig {
  serviceOptions: VideoServiceOption[];
  videoFormats: VideoFormatOption[];
  aspectRatios: AspectRatioOption[];
  deliveryOptions: DeliveryOption[];
  uploadSettings: FileUploadSettings;
  orderFormFields: OrderFormField[];
}
