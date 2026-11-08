"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { verifyAdminStatus, adminSignIn } from "@/lib/auth";
import { AppReleaseManager } from "@/components/admin/AppReleaseManager";
import { ReleaseHistoryView } from "@/components/admin/ReleaseHistoryView";
import { getPublishedApps } from "@/lib/cms";
import { AppDocument } from "@/types/cms";
import {
  Smartphone,
  Upload,
  History,
  Layers,
  ArrowLeft,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
} from "lucide-react";

export default function AdminAppsPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab state: "apps" | "releases" | "history"
  const [activeTab, setActiveTab] = useState<"apps" | "releases" | "history">("releases");

  // Apps data
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit App modal state
  const [editingApp, setEditingApp] = useState<Partial<AppDocument> | null>(null);
  const [savingApp, setSavingApp] = useState(false);
  const [appModalError, setAppModalError] = useState<string | null>(null);

  // 1. Auth Listener
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdmin = await verifyAdminStatus(user);
        setAuthorized(isAdmin);
      } else {
        setAuthorized(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Apps
  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      if (db) {
        const snap = await getDocs(query(collection(db, "apps"), orderBy("sortOrder", "asc")));
        if (!snap.empty) {
          const list: AppDocument[] = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          } as AppDocument));
          setApps(list);
          return;
        }
      }
      // Fallback
      const list = await getPublishedApps();
      setApps(list);
    } catch (err) {
      console.warn("Failed to fetch apps from Firestore:", err);
      const list = await getPublishedApps();
      setApps(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchApps();
    }
  }, [authorized, fetchApps]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await adminSignIn(emailInput, passwordInput);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  };

  // Save App Metadata
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editingApp.id || !editingApp.name) {
      setAppModalError("App ID and Name are required.");
      return;
    }

    setSavingApp(true);
    setAppModalError(null);

    try {
      const now = new Date().toISOString();
      const payload: AppDocument = {
        id: editingApp.id.trim(),
        name: editingApp.name.trim(),
        slug: (editingApp.slug || editingApp.id).toLowerCase().trim(),
        tagline: editingApp.tagline?.trim() || "",
        shortDescription: editingApp.shortDescription?.trim() || editingApp.tagline?.trim() || "",
        description: editingApp.description?.trim() || "",
        logo: editingApp.logo?.trim() || undefined,
        platform: editingApp.platform || ["Android"],
        status: editingApp.status || "LIVE",
        isNew: Boolean(editingApp.isNew),
        features: editingApp.features || [],
        technologies: editingApp.technologies || ["Kotlin", "Jetpack Compose"],
        url: editingApp.url?.trim() || undefined,
        waitlistUrl: editingApp.waitlistUrl?.trim() || undefined,
        featured: Boolean(editingApp.featured),
        sortOrder: typeof editingApp.sortOrder === "number" ? editingApp.sortOrder : apps.length,
        category: editingApp.category || "Audio & Media",
        accentColor: editingApp.accentColor?.trim() || "#935073",
        version: editingApp.version?.trim() || undefined,
        packageName: editingApp.packageName?.trim() || undefined,
        approvedCertificateFingerprint: editingApp.approvedCertificateFingerprint?.trim() || undefined,
        supportEmail: editingApp.supportEmail?.trim() || "support@imdadbuild.space",
        privacyPolicyUrl: editingApp.privacyPolicyUrl?.trim() || "/privacy-policy",
        createdAt: editingApp.createdAt || now,
        updatedAt: now,
        published: editingApp.published ?? true,
      };

      if (db) {
        await setDoc(doc(db, "apps", payload.id), payload, { merge: true });
      }

      setApps((prev) => {
        const idx = prev.findIndex((a) => a.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [...prev, payload];
      });

      setEditingApp(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAppModalError(`Save failed: ${msg}`);
    } finally {
      setSavingApp(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#502D55]/15 shadow-sm text-xs font-mono text-[#56475C]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#935073]" />
          <span>Verifying studio credentials...</span>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!currentUser || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF9]">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#502D55]/15 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/15 text-[#935073] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#180D1D]">Protected Release Manager</h1>
            <p className="text-xs text-[#56475C]">
              Sign in with authorized administrator credentials to manage Android application releases.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#56475C] mb-1">Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="imdad.builds@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#56475C] mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Sign In to App Release Manager
            </button>
          </form>

          <div className="pt-2 border-t border-[#502D55]/10 text-center">
            <Link href="/" className="text-xs text-[#56475C] hover:text-[#180D1D] inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-24">
      {/* Top Navbar */}
      <div className="border-b border-[#502D55]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-1.5 rounded-xl border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors"
                title="Back to Central Admin"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-[#180D1D] flex items-center gap-2">
                  <span>Application &amp; APK Release Manager</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                    {apps.length} Apps
                  </span>
                </h1>
                <p className="text-[11px] text-[#56475C]">
                  Binary inspection, SHA-256 verification, certificate fingerprint enforcement &amp; rollbacks
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditingApp({
                    id: `app_${Date.now()}`,
                    name: "",
                    slug: "",
                    packageName: "",
                    category: "Audio & Media",
                    tagline: "",
                    shortDescription: "",
                    description: "",
                    platform: ["Android"],
                    status: "LIVE",
                    technologies: ["Kotlin", "Jetpack Compose"],
                    featured: true,
                    published: true,
                    sortOrder: apps.length,
                    approvedCertificateFingerprint: "",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] hover:bg-[#F3E5D8] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add App</span>
              </button>

              <Link
                href="/apps/wishmusic"
                target="_blank"
                className="p-2 rounded-xl border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors"
                title="View Public WishMusic Download Portal"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 my-6 border-b border-[#502D55]/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("releases")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "releases"
                ? "bg-[#180D1D] text-white shadow-xs"
                : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload &amp; Publish APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-[#180D1D] text-white shadow-xs"
                : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Release History &amp; Rollback</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "apps"
                ? "bg-[#180D1D] text-white shadow-xs"
                : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Directory ({apps.length})</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD & VALIDATE APK */}
        {activeTab === "releases" && (
          <AppReleaseManager
            currentUser={currentUser}
            apps={apps}
            onReleaseCreated={() => {
              fetchApps();
            }}
            onNavigateToHistory={() => setActiveTab("history")}
          />
        )}

        {/* TAB 2: RELEASE HISTORY & ROLLBACK */}
        {activeTab === "history" && (
          <ReleaseHistoryView
            currentUser={currentUser}
            apps={apps}
            onRollbackComplete={() => {
              fetchApps();
            }}
          />
        )}

        {/* TAB 3: APP DIRECTORY & METADATA */}
        {activeTab === "apps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#180D1D]">Registered Studio Applications</h3>
                <p className="text-xs text-[#56475C]">
                  Configure application identifiers, release certificates, and public listing details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                        {app.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                        style={{ backgroundColor: app.accentColor || "#935073" }}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#180D1D] text-sm">{app.name}</h4>
                        <p className="font-mono text-[10px] text-[#56475C]">{app.packageName || "No package configured"}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#56475C] line-clamp-2">{app.tagline || app.shortDescription}</p>

                    {/* Fingerprint info */}
                    <div className="p-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/10 space-y-1 text-[10px] font-mono">
                      <div className="text-[#56475C] flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-[#935073]" />
                        <span>Pinned Certificate Fingerprint:</span>
                      </div>
                      <div className="text-[#180D1D] truncate font-bold">
                        {app.approvedCertificateFingerprint || (
                          <span className="text-amber-600 font-normal italic">Set via env or app config</span>
                        )}
                      </div>
                      {app.latestVersionName && (
                        <div className="text-[#7A3F26] pt-1">
                          Latest Release: v{app.latestVersionName} (#{app.latestVersionCode})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#502D55]/10 flex items-center justify-between">
                    <Link
                      href={app.id === "wishmusic" ? "/apps/wishmusic" : `/apps/${app.slug}`}
                      target="_blank"
                      className="text-xs text-[#935073] hover:underline flex items-center gap-1"
                    >
                      <span>Public Download</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingApp(app)}
                      className="px-3 py-1.5 rounded-xl border border-[#502D55]/15 text-xs font-bold text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                    >
                      Configure App
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Edit App Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
              <h3 className="text-base font-bold text-[#180D1D]">
                {editingApp.name ? `Configure: ${editingApp.name}` : "Register New App"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="text-xs text-gray-500 hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {appModalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {appModalError}
              </div>
            )}

            <form onSubmit={handleSaveApp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">App ID *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.id || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    placeholder="wishmusic"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">App Name *</label>
                  <input
                    type="text"
                    required
                    value={editingApp.name || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                    placeholder="WishMusic"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">
                  Package Name * (Android Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.packageName || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, packageName: e.target.value.trim() })}
                  placeholder="com.imdad.wishmusic"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">
                  Pinned Production Certificate Fingerprint (SHA-256 Hex)
                </label>
                <input
                  type="text"
                  value={editingApp.approvedCertificateFingerprint || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, approvedCertificateFingerprint: e.target.value.trim() })}
                  placeholder="e.g. 5E8F... (Required to prevent unauthorized/debug APK publishing)"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingApp.tagline || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, tagline: e.target.value })}
                    placeholder="High-fidelity offline music player"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Accent Color</label>
                  <input
                    type="text"
                    value={editingApp.accentColor || "#935073"}
                    onChange={(e) => setEditingApp({ ...editingApp, accentColor: e.target.value })}
                    placeholder="#935073"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#502D55]/10">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingApp}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] hover:bg-[#2B1435] text-white cursor-pointer disabled:opacity-50"
                >
                  {savingApp ? "Saving..." : "Save App Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
