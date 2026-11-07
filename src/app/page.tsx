import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { getSiteContent } from "@/lib/cms";
import { Hero } from "@/components/sections/Hero";
import { HomePackagesSection } from "@/components/home/HomePackagesSection";
import { NewAppsSection } from "@/components/home/NewAppsSection";
import { StudioServicesSection } from "@/components/home/StudioServicesSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { StudioAboutSection } from "@/components/home/StudioAboutSection";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { AiAssistantCta } from "@/components/home/AiAssistantCta";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "IMDAD.BUILDS | Independent Digital Product Studio",
  description:
    "Welcome to Imdad.builds. Independent digital product studio building mobile apps, web applications, e-commerce systems, and high-retention creative media.",
  alternates: {
    canonical: siteConfig.siteUrl,
  },
};

export default async function Home() {
  const siteContent = await getSiteContent();

  const defaultOrder = [
    "hero",
    "packages",
    "apps",
    "services",
    "projects",
    "about",
    "reviews",
    "ai-assistant",
    "final-cta",
  ];
  const sectionOrder = siteContent.metadata?.sectionOrder || defaultOrder;
  const visibility = siteContent.metadata?.sectionVisibility || {};

  const renderSection = (id: string) => {
    if (visibility[id] === false) return null;
    switch (id) {
      case "hero":
        return <Hero key="hero" initialContent={siteContent.hero} />;
      case "packages":
        return <HomePackagesSection key="packages" />;
      case "apps":
        return <NewAppsSection key="apps" />;
      case "services":
        return <StudioServicesSection key="services" />;
      case "projects":
        return <FeaturedProjectsSection key="projects" />;
      case "about":
        return <StudioAboutSection key="about" initialContent={siteContent.about} />;
      case "reviews":
        return <ReviewsPreview key="reviews" />;
      case "ai-assistant":
        return <AiAssistantCta key="ai-assistant" />;
      case "final-cta":
        return <FinalCta key="final-cta" initialContent={siteContent.finalCta} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      {sectionOrder.map((sectionId) => renderSection(sectionId))}
    </main>
  );
}
