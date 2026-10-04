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
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { appsData, App, getAppBySlug } from "@/data/apps";
import { projectsData, Project } from "@/data/projectsData";
import { studioServices, StudioService } from "@/data/servicesData";
import { allServices, ServiceItem } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  SiteContentDocument,
  SettingsDocument,
} from "@/types/cms";

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
          .map((d) => ({ id: d.id, ...d.data() } as ProjectDocument))
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
        return { id: d.id, ...d.data() } as ProjectDocument;
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
        return { id: d.id, ...d.data() } as ServiceDocument;
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
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "websitePackages"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as WebsitePackageDocument))
          .filter((d) => d.active !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    } catch (err) {
      console.warn("Firestore getPublishedPackages fallback:", err);
    }
  }

  const websiteServices = allServices.filter(
    (s) => s.category === "websites" || s.category === "ecommerce"
  );

  return websiteServices.map((item, idx) => ({
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
    sortOrder: idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  }));
}

export async function getSiteContent(): Promise<SiteContentDocument> {
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "siteContent", "main");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: "main", ...snap.data() } as SiteContentDocument;
      }
    } catch (err) {
      console.warn("Firestore getSiteContent fallback:", err);
    }
  }

  return {
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
      description:
        "From early conceptual wireframes to high-conversion stores and consumer apps, let's build something enduring together.",
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
    published: true,
    updatedAt: new Date().toISOString(),
  };
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

export async function saveProjectAdmin(
  project: Partial<ProjectDocument> & { id: string }
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, "projects", project.id);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      ...project,
      updatedAt: now,
      createdAt: project.createdAt || now,
    },
    { merge: true }
  );
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
