import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Digital Services",
  description:
    "Explore specialized digital capabilities: marketplace listings for Amazon & Flipkart, product creatives, Shopify storefronts, UGC ads, and e-commerce consulting.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/services`,
  },
  openGraph: {
    title: "Digital Services | Imdad Digital Studio",
    description:
      "Specialized e-commerce capabilities: marketplace listing optimization, conversion-engineered creatives, mobile-first storefronts, and performance marketing.",
    url: `${siteConfig.siteUrl}/services`,
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
