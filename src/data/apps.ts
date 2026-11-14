export type AppStatus = "live" | "in-development" | "coming-soon";

export type AppPlatform = "iOS" | "Android" | "Web" | "Cross-Platform" | "macOS";

export interface AppFeature {
  title: string;
  description: string;
  iconName?: string;
}

export interface AppLinks {
  liveUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  githubUrl?: string;
  waitlistUrl?: string;
}

export interface App {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  tagline: string;
  description: string;
  fullDescription: string;
  platform: AppPlatform[];
  status: AppStatus;
  statusLabel: string;
  isNew: boolean;
  featured: boolean;
  category: string;
  accentColor: string;
  version?: string;
  releaseDate?: string;
  packageName?: string;
  supportEmail?: string;
  latestDownloadUrl?: string;
  latestVersionName?: string;
  latestVersionCode?: number;
  latestApkSize?: string;
  latestSha256?: string;
  features: AppFeature[];
  techStack: string[];
  links: AppLinks;
}

export const appsData: App[] = [
  {
    id: "wishmusic",
    name: "WishMusic",
    slug: "wishmusic",
    tagline: "Distraction-free, immersive music player & streaming interface.",
    description:
      "A fast, gesture-driven music playback experience designed with high-contrast album typography, intelligent queueing, and local/streaming playback.",
    fullDescription:
      "WishMusic was conceived out of frustration with bloated music streaming interfaces. Built by Imdad.builds, WishMusic strips away unnecessary noise and focuses on tactile audio controls, crystal-clear lossless playback, offline caching, and elegant fluid cover art motion. It serves as our in-house benchmark for media processing and low-latency mobile interactions.",
    platform: ["iOS", "Android", "Web"],
    status: "in-development",
    statusLabel: "In Development",
    isNew: true,
    featured: true,
    category: "Audio & Media",
    accentColor: "#935073",
    version: "v0.8.2 Alpha",
    releaseDate: "Q2 2026",
    packageName: "com.imdad.wishmusic",
    supportEmail: "wishmusic@imdadbuild.space",
    features: [
      {
        title: "Tactile Waveform Scrubbing",
        description: "Precise gesture scrubbing with micro-haptic feedback and frame-perfect audio seeking.",
      },
      {
        title: "Dynamic Palette Extraction",
        description: "Real-time background fluid glow extracted directly from album artwork colors.",
      },
      {
        title: "Zero-Latency Queue Architecture",
        description: "Instantaneous track switching and resilient offline local audio storage.",
      },
      {
        title: "Minimalist Focus Mode",
        description: "Full-screen distraction-free player optimized for reading, working, and driving.",
      },
    ],
    techStack: ["React Native", "TypeScript", "Expo AV", "Tailwind CSS", "Zustand"],
    links: {
      waitlistUrl: "/contact?subject=WishMusic%20Early%20Access",
    },
  },
  {
    id: "wishtracking",
    name: "WishTracking",
    slug: "wishtracking",
    tagline: "Compound milestone and habit tracker with zero social friction.",
    description:
      "A privacy-first personal momentum app built for creators, builders, and operators to log daily progress without ad tracking or algorithmic feeds.",
    fullDescription:
      "Most habit and tracker apps feel like social networks engineered for vanity. WishTracking is an anti-bloat tracking system developed in the Imdad.builds studio. It allows users to define custom compound goals, log metrics in two taps, visualize progress curves with clean mathematical charts, and maintain momentum without annoying notifications.",
    platform: ["iOS", "Android", "Web"],
    status: "coming-soon",
    statusLabel: "Coming Soon",
    isNew: true,
    featured: true,
    category: "Productivity & Utilities",
    accentColor: "#502D55",
    version: "v0.4.0 Preview",
    releaseDate: "Q3 2026",
    features: [
      {
        title: "Compound Momentum Curves",
        description: "Visualizes the exponential impact of consistency over 30, 90, and 365-day horizons.",
      },
      {
        title: "Two-Tap Metric Logging",
        description: "Frictionless widget and mobile entry for rapid logging throughout the day.",
      },
      {
        title: "Zero Cloud Lock-in",
        description: "Local-first storage with encrypted cloud backups and JSON export support.",
      },
      {
        title: "Milestone Visualizer",
        description: "Track physical, creative, and financial milestones with clear countdowns.",
      },
    ],
    techStack: ["Next.js", "React Native", "TypeScript", "SQLite / Firebase", "Tailwind"],
    links: {
      waitlistUrl: "/contact?subject=WishTracking%20Waitlist",
    },
  },
  {
    id: "easyxo",
    name: "EasyXo Platform",
    slug: "easyxo",
    tagline: "Direct-to-consumer brand engine & automated checkout portal.",
    description:
      "The full-stack digital commerce infrastructure powering the EasyXo brand, featuring instant UPI checkout, automated order workflows, and marketplace sync.",
    fullDescription:
      "EasyXo is a live e-commerce brand founded and operated end-to-end by Imdad. Its underlying digital platform was custom-engineered to solve real conversion hurdles: mobile-first product exploration, seamless Razorpay gateway webhooks, instant automated customer receipts, and seamless multi-channel catalog indexing across Amazon, Flipkart, and Meesho.",
    platform: ["Web", "Cross-Platform"],
    status: "live",
    statusLabel: "Live Brand",
    isNew: false,
    featured: true,
    category: "E-Commerce Platform",
    accentColor: "#d97746",
    version: "v2.4.0 Production",
    releaseDate: "Live Operation",
    features: [
      {
        title: "Instant Mobile Checkout",
        description: "Frictionless single-page checkout optimized for UPI, credit/debit cards, and NetBanking.",
      },
      {
        title: "Direct-Response Product Layouts",
        description: "Scannable benefit breakdowns, high-contrast imagery, and objection-clearing accordions.",
      },
      {
        title: "Multi-Channel Catalog Engine",
        description: "Synchronized SKU attributes, tax mapping, and inventory tracking across marketplaces.",
      },
      {
        title: "Automated Customer Touchpoints",
        description: "Instant order confirmations, invoice generation, and real-time courier tracking links.",
      },
    ],
    techStack: ["Next.js", "Razorpay Webhooks", "SmartBiz Engine", "Tailwind CSS", "SEO Meta"],
    links: {
      liveUrl: "https://easyxo.in",
    },
  },
];

export function getAllApps(): App[] {
  return appsData;
}

export function getFeaturedApps(): App[] {
  return appsData.filter((app) => app.featured);
}

export function getNewApps(): App[] {
  return appsData.filter((app) => app.isNew || app.status !== "live");
}

export function getAppBySlug(slug: string): App | undefined {
  return appsData.find((app) => app.slug.toLowerCase() === slug.toLowerCase());
}
