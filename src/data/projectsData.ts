export interface ProjectMetric {
  label: string;
  value: string;
}

export type ProjectCategory =
  | "Amazon Listing Design"
  | "Web Development"
  | "Apps & Products"
  | "AI/SaaS"
  | "Design & Branding";

export interface Project {
  id: string;
  name: string;
  slug: string;
  category: ProjectCategory;
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

export const projectCategoryTaxonomy: { id: "all" | ProjectCategory; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "Amazon Listing Design", label: "Amazon Listing Design" },
  { id: "Web Development", label: "Web Development" },
  { id: "Apps & Products", label: "Apps & Products" },
  { id: "AI/SaaS", label: "AI/SaaS" },
  { id: "Design & Branding", label: "Design & Branding" },
];

export function normalizeProjectCategory(category: string): ProjectCategory {
  if (
    category === "Amazon Listing Design" ||
    category === "Creatives" ||
    category === "Listing Design" ||
    category === "E-commerce"
  ) {
    return "Amazon Listing Design";
  }
  if (
    category === "Web Development" ||
    category === "Websites" ||
    category === "Web Architecture"
  ) {
    return "Web Development";
  }
  if (
    category === "Apps & Products" ||
    category === "Mobile Apps" ||
    category === "Apps"
  ) {
    return "Apps & Products";
  }
  if (
    category === "AI/SaaS" ||
    category === "AI Creative" ||
    category === "AI"
  ) {
    return "AI/SaaS";
  }
  if (
    category === "Design & Branding" ||
    category === "Branding" ||
    category === "Video & Ads"
  ) {
    return "Design & Branding";
  }
  return "Amazon Listing Design";
}

export const projectsData: Project[] = [
  // 1. APPS & PRODUCTS (FLAGSHIP)
  {
    id: "easyxo-brand-ecosystem",
    name: "EasyXo Brand Ecosystem",
    slug: "easyxo-brand-ecosystem",
    category: "Apps & Products",
    tagline: "End-to-end e-commerce brand platform & direct consumer ecosystem",
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
    accentColor: "#0284C7",
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

  // 2. AMAZON LISTING DESIGN
  {
    id: "marketplace-infographic-system",
    name: "Marketplace Infographic Suite",
    slug: "marketplace-infographic-system",
    category: "Amazon Listing Design",
    tagline: "Conversion-first visual assets answering customer friction points",
    description:
      "A complete 7-image marketplace listing architecture featuring high-contrast hero main shots, technical dimension diagrams, lifestyle contextual staging, and comparative value charts.",
    scope: [
      "Main White-Background CTR Asset",
      "Feature Breakdown Callout Graphics",
      "Dimension & Scale Accuracy Diagrams",
      "Material Quality & In-use Scenarios",
    ],
    tools: ["Canva", "Photoshop", "Marketplace Image Standards", "Prompt Engineering"],
    status: "Completed",
    featured: true,
    highlight: "Listing Design",
    accentColor: "#0284C7",
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
    id: "amazon-aplus-story-system",
    name: "Amazon A+ Brand Story Suite",
    slug: "amazon-aplus-story-system",
    category: "Amazon Listing Design",
    tagline: "Engaging 5-module Enhanced Brand Content (EBC) suite driving brand loyalty",
    description:
      "Engineered Enhanced Brand Content modules featuring high-impact visual banners, brand manifesto, technical comparison tables, and cross-sell product showcase carousels compliant with Amazon Brand Registry.",
    scope: [
      "Brand Story Header & Modular Banners",
      "Cross-Category Comparison Grid",
      "Technical Specification Infographics",
      "Mobile-Optimized Module Layouts",
    ],
    tools: ["Amazon Brand Registry", "Canva", "Photoshop", "Brand Identity"],
    status: "Completed",
    featured: true,
    highlight: "A+ Content",
    accentColor: "#0EA5E9",
    metrics: [
      { label: "Modules", value: "5 Premium" },
      { label: "Compliance", value: "100% Policy Pass" },
    ],
    deliverables: [
      "Full-width brand header banner (970x600)",
      "3-column feature showcase banners",
      "Product comparison chart graphic",
      "Standard company story carousel cards",
    ],
  },
  {
    id: "amazon-listing-launch-pack",
    name: "Amazon Listing Launch & SEO Pack",
    slug: "amazon-listing-launch-pack",
    category: "Amazon Listing Design",
    tagline: "White background hero, visual callouts, and backend search indexation",
    description:
      "A lean, high-velocity listing pack designed for swift marketplace indexing, including title optimization, benefit-driven bullets, backend keywords, and 5 essential listing images.",
    scope: [
      "SEO Keyword Extraction & Density Review",
      "Hero Product Retouching & Clipping",
      "Key Feature Overlay Infographics",
      "Amazon Seller Central Ingestion",
    ],
    tools: ["Amazon Seller Central", "Canva", "Helium 10 Keywords"],
    status: "Completed",
    featured: false,
    accentColor: "#38BDF8",
    metrics: [
      { label: "Turnaround", value: "48 Hours" },
      { label: "Images", value: "5 High-Res" },
    ],
    deliverables: [
      "Main white-background product visual",
      "4 benefit callout infographics",
      "Copywritten title and bullet points doc",
    ],
  },

  // 3. WEB DEVELOPMENT
  {
    id: "d2c-storefront-smartbiz",
    name: "D2C Commerce Storefront",
    slug: "d2c-storefront-smartbiz",
    category: "Web Development",
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
    accentColor: "#0284C7",
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
    id: "nextjs-portfolio-engine",
    name: "High-Speed Studio Web Engine",
    slug: "nextjs-portfolio-engine",
    category: "Web Development",
    tagline: "Ultra-fast headless Next.js web platform engineered for sub-second page loads",
    description:
      "Production-grade studio web application architected with Next.js App Router, Tailwind CSS, lightweight client-side state management, and strict zero-bloat performance budgets.",
    scope: [
      "Next.js App Router Architecture",
      "Server-Side Rendering & Metadata Generation",
      "Light-Only Studio Design System",
      "Accessible Semantic Structure",
    ],
    tools: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    status: "Completed",
    featured: false,
    highlight: "Web Architecture",
    accentColor: "#0284C7",
    metrics: [
      { label: "Performance Score", value: "99/100" },
      { label: "Accessibility", value: "WCAG AA" },
    ],
    deliverables: [
      "Static and dynamic route pipeline",
      "Interactive component library",
      "SEO metadata and sitemap generator",
    ],
  },

  // 4. APPS & PRODUCTS
  {
    id: "wishmusic-audio-app",
    name: "WishMusic Audio Experience",
    slug: "wishmusic-audio-app",
    category: "Apps & Products",
    tagline: "Distraction-free, gesture-driven music playback and streaming interface",
    description:
      "A fast, gesture-driven music player designed with high-contrast typography, intelligent offline queueing, tactile waveform scrubbing, and real-time palette extraction from album art.",
    scope: [
      "Tactile Waveform Audio Scrubbing",
      "Dynamic Artwork Color Extraction",
      "Zero-Latency Local Caching",
      "Distraction-Free Focus Mode",
    ],
    tools: ["React Native", "TypeScript", "Expo AV", "Tailwind CSS", "Zustand"],
    status: "In Production",
    featured: true,
    highlight: "Mobile App",
    accentColor: "#0284C7",
    metrics: [
      { label: "Version", value: "v0.8.2 Alpha" },
      { label: "Platform", value: "iOS / Android / Web" },
    ],
    deliverables: [
      "Cross-platform mobile audio player",
      "Interactive queue manager",
      "Full-screen focus mode layout",
    ],
  },
  {
    id: "wishtracking-app",
    name: "WishTracking Momentum Engine",
    slug: "wishtracking-app",
    category: "Apps & Products",
    tagline: "Privacy-first compound milestone and personal goal tracker",
    description:
      "An anti-bloat personal tracking system allowing builders and operators to log compound habits in two taps, visualize progress with mathematical curves, and operate with zero ad tracking.",
    scope: [
      "Compound Momentum Visualizer",
      "Two-Tap Metric Logging Interface",
      "Local-First Encrypted Data Layer",
      "Milestone Countdown Timers",
    ],
    tools: ["Next.js", "React Native", "TypeScript", "SQLite / Firebase", "Tailwind"],
    status: "In Production",
    featured: false,
    accentColor: "#0EA5E9",
    metrics: [
      { label: "Data Model", value: "Local-First" },
      { label: "Privacy", value: "Zero Ad Tracking" },
    ],
    deliverables: [
      "Mobile and web companion dashboard",
      "Custom compound progress charts",
      "Offline sync engine",
    ],
  },

  // 5. AI / SAAS
  {
    id: "ai-creative-generator",
    name: "AI Product Staging Pipeline",
    slug: "ai-creative-generator",
    category: "AI/SaaS",
    tagline: "Automated generative AI product staging and contextual visual creation",
    description:
      "A custom-tuned AI workflow generating hyper-realistic contextual backgrounds and lifestyle environments around studio-photographed products without expensive physical shoots.",
    scope: [
      "Precise Alpha Channel Object Segmentation",
      "Contextual Lighting & Shadow Synthesis",
      "High-Resolution 4K Upscaling Pipeline",
      "Marketplace Zoom Quality Assurance",
    ],
    tools: ["Generative Diffusion Models", "Python", "ComfyUI", "Photoshop"],
    status: "Completed",
    featured: true,
    highlight: "AI Automation",
    accentColor: "#0284C7",
    metrics: [
      { label: "Asset Generation", value: "Sub-Minute" },
      { label: "Cost Reduction", value: "85% vs Photo Shoot" },
    ],
    deliverables: [
      "Contextual lifestyle composite images",
      "Batch variation presets for seasons",
      "Automated shadow matching workflow",
    ],
  },
  {
    id: "smart-catalog-copilot",
    name: "Smart Catalog SEO Copilot",
    slug: "smart-catalog-copilot",
    category: "AI/SaaS",
    tagline: "Algorithmic competitor keyword scraper and product copy optimization engine",
    description:
      "A specialized LLM copilot that digests high-ranking marketplace competitors, extracts high-intent search terms, and drafts compliant titles, bullets, and backend keywords.",
    scope: [
      "Competitor Search Term Extraction",
      "Amazon Character Limit Enforcement",
      "High-Intent Keyword Density Scoring",
      "Multi-Marketplace Variation Mapping",
    ],
    tools: ["OpenAI API", "Python", "BeautifulSoup", "Next.js"],
    status: "Completed",
    featured: false,
    accentColor: "#0284C7",
    metrics: [
      { label: "SEO Coverage", value: "Top 50 Rank Keywords" },
      { label: "Drafting Speed", value: "Instant" },
    ],
    deliverables: [
      "Automated listing copy generator script",
      "Keyword density validation report",
      "Exportable CSV for bulk catalog upload",
    ],
  },

  // 6. DESIGN & BRANDING
  {
    id: "ecom-brand-packaging-identity",
    name: "E-Commerce Brand Packaging",
    slug: "ecom-brand-packaging-identity",
    category: "Design & Branding",
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
    accentColor: "#0284C7",
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
  {
    id: "ugc-direct-response-ads",
    name: "Direct Response UGC Ads",
    slug: "ugc-direct-response-ads",
    category: "Design & Branding",
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
    accentColor: "#0EA5E9",
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
    category: "Design & Branding",
    tagline: "Engaging unboxing and practical use-case video reels",
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
    accentColor: "#0284C7",
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
