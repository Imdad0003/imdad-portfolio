import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects & Case Studies | IMDAD.BUILDS Product Studio",
  description:
    "Explore case studies, commercial e-commerce builds, direct storefronts, and conversion-focused creative assets built by Imdad.builds.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 flex flex-col">{children}</div>;
}
