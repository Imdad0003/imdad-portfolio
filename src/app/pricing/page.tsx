import { Pricing } from "@/components/sections/Pricing";
import type { Metadata } from "next";

import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent starting rates and itemized deliverables for marketplace listings, product creatives, storefronts, and marketing retainers.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/pricing`,
  },
  openGraph: {
    title: "Pricing | Imdad Digital Studio",
    description:
      "Transparent starting rates and itemized deliverables for marketplace listings, product creatives, storefronts, and marketing retainers.",
    url: `${siteConfig.siteUrl}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <div className="py-4 sm:py-8">
      <Pricing />
    </div>
  );
}
