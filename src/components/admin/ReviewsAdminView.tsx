"use client";

import React, { useState } from "react";
import type { ReviewDocument } from "@/types/cms";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  Search,
  MessageSquareHeart,
  BadgeCheck,
  Clock,
  Loader2,
} from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewDocument["status"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : "5.0";

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const filtered = reviews.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.service || "").toLowerCase().includes(q) ||
      r.review.toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleStatusChange = async (
    id: string,
    status: ReviewDocument["status"],
    verified?: boolean
  ) => {
    setBusyId(id);
    try {
      await onUpdateStatus(id, status, verified);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await onDeleteReview(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs">
          <div className="text-xs font-mono text-[#8A7C75]">Total Reviews</div>
          <div className="text-2xl font-display font-bold text-[#332924] mt-1">{counts.all}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <div className="text-xs font-mono text-amber-800">Pending Approval</div>
          <div className="text-2xl font-display font-bold text-amber-800 mt-1">{counts.pending}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <div className="text-xs font-mono text-emerald-800">Approved Live</div>
          <div className="text-2xl font-display font-bold text-emerald-800 mt-1">{counts.approved}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAECE4]/60 border border-[#EED3C5] shadow-2xs">
          <div className="text-xs font-mono text-[#B4583F]">Average Rating</div>
          <div className="text-2xl font-display font-bold text-[#332924] mt-1 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-[#332924] text-white"
                  : "bg-[#FAF7F2] text-[#5F534D] border border-[#E8DFD5] hover:bg-[#FAECE4]"
              }`}
            >
              {st} ({counts[st]})
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-[#8A7C75] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews or client name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#332924] focus:outline-none focus:border-[#C96A50]"
          />
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center space-y-2">
          <MessageSquareHeart className="w-8 h-8 text-[#8A7C75] mx-auto" />
          <p className="text-sm font-bold text-[#332924]">No reviews in this view</p>
          <p className="text-xs text-[#6E625B]">Customer reviews submitted on /reviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-[#E8DFD5] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[#332924]">{rev.name}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD5] text-[#5F534D]">
                    {rev.service || "General"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      rev.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : rev.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {rev.status === "pending" && <Clock className="w-3 h-3" />}
                    <span>{rev.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>

                <p className="text-xs text-[#5F534D] leading-relaxed">&ldquo;{rev.review}&rdquo;</p>

                <div className="text-[11px] font-mono text-[#8A7C75]">
                  {rev.email ? `${rev.email} • ` : ""}
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={busyId === rev.id}
                  onClick={() => void handleStatusChange(rev.id, "approved", true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  disabled={busyId === rev.id}
                  onClick={() => void handleStatusChange(rev.id, "rejected", rev.verified)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  disabled={busyId === rev.id}
                  onClick={() => void handleDelete(rev.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {busyId === rev.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
