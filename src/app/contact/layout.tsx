import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Get in touch with Imdad to discuss your e-commerce project, marketplace listing optimization, storefront build, or creative campaign.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
  openGraph: {
    title: "Start a Project | Imdad Digital Studio",
    description:
      "Get in touch with Imdad to discuss your e-commerce project, marketplace listing optimization, storefront build, or creative campaign.",
    url: `${siteConfig.siteUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
