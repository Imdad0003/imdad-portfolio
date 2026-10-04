"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { verifyAdminStatus, adminSignIn } from "@/lib/auth";
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
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passcode, setPasscode] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews directly from Firestore if admin authenticated, or via API route
  const fetchReviewsFromFirestore = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: Review[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "Anonymous",
          email: data.email || "",
          service: data.service || "General",
          rating: Number(data.rating) || 5,
          review: data.review || "",
          image: data.image,
          status: (data.status as ReviewStatus) || "pending",
          verified: Boolean(data.verified),
          createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
          updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
        };
      });
      setReviews(list);
    } catch (err: unknown) {
      console.warn("Firestore reviews fetch fallback to API:", err);
      // Fallback to server API if direct rules query was denied or failed
      const savedKey = sessionStorage.getItem("imdad_admin_key") || "imdad-admin-2026";
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(savedKey)}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await verifyAdminStatus(user);
        if (isAdmin) {
          setCurrentUser(user);
          setAuthorized(true);
          fetchReviewsFromFirestore();
        } else {
          setCurrentUser(null);
          setAuthorized(false);
        }
      } else {
        // Check session passcode fallback
        const savedKey = sessionStorage.getItem("imdad_admin_key");
        if (savedKey) {
          fetch(`/api/admin/reviews?key=${encodeURIComponent(savedKey)}`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
                setAuthorized(true);
                setPasscode(savedKey);
              }
            })
            .catch(() => {});
        }
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [fetchReviewsFromFirestore]);

  // Handle Firebase Email/Pass login
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await adminSignIn(emailInput, passwordInput);
      setCurrentUser(user);
      setAuthorized(true);
      fetchReviewsFromFirestore();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Passcode Fallback
  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(passcode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid passcode");
      setReviews(data.reviews || []);
      setAuthorized(true);
      sessionStorage.setItem("imdad_admin_key", passcode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    if (db && currentUser) {
      try {
        await setDoc(doc(db, "reviews", id), { status, updatedAt: new Date().toISOString() }, { merge: true });
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        return;
      } catch (err) {
        console.warn("Direct Firestore update failed, falling back to API:", err);
      }
    }

    try {
      const key = passcode || sessionStorage.getItem("imdad_admin_key") || "imdad-admin-2026";
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleToggleVerified = async (id: string, current: boolean) => {
    const nextVal = !current;
    if (db && currentUser) {
      try {
        await setDoc(doc(db, "reviews", id), { verified: nextVal, updatedAt: new Date().toISOString() }, { merge: true });
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, verified: nextVal } : r)));
        return;
      } catch (err) {
        console.warn("Direct Firestore verified update failed, falling back to API:", err);
      }
    }

    try {
      const key = passcode || sessionStorage.getItem("imdad_admin_key") || "imdad-admin-2026";
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verified: nextVal }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, verified: nextVal } : r)));
      }
    } catch (err) {
      console.error("Verification toggle failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    if (db && currentUser) {
      try {
        await deleteDoc(doc(db, "reviews", id));
        setReviews((prev) => prev.filter((r) => r.id !== id));
        return;
      } catch (err) {
        console.warn("Direct Firestore delete failed, falling back to API:", err);
      }
    }

    try {
      const key = passcode || sessionStorage.getItem("imdad_admin_key") || "imdad-admin-2026";
      const res = await fetch(`/api/admin/reviews?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#56475C]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#935073]" />
          <span>Checking admin session...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="py-24">
        <Container>
          <div className="max-w-md mx-auto rounded-3xl bg-white border border-[#502D55]/14 p-8 backdrop-blur-2xl text-center shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#502D55]/10 text-[#502D55] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] mb-3">
              Admin Restricted
            </div>

            <h2 className="text-xl font-black text-[#180D1D]">Review Moderation Desk</h2>
            <p className="text-xs text-[#56475C] mt-1 mb-6">
              Sign in with your verified administrator credentials to access review moderation.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFirebaseLogin} className="space-y-3.5 text-left mb-6">
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="imdad.builds@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] focus:outline-none focus:ring-2 focus:ring-[#935073]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] focus:outline-none focus:ring-2 focus:ring-[#935073]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? "Authenticating..." : "Admin Sign In"}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-[#502D55]/10">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-[#935073] hover:underline font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Open Full Studio Admin CMS</span>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  return (
    <div className="py-12 sm:py-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#502D55]/10 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#7A3F26] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Studio Moderation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#180D1D]">
              Review Management ({reviews.length} Total)
            </h1>
            <p className="text-xs text-[#56475C]">
              {currentUser ? `Authenticated as ${currentUser.email}` : "Passcode Session Active"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] hover:bg-[#F3E5D8] transition-colors"
            >
              &larr; Studio CMS
            </Link>
            <button
              type="button"
              onClick={fetchReviewsFromFirestore}
              className="p-2 rounded-xl text-[#56475C] hover:text-[#180D1D] bg-white border border-[#502D55]/15 text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-2xl font-black text-amber-900">{pending.length}</div>
            <div className="text-xs text-amber-700">Pending Moderation</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-2xl font-black text-emerald-900">{approved.length}</div>
            <div className="text-xs text-emerald-700">Approved (Public)</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="text-2xl font-black text-rose-900">{rejected.length}</div>
            <div className="text-xs text-rose-700">Rejected</div>
          </div>
        </div>

        {/* Reviews Moderation Cards */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-xs text-[#56475C] bg-white rounded-2xl border border-[#502D55]/12">
            No customer review submissions found in the database.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-3xl">
                  {/* Status & Verification Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                        r.status === "approved"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                          : r.status === "rejected"
                          ? "bg-rose-50 text-rose-800 border border-rose-300"
                          : "bg-amber-50 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {r.status}
                    </span>

                    {r.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Verified Client</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#7A6880] bg-gray-100 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-[#7A6880]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating & Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? "fill-current text-amber-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-[#180D1D]">{r.name}</span>
                    <span className="text-xs text-[#56475C] font-mono">({r.service})</span>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-[#56475C] leading-relaxed italic">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {r.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, "approved")}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {r.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, "rejected")}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVerified(r.id, r.verified)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#56475C] bg-[#FAF4F9] border border-[#502D55]/12 hover:text-[#180D1D] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 text-[#935073]" />
                      <span>{r.verified ? "Remove Badge" : "Mark Verified"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
