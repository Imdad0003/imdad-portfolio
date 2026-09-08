import { CaseStudyMetric } from "@/types";

export interface CaseStudyPillar {
  title: string;
  badge: string;
  description: string;
  points: string[];
}

export const easyXoCaseStudy = {
  title: "Building EasyXo",
  subtitle: "Founder Case Study • Real Business Execution",
  role: "Founder & Sole Owner",
  brandType: "E-Commerce Brand",
  coreSummary:
    "EasyXo is my own e-commerce brand. Rather than just offering marketing or creative theory to clients, I built EasyXo from the ground up — handling product positioning, multi-channel marketplace cataloging, direct online storefront infrastructure, packaging, visual creatives, and marketing operations firsthand.",
  challenge: {
    title: "The Challenge",
    description:
      "Launching an independent e-commerce brand in crowded Indian marketplace environments requires standing out against aggressive competitors, navigating complex platform listing guidelines, building trust with skeptical online buyers, and maintaining tight control over unit economics.",
  },
  strategy: {
    title: "The Strategy",
    description:
      "Focus on conversion-engineered presentation and multi-channel resilience. By pairing clean visual branding with compliance-first marketplace listings, clear customer-centric infographics, and a dedicated direct-to-consumer storefront, the brand creates multiple discovery paths without relying on a single channel.",
  },
  pillars: [
    {
      title: "Marketplace Operations",
      badge: "Multi-Channel",
      description:
        "Structured setup on leading Indian marketplace channels including Amazon, Flipkart, and Meesho with complete compliance, verified seller documentation, and optimized catalog categories.",
      points: [
        "Structured seller account profiles & pickup logistics",
        "Category node selection and attribute mapping",
        "Backend keywords & indexing architecture",
      ],
    },
    {
      title: "Direct Digital Storefront",
      badge: "Commerce Hub",
      description:
        "Constructed an independent, mobile-first brand web store to establish direct customer relationships, custom brand storytelling, and friction-free payment settlement.",
      points: [
        "Responsive, mobile-first checkout navigation",
        "Secure payment gateway integration via Razorpay",
        "Automated customer notifications & dispatch workflows",
      ],
    },
    {
      title: "Product Listing & SEO",
      badge: "Search & Visibility",
      description:
        "Engineered customer-facing product titles, scannable feature bullets, and keyword-rich descriptions tailored for search algorithms and real human buyers.",
      points: [
        "Competitor gap research & keyword discovery",
        "Clear benefit-first bullet point hierarchy",
        "Clear pricing & margin calculations per platform",
      ],
    },
    {
      title: "Product Creatives & Infographics",
      badge: "Conversion Assets",
      description:
        "Designed comprehensive 7-image listing sets, addressing visual scale, durability, materials, and usage clarity directly in the image gallery.",
      points: [
        "High-contrast main hero shots adhering to platform rules",
        "Technical dimension and scale comparison graphics",
        "Contextual lifestyle scenes and benefit callouts",
      ],
    },
    {
      title: "Branding & Packaging",
      badge: "Brand Trust",
      description:
        "Developed a cohesive visual mark, customer unboxing cards, product labeling, and packaging standards that reinforce quality at the moment of delivery.",
      points: [
        "Modern brand identity and color language",
        "Statutory packaging information compliance",
        "Post-delivery customer care & review prompt inserts",
      ],
    },
    {
      title: "Marketing & Growth Workflows",
      badge: "Acquisition",
      description:
        "Tested multi-hook short-form video creatives and Meta advertising angles, utilizing rapid AI-assisted workflows to prototype ad concepts quickly.",
      points: [
        "Hook-first short-form video demonstration concepts",
        "Meta ad creative testing frameworks",
        "Generative AI asset prototyping for faster iteration",
      ],
    },
  ] as CaseStudyPillar[],
  metrics: [
    {
      label: "Brand Channel Scope",
      value: "Amazon • Flipkart • Meesho • Web",
      status: "active",
      note: "Multi-channel catalog presence",
    },
    {
      label: "Operational Scope",
      value: "100% In-House Execution",
      status: "active",
      note: "Cataloging, creatives, web & ops",
    },
    {
      label: "Catalog & Creative Assets",
      value: "Multi-Set Decks",
      status: "active",
      note: "Infographics, videos & listings",
    },
    {
      label: "Verified Sales & Revenue Milestones",
      value: "[Placeholder: Real Metrics To Be Added]",
      status: "placeholder",
      note: "Reserved for audited order volumes & performance data",
    },
  ] as CaseStudyMetric[],
  operatorTakeaway:
    "The biggest value I bring to other businesses isn't abstract advice. It's the practical, daily experience of running my own brand — understanding what actually moves the needle when a customer evaluates a product.",
};
