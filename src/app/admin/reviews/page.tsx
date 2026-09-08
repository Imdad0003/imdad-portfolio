"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Review, ReviewStatus } from "@/lib/reviews";
import {
  ShieldCheck,
  Check,
  X,
  Trash2,
  Lock,
  Star,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [passcode, setPasscode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authorization failed");
      }
      setReviews(data.reviews || []);
      setAuthorized(true);
      sessionStorage.setItem("imdad_admin_key", key);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load admin reviews");
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check existing session
  useEffect(() => {
    let ignore = false;
    const saved = sessionStorage.getItem("imdad_admin_key");
    if (saved) {
      fetch(`/api/admin/reviews?key=${encodeURIComponent(saved)}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Authorization failed");
          if (!ignore) {
            setPasscode(saved);
            setReviews(data.reviews || []);
            setAuthorized(true);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err instanceof Error ? err.message : "Failed to load admin reviews");
            setAuthorized(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews(passcode);
  };

  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(passcode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchReviews(passcode);
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(passcode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verified: !current }),
      });
      if (res.ok) {
        fetchReviews(passcode);
      }
    } catch (err) {
      console.error("Verification toggle failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(passcode)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchReviews(passcode);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!authorized) {
    return (
      <div className="py-24">
        <Container>
          <div className="max-w-md mx-auto rounded-3xl bg-[rgba(30,12,38,0.7)] border border-[#F6DBC0]/25 p-8 backdrop-blur-2xl text-center shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[rgba(56,24,66,0.8)] border border-[#F6DBC0]/30 flex items-center justify-center text-[#F6DBC0] mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-black text-[#F8F4E9]">Review Moderation Admin</h2>
            <p className="text-xs text-[#d8cfc4] mt-1 mb-6">
              Enter admin secret passcode to moderate submissions.
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Admin Passcode"
                className="w-full py-2.5 px-4 rounded-xl bg-[rgba(20,8,26,0.7)] border border-[#F6DBC0]/20 text-[#F8F4E9] text-xs focus:border-[#F6DBC0] focus:outline-none text-center"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Access Dashboard"}
              </button>
            </form>
          </div>
        </Container>
      </div>
    );
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F6DBC0]/15 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F6DBC0] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Studio Moderation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F8F4E9]">
              Review Management ({reviews.length} Total)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchReviews(passcode)}
              className="p-2 rounded-xl text-[#d8cfc4] hover:text-[#F8F4E9] bg-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/20 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("imdad_admin_key");
                setAuthorized(false);
              }}
              className="px-3 py-2 rounded-xl text-xs text-[#bba89d] hover:text-red-400 bg-[rgba(20,8,26,0.6)] border border-[#F6DBC0]/15 cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-center">
          <div className="p-4 rounded-2xl bg-[rgba(30,12,38,0.6)] border border-amber-500/30">
            <div className="text-2xl font-black text-amber-300">{pending.length}</div>
            <div className="text-xs text-[#d8cfc4]">Pending Moderation</div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(30,12,38,0.6)] border border-emerald-500/30">
            <div className="text-2xl font-black text-emerald-300">{approved.length}</div>
            <div className="text-xs text-[#d8cfc4]">Approved (Public)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[rgba(30,12,38,0.6)] border border-rose-500/30">
            <div className="text-2xl font-black text-rose-300">{rejected.length}</div>
            <div className="text-xs text-[#d8cfc4]">Rejected</div>
          </div>
        </div>

        {/* Reviews Moderation Cards */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-xs text-[#bba89d] bg-[rgba(30,12,38,0.4)] rounded-2xl border border-[#F6DBC0]/15">
            No customer review submissions found in the database.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 sm:p-6 rounded-2xl bg-[rgba(30,12,38,0.6)] border border-[#F6DBC0]/15 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  {/* Status & Verification Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                        r.status === "approved"
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                          : r.status === "rejected"
                          ? "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                          : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {r.status}
                    </span>

                    {r.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/80 text-[#F6DBC0] border border-[#F6DBC0]/30 font-semibold">
                        <BadgeCheck className="w-3 h-3 text-[#F6DBC0]" />
                        Verified Order
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#bba89d] font-mono">
                        (Unverified Order)
                      </span>
                    )}

                    <span className="text-[11px] text-[#bba89d]">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#F6DBC0]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? "fill-[#F6DBC0] text-[#F6DBC0]" : "text-[#d8cfc4]/30"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold ml-1 text-[#F8F4E9]">{r.rating}/5</span>
                  </div>

                  {/* Customer Info (Admin only: Email visible for verification) */}
                  <div className="text-xs text-[#d8cfc4]">
                    <strong className="text-[#F8F4E9]">{r.name}</strong> •{" "}
                    <span className="text-[#F6DBC0]">{r.service}</span> •{" "}
                    <span className="text-[#bba89d] font-mono text-[11px]">[{r.email}]</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed italic bg-[rgba(20,8,26,0.5)] p-3 rounded-xl border border-[#F6DBC0]/10">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                  {r.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.id, "approved")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {r.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-200 hover:bg-rose-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleVerified(r.id, r.verified)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/25 text-[#d8cfc4] hover:text-[#F6DBC0] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>{r.verified ? "Remove Verified" : "Mark Verified"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-[#bba89d] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
