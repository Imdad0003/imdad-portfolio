import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { appsData, getAppBySlug } from "@/data/apps";
import { projectsData } from "@/data/projectsData";
import { studioServices } from "@/data/servicesData";
import { allServices, corePackages } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  SiteContentDocument,
  SettingsDocument,
  MediaAssetDocument,
} from "@/types/cms";
import type {
  AppReleaseDocument,
  ReleaseAuditLogDocument,
} from "@/types/releases";

// ==========================================
// 1. PUBLIC READ APIS (WITH STATIC FALLBACK)
// ==========================================

export async function getPublishedApps(): Promise<AppDocument[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "apps"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as AppDocument))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (err) {
      console.warn("Firestore getPublishedApps fallback:", err);
    }
  }

  // Fallback to static data
  return appsData.map((app, idx) => ({
    id: app.id,
    name: app.name,
    slug: app.slug,
    shortDescription: app.description,
    description: app.fullDescription,
    platform: app.platform,
    status: (app.status === "live"
      ? "LIVE"
      : app.status === "in-development"
      ? "IN_DEVELOPMENT"
      : "COMING_SOON") as AppDocument["status"],
    features: app.features,
    technologies: app.techStack,
    url: app.links.liveUrl,
    waitlistUrl: app.links.waitlistUrl,
    featured: app.featured,
    sortOrder: idx,
    category: app.category,
    accentColor: app.accentColor,
    version: app.version,
    releaseDate: app.releaseDate,
    packageName: app.packageName,
    supportEmail: app.supportEmail,
    latestDownloadUrl: app.latestDownloadUrl,
    latestVersionName: app.latestVersionName,
    latestVersionCode: app.latestVersionCode,
    latestApkSize: app.latestApkSize,
    latestSha256: app.latestSha256,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));
}

export async function getPublishedAppBySlug(slug: string): Promise<AppDocument | null> {
  const normalizedSlug = slug.toLowerCase();
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "apps"),
        where("slug", "==", normalizedSlug),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() } as AppDocument;
      }
    } catch (err) {
      console.warn(`Firestore getPublishedAppBySlug (${slug}) fallback:`, err);
    }
  }

  const staticApp = getAppBySlug(normalizedSlug);
  if (!staticApp) return null;

  return {
    id: staticApp.id,
    name: staticApp.name,
    slug: staticApp.slug,
    shortDescription: staticApp.description,
    description: staticApp.fullDescription,
    platform: staticApp.platform,
    status: (staticApp.status === "live"
      ? "LIVE"
      : staticApp.status === "in-development"
      ? "IN_DEVELOPMENT"
      : "COMING_SOON") as AppDocument["status"],
    features: staticApp.features,
    technologies: staticApp.techStack,
    url: staticApp.links.liveUrl,
    waitlistUrl: staticApp.links.waitlistUrl,
    featured: staticApp.featured,
    sortOrder: 0,
    category: staticApp.category,
    accentColor: staticApp.accentColor,
    version: staticApp.version,
    releaseDate: staticApp.releaseDate,
    packageName: staticApp.packageName,
    supportEmail: staticApp.supportEmail,
    latestDownloadUrl: staticApp.latestDownloadUrl,
    latestVersionName: staticApp.latestVersionName,
    latestVersionCode: staticApp.latestVersionCode,
    latestApkSize: staticApp.latestApkSize,
    latestSha256: staticApp.latestSha256,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  };
}

export async function getPublishedProjects(): Promise<ProjectDocument[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "projects"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              technologies: data.technologies || data.tools || [],
            } as ProjectDocument;
          })
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (err) {
      console.warn("Firestore getPublishedProjects fallback:", err);
    }
  }

  return projectsData.map((p, idx) => ({
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
    url: p.url,
    featured: p.featured,
    sortOrder: idx,
    highlight: p.highlight,
    accentColor: p.accentColor,
    status: p.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectDocument | null> {
  const normalizedSlug = slug.toLowerCase();
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "projects"),
        where("slug", "==", normalizedSlug),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        const data = d.data();
        return {
          id: d.id,
          ...data,
          technologies: data.technologies || data.tools || [],
        } as ProjectDocument;
      }
    } catch (err) {
      console.warn(`Firestore getPublishedProjectBySlug (${slug}) fallback:`, err);
    }
  }

  const p = projectsData.find((item) => item.slug.toLowerCase() === normalizedSlug);
  if (!p) return null;

  return {
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
    url: p.url,
    featured: p.featured,
    sortOrder: 0,
    highlight: p.highlight,
    accentColor: p.accentColor,
    status: p.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  };
}

export async function getPublishedServices(): Promise<ServiceDocument[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "services"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as ServiceDocument))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (err) {
      console.warn("Firestore getPublishedServices fallback:", err);
    }
  }

  return studioServices.map((s, idx) => ({
    id: s.id,
    name: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    description: s.fullDescription,
    category: s.title,
    deliverables: s.deliverables,
    process: s.process.map((p) => ({
      step: p.step,
      title: p.title,
      description: p.description,
      deliverable: "Milestone Review",
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
    sortOrder: idx,
    iconName: s.iconName,
    accentColor: s.accentColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));
}

export async function getPublishedServiceBySlug(slug: string): Promise<ServiceDocument | null> {
  const normalizedSlug = slug.toLowerCase();
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "services"),
        where("slug", "==", normalizedSlug),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          name: raw.name || raw.title || "",
          deliverables: raw.deliverables || [],
        } as ServiceDocument;
      }
    } catch (err) {
      console.warn(`Firestore getPublishedServiceBySlug (${slug}) fallback:`, err);
    }
  }

  const s = studioServices.find((item) => item.slug.toLowerCase() === normalizedSlug);
  if (!s) return null;

  return {
    id: s.id,
    name: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    description: s.fullDescription,
    category: s.title,
    deliverables: s.deliverables,
    process: s.process.map((p) => ({
      step: p.step,
      title: p.title,
      description: p.description,
      deliverable: "Milestone Review",
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
    sortOrder: 0,
    iconName: s.iconName,
    accentColor: s.accentColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  };
}

export async function getPublishedPackages(): Promise<WebsitePackageDocument[]> {
  const defaultCorePackages: WebsitePackageDocument[] = corePackages.map((pkg, idx) => ({
    id: pkg.id,
    name: pkg.name,
    websiteType: "Commercial Package",
    description: pkg.tagline,
    features: pkg.deliverables,
    price: pkg.price,
    priceType: "fixed",
    unit: pkg.turnaround,
    badge: (pkg.badge || null) as WebsitePackageDocument["badge"],
    recommended: pkg.popular || pkg.badge === "Best Value",
    popular: pkg.popular,
    active: true,
    ctaText: `Book ${pkg.name}`,
    sortOrder: idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));

  const websiteServices = allServices.filter(
    (s) => s.category === "websites" || s.category === "ecommerce"
  );

  const defaultServicePackages: WebsitePackageDocument[] = websiteServices.map((item, idx) => ({
    id: item.id,
    name: item.name,
    websiteType: item.categoryLabel,
    description: item.description,
    features: item.deliverables,
    price: item.price,
    priceType: item.priceType,
    priceMax: item.priceMax,
    unit: item.unit,
    badge: item.badge,
    recommended: item.recommended,
    active: true,
    sortOrder: defaultCorePackages.length + idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));

  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "websitePackages"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestorePkgs = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              active: data.active ?? true,
              published: data.published ?? true,
            } as WebsitePackageDocument;
          })
          .filter((d) => d.active !== false);

        // Ensure commercial core packages are always available
        const existingIds = new Set(firestorePkgs.map((p) => p.id));
        const missingCore = defaultCorePackages.filter((cp) => !existingIds.has(cp.id));
        const combined = [...firestorePkgs, ...missingCore];

        return combined.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (err) {
      console.warn("Firestore getPublishedPackages fallback:", err);
    }
  }

  return [...defaultCorePackages, ...defaultServicePackages];
}

export const defaultSiteContent: SiteContentDocument = {
  id: "main",
  hero: {
    badge: "DIGITAL PRODUCT STUDIO",
    headline: "Apps, Platforms & Digital Commerce.",
    highlightedText: "Digital Commerce.",
    subheadline:
      "Independent studio engineering high-performance mobile apps, web applications, conversion-engineered e-commerce engines, and retention media.",
    primaryCtaText: "Explore New Apps",
    primaryCtaLink: "/apps",
    secondaryCtaText: "Studio Services",
    secondaryCtaLink: "/services",
    announcement: "Now building: WishMusic & WishTracking for iOS/Android",
    heroImage: "/imdad-logo.png",
    heroImageAlt: "IMDAD.BUILDS Product Lab",
  },
  navigation: {
    logo: "/imdad-logo.png",
    brandName: "IMDAD.BUILDS",
    badgeText: "PRODUCT STUDIO // LAB",
    navLinks: [
      { label: "Apps", href: "/apps" },
      { label: "Services", href: "/services" },
      { label: "Projects", href: "/projects" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
    ctaText: "Start a Project",
    ctaLink: "/contact",
  },
  appsSection: {
    eyebrow: "PRODUCT LAB // CURRENT RELEASES",
    title: "New Apps",
    subtitle:
      "Digital products conceptualized, engineered, and shipped by Imdad.builds. Distinctive tools with zero bloat.",
    ctaText: "VIEW ALL APPS & ECOSYSTEM",
    ctaLink: "/apps",
  },
  servicesSection: {
    eyebrow: "STUDIO CAPABILITIES // 5 DISCIPLINES",
    title: "Studio Services",
    subtitle:
      "High-precision engineering, e-commerce operations, and direct-response creative media tailored for ambitious brands.",
    ctaText: "EXPLORE ALL SERVICES & PRICING",
    ctaLink: "/services",
  },
  projectsSection: {
    eyebrow: "CASE STUDIES // PROVEN EXECUTION",
    title: "Featured Projects",
    subtitle:
      "Real commerce ventures, technical storefronts, and conversion-first visual architectures shipped by our studio.",
    ctaText: "VIEW ALL CASE STUDIES",
    ctaLink: "/projects",
  },
  about: {
    eyebrow: "STUDIO ORIGIN",
    headline: "Building software, platforms & creative assets with commercial precision.",
    bio: "Imdad.builds was founded as an independent digital studio where software engineering converges with direct commercial reality. Unlike agencies who theorize about products, we build, launch, and operate them ourselves.",
    ethos: "Zero bloat. Fast iterations. Real products powered by imdad.builds.",
    location: "India • Global Distribution",
    pillars: [
      {
        number: "01",
        title: "Real Products, Zero Fluff",
        description:
          "We build working codebases, deployed mobile applications, and verified marketplace listings. No fake startup metrics or vanity presentations.",
      },
      {
        number: "02",
        title: "Direct Founder Partnership",
        description:
          "No middle managers or delegated offshore handoffs. You collaborate directly with the builder who architects, codes, and refines your solution.",
      },
      {
        number: "03",
        title: "Commercial-First Engineering",
        description:
          "Code is engineered for reliability, conversion, and clean distribution. Fast turnaround without compromising architecture.",
      },
    ],
  },
  finalCta: {
    eyebrow: "DIRECT FOUNDER COLLABORATION // Q2-Q3 2026",
    headline: "Have an ambitious product idea or digital service need?",
    description:
      "From early conceptual wireframes to high-conversion stores and consumer apps, let's build something enduring together.",
    primaryCtaText: "Start a Project",
    primaryCtaLink: "/contact",
    secondaryCtaText: "Explore the Studio",
    secondaryCtaLink: "/about",
    badgeText: "STUDIO OPEN FOR PROJECTS",
    footnote:
      "ESTIMATED TIMELINES: 3–14 DAYS • SCOPED FIXED RATES • ZERO RETAINER TRAPS",
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
    logo: "/imdad-logo.png",
    tagline: siteConfig.subTagline,
    copyrightYear: 2026,
    studioName: siteConfig.name,
    description:
      "Independent digital product studio founded by Imdad. We architect and build mobile apps, web applications, e-commerce solutions, and high-retention creative media.",
    copyrightText: "© 2026 IMDAD.BUILDS. All rights reserved. Powered by imdad.builds.",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Apps", href: "/apps" },
      { label: "Services", href: "/services" },
      { label: "Projects", href: "/projects" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  metadata: {
    sectionOrder: [
      "hero",
      "apps",
      "services",
      "projects",
      "about",
      "final-cta",
    ],
    sectionVisibility: {
      hero: true,
      packages: false,
      apps: true,
      services: true,
      projects: true,
      about: true,
      reviews: false,
      "ai-assistant": false,
      "final-cta": true,
    },
    skills: [
      {
        category: "Mobile & App Engineering",
        items: ["Flutter", "Dart", "iOS", "Android", "State Management", "Offline-First SQLite"],
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
      ogImage: "/imdad-logo.png",
      keywords: ["IMDAD.BUILDS", "Product Studio", "Mobile Apps", "Web Development", "WishMusic"],
    },
  },
  published: true,
  updatedAt: new Date().toISOString(),
};

function mergeSiteContent(raw: Record<string, any>, targetId: "main" | "draft" = "main"): SiteContentDocument {
  return {
    id: targetId,
    hero: {
      ...defaultSiteContent.hero,
      ...(raw.hero || {}),
    },
    navigation: {
      ...defaultSiteContent.navigation,
      ...(raw.navigation || {}),
    },
    appsSection: {
      ...defaultSiteContent.appsSection,
      ...(raw.appsSection || {}),
    },
    servicesSection: {
      ...defaultSiteContent.servicesSection,
      ...(raw.servicesSection || {}),
    },
    projectsSection: {
      ...defaultSiteContent.projectsSection,
      ...(raw.projectsSection || {}),
    },
    about: {
      ...defaultSiteContent.about,
      ...(raw.about || {}),
      pillars: raw.about?.pillars || defaultSiteContent.about.pillars,
    },
    finalCta: {
      ...defaultSiteContent.finalCta,
      ...(raw.finalCta || {}),
    },
    contact: {
      ...defaultSiteContent.contact,
      ...(raw.contact || {}),
    },
    socialLinks: {
      ...defaultSiteContent.socialLinks,
      ...(raw.socialLinks || {}),
    },
    footer: {
      ...defaultSiteContent.footer,
      ...(raw.footer || {}),
    },
    metadata: {
      sectionOrder: raw.metadata?.sectionOrder || defaultSiteContent.metadata?.sectionOrder,
      sectionVisibility: {
        ...defaultSiteContent.metadata?.sectionVisibility,
        ...(raw.metadata?.sectionVisibility || {}),
      },
      skills: raw.metadata?.skills || defaultSiteContent.metadata?.skills,
      seo: {
        ...defaultSiteContent.metadata?.seo,
        ...(raw.metadata?.seo || {}),
      },
    },
    published: raw.published ?? true,
    publishedAt: raw.publishedAt,
    publishedBy: raw.publishedBy,
    draftModifiedAt: raw.draftModifiedAt,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export async function getSiteContent(options?: { isDraft?: boolean }): Promise<SiteContentDocument> {
  const isDraft = options?.isDraft === true;

  if (db && isFirebaseConfigured) {
    try {
      if (isDraft) {
        const draftRef = doc(db, "siteContent", "draft");
        const draftSnap = await getDoc(draftRef);
        if (draftSnap.exists()) {
          return mergeSiteContent(draftSnap.data(), "draft");
        }
      }

      const mainRef = doc(db, "siteContent", "main");
      const snap = await getDoc(mainRef);
      if (snap.exists()) {
        return mergeSiteContent(snap.data(), "main");
      }
    } catch (err) {
      console.warn("Firestore getSiteContent fallback:", err);
    }
  }

  return { ...defaultSiteContent };
}

export async function getSettings(): Promise<SettingsDocument> {
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "settings", "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: "global", ...snap.data() } as SettingsDocument;
      }
    } catch (err) {
      console.warn("Firestore getSettings fallback:", err);
    }
  }

  return {
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
  };
}

// ==========================================
// 2. ADMIN CRUD APIS
// ==========================================

export async function getAllAppsAdmin(): Promise<AppDocument[]> {
  if (!db) return [];
  const q = query(collection(db, "apps"), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument));
}

export async function saveAppAdmin(app: Partial<AppDocument> & { id: string }): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "apps", app.id);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...app,
      updatedAt: now,
      createdAt: app.createdAt || now,
    },
    { merge: true }
  );
}

export async function deleteAppAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "apps", id));
}

export async function getAllProjectsAdmin(): Promise<ProjectDocument[]> {
  if (!db) return [];
  const q = query(collection(db, "projects"), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectDocument));
}

function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        cleaned[k] = v.map((item) =>
          typeof item === "object" && item !== null ? cleanUndefined(item) : item
        );
      } else {
        cleaned[k] = v;
      }
    }
  }
  return cleaned as Partial<T>;
}

export async function saveProjectAdmin(
  project: Partial<ProjectDocument> & { id: string }
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "projects", project.id);
  const now = new Date().toISOString();
  const payload = cleanUndefined({
    ...project,
    updatedAt: now,
    createdAt: project.createdAt || now,
  });
  await setDoc(docRef, payload, { merge: true });
}

export async function deleteProjectAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "projects", id));
}

export async function getAllServicesAdmin(): Promise<ServiceDocument[]> {
  if (!db) return [];
  const q = query(collection(db, "services"), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceDocument));
}

export async function saveServiceAdmin(
  service: Partial<ServiceDocument> & { id: string }
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "services", service.id);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...service,
      updatedAt: now,
      createdAt: service.createdAt || now,
    },
    { merge: true }
  );
}

export async function deleteServiceAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "services", id));
}

export async function getAllPackagesAdmin(): Promise<WebsitePackageDocument[]> {
  if (!db) return [];
  const q = query(collection(db, "websitePackages"), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WebsitePackageDocument));
}

export async function savePackageAdmin(
  pkg: Partial<WebsitePackageDocument> & { id: string }
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "websitePackages", pkg.id);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...pkg,
      updatedAt: now,
      createdAt: pkg.createdAt || now,
    },
    { merge: true }
  );
}

export async function deletePackageAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "websitePackages", id));
}

export async function saveSiteContentAdmin(content: Partial<SiteContentDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "siteContent", "main");
  await setDoc(
    docRef,
    {
      ...content,
      id: "main",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function saveSiteContentDraft(content: Partial<SiteContentDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "siteContent", "draft");
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...content,
      id: "draft",
      draftModifiedAt: now,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function publishSiteContent(
  content: Partial<SiteContentDocument>,
  publisherEmail?: string
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const now = new Date().toISOString();
  const payload = {
    ...content,
    id: "main",
    published: true,
    publishedAt: now,
    publishedBy: publisherEmail || "admin",
    updatedAt: now,
  };

  // Promote to public main document
  await setDoc(doc(db, "siteContent", "main"), payload, { merge: true });

  // Keep draft in sync
  await setDoc(doc(db, "siteContent", "draft"), { ...payload, id: "draft" }, { merge: true });
}

// ==========================================
// 2.5 MEDIA LIBRARY APIS
// ==========================================

export async function getAllMediaAssetsAdmin(category?: string): Promise<MediaAssetDocument[]> {
  if (!db) return [];
  try {
    let q = query(collection(db, "mediaAssets"), orderBy("createdAt", "desc"));
    if (category && category !== "all") {
      q = query(
        collection(db, "mediaAssets"),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MediaAssetDocument));
  } catch (err) {
    console.warn("getAllMediaAssetsAdmin error:", err);
    return [];
  }
}

export async function saveMediaAssetAdmin(asset: Partial<MediaAssetDocument> & { id: string }): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "mediaAssets", asset.id);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...asset,
      updatedAt: now,
      createdAt: asset.createdAt || now,
    },
    { merge: true }
  );
}

export async function checkAssetUsage(url: string): Promise<{ inUse: boolean; locations: string[] }> {
  const locations: string[] = [];
  if (!db || !url) return { inUse: false, locations };

  try {
    // 1. Check site content
    const siteSnap = await getDoc(doc(db, "siteContent", "main"));
    if (siteSnap.exists()) {
      const siteStr = JSON.stringify(siteSnap.data());
      if (siteStr.includes(url)) {
        locations.push("Published Homepage");
      }
    }

    // 2. Check apps
    const appsSnap = await getDocs(collection(db, "apps"));
    appsSnap.docs.forEach((d) => {
      const data = d.data();
      if (JSON.stringify(data).includes(url)) {
        locations.push(`App: ${data.name || d.id}`);
      }
    });

    // 3. Check projects
    const projSnap = await getDocs(collection(db, "projects"));
    projSnap.docs.forEach((d) => {
      const data = d.data();
      if (JSON.stringify(data).includes(url)) {
        locations.push(`Project: ${data.name || d.id}`);
      }
    });
  } catch (err) {
    console.warn("Error checking asset usage:", err);
  }

  return {
    inUse: locations.length > 0,
    locations,
  };
}

export async function deleteMediaAssetAdmin(
  id: string,
  url?: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) throw new Error("Firestore is not initialized");

  if (url) {
    const usage = await checkAssetUsage(url);
    if (usage.inUse) {
      return {
        success: false,
        error: `Cannot delete asset: still referenced in ${usage.locations.join(", ")}. Please replace or remove references first.`,
      };
    }
  }

  await deleteDoc(doc(db, "mediaAssets", id));
  return { success: true };
}

export async function saveSettingsAdmin(settings: Partial<SettingsDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "settings", "global");
  await setDoc(
    docRef,
    {
      ...settings,
      id: "global",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// ==========================================
// 3. APP DISTRIBUTION & RELEASES APIS
// ==========================================

export async function getPublishedReleases(appId: string): Promise<AppReleaseDocument[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "appReleases"),
        where("appId", "==", appId),
        where("status", "==", "published"),
        orderBy("versionCode", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppReleaseDocument));
      }
    } catch (err) {
      console.warn(`Firestore getPublishedReleases (${appId}) fallback:`, err);
    }
  }

  // Return empty array when no verified releases have been published to Firestore.
  // This ensures honest pre-flight status until the production APK is uploaded.
  return [];
}

export async function getLatestStableRelease(appId: string): Promise<AppReleaseDocument | null> {
  const releases = await getPublishedReleases(appId);
  if (releases.length === 0) return null;
  return releases.find((r) => r.isLatestStable) || releases[0];
}

export async function getAllReleasesAdmin(appId?: string): Promise<AppReleaseDocument[]> {
  if (!db) return [];
  try {
    let q = query(collection(db, "appReleases"), orderBy("createdAt", "desc"));
    if (appId) {
      q = query(
        collection(db, "appReleases"),
        where("appId", "==", appId),
        orderBy("versionCode", "desc")
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppReleaseDocument));
  } catch (err) {
    console.warn("getAllReleasesAdmin query error:", err);
    return [];
  }
}

export async function getAllReleaseAuditLogsAdmin(appId?: string): Promise<ReleaseAuditLogDocument[]> {
  if (!db) return [];
  try {
    let q = query(collection(db, "releaseAuditLogs"), orderBy("timestamp", "desc"));
    if (appId) {
      q = query(
        collection(db, "releaseAuditLogs"),
        where("appId", "==", appId),
        orderBy("timestamp", "desc")
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReleaseAuditLogDocument));
  } catch (err) {
    console.warn("getAllReleaseAuditLogsAdmin error:", err);
    return [];
  }
}

