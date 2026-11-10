export type ListingImageType =
  | "hero"
  | "infographic"
  | "dimension"
  | "lifestyle"
  | "comparison"
  | "detail"
  | "packaging";

export interface ListingImageItem {
  id: string;
  url: string;
  type: ListingImageType;
  label: string;
  caption?: string;
}

export interface AmazonListingSample {
  id: string;
  title: string;
  brand: string;
  category: string;
  badge?: string;
  summary: string;
  coverImage: string;
  images: ListingImageItem[];
  highlights?: string[];
  sortOrder: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type APlusModuleType =
  | "brand_story"
  | "header_banner"
  | "four_image_quad"
  | "split_feature"
  | "comparison_table"
  | "tech_specs";

export interface APlusModuleSample {
  id: string;
  brandName: string;
  productTitle: string;
  category: string;
  moduleType: APlusModuleType;
  bannerUrl: string;
  title: string;
  subtitle?: string;
  description: string;
  features?: { title: string; desc: string; icon?: string }[];
  sortOrder: number;
  comparisonItems?: {
    feature: string;
    ourProduct: string | boolean;
    competitorA: string | boolean;
    competitorB: string | boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AmazonPricingPackage {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  unit: string;
  tagline: string;
  turnaround: string;
  deliverables: string[];
  recommended?: boolean;
  popular?: boolean;
  badge?: string;
  whatsappMessage: string;
}
