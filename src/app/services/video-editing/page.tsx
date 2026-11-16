import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { getVideoEditingContent } from "@/lib/video-editing-service";
import { VideoEditingPageClient } from "@/components/video-editing/VideoEditingPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Editing Studio (04) — Reels, YouTube & Cinematic Commercials | IMDAD.BUILDS",
  description:
    "High-retention short-form video editing, YouTube long-form essays, and commercial spots engineered with strong 3-second hooks and dynamic kinetic motion.",
  openGraph: {
    title: "Video Editing Studio (04) | IMDAD.BUILDS",
    description:
      "Explore watermarked portfolio samples across Reels, YouTube, Cinematic Ads, and Podcasts, plus transparent editing packages.",
    url: `${siteConfig.siteUrl}/services/video-editing`,
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/services/video-editing`,
  },
};

export default async function VideoEditingPage() {
  const content = await getVideoEditingContent();

  return <VideoEditingPageClient initialContent={content} />;
}
