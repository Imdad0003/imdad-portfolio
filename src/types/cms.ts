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

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  sortOrder?: number;
  order?: number;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isCover?: boolean;
}

export type ProjectGalleryItem = GalleryItem;
export type Project = ProjectDocument;

export type ProjectPublishStatus = "draft" | "published" | "archived";

export interface ProjectDocument {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription: string;
  description: string;
  category: string;
  coverImage?: string;
  logo?: string;
  gallery?: string[];
  galleryItems?: GalleryItem[];
  screenshots?: string[];
  technologies: string[];
  tools?: string[];
  scope: string[];
  deliverables: string[];
  metrics?: ProjectMetricItem[];
  url?: string;
  githubUrl?: string;
  completionDate?: string;
  featured: boolean;
  sortOrder: number;
  highlight?: string;
  accentColor?: string;
  videoUrl?: string;
  videos?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "Active Brand" | "Completed" | "Live Store" | "In Production" | "Draft" | "Published" | "Archived" | string;
  publishingStatus?: ProjectPublishStatus;
  createdAt?: string;
  updatedAt?: string;
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

export interface MediaAssetDocument {
  id: string;
  url: string;
  name: string;
  alt: string;
  category: "logos" | "hero" | "apps" | "projects" | "services" | "general";
  fileSize: number;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
  updatedAt?: string;
  usedIn?: string[];
}

export interface HeroPrototypeApp {
  id: string;
  tabLabel: string;
  name: string;
  tagline: string;
  logo?: string;
  badge?: string;
  statusLabel?: string;
  statusVariant?: "amber" | "purple" | "emerald" | "sky";
  previewTitle?: string;
  previewSubtitle?: string;
  inspectLink?: string;
  inspectLabel?: string;
  type?: "audio" | "tracker" | "store" | "custom";
}

export interface SiteContentDocument {
  id: "main" | "draft" | string;
  hero: {
    badge: string;
    headline: string;
    highlightedText?: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    announcement: string;
    heroImage?: string;
    heroImageAlt?: string;
    backgroundImage?: string;
    backgroundImageOpacity?: number;
    viewportHeader?: string;
    viewportBadge?: string;
    prototypeApps?: HeroPrototypeApp[];
  };
  navigation?: {
    logo?: string;
    brandName?: string;
    badgeText?: string;
    navLinks?: Array<{ label: string; href: string; isExternal?: boolean }>;
    ctaText?: string;
    ctaLink?: string;
  };
  appsSection?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    displayedAppIds?: string[];
  };
  servicesSection?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  projectsSection?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    displayedProjectIds?: string[];
  };
  about: {
    eyebrow: string;
    headline: string;
    bio: string;
    ethos: string;
    location: string;
    pillars?: Array<{ number: string; title: string; description: string }>;
  };
  finalCta: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCtaText: string;
    primaryCtaLink?: string;
    secondaryCtaText: string;
    secondaryCtaLink?: string;
    badgeText?: string;
    footnote?: string;
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
    github?: string;
  };
  footer: {
    logo?: string;
    tagline: string;
    copyrightYear: number;
    studioName: string;
    description?: string;
    copyrightText?: string;
    navLinks?: Array<{ label: string; href: string }>;
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
      keywords?: string[];
    };
    [key: string]: unknown;
  };
  published: boolean;
  publishedAt?: string;
  publishedBy?: string;
  draftModifiedAt?: string;
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
  primaryLogo?: string;
  secondaryLogo?: string;
  favicon?: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl?: string;
  liveUrl: string;
  maintenanceMode: boolean;
  allowPublicReviews: boolean;
  brandColors?: {
    primary?: string;
    accent?: string;
    surface?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  contact?: Record<string, unknown>;
  socials?: Record<string, unknown>;
  config?: Record<string, unknown>;
  published?: boolean;
  updatedAt: string;
}
