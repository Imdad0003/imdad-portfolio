import { ProcessStep } from "@/types";

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Understand",
    summary: "Understand the product, business model, and primary objective.",
    details: [
      "Analyze the product category, pricing model, target customer, and margins.",
      "Identify existing bottlenecks: low listing CTR, weak conversion, poor visual assets, or missing storefront.",
      "Review platform compliance standards for the chosen selling channels.",
    ],
  },
  {
    step: "02",
    title: "Plan",
    summary: "Build the right creative, listing, website, or marketing approach.",
    details: [
      "Map out the exact deliverable scope (e.g. 7-image deck, store structure, or keyword plan).",
      "Research top competitors and discover high-intent customer search patterns.",
      "Establish a clear visual direction, brand palette, and conversion messaging angles.",
    ],
  },
  {
    step: "03",
    title: "Create",
    summary: "Design, develop, and implement the required digital assets.",
    details: [
      "Draft optimized copy (titles, bullet points, meta tags, and hook scripts).",
      "Produce high-resolution infographic visuals, dimension charts, and lifestyle imagery.",
      "Develop responsive web interfaces, integrate payment gateways, or configure marketplace catalogs.",
    ],
  },
  {
    step: "04",
    title: "Deliver & Improve",
    summary: "Deliver ready-to-deploy assets and refine based on real feedback.",
    details: [
      "Hand over all finalized production files, organized by platform dimensions and specifications.",
      "Walk through implementation or assist with uploading directly to seller portals.",
      "Refine based on practical performance feedback and marketplace listing reviews.",
    ],
  },
];
