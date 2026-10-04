export interface ServicePackage {
  name: string;
  price: number;
  priceType: "starting" | "fixed";
  unit: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface ServiceSubType {
  name: string;
  description: string;
  scope: string;
  features: string[];
  priceDisplay?: string;
  ctaText?: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface StudioService {
  id: string;
  number: string;
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  accentColor: string;
  capabilities: string[];
  deliverables: string[];
  suitableFor: string[];
  process: ServiceProcessStep[];
  subTypes?: ServiceSubType[];
  packages?: ServicePackage[];
  hasRealPricing: boolean;
  pricingNote?: string;
  faqs: { question: string; answer: string }[];
}

export const studioServices: StudioService[] = [
  // ==========================================
  // 01 — WEBSITE DEVELOPMENT
  // ==========================================
  {
    id: "website-development",
    number: "01",
    title: "Website Development",
    slug: "website-development",
    tagline: "High-performance, conversion-engineered digital websites.",
    shortDescription:
      "Modern business websites, landing pages, and web apps built for instant load speeds, seamless mobile UX, and high conversion rates.",
    fullDescription:
      "At Imdad.builds, websites are designed as core business assets, not generic digital brochures. We build fast, mobile-first web experiences tailored to turn visitors into confirmed leads and customers. Every site features clean semantic architecture, automated payment gateways, on-page SEO, and rock-solid performance.",
    iconName: "Globe",
    accentColor: "#502D55",
    capabilities: [
      "Landing Page Funnels",
      "Corporate & Business Websites",
      "E-Commerce Web Storefronts",
      "Shopify Store Design",
      "WordPress & Headless Web",
      "Custom Web Applications",
      "Razorpay / Payment Integrations",
      "Technical On-Page SEO",
    ],
    deliverables: [
      "Production-ready responsive website",
      "Mobile-optimized checkout & contact forms",
      "Configured Razorpay or Cashfree payment webhooks",
      "SSL, domain DNS, and cloud deployment setup",
      "Search Console indexing and schema markup",
    ],
    suitableFor: [
      "Direct-to-consumer product brands",
      "Service businesses & consultants",
      "Founders launching new products or startups",
      "Businesses seeking higher conversion rates",
    ],
    process: [
      {
        step: "01",
        title: "Strategy & Scope Definition",
        description: "Clarify business goals, target audience, content architecture, and technical requirements.",
      },
      {
        step: "02",
        title: "UI/UX & Interactive Wireframing",
        description: "Design high-contrast, scannable layouts with strong typographic hierarchy and conversion focus.",
      },
      {
        step: "03",
        title: "Modern Full-Stack Development",
        description: "Code clean, responsive frontends and reliable backends using Next.js, React, or Shopify.",
      },
      {
        step: "04",
        title: "Integrations, Speed Audit & Launch",
        description: "Connect payment gateways, verify mobile touchpoints, audit Core Web Vitals, and deploy live.",
      },
    ],
    subTypes: [
      {
        name: "Landing Page",
        description: "High-converting single-page funnel engineered to turn incoming paid traffic into paying customers.",
        scope: "Single long-form page, hero, proof points, offer breakdown, FAQ, and CTA.",
        priceDisplay: "₹4,999",
        features: [
          "Mobile-first responsive layout",
          "Lightning-fast load performance",
          "Direct WhatsApp / Call CTA integration",
          "Clear benefit-focused copywriting structure",
        ],
      },
      {
        name: "Business Website",
        description: "Multi-page corporate website to establish authority, present services, and capture inquiries.",
        scope: "4–6 structured pages (Home, About, Services, Case Studies, Contact).",
        priceDisplay: "₹9,999",
        features: [
          "Multi-page architecture",
          "Modern brand aesthetics & responsive design",
          "Contact form & inquiry routing",
          "On-page technical SEO & metadata setup",
        ],
      },
      {
        name: "E-Commerce Website",
        description: "Full-fledged independent online storefront equipped with shopping cart and automated checkout.",
        scope: "Catalog structure, product detail pages, cart drawer, checkout, and order management.",
        priceDisplay: "₹15,999",
        features: [
          "Complete online store setup & category architecture",
          "Seamless shopping cart & checkout experience",
          "Payment gateway & shipping integration",
          "Mobile-first product presentation",
        ],
      },
      {
        name: "Shopify Store",
        description: "Turnkey Shopify store setup with responsive themes, collections, and automated app workflows.",
        scope: "Shopify theme custom styling, up to 15 product uploads, and payment gateway hookup.",
        priceDisplay: "₹12,999",
        features: [
          "Shopify theme installation & customization",
          "Product catalog & collection configuration",
          "Razorpay / Cashfree gateway connection",
          "Automated email notifications",
        ],
      },
      {
        name: "Web Application",
        description: "Custom interactive web app with user authentication, database persistence, and API logic.",
        scope: "Custom scoped full-stack React/Next.js application.",
        priceDisplay: "Custom Scope",
        features: [
          "Tailored business logic & data modeling",
          "Role-based authentication & dashboard",
          "REST or GraphQL API integration",
          "Scalable cloud infrastructure",
        ],
      },
      {
        name: "Custom Website",
        description: "Bespoke digital experience with tailored layout compositions and specialized workflows.",
        scope: "Scope determined based on design specifications.",
        priceDisplay: "Custom Scope",
        features: [
          "Unique editorial design system",
          "Bespoke micro-interactions and transitions",
          "Custom CMS or headless data integration",
          "Optimized for high-intent brand positioning",
        ],
      },
    ],
    packages: [
      {
        name: "Landing Page",
        price: 4999,
        priceType: "starting",
        unit: "/ page",
        description: "High-converting single-page funnel designed to turn incoming traffic into paying customers.",
        features: [
          "High-converting single page funnel",
          "Mobile-first responsive layout",
          "Lightning fast loading performance",
          "Contact form / WhatsApp button integration",
          "Basic on-page SEO setup",
        ],
      },
      {
        name: "Business Website",
        price: 9999,
        priceType: "starting",
        unit: "/ website",
        description: "Multi-page corporate website to establish authority, present services, and capture inquiries.",
        features: [
          "Multi-page architecture (Home, About, Services, Contact)",
          "Modern brand aesthetics & responsive design",
          "On-page technical SEO & metadata setup",
          "Contact form with email alerts",
          "Google Maps & business info integration",
        ],
        recommended: true,
      },
      {
        name: "E-Commerce Website",
        price: 15999,
        priceType: "starting",
        unit: "/ website",
        description: "Full-fledged independent online storefront equipped with shopping cart and automated checkout.",
        features: [
          "Complete online store setup & category architecture",
          "Seamless shopping cart & checkout experience",
          "Payment gateway & shipping integration",
          "Mobile-first product presentation",
          "Order receipt & confirmation emails",
        ],
      },
    ],
    hasRealPricing: true,
    pricingNote: "Pricing is transparent and scope-based. Domain and third-party hosting fees are paid directly to providers.",
    faqs: [
      {
        question: "How long does a website take to build?",
        answer: "A standard landing page is typically completed in 3–5 business days. Full multi-page business websites take 7–12 business days, and complete e-commerce stores take 10–18 business days.",
      },
      {
        question: "Do I get ownership of the code and domain?",
        answer: "Yes, 100%. All code, domain registrations, and platform accounts belong directly to you upon project handover.",
      },
      {
        question: "Which payment gateways do you integrate?",
        answer: "We primarily integrate Razorpay, Cashfree, and Stripe with instant UPI, NetBanking, and credit/debit card support.",
      },
    ],
  },

  // ==========================================
  // 02 — APP DEVELOPMENT
  // ==========================================
  {
    id: "app-development",
    number: "02",
    title: "App Development",
    slug: "app-development",
    tagline: "Fluid, high-performance mobile and web applications.",
    shortDescription:
      "Native-feel cross-platform iOS and Android apps, progressive web apps, and custom digital software built with clean, modern codebases.",
    fullDescription:
      "Imdad.builds architects and ships digital products that feel tactile, responsive, and reliable. From our own in-house apps like WishMusic and WishTracking to bespoke client tools, we deliver mobile and web applications with gesture-first interfaces, resilient offline persistence, and low-latency API architecture.",
    iconName: "Smartphone",
    accentColor: "#935073",
    capabilities: [
      "Cross-Platform Mobile Apps (iOS & Android)",
      "React Native & Expo Ecosystem",
      "Progressive Web Apps (PWA)",
      "Custom Backend APIs & Webhooks",
      "Database Architecture (Supabase / Firebase / SQLite)",
      "Offline Sync & Local Caching",
      "Micro-Interactions & Gesture Haptics",
      "App Store & Play Store Deployment",
    ],
    deliverables: [
      "Compiled iOS and Android production builds",
      "Complete clean TypeScript source code repository",
      "Backend database schema and authentication setup",
      "REST or real-time API integrations",
      "Store submission preparation and privacy asset bundle",
    ],
    suitableFor: [
      "Founders launching new mobile product ventures",
      "E-commerce brands seeking a dedicated customer mobile app",
      "Businesses replacing manual operations with digital tools",
      "Audio, productivity, and utility software creators",
    ],
    process: [
      {
        step: "01",
        title: "Product Architecture & Specification",
        description: "Define core user stories, data models, state flows, and MVP boundaries.",
      },
      {
        step: "02",
        title: "Interactive Prototype & UX Flow",
        description: "Build high-fidelity tactile UI layouts with thumb-zone ergonomics and fluid micro-transitions.",
      },
      {
        step: "03",
        title: "Engineering & Local Persistence",
        description: "Develop the cross-platform application in TypeScript with optimized caching and state.",
      },
      {
        step: "04",
        title: "Testing, Build Packaging & Submission",
        description: "Run automated device testing, configure signing certificates, and coordinate store releases.",
      },
    ],
    subTypes: [
      {
        name: "Cross-Platform Mobile App",
        description: "Single high-performance codebase running natively on both iOS and Android devices.",
        scope: "Complete mobile app lifecycle from architecture to store compilation.",
        features: [
          "iOS & Android cross-platform consistency",
          "Native device APIs (camera, haptics, storage, notifications)",
          "Fluid 60fps gesture navigation",
          "Clean TypeScript architecture",
        ],
      },
      {
        name: "Progressive Web App (PWA)",
        description: "Zero-download installable app accessible instantly via browser with offline support.",
        scope: "Installable manifest, service worker caching, and desktop/mobile responsiveness.",
        features: [
          "Instant distribution via web URL",
          "Offline caching & background sync",
          "App-like full screen standalone window",
          "Lower development and maintenance overhead",
        ],
      },
      {
        name: "Internal Digital Utility",
        description: "Tailored operations app for team order fulfillment, cataloging, or tracking.",
        scope: "Role-authenticated internal dashboard and mobile workflow.",
        features: [
          "Secure role-based access",
          "Direct database and inventory linkage",
          "Optimized for high-volume daily input",
          "Real-time event logging",
        ],
      },
    ],
    hasRealPricing: false,
    pricingNote:
      "Because mobile applications vary widely in complexity, data architecture, and platform dependencies, we scope each app individually. Let's discuss your requirements to map out an accurate MVP timeline and investment.",
    faqs: [
      {
        question: "Do you develop for both iOS and Android?",
        answer: "Yes. Using modern cross-platform technologies (React Native / Expo), we build apps that run natively on both iPhone and Android devices from a unified codebase.",
      },
      {
        question: "Can you help deploy the app to Apple App Store and Google Play?",
        answer: "Yes. We handle production build compilation, metadata assets, privacy declarations, and developer console submission.",
      },
      {
        question: "What is the typical timeframe for an MVP app?",
        answer: "A focused Minimum Viable Product (MVP) typically takes between 4 to 8 weeks depending on feature scope and backend complexity.",
      },
    ],
  },

  // ==========================================
  // 03 — E-COMMERCE
  // ==========================================
  {
    id: "ecommerce",
    number: "03",
    title: "E-Commerce",
    slug: "ecommerce",
    tagline: "End-to-end commerce operations, marketplace dominance & store setup.",
    shortDescription:
      "Marketplace cataloging for Amazon, Flipkart, and Meesho, direct-to-consumer digital storefronts, and conversion-optimized listing architectures.",
    fullDescription:
      "Imdad.builds approaches e-commerce from the trenches of real execution. As the founder of EasyXo, Imdad actively operates an e-commerce brand and applies proven, battle-tested strategies to every client project. We handle multi-channel marketplace cataloging, backend SEO keyword indexing, product positioning, and seamless D2C checkout systems.",
    iconName: "ShoppingBag",
    accentColor: "#d97746",
    capabilities: [
      "Amazon Listing & Catalog Optimization",
      "Flipkart Seller Hub Cataloging",
      "Meesho Single & Variation Setup",
      "Multi-Channel Marketplace Launches",
      "Competitor Benchmarking & Keyword Matrix",
      "Direct-to-Consumer (D2C) Storefronts",
      "SmartBiz & Shopify Store Architecture",
      "Payment Gateway & Courier Sync",
    ],
    deliverables: [
      "Optimized listing titles, bullets, and backend search terms",
      "Multi-variation SKU mapping and tax code configuration",
      "Full 7-image high-converting listing creative decks",
      "Working checkout with UPI and card payment support",
      "Competitive pricing and niche demand report",
    ],
    suitableFor: [
      "Brands wanting to sell on Amazon, Flipkart, and Meesho",
      "Manufacturers taking their products direct to consumers",
      "Sellers suffering from low listing visibility or high drop-off",
      "D2C brands seeking independent store infrastructure",
    ],
    process: [
      {
        step: "01",
        title: "Product & Market Intelligence",
        description: "Analyze competitor listings, customer review grievances, search volume, and price positioning.",
      },
      {
        step: "02",
        title: "Keyword & Copywriting Architecture",
        description: "Draft high-ranking search titles, scannable benefit bullets, and compliant backend search keywords.",
      },
      {
        step: "03",
        title: "Catalog Upload & Specification Mapping",
        description: "Execute category mapping, SKU variation grouping, GST classification, and portal compliance checks.",
      },
      {
        step: "04",
        title: "QC Clearance & Launch",
        description: "Resolve portal quality check errors, verify active buy-box visibility, and optimize for launch sales.",
      },
    ],
    subTypes: [
      {
        name: "Marketplace Cataloging",
        description: "End-to-end product onboarding onto Amazon, Flipkart, or Meesho seller hubs.",
        scope: "Title, bullets, keywords, and variation attribute upload.",
        priceDisplay: "Starting ₹499",
        features: [
          "Amazon, Flipkart, and Meesho support",
          "SEO-indexed keyword integration",
          "Category and tax code mapping",
          "QC error resolution guarantee",
        ],
      },
      {
        name: "Multi-Marketplace Launch",
        description: "Simultaneous product launch across India's top 3 online marketplaces.",
        scope: "Synchronized launch on Amazon, Flipkart, and Meesho.",
        priceDisplay: "₹1,999",
        features: [
          "Single coordinated asset workflow",
          "Cross-platform inventory setup",
          "Platform-specific keyword customization",
          "Fast-track verification",
        ],
      },
      {
        name: "Direct Online Storefront",
        description: "Independent mobile-first D2C store with automated payment collection and order flow.",
        scope: "Catalog structure, product pages, Razorpay setup, and order emails.",
        priceDisplay: "Starting ₹9,999",
        features: [
          "Zero commission per sale",
          "Instant UPI / Card settlement",
          "Custom domain & SSL",
          "Automated receipt notifications",
        ],
      },
    ],
    packages: [
      {
        name: "Meesho Listing",
        price: 499,
        priceType: "starting",
        unit: "/ product",
        description: "Fast-track Meesho single and variation catalog uploads with proper category mapping.",
        features: [
          "Meesho supplier panel catalog upload",
          "Single and variation SKU setup",
          "Accurate category & tax code mapping",
          "Pricing and inventory configuration",
        ],
      },
      {
        name: "Flipkart Listing",
        price: 699,
        priceType: "starting",
        unit: "/ product",
        description: "Accurate Flipkart cataloging, mandatory attribute mapping, and search-optimized copy.",
        features: [
          "Flipkart Seller Hub cataloging",
          "Title & attribute specification mapping",
          "Search keyword enrichment",
          "Listing QC pass support",
        ],
      },
      {
        name: "Amazon Listing",
        price: 799,
        priceType: "starting",
        unit: "/ product",
        description: "Professional Amazon product listing creation, keyword indexing, and catalog upload.",
        features: [
          "SEO-friendly product title",
          "Key bullet points setup",
          "Backend search terms & keywords",
          "Basic catalog upload assistance",
        ],
        recommended: true,
      },
      {
        name: "Amazon + Flipkart + Meesho",
        price: 1999,
        priceType: "starting",
        unit: "/ product",
        description: "Synchronized multi-channel product launch across India's top 3 online marketplaces.",
        features: [
          "All 3 marketplace listings included",
          "Unified product data preparation",
          "Platform-specific keyword adaptation",
          "Best value for multi-channel expansion",
        ],
      },
    ],
    hasRealPricing: true,
    pricingNote: "Transparent per-product starting rates. Volume discounts available for larger catalogs.",
    faqs: [
      {
        question: "Do I need GST to sell on Amazon and Flipkart?",
        answer: "Yes, regular GST registration is mandatory for selling goods on Amazon and Flipkart across state lines. Meesho allows enrollment for certain categories under composite/enrolment guidelines.",
      },
      {
        question: "How long does marketplace catalog approval take?",
        answer: "Meesho usually clears listings in 24–48 hours. Amazon and Flipkart typically take 24–72 hours after submitting mandatory brand and product attributes.",
      },
      {
        question: "Do you also design the product listing images?",
        answer: "Yes, our studio provides complete 7-image high-contrast infographic decks designed to meet marketplace CTR and zoom standards.",
      },
    ],
  },

  // ==========================================
  // 04 — VIDEO EDITING
  // ==========================================
  {
    id: "video-editing",
    number: "04",
    title: "Video Editing",
    slug: "video-editing",
    tagline: "High-retention short-form video & direct-response advertising reels.",
    shortDescription:
      "Short-form product reels, YouTube Shorts, UGC-style video ads, and promotional edits engineered with strong 3-second hooks and dynamic motion.",
    fullDescription:
      "Modern audiences decide whether to keep watching within the first 3 seconds. Imdad.builds produces fast-paced, high-retention video edits tailored for Instagram Reels, YouTube Shorts, and paid Meta campaigns. We combine crisp pacing, kinetic typography, clear audio mixing, and punchy value hooks that hold viewer attention and prompt direct action.",
    iconName: "Video",
    accentColor: "#935073",
    capabilities: [
      "Short-Form Video Production (9:16 Vertical)",
      "Instagram & Facebook Reels",
      "YouTube Shorts Strategy & Cuts",
      "UGC-Style Video Ads",
      "AI Avatar & Voiceover Product Videos",
      "Ad Hook Split Testing (First 3 Seconds)",
      "Dynamic Captions & Motion Graphics",
      "Product Demonstration & Unboxing Edits",
    ],
    deliverables: [
      "High-bitrate vertical 1080x1920 MP4 video files",
      "Multiple hook variations for ad split-testing",
      "Baked-in animated captions with highlight effects",
      "Sound design, sound effects, and licensed background audio",
      "Platform-ready thumbnail cover frames",
    ],
    suitableFor: [
      "E-commerce brands advertising on Meta & Instagram",
      "Creators and educators growing organic reach",
      "Product founders showcasing unboxings and demos",
      "Businesses seeking higher CTR on paid video ads",
    ],
    process: [
      {
        step: "01",
        title: "Concept & Hook Formulation",
        description: "Identify core customer friction points and engineer 3 distinct visual and verbal hooks.",
      },
      {
        step: "02",
        title: "Assembly & Dynamic Rhythm",
        description: "Cut raw footage to a crisp, breathless tempo removing all dead air and hesitation.",
      },
      {
        step: "03",
        title: "Kinetic Captions & Sound Design",
        description: "Layer engaging on-screen typography, sound effects, and voiceover to maintain sensory retention.",
      },
      {
        step: "04",
        title: "Platform Formatting & Export",
        description: "Color-correct and master files with safe zones for Instagram and YouTube UI overlays.",
      },
    ],
    subTypes: [
      {
        name: "Short-Form Product Reel",
        description: "Fast-paced demonstration reel showing realistic product handling and features.",
        scope: "15–45 second vertical reel with captions and sound design.",
        priceDisplay: "Starting ₹999",
        features: [
          "Dynamic macro b-roll pacing",
          "Automated kinetic captions",
          "Sound effects and rhythmic music sync",
          "Platform safe-zone compliance",
        ],
      },
      {
        name: "Direct-Response UGC Ad",
        description: "Authentic, relatable creator-style video ad designed to drive high click-through rates.",
        scope: "Problem-agitation-solution structure with distinct call-to-action.",
        priceDisplay: "Starting ₹1,499",
        features: [
          "High-CTR 3-second hook variations",
          "Relatable customer use-case narrative",
          "Clear CTA overlay and vocal prompt",
          "Designed for Meta Ads feeds and stories",
        ],
      },
      {
        name: "3-Ad Testing Sprint",
        description: "Sprint package with 3 diverse video angles to split-test hooks and discover winning creatives.",
        scope: "3 complete video variations with different hook angles.",
        priceDisplay: "₹3,999",
        features: [
          "3 distinct opening hooks",
          "Unified product demonstration core",
          "High-volume creative testing efficiency",
          "Best value for active advertisers",
        ],
      },
    ],
    packages: [
      {
        name: "Basic Product Video",
        price: 799,
        priceType: "starting",
        unit: "/ video",
        description: "Clean demonstration video with fast-paced cuts and product highlight overlays.",
        features: [
          "Clean product demonstration",
          "Fast-paced cuts & transitions",
          "Key text highlights",
          "Standard background music",
        ],
      },
      {
        name: "Product Reel",
        price: 999,
        priceType: "starting",
        unit: "/ video",
        description: "Engaging short-form reel built for Instagram, Facebook, and YouTube Shorts.",
        features: [
          "Engaging vertical 9:16 format",
          "Dynamic captions & kinetic text",
          "Sound effects & trending music sync",
          "Optimized for high retention",
        ],
        recommended: true,
      },
      {
        name: "UGC-Style Ad",
        price: 1499,
        priceType: "starting",
        unit: "/ video",
        description: "Authentic, relatable creator-style video ad designed to drive high click-through rates.",
        features: [
          "Authentic creator-style tone",
          "High-converting hook in first 3 seconds",
          "Clear problem-solution angle",
          "Direct call-to-action outro",
        ],
      },
      {
        name: "3 Ad Testing Package",
        price: 3999,
        priceType: "fixed",
        unit: "/ package",
        description: "Sprint package with 3 diverse video angles to split-test hooks and find winning ad creatives.",
        features: [
          "3 distinct video ad creatives",
          "3 different opening hooks for testing",
          "Consistent core demonstration",
          "Best value for paid Meta ad campaigns",
        ],
      },
    ],
    hasRealPricing: true,
    pricingNote: "Fixed per-video and sprint package pricing. Client supplies raw footage or chooses AI video synthesis.",
    faqs: [
      {
        question: "Do I need to send physical products or raw footage?",
        answer: "You can send raw video clips filmed on your phone, or we can produce AI-assisted product demonstrations and avatar presentations.",
      },
      {
        question: "What is the turnaround time for video editing?",
        answer: "Single reels and ads are completed in 24–48 hours. Ad sprint packages (3–5 videos) take 3–5 business days.",
      },
      {
        question: "Do you include captions and royalty-free music?",
        answer: "Yes, every video includes kinetic on-screen captions, sound effects, and licensed background audio suitable for commercial use.",
      },
    ],
  },

  // ==========================================
  // 05 — SOCIAL MEDIA
  // ==========================================
  {
    id: "social-media",
    number: "05",
    title: "Social Media",
    slug: "social-media",
    tagline: "Structured brand presence, organic distribution & creative calendars.",
    shortDescription:
      "Strategic content planning, high-impact post designs, Reels concepts, and structured calendars that build long-term brand authority.",
    fullDescription:
      "Consistency and creative clarity are the drivers of modern organic distribution. Imdad.builds develops end-to-end social media content frameworks for brands and entrepreneurs. We eliminate guesswork with monthly visual roadmaps, high-converting carousels, attention-grabbing captions, and platform-specific Reels concepts.",
    iconName: "Share2",
    accentColor: "#502D55",
    capabilities: [
      "Monthly Content Roadmaps & Calendars",
      "Instagram & Facebook Post Design",
      "Carousel Infographics & Visual Sliders",
      "Reels Ideation & Storyboard Outlines",
      "Direct-Response Caption Copywriting",
      "Brand Aesthetic & Grid Cohesion",
      "Audience Growth Direction",
      "Basic Analytics & Performance Reviews",
    ],
    deliverables: [
      "Complete monthly content calendar with publishing dates",
      "High-resolution ready-to-post feed graphics & carousels",
      "Engaging captions with targeted hashtag clusters",
      "Reels concept briefs with shot lists and audio suggestions",
      "Monthly performance review checkpoints",
    ],
    suitableFor: [
      "E-commerce brands seeking active customer engagement",
      "Founders building personal authority and deal flow",
      "Local businesses wanting consistent online presence",
      "Startups wanting to turn followers into customers",
    ],
    process: [
      {
        step: "01",
        title: "Brand Voice & Pillar Mapping",
        description: "Define 3–4 core content pillars that position your product, educate buyers, and drive conversions.",
      },
      {
        step: "02",
        title: "Editorial Calendar Architecture",
        description: "Plan posts, carousels, and reel themes mapped across the entire month with clear timelines.",
      },
      {
        step: "03",
        title: "Visual Design & Copywriting",
        description: "Design pixel-crisp graphics aligned with your brand identity and write engaging, scannable captions.",
      },
      {
        step: "04",
        title: "Delivery & Review",
        description: "Deliver approved assets organized by week with clear publishing guidelines and hashtags.",
      },
    ],
    subTypes: [
      {
        name: "Content Planning & Roadmaps",
        description: "Structured 30-day publishing calendar with topics, hooks, and creative direction.",
        scope: "Monthly calendar with 15–20 structured content topics.",
        features: [
          "Targeted audience content pillars",
          "Reel and carousel concept outlines",
          "Strategic hook ideas for each post",
          "Seasonal promotional tie-ins",
        ],
      },
      {
        name: "Feed Creative & Carousels",
        description: "Conversion-engineered social graphics and multi-slide carousel infographics.",
        scope: "Ready-to-publish image decks and single feed posts.",
        features: [
          "High-contrast brand typography",
          "Scannable informative slides",
          "Consistent visual brand identity",
          "High-resolution platform exports",
        ],
      },
      {
        name: "Full Social Management",
        description: "Hands-off social execution covering strategy, creative design, reels, and monthly reviews.",
        scope: "Full-service monthly operational management.",
        priceDisplay: "Starting ₹14,999 / mo",
        features: [
          "Comprehensive monthly content planning",
          "Post designs, reels, and caption sets",
          "Strategic publishing guidance",
          "Monthly metric review and iteration",
        ],
      },
    ],
    packages: [
      {
        name: "Social Media Starter",
        price: 4999,
        priceType: "fixed",
        unit: "/ month",
        description: "Consistent monthly social presence with professionally designed post creatives and captions.",
        features: [
          "12 high-quality post creatives",
          "Engaging captions with hashtags",
          "Monthly content calendar",
          "Brand-aligned visual design",
        ],
      },
      {
        name: "Social Media Growth",
        price: 9999,
        priceType: "fixed",
        unit: "/ month",
        description: "Strategic monthly growth package with high-frequency graphics, reel ideas, and performance review.",
        features: [
          "20 high-quality post creatives",
          "4 short-form reel concepts with hooks",
          "Strategic content calendar & planning",
          "Monthly performance review",
        ],
        recommended: true,
      },
      {
        name: "Social Media Management",
        price: 14999,
        priceType: "starting",
        unit: "/ month",
        description: "Full hands-off social media management covering strategy, creation, posting support, and reels.",
        features: [
          "Comprehensive monthly content strategy",
          "Complete post, carousel & reel assets",
          "Publishing calendar & schedule support",
          "Direct founder strategy check-in",
        ],
      },
    ],
    hasRealPricing: true,
    pricingNote: "Predictable monthly retainer pricing with zero long-term lock-in contracts.",
    faqs: [
      {
        question: "Do you also schedule and post the content?",
        answer: "We deliver full ready-to-publish asset packages (graphics, captions, hashtags) and can handle direct scheduling depending on the selected plan.",
      },
      {
        question: "Can we review and approve posts before they go live?",
        answer: "Yes, you receive the full monthly calendar and visual assets in advance for feedback and approval.",
      },
      {
        question: "How do you align with our brand identity?",
        answer: "We begin with a brand audit of your existing logo, colors, and tone, or establish a cohesive visual guidelines kit before designing.",
      },
    ],
  },
];

export function getAllStudioServices(): StudioService[] {
  return studioServices;
}

export function getStudioServiceBySlug(slug: string): StudioService | undefined {
  return studioServices.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
}
