"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { verifyAdminStatus, adminSignIn, adminSignInWithGoogle } from "@/lib/auth";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews directly from Firestore if admin authenticated, or via API route with Bearer token
  const fetchReviewsFromFirestore = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Try direct Firestore read if authenticated
    if (db && currentUser) {
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
        setLoading(false);
        return;
      } catch (err: unknown) {
        console.warn("Direct Firestore reviews fetch fallback to secure API:", err);
      }
    }

    // 2. Fallback to secure server API using verified ID Token
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin/reviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to load reviews from admin API");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      }
    }

    setLoading(false);
  }, [currentUser]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      queueMicrotask(() => setAuthLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await verifyAdminStatus(user);
        if (isAdmin) {
          setCurrentUser(user);
          setAuthorized(true);
        } else {
          setCurrentUser(null);
          setAuthorized(false);
          setError("Access Denied: Your account is not authorized for review moderation.");
        }
      } else {
        setCurrentUser(null);
        setAuthorized(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch reviews when authorization becomes active
  useEffect(() => {
    let ignore = false;
    if (authorized && currentUser) {
      void (async () => {
        if (!ignore) {
          await fetchReviewsFromFirestore();
        }
      })();
    }
    return () => {
      ignore = true;
    };
  }, [authorized, currentUser, fetchReviewsFromFirestore]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await adminSignInWithGoogle();
      setCurrentUser(user);
      setAuthorized(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        setError("Sign-in cancelled: The Google popup was closed.");
      } else if (msg.includes("auth/unauthorized-domain")) {
        setError(
          "Domain not authorized in Firebase Console (Authentication > Settings > Authorized domains). Please add localhost or your custom domain."
        );
      } else {
        setError(msg.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase Email/Pass login
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await adminSignIn(emailInput, passwordInput);
      setCurrentUser(user);
      setAuthorized(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    // 1. Try direct Firestore write if client has admin credentials
    if (db && currentUser) {
      try {
        await setDoc(doc(db, "reviews", id), { status, updatedAt: new Date().toISOString() }, { merge: true });
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        return;
      } catch (err) {
        console.warn("Direct Firestore update failed, falling back to secure API:", err);
      }
    }

    // 2. Fallback to secure server API with Bearer ID token
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, status }),
        });
        if (res.ok) {
          setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Status update failed: ${errData.error || res.statusText}`);
        }
      } catch (err) {
        console.error("Status update failed:", err);
      }
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
        console.warn("Direct Firestore verified update failed, falling back to secure API:", err);
      }
    }

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, verified: nextVal }),
        });
        if (res.ok) {
          setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, verified: nextVal } : r)));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Verification toggle failed: ${errData.error || res.statusText}`);
        }
      } catch (err) {
        console.error("Verification toggle failed:", err);
      }
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
        console.warn("Direct Firestore delete failed, falling back to secure API:", err);
      }
    }

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin/reviews", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          setReviews((prev) => prev.filter((r) => r.id !== id));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Delete failed: ${errData.error || res.statusText}`);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
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

            {/* Google One-Click Administrator Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FAF4F9] text-[#180D1D] border border-[#502D55]/20 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2.5 mb-4 hover:border-[#502D55]/30 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#502D55]/10" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-mono uppercase tracking-wider text-[#7A6880]">
                or authenticate with password
              </span>
            </div>

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
              {currentUser?.email ? `Authenticated as ${currentUser.email}` : "Authenticated Administrator"}
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
