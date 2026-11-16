/**
 * Video Editing Service Types & Structured Content Models
 * IMDAD.BUILDS — Service 04
 * 
 * Designed for full Admin Panel CMS synchronization and client-side fallback.
 */

export type VideoCategory =
  | "All"
  | "Reels"
  | "YouTube"
  | "Promotional"
  | "Cinematic"
  | "Podcast";

export type VideoAspectRatio = "9:16" | "16:9" | "1:1" | "4:5";

export interface VideoSampleItem {
  id: string;
  title: string;
  category: Exclude<VideoCategory, "All">;
  description: string;
  thumbnailUrl: string;
  videoPreviewUrl?: string; // Optional direct video URL or demo MP4
  duration: string;         // e.g. "0:45", "8:20", "1:15"
  aspectRatio: VideoAspectRatio;
  badge?: string;           // e.g. "450K+ Views", "Viral Reel", "4K HDR"
  clientOrBrand?: string;   // e.g. "D2C Brand", "Tech Creator", "Fashion Label"
  tags: string[];           // e.g. ["Kinetic Type", "Sound Design", "Color Grade"]
  sortOrder: number;
  featured?: boolean;
}

export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  subtext?: string;
  position: WatermarkPosition;
  opacity: number;         // 10 to 100
  style: "minimal" | "badge" | "cinematic";
}

export interface VideoPricingPackage {
  id: string;
  name: string;
  tier: string;             // e.g. "Vertical Viral", "Creator Tube", "Cinematic Commercial", "Monthly Partner"
  price: number;
  currency: string;         // "₹"
  unit: string;             // "per video", "per month", "per package"
  description: string;
  videoDuration: string;    // e.g. "Up to 60 Seconds", "8–12 Minutes", "Up to 90 Seconds"
  revisions: string;        // e.g. "2 Revision Rounds", "3 Revision Rounds", "Unlimited Revisions"
  turnaroundTime: string;   // e.g. "24–48 Hours", "3–4 Business Days"
  deliverables: string[];
  badge?: string | null;
  popular?: boolean;
  orderCtaText: string;
  orderPrompt: string;      // Prefilled WhatsApp / inquiry message
  isDummyPricing: boolean;  // Transparency tag: marks demo pricing
}

export interface EditorProfile {
  id: string;
  name: string;
  role: string;             // e.g. "Senior Motion Editor", "Lead Colorist & Sound Architect"
  avatar: string;
  experienceYears: string;  // e.g. "6+ Years Experience"
  specialization: string[]; // e.g. ["Pacing & Hooks", "Kinetic Typography", "Sound Mixing"]
  software: string[];       // e.g. ["Premiere Pro", "After Effects", "DaVinci Resolve"]
  bio: string;
  verified: boolean;        // Blue verified-style badge
  verificationNote?: string;// "Demo Verified Editor Profile"
  completedProjectsCount?: number;
  isDemo?: boolean;         // Flags demo profile vs production verified editor
}

export interface VideoEditingHeroContent {
  eyebrow: string;
  headline: string;
  highlightedText: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  stats: {
    label: string;
    value: string;
    sublabel?: string;
  }[];
}

export interface VideoEditingAboutContent {
  badge: string;
  title: string;
  tagline: string;
  descriptionParagraphs: string[];
  principles: {
    title: string;
    description: string;
    icon: string;
  }[];
  workflowSteps: {
    step: string;
    title: string;
    description: string;
    turnaround: string;
  }[];
}

export interface VideoEditingContentDocument {
  id: "video-editing";
  hero: VideoEditingHeroContent;
  watermark: WatermarkConfig;
  categories: VideoCategory[];
  samples: VideoSampleItem[];
  pricing: VideoPricingPackage[];
  about: VideoEditingAboutContent;
  editors: EditorProfile[];
  updatedAt?: string;
}
