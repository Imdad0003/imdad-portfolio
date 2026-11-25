import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import {
  getPublishedProjects,
  getPublishedServices,
  getSettings,
  getSiteContent,
} from "@/lib/cms";
import { buildThemeCssVariables } from "@/lib/theme";
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
import { CustomSectionBlock } from "@/components/home/CustomSectionBlock";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent().catch(() => null);
  const seo = siteContent?.metadata?.seo;
  return {
    title: seo?.title || "IMDAD.BUILDS | Digital Product Studio & Creative Services",
    description: seo?.description || siteConfig.subTagline,
    keywords: seo?.keywords,
    openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
    alternates: {
      canonical: siteConfig.siteUrl,
    },
  };
}

export default async function Home() {
  const [siteContent, settings, services, projects] = await Promise.all([
    getSiteContent(),
    getSettings(),
    getPublishedServices(),
    getPublishedProjects(),
  ]);

  const themeVars = buildThemeCssVariables(siteContent.themeSettings, settings);
  const defaultOrder = [
    "hero",
    "services",
    "projects",
    "overview",
    "process",
    "why-us",
    "team",
    "final-cta",
  ];
  const sectionOrder =
    siteContent.metadata?.sectionOrder && siteContent.metadata.sectionOrder.length > 0
      ? siteContent.metadata.sectionOrder
      : defaultOrder;
  const visibility = siteContent.metadata?.sectionVisibility || {};
  const customSections = siteContent.customSections || [];

  const renderSection = (key: string) => {
    const visible = visibility[key] ?? true;
    if (!visible) return null;

    if (key.startsWith("custom_")) {
      const custom = customSections.find((c) => c.id === key);
      if (!custom) return null;
      return <CustomSectionBlock key={key} section={custom} />;
    }

    switch (key) {
      case "hero":
        return <Hero key={key} initialContent={siteContent} />;
      case "services":
        return (
          <StudioServicesSection
            key={key}
            initialContent={siteContent}
            initialServices={services}
          />
        );
      case "projects":
        return (
          <FeaturedProjectsSection
            key={key}
            initialContent={siteContent}
            initialProjects={projects}
          />
        );
      case "overview":
        return <StudioOverview key={key} initialContent={siteContent} />;
      case "process":
        return <OurProcess key={key} initialContent={siteContent} />;
      case "why-us":
        return <WhyChooseUs key={key} initialContent={siteContent} />;
      case "team":
        return <TeamSection key={key} initialContent={siteContent} />;
      case "final-cta":
        return <FinalCta key={key} initialContent={siteContent} />;
      case "packages":
        return <HomePackagesSection key={key} />;
      case "apps":
        return <NewAppsSection key={key} initialContent={siteContent} />;
      case "about":
        return <StudioAboutSection key={key} initialContent={siteContent.about} />;
      case "reviews":
        return <ReviewsPreview key={key} />;
      case "ai-assistant":
        return <AiAssistantCta key={key} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={themeVars}
      className="bg-[var(--background,#FAF7F2)] text-[var(--ink-primary,#332924)]"
    >
      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
}
