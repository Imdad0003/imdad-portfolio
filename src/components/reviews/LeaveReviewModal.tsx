"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle, ShieldCheck } from "lucide-react";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeaveReviewModal({
  isOpen,
  onClose,
  onSuccess,
}: LeaveReviewModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("Please check the consent box to proceed.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          service,
          rating,
          review,
          consent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setService("");
    setRating(5);
    setReview("");
    setConsent(false);
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 border border-[#502D55]/15 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(80,45,85,0.15)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#7A6880] hover:text-[#180D1D] bg-white border border-[#502D55]/15 hover:border-[#935073]/40 transition-colors cursor-pointer shadow-2xs"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] mx-auto shadow-md">
              <CheckCircle className="w-8 h-8 text-[#7A3F26]" />
            </div>

            <h3 className="text-2xl font-black text-[#180D1D] tracking-tight">
              Review Submitted!
            </h3>

            <p className="text-xs sm:text-sm text-[#56475C] max-w-md mx-auto leading-relaxed">
              Thank you for sharing your experience! Your review has been submitted for approval.
              To maintain authenticity and prevent spam, all submissions are reviewed before appearing publicly.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full font-bold text-xs bg-[#180D1D] text-[#F8F4E9] hover:bg-[#2B1435] transition-all cursor-pointer shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Review Submission Form */
          <div>
            <div className="mb-6 pr-8">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF0F4] border border-[#d69fb5]/40 text-[#78284C] font-semibold">
                Client Experience
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight mt-2">
                Leave a Verified Review
              </h3>
              <p className="text-xs text-[#56475C] mt-1">
                Your feedback helps other sellers and businesses choose the right services.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#7A6880] font-bold mb-2">
                  Rating: {rating} of 5 Stars
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer focus-ring rounded"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          (hoverRating || rating) >= star
                            ? "fill-[#e6983b] text-[#e6983b]"
                            : "text-[#dcd0d9]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#180D1D] font-bold mb-1">
                  Full Name / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma or Brand Studio"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] placeholder-[#7A6880]/50 focus:border-[#935073] focus:outline-none text-xs sm:text-sm shadow-2xs"
                />
              </div>

              {/* Email Input (Private) */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#180D1D] font-bold mb-1">
                  Email Address * (Never Displayed Publicly)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] placeholder-[#7A6880]/50 focus:border-[#935073] focus:outline-none text-xs sm:text-sm shadow-2xs"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-[#7A6880] mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#935073]" />
                  <span>Used only for order verification. Never shared or published.</span>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#180D1D] font-bold mb-1">
                  Service Completed *
                </label>
                <input
                  type="text"
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Amazon Listing Pro, 7-Image Deck, Shopify Store..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] placeholder-[#7A6880]/50 focus:border-[#935073] focus:outline-none text-xs sm:text-sm shadow-2xs"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#180D1D] font-bold mb-1">
                  Your Review / Experience * (10–1,500 characters)
                </label>
                <textarea
                  required
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share details about the quality of deliverables, turnaround speed, and communication..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#502D55]/15 text-[#180D1D] placeholder-[#7A6880]/50 focus:border-[#935073] focus:outline-none text-xs sm:text-sm resize-none shadow-2xs"
                />
              </div>

              {/* Public Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#56475C]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#502D55]/30 text-[#935073] focus:ring-[#935073] accent-[#935073]"
                  />
                  <span>
                    I agree to have this review and my name displayed publicly on this website once approved.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#56475C] hover:text-[#180D1D] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
