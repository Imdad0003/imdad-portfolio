export type PricingCategory =
  | "all"
  | "ecommerce"
  | "creatives"
  | "video"
  | "websites"
  | "social"
  | "marketing"
  | "ai"
  | "setup";

export type PriceType = "starting" | "fixed" | "range";

export interface ServiceItem {
  id: string;
  category: Exclude<PricingCategory, "all">;
  categoryLabel: string;
  name: string;
  description: string;
  price: number;
  priceMax?: number;
  priceType: PriceType;
  unit: string;
  deliverables: string[];
  badge?: "Recommended" | "Popular" | "Best Value" | null;
  recommended?: boolean;
  note?: string;
  chatbotPrompt: string;
}

export const pricingCategories: { id: PricingCategory; label: string }[] = [
  { id: "all", label: "All Services" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "creatives", label: "Product Creatives" },
  { id: "video", label: "Video & UGC" },
  { id: "websites", label: "Websites" },
  { id: "social", label: "Social Media" },
  { id: "marketing", label: "Digital Marketing" },
  { id: "ai", label: "AI Creative" },
  { id: "setup", label: "Business Setup" },
];

export const allServices: ServiceItem[] = [
  // ==========================================
  // 1. E-COMMERCE & MARKETPLACE SERVICES
  // ==========================================
  {
    id: "amazon-listing",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Amazon Listing",
    description: "Professional Amazon product listing creation, keyword indexing, and catalog upload.",
    price: 799,
    priceType: "starting",
    unit: "/ product",
    deliverables: [
      "SEO-friendly product title",
      "Key bullet points setup",
      "Backend search terms & keywords",
      "Basic catalog upload assistance",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Amazon Listing (Starting at ₹799 / product). Can you help me understand what's included and estimate my project?",
  },
  {
    id: "flipkart-listing",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Flipkart Listing",
    description: "Accurate Flipkart cataloging, mandatory attribute mapping, and search-optimized copy.",
    price: 699,
    priceType: "starting",
    unit: "/ product",
    deliverables: [
      "Flipkart Seller Hub cataloging",
      "Title & attribute specification mapping",
      "Search keyword enrichment",
      "Listing QC pass support",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Flipkart Listing (Starting at ₹699 / product). How does the cataloging process work?",
  },
  {
    id: "meesho-listing",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Meesho Listing",
    description: "Fast-track Meesho single and variation catalog uploads with proper category mapping.",
    price: 499,
    priceType: "starting",
    unit: "/ product",
    deliverables: [
      "Meesho supplier panel catalog upload",
      "Single and variation SKU setup",
      "Accurate category & tax code mapping",
      "Pricing and inventory configuration",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Meesho Listing (Starting at ₹499 / product). Can you help me list my products?",
  },
  {
    id: "multi-marketplace-listing",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Amazon + Flipkart + Meesho Listing",
    description: "Synchronized multi-channel product launch across India's top 3 online marketplaces.",
    price: 1999,
    priceType: "starting",
    unit: "/ product",
    deliverables: [
      "Unified catalog setup on Amazon, Flipkart & Meesho",
      "Cross-platform keyword SEO strategy",
      "Platform-specific attribute formatting",
      "Simultaneous marketplace launch readiness",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in the 3-in-1 Amazon + Flipkart + Meesho Listing package (Starting at ₹1,999 / product). Can we discuss launching my catalog?",
  },
  {
    id: "amazon-listing-pro",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Amazon Listing Pro",
    description: "Comprehensive end-to-end listing package engineered for high search rank and conversions.",
    price: 1999,
    priceType: "fixed",
    unit: "/ product",
    deliverables: [
      "SEO-friendly title",
      "Bullet points",
      "Product description",
      "Search keywords",
      "Basic competitor research",
      "Listing optimization",
    ],
    badge: "Recommended",
    recommended: true,
    chatbotPrompt:
      "I'm interested in the Recommended Amazon Listing Pro (₹1,999 / product). Can you explain how it will help my product rank and convert?",
  },
  {
    id: "product-research",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Product Research",
    description: "In-depth market demand, sales velocity, and niche profit feasibility analysis.",
    price: 999,
    priceType: "starting",
    unit: "/ project",
    deliverables: [
      "Market demand & estimated search volume",
      "Price elasticity & margin check",
      "Review sentiment & customer pain points",
      "Product differentiation suggestions",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Product Research (Starting at ₹999). What information do you need from me to evaluate a product niche?",
  },
  {
    id: "competitor-research",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Competitor Research",
    description: "Strategic breakdown of top competitor listings, pricing models, and keyword gaps.",
    price: 999,
    priceType: "starting",
    unit: "/ project",
    deliverables: [
      "Top 3–5 competitor listing benchmark",
      "Pricing and discount comparison",
      "Keyword positioning & gap analysis",
      "Creative & infographic strengths/weaknesses",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Competitor Research (Starting at ₹999). How do you benchmark top competitors in my category?",
  },
  {
    id: "listing-optimization",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    name: "Listing Optimization",
    description: "Audit and overhaul existing underperforming listings to boost click-through and sales.",
    price: 999,
    priceType: "starting",
    unit: "/ product",
    deliverables: [
      "Comprehensive listing audit",
      "Fresh keyword indexing & title rework",
      "Persuasive bullet point rewrite",
      "Conversion & CTR enhancement recommendations",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Listing Optimization (Starting at ₹999 / product). Can you help me improve my existing product listing?",
  },

  // ==========================================
  // 2. PRODUCT IMAGES & CREATIVES
  // ==========================================
  {
    id: "creative-1-image",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Product Creative — 1 Image",
    description: "Single high-contrast hero image or dedicated feature visual formatted to marketplace specs.",
    price: 149,
    priceType: "fixed",
    unit: "1 image",
    deliverables: [
      "1 high-resolution product image",
      "Clean white or custom colored background",
      "High-clarity color correction",
      "Marketplace compliant resolution",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Product Creative — 1 Image (₹149). What product photos should I provide?",
  },
  {
    id: "creative-5-images",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Product Creative — 5 Images",
    description: "Focused set featuring a hero image, key feature callouts, and dimension breakdowns.",
    price: 599,
    priceType: "fixed",
    unit: "5 images",
    deliverables: [
      "5 custom listing images",
      "Hero image with high visual punch",
      "Feature callout diagrams",
      "Product dimension breakdown",
      "Basic lifestyle scene",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Product Creative — 5 Images (₹599). How do we get started on this package?",
  },
  {
    id: "creative-7-images",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Product Creative — 7 Images",
    description: "Complete full listing stack engineered to answer every buyer question and maximize conversions.",
    price: 799,
    priceType: "fixed",
    unit: "7 images",
    deliverables: [
      "High-contrast main hero image",
      "Key benefits & feature callouts",
      "Exact dimensions & specification graphic",
      "Lifestyle / in-use contextual scene",
      "Materials & quality close-up graphic",
      "How-to-use / care instructions guide",
      "Trust / why choose us comparison card",
    ],
    badge: "Popular",
    recommended: true,
    chatbotPrompt:
      "I'm interested in the Popular Product Creative — 7 Images deck (₹799). Can you explain how this deck is structured for conversions?",
  },
  {
    id: "creative-10-images",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Product Creative — 10 Images",
    description: "Comprehensive maximum-impact creative set covering every conceivable customer detail.",
    price: 999,
    priceType: "fixed",
    unit: "10 images",
    deliverables: [
      "Complete 10-image high-converting deck",
      "Multiple product angles & packaging shots",
      "Macro detail zooms & material highlights",
      "Dual lifestyle / situational contexts",
      "Complete infographics & sizing charts",
      "Ready for Amazon, Flipkart & direct storefronts",
    ],
    badge: "Best Value",
    recommended: true,
    chatbotPrompt:
      "I'm interested in the Best Value Product Creative — 10 Images deck (₹999). How does your design process work?",
  },
  {
    id: "premium-creative-7-images",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Premium Product Creative — 7 Images",
    description: "Next-tier bespoke visual styling with cinematic scene staging and custom brand graphics.",
    price: 1499,
    priceType: "fixed",
    unit: "7 images",
    deliverables: [
      "7 ultra-high-definition creative graphics",
      "Advanced 3D / AI realistic scene staging",
      "Premium typography & custom brand color grading",
      "Multi-variation formatting support",
      "High-converting commercial grade finish",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Premium Product Creative — 7 Images (₹1,499). What makes the premium staging different?",
  },
  {
    id: "premium-creative-10-images",
    category: "creatives",
    categoryLabel: "Product Creatives",
    name: "Premium Product Creative — 10 Images",
    description: "The ultimate commercial creative portfolio for serious e-commerce brands and D2C storefronts.",
    price: 1999,
    priceType: "fixed",
    unit: "10 images",
    deliverables: [
      "10 commercial-grade high-end visuals",
      "Bespoke realistic staged environments",
      "Detailed graphic callouts & macro zooms",
      "Optimized for listing slots + social media campaigns",
      "Full commercial usage rights",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Premium Product Creative — 10 Images (₹1,999). Can you help plan a premium deck for my brand?",
  },

  // ==========================================
  // 3. VIDEO & UGC ADS
  // ==========================================
  {
    id: "basic-product-video",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "Basic Product Video",
    description: "Clean demonstration video with fast-paced cuts and product highlight overlays.",
    price: 799,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "15–30s product showcase video",
      "Feature text callouts & clean cuts",
      "Upbeat royalty-free background track",
      "Vertical 9:16 mobile-optimized format",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Basic Product Video (Starting at ₹799). What kind of video footage do I need to supply?",
  },
  {
    id: "product-reel",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "Product Reel",
    description: "Engaging short-form reel built for Instagram, Facebook, and YouTube Shorts.",
    price: 999,
    priceType: "starting",
    unit: "/ reel",
    deliverables: [
      "High-energy hook in the first 3 seconds",
      "Trending audio selection & transitions",
      "Dynamic product demonstration",
      "Clear call-to-action overlay",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a Product Reel (Starting at ₹999). Can you help create a high-engagement reel for my product?",
  },
  {
    id: "ugc-style-ad",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "UGC-Style Ad",
    description: "Authentic, relatable creator-style video ad designed to drive high click-through rates.",
    price: 1499,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "Authentic customer-perspective format",
      "Problem → Solution → Result structure",
      "Unboxing & hands-on demonstration flow",
      "High-CTR captioning & visual styling",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a UGC-Style Ad (Starting at ₹1,499). How do you script and produce UGC ads?",
  },
  {
    id: "ai-ugc-ad",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "AI UGC Ad",
    description: "AI-generated avatar and voice presenter delivering a high-converting product sales pitch.",
    price: 1499,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "AI presenter / avatar demonstration",
      "Natural voiceover & scriptwriting",
      "Dynamic visual B-roll & overlays",
      "Multilingual / accent options available",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in an AI UGC Ad (Starting at ₹1,499). How do AI avatars work for e-commerce advertising?",
  },
  {
    id: "premium-ad-creative",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "Premium Ad Creative",
    description: "High-production ad asset combining motion design, kinetic type, and testing hooks.",
    price: 2499,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "Cinematic motion design & sound engineering",
      "Kinetic typography & graphic overlays",
      "Multiple hook variations planned for testing",
      "Ready for paid Meta / Instagram ad campaigns",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Premium Ad Creative (Starting at ₹2,499). How do we produce an ad built for Meta ad spend?",
  },
  {
    id: "3-ad-package",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "3 Ad Package",
    description: "Sprint package with 3 diverse video angles to split-test hooks and find winning ad creatives.",
    price: 3999,
    priceType: "fixed",
    unit: "3 ads",
    deliverables: [
      "3 distinct video ad creatives",
      "3 different opening hook angles",
      "Tailored for Feed & Stories / Reels",
      "Script & storyboard review included",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in the 3 Ad Package (₹3,999). What three creative angles do you recommend testing?",
  },
  {
    id: "5-ad-package",
    category: "video",
    categoryLabel: "Video & UGC",
    name: "5 Ad Package",
    description: "Full testing arsenal with 5 video variations for aggressive scaling on Meta and Instagram.",
    price: 5999,
    priceType: "fixed",
    unit: "5 ads",
    deliverables: [
      "5 complete video ad variations",
      "Mix of UGC, demonstration & kinetic styles",
      "Comprehensive hook & thumbnail testing suite",
      "Multi-ratio export (9:16 vertical & 1:1 square)",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in the 5 Ad Package (₹5,999). How quickly can we turn around these 5 creatives?",
  },

  // ==========================================
  // 4. WEBSITE DEVELOPMENT
  // ==========================================
  {
    id: "landing-page",
    category: "websites",
    categoryLabel: "Websites",
    name: "Landing Page",
    description: "High-converting single-page funnel designed to turn incoming traffic into paying customers.",
    price: 4999,
    priceType: "starting",
    unit: "/ page",
    deliverables: [
      "High-converting single page funnel",
      "Mobile-first responsive layout",
      "Lightning fast loading performance",
      "Direct WhatsApp / Inquiry form integration",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a Landing Page (Starting at ₹4,999). What details do you need to build my page?",
  },
  {
    id: "business-website",
    category: "websites",
    categoryLabel: "Websites",
    name: "Business Website",
    description: "Multi-page corporate website to establish authority, present services, and capture inquiries.",
    price: 9999,
    priceType: "starting",
    unit: "/ website",
    deliverables: [
      "Multi-page architecture (Home, About, Services, Contact)",
      "Modern brand aesthetics & responsive design",
      "On-page technical SEO & metadata setup",
      "Inquiry routing to email & WhatsApp",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a Business Website (Starting at ₹9,999). Can you share the timeline and milestones?",
  },
  {
    id: "ecommerce-website",
    category: "websites",
    categoryLabel: "Websites",
    name: "E-commerce Website",
    description: "Full-fledged independent online storefront equipped with shopping cart and automated checkout.",
    price: 15999,
    priceType: "starting",
    unit: "/ website",
    deliverables: [
      "Complete online store setup & category architecture",
      "Seamless shopping cart & checkout experience",
      "Payment gateway & shipping integration",
      "Order management dashboard & customer notifications",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in an E-commerce Website (Starting at ₹15,999). Which platform would you recommend for my products?",
  },
  {
    id: "shopify-store",
    category: "websites",
    categoryLabel: "Websites",
    name: "Shopify Store",
    description: "Turnkey Shopify store setup with responsive themes, collections, and automated app workflows.",
    price: 12999,
    priceType: "starting",
    unit: "/ store",
    deliverables: [
      "Shopify theme installation & customization",
      "Product catalog & collection configuration",
      "Razorpay / Cashfree gateway connection",
      "Essential e-commerce apps & currency settings",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a Shopify Store (Starting at ₹12,999). Can you build and configure my Shopify store?",
  },
  {
    id: "wordpress-website",
    category: "websites",
    categoryLabel: "Websites",
    name: "WordPress Website",
    description: "Custom WordPress / Elementor website offering total layout flexibility and zero monthly builder fees.",
    price: 9999,
    priceType: "starting",
    unit: "/ website",
    deliverables: [
      "Custom WordPress / Elementor design",
      "Blog & content publishing system",
      "Performance caching & security setup",
      "Client-friendly dashboard for easy updates",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in a WordPress Website (Starting at ₹9,999). How easy is it for me to update content later?",
  },
  {
    id: "payment-gateway-integration",
    category: "websites",
    categoryLabel: "Websites",
    name: "Payment Gateway Integration",
    description: "Seamless integration of Razorpay, Cashfree, or Stripe into your existing online store.",
    price: 1999,
    priceType: "starting",
    unit: "/ setup",
    deliverables: [
      "Razorpay / Cashfree / Stripe gateway hookup",
      "UPI, Card, and Net Banking payment support",
      "Automated webhooks & order status sync",
      "Thorough test-mode & live-mode verification",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in Payment Gateway Integration (Starting at ₹1,999). Can you connect Razorpay to my website?",
  },

  // ==========================================
  // 5. SOCIAL MEDIA SERVICES
  // ==========================================
  {
    id: "social-media-starter",
    category: "social",
    categoryLabel: "Social Media",
    name: "Social Media Starter",
    description: "Consistent monthly social presence with professionally designed post creatives and captions.",
    price: 4999,
    priceType: "fixed",
    unit: "/ month",
    deliverables: [
      "12 content creatives",
      "Captions included",
      "Basic content planning",
      "Content ideas & direction",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in the Social Media Starter plan (₹4,999 / month). How does the monthly content delivery work?",
  },
  {
    id: "social-media-growth",
    category: "social",
    categoryLabel: "Social Media",
    name: "Social Media Growth",
    description: "Strategic monthly growth package with high-frequency graphics, reel ideas, and performance review.",
    price: 9999,
    priceType: "fixed",
    unit: "/ month",
    deliverables: [
      "16–20 content creatives",
      "Content strategy & monthly calendar",
      "Captions & targeted hashtags",
      "Reel concepts & execution guidance",
      "Basic analytics review",
    ],
    badge: "Popular",
    recommended: true,
    chatbotPrompt:
      "I'm interested in the Popular Social Media Growth plan (₹9,999 / month). What makes this plan ideal for brand growth?",
  },
  {
    id: "social-media-management",
    category: "social",
    categoryLabel: "Social Media",
    name: "Social Media Management",
    description: "Full hands-off social media management covering strategy, creation, posting support, and reels.",
    price: 14999,
    priceType: "starting",
    unit: "/ month",
    deliverables: [
      "Comprehensive content planning",
      "End-to-end content creation (Posts + Reels)",
      "Posting support & scheduling",
      "Reels & video execution",
      "Captions & hashtag architecture",
      "Basic analytics & account management",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in full Social Media Management (Starting at ₹14,999 / month). Can you handle my social media accounts end-to-end?",
  },

  // ==========================================
  // 6. DIGITAL MARKETING
  // ==========================================
  {
    id: "meta-ads-setup",
    category: "marketing",
    categoryLabel: "Digital Marketing",
    name: "Meta Ads Setup",
    description: "Clean Meta Business Manager setup, Pixel conversion tracking, and campaign framework.",
    price: 2999,
    priceType: "starting",
    unit: "/ setup",
    deliverables: [
      "Meta Business Suite & Pixel integration",
      "Custom & Lookalike audience foundation",
      "Conversion event tracking setup",
      "Initial campaign structure & testing architecture",
    ],
    badge: null,
    recommended: false,
    note: "Ad spend is separate.",
    chatbotPrompt:
      "I'm interested in Meta Ads Setup (Starting at ₹2,999). Can you set up my Meta Pixel and ad account correctly?",
  },
  {
    id: "meta-ads-management",
    category: "marketing",
    categoryLabel: "Digital Marketing",
    name: "Meta Ads Management",
    description: "Ongoing campaign optimization, audience split-testing, and scaling to maximize ROAS.",
    price: 5999,
    priceType: "starting",
    unit: "/ month",
    deliverables: [
      "Ongoing campaign monitoring & optimization",
      "Budget reallocation & bid management",
      "Retargeting funnels for warm traffic",
      "Weekly performance summary & insights",
    ],
    badge: null,
    recommended: false,
    note: "Ad spend is separate.",
    chatbotPrompt:
      "I'm interested in Meta Ads Management (Starting at ₹5,999 / month). How do you monitor and scale campaigns?",
  },
  {
    id: "meta-ads-creative",
    category: "marketing",
    categoryLabel: "Digital Marketing",
    name: "Meta Ads + Creative",
    description: "Full-stack growth package uniting active campaign management with fresh high-converting ad assets.",
    price: 9999,
    priceType: "starting",
    unit: "/ month",
    deliverables: [
      "Full ongoing campaign management",
      "Fresh custom ad creatives included monthly",
      "Rigorous creative split testing (A/B testing)",
      "Weekly performance reports & strategy updates",
    ],
    badge: null,
    recommended: false,
    note: "Ad spend is separate.",
    chatbotPrompt:
      "I'm interested in Meta Ads + Creative (Starting at ₹9,999 / month). How many creative variations are tested monthly?",
  },

  // ==========================================
  // 7. AI CREATIVE SERVICES
  // ==========================================
  {
    id: "ai-product-image",
    category: "ai",
    categoryLabel: "AI Creative",
    name: "AI Product Image",
    description: "AI-accelerated product staging with realistic studio backgrounds, shadows, and reflections.",
    price: 299,
    priceMax: 499,
    priceType: "range",
    unit: "/ image",
    deliverables: [
      "Photorealistic AI background generation",
      "Accurate lighting, surface shadows & reflections",
      "High-resolution clean rendering",
      "Multiple aesthetic scene options",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in AI Product Image (₹299–₹499 / image). How do you stage my product with AI backgrounds?",
  },
  {
    id: "ai-product-video",
    category: "ai",
    categoryLabel: "AI Creative",
    name: "AI Product Video",
    description: "AI motion synthesis animating static product photos into captivating video clips.",
    price: 999,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "AI motion & camera panning simulation",
      "Dynamic background transition effects",
      "Sound design & background track sync",
      "Vertical 9:16 reel / ad format",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in AI Product Video (Starting at ₹999). Can you turn my product photos into an animated video?",
  },
  {
    id: "ai-ugc-ad-service",
    category: "ai",
    categoryLabel: "AI Creative",
    name: "AI UGC Ad",
    description: "AI avatar-driven product pitch with natural speech and dynamic b-roll graphics.",
    price: 1499,
    priceType: "starting",
    unit: "/ video",
    deliverables: [
      "Realistic AI spokesperson / avatar",
      "Persuasive e-commerce scriptwriting",
      "B-roll demonstration & product highlights",
      "Commercial usage rights included",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in an AI UGC Ad (Starting at ₹1,499). How does the AI spokesperson video work for my product?",
  },
  {
    id: "ai-creative-package",
    category: "ai",
    categoryLabel: "AI Creative",
    name: "AI Creative Package",
    description: "Comprehensive bundle combining AI staged imagery and video for rapid product testing.",
    price: 2999,
    priceType: "starting",
    unit: "/ package",
    deliverables: [
      "Bundle of AI staged product images + video",
      "Multiple environment explorations",
      "Upscaled high-definition deliverables",
      "Cross-platform ready assets (Listing + Ads)",
    ],
    badge: null,
    recommended: false,
    chatbotPrompt:
      "I'm interested in the AI Creative Package (Starting at ₹2,999). What is included in this bundle?",
  },

  // ==========================================
  // 8. BUSINESS SETUP ASSISTANCE
  // ==========================================
  {
    id: "gst-registration",
    category: "setup",
    categoryLabel: "Business Setup",
    name: "GST Registration Assistance",
    description: "Step-by-step documentation review and application support for e-commerce seller GST registration.",
    price: 499,
    priceType: "starting",
    unit: "/ assistance",
    deliverables: [
      "Documentation checklist & pre-submission review",
      "GST portal registration workflow guidance",
      "ARN tracking & clarification query support",
      "E-commerce seller account linking guidance",
    ],
    badge: null,
    recommended: false,
    note: "Government fees, professional fees and third-party charges, if applicable, are separate.",
    chatbotPrompt:
      "I'm interested in GST Registration Assistance (Starting at ₹499). What documents do I need to prepare?",
  },
  {
    id: "udyam-registration",
    category: "setup",
    categoryLabel: "Business Setup",
    name: "Udyam Registration Assistance",
    description: "MSME Udyam certificate registration assistance to unlock government benefits and credit lines.",
    price: 299,
    priceType: "starting",
    unit: "/ assistance",
    deliverables: [
      "MSME / Udyam classification check",
      "Government portal application walkthrough",
      "Certificate generation & download support",
      "Priority assistance for new online entrepreneurs",
    ],
    badge: null,
    recommended: false,
    note: "Government fees, professional fees and third-party charges, if applicable, are separate.",
    chatbotPrompt:
      "I'm interested in Udyam Registration Assistance (Starting at ₹299). How does the MSME certificate process work?",
  },
  {
    id: "trademark-application",
    category: "setup",
    categoryLabel: "Business Setup",
    name: "Trademark Application Assistance",
    description: "Guidance through public trademark registry search and application filing procedures.",
    price: 999,
    priceType: "starting",
    unit: "/ assistance",
    deliverables: [
      "IP India public trademark search guidance",
      "Class identification advice (Nice Classification)",
      "Application documentation support",
      "Brand registry readiness walkthrough",
    ],
    badge: null,
    recommended: false,
    note: "Government fees, professional fees and third-party charges, if applicable, are separate.",
    chatbotPrompt:
      "I'm interested in Trademark Application Assistance (Starting at ₹999). How do we conduct a brand search?",
  },
];

// Helper functions
export function formatPrice(service: ServiceItem): string {
  const formattedPrice = `₹${service.price.toLocaleString("en-IN")}`;

  if (service.priceType === "range" && service.priceMax) {
    const formattedMax = `₹${service.priceMax.toLocaleString("en-IN")}`;
    return `${formattedPrice}–${formattedMax} ${service.unit}`;
  }

  if (service.priceType === "starting") {
    return `Starting at ${formattedPrice} ${service.unit}`;
  }

  return `${formattedPrice} ${service.unit}`;
}

export function formatPriceShort(service: ServiceItem): string {
  if (service.priceType === "range" && service.priceMax) {
    return `₹${service.price.toLocaleString("en-IN")}–₹${service.priceMax.toLocaleString("en-IN")}`;
  }
  return `₹${service.price.toLocaleString("en-IN")}`;
}

export function getServiceById(id: string): ServiceItem | undefined {
  return allServices.find((s) => s.id === id);
}

export function getServicesByCategory(category: PricingCategory): ServiceItem[] {
  if (category === "all") {
    return allServices;
  }
  return allServices.filter((s) => s.category === category);
}

// Backwards compatibility alias for existing routes
export const servicePricingList = allServices;
