import { doc, setDoc, getDocs, collection, query, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { appsData } from "@/data/apps";
import { projectsData } from "@/data/projectsData";
import { studioServices } from "@/data/servicesData";
import { allServices } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  SiteContentDocument,
  SettingsDocument,
} from "@/types/cms";

export interface MigrationResult {
  success: boolean;
  appsCount: number;
  projectsCount: number;
  servicesCount: number;
  packagesCount: number;
  siteContentMigrated: boolean;
  settingsMigrated: boolean;
  message: string;
}

export async function migrateInitialDataToFirestore(force = false): Promise<MigrationResult> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase / Firestore is not configured or initialized.");
  }

  const result: MigrationResult = {
    success: true,
    appsCount: 0,
    projectsCount: 0,
    servicesCount: 0,
    packagesCount: 0,
    siteContentMigrated: false,
    settingsMigrated: false,
    message: "",
  };

  const now = new Date().toISOString();

  // 1. Migrate Apps
  const appsSnap = await getDocs(query(collection(db, "apps"), limit(1)));
  if (force || appsSnap.empty) {
    for (let i = 0; i < appsData.length; i++) {
      const app = appsData[i];
      const docRef = doc(db, "apps", app.id);
      const appDoc: AppDocument = {
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
        url: app.links.liveUrl || "",
        waitlistUrl: app.links.waitlistUrl || "",
        featured: app.featured,
        sortOrder: i,
        category: app.category,
        accentColor: app.accentColor,
        version: app.version || "",
        releaseDate: app.releaseDate || "",
        createdAt: now,
        updatedAt: now,
        published: true,
      };
      await setDoc(docRef, appDoc, { merge: true });
      result.appsCount++;
    }
  }

  // 2. Migrate Projects
  const projectsSnap = await getDocs(query(collection(db, "projects"), limit(1)));
  if (force || projectsSnap.empty) {
    for (let i = 0; i < projectsData.length; i++) {
      const p = projectsData[i];
      const docRef = doc(db, "projects", p.id);
      const projectDoc: ProjectDocument = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.tagline,
        description: p.description,
        category: p.category,
        technologies: p.tools,
        scope: p.scope,
        deliverables: p.deliverables,
        metrics: p.metrics || [],
        url: p.url || "",
        featured: p.featured,
        sortOrder: i,
        highlight: p.highlight || "",
        accentColor: p.accentColor,
        status: p.status,
        createdAt: now,
        updatedAt: now,
        published: true,
      };
      await setDoc(docRef, projectDoc, { merge: true });
      result.projectsCount++;
    }
  }

  // 3. Migrate Services
  const servicesSnap = await getDocs(query(collection(db, "services"), limit(1)));
  if (force || servicesSnap.empty) {
    for (let i = 0; i < studioServices.length; i++) {
      const s = studioServices[i];
      const docRef = doc(db, "services", s.id);
      const serviceDoc: ServiceDocument = {
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
        iconName: s.iconName,
        accentColor: s.accentColor,
        createdAt: now,
        updatedAt: now,
        published: true,
      };
      await setDoc(docRef, serviceDoc, { merge: true });
      result.servicesCount++;
    }
  }

  // 4. Migrate Website Packages
  const packagesSnap = await getDocs(query(collection(db, "websitePackages"), limit(1)));
  if (force || packagesSnap.empty) {
    const relevantServices = allServices.filter(
      (s) => s.category === "websites" || s.category === "ecommerce"
    );
    for (let i = 0; i < relevantServices.length; i++) {
      const item = relevantServices[i];
      const docRef = doc(db, "websitePackages", item.id);
      const pkgDoc: WebsitePackageDocument = {
        id: item.id,
        name: item.name,
        websiteType: item.categoryLabel,
        description: item.description,
        features: item.deliverables,
        price: item.price,
        priceType: item.priceType,
        priceMax: item.priceMax,
        unit: item.unit,
        badge: item.badge || null,
        recommended: item.recommended || false,
        active: true,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
        published: true,
      };
      await setDoc(docRef, pkgDoc, { merge: true });
      result.packagesCount++;
    }
  }

  // 5. Migrate Site Content
  const siteContentDoc: SiteContentDocument = {
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
    updatedAt: now,
  };
  await setDoc(doc(db, "siteContent", "main"), siteContentDoc, { merge: true });
  result.siteContentMigrated = true;

  // 6. Migrate Settings
  const settingsDoc: SettingsDocument = {
    id: "global",
    studioName: siteConfig.name,
    tagline: siteConfig.tagline,
    contactEmail: siteConfig.contact.email,
    whatsappNumber: siteConfig.contact.whatsappNumber,
    instagramHandle: siteConfig.contact.instagramHandle,
    liveUrl: "https://imdadbuild.space",
    maintenanceMode: false,
    allowPublicReviews: true,
    updatedAt: now,
  };
  await setDoc(doc(db, "settings", "global"), settingsDoc, { merge: true });
  result.settingsMigrated = true;

  result.message = `Successfully migrated ${result.appsCount} apps, ${result.projectsCount} projects, ${result.servicesCount} services, ${result.packagesCount} packages, site content, and settings.`;

  return result;
}
