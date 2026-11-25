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

export interface ServiceDemoItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  mediaType?: "image" | "video" | "link";
  mediaUrl?: string;
  thumbnailUrl?: string;
  demoLink?: string;
  metricsLabel?: string;
}

export interface ServiceTeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  initials?: string;
  specialties?: string[];
}

export interface ServiceDocument {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription: string;
  description: string;
  category: string;
  capabilities?: string[];
  deliverables: string[];
  process: ServiceProcessItem[];
  pricing: ServiceTierItem[];
  pricingNote?: string;
  demos?: ServiceDemoItem[];
  teamMembers?: ServiceTeamMember[];
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
  /** Cloudinary public identifier required for a verified server-side deletion. */
  publicId?: string;
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

export interface HeroQuickStartItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  iconName?: string;
}

export interface HeroTrustHighlight {
  id: string;
  label: string;
  value?: string;
  iconName?: string;
}

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  enabled?: boolean;
}

export interface OverviewPillarConfig {
  id: string;
  number?: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface ProcessStepConfig {
  id: string;
  step: string;
  title: string;
  description: string;
  badge?: string;
}

export interface WhyUsItemConfig {
  id: string;
  title: string;
  description: string;
  metric?: string;
  iconName?: string;
}

export interface TeamMemberConfig {
  id: string;
  name: string;
  role: string;
  title?: string;
  badge?: string;
  bio: string;
  avatarUrl?: string;
  initials?: string;
  specialties?: string[];
  portfolioUrl?: string;
  enabled?: boolean;
}

export interface FooterColumnConfig {
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}

export type CustomSectionLayout =
  | "banner"
  | "cards-2"
  | "cards-3"
  | "cards-4"
  | "split-media"
  | "faq"
  | "checklist";

export type CustomSectionTone = "cream" | "white" | "peach";

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  price?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  bullets?: string[];
}

export interface CustomSectionConfig {
  id: string;
  name: string;
  layout: CustomSectionLayout;
  tone?: CustomSectionTone;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  bodyText?: string;
  mediaUrl?: string;
  mediaAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  items?: CustomSectionItem[];
}

export interface SiteThemeSettings {
  presetId?: "warm-cream" | "soft-sand" | "rose-linen" | "apricot-light" | "custom";
  backgroundColor?: string;
  surfaceColor?: string;
  sandColor?: string;
  peachColor?: string;
  accentColor?: string;
  accentHoverColor?: string;
  headingColor?: string;
  bodyColor?: string;
  borderColor?: string;
  headingFont?: "plus-jakarta" | "dm-sans" | "system";
  bodyFont?: "dm-sans" | "plus-jakarta" | "system";
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
    quickStartTitle?: string;
    quickStartSubtitle?: string;
    quickStartItems?: HeroQuickStartItem[];
    trustHighlights?: HeroTrustHighlight[];
  };
  navigation?: {
    logo?: string;
    brandName?: string;
    badgeText?: string;
    navLinks?: Array<{ label: string; href: string; isExternal?: boolean }>;
    servicesDropdown?: NavSubItem[];
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
    displayedServiceIds?: string[];
    columns?: 2 | 3 | 4;
  };
  projectsSection?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    displayedProjectIds?: string[];
    columns?: 2 | 3;
  };
  overviewSection?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    pillars?: OverviewPillarConfig[];
  };
  processSection?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    ctaLink?: string;
    steps?: ProcessStepConfig[];
  };
  whyUsSection?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    items?: WhyUsItemConfig[];
  };
  teamSection?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    members?: TeamMemberConfig[];
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
    studioBadge?: string;
    description?: string;
    copyrightText?: string;
    navLinks?: Array<{ label: string; href: string }>;
    columns?: FooterColumnConfig[];
    bottomLinks?: Array<{ label: string; href: string }>;
  };
  customSections?: CustomSectionConfig[];
  themeSettings?: SiteThemeSettings;
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
  resumeBuilder?: {
    enabled?: boolean;
    maintenanceMode?: boolean;
    isFreeBeta?: boolean;
    priceInr?: number;
    aiModel?: string;
    dailyIpLimit?: number;
    noticeBanner?: string;
  };
  contact?: Record<string, unknown>;
  socials?: Record<string, unknown>;
  config?: Record<string, unknown>;
  activePreset?: string;
  initializedCollections?: Record<string, boolean>;
  published?: boolean;
  updatedAt: string;
}
