"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  verifyAdminStatus,
  adminSignIn,
  adminSignInWithGoogle,
  adminSignOut,
  adminSendPasswordReset,
} from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { migrateInitialDataToFirestore } from "@/lib/migration";
import { appsData } from "@/data/apps";
import { projectsData } from "@/data/projectsData";
import { studioServices } from "@/data/servicesData";
import { allServices, corePackages } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import { cleanUndefined } from "@/lib/cms";

// Modular Admin Components
import {
  AdminLayoutShell,
  AdminNavigationTab,
} from "@/components/admin/AdminLayoutShell";
import { SaaSDashboardOverview } from "@/components/admin/SaaSDashboardOverview";
import { ProjectsAdminView } from "@/components/admin/ProjectsAdminView";
import { ServicesAdminView } from "@/components/admin/ServicesAdminView";
import { PackagesAdminView } from "@/components/admin/PackagesAdminView";
import { ReviewsAdminView } from "@/components/admin/ReviewsAdminView";
import { SettingsAdminView } from "@/components/admin/SettingsAdminView";
import { MediaLibraryView } from "@/components/admin/MediaLibraryView";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";
import { VideoOrderAdminManager } from "@/components/admin/VideoOrderAdminManager";
import { AmazonPortfolioManager } from "@/components/admin/AmazonPortfolioManager";
import { AppReleaseManager } from "@/components/admin/AppReleaseManager";
import { ReleaseHistoryView } from "@/components/admin/ReleaseHistoryView";
import { WishMusicVisualManager } from "@/components/admin/WishMusicVisualManager";

import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  SiteContentDocument,
  SettingsDocument,
  ReviewDocument,
} from "@/types/cms";

import {
  Lock,
  RefreshCw,
  AlertTriangle,
  Check,
  ShieldCheck,
  Smartphone,
  Upload,
  History,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

export default function AdminPortalPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminNavigationTab>("dashboard");
  const [releaseSubTab, setReleaseSubTab] = useState<
    "upload" | "history" | "directory"
  >("upload");

  // Data state
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [packages, setPackages] = useState<WebsitePackageDocument[]>([]);
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentDocument | null>(
    null
  );
  const [settings, setSettings] = useState<SettingsDocument | null>(null);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  const [loadingData, setLoadingData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  // App editing modal state
  const [editingApp, setEditingApp] = useState<Partial<AppDocument> | null>(
    null
  );

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      queueMicrotask(() => setAuthLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAuthorized = await verifyAdminStatus(user);
        if (isAuthorized) {
          setCurrentUser(user);
          setAuthError(null);
        } else {
          await adminSignOut();
          setCurrentUser(null);
          setAuthError(
            `Access Denied: ${user.email} is not authorized for Studio Admin.`
          );
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch all CMS collections
  const loadAllData = useCallback(async () => {
    if (!db || !currentUser) return;
    setLoadingData(true);
    try {
      // Apps
      const appsSnap = await getDocs(
        query(collection(db, "apps"), orderBy("sortOrder", "asc"))
      ).catch(() => null);
      if (appsSnap && !appsSnap.empty) {
        setApps(
          appsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
        );
      } else {
        setApps(
          appsData.map((a, i) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            shortDescription: a.description,
            description: a.fullDescription,
            platform: a.platform,
            status:
              a.status === "live"
                ? "LIVE"
                : a.status === "in-development"
                ? "IN_DEVELOPMENT"
                : "COMING_SOON",
            features: a.features,
            technologies: a.techStack,
            featured: a.featured,
            sortOrder: i,
            category: a.category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          }))
        );
      }

      // Projects
      const projSnap = await getDocs(
        query(collection(db, "projects"), orderBy("sortOrder", "asc"))
      ).catch(() => null);
      if (projSnap && !projSnap.empty) {
        setProjects(
          projSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectDocument))
        );
      } else {
        setProjects(
          projectsData.map((p, i) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            shortDescription: p.tagline,
            description: p.description,
            category: p.category,
            technologies: p.tools,
            scope: p.scope,
            deliverables: p.deliverables,
            metrics: p.metrics,
            featured: p.featured,
            sortOrder: i,
            status: p.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          }))
        );
      }

      // Services
      const servSnap = await getDocs(
        query(collection(db, "services"), orderBy("sortOrder", "asc"))
      ).catch(() => null);
      if (servSnap && !servSnap.empty) {
        setServices(
          servSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceDocument))
        );
      } else {
        setServices(
          studioServices.map((s, i) => ({
            id: s.id,
            name: s.title,
            slug: s.slug,
            shortDescription: s.shortDescription,
            description: s.fullDescription,
            category: s.title,
            deliverables: s.deliverables,
            process: s.process.map((step) => ({
              step: step.step,
              title: step.title,
              description: step.description,
              deliverable: "Deliverable Review",
            })),
            pricing: (s.packages || []).map((pkg) => ({
              tierName: pkg.name,
              price: `₹${pkg.price.toLocaleString("en-IN")}`,
              description: pkg.description,
              deliverables: pkg.features,
              turnaround: "1-2 Weeks",
            })),
            faq: s.faqs,
            featured: true,
            sortOrder: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          }))
        );
      }

      // Website Packages
      const pkgSnap = await getDocs(
        query(collection(db, "websitePackages"), orderBy("sortOrder", "asc"))
      ).catch(() => null);
      if (pkgSnap && !pkgSnap.empty) {
        setPackages(
          pkgSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() } as WebsitePackageDocument)
          )
        );
      } else {
        const defaultCorePkgs: WebsitePackageDocument[] = corePackages.map(
          (x, i) => ({
            id: x.id,
            name: x.name,
            websiteType: "Commercial Package",
            description: x.tagline,
            features: x.deliverables,
            price: x.price,
            priceType: "fixed",
            unit: x.turnaround,
            badge: x.badge || null,
            recommended: x.popular || x.badge === "Best Value",
            active: true,
            sortOrder: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          })
        );
        const pkgs = allServices.filter(
          (x) => x.category === "websites" || x.category === "ecommerce"
        );
        const defaultServicePkgs: WebsitePackageDocument[] = pkgs.map(
          (x, i) => ({
            id: x.id,
            name: x.name,
            websiteType: x.categoryLabel,
            description: x.description,
            features: x.deliverables,
            price: x.price,
            priceType: x.priceType,
            unit: x.unit,
            badge: x.badge || null,
            recommended: x.recommended || false,
            active: true,
            sortOrder: defaultCorePkgs.length + i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          })
        );
        setPackages([...defaultCorePkgs, ...defaultServicePkgs]);
      }

      // Reviews
      const revSnap = await getDocs(
        query(collection(db, "reviews"), orderBy("createdAt", "desc"))
      ).catch(() => null);
      if (revSnap && !revSnap.empty) {
        setReviews(
          revSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReviewDocument))
        );
      }

      // Site Content
      const contSnap = await getDocs(collection(db, "siteContent")).catch(
        () => null
      );
      if (contSnap && !contSnap.empty) {
        setSiteContent(contSnap.docs[0].data() as SiteContentDocument);
      }

      // Settings
      const setSnap = await getDocs(collection(db, "settings")).catch(
        () => null
      );
      if (setSnap && !setSnap.empty) {
        setSettings(setSnap.docs[0].data() as SettingsDocument);
      } else {
        setSettings({
          id: "global",
          studioName: siteConfig.name,
          tagline: siteConfig.tagline,
          contactEmail: siteConfig.contact.email,
          whatsappNumber: siteConfig.contact.whatsappNumber,
          instagramHandle: siteConfig.contact.instagramHandle,
          liveUrl: "https://imdadbuild.space",
          maintenanceMode: false,
          allowPublicReviews: true,
          updatedAt: new Date().toISOString(),
        });
      }

      // Video Orders Count
      try {
        const idToken = await currentUser.getIdToken();
        const ordersRes = await fetch("/api/admin/orders/video", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData.orders)) {
            setOrdersCount(ordersData.orders.length);
          }
        }
      } catch (orderErr) {
        console.warn("Failed to fetch admin video orders count:", orderErr);
      }
    } catch (err) {
      console.error("Error loading CMS data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      queueMicrotask(() => {
        void loadAllData();
      });
    }
  }, [currentUser, loadAllData]);

  // Auth Handlers
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      const user = await adminSignInWithGoogle();
      setCurrentUser(user);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Google authentication failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        setAuthError("Sign-in cancelled: The Google popup was closed.");
      } else if (msg.includes("auth/unauthorized-domain")) {
        setAuthError(
          "Domain not authorized in Firebase Console. Please add your active domain."
        );
      } else {
        setAuthError(msg.replace("Firebase: ", ""));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await adminSignIn(emailInput, passwordInput);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setAuthError(msg.replace("Firebase: ", ""));
    }
  };

  const handlePasswordReset = async () => {
    if (!emailInput.trim()) {
      setAuthError("Please enter your admin email above first.");
      return;
    }
    try {
      await adminSendPasswordReset(emailInput.trim());
      setResetSent(true);
      setAuthError(null);
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "Failed to send reset email"
      );
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    setCurrentUser(null);
  };

  // Generic File Upload Handler
  const handleFileUpload = async (
    file: File,
    category: "apps" | "projects" | "services" | "general" = "general"
  ): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file, {
        folder: `studio-assets/${category}`,
      });
      return url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("Cloudinary upload error:", err);
      alert(`Image Upload Error: ${msg}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // App Actions
  const toggleAppPublished = async (app: AppDocument) => {
    if (!db) return;
    const newStatus = !app.published;
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, published: newStatus } : a))
    );
    await setDoc(
      doc(db, "apps", app.id),
      { published: newStatus, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const deleteApp = async (id: string) => {
    if (!db || !confirm(`Delete app "${id}" from Firestore?`)) return;
    setApps((prev) => prev.filter((a) => a.id !== id));
    await deleteDoc(doc(db, "apps", id));
  };

  const saveAppModal = async () => {
    if (!db || !editingApp || !editingApp.id) return;
    const now = new Date().toISOString();
    const payload: Partial<AppDocument> = cleanUndefined({
      ...editingApp,
      updatedAt: now,
      createdAt: editingApp.createdAt || now,
      published: editingApp.published ?? true,
    });
    await setDoc(doc(db, "apps", editingApp.id), payload, { merge: true });
    setEditingApp(null);
    await loadAllData();
  };

  // Project Actions
  const toggleProjectPublished = async (project: ProjectDocument) => {
    if (!db) return;
    const newStatus = !project.published;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, published: newStatus } : p
      )
    );
    await setDoc(
      doc(db, "projects", project.id),
      { published: newStatus, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const deleteProject = async (id: string) => {
    if (!db || !confirm(`Delete project "${id}" from Firestore?`)) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await deleteDoc(doc(db, "projects", id));
  };

  const saveProjectModal = async (projectData: Partial<ProjectDocument>) => {
    if (!db || !projectData.id) return;
    const now = new Date().toISOString();
    const payload: Partial<ProjectDocument> = cleanUndefined({
      ...projectData,
      updatedAt: now,
      createdAt: projectData.createdAt || now,
      published: projectData.published ?? true,
    });
    await setDoc(doc(db, "projects", projectData.id), payload, {
      merge: true,
    });
    await loadAllData();
  };

  // Service Actions
  const toggleServicePublished = async (service: ServiceDocument) => {
    if (!db) return;
    const newStatus = !service.published;
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, published: newStatus } : s
      )
    );
    await setDoc(
      doc(db, "services", service.id),
      { published: newStatus, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const deleteService = async (id: string) => {
    if (!db || !confirm(`Delete service "${id}" from Firestore?`)) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, "services", id));
  };

  const saveServiceModal = async (serviceData: Partial<ServiceDocument>) => {
    if (!db || !serviceData.id) return;
    const now = new Date().toISOString();
    const payload: Partial<ServiceDocument> = cleanUndefined({
      ...serviceData,
      updatedAt: now,
      createdAt: serviceData.createdAt || now,
      published: serviceData.published ?? true,
    });
    await setDoc(doc(db, "services", serviceData.id), payload, { merge: true });
    await loadAllData();
  };

  // Package Actions
  const togglePackageActive = async (pkg: WebsitePackageDocument) => {
    if (!db) return;
    const newStatus = !pkg.active;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, active: newStatus } : p))
    );
    await setDoc(
      doc(db, "websitePackages", pkg.id),
      { active: newStatus, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  };

  const deletePackage = async (id: string) => {
    if (!db || !confirm(`Delete website package "${id}" from Firestore?`))
      return;
    setPackages((prev) => prev.filter((p) => p.id !== id));
    await deleteDoc(doc(db, "websitePackages", id));
  };

  const savePackageModal = async (pkgData: Partial<WebsitePackageDocument>) => {
    if (!db || !pkgData.id) return;
    const now = new Date().toISOString();
    const payload: Partial<WebsitePackageDocument> = cleanUndefined({
      ...pkgData,
      updatedAt: now,
      createdAt: pkgData.createdAt || now,
      published: pkgData.published ?? true,
      active: pkgData.active ?? true,
    });
    await setDoc(doc(db, "websitePackages", pkgData.id), payload, {
      merge: true,
    });
    await loadAllData();
  };

  // Review Actions
  const updateReviewStatus = async (
    id: string,
    status: ReviewDocument["status"],
    verified?: boolean
  ) => {
    if (!db) return;
    const updates: Partial<ReviewDocument> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (verified !== undefined) updates.verified = verified;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    await setDoc(doc(db, "reviews", id), updates, { merge: true });
  };

  const deleteReviewDoc = async (id: string) => {
    if (!db || !confirm("Delete this client review?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await deleteDoc(doc(db, "reviews", id));
  };

  // Save Settings
  const saveSettingsToFirestore = async (updated: SettingsDocument) => {
    if (!db) return;
    setSyncStatus("Saving settings to Firestore...");
    await setDoc(
      doc(db, "settings", "global"),
      { ...updated, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    setSyncStatus("✓ Settings saved successfully.");
    setTimeout(() => setSyncStatus(null), 3000);
  };

  // Seed / Sync Demo Data to Firestore
  const handleSeedDemoData = async () => {
    if (!db) return;
    if (
      !confirm(
        "Sync sample demo content to Cloud Firestore?\n\nThis will safely populate apps, projects, services, website packages, site content, and settings with sample demo data. It uses non-destructive merge ({ merge: true }), preserving existing custom edits."
      )
    ) {
      return;
    }
    setSeedingDemo(true);
    try {
      setSyncStatus("Seeding sample demo data to Firestore...");
      const res = await migrateInitialDataToFirestore(false);
      if (res.success) {
        setSyncStatus("✓ Sample demo content synchronized successfully!");
        await loadAllData();
      } else {
        setSyncStatus(`Sync notice: ${res.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setSyncStatus(`Sync error: ${msg}`);
    } finally {
      setSeedingDemo(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Loading Auth
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0284C7]" />
          <span>Verifying studio administrator session...</span>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Unauthenticated SaaS Login Screen
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC] p-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl -z-10" />

        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-[#0284C7] flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-sky-50 text-[#0284C7] border border-sky-200 mb-2 font-bold">
              Restricted Desk
            </div>
            <h1 className="text-2xl font-black text-[#0A192F] tracking-tight">
              Studio Operations Gateway
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Administrative management hub for IMDAD.BUILDS. Sign in with
              authorized administrator credentials.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Password reset link has been dispatched to {emailInput}.</span>
            </div>
          )}

          {/* Google One-Click Administrator Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#0A192F] border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2.5 hover:border-slate-300 disabled:opacity-50"
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
            <span>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[10px] font-mono uppercase tracking-wider text-slate-400">
              or authenticate with password
            </span>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="imdad.builds@gmail.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] text-[#0284C7] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Authenticate Session</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Database className="w-3.5 h-3.5" />
            <span>
              Firestore ID:{" "}
              {isFirebaseConfigured ? "imdadbuilds-ead39" : "Not Configured"}
            </span>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Professional SaaS Interface
  // -------------------------------------------------------------
  return (
    <AdminLayoutShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentUser={currentUser}
      onSignOut={handleSignOut}
      syncStatus={syncStatus}
      projectsCount={projects.length}
      servicesCount={services.length}
      packagesCount={packages.length}
      reviewsCount={reviews.length}
      ordersCount={ordersCount}
      appsCount={apps.length}
    >
      {/* 1. Dashboard Overview */}
      {activeTab === "dashboard" && (
        <SaaSDashboardOverview
          currentUser={currentUser}
          onNavigateTab={(tab) => setActiveTab(tab)}
          apps={apps}
          projects={projects}
          services={services}
          packages={packages}
          reviews={reviews}
          siteContent={siteContent}
          settings={settings}
          onRefreshAll={loadAllData}
          loadingData={loadingData}
        />
      )}

      {/* 2. Homepage Builder CMS */}
      {activeTab === "homepage-builder" && (
        <HomepageBuilder
          apps={apps}
          projects={projects}
          services={services}
        />
      )}

      {/* 3. Projects Management */}
      {activeTab === "projects" && (
        <ProjectsAdminView
          projects={projects}
          onTogglePublished={toggleProjectPublished}
          onDeleteProject={deleteProject}
          onSaveProject={saveProjectModal}
          handleFileUpload={handleFileUpload}
          uploadingImage={uploadingImage}
        />
      )}

      {/* 4. Services Management */}
      {activeTab === "services" && (
        <ServicesAdminView
          services={services}
          onTogglePublished={toggleServicePublished}
          onDeleteService={deleteService}
          onSaveService={saveServiceModal}
        />
      )}

      {/* 5. Packages Management */}
      {activeTab === "packages" && (
        <PackagesAdminView
          packages={packages}
          onToggleActive={togglePackageActive}
          onDeletePackage={deletePackage}
          onSavePackage={savePackageModal}
        />
      )}

      {/* 6. Reviews Moderation */}
      {activeTab === "reviews" && (
        <ReviewsAdminView
          reviews={reviews}
          onUpdateStatus={updateReviewStatus}
          onDeleteReview={deleteReviewDoc}
        />
      )}

      {/* 7. Video Orders Pipeline */}
      {activeTab === "video-orders" && (
        <VideoOrderAdminManager currentUser={currentUser} />
      )}

      {/* 8. Amazon Creative Portfolio */}
      {activeTab === "amazon-portfolio" && (
        <AmazonPortfolioManager currentUser={currentUser} />
      )}

      {/* 9. Media Library */}
      {activeTab === "media-library" && (
        <MediaLibraryView currentUser={currentUser} />
      )}

      {/* 10. APK Release Management & Rollback */}
      {activeTab === "app-releases" && (
        <div className="space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-fit">
            <button
              type="button"
              onClick={() => setReleaseSubTab("upload")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                releaseSubTab === "upload"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-500 hover:text-[#0A192F]"
              }`}
            >
              Publish New Release (APK)
            </button>
            <button
              type="button"
              onClick={() => setReleaseSubTab("history")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                releaseSubTab === "history"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-500 hover:text-[#0A192F]"
              }`}
            >
              Release History & Rollback
            </button>
            <button
              type="button"
              onClick={() => setReleaseSubTab("directory")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                releaseSubTab === "directory"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-500 hover:text-[#0A192F]"
              }`}
            >
              App Catalog & Metadata ({apps.length})
            </button>
          </div>

          {releaseSubTab === "upload" && (
            <AppReleaseManager
              currentUser={currentUser}
              apps={apps}
              onNavigateToHistory={() => setReleaseSubTab("history")}
            />
          )}

          {releaseSubTab === "history" && (
            <ReleaseHistoryView
              currentUser={currentUser}
              apps={apps}
              onNavigateToUpload={() => setReleaseSubTab("upload")}
            />
          )}

          {releaseSubTab === "directory" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0A192F]">
                    App Catalog Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registered Android & cross-platform applications published by
                    the studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingApp({
                      id: `app_${Date.now()}`,
                      name: "",
                      slug: "",
                      platform: ["Android"],
                      status: "LIVE",
                      category: "Audio",
                      shortDescription: "",
                      description: "",
                      features: [],
                      technologies: ["Flutter", "Dart"],
                      published: true,
                      featured: true,
                      sortOrder: apps.length,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0052cc] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New App</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-md">
                            {app.category || "App"}
                          </span>
                          <h3 className="text-base font-bold text-[#0A192F] mt-1">
                            {app.name}
                          </h3>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /apps/{app.slug || app.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void toggleAppPublished(app)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              app.published
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {app.published ? (
                              <Eye className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{app.published ? "Live" : "Draft"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingApp(app)}
                            className="p-1.5 text-slate-500 hover:text-[#0A192F] rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteApp(app.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {app.shortDescription || app.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Status: {app.status}</span>
                      <span>{(app.platform || []).join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 11. WishMusic Visual Content Manager */}
      {activeTab === "wishmusic-visuals" && (
        <WishMusicVisualManager currentUser={currentUser} />
      )}

      {/* 12. Global Settings */}
      {activeTab === "settings" && (
        <SettingsAdminView
          settings={settings}
          onSaveSettings={async (updated) => {
            setSettings(updated);
            await saveSettingsToFirestore(updated);
          }}
          onSeedDemoData={handleSeedDemoData}
          seedingDemo={seedingDemo}
        />
      )}

      {/* App Editor Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0284C7]" />
                <span>
                  {editingApp.id?.startsWith("app_")
                    ? "Register New App"
                    : `Edit App: ${editingApp.name}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    value={editingApp.name || ""}
                    onChange={(e) =>
                      setEditingApp({
                        ...editingApp,
                        name: e.target.value,
                        slug:
                          editingApp.slug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    placeholder="e.g., WishMusic"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={editingApp.slug || ""}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, slug: e.target.value })
                    }
                    placeholder="e.g., wishmusic"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editingApp.shortDescription || ""}
                  onChange={(e) =>
                    setEditingApp({
                      ...editingApp,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="One-line summary for app cards..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-6 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingApp.published ?? true}
                    onChange={(e) =>
                      setEditingApp({
                        ...editingApp,
                        published: e.target.checked,
                      })
                    }
                  />
                  <span>Published to Public Site</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAppModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0052cc] shadow-xs transition-colors cursor-pointer"
              >
                Save App
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutShell>
  );
}
