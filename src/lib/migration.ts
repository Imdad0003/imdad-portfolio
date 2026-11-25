import { doc, setDoc, getDocs, collection, query, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { appsData } from "@/data/apps";
import { projectsData } from "@/data/projectsData";
import { studioServices } from "@/data/servicesData";
import { allServices, corePackages } from "@/data/pricing";
import { siteConfig } from "@/data/config";
import {
  cleanUndefined,
  defaultFooterColumns,
  defaultHeroQuickStart,
  defaultHeroTrustHighlights,
  defaultOverviewSection,
  defaultProcessSection,
  defaultSiteContent,
  defaultTeamSection,
  defaultThemeSettings,
  defaultWhyUsSection,
} from "@/lib/cms";
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
      await setDoc(docRef, cleanUndefined(appDoc as unknown as Record<string, unknown>), { merge: true });
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
      await setDoc(docRef, cleanUndefined(projectDoc as unknown as Record<string, unknown>), { merge: true });
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
      await setDoc(docRef, cleanUndefined(serviceDoc as unknown as Record<string, unknown>), { merge: true });
      result.servicesCount++;
    }
  }

  // 4. Migrate Website Packages
  const packagesSnap = await getDocs(query(collection(db, "websitePackages"), limit(1)));
  if (force || packagesSnap.empty) {
    const corePkgsDocs: WebsitePackageDocument[] = corePackages.map((pkg, idx) => ({
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
      active: true,
      ctaText: `Book ${pkg.name}`,
      sortOrder: idx,
      createdAt: now,
      updatedAt: now,
      published: true,
    }));

    for (const pkgDoc of corePkgsDocs) {
      const docRef = doc(db, "websitePackages", pkgDoc.id);
      await setDoc(docRef, cleanUndefined(pkgDoc as unknown as Record<string, unknown>), { merge: true });
      result.packagesCount++;
    }

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
        sortOrder: corePkgsDocs.length + i,
        createdAt: now,
        updatedAt: now,
        published: true,
      };
      await setDoc(docRef, cleanUndefined(pkgDoc as unknown as Record<string, unknown>), { merge: true });
      result.packagesCount++;
    }
  }

  // 5. Migrate Site Content using current live homepage structure & soft-light defaults
  const siteContentDoc: SiteContentDocument = {
    ...defaultSiteContent,
    id: "main",
    hero: {
      ...defaultSiteContent.hero,
      quickStartTitle: "Quick Start",
      quickStartSubtitle: "Pick what you need to begin",
      quickStartItems: defaultHeroQuickStart,
      trustHighlights: defaultHeroTrustHighlights,
    },
    overviewSection: defaultOverviewSection,
    processSection: defaultProcessSection,
    whyUsSection: defaultWhyUsSection,
    teamSection: defaultTeamSection,
    footer: {
      ...defaultSiteContent.footer,
      studioBadge: "Product Studio & Digital Services",
      columns: defaultFooterColumns,
    },
    customSections: [],
    themeSettings: defaultThemeSettings,
    metadata: {
      ...(defaultSiteContent.metadata || {}),
      layoutVersion: 2,
    },
    published: true,
    updatedAt: now,
  };
  await setDoc(doc(db, "siteContent", "main"), cleanUndefined(siteContentDoc as unknown as Record<string, unknown>), { merge: true });
  await setDoc(doc(db, "siteContent", "draft"), cleanUndefined({ ...siteContentDoc, id: "draft" } as unknown as Record<string, unknown>), { merge: true });
  result.siteContentMigrated = true;

  // 6. Migrate Settings (always include published: true for Firestore rules)
  const settingsDoc: SettingsDocument = {
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
    initializedCollections: {
      apps: true,
      projects: true,
      services: true,
      packages: true,
    },
    published: true,
    updatedAt: now,
  };
  await setDoc(doc(db, "settings", "global"), cleanUndefined(settingsDoc as unknown as Record<string, unknown>), { merge: true });
  result.settingsMigrated = true;

  result.message = `Successfully migrated ${result.appsCount} apps, ${result.projectsCount} projects, ${result.servicesCount} services, ${result.packagesCount} packages, site content, and settings.`;

  return result;
}
