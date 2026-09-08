import { Hero } from "@/components/sections/Hero";
import { SelectedServices } from "@/components/home/SelectedServices";
import { SelectedWork } from "@/components/home/SelectedWork";
import { WhyWorkWithMeHome } from "@/components/home/WhyWorkWithMeHome";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { AiAssistantCta } from "@/components/home/AiAssistantCta";
import { FinalCta } from "@/components/home/FinalCta";

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
