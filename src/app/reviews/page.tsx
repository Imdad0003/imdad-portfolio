"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeaveReviewModal } from "@/components/reviews/LeaveReviewModal";
import { PublicReview } from "@/lib/reviews";
import { Star, CheckCircle, Plus, ShieldCheck, MessageSquareHeart } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = useCallback(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data?.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!ignore && data?.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load reviews:", err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#502D55]/10 mb-12">
          <SectionHeading
            badgeText="Authentic Client Feedback"
            title="Real Reviews From Real Projects"
            description="All reviews shown below are submitted by verified clients upon completed milestones. Zero placeholder reviews."
            className="mb-0"
          />

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 text-[#F6DBC0]" />
            <span>Leave a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-20 text-xs text-[#7A6880]">
            Loading verified reviews...
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl p-6 sm:p-7 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#e6983b] mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-[#e6983b] text-[#e6983b]" : "text-[#dcd0d9]"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed italic">
                    &ldquo;{review.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#502D55]/08 flex items-end justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#180D1D]">
                      {review.name}
                    </div>
                    <div className="text-[11px] text-[#7A3F26] font-medium mt-0.5">
                      {review.service}
                    </div>
                    <div className="text-[10px] text-[#7A6880] mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Verified Customer Badge */}
                  {review.verified && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FAF0F4] border border-[#d69fb5]/40 text-[#78284C] font-semibold shrink-0">
                      <CheckCircle className="w-3 h-3 text-[#78284C]" />
                      <span>Verified Customer</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State when no reviews have been approved yet */
          <div className="rounded-3xl p-10 sm:p-14 bg-white/80 border border-[#502D55]/10 backdrop-blur-2xl text-center max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] mx-auto shadow-sm">
              <MessageSquareHeart className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight">
              Real Reviews Only — Zero Fake Testimonials
            </h3>

            <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed max-w-md mx-auto">
              I do not fabricate fake customer reviews or stock-photo profiles. Client reviews appear here once verified and approved following milestone completion.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded-full font-bold text-xs bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-sm transition-all cursor-pointer"
              >
                Be The First To Review
              </button>
            </div>
          </div>
        )}

        {/* Verification Policy Disclaimer */}
        <div className="mt-20 p-6 rounded-2xl bg-white/80 border border-[#502D55]/10 backdrop-blur-xl text-center max-w-xl mx-auto text-xs text-[#56475C] space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-[#180D1D] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#935073]" />
            <span>Authenticity Guarantee</span>
          </div>
          <p className="leading-relaxed text-[11px] text-[#7A6880]">
            The &quot;Verified Customer&quot; badge indicates that the review was linked to an authentic service delivery. Submissions are moderated to prevent spam and impersonation.
          </p>
        </div>

        {/* Leave Review Modal */}
        <LeaveReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchReviews}
        />
      </Container>
    </div>
  );
}
