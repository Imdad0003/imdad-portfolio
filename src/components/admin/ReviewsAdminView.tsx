"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Check,
  X,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import type { ReviewDocument } from "@/types/cms";

interface ReviewsAdminViewProps {
  reviews: ReviewDocument[];
  onUpdateStatus: (
    id: string,
    status: ReviewDocument["status"],
    verified?: boolean
  ) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}

export function ReviewsAdminView({
  reviews,
  onUpdateStatus,
  onDeleteReview,
}: ReviewsAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.name?.toLowerCase().includes(q) ||
      r.review?.toLowerCase().includes(q) ||
      r.service?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Social Proof & Moderation
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Client Testimonials & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce authentic reviews policy. Approve verified client submissions
            for public display.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">
              Average Rating
            </span>
            <span className="font-extrabold text-[#0A192F] flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{averageRating} / 5.0</span>
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">
              Pending Queue
            </span>
            <span className="font-extrabold text-amber-600 text-sm">
              {pendingCount} review{pendingCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#0284C7] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              statusFilter === "rejected"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
            }`}
          >
            Rejected ({reviews.length - pendingCount - approvedCount})
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author name, company, or testimonial text..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredReviews.length} result{filteredReviews.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Reviews Table */}
      {filteredReviews.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-8">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0A192F]">
            No reviews found in this filter
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Client feedback submitted through the public website will appear here
            for administrator verification.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Author & Contact</th>
                  <th className="py-3.5 px-4 font-medium">Rating</th>
                  <th className="py-3.5 px-4 font-medium">Service / Project</th>
                  <th className="py-3.5 px-4 font-medium">Testimonial</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0A192F] flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <span title="Verified Client">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rev.email || "Public Submission"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (rev.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                        {rev.service || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{rev.review}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rev.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rev.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              void onUpdateStatus(rev.id, "approved", true)
                            }
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {rev.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              void onUpdateStatus(rev.id, "rejected")
                            }
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void onDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
