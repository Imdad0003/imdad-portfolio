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
import { studioTeam } from "@/data/team";
import { navItems, companyNavItems, legalNavItems } from "@/data/navigation";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  SiteContentDocument,
  SettingsDocument,
  MediaAssetDocument,
  HeroQuickStartItem,
  HeroTrustHighlight,
  OverviewPillarConfig,
  ProcessStepConfig,
  WhyUsItemConfig,
  TeamMemberConfig,
  FooterColumnConfig,
  CustomSectionConfig,
  SiteThemeSettings,
} from "@/types/cms";
import type {
  AppReleaseDocument,
  ReleaseAuditLogDocument,
} from "@/types/releases";

// ==========================================
// 1. PUBLIC READ APIS (WITH STATIC FALLBACK)
// ==========================================

async function isCollectionInitialized(
  key: "apps" | "projects" | "services" | "packages"
): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return Boolean(snap.exists() && snap.data()?.initializedCollections?.[key] === true);
  } catch {
    return false;
  }
}

export async function getPublishedApps(): Promise<AppDocument[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "apps"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as AppDocument))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        if (list.length > 0) return list;
      }
      if (await isCollectionInitialized("apps")) {
        return [];
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
    logo: app.logo,
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
      if (await isCollectionInitialized("projects")) {
        return [];
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
      if (await isCollectionInitialized("services")) {
        return [];
      }
    } catch (err) {
      console.warn("Firestore getPublishedServices fallback:", err);
    }
  }

  return studioServices.map((s, idx) => ({
    id: s.id,
    name: s.title,
    slug: s.slug,
    tagline: s.tagline,
    shortDescription: s.shortDescription,
    description: s.fullDescription,
    category: s.title,
    capabilities: s.capabilities,
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
    pricingNote: s.pricingNote,
    demos: s.demos || [],
    teamMembers: s.teamMembers || [],
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

export async function getFirestoreServiceBySlug(slug: string): Promise<ServiceDocument | null> {
  const normalizedSlug = slug.toLowerCase();
  if (!db || !isFirebaseConfigured) return null;
  try {
    const q = query(
      collection(db, "services"),
      where("slug", "==", normalizedSlug),
      where("published", "==", true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    const raw = d.data();
    return {
      id: d.id,
      ...raw,
      name: raw.name || raw.title || "",
      deliverables: raw.deliverables || [],
    } as ServiceDocument;
  } catch {
    return null;
  }
}

export async function getPublishedServiceBySlug(slug: string): Promise<ServiceDocument | null> {
  const normalizedSlug = slug.toLowerCase();
  const staticFallback = studioServices.find((item) => item.slug.toLowerCase() === normalizedSlug);

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
          name: raw.name || raw.title || staticFallback?.title || "",
          tagline: raw.tagline || staticFallback?.tagline,
          capabilities: raw.capabilities || staticFallback?.capabilities || [],
          deliverables: raw.deliverables || [],
          pricingNote: raw.pricingNote ?? staticFallback?.pricingNote,
          demos: Array.isArray(raw.demos) ? raw.demos : (staticFallback?.demos || []),
          teamMembers: Array.isArray(raw.teamMembers) ? raw.teamMembers : (staticFallback?.teamMembers || []),
        } as ServiceDocument;
      }
    } catch (err) {
      console.warn(`Firestore getPublishedServiceBySlug (${slug}) fallback:`, err);
    }
  }

  const s = staticFallback;
  if (!s) return null;

  return {
    id: s.id,
    name: s.title,
    slug: s.slug,
    tagline: s.tagline,
    shortDescription: s.shortDescription,
    description: s.fullDescription,
    category: s.title,
    capabilities: s.capabilities,
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
    pricingNote: s.pricingNote,
    demos: s.demos || [],
    teamMembers: s.teamMembers || [],
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
      if (await isCollectionInitialized("packages")) {
        return [];
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
    badge: "CREATIVE & TECH STUDIO",
    headline: "We Build Ideas Into Digital Experiences.",
    highlightedText: "Digital Experiences.",
    subheadline:
      "Creative solutions, smart technology, and professional services to help businesses grow.",
    primaryCtaText: "Explore Our Services",
    primaryCtaLink: "/services",
    secondaryCtaText: "View Our Work",
    secondaryCtaLink: "/projects",
    announcement: "Now building: Video Media, Web Apps & D2C Systems",
    heroImage: "/imdad-logo.png",
    heroImageAlt: "IMDAD.BUILDS Creative & Tech Studio",
    backgroundImage: "",
    backgroundImageOpacity: 20,
    viewportHeader: "STUDIO VIEWPORT // INTERACTIVE SHOWCASE",
    viewportBadge: "LIQUID GLASS UI",
    prototypeApps: [
      {
        id: "wishmusic",
        tabLabel: "WishMusic",
        name: "WishMusic Player",
        tagline: "Tactile audio architecture • iOS, Android, Web",
        logo: "",
        badge: "AUDIOENGINE PROTOTYPE v0.8.2",
        statusLabel: "In Development",
        statusVariant: "amber",
        previewTitle: "Midnight Resonance — Chapter IV",
        previewSubtitle: "Sample Track • Simulated Waveform Scrubber",
        inspectLink: "/apps/wishmusic",
        inspectLabel: "Inspect App",
        type: "audio",
      },
      {
        id: "wishtracking",
        tabLabel: "WishTrack",
        name: "WishTracking",
        tagline: "Compound milestone tracker • Zero noise",
        logo: "",
        badge: "MOMENTUM ENGINE PROTOTYPE",
        statusLabel: "Coming Soon",
        statusVariant: "purple",
        previewTitle: "Day 42 — Simulated Streak Metric",
        previewSubtitle: "Consistency Model • Compound Curve",
        inspectLink: "/apps/wishtracking",
        inspectLabel: "Join Waitlist",
        type: "tracker",
      },
      {
        id: "easyxo",
        tabLabel: "EasyXo",
        name: "EasyXo Brand Platform",
        tagline: "Founder-operated e-commerce venture",
        logo: "",
        badge: "EASYXO D2C ENGINE",
        statusLabel: "Live Brand",
        statusVariant: "emerald",
        previewTitle: "easyxo.in",
        previewSubtitle: "Direct-to-Consumer Storefront",
        inspectLink: "/apps/easyxo",
        inspectLabel: "Case Study",
        type: "store",
      },
    ],
  },
  navigation: {
    logo: "/imdad-logo.png",
    brandName: "IMDAD.BUILDS",
    badgeText: "CREATIVE & TECH STUDIO",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Our Work", href: "/projects" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    ctaText: "Get Started",
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
    eyebrow: "COLLABORATE WITH IMDAD.BUILDS // OPEN FOR PROJECTS",
    headline: "Have an Idea? Let’s Make It Happen.",
    description:
      "Creative solutions, smart technology, and professional services to help businesses grow. Let's discuss your project goals and build something exceptional together.",
    primaryCtaText: "Start a Project",
    primaryCtaLink: "/contact",
    secondaryCtaText: "Order Video Editing",
    secondaryCtaLink: "/services/video-editing",
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
      "services",
      "projects",
      "overview",
      "process",
      "why-us",
      "team",
      "final-cta",
    ],
    sectionVisibility: {
      hero: true,
      overview: true,
      services: true,
      projects: true,
      "why-us": true,
      team: true,
      process: true,
      "final-cta": true,
      packages: false,
      apps: false,
      about: false,
      reviews: false,
      "ai-assistant": false,
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

export const defaultHeroQuickStart: HeroQuickStartItem[] = [
  {
    id: "qs-video",
    title: "Video Editing",
    subtitle: "Reels, YouTube & ads",
    href: "/services/video-editing",
    badge: "From ₹499",
    iconName: "Video",
  },
  {
    id: "qs-amazon",
    title: "Amazon Listings",
    subtitle: "Images & A+ Content",
    href: "/services/amazon-listing",
    badge: "Popular",
    iconName: "ShoppingBag",
  },
  {
    id: "qs-websites",
    title: "Websites & Stores",
    subtitle: "Business sites & Next.js",
    href: "/services/website-development",
    badge: "Custom",
    iconName: "Globe",
  },
  {
    id: "qs-apps",
    title: "Apps & AI Tools",
    subtitle: "Mobile apps & utilities",
    href: "/services/app-development",
    badge: "Studio",
    iconName: "Smartphone",
  },
];

export const defaultHeroTrustHighlights: HeroTrustHighlight[] = [
  { id: "th-1", label: "Fast Delivery", value: "24–48h Turnaround", iconName: "Zap" },
  { id: "th-2", label: "Direct Access", value: "Talk to Builders Directly", iconName: "MessageSquare" },
  { id: "th-3", label: "Transparent Pricing", value: "Clear Scope & Revisions", iconName: "ShieldCheck" },
];

export const defaultOverviewSection: NonNullable<SiteContentDocument["overviewSection"]> = {
  eyebrow: "ABOUT US",
  headline: "Built for Businesses, Not Generic Agency Fluff",
  subheadline:
    "Whether you need scroll-stopping product images, a clean company website, or high-retention reels, we focus on clarity, speed, and practical business results.",
  pillars: [
    {
      id: "ov-1",
      number: "01",
      title: "Clear, Honest Communication",
      description: "You work directly with the builder and creative team — no confusing agency layers or hidden fees.",
      iconName: "Compass",
    },
    {
      id: "ov-2",
      number: "02",
      title: "Built to Sell & Convert",
      description: "Every page layout, Amazon graphic, and reel is structured to guide real visitors to take action.",
      iconName: "Target",
    },
    {
      id: "ov-3",
      number: "03",
      title: "Everything Under One Roof",
      description: "Design, video editing, e-commerce catalogs, websites, and custom apps working seamlessly together.",
      iconName: "Layers",
    },
  ] as OverviewPillarConfig[],
};

export const defaultProcessSection: NonNullable<SiteContentDocument["processSection"]> = {
  eyebrow: "HOW WE WORK",
  headline: "Simple 4-Step Delivery Process",
  subheadline: "From first message to final files, everything stays structured and transparent.",
  ctaText: "Start Your Project",
  ctaLink: "/contact",
  steps: [
    {
      id: "proc-1",
      step: "01",
      title: "Share Your Goal",
      description: "Tell us what you need — a website, video package, Amazon deck, or app idea.",
      badge: "Step 01",
    },
    {
      id: "proc-2",
      step: "02",
      title: "Plan & Outline",
      description: "We confirm timeline, deliverables, and transparent fixed pricing upfront.",
      badge: "Step 02",
    },
    {
      id: "proc-3",
      step: "03",
      title: "Craft & Preview",
      description: "We design, build, or edit in focused iterations and share clean previews for feedback.",
      badge: "Step 03",
    },
    {
      id: "proc-4",
      step: "04",
      title: "Launch & Handover",
      description: "Final production assets, live deployment, and post-launch support ready to scale.",
      badge: "Step 04",
    },
  ] as ProcessStepConfig[],
};

export const defaultWhyUsSection: NonNullable<SiteContentDocument["whyUsSection"]> = {
  eyebrow: "WHY IMDAD.BUILDS",
  headline: "Practical Execution Over Agency Hype",
  subheadline: "Real digital operators building creative media, stores, and software we actively use ourselves.",
  items: [
    {
      id: "why-1",
      title: "Conversion-First Thinking",
      description: "Every design answers buyer questions and guides visitors cleanly toward ordering or booking.",
      metric: "Buyer Focused",
      iconName: "Target",
    },
    {
      id: "why-2",
      title: "Direct Collaboration",
      description: "Talk straight with Imdad and our specialized editors without middlemen slowing progress.",
      metric: "Zero Bureaucracy",
      iconName: "Users",
    },
    {
      id: "why-3",
      title: "Modern Full-Stack Craft",
      description: "We blend clean web engineering, AI workflows, and high-retention editing under one studio.",
      metric: "End-to-End",
      iconName: "Sparkles",
    },
    {
      id: "why-4",
      title: "Fair & Clear Pricing",
      description: "Clear package scopes and milestones so you always know what you get before paying.",
      metric: "Transparent",
      iconName: "ShieldCheck",
    },
  ] as WhyUsItemConfig[],
};

export const defaultTeamSection: NonNullable<SiteContentDocument["teamSection"]> = {
  eyebrow: "STUDIO TEAM",
  headline: "Meet the People Behind the Work",
  subheadline: "A small, hands-on team focused on engineering quality and conversion-driven creative craft.",
  members: studioTeam.map((m): TeamMemberConfig => ({
    id: m.id,
    name: m.name,
    role: m.role,
    title: m.title,
    badge: m.badge,
    bio: m.bio,
    avatarUrl: m.avatarUrl,
    initials: m.initials,
    specialties: m.specialties,
    enabled: true,
  })),
};

export const defaultThemeSettings: SiteThemeSettings = {
  presetId: "warm-cream",
  backgroundColor: "#FAF7F2",
  surfaceColor: "#FFFFFF",
  sandColor: "#F3ECE4",
  peachColor: "#FAECE4",
  accentColor: "#C96A50",
  accentHoverColor: "#B4583F",
  headingColor: "#332924",
  bodyColor: "#5F534D",
  borderColor: "#E8DFD5",
  headingFont: "plus-jakarta",
  bodyFont: "dm-sans",
};

export const defaultFooterColumns: FooterColumnConfig[] = [
  {
    id: "col-services",
    title: "Services",
    links: (navItems.find((n) => n.label === "Services")?.subItems || []).map((s) => ({
      label: s.label,
      href: s.href,
    })),
  },
  {
    id: "col-studio",
    title: "Studio",
    links: companyNavItems,
  },
  {
    id: "col-legal",
    title: "Policies",
    links: legalNavItems,
  },
];

function asRecord(val: unknown): Record<string, unknown> {
  return val && typeof val === "object" && !Array.isArray(val) ? (val as Record<string, unknown>) : {};
}

function mergeSiteContent(raw: Record<string, unknown>, targetId: "main" | "draft" = "main"): SiteContentDocument {
  const rawHero = asRecord(raw.hero);
  const rawNav = asRecord(raw.navigation);
  const rawServicesSec = asRecord(raw.servicesSection);
  const rawProjectsSec = asRecord(raw.projectsSection);
  const rawAppsSec = asRecord(raw.appsSection);
  const rawAbout = asRecord(raw.about);
  const rawFinalCta = asRecord(raw.finalCta);
  const rawContact = asRecord(raw.contact);
  const rawSocial = asRecord(raw.socialLinks);
  const rawFooter = asRecord(raw.footer);
  const rawMetadata = asRecord(raw.metadata);
  const rawOverview = asRecord(raw.overviewSection);
  const rawProcess = asRecord(raw.processSection);
  const rawWhyUs = asRecord(raw.whyUsSection);
  const rawTeam = asRecord(raw.teamSection);
  const rawTheme = asRecord(raw.themeSettings);

  const defaultServicesDropdown = (navItems.find((n) => n.label === "Services")?.subItems || []).map((s) => ({
    ...s,
    enabled: true,
  }));

  const isLayoutV2 = rawMetadata.layoutVersion === 2;

  return {
    id: targetId,
    hero: {
      ...defaultSiteContent.hero,
      ...(isLayoutV2 ? (rawHero as Partial<SiteContentDocument["hero"]>) : {}),
      prototypeApps: (rawHero.prototypeApps as SiteContentDocument["hero"]["prototypeApps"]) || defaultSiteContent.hero.prototypeApps,
      quickStartTitle:
        (isLayoutV2 ? (rawHero.quickStartTitle as string) : undefined) || "Quick Start",
      quickStartSubtitle:
        (isLayoutV2 ? (rawHero.quickStartSubtitle as string) : undefined) ||
        "Pick what you need to begin",
      quickStartItems:
        (isLayoutV2 ? (rawHero.quickStartItems as HeroQuickStartItem[]) : undefined) ||
        defaultHeroQuickStart,
      trustHighlights:
        (isLayoutV2 ? (rawHero.trustHighlights as HeroTrustHighlight[]) : undefined) ||
        defaultHeroTrustHighlights,
    },
    navigation: {
      ...defaultSiteContent.navigation,
      ...(isLayoutV2 ? (rawNav as Partial<NonNullable<SiteContentDocument["navigation"]>>) : {}),
      servicesDropdown:
        (isLayoutV2
          ? (rawNav.servicesDropdown as NonNullable<SiteContentDocument["navigation"]>["servicesDropdown"])
          : undefined) || defaultServicesDropdown,
    },
    appsSection: {
      ...defaultSiteContent.appsSection,
      ...(rawAppsSec as Partial<NonNullable<SiteContentDocument["appsSection"]>>),
    },
    servicesSection: {
      ...defaultSiteContent.servicesSection,
      ...(isLayoutV2 ? (rawServicesSec as Partial<NonNullable<SiteContentDocument["servicesSection"]>>) : {}),
      columns: ((isLayoutV2 ? (rawServicesSec.columns as 2 | 3 | 4) : undefined) || 3),
    },
    projectsSection: {
      ...defaultSiteContent.projectsSection,
      ...(isLayoutV2 ? (rawProjectsSec as Partial<NonNullable<SiteContentDocument["projectsSection"]>>) : {}),
      columns: ((isLayoutV2 ? (rawProjectsSec.columns as 2 | 3) : undefined) || 3),
    },
    overviewSection: {
      ...defaultOverviewSection,
      ...(isLayoutV2 ? (rawOverview as Partial<typeof defaultOverviewSection>) : {}),
      pillars:
        (isLayoutV2 ? (rawOverview.pillars as OverviewPillarConfig[]) : undefined) ||
        defaultOverviewSection.pillars,
    },
    processSection: {
      ...defaultProcessSection,
      ...(isLayoutV2 ? (rawProcess as Partial<typeof defaultProcessSection>) : {}),
      steps:
        (isLayoutV2 ? (rawProcess.steps as ProcessStepConfig[]) : undefined) ||
        defaultProcessSection.steps,
    },
    whyUsSection: {
      ...defaultWhyUsSection,
      ...(isLayoutV2 ? (rawWhyUs as Partial<typeof defaultWhyUsSection>) : {}),
      items:
        (isLayoutV2 ? (rawWhyUs.items as WhyUsItemConfig[]) : undefined) ||
        defaultWhyUsSection.items,
    },
    teamSection: {
      ...defaultTeamSection,
      ...(isLayoutV2 ? (rawTeam as Partial<typeof defaultTeamSection>) : {}),
      members:
        (isLayoutV2 ? (rawTeam.members as TeamMemberConfig[]) : undefined) ||
        defaultTeamSection.members,
    },
    about: {
      ...defaultSiteContent.about,
      ...(rawAbout as Partial<SiteContentDocument["about"]>),
      pillars: (rawAbout.pillars as SiteContentDocument["about"]["pillars"]) || defaultSiteContent.about.pillars,
    },
    finalCta: {
      ...defaultSiteContent.finalCta,
      ...(isLayoutV2 ? (rawFinalCta as Partial<SiteContentDocument["finalCta"]>) : {}),
    },
    contact: {
      ...defaultSiteContent.contact,
      ...(rawContact as Partial<SiteContentDocument["contact"]>),
    },
    socialLinks: {
      ...defaultSiteContent.socialLinks,
      ...(rawSocial as Partial<SiteContentDocument["socialLinks"]>),
    },
    footer: {
      ...defaultSiteContent.footer,
      ...(isLayoutV2 ? (rawFooter as Partial<SiteContentDocument["footer"]>) : {}),
      studioBadge:
        (isLayoutV2 ? (rawFooter.studioBadge as string) : undefined) ||
        "Product Studio & Digital Services",
      columns:
        (isLayoutV2 ? (rawFooter.columns as FooterColumnConfig[]) : undefined) ||
        defaultFooterColumns,
      bottomLinks:
        (isLayoutV2 ? (rawFooter.bottomLinks as Array<{ label: string; href: string }>) : undefined) ||
        legalNavItems,
    },
    customSections:
      isLayoutV2 && Array.isArray(raw.customSections)
        ? (raw.customSections as CustomSectionConfig[])
        : [],
    themeSettings: {
      ...defaultThemeSettings,
      ...(isLayoutV2 ? (rawTheme as Partial<SiteThemeSettings>) : {}),
    },
    metadata: {
      layoutVersion: 2,
      sectionOrder:
        isLayoutV2 && Array.isArray(rawMetadata.sectionOrder)
          ? (rawMetadata.sectionOrder as string[])
          : defaultSiteContent.metadata?.sectionOrder,
      sectionVisibility: {
        ...defaultSiteContent.metadata?.sectionVisibility,
        ...(isLayoutV2 ? (asRecord(rawMetadata.sectionVisibility) as Record<string, boolean>) : {}),
      },
      skills: (rawMetadata.skills as Array<{ category: string; items: string[] }>) || defaultSiteContent.metadata?.skills,
      seo: {
        ...defaultSiteContent.metadata?.seo,
        ...asRecord(rawMetadata.seo),
      },
    },
    published: typeof raw.published === "boolean" ? raw.published : targetId === "main",
    publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : undefined,
    publishedBy: typeof raw.publishedBy === "string" ? raw.publishedBy : undefined,
    draftModifiedAt: typeof raw.draftModifiedAt === "string" ? raw.draftModifiedAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
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
          return mergeSiteContent(draftSnap.data() as Record<string, unknown>, "draft");
        }
      }

      const mainRef = doc(db, "siteContent", "main");
      const snap = await getDoc(mainRef);
      if (snap.exists()) {
        return mergeSiteContent(snap.data() as Record<string, unknown>, "main");
      }
    } catch (err) {
      console.warn("Firestore getSiteContent fallback:", err);
    }
  }

  return mergeSiteContent(defaultSiteContent as unknown as Record<string, unknown>, "main");
}

export async function getSettings(): Promise<SettingsDocument> {
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "settings", "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: "global", published: true, ...snap.data() } as SettingsDocument;
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
    instagramUrl: siteConfig.contact.instagramUrl,
    liveUrl: "https://imdadbuild.space",
    maintenanceMode: false,
    allowPublicReviews: true,
    published: true,
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
    cleanUndefined({
      ...app,
      updatedAt: now,
      createdAt: app.createdAt || now,
    }),
    { merge: true }
  );
}

export async function deleteAppAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "apps", id));
  await markCollectionInitializedAdmin("apps").catch(() => {});
}

export async function getAllProjectsAdmin(): Promise<ProjectDocument[]> {
  if (!db) return [];
  const q = query(collection(db, "projects"), orderBy("sortOrder", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectDocument));
}

function isSpecialFirestoreValue(val: unknown): boolean {
  if (val === null || typeof val !== "object") return false;
  if (val instanceof Date) return true;
  const candidate = val as { toDate?: unknown; toMillis?: unknown; _methodName?: unknown };
  // Firestore Timestamp (duck-typed)
  if (typeof candidate.toDate === "function" && typeof candidate.toMillis === "function") return true;
  // Firestore FieldValue sentinel (serverTimestamp, deleteField, etc.)
  if (candidate._methodName !== undefined) return true;
  return false;
}

export function cleanUndefined<T extends object>(obj: T): Partial<T> {
  if (obj === null || typeof obj !== "object" || isSpecialFirestoreValue(obj)) {
    return obj;
  }
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        cleaned[k] = v
          .filter((item) => item !== undefined)
          .map((item) =>
            typeof item === "object" && item !== null && !isSpecialFirestoreValue(item)
              ? cleanUndefined(item as Record<string, unknown>)
              : item
          );
      } else if (typeof v === "object" && v !== null && !isSpecialFirestoreValue(v)) {
        cleaned[k] = cleanUndefined(v as Record<string, unknown>);
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
  await markCollectionInitializedAdmin("projects").catch(() => {});
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
    cleanUndefined({
      ...service,
      updatedAt: now,
      createdAt: service.createdAt || now,
    }),
    { merge: true }
  );
}

export async function deleteServiceAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "services", id));
  await markCollectionInitializedAdmin("services").catch(() => {});
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
    cleanUndefined({
      ...pkg,
      updatedAt: now,
      createdAt: pkg.createdAt || now,
    }),
    { merge: true }
  );
}

export async function deletePackageAdmin(id: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "websitePackages", id));
  await markCollectionInitializedAdmin("packages").catch(() => {});
}

export async function saveSiteContentAdmin(content: Partial<SiteContentDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "siteContent", "main");
  const now = new Date().toISOString();
  const payload = cleanUndefined({
    ...content,
    id: "main",
    updatedAt: now,
  });
  await setDoc(docRef, payload, { merge: true });
}

export async function saveSiteContentDraft(content: Partial<SiteContentDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "siteContent", "draft");
  const now = new Date().toISOString();
  const payload = cleanUndefined({
    ...content,
    metadata: {
      ...(content.metadata || {}),
      layoutVersion: 2,
    },
    id: "draft",
    published: typeof content.published === "boolean" ? content.published : false,
    draftModifiedAt: now,
    updatedAt: now,
  });
  await setDoc(docRef, payload, { merge: true });
}

export async function publishSiteContent(
  content: Partial<SiteContentDocument>,
  publisherEmail?: string
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const now = new Date().toISOString();
  const payload = cleanUndefined({
    ...content,
    metadata: {
      ...(content.metadata || {}),
      layoutVersion: 2,
    },
    id: "main",
    published: true,
    publishedAt: now,
    publishedBy: publisherEmail || "admin",
    updatedAt: now,
  });

  // Promote to public main document
  await setDoc(doc(db, "siteContent", "main"), payload, { merge: true });

  // Keep draft in sync
  await setDoc(doc(db, "siteContent", "draft"), cleanUndefined({ ...payload, id: "draft" }), { merge: true });
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
    cleanUndefined({
      ...asset,
      publicId: asset.publicId || extractCloudinaryPublicId(asset.url),
      updatedAt: now,
      createdAt: asset.createdAt || now,
    }),
    { merge: true }
  );
}

export async function checkAssetUsage(url: string): Promise<{ inUse: boolean; locations: string[] }> {
  const locations: string[] = [];
  if (!db || !url) return { inUse: false, locations };

  try {
    // 1. Check site content (published main and draft)
    const siteSnap = await getDoc(doc(db, "siteContent", "main"));
    if (siteSnap.exists()) {
      const siteStr = JSON.stringify(siteSnap.data());
      if (siteStr.includes(url)) {
        locations.push("Published Homepage");
      }
    }

    const draftSnap = await getDoc(doc(db, "siteContent", "draft"));
    if (draftSnap.exists()) {
      const draftStr = JSON.stringify(draftSnap.data());
      if (draftStr.includes(url)) {
        locations.push("Draft Homepage Content");
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

    // 4. Check appVisualContent
    try {
      const visualSnap = await getDocs(collection(db, "appVisualContent"));
      visualSnap.docs.forEach((d) => {
        const data = d.data();
        if (JSON.stringify(data).includes(url)) {
          locations.push(`Visual Content: ${d.id}`);
        }
      });
    } catch {
      // safe fallback if not present
    }

    // 5. Check amazonPortfolio
    try {
      const amazonSnap = await getDocs(collection(db, "amazonPortfolio"));
      amazonSnap.docs.forEach((d) => {
        const data = d.data();
        if (JSON.stringify(data).includes(url)) {
          locations.push(`Amazon Portfolio: ${data.title || d.id}`);
        }
      });
    } catch {
      // safe fallback if not present
    }
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
  url?: string,
  options?: { force?: boolean }
): Promise<{ success: boolean; error?: string; warning?: string }> {
  if (!db) throw new Error("Firestore is not initialized");

  if (url && !options?.force) {
    const usage = await checkAssetUsage(url);
    if (usage.inUse) {
      return {
        success: false,
        error: `Still used in ${usage.locations.join(", ")}. Remove it there first or use Force Delete.`,
      };
    }
  }

  let warning: string | undefined;
  const existing = await getDoc(doc(db, "mediaAssets", id));
  const resolvedUrl = url || (existing.exists() ? String(existing.data().url || "") : "");
  const publicId = existing.exists()
    ? (existing.data().publicId as string | undefined) || extractCloudinaryPublicId(resolvedUrl)
    : extractCloudinaryPublicId(resolvedUrl);

  if (publicId && publicId.startsWith("studio-assets/")) {
    const { auth } = await import("@/lib/firebase");
    const idToken = await auth?.currentUser?.getIdToken();
    if (idToken) {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          publicId,
          resourceType: /\/video\/upload\//.test(resolvedUrl) ? "video" : "image",
        }),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !result?.success) {
        if (response.status === 503 || response.status === 404) {
          warning = result?.error || "Removed from library metadata (CDN storage not configured locally).";
        } else {
          return {
            success: false,
            error: result?.error || "CDN deletion failed; media metadata was kept.",
          };
        }
      }
    }
  } else if (resolvedUrl.includes("cloudinary.com")) {
    warning = "Legacy Cloudinary asset removed from studio library index.";
  }

  await deleteDoc(doc(db, "mediaAssets", id));
  return { success: true, warning };
}

function extractCloudinaryPublicId(url?: string): string | undefined {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  const match = url.match(/\/(?:image|video)\/upload(?:\/[^/]+)*\/(studio-assets\/[^?#]+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
  return match?.[1];
}

export async function saveSettingsAdmin(settings: Partial<SettingsDocument>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "settings", "global");
  await setDoc(
    docRef,
    cleanUndefined({
      ...settings,
      id: "global",
      published: typeof settings.published === "boolean" ? settings.published : true,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

export async function markCollectionInitializedAdmin(
  collectionKey: "apps" | "projects" | "services" | "packages"
): Promise<void> {
  if (!db) return;
  const current = await getDoc(doc(db, "settings", "global")).catch(() => null);
  const existingInit = (current?.exists() ? current.data().initializedCollections : {}) || {};
  await setDoc(
    doc(db, "settings", "global"),
    cleanUndefined({
      id: "global",
      published: true,
      initializedCollections: {
        ...existingInit,
        [collectionKey]: true,
      },
      updatedAt: new Date().toISOString(),
    }),
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
