export type AppStatusValue = "LIVE" | "IN_DEVELOPMENT" | "COMING_SOON";

export interface AppFeatureItem {
  title: string;
  description: string;
  iconName?: string;
}

export interface AppDocument {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription: string;
  description: string;
  logo?: string;
  screenshots?: string[];
  platform: string[];
  status: AppStatusValue;
  isNew?: boolean;
  features: AppFeatureItem[];
  technologies: string[];
  url?: string;
  waitlistUrl?: string;
  featured: boolean;
  sortOrder: number;
  category: string;
  accentColor?: string;
  version?: string;
  releaseDate?: string;
  packageName?: string;
  latestReleaseId?: string;
  latestVersionName?: string;
  latestVersionCode?: number;
  latestReleaseDate?: string;
  latestApkSize?: string;
  latestDownloadUrl?: string;
  latestSha256?: string;
  approvedCertificateFingerprint?: string;
  supportEmail?: string;
  privacyPolicyUrl?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface ProjectMetricItem {
  label: string;
  value: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription: string;
  description: string;
  category: string;
  coverImage?: string;
  gallery?: string[];
  technologies: string[];
  scope: string[];
  deliverables: string[];
  metrics?: ProjectMetricItem[];
  url?: string;
  featured: boolean;
  sortOrder: number;
  highlight?: string;
  accentColor?: string;
  status: "Active Brand" | "Completed" | "Live Store" | "In Production";
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface ServiceTierItem {
  tierName: string;
  price: string;
  description: string;
  deliverables: string[];
  turnaround: string;
}

export interface ServiceProcessItem {
  step: string;
  title: string;
  description: string;
  deliverable: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceDocument {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  deliverables: string[];
  process: ServiceProcessItem[];
  pricing: ServiceTierItem[];
  faq: ServiceFaqItem[];
  featured: boolean;
  sortOrder: number;
  iconName?: string;
  accentColor?: string;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface WebsitePackageDocument {
  id: string;
  name: string;
  websiteType: string;
  description: string;
  features: string[];
  price: number;
  priceType: "starting" | "fixed" | "range";
  priceMax?: number;
  unit: string;
  ctaText?: string;
  badge?: "Recommended" | "Popular" | "Best Value" | "Starter" | string | null;
  recommended?: boolean;
  popular?: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface SiteContentDocument {
  id: "main";
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    announcement: string;
  };
  about: {
    eyebrow: string;
    headline: string;
    bio: string;
    ethos: string;
    location: string;
  };
  finalCta: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
  };
  contact: {
    email: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    whatsappMessage: string;
    instagramHandle: string;
    instagramUrl: string;
  };
  socialLinks: {
    instagram: string;
    whatsapp: string;
    email: string;
    easyxo: string;
  };
  footer: {
    tagline: string;
    copyrightYear: number;
    studioName: string;
  };
  title?: string;
  section?: string;
  metadata?: {
    sectionOrder?: string[];
    sectionVisibility?: Record<string, boolean>;
    skills?: Array<{ category: string; items: string[] }>;
    seo?: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
    [key: string]: unknown;
  };
  published: boolean;
  updatedAt: string;
}

export interface ReviewDocument {
  id: string;
  name: string;
  email: string;
  service: string;
  rating: number;
  review: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsDocument {
  id: "global";
  studioName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramHandle: string;
  liveUrl: string;
  maintenanceMode: boolean;
  allowPublicReviews: boolean;
  contact?: Record<string, unknown>;
  socials?: Record<string, unknown>;
  config?: Record<string, unknown>;
  published?: boolean;
  updatedAt: string;
}
