"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VideoOrder, PaymentInitiationContract, OrderPaymentRecord } from "@/types/video-order";
import { getWhatsAppUrl } from "@/data/config";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Lock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface PaymentInitiationEventDetail {
  order: VideoOrder;
  paymentContract?: PaymentInitiationContract;
  paymentType?: "advance" | "remaining" | "full";
}

interface RazorpayCheckoutModalProps {
  order?: VideoOrder | null;
  paymentType?: "advance" | "remaining" | "full";
  isOpen?: boolean;
  onClose?: () => void;
  onPaymentSuccess?: (orderNumber: string, payment: OrderPaymentRecord) => void;
}

export function RazorpayCheckoutModal({
  order: propOrder,
  paymentType: propPaymentType = "advance",
  isOpen: propIsOpen,
  onClose,
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const [activeOrder, setActiveOrder] = useState<VideoOrder | null>(propOrder || null);
  const [activePaymentType, setActivePaymentType] = useState<"advance" | "remaining" | "full">(
    propPaymentType
  );
  const [isOpen, setIsOpen] = useState(Boolean(propIsOpen));
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<OrderPaymentRecord | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propOrder) setActiveOrder(propOrder);
  }, [propOrder]);

  useEffect(() => {
    if (typeof propIsOpen === "boolean") setIsOpen(propIsOpen);
  }, [propIsOpen]);

  // Load Razorpay Checkout SDK dynamically
  useEffect(() => {
    if (window.Razorpay) {
      setIsSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsSdkLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK script.");
      setErrorMessage("Could not connect to payment gateway. Please check your internet connection.");
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script to allow caching
    };
  }, []);

  // Listen to global custom event "imdad:initiate-video-payment" from Chatbot or cards
  useEffect(() => {
    const handleInitiatePayment = (event: Event) => {
      const customEvent = event as CustomEvent<PaymentInitiationEventDetail>;
      if (customEvent.detail && customEvent.detail.order) {
        setActiveOrder(customEvent.detail.order);
        setActivePaymentType(customEvent.detail.paymentType || "advance");
        setIsOpen(true);
        setErrorMessage(null);
        setVerifiedPayment(null);
      }
    };

    window.addEventListener("imdad:initiate-video-payment", handleInitiatePayment);
    return () => {
      window.removeEventListener("imdad:initiate-video-payment", handleInitiatePayment);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isVerifying) return; // Prevent closing during cryptographic verification
    setIsOpen(false);
    setErrorMessage(null);
    if (onClose) onClose();
  }, [isVerifying, onClose]);

  // Handle Payment Initiation
  const handleLaunchRazorpay = async () => {
    if (!activeOrder) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const orderToken = activeOrder.accessToken;

      // 1. Create Order on Backend with mandatory customer access token
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orderToken ? { "x-order-token": orderToken } : {}),
        },
        body: JSON.stringify({
          orderId: activeOrder.id,
          paymentType: activePaymentType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment order.");
      }

      const { razorpayOrderId, amountInPaise, keyId, description } = data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "IMDAD.BUILDS",
        description: description || `Video Order ${activeOrder.orderNumber}`,
        image: "/favicon.ico",
        order_id: razorpayOrderId,
        prefill: {
          name: activeOrder.customer.fullName,
          email: activeOrder.customer.email,
          contact: activeOrder.customer.mobileNumber,
        },
        notes: {
          orderId: activeOrder.id,
          orderNumber: activeOrder.orderNumber,
          paymentType: activePaymentType,
        },
        theme: {
          color: "#502D55",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          // 3. Cryptographically Verify on Server
          setIsVerifying(true);
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(orderToken ? { "x-order-token": orderToken } : {}),
              },
              body: JSON.stringify({
                orderId: activeOrder.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentType: activePaymentType,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Cryptographic signature verification failed.");
            }

            setVerifiedPayment(verifyData.paymentRecord);
            if (onPaymentSuccess) {
              onPaymentSuccess(activeOrder.orderNumber, verifyData.paymentRecord);
            }

            // Dispatch global success event for cards and order listeners
            window.dispatchEvent(
              new CustomEvent("imdad:video-payment-success", {
                detail: {
                  orderId: activeOrder.id,
                  orderNumber: activeOrder.orderNumber,
                  payment: verifyData.paymentRecord,
                  order: verifyData.order || activeOrder,
                  paymentStatus: verifyData.paymentStatus || "advance_paid",
                },
              })
            );
          } catch (vErr) {
            console.error("Verification error:", vErr);
            setErrorMessage(
              vErr instanceof Error
                ? vErr.message
                : "Payment signature could not be verified by the server."
            );
          } finally {
            setIsVerifying(false);
            setIsProcessing(false);
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh the page.");
      }

      const rzpInstance = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzpInstance.on("payment.failed", (failedRes: any) => {
        console.error("Razorpay payment failed:", failedRes.error);
        setErrorMessage(failedRes.error?.description || "Payment attempt failed or was declined.");
        setIsProcessing(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Payment failed to start.");
      setIsProcessing(false);
    }
  };

  if (!isOpen || !activeOrder) return null;

  const dueAmount =
    activePaymentType === "remaining"
      ? activeOrder.pricing.remainingAmount
      : activePaymentType === "full"
      ? activeOrder.pricing.totalAmount
      : activeOrder.pricing.advanceAmount;

  const whatsappInquiryUrl = getWhatsAppUrl(
    `Hi Imdad, my payment for Video Order ${activeOrder.orderNumber} is verified!\n` +
      `• Payment ID: ${verifiedPayment?.razorpayPaymentId || "Verified"}\n` +
      `• Advance Paid: ₹${dueAmount}\n` +
      `• Service: ${activeOrder.project.serviceName} (${activeOrder.project.aspectRatio})\n` +
      `Looking forward to editor assignment!`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#24102c] via-[#1a0a20] to-[#110515] border border-[#F6DBC0]/30 shadow-[0_0_50px_rgba(80,45,85,0.5)] overflow-hidden text-[#F8F4E9]">
        {/* Top Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F6DBC0] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#502D55] border border-[#F6DBC0]/40 flex items-center justify-center text-[#F6DBC0] shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8F4E9] tracking-tight">
                {verifiedPayment ? "Payment Verified" : "Secure Razorpay Checkout"}
              </h3>
              <p className="text-xs font-mono text-[#F6DBC0]/80">
                Order: {activeOrder.orderNumber}
              </p>
            </div>
          </div>

          {!isVerifying && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* SUCCESS STATE */}
          {verifiedPayment ? (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#F8F4E9]">
                  {activePaymentType === "advance"
                    ? "50% Advance Confirmed!"
                    : "Payment Successful!"}
                </h4>
                <p className="text-xs text-[#d8cfc4] mt-1 max-w-sm mx-auto">
                  Your payment has been cryptographically verified on our backend.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl bg-white/05 border border-white/10 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Order Number:</span>
                  <span className="text-[#F8F4E9] font-bold">{activeOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Payment ID:</span>
                  <span className="text-[#F6DBC0] truncate max-w-[200px]">
                    {verifiedPayment.razorpayPaymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Amount Paid:</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{verifiedPayment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                {activePaymentType === "advance" && (
                  <div className="flex justify-between border-t border-white/10 pt-2 text-[11px]">
                    <span className="text-[#bba89d]">Remaining Balance (Due upon delivery):</span>
                    <span className="text-[#F8F4E9]">
                      ₹{activeOrder.pricing.remainingAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 text-[11px]">
                  <span className="text-[#bba89d]">Pipeline Status:</span>
                  <span className="text-[#F6DBC0] font-bold">awaiting_editor_assignment</span>
                </div>
              </div>

              {/* Multi-channel Notification Confirmation */}
              <p className="text-[11px] text-[#bba89d]">
                Confirmation email sent to <strong>{activeOrder.customer.email}</strong> and studio notifications dispatched.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Confirm on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8F4E9] font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT PREPARATION STATE */
            <div className="space-y-4">
              {/* Order Specs */}
              <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Service:</span>
                  <span className="text-[#F8F4E9] font-semibold">
                    {activeOrder.project.serviceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Specifications:</span>
                  <span className="text-[#F8F4E9]">
                    {activeOrder.project.aspectRatio} • {activeOrder.project.approxDuration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Customer:</span>
                  <span className="text-[#F8F4E9]">{activeOrder.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#bba89d]">Contact:</span>
                  <span className="text-[#F8F4E9]">{activeOrder.customer.mobileNumber}</span>
                </div>
              </div>

              {/* 50% Advance Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[rgba(80,45,85,0.4)] to-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/30 space-y-2.5">
                <div className="flex justify-between text-xs text-[#d8cfc4]">
                  <span>Total Project Value:</span>
                  <span className="font-mono text-[#F8F4E9]">
                    ₹{activeOrder.pricing.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-y border-[#F6DBC0]/20 font-bold">
                  <span className="text-xs text-[#F6DBC0]">
                    {activePaymentType === "advance"
                      ? "50% Advance Due Now:"
                      : activePaymentType === "remaining"
                      ? "Remaining Balance Due:"
                      : "Total Amount Due:"}
                  </span>
                  <span className="text-lg font-mono text-[#F8F4E9] bg-[#502D55] px-3 py-1 rounded-xl border border-[#F6DBC0]/40 shadow-sm">
                    ₹{dueAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {activePaymentType === "advance" && (
                  <div className="flex justify-between text-[11px] text-[#bba89d]">
                    <span>Remaining 50% Balance:</span>
                    <span className="font-mono">
                      ₹{activeOrder.pricing.remainingAmount.toLocaleString("en-IN")} (Due after final cut review)
                    </span>
                  </div>
                )}
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleLaunchRazorpay}
                  disabled={isProcessing || isVerifying || !isSdkLoaded}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#180D1D] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(246,219,192,0.35)] hover:shadow-[0_0_40px_rgba(246,219,192,0.5)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#180D1D]" />
                      <span>Verifying Cryptographic Signature...</span>
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#180D1D]" />
                      <span>Opening Secure Razorpay Portal...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#180D1D]" />
                      <span>Pay ₹{dueAmount.toLocaleString("en-IN")} with Razorpay</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#bba89d] font-mono flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#F6DBC0]" />
                  <span>Server-side HMAC verification • 256-bit SSL encrypted • Official Razorpay Gateway</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
