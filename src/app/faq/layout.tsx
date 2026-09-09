import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about services, turnaround times, payment milestones, revisions, and working with Imdad Digital Studio.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/faq`,
  },
  openGraph: {
    title: "FAQ | Imdad Digital Studio",
    description:
      "Answers to common questions about services, turnaround times, payment milestones, revisions, and working with Imdad Digital Studio.",
    url: `${siteConfig.siteUrl}/faq`,
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
