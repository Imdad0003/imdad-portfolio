import type { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { Hero } from "@/components/sections/Hero";
import { SelectedServices } from "@/components/home/SelectedServices";
import { SelectedWork } from "@/components/home/SelectedWork";
import { WhyWorkWithMeHome } from "@/components/home/WhyWorkWithMeHome";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { AiAssistantCta } from "@/components/home/AiAssistantCta";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Imdad Digital Studio | E-commerce, Websites & Digital Solutions",
  description:
    "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
  alternates: {
    canonical: siteConfig.siteUrl,
  },
};

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* 1. Curated Studio Hero */}
      <Hero />

      {/* 2. Selected Services (4-6 core disciplines) */}
      <SelectedServices />

      {/* 3. Selected Work (3-4 strongest projects) */}
      <SelectedWork />

      {/* 4. Why Work With Me (4 concise operator points) */}
      <WhyWorkWithMeHome />

      {/* 5. Verified Reviews Preview */}
      <ReviewsPreview />

      {/* 6. AI Assistant Interactive Prompt */}
      <AiAssistantCta />

      {/* 7. Final Project Kickoff CTA */}
      <FinalCta />
    </main>
  );
}
