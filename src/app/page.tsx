import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { Hero } from "@/components/sections/Hero";
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

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* 1. Hero: Asymmetric Typography + Product Lab Preview */}
      <Hero />

      {/* 2. New Apps: WishMusic, WishTracking, EasyXo */}
      <NewAppsSection />

      {/* 3. Studio Services: 5 Core Disciplines */}
      <StudioServicesSection />

      {/* 4. Featured Projects / Proven Case Studies */}
      <FeaturedProjectsSection />

      {/* 5. Studio Manifesto & Builder Mindset */}
      <StudioAboutSection />

      {/* 6. Verified Client Reviews Preview (Preserved) */}
      <ReviewsPreview />

      {/* 7. AI Scoping Assistant Prompt (Preserved) */}
      <AiAssistantCta />

      {/* 8. Final Project Kickoff CTA */}
      <FinalCta />
    </main>
  );
}
