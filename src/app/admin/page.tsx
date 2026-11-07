"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
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
import { uploadStudioAsset } from "@/lib/storage";
import { AppReleaseManager } from "@/components/admin/AppReleaseManager";
import { ReleaseHistoryView } from "@/components/admin/ReleaseHistoryView";
import { appsData } from "@/data/apps";
import { projectsData } from "@/data/projectsData";
import { studioServices } from "@/data/servicesData";
import { allServices, corePackages } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import { migrateInitialDataToFirestore } from "@/lib/migration";
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
  Layers,
  Smartphone,
  Globe,
  ShoppingBag,
  Check,
  Edit3,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Database,
  Sliders,
  LogOut,
  MessageSquare,
  FileText,
  AlertTriangle,
  Sparkles,
  Upload,
  History,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const SECTION_INFO: Record<string, { label: string; desc: string }> = {
  hero: { label: "Hero Section", desc: "Main headline, announcement, and initial action buttons" },
  packages: { label: "Commercial Packages", desc: "Starter (₹999), A+ (₹1,499), Pro (₹1,999) & Complete pricing" },
  apps: { label: "Apps Catalog", desc: "WishMusic, WishTracking, and active product previews" },
  services: { label: "Studio Disciplines", desc: "Core studio disciplines, capabilities, and workflows" },
  projects: { label: "Case Studies & Work", desc: "Selected client case studies, deliverables, and tech" },
  about: { label: "Studio Origin & Ethos", desc: "Independent studio ethos, philosophy, and founder narrative" },
  reviews: { label: "Client Testimonials", desc: "Authentic client reviews and rating metrics" },
  "ai-assistant": { label: "AI Concierge Assistant", desc: "Interactive product advisory assistant" },
  "final-cta": { label: "Final Collaboration CTA", desc: "Closing call-to-action for new project briefs" },
};

export default function AdminPortalPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Tab & data state
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "apps"
    | "app-releases"
    | "release-history"
    | "projects"
    | "services"
    | "packages"
    | "content"
    | "reviews"
    | "settings"
  >("dashboard");

  const [apps, setApps] = useState<AppDocument[]>([]);
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [packages, setPackages] = useState<WebsitePackageDocument[]>([]);
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentDocument | null>(null);
  const [settings, setSettings] = useState<SettingsDocument | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  // Modal editing state
  const [editingApp, setEditingApp] = useState<Partial<AppDocument> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<ProjectDocument> | null>(null);
  const [editingService, setEditingService] = useState<Partial<ServiceDocument> | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<WebsitePackageDocument> | null>(null);

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
          setAuthError(`Access Denied: ${user.email} is not authorized for Studio Admin CMS.`);
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
      const appsSnap = await getDocs(query(collection(db, "apps"), orderBy("sortOrder", "asc"))).catch(() => null);
      if (appsSnap && !appsSnap.empty) {
        setApps(appsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument)));
      } else {
        setApps(
          appsData.map((a, i) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            shortDescription: a.description,
            description: a.fullDescription,
            platform: a.platform,
            status: a.status === "live" ? "LIVE" : a.status === "in-development" ? "IN_DEVELOPMENT" : "COMING_SOON",
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
      const projSnap = await getDocs(query(collection(db, "projects"), orderBy("sortOrder", "asc"))).catch(() => null);
      if (projSnap && !projSnap.empty) {
        setProjects(projSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectDocument)));
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
      const servSnap = await getDocs(query(collection(db, "services"), orderBy("sortOrder", "asc"))).catch(() => null);
      if (servSnap && !servSnap.empty) {
        setServices(servSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceDocument)));
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
      const pkgSnap = await getDocs(query(collection(db, "websitePackages"), orderBy("sortOrder", "asc"))).catch(() => null);
      if (pkgSnap && !pkgSnap.empty) {
        setPackages(pkgSnap.docs.map((d) => ({ id: d.id, ...d.data() } as WebsitePackageDocument)));
      } else {
        const defaultCorePkgs: WebsitePackageDocument[] = corePackages.map((x, i) => ({
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
        }));
        const pkgs = allServices.filter((x) => x.category === "websites" || x.category === "ecommerce");
        const defaultServicePkgs: WebsitePackageDocument[] = pkgs.map((x, i) => ({
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
        }));
        setPackages([...defaultCorePkgs, ...defaultServicePkgs]);
      }

      // Reviews
      const revSnap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc"))).catch(() => null);
      if (revSnap) {
        setReviews(revSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReviewDocument)));
      }

      // Site Content
      const contentSnap = await getDocs(collection(db, "siteContent")).catch(() => null);
      if (contentSnap && !contentSnap.empty) {
        setSiteContent(contentSnap.docs[0].data() as SiteContentDocument);
      } else {
        setSiteContent({
          id: "main",
          hero: {
            badge: "DIGITAL PRODUCT STUDIO",
            headline: "Apps, Platforms & Digital Commerce.",
            subheadline:
              "Independent studio engineering high-performance mobile apps, web applications, conversion-engineered e-commerce engines, and retention media.",
            primaryCtaText: "Explore New Apps",
            primaryCtaLink: "/apps",
            secondaryCtaText: "Studio Services",
            secondaryCtaLink: "/services",
            announcement: "Now building: WishMusic & WishTracking for iOS/Android",
          },
          about: {
            eyebrow: "STUDIO ORIGIN",
            headline: "Building software, platforms & creative assets with commercial precision.",
            bio: "Imdad.builds was founded as an independent digital studio where software engineering converges with direct commercial reality. Unlike agencies who theorize about products, we build, launch, and operate them ourselves.",
            ethos: "Zero bloat. Fast iterations. Real products powered by imdad.builds.",
            location: "India • Global Distribution",
          },
          finalCta: {
            eyebrow: "COLLABORATE WITH IMDAD",
            headline: "Have an ambitious product idea or digital service need?",
            description: "From early wireframes to high-conversion stores and consumer apps, let's build something enduring together.",
            primaryCtaText: "Start a Project",
            secondaryCtaText: "Explore Studio Services",
          },
          contact: {
            email: siteConfig.contact.email,
            whatsappNumber: siteConfig.contact.whatsappNumber,
            whatsappDisplay: siteConfig.contact.whatsappDisplay,
            whatsappMessage: siteConfig.contact.whatsappMessage,
            instagramHandle: siteConfig.contact.instagramHandle,
            instagramUrl: siteConfig.contact.instagramUrl,
          },
          socialLinks: {
            instagram: siteConfig.links.instagram,
            whatsapp: siteConfig.links.whatsapp,
            email: siteConfig.links.email,
            easyxo: siteConfig.links.easyxo,
          },
          footer: {
            tagline: siteConfig.subTagline,
            copyrightYear: 2026,
            studioName: siteConfig.name,
          },
          metadata: {
            sectionOrder: [
              "hero",
              "packages",
              "apps",
              "services",
              "projects",
              "about",
              "reviews",
              "ai-assistant",
              "final-cta",
            ],
            sectionVisibility: {
              hero: true,
              packages: true,
              apps: true,
              services: true,
              projects: true,
              about: true,
              reviews: true,
              "ai-assistant": true,
              "final-cta": true,
            },
            skills: [
              {
                category: "Mobile & App Engineering",
                items: ["Flutter", "Dart", "iOS", "Android", "Offline-First SQLite"],
              },
              {
                category: "Web & Storefronts",
                items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Razorpay"],
              },
              {
                category: "Marketplace & E-Commerce",
                items: ["Amazon Listing SEO", "A+ Content (EBC)", "Catalog Architecture", "EasyXo"],
              },
              {
                category: "AI & Media Systems",
                items: ["Gemini 2.5 API", "Automated Video Pipeline", "Image Staging"],
              },
            ],
            seo: {
              title: "IMDAD.BUILDS | Independent Digital Product Studio",
              description:
                "Independent digital product studio building mobile apps, web applications, e-commerce systems, and conversion-engineered creative media.",
            },
          },
          published: true,
          updatedAt: new Date().toISOString(),
        });
      }

      // Settings
      const setSnap = await getDocs(collection(db, "settings")).catch(() => null);
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
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      if (msg.includes("auth/popup-closed-by-user")) {
        setAuthError("Sign-in cancelled: The Google popup was closed.");
      } else if (msg.includes("auth/unauthorized-domain")) {
        setAuthError(
          "Domain not authorized in Firebase Console (Authentication > Settings > Authorized domains). Please add localhost or your custom domain."
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
      setAuthError(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    setCurrentUser(null);
  };

  // Generic File Upload Handler
  const handleFileUpload = async (file: File, category: "apps" | "projects" | "services" | "general"): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const url = await uploadStudioAsset(file, category);
      return url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      alert(`Storage Upload Error: ${msg}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // App Actions
  const toggleAppPublished = async (app: AppDocument) => {
    if (!db) return;
    const newStatus = !app.published;
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, published: newStatus } : a)));
    await setDoc(doc(db, "apps", app.id), { published: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deleteApp = async (id: string) => {
    if (!db || !confirm(`Delete app "${id}" from Firestore?`)) return;
    setApps((prev) => prev.filter((a) => a.id !== id));
    await deleteDoc(doc(db, "apps", id));
  };

  const saveAppModal = async () => {
    if (!db || !editingApp || !editingApp.id) return;
    const now = new Date().toISOString();
    const payload: Partial<AppDocument> = {
      ...editingApp,
      updatedAt: now,
      createdAt: editingApp.createdAt || now,
      published: editingApp.published ?? true,
    };
    await setDoc(doc(db, "apps", editingApp.id), payload, { merge: true });
    setEditingApp(null);
    loadAllData();
  };

  // Project Actions
  const toggleProjectPublished = async (project: ProjectDocument) => {
    if (!db) return;
    const newStatus = !project.published;
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: newStatus } : p)));
    await setDoc(doc(db, "projects", project.id), { published: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deleteProject = async (id: string) => {
    if (!db || !confirm(`Delete project "${id}" from Firestore?`)) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await deleteDoc(doc(db, "projects", id));
  };

  const saveProjectModal = async () => {
    if (!db || !editingProject || !editingProject.id) return;
    const now = new Date().toISOString();
    const payload: Partial<ProjectDocument> = {
      ...editingProject,
      updatedAt: now,
      createdAt: editingProject.createdAt || now,
      published: editingProject.published ?? true,
    };
    await setDoc(doc(db, "projects", editingProject.id), payload, { merge: true });
    setEditingProject(null);
    loadAllData();
  };

  // Service Actions
  const toggleServicePublished = async (service: ServiceDocument) => {
    if (!db) return;
    const newStatus = !service.published;
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, published: newStatus } : s)));
    await setDoc(doc(db, "services", service.id), { published: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deleteService = async (id: string) => {
    if (!db || !confirm(`Delete service "${id}" from Firestore?`)) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    await deleteDoc(doc(db, "services", id));
  };

  const saveServiceModal = async () => {
    if (!db || !editingService || !editingService.id) return;
    const now = new Date().toISOString();
    const payload: Partial<ServiceDocument> = {
      ...editingService,
      updatedAt: now,
      createdAt: editingService.createdAt || now,
      published: editingService.published ?? true,
    };
    await setDoc(doc(db, "services", editingService.id), payload, { merge: true });
    setEditingService(null);
    loadAllData();
  };

  // Package Actions
  const togglePackageActive = async (pkg: WebsitePackageDocument) => {
    if (!db) return;
    const newStatus = !pkg.active;
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, active: newStatus } : p)));
    await setDoc(doc(db, "websitePackages", pkg.id), { active: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const deletePackage = async (id: string) => {
    if (!db || !confirm(`Delete website package "${id}" from Firestore?`)) return;
    setPackages((prev) => prev.filter((p) => p.id !== id));
    await deleteDoc(doc(db, "websitePackages", id));
  };

  const savePackageModal = async () => {
    if (!db || !editingPackage || !editingPackage.id) return;
    const now = new Date().toISOString();
    const payload: Partial<WebsitePackageDocument> = {
      ...editingPackage,
      updatedAt: now,
      createdAt: editingPackage.createdAt || now,
      published: editingPackage.published ?? true,
      active: editingPackage.active ?? true,
    };
    await setDoc(doc(db, "websitePackages", editingPackage.id), payload, { merge: true });
    setEditingPackage(null);
    loadAllData();
  };

  // Review Actions
  const updateReviewStatus = async (id: string, status: ReviewDocument["status"], verified?: boolean) => {
    if (!db) return;
    const updates: Partial<ReviewDocument> = { status, updatedAt: new Date().toISOString() };
    if (verified !== undefined) updates.verified = verified;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    await setDoc(doc(db, "reviews", id), updates, { merge: true });
  };

  const deleteReviewDoc = async (id: string) => {
    if (!db || !confirm("Delete this client review?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await deleteDoc(doc(db, "reviews", id));
  };

  // Save Site Content
  const saveSiteContentToFirestore = async () => {
    if (!db || !siteContent) return;
    setSyncStatus("Saving site content to Firestore...");
    await setDoc(doc(db, "siteContent", "main"), { ...siteContent, updatedAt: new Date().toISOString() }, { merge: true });
    setSyncStatus("✓ Site content saved successfully.");
    setTimeout(() => setSyncStatus(null), 3000);
  };

  // Save Settings
  const saveSettingsToFirestore = async () => {
    if (!db || !settings) return;
    setSyncStatus("Saving settings to Firestore...");
    await setDoc(doc(db, "settings", "global"), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
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

  // Section Reordering and Visibility Controls
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!siteContent) return;
    const currentOrder = [
      ...(siteContent.metadata?.sectionOrder || [
        "hero",
        "packages",
        "apps",
        "services",
        "projects",
        "about",
        "reviews",
        "ai-assistant",
        "final-cta",
      ]),
    ];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    setSiteContent({
      ...siteContent,
      metadata: {
        ...siteContent.metadata,
        sectionOrder: currentOrder,
        sectionVisibility: siteContent.metadata?.sectionVisibility || {
          hero: true,
          packages: true,
          apps: true,
          services: true,
          projects: true,
          about: true,
          reviews: true,
          "ai-assistant": true,
          "final-cta": true,
        },
      },
    });
  };

  const toggleSectionVisibility = (secId: string) => {
    if (!siteContent) return;
    const currentVisibility = {
      ...(siteContent.metadata?.sectionVisibility || {
        hero: true,
        packages: true,
        apps: true,
        services: true,
        projects: true,
        about: true,
        reviews: true,
        "ai-assistant": true,
        "final-cta": true,
      }),
    };
    currentVisibility[secId] = currentVisibility[secId] === false ? true : false;

    setSiteContent({
      ...siteContent,
      metadata: {
        ...siteContent.metadata,
        sectionOrder: siteContent.metadata?.sectionOrder || [
          "hero",
          "packages",
          "apps",
          "services",
          "projects",
          "about",
          "reviews",
          "ai-assistant",
          "final-cta",
        ],
        sectionVisibility: currentVisibility,
      },
    });
  };

  const resetSectionOrder = () => {
    if (!siteContent) return;
    const defaultOrder = [
      "hero",
      "packages",
      "apps",
      "services",
      "projects",
      "about",
      "reviews",
      "ai-assistant",
      "final-cta",
    ];
    const defaultVisibility: Record<string, boolean> = {
      hero: true,
      packages: true,
      apps: true,
      services: true,
      projects: true,
      about: true,
      reviews: true,
      "ai-assistant": true,
      "final-cta": true,
    };
    setSiteContent({
      ...siteContent,
      metadata: {
        ...siteContent.metadata,
        sectionOrder: defaultOrder,
        sectionVisibility: defaultVisibility,
      },
    });
  };

  // -------------------------------------------------------------
  // RENDER: Loading Auth
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-xs font-mono text-[#56475C]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#935073]" />
          <span>Verifying studio credentials...</span>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Login Screen
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/95 border border-[#502D55]/14 backdrop-blur-2xl shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#502D55]/10 text-[#502D55] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] mb-3">
              Restricted Desk
            </div>
            <h1 className="text-2xl font-black text-[#180D1D] tracking-tight mb-2">
              Studio Admin CMS
            </h1>
            <p className="text-xs text-[#56475C] mb-6">
              Administrative portal for IMDAD.BUILDS. Authenticate with authorized administrator credentials.
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {resetSent && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 text-left flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Password reset link has been dispatched to {emailInput}.</span>
              </div>
            )}

            {/* 1. Google One-Click Administrator Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
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
              <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#502D55]/10" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-mono uppercase tracking-wider text-[#7A6880]">
                or authenticate with password
              </span>
            </div>

            <form onSubmit={handleSignIn} className="space-y-3.5 text-left">
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-mono text-[#56475C] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-[11px] text-[#935073] hover:underline cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] focus:outline-none focus:ring-2 focus:ring-[#935073]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Authenticate Admin</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#502D55]/10 flex items-center justify-center gap-2 text-[11px] text-[#7A6880]">
              <Database className="w-3.5 h-3.5" />
              <span>Project ID: {isFirebaseConfigured ? "imdadbuilds-ead39" : "Not Configured"}</span>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Studio CMS
  // -------------------------------------------------------------
  return (
    <main className="flex-1 py-8 sm:py-12">
      <Container>
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 border border-[#502D55]/14 backdrop-blur-xl mb-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#7A3F26] font-bold">
                Studio CMS • Cloud Firestore
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight">
              IMDAD.BUILDS Realtime Management Hub
            </h1>
            <p className="text-xs text-[#56475C]">
              Authenticated as <strong className="text-[#180D1D]">{currentUser.email}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => { void loadAllData(); }}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#502D55]/15 text-[#180D1D] hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>{loadingData ? "Refreshing..." : "Refresh"}</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#502D55]/15 text-[#180D1D] hover:bg-white/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sync Toast */}
        {syncStatus && (
          <div className="mb-6 p-3 rounded-2xl bg-[#180D1D] text-[#F8F4E9] text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#d97746]" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/70 border border-[#502D55]/10 backdrop-blur-md mb-8 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: Layers },
            { id: "apps", label: `App Directory (${apps.length})`, icon: Smartphone },
            { id: "app-releases", label: "Release Manager", icon: Upload },
            { id: "release-history", label: "Release History", icon: History },
            { id: "projects", label: `Projects (${projects.length})`, icon: Globe },
            { id: "services", label: `Services (${services.length})`, icon: ShoppingBag },
            { id: "packages", label: `Packages (${packages.length})`, icon: FileText },
            { id: "content", label: "Site Content", icon: Edit3 },
            { id: "reviews", label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { id: "settings", label: "Settings", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  active
                    ? "bg-[#180D1D] text-[#F8F4E9] shadow-xs"
                    : "text-[#56475C] hover:text-[#180D1D] hover:bg-white/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD                                         */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
                <div className="text-[11px] font-mono text-[#56475C] uppercase mb-1">Total Apps</div>
                <div className="text-3xl font-black text-[#180D1D]">{apps.length}</div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  {apps.filter((a) => a.published).length} Published
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
                <div className="text-[11px] font-mono text-[#56475C] uppercase mb-1">Case Studies</div>
                <div className="text-3xl font-black text-[#180D1D]">{projects.length}</div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  {projects.filter((p) => p.published).length} Published
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
                <div className="text-[11px] font-mono text-[#56475C] uppercase mb-1">Studio Services</div>
                <div className="text-3xl font-black text-[#180D1D]">{services.length}</div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  {services.filter((s) => s.published).length} Published
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
                <div className="text-[11px] font-mono text-[#56475C] uppercase mb-1">Reviews Mod</div>
                <div className="text-3xl font-black text-[#180D1D]">{reviews.length}</div>
                <div className="text-[11px] text-amber-600 mt-1">
                  {reviews.filter((r) => r.status === "pending").length} Pending Review
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs">
              <h2 className="text-base font-bold text-[#180D1D] mb-2">Cloud Firestore Database Status</h2>
              <p className="text-xs text-[#56475C] mb-4 leading-relaxed">
                Cloud Firestore collections are active in <code>asia-south1</code> for project{" "}
                <code>imdadbuilds-ead39</code>. Public visitors query published content only. Draft documents remain
                strictly restricted to authenticated studio administrators.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[#7A3F26]">
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  apps: {apps.length}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  projects: {projects.length}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  services: {services.length}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  websitePackages: {packages.length}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  siteContent: {siteContent ? "Initialized" : "Pending"}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0]">
                  settings: {settings ? "Initialized" : "Pending"}
                </span>
              </div>
            </div>

            {/* Sample Demo Data Seeder */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#180D1D]">Sample Demo Content Setup</h2>
                  <p className="text-xs text-[#56475C] mt-1 leading-relaxed max-w-xl">
                    Populate your Firestore collections with curated sample demo data (apps, case studies, disciplines, commercial packages, homepage copy, and settings). Uses non-destructive merge: existing custom edits in Firestore are preserved.
                  </p>
                </div>
                <button
                  onClick={handleSeedDemoData}
                  disabled={seedingDemo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${seedingDemo ? "animate-spin" : ""}`} />
                  <span>{seedingDemo ? "Syncing Demo Data..." : "Seed Sample Demo Data"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: APPS MANAGEMENT                                   */}
        {/* ======================================================== */}
        {activeTab === "apps" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Studio Apps Catalog</h2>
                <p className="text-xs text-[#56475C]">Manage in-house mobile & web applications</p>
              </div>
              <button
                onClick={() =>
                  setEditingApp({
                    id: `app_${Date.now()}`,
                    name: "",
                    slug: "",
                    tagline: "",
                    shortDescription: "",
                    description: "",
                    platform: ["iOS", "Android", "Web"],
                    status: "IN_DEVELOPMENT",
                    features: [],
                    technologies: ["React Native", "TypeScript"],
                    published: true,
                    featured: true,
                    sortOrder: apps.length,
                    category: "Productivity",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New App</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#502D55]/12 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Name / Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Platforms</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#502D55]/10">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#FAF4F9]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#180D1D]">{app.name}</div>
                        <div className="font-mono text-[10px] text-[#7A6880]">/apps/{app.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            app.status === "LIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : app.status === "IN_DEVELOPMENT"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#56475C]">
                        {(app.platform || []).join(", ")}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleAppPublished(app)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                            app.published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                        >
                          {app.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{app.published ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingApp(app)}
                            className="p-1.5 rounded-lg text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                            title="Edit App"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteApp(app.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete App"
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

        {/* ======================================================== */}
        {/* APP RELEASES MANAGEMENT                                  */}
        {/* ======================================================== */}
        {activeTab === "app-releases" && (
          <AppReleaseManager
            currentUser={currentUser}
            apps={apps}
            onReleaseCreated={() => {
              loadAllData();
              setActiveTab("release-history");
            }}
            onNavigateToHistory={() => setActiveTab("release-history")}
          />
        )}

        {/* ======================================================== */}
        {/* RELEASE HISTORY & ROLLBACK                               */}
        {/* ======================================================== */}
        {activeTab === "release-history" && (
          <ReleaseHistoryView
            currentUser={currentUser}
            apps={apps}
            onNavigateToUpload={() => setActiveTab("app-releases")}
            onRollbackComplete={() => loadAllData()}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROJECTS MANAGEMENT                               */}
        {/* ======================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Case Studies & Projects</h2>
                <p className="text-xs text-[#56475C]">Manage studio case studies and commercial deliverables</p>
              </div>
              <button
                onClick={() =>
                  setEditingProject({
                    id: `proj_${Date.now()}`,
                    name: "",
                    slug: "",
                    category: "E-commerce",
                    tagline: "",
                    shortDescription: "",
                    description: "",
                    scope: [],
                    technologies: ["Next.js", "Tailwind CSS"],
                    deliverables: [],
                    published: true,
                    featured: true,
                    status: "Completed",
                    sortOrder: projects.length,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#502D55]/12 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title / Category</th>
                    <th className="py-3 px-4">Tagline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#502D55]/10">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#FAF4F9]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#180D1D]">{proj.name}</div>
                        <div className="text-[10px] font-mono text-[#7A3F26]">{proj.category}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#56475C] max-w-xs truncate">
                        {proj.shortDescription || proj.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProjectPublished(proj)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                            proj.published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                        >
                          {proj.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{proj.published ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-1.5 rounded-lg text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProject(proj.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* ======================================================== */}
        {/* TAB 4: SERVICES MANAGEMENT                               */}
        {/* ======================================================== */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Studio Services (5 Verticals)</h2>
                <p className="text-xs text-[#56475C]">Core commercial capabilities & delivery tiers</p>
              </div>
              <button
                onClick={() =>
                  setEditingService({
                    id: `service_${Date.now()}`,
                    name: "",
                    slug: "",
                    shortDescription: "",
                    description: "",
                    category: "Development",
                    deliverables: [],
                    process: [],
                    pricing: [],
                    faq: [],
                    published: true,
                    featured: true,
                    sortOrder: services.length,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#7A3F26] uppercase font-bold">Vertical</span>
                      <h3 className="text-base font-bold text-[#180D1D]">{svc.name}</h3>
                      <span className="text-[10px] font-mono text-[#7A6880]">/services/{svc.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleServicePublished(svc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                          svc.published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {svc.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{svc.published ? "Published" : "Draft"}</span>
                      </button>
                      <button
                        onClick={() => setEditingService(svc)}
                        className="p-1.5 rounded-lg text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteService(svc.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#56475C] leading-relaxed">{svc.shortDescription}</p>
                  <div className="text-[11px] font-mono text-[#7A6880]">
                    Pricing Tiers: {(svc.pricing || []).length} • Deliverables: {(svc.deliverables || []).length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: WEBSITE PACKAGES                                  */}
        {/* ======================================================== */}
        {activeTab === "packages" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Website & E-Commerce Packages</h2>
                <p className="text-xs text-[#56475C]">Fixed deliverables and transparent commercial pricing</p>
              </div>
              <button
                onClick={() =>
                  setEditingPackage({
                    id: `pkg_${Date.now()}`,
                    name: "",
                    websiteType: "Website Package",
                    description: "",
                    price: 2999,
                    priceType: "starting",
                    unit: "/ project",
                    features: [],
                    active: true,
                    published: true,
                    sortOrder: packages.length,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Package</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#502D55]/12 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#502D55]/10">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-[#FAF4F9]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#180D1D]">{pkg.name}</td>
                      <td className="py-3 px-4 text-[#7A3F26] font-mono text-[11px]">{pkg.websiteType}</td>
                      <td className="py-3 px-4 font-bold text-[#180D1D]">
                        ₹{pkg.price.toLocaleString("en-IN")} {pkg.unit}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePackageActive(pkg)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                            pkg.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                        >
                          {pkg.active ? "Active" : "Archived"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="p-1.5 rounded-lg text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* ======================================================== */}
        {/* TAB 6: SITE CONTENT                                      */}
        {/* ======================================================== */}
        {activeTab === "content" && siteContent && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Site Content Configuration</h2>
                <p className="text-xs text-[#56475C]">Hero, About Origin, Final CTA, and Studio Identity</p>
              </div>
              <button
                onClick={saveSiteContentToFirestore}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Site Content</span>
              </button>
            </div>

            {/* 0. Homepage Layout & Section Reordering */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#502D55]/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#180D1D]">Homepage Section Layout & Ordering</h3>
                  <p className="text-[11px] text-[#56475C]">
                    Reorder sections on the public homepage or toggle their visibility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetSectionOrder}
                  className="text-[11px] font-mono text-[#7A3F26] hover:underline cursor-pointer"
                >
                  Reset to Default Layout
                </button>
              </div>

              <div className="space-y-2">
                {(siteContent.metadata?.sectionOrder || [
                  "hero",
                  "packages",
                  "apps",
                  "services",
                  "projects",
                  "about",
                  "reviews",
                  "ai-assistant",
                  "final-cta",
                ]).map((secKey, idx, arr) => {
                  const info = SECTION_INFO[secKey] || { label: secKey, desc: "Homepage section" };
                  const isVisible = siteContent.metadata?.sectionVisibility?.[secKey] !== false;

                  return (
                    <div
                      key={secKey}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        isVisible
                          ? "bg-white border-[#502D55]/12"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#FAF4F9] text-[#180D1D] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#180D1D] flex items-center gap-2">
                            <span>{info.label}</span>
                            <span className="font-mono text-[10px] text-[#56475C]">({secKey})</span>
                          </div>
                          <div className="text-[10px] text-[#56475C]">{info.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(secKey)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                            isVisible
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-300"
                          }`}
                        >
                          {isVisible ? "Visible" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          aria-label={`Move ${info.label} up`}
                          className="p-1.5 rounded-lg border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() => moveSection(idx, "down")}
                          aria-label={`Move ${info.label} down`}
                          className="p-1.5 rounded-lg border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1. Hero */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">1. Hero Section</h3>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Headline</label>
                <input
                  type="text"
                  value={siteContent.hero.headline}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, headline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Subheadline</label>
                <textarea
                  rows={3}
                  value={siteContent.hero.subheadline}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, subheadline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.badge || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.announcement || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, announcement: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Primary CTA Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.primaryCtaText || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Primary CTA Link</label>
                  <input
                    type="text"
                    value={siteContent.hero.primaryCtaLink || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, primaryCtaLink: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Secondary CTA Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.secondaryCtaText || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Secondary CTA Link</label>
                  <input
                    type="text"
                    value={siteContent.hero.secondaryCtaLink || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        hero: { ...siteContent.hero, secondaryCtaLink: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
            </div>

            {/* 2. About */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">2. About Origin Section</h3>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={siteContent.about.eyebrow}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Headline</label>
                <input
                  type="text"
                  value={siteContent.about.headline}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, headline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Studio Ethos</label>
                <input
                  type="text"
                  value={siteContent.about.ethos}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, ethos: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={siteContent.about.bio}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, bio: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
            </div>

            {/* 3. Final CTA */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">3. Final Collaboration CTA</h3>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={siteContent.finalCta.eyebrow}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      finalCta: { ...siteContent.finalCta, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Headline</label>
                <input
                  type="text"
                  value={siteContent.finalCta.headline}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      finalCta: { ...siteContent.finalCta, headline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={siteContent.finalCta.description}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      finalCta: { ...siteContent.finalCta, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={siteContent.finalCta.primaryCtaText || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        finalCta: { ...siteContent.finalCta, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Secondary CTA Button</label>
                  <input
                    type="text"
                    value={siteContent.finalCta.secondaryCtaText || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        finalCta: { ...siteContent.finalCta, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Contact & Socials */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">4. Contact Channels</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={siteContent.contact.email}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        contact: { ...siteContent.contact, email: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={siteContent.contact.whatsappNumber}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        contact: { ...siteContent.contact, whatsappNumber: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={siteContent.contact.instagramHandle || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        contact: { ...siteContent.contact, instagramHandle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={siteContent.contact.instagramUrl || ""}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        contact: { ...siteContent.contact, instagramUrl: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Skills & Disciplines */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">
                5. Skills & Studio Disciplines (About Page)
              </h3>
              <p className="text-[11px] text-[#56475C]">
                These skill categories and tags are rendered on the public <code>/about</code> page. Separate items with commas.
              </p>
              <div className="space-y-3">
                {(siteContent.metadata?.skills || [
                  { category: "Mobile & App Engineering", items: ["Flutter", "Dart", "iOS", "Android", "Offline-First SQLite"] },
                  { category: "Web & Storefronts", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Razorpay"] },
                  { category: "Marketplace & E-Commerce", items: ["Amazon Listing SEO", "A+ Content (EBC)", "Catalog Architecture", "EasyXo"] },
                  { category: "AI & Media Systems", items: ["Gemini 2.5 API", "Automated Video Pipeline", "Image Staging"] },
                ]).map((skillGroup, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FAF4F9]/60 border border-[#502D55]/10 space-y-2">
                    <label className="text-[11px] font-bold text-[#180D1D] block">
                      {skillGroup.category}
                    </label>
                    <input
                      type="text"
                      value={skillGroup.items.join(", ")}
                      onChange={(e) => {
                        const newSkills = [
                          ...(siteContent.metadata?.skills || [
                            { category: "Mobile & App Engineering", items: ["Flutter", "Dart", "iOS", "Android", "Offline-First SQLite"] },
                            { category: "Web & Storefronts", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Razorpay"] },
                            { category: "Marketplace & E-Commerce", items: ["Amazon Listing SEO", "A+ Content (EBC)", "Catalog Architecture", "EasyXo"] },
                            { category: "AI & Media Systems", items: ["Gemini 2.5 API", "Automated Video Pipeline", "Image Staging"] },
                          ]),
                        ];
                        newSkills[idx] = {
                          ...newSkills[idx],
                          items: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setSiteContent({
                          ...siteContent,
                          metadata: {
                            ...siteContent.metadata,
                            skills: newSkills,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#502D55]/15 text-xs text-[#180D1D]"
                      placeholder="Skill 1, Skill 2, Skill 3"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 6. SEO & Meta Information */}
            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#180D1D] border-b border-[#502D55]/10 pb-2">
                6. SEO & Meta Information
              </h3>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Default Meta Title</label>
                <input
                  type="text"
                  value={siteContent.metadata?.seo?.title || ""}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      metadata: {
                        ...siteContent.metadata,
                        seo: {
                          title: e.target.value,
                          description: siteContent.metadata?.seo?.description || "",
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Default Meta Description</label>
                <textarea
                  rows={2}
                  value={siteContent.metadata?.seo?.description || ""}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      metadata: {
                        ...siteContent.metadata,
                        seo: {
                          title: siteContent.metadata?.seo?.title || "",
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: REVIEWS MODERATION                                */}
        {/* ======================================================== */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#180D1D]">Client Reviews Moderation</h2>
              <p className="text-xs text-[#56475C]">
                Strict authentic reviews policy. Approve or reject public display.
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-[#502D55]/12 text-center text-xs text-[#7A6880]">
                No review submissions currently in Firestore.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#502D55]/12 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Author / Service</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Review Content</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#502D55]/10">
                    {reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-[#FAF4F9]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#180D1D]">{rev.name}</div>
                          <div className="text-[10px] font-mono text-[#7A3F26]">{rev.service}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#180D1D]">★ {rev.rating} / 5</td>
                        <td className="py-3 px-4 text-[11px] text-[#56475C] max-w-sm truncate">{rev.review}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              rev.status === "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : rev.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {rev.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rev.status !== "approved" && (
                              <button
                                onClick={() => updateReviewStatus(rev.id, "approved", true)}
                                className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {rev.status !== "rejected" && (
                              <button
                                onClick={() => updateReviewStatus(rev.id, "rejected")}
                                className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => deleteReviewDoc(rev.id)}
                              className="p-1 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
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
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: SETTINGS                                          */}
        {/* ======================================================== */}
        {activeTab === "settings" && settings && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#180D1D]">Global Studio Settings</h2>
                <p className="text-xs text-[#56475C]">Public studio metadata & communication channels</p>
              </div>
              <button
                onClick={saveSettingsToFirestore}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Studio Brand Name</label>
                <input
                  type="text"
                  value={settings.studioName}
                  onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Studio Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">WhatsApp Desk Number</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={settings.instagramHandle || ""}
                  onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#56475C] mb-1">Live URL</label>
                <input
                  type="text"
                  value={settings.liveUrl || ""}
                  onChange={(e) => setSettings({ ...settings, liveUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-[#180D1D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode ?? false}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <span>Maintenance Mode</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-[#180D1D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowPublicReviews ?? true}
                    onChange={(e) => setSettings({ ...settings, allowPublicReviews: e.target.checked })}
                  />
                  <span>Allow Public Reviews</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit App */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#502D55]/10 pb-3">
                <h3 className="text-base font-bold text-[#180D1D]">
                  {editingApp.id ? `Edit App: ${editingApp.name || editingApp.id}` : "Create New App"}
                </h3>
                <button
                  onClick={() => setEditingApp(null)}
                  className="text-xs text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">App Name</label>
                    <input
                      type="text"
                      value={editingApp.name || ""}
                      onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editingApp.slug || ""}
                      onChange={(e) => setEditingApp({ ...editingApp, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingApp.tagline || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingApp.shortDescription || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editingApp.description || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                {/* Logo & Upload */}
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">App Logo (URL or Upload)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editingApp.logo || ""}
                      onChange={(e) => setEditingApp({ ...editingApp, logo: e.target.value })}
                      placeholder="https://... or upload file"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] text-xs font-bold cursor-pointer hover:bg-[#F3E5D8] shrink-0 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file, "apps");
                            if (url) setEditingApp((prev) => ({ ...prev, logo: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Live URL</label>
                    <input
                      type="text"
                      value={editingApp.url || ""}
                      onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Waitlist URL</label>
                    <input
                      type="text"
                      value={editingApp.waitlistUrl || ""}
                      onChange={(e) => setEditingApp({ ...editingApp, waitlistUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Status</label>
                    <select
                      value={editingApp.status || "IN_DEVELOPMENT"}
                      onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as AppDocument["status"] })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs"
                    >
                      <option value="LIVE">LIVE</option>
                      <option value="IN_DEVELOPMENT">IN_DEVELOPMENT</option>
                      <option value="COMING_SOON">COMING_SOON</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingApp.sortOrder ?? 0}
                      onChange={(e) => setEditingApp({ ...editingApp, sortOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingApp.published ?? true}
                      onChange={(e) => setEditingApp({ ...editingApp, published: e.target.checked })}
                    />
                    <span>Published to Public Site</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingApp.featured ?? false}
                      onChange={(e) => setEditingApp({ ...editingApp, featured: e.target.checked })}
                    />
                    <span>Featured App</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#502D55]/10">
                <button
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#56475C] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAppModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] cursor-pointer"
                >
                  Save App
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Project */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#502D55]/10 pb-3">
                <h3 className="text-base font-bold text-[#180D1D]">
                  {editingProject.id ? `Edit Project: ${editingProject.name || editingProject.id}` : "Create Project"}
                </h3>
                <button
                  onClick={() => setEditingProject(null)}
                  className="text-xs text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Project Name</label>
                    <input
                      type="text"
                      value={editingProject.name || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editingProject.slug || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Category</label>
                    <input
                      type="text"
                      value={editingProject.category || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Status</label>
                    <input
                      type="text"
                      value={editingProject.status || "Completed"}
                      onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectDocument["status"] })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingProject.tagline || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProject.description || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                {/* Cover Image & Upload */}
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Cover Image (URL or Upload)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editingProject.coverImage || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                      placeholder="https://... or upload file"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] text-xs font-bold cursor-pointer hover:bg-[#F3E5D8] shrink-0 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file, "projects");
                            if (url) setEditingProject((prev) => ({ ...prev, coverImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Live URL</label>
                  <input
                    type="text"
                    value={editingProject.url || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingProject.published ?? true}
                      onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                    />
                    <span>Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingProject.featured ?? false}
                      onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    />
                    <span>Featured Case Study</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#502D55]/10">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#56475C] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProjectModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Service */}
        {editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#502D55]/10 pb-3">
                <h3 className="text-base font-bold text-[#180D1D]">
                  {editingService.id ? `Edit Service: ${editingService.name || editingService.id}` : "Create Service"}
                </h3>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-xs text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Service Title / Name</label>
                    <input
                      type="text"
                      value={editingService.name || ""}
                      onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editingService.slug || ""}
                      onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Short Tagline</label>
                  <input
                    type="text"
                    value={editingService.shortDescription || ""}
                    onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editingService.description || ""}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingService.sortOrder ?? 0}
                      onChange={(e) => setEditingService({ ...editingService, sortOrder: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={editingService.published ?? true}
                        onChange={(e) => setEditingService({ ...editingService, published: e.target.checked })}
                      />
                      <span>Published to Site</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#502D55]/10">
                <button
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#56475C] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveServiceModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Website Package */}
        {editingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#502D55]/10 pb-3">
                <h3 className="text-base font-bold text-[#180D1D]">
                  {editingPackage.id ? `Edit Package: ${editingPackage.name || editingPackage.id}` : "Create Package"}
                </h3>
                <button
                  onClick={() => setEditingPackage(null)}
                  className="text-xs text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Package Name</label>
                    <input
                      type="text"
                      value={editingPackage.name || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Website Type</label>
                    <input
                      type="text"
                      value={editingPackage.websiteType || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, websiteType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={editingPackage.price ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Price Type</label>
                    <input
                      type="text"
                      value={editingPackage.priceType || "fixed"}
                      onChange={(e) => setEditingPackage({ ...editingPackage, priceType: e.target.value as WebsitePackageDocument["priceType"] })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Turnaround / Unit</label>
                    <input
                      type="text"
                      value={editingPackage.unit || "3-5 days delivery"}
                      onChange={(e) => setEditingPackage({ ...editingPackage, unit: e.target.value })}
                      placeholder="e.g. 3-5 days delivery"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#56475C] mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingPackage.badge || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })}
                      placeholder="e.g. Best Value, Starter"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Description / Tagline</label>
                  <textarea
                    rows={2}
                    value={editingPackage.description || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">
                    Deliverables & Features (one per line)
                  </label>
                  <textarea
                    rows={5}
                    value={(editingPackage.features || []).join("\n")}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        features: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                      })
                    }
                    placeholder="Complete Listing Optimization&#10;7 High-Resolution Infographics&#10;Backend Search Terms"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingPackage.active ?? true}
                      onChange={(e) => setEditingPackage({ ...editingPackage, active: e.target.checked })}
                    />
                    <span>Active in Public Catalog</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingPackage.recommended ?? false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, recommended: e.target.checked })}
                    />
                    <span>Recommended</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingPackage.popular ?? false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, popular: e.target.checked })}
                    />
                    <span>Popular Highlight</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#502D55]/10">
                <button
                  onClick={() => setEditingPackage(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#56475C] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={savePackageModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] cursor-pointer"
                >
                  Save Package
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
