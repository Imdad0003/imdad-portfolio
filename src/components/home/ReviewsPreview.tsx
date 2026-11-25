import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getApprovedReviews, PublicReview } from "@/lib/reviews";
import { Star, CheckCircle, ArrowRight, MessageSquareHeart } from "lucide-react";

export async function ReviewsPreview() {
  const allApproved = await getApprovedReviews();
  const topReviews: PublicReview[] = allApproved.slice(0, 3);

  return (
    <section className="py-14 sm:py-20 bg-[#FAF7F2]">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <SectionHeading
            badgeText="Verified Feedback"
            title="What Clients Say"
            description="Honest feedback from businesses and creators who collaborate with Imdad."
            className="mb-0"
          />

          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C96A50] hover:text-[#B4583F] transition-colors self-start sm:self-auto shrink-0 pb-1 min-h-[44px]"
          >
            <span>View All Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {topReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl p-5 sm:p-6 bg-white border border-[#E8DFD5] hover:border-[#D8A999] transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#D9934C] mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-[#D9934C] text-[#D9934C]" : "text-[#E8DFD5]"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed italic">
                    &ldquo;{review.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3ECE4] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#332924]">
                      {review.name}
                    </div>
                    <div className="text-[11px] text-[#8A7C75]">{review.service}</div>
                  </div>

                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAECE4] border border-[#F0CFC0] text-[#B4583F] font-semibold">
                      <CheckCircle className="w-3 h-3 text-[#C96A50]" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl p-6 sm:p-10 bg-white border border-[#E8DFD5] text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FAECE4] border border-[#F0CFC0] flex items-center justify-center text-[#C96A50] mx-auto mb-4">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#332924]">
              Authentic Reviews Only
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#5F534D] leading-relaxed max-w-lg mx-auto">
              Client feedback is collected and verified directly after project completion.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/reviews"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold bg-[#C96A50] text-white hover:bg-[#B4583F] transition-colors"
              >
                Leave a Review
              </Link>
              <Link
                href="/reviews"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-[#332924] hover:bg-[#FAF7F2] bg-white border border-[#E8DFD5] transition-colors"
              >
                View Reviews
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
