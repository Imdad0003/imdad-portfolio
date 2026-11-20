import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { getSiteContent } from "@/lib/cms";
import { Hero } from "@/components/sections/Hero";
import { StudioOverview } from "@/components/home/StudioOverview";
import { StudioServicesSection } from "@/components/home/StudioServicesSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TeamSection } from "@/components/home/TeamSection";
import { OurProcess } from "@/components/home/OurProcess";
import { FinalCta } from "@/components/home/FinalCta";
import { HomePackagesSection } from "@/components/home/HomePackagesSection";
import { NewAppsSection } from "@/components/home/NewAppsSection";
import { StudioAboutSection } from "@/components/home/StudioAboutSection";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { AiAssistantCta } from "@/components/home/AiAssistantCta";

export const metadata: Metadata = {
  title: "IMDAD.BUILDS | Creative & Tech Studio",
  description:
    "We Build Ideas Into Digital Experiences. Creative solutions, smart technology, and professional services to help businesses grow.",
  alternates: {
    canonical: siteConfig.siteUrl,
  },
};

export default async function Home() {
  const siteContent = await getSiteContent();

  // Primary Redesigned Homepage Structure in Exact Specified Order:
  // 1. Hero Section
  // 2. Introduction / Studio Overview
  // 3. Services Section
  // 4. Featured Projects
  // 5. Why Choose Us
  // 6. Team Section
  // 7. Our Process
  // 8. Contact CTA
  const redesignedOrder = [
    "hero",
    "overview",
    "services",
    "projects",
    "why-us",
    "team",
    "process",
    "final-cta",
  ];

  // Merge CMS sectionOrder with redesigned structure to ensure all new sections are present
  const cmsOrder = siteContent.metadata?.sectionOrder || [];
  const hasRedesignedKeys = cmsOrder.some((k) =>
    ["overview", "why-us", "team", "process"].includes(k)
  );

  const sectionOrder = hasRedesignedKeys ? cmsOrder : redesignedOrder;
  const visibility = siteContent.metadata?.sectionVisibility || {};

  const renderSection = (id: string) => {
    if (visibility[id] === false) return null;

    switch (id) {
      case "hero":
        return <Hero key="hero" initialContent={siteContent.hero} />;
      case "overview":
        return <StudioOverview key="overview" />;
      case "services":
        return <StudioServicesSection key="services" initialContent={siteContent.servicesSection} />;
      case "projects":
        return <FeaturedProjectsSection key="projects" initialContent={siteContent.projectsSection} />;
      case "why-us":
        return <WhyChooseUs key="why-us" />;
      case "team":
        return <TeamSection key="team" />;
      case "process":
        return <OurProcess key="process" />;
      case "final-cta":
      case "contact-cta":
        return <FinalCta key="final-cta" initialContent={siteContent.finalCta} />;

      // Optional/legacy CMS sections
      case "about":
        // If about is in CMS order but overview is not, render StudioOverview
        return !sectionOrder.includes("overview") ? (
          <StudioOverview key="about" />
        ) : (
          <StudioAboutSection key="about" initialContent={siteContent.about} />
        );
      case "apps":
        return <NewAppsSection key="apps" initialContent={siteContent.appsSection} />;
      case "packages":
        return <HomePackagesSection key="packages" />;
      case "reviews":
        return <ReviewsPreview key="reviews" />;
      case "ai-assistant":
        return <AiAssistantCta key="ai-assistant" />;
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
