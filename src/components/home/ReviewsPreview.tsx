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
    <section className="py-14 sm:py-20 relative overflow-hidden">
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
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors self-start sm:self-auto shrink-0 pb-1 min-h-[44px]"
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
                className="rounded-2xl p-5 sm:p-6 bg-white/80 border border-slate-200 hover:border-[#0284C7]/40 hover:bg-white backdrop-blur-xl transition-all flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &ldquo;{review.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#0A192F]">
                      {review.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{review.service}</div>
                  </div>

                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7] font-semibold">
                      <CheckCircle className="w-3 h-3 text-[#0284C7]" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Honest Empty State when no reviews have been submitted or approved yet */
          <div className="rounded-2xl p-6 sm:p-10 bg-white/90 border border-slate-200 backdrop-blur-xl text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mx-auto mb-4">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A192F]">
              Authentic Reviews Only — Zero Fake Testimonials
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              We never fabricate testimonials or invent placeholder customer reviews. Client feedback is collected and verified following project milestones.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Link
                href="/reviews"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369A1] transition-all shadow-sm"
              >
                Leave a Review
              </Link>
              <Link
                href="/reviews"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold text-[#0A192F] hover:bg-slate-50 bg-white border border-slate-200 transition-all shadow-2xs"
              >
                View Reviews Hub
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
