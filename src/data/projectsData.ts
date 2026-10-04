export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  category: "E-commerce" | "Websites" | "Creatives" | "Video & Ads" | "Branding";
  tagline: string;
  description: string;
  scope: string[];
  tools: string[];
  status: "Active Brand" | "Completed" | "Live Store" | "In Production";
  featured: boolean;
  highlight?: string;
  url?: string;
  accentColor: string;
  metrics?: ProjectMetric[];
  deliverables: string[];
}

export const projectsData: Project[] = [
  {
    id: "easyxo-brand-ecosystem",
    name: "EasyXo Brand Ecosystem",
    slug: "easyxo-brand-ecosystem",
    category: "E-commerce",
    tagline: "End-to-end e-commerce brand founded and operated by Imdad",
    description:
      "Full-stack commercial brand execution: marketplace catalog setup across Amazon, Flipkart, and Meesho, direct-to-consumer digital storefront, product positioning, and conversion-focused creative assets.",
    scope: [
      "Marketplace Cataloging (Amazon, Flipkart, Meesho)",
      "Direct Online Storefront Architecture",
      "Brand Visual Identity & Packaging Standards",
      "Listing Optimizations & Keyword Architecture",
    ],
    tools: ["Marketplaces", "SmartBiz Engine", "Canva", "Razorpay Webhooks", "Meta Ads"],
    status: "Active Brand",
    featured: true,
    highlight: "Flagship Venture",
    url: "https://easyxo.in",
    accentColor: "#d97746",
    metrics: [
      { label: "Marketplace Channels", value: "3 Active" },
      { label: "Checkout Mode", value: "Direct UPI & Cards" },
      { label: "Execution", value: "100% In-House" },
    ],
    deliverables: [
      "Live direct-to-consumer website (easyxo.in)",
      "Multi-channel seller hub catalog listings",
      "Unified 7-card product infographic sets",
      "Automated order confirmation and receipt flows",
    ],
  },
  {
    id: "d2c-storefront-smartbiz",
    name: "D2C Commerce Storefront",
    slug: "d2c-storefront-smartbiz",
    category: "Websites",
    tagline: "Mobile-first responsive commerce portal with instant checkout",
    description:
      "Clean, modern digital storefront configured with intuitive catalog categorization, mobile friction-free navigation, automated order receipts, and seamless Razorpay payment integration.",
    scope: [
      "Category Structure & Product Attributes",
      "Razorpay Gateway Onboarding & Webhooks",
      "Mobile Checkout Optimization",
      "Customer Communication & Order Flow",
    ],
    tools: ["SmartBiz", "Razorpay", "Next.js Architecture", "Tailwind CSS"],
    status: "Live Store",
    featured: true,
    highlight: "Web Architecture",
    url: "https://easyxo.in",
    accentColor: "#502D55",
    metrics: [
      { label: "Payment Gateway", value: "Razorpay Webhooks" },
      { label: "Layout Architecture", value: "Mobile First" },
    ],
    deliverables: [
      "Mobile-optimized single page checkout",
      "Automated WhatsApp & Email order receipt triggers",
      "Dynamic catalog category navigation",
    ],
  },
  {
    id: "marketplace-infographic-system",
    name: "Marketplace Infographic Suite",
    slug: "marketplace-infographic-system",
    category: "Creatives",
    tagline: "Conversion-first visual assets answering customer friction points",
    description:
      "A complete 7-image marketplace listing architecture featuring high-contrast hero main shots, technical dimension diagrams, lifestyle contextual staging, and comparative value charts.",
    scope: [
      "Main White-Background CTR Asset",
      "Feature Breakdown Callout Graphics",
      "Dimension & Scale Accuracy Diagrams",
      "Material Quality & In-use Scenarios",
    ],
    tools: ["Canva", "AI Image Pipelines", "Marketplace Image Standards"],
    status: "Completed",
    featured: true,
    highlight: "Listing Design",
    accentColor: "#935073",
    metrics: [
      { label: "Image Stack", value: "7 Cards" },
      { label: "Standard", value: "Zoom Compliant" },
    ],
    deliverables: [
      "Pure white 2000x2000px main hero visual",
      "Exploded diagram with technical dimensions",
      "Lifestyle contextual staging assets",
      "Comparative feature breakdown chart",
    ],
  },
  {
    id: "ugc-direct-response-ads",
    name: "Direct Response UGC Ads",
    slug: "ugc-direct-response-ads",
    category: "Video & Ads",
    tagline: "High-CTR paid creative hooks developed for Meta & Instagram feeds",
    description:
      "Short-form ad creative series built around real customer pain points, testing 3 distinct 3-second hook variations paired with clear, singular call-to-actions.",
    scope: [
      "Problem-Agitation-Solution Scriptwriting",
      "Visual Hook Split Testing (3 variants)",
      "Direct-Response Ad Copy & Headlines",
      "Vertical 9:16 Feed & Story Formatting",
    ],
    tools: ["Meta Ads", "CapCut", "Script Frameworks", "AI Voiceovers"],
    status: "In Production",
    featured: true,
    highlight: "Paid Acquisition",
    accentColor: "#b86890",
    metrics: [
      { label: "Hook Testing", value: "3 Angles" },
      { label: "Aspect Ratio", value: "9:16 Vertical" },
    ],
    deliverables: [
      "3 vertical short-form ad creatives",
      "Dynamic kinetic subtitle tracks",
      "Audio mixing with licensed background tracks",
    ],
  },
  {
    id: "short-form-product-demonstrations",
    name: "Product Demonstration Reels",
    slug: "short-form-product-demonstrations",
    category: "Video & Ads",
    tagline: "Engaging, unboxing and practical use-case video reels",
    description:
      "Fast-paced demonstration reels showing realistic product handling, key feature walkthroughs, and practical durability highlights formatted for Instagram Reels and YouTube Shorts.",
    scope: [
      "Dynamic Pacing & Macro Product B-Roll",
      "Automated Kinetic Captions",
      "Clean Narration & Sound Design",
      "Cross-Platform Aspect Ratio Delivery",
    ],
    tools: ["Video Editing", "Kinetic Typography", "Audio Mastering"],
    status: "Completed",
    featured: false,
    highlight: "Video Content",
    accentColor: "#502D55",
    metrics: [
      { label: "Formats", value: "Reels / Shorts" },
      { label: "Tempo", value: "High Retention" },
    ],
    deliverables: [
      "Short-form demonstration video files",
      "Burned-in high-contrast captions",
      "Cross-platform aspect ratio exports",
    ],
  },
  {
    id: "ecom-brand-packaging-identity",
    name: "E-Commerce Brand Packaging",
    slug: "ecom-brand-packaging-identity",
    category: "Branding",
    tagline: "Cohesive visual identity for multi-channel product presentation",
    description:
      "A complete branding framework encompassing brand logo mark, primary typography pairings, customer box insert cards, thank-you cards, and statutory shipping label layouts.",
    scope: [
      "Brand Vector Mark & Color System",
      "Customer Unboxing Card & Review Prompt",
      "Packaging Outer Label & Compliance Box Design",
      "Digital Brand Asset Repository",
    ],
    tools: ["Canva", "Vector Typography", "Print Guidelines", "Branding"],
    status: "Completed",
    featured: false,
    highlight: "Brand System",
    accentColor: "#d97746",
    metrics: [
      { label: "Unboxing Asset", value: "Thank-You Card" },
      { label: "Label Standard", value: "Barcode Ready" },
    ],
    deliverables: [
      "Vector brand marks and color guide",
      "Print-ready box insert card artwork",
      "Statutory courier shipping label layout",
    ],
  },
];

export function getAllProjects(): Project[] {
  return projectsData;
}

export function getFeaturedProjects(): Project[] {
  return projectsData.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projectsData.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
}
