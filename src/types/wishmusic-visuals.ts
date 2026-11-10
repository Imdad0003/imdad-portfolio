export interface VisualImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize?: number;
  width?: number;
  height?: number;
  title?: string;
  caption?: string;
  altText?: string;
  uploadedAt: string;
  githubAssetId?: number;
}

export interface HeroSectionContent {
  enabled: boolean;
  headline: string;
  subheadline: string;
  desktopBgImage?: VisualImage | null;
  mobileBgImage?: VisualImage | null;
  logoImage?: VisualImage | null;
  mockupImage?: VisualImage | null;
  ctaText: string;
  secondaryCtaText: string;
  showVersionBadge: boolean;
}

export interface ScreenshotItem {
  id: string;
  image: VisualImage;
  title: string;
  caption?: string;
  displayOrder: number;
  featured?: boolean;
}

export interface FeatureCardItem {
  id: string;
  key: string;
  title: string;
  description: string;
  image?: VisualImage | null;
  iconName?: string;
  badge?: string;
  displayOrder: number;
  enabled: boolean;
}

export interface AboutSectionContent {
  enabled: boolean;
  heading: string;
  subheading?: string;
  description: string;
  secondaryDescription?: string;
  primaryImage?: VisualImage | null;
  secondaryImage?: VisualImage | null;
  ctaText?: string;
  ctaUrl?: string;
  highlights?: Array<{ label: string; value: string }>;
}

export interface GalleryItem {
  id: string;
  image: VisualImage;
  title: string;
  caption?: string;
  category: "wallpaper" | "screenshot" | "render" | "branding";
  displayOrder: number;
  enabled: boolean;
}

export interface SectionVisibility {
  hero: boolean;
  screenshots: boolean;
  features: boolean;
  about: boolean;
  gallery: boolean;
  download: boolean;
}

export interface WishMusicVisualContent {
  id: string; // "wishmusic"
  version: number;
  updatedAt: string;
  updatedBy?: string;
  visibility: SectionVisibility;
  hero: HeroSectionContent;
  screenshots: ScreenshotItem[];
  features: FeatureCardItem[];
  about: AboutSectionContent;
  gallery: GalleryItem[];
}

export interface WishMusicVisualContentDoc {
  id: string; // "wishmusic"
  draft: WishMusicVisualContent;
  published: WishMusicVisualContent;
  previous?: WishMusicVisualContent;
  updatedAt: string;
  publishedAt?: string;
}
