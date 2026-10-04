import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { appsData } from "../src/data/apps";
import { projectsData } from "../src/data/projectsData";
import { studioServices } from "../src/data/servicesData";
import { allServices } from "../src/data/pricing";
import { siteConfig } from "../src/data/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function main() {
  console.log("Initializing Firebase for Project:", firebaseConfig.projectId);
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("Authenticating as imdad.builds@gmail.com...");
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD || "";
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required to run seed script");
  }
  const userCred = await signInWithEmailAndPassword(
    auth,
    process.env.ADMIN_EMAIL || "imdad.builds@gmail.com",
    adminPassword
  );
  console.log("✓ Authenticated Admin UID:", userCred.user.uid);

  const now = new Date().toISOString();

  // 1. Admin verification
  console.log("Admin verified via email check (imdad.builds@gmail.com)...");

  // 2. Seed Apps
  console.log("Seeding apps...");
  for (let i = 0; i < appsData.length; i++) {
    const a = appsData[i];
    await setDoc(doc(db, "apps", a.id), {
      id: a.id,
      name: a.name,
      slug: a.slug,
      tagline: a.tagline,
      description: a.description,
      fullDescription: a.fullDescription,
      platform: a.platform,
      status: a.status === "live" ? "LIVE" : a.status === "in-development" ? "IN_DEVELOPMENT" : "COMING_SOON",
      statusLabel: a.statusLabel,
      published: true,
      isNew: a.isNew,
      featured: a.featured,
      category: a.category,
      accentColor: a.accentColor,
      version: a.version || "",
      releaseDate: a.releaseDate || "",
      features: a.features,
      techStack: a.techStack,
      links: a.links,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ App seeded: ${a.name} (${a.slug})`);
  }

  // 3. Seed Projects
  console.log("Seeding projects...");
  for (let i = 0; i < projectsData.length; i++) {
    const p = projectsData[i];
    await setDoc(doc(db, "projects", p.id), {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      published: true,
      scope: p.scope,
      tools: p.tools,
      status: p.status,
      featured: p.featured,
      highlight: p.highlight || "",
      url: p.url || "",
      accentColor: p.accentColor,
      metrics: p.metrics || [],
      deliverables: p.deliverables,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ Project seeded: ${p.name} (${p.slug})`);
  }

  // 4. Seed Services
  console.log("Seeding services...");
  for (let i = 0; i < studioServices.length; i++) {
    const s = studioServices[i];
    await setDoc(doc(db, "services", s.id), {
      id: s.id,
      number: s.number,
      title: s.title,
      slug: s.slug,
      tagline: s.tagline,
      shortDescription: s.shortDescription,
      fullDescription: s.fullDescription,
      iconName: s.iconName,
      accentColor: s.accentColor,
      capabilities: s.capabilities,
      deliverables: s.deliverables,
      suitableFor: s.suitableFor,
      process: s.process,
      subTypes: s.subTypes || [],
      packages: s.packages || [],
      hasRealPricing: s.hasRealPricing,
      pricingNote: s.pricingNote || "",
      faqs: s.faqs,
      published: true,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ Service seeded: ${s.title} (${s.slug})`);
  }

  // 5. Seed Website Packages
  console.log("Seeding website packages...");
  const relevantPackages = allServices.filter(
    (item) => item.category === "websites" || item.category === "ecommerce"
  );
  for (let i = 0; i < relevantPackages.length; i++) {
    const pkg = relevantPackages[i];
    await setDoc(doc(db, "websitePackages", pkg.id), {
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      priceType: pkg.priceType,
      unit: pkg.unit,
      description: pkg.description,
      features: pkg.deliverables,
      recommended: pkg.recommended || false,
      published: true,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  ✓ Seeded ${relevantPackages.length} website packages.`);

  // 6. Seed Site Content
  console.log("Seeding site content...");
  await setDoc(doc(db, "siteContent", "main"), {
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
  });
  console.log("✓ Site content seeded.");

  // 7. Seed Settings
  console.log("Seeding settings...");
  await setDoc(doc(db, "settings", "global"), {
    id: "global",
    studioName: siteConfig.name,
    tagline: siteConfig.tagline,
    contactEmail: siteConfig.contact.email,
    whatsappNumber: siteConfig.contact.whatsappNumber,
    instagramHandle: siteConfig.contact.instagramHandle,
    liveUrl: "https://imdadbuild.space",
    maintenanceMode: false,
    allowPublicReviews: true,
    published: true,
    updatedAt: now,
  });
  console.log("✓ Settings seeded.");

  console.log("\n==========================================");
  console.log("🎉 ALL FIRESTORE COLLECTIONS SEEDED SUCCESSFULLY!");
  console.log("==========================================");

  // Verification: Query published apps
  const snap = await getDocs(query(collection(db, "apps"), where("published", "==", true)));
  console.log(`Verified Firestore Query: ${snap.size} published apps retrieved.`);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
