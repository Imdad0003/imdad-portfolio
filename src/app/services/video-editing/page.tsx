import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/data/config";
import { getVideoEditingContent } from "@/lib/video-editing-service";
import { getFirestoreServiceBySlug } from "@/lib/cms";
import { VideoEditingPageClient } from "@/components/video-editing/VideoEditingPageClient";
import type { EditorProfile, VideoSampleItem, VideoPricingPackage } from "@/types/video-editing";

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
  const [baseContent, cmsService] = await Promise.all([
    getVideoEditingContent(),
    getFirestoreServiceBySlug("video-editing"),
  ]);

  const mergedContent = { ...baseContent };

  if (cmsService) {
    if (cmsService.shortDescription || cmsService.description || cmsService.tagline) {
      mergedContent.hero = {
        ...baseContent.hero,
        description: cmsService.shortDescription || baseContent.hero.description,
      };
      mergedContent.about = {
        ...baseContent.about,
        tagline: cmsService.tagline || baseContent.about.tagline,
        descriptionParagraphs: cmsService.description
          ? [cmsService.description]
          : baseContent.about.descriptionParagraphs,
      };
    }

    if (cmsService.teamMembers && cmsService.teamMembers.length > 0) {
      mergedContent.editors = cmsService.teamMembers.map((member): EditorProfile => ({
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatarUrl || "/imdad-logo.png",
        experienceYears: "Studio Team",
        specialization: member.specialties && member.specialties.length > 0 ? member.specialties : ["Video Editing"],
        software: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
        bio: member.bio || `${member.name} handles ${member.role} for video editing projects.`,
        verified: true,
        isDemo: false,
      }));
    }

    if (cmsService.demos && cmsService.demos.length > 0) {
      const mappedDemos: VideoSampleItem[] = cmsService.demos.map((demo, idx) => ({
        id: demo.id,
        title: demo.title,
        category:
          demo.category === "YouTube" ||
          demo.category === "Promotional" ||
          demo.category === "Cinematic" ||
          demo.category === "Podcast"
            ? demo.category
            : "Reels",
        description: demo.description,
        thumbnailUrl: demo.thumbnailUrl || (demo.mediaType === "image" ? demo.mediaUrl : "") || "/imdad-logo.png",
        videoPreviewUrl: demo.mediaType === "video" ? demo.mediaUrl : undefined,
        duration: "0:45",
        aspectRatio: "9:16",
        badge: demo.metricsLabel || demo.category || "Studio Demo",
        tags: [demo.category || "Video Demo"],
        sortOrder: idx,
        featured: true,
      }));
      mergedContent.samples = mappedDemos;
    }

    if (cmsService.pricing && cmsService.pricing.length > 0) {
      const mappedPricing: VideoPricingPackage[] = cmsService.pricing.map((tier, idx) => ({
        id: `cms-tier-${idx}`,
        name: tier.tierName,
        tier: tier.tierName,
        price: parseInt(tier.price.replace(/[^0-9]/g, ""), 10) || 999,
        currency: "₹",
        unit: tier.turnaround || "per video",
        description: tier.description,
        videoDuration: "Up to 60 Seconds",
        revisions: "2 Revision Rounds",
        turnaroundTime: tier.turnaround || "24–48 Hours",
        deliverables: tier.deliverables || [],
        popular: idx === 1,
        orderCtaText: `Order ${tier.tierName}`,
        orderPrompt: `Hi Imdad, I want to order ${tier.tierName} for Video Editing.`,
        isDummyPricing: false,
      }));
      mergedContent.pricing = mappedPricing;
    }
  }

  return <VideoEditingPageClient initialContent={mergedContent} />;
}
