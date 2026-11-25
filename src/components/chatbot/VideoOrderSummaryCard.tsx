"use client";

import React, { useState, useRef, useEffect } from "react";
import { VideoOrderSummaryData } from "@/lib/video-order-extractor";
import {
  UploadedFileReference,
  VideoOrder,
  PaymentInitiationContract,
  OrderPaymentRecord,
} from "@/types/video-order";
import { getWhatsAppUrl } from "@/data/config";
import {
  Film,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  Trash2,
  Edit3,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface VideoOrderSummaryCardProps {
  summary: VideoOrderSummaryData;
  onOrderCreated?: (order: VideoOrder, contract: PaymentInitiationContract) => void;
}

export function VideoOrderSummaryCard({
  summary: initialSummary,
  onOrderCreated,
}: VideoOrderSummaryCardProps) {
  const [summary, setSummary] = useState<VideoOrderSummaryData>(initialSummary);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: initialSummary.customer.fullName,
    mobileNumber: initialSummary.customer.mobileNumber,
    email: initialSummary.customer.email,
    videoType: initialSummary.videoType,
    videoFormat: initialSummary.videoFormat,
    aspectRatio: initialSummary.aspectRatio,
    approxDuration: initialSummary.approxDuration,
    requirements: initialSummary.requirements,
    deliveryDate: initialSummary.deliveryDate,
    referenceVideoUrl: initialSummary.referenceVideoUrl || "",
  });

  // Optional File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileReference[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<VideoOrder | null>(null);
  const [paymentContract, setPaymentContract] = useState<PaymentInitiationContract | null>(null);
  const [paidPaymentRecord, setPaidPaymentRecord] = useState<OrderPaymentRecord | null>(null);

  // Listen for verified payment success event from Razorpay modal
  useEffect(() => {
    const handlePaymentSuccess = (e: Event) => {
      const customEvent = e as CustomEvent<{
        orderId: string;
        orderNumber: string;
        payment: OrderPaymentRecord;
        order?: VideoOrder;
        paymentStatus?: string;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (
        confirmedOrder &&
        (confirmedOrder.id === detail.orderId || confirmedOrder.orderNumber === detail.orderNumber)
      ) {
        setPaidPaymentRecord(detail.payment);
        if (detail.order) {
          setConfirmedOrder(detail.order);
        } else if (confirmedOrder) {
          setConfirmedOrder({
            ...confirmedOrder,
            status: "advance_received",
            paymentStatus: "advance_paid",
            projectStatus: "payment_confirmed",
            payments: [...(confirmedOrder.payments || []), detail.payment],
          });
        }
      }
    };

    window.addEventListener("imdad:video-payment-success", handlePaymentSuccess);
    return () => {
      window.removeEventListener("imdad:video-payment-success", handlePaymentSuccess);
    };
  }, [confirmedOrder, summary]);

  // Handle file uploads (strictly private, non-public vault)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(10);

    const file = files[0];

    // Client-side 50MB check
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File size exceeds 50MB limit. For larger footage, you can share a Drive/Dropbox link.");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", file.type.startsWith("video") ? "raw_footage" : file.type.startsWith("audio") ? "audio" : "asset");

      // Progress simulation for responsive UX
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await fetch("/api/orders/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file.");
      }

      setUploadedFiles((prev) => [...prev, data.file]);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await fetch(`/api/orders/upload?fileId=${fileId}`, { method: "DELETE" });
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Remove file error:", err);
    }
  };

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setSummary((prev) => ({
      ...prev,
      customer: {
        fullName: editFormData.fullName,
        mobileNumber: editFormData.mobileNumber,
        email: editFormData.email,
      },
      videoType: editFormData.videoType,
      videoFormat: editFormData.videoFormat,
      aspectRatio: editFormData.aspectRatio,
      approxDuration: editFormData.approxDuration,
      requirements: editFormData.requirements,
      deliveryDate: editFormData.deliveryDate,
      referenceVideoUrl: editFormData.referenceVideoUrl || undefined,
    }));
    setIsEditing(false);
  };

  // Submit verified order & trigger payment handoff
  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        customer: {
          fullName: summary.customer.fullName,
          mobileNumber: summary.customer.mobileNumber,
          email: summary.customer.email,
        },
        project: {
          serviceId: summary.serviceId,
          serviceName: summary.serviceName,
          videoType: summary.videoType,
          videoFormat: summary.videoFormat,
          aspectRatio: summary.aspectRatio,
          approxDuration: summary.approxDuration,
          requirements: summary.requirements,
          deliveryDate: summary.deliveryDate,
          referenceVideoUrl: summary.referenceVideoUrl,
          rawFootageProvided: uploadedFiles.length > 0,
          uploadedFiles,
        },
        customAmount: summary.pricing.totalAmount,
      };

      const res = await fetch("/api/orders/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not register video order.");
      }

      const order: VideoOrder = data.order;
      const contract: PaymentInitiationContract = data.paymentContract;

      setConfirmedOrder(order);
      setPaymentContract(contract);

      // Coordinate data contract with Agent 03 (Payment Workflow)
      window.dispatchEvent(
        new CustomEvent("imdad:initiate-video-payment", {
          detail: { order, paymentContract: contract },
        })
      );

      if (onOrderCreated) {
        onOrderCreated(order, contract);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setSubmissionError(err instanceof Error ? err.message : "Failed to generate order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappInquiryUrl = getWhatsAppUrl(
    `Hi Imdad, I created Video Order ${confirmedOrder?.orderNumber || "Draft"}:\n` +
      `• Service: ${summary.serviceName} (${summary.aspectRatio})\n` +
      `• Duration: ${summary.approxDuration}\n` +
      `• Total: ₹${summary.pricing.totalAmount} (50% Advance: ₹${summary.pricing.advanceAmount})\n` +
      `• Delivery Target: ${summary.deliveryDate}\n` +
      `• Status: Advance Payment Pending\n` +
      `I have a question regarding my order:`
  );

  return (
    <div className="my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[rgba(65,28,77,0.85)] via-[rgba(43,20,53,0.92)] to-[rgba(25,10,32,0.96)] border border-[#F6DBC0]/35 shadow-xl backdrop-blur-xl text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F6DBC0]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#502D55] border border-[#F6DBC0]/40 flex items-center justify-center text-[#F6DBC0] shadow-sm">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#F8F4E9] tracking-tight">
              Video Editing Order Summary
            </h4>
            <p className="text-[10px] font-mono text-[#F6DBC0]/80">
              50% Advance Model • Verified Contract
            </p>
          </div>
        </div>

        {!confirmedOrder && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-[#F8F4E9] border border-white/15 transition-all"
          >
            <Edit3 className="w-3 h-3 text-[#F6DBC0]" />
            <span>{isEditing ? "Cancel Edit" : "Edit"}</span>
          </button>
        )}
      </div>

      {/* Editing Form Modal/Drawer Inline */}
      {isEditing ? (
        <form onSubmit={handleSaveEdits} className="space-y-3 mb-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Full Name</label>
              <input
                type="text"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Mobile / WhatsApp</label>
              <input
                type="tel"
                value={editFormData.mobileNumber}
                onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Email Address</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Aspect Ratio</label>
              <select
                value={editFormData.aspectRatio}
                onChange={(e) => setEditFormData({ ...editFormData, aspectRatio: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
              >
                <option value="9:16">9:16 (Vertical Reels/Shorts)</option>
                <option value="16:9">16:9 (Horizontal YouTube)</option>
                <option value="1:1">1:1 (Square Feed)</option>
                <option value="4:5">4:5 (Portrait Feed)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Approximate Duration</label>
              <input
                type="text"
                value={editFormData.approxDuration}
                onChange={(e) => setEditFormData({ ...editFormData, approxDuration: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Delivery Target</label>
              <input
                type="text"
                value={editFormData.deliveryDate}
                onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#bba89d] mb-1">Editing Requirements</label>
            <textarea
              value={editFormData.requirements}
              onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
              className="w-full px-2.5 py-2 text-base sm:text-xs rounded-lg bg-[#180D1D]/90 border border-[#F6DBC0]/30 text-[#F8F4E9] resize-none h-16"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#F6DBC0] text-[#180D1D] font-bold text-xs hover:bg-[#F8F4E9] transition-all"
            >
              Update Summary
            </button>
          </div>
        </form>
      ) : (
        /* Order Review Details */
        <div className="space-y-2.5 text-xs text-[#d8cfc4] mb-4">
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/25 border border-white/05">
            <div>
              <span className="text-[10px] font-mono text-[#bba89d] block">CLIENT</span>
              <span className="font-bold text-[#F8F4E9]">{summary.customer.fullName}</span>
              <span className="block text-[11px] text-[#F6DBC0] font-mono">{summary.customer.mobileNumber}</span>
              <span className="block text-[11px] text-[#bba89d] truncate">{summary.customer.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#bba89d] block">SPECS</span>
              <span className="font-bold text-[#F8F4E9]">{summary.serviceName}</span>
              <span className="block text-[11px] text-[#F6DBC0] font-mono">{summary.aspectRatio} • {summary.videoFormat.toUpperCase()}</span>
              <span className="block text-[11px] text-[#bba89d]">Duration: {summary.approxDuration}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/25 border border-white/05 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#bba89d]">TIMELINE &amp; BRIEF</span>
              <span className="text-[10px] font-mono text-[#F6DBC0] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {summary.deliveryDate}
              </span>
            </div>
            <p className="text-[11px] text-[#F8F4E9] leading-relaxed italic line-clamp-3">
              &quot;{summary.requirements}&quot;
            </p>
            {summary.referenceVideoUrl && (
              <a
                href={summary.referenceVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#d68fad] hover:underline flex items-center gap-1 pt-1 truncate"
              >
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">Reference: {summary.referenceVideoUrl}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Optional File Upload Zone */}
      <div className="mb-4 p-3 rounded-xl bg-black/30 border border-[#F6DBC0]/15">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-[#F6DBC0]" />
            <span className="text-xs font-bold text-[#F8F4E9]">
              Optional File Upload
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#F6DBC0] font-mono">
              OPTIONAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#bba89d]">Max 50MB</span>
        </div>

        <p className="text-[10px] text-[#bba89d] mb-2 leading-relaxed">
          Upload raw footage, voiceover, audio, or brand assets. Stored in a private vault — never public.
        </p>

        {/* Upload Button & Drop Input */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            accept="video/*,audio/*,image/*,.zip,.pdf"
            disabled={isUploading || Boolean(confirmedOrder)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || Boolean(confirmedOrder)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-[#F8F4E9] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#F6DBC0]" />
                <span>Uploading ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3 h-3 text-[#F6DBC0]" />
                <span>Select Project Asset</span>
              </>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="mt-2 text-[10px] text-[#ff8f8f] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Staged Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {uploadedFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/05 border border-white/10 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#a8e6cf] shrink-0" />
                  <span className="text-[#F8F4E9] truncate font-mono text-[11px]">{f.name}</span>
                  <span className="text-[10px] text-[#bba89d] shrink-0">
                    ({(f.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                {!confirmedOrder && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.id)}
                    className="p-1 text-[#ff8f8f] hover:text-white transition-colors"
                    title="Remove asset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Breakdown (50% Advance Model) */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[rgba(80,45,85,0.4)] to-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/25">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#F6DBC0] mb-2 font-bold flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Schedule</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[#d8cfc4]">
            <span>Total Package Value:</span>
            <span className="font-mono text-[#F8F4E9]">₹{summary.pricing.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-y border-[#F6DBC0]/15 font-bold">
            <span className="text-[#F6DBC0]">50% Advance (Due Now):</span>
            <span className="text-sm font-mono text-[#F8F4E9] bg-[#502D55] px-2 py-0.5 rounded border border-[#F6DBC0]/30">
              ₹{summary.pricing.advanceAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-[#bba89d] text-[11px]">
            <span>Remaining upon Draft Delivery:</span>
            <span className="font-mono">₹{summary.pricing.remainingAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {submissionError && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Action CTA: Advance Payment & Confirmation */}
      {confirmedOrder ? (
        confirmedOrder.paymentStatus === "advance_paid" || paidPaymentRecord ? (
          <div className="space-y-2 p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/80 to-[#180D1D] border border-emerald-500/50 text-emerald-100 shadow-lg">
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs">
                  50% Advance Confirmed: {confirmedOrder.orderNumber}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Advance Paid
              </span>
            </div>
            <div className="text-[11px] space-y-1 text-emerald-200">
              <div className="flex justify-between">
                <span>Advance Paid:</span>
                <span className="font-mono font-bold text-emerald-300">
                  ₹{confirmedOrder.pricing.advanceAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining 50% Balance (Due on delivery):</span>
                <span className="font-mono text-[#F8F4E9]">
                  ₹{confirmedOrder.pricing.remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {paidPaymentRecord && (
                <div className="flex justify-between text-[10px] text-emerald-300/80 font-mono">
                  <span>Payment Ref:</span>
                  <span className="truncate max-w-[180px]">{paidPaymentRecord.razorpayPaymentId}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-[#F6DBC0] font-mono pt-1">
                <span>Current Pipeline:</span>
                <span className="font-bold">awaiting_editor_assignment</span>
              </div>
            </div>
            <div className="pt-2">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with Imdad on WhatsApp ({confirmedOrder.orderNumber})</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-100 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-xs text-amber-200">
                  Order Registered — Advance Payment Required
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unpaid
              </span>
            </div>

            <div className="text-[11px] space-y-1 text-amber-200/90 leading-relaxed">
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-white">{confirmedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>50% Advance Due:</span>
                <span className="font-mono font-bold text-amber-300">
                  ₹{confirmedOrder.pricing.advanceAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-amber-200/70">
                <span>Remaining on Delivery:</span>
                <span className="font-mono">
                  ₹{confirmedOrder.pricing.remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="pt-1 text-[11px] text-amber-200/80">
                Production begins and an editor is allocated immediately upon advance payment verification.
              </p>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("imdad:initiate-video-payment", {
                      detail: { order: confirmedOrder, paymentContract, paymentType: "advance" },
                    })
                  );
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-black" />
                <span>Pay 50% Advance with Razorpay (₹{confirmedOrder.pricing.advanceAmount.toLocaleString("en-IN")})</span>
              </button>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-white/15"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#F6DBC0]" />
                <span>Inquire on WhatsApp ({confirmedOrder.orderNumber})</span>
              </a>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={isSubmitting || isEditing}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#180D1D] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(246,219,192,0.3)] hover:shadow-[0_0_30px_rgba(246,219,192,0.5)] transition-all cursor-pointer focus-ring disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#180D1D]" />
                <span>Registering Verified Order...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#180D1D]" />
                <span>Proceed to Advance Payment (₹{summary.pricing.advanceAmount.toLocaleString("en-IN")})</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-[#bba89d] font-mono">
            Secure order handoff • 50% advance booking • 0 hidden fees
          </p>
        </div>
      )}
    </div>
  );
}
