import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Client Reviews",
  description:
    "Authentic feedback and verified reviews from founders, brands, and creators collaborating with Imdad Digital Studio.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/reviews`,
  },
  openGraph: {
    title: "Client Reviews | Imdad Digital Studio",
    description:
      "Authentic feedback and verified reviews from founders, brands, and creators collaborating with Imdad Digital Studio.",
    url: `${siteConfig.siteUrl}/reviews`,
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
