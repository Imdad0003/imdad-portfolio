import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Work & Projects",
  description:
    "Case studies and real execution across e-commerce listings, conversion-focused product creatives, and digital storefront development.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/work`,
  },
  openGraph: {
    title: "Work & Projects | Imdad Digital Studio",
    description:
      "Case studies and real execution across e-commerce listings, conversion-focused product creatives, and digital storefront development.",
    url: `${siteConfig.siteUrl}/work`,
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
