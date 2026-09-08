"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Cpu,
  Video,
  Image as ImageIcon,
  Mic,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const aiCapabilities = [
  {
    id: "ai-images",
    icon: ImageIcon,
    title: "AI Product Imagery & Staging",
    tagline: "Realistic contextual environments without expensive studio sets",
    description:
      "Transforming raw isolated product cutouts into rich lifestyle scenes, textured background environments, and platform-compliant marketing creatives in minutes.",
    features: [
      "Photorealistic background replacement & ambient lighting match",
      "Multiple lifestyle scene variations for A/B testing",
      "High-resolution upscaling & noise elimination",
    ],
    highlight: "Visual Staging",
  },
  {
    id: "ai-video",
    icon: Video,
    title: "AI Product Video & Motion",
    tagline: "Engaging dynamic product motion from static assets",
    description:
      "Generating smooth camera swoops, product rotation simulations, and cinematic short-form video backgrounds that stop algorithmic feed scrolling.",
    features: [
      "Kinetic 9:16 vertical video generation for Reels & Shorts",
      "Dynamic camera perspective panning",
      "Multi-angle motion testing for ad hooks",
    ],
    highlight: "Motion Synthesis",
  },
  {
    id: "ai-ugc",
    icon: Sparkles,
    title: "AI-Assisted UGC Video Ads",
    tagline: "Rapid prototype user-generated ad content",
    description:
      "Developing native UGC-style social video ads, avatar demonstrations, and hook variations designed specifically for high-CTR Meta and Instagram campaigns.",
    features: [
      "Problem-agitation-solution vertical frameworks",
      "First 3-second hook split testing",
      "Automated kinetic subtitles and animated captions",
    ],
    highlight: "Ad Creative",
  },
  {
    id: "ai-voice",
    icon: Mic,
    title: "AI Voiceovers & Audio Narration",
    tagline: "Studio-clarity vocal delivery across multiple languages",
    description:
      "Producing crisp, natural-sounding voiceovers for product tutorials, promotional reels, and marketplace explainer videos with zero microphone echo.",
    features: [
      "Natural cadence, tone and inflection control",
      "Multilingual regional voice options (English, Hindi, etc.)",
      "Paced to match visual video cuts seamlessly",
    ],
    highlight: "Studio Narration",
  },
  {
    id: "ai-creative",
    icon: Cpu,
    title: "AI Creative Generation",
    tagline: "End-to-end concept exploration and asset iteration",
    description:
      "Rapidly prototyping dozens of packaging concepts, promotional banner layouts, and colorway themes before committing to final production files.",
    features: [
      "Fast concept variations for client sign-off",
      "Visual moodboards and creative direction boards",
      "Theme & holiday seasonal creative variants",
    ],
    highlight: "Rapid Prototyping",
  },
  {
    id: "ai-marketing",
    icon: TrendingUp,
    title: "AI Marketing & Copy Workflows",
    tagline: "High-intent buyer psychographic research & ad copy",
    description:
      "Extracting critical customer objection patterns from thousands of marketplace reviews, synthesizing competitor gaps, and formulating conversion copy.",
    features: [
      "Review mining & customer sentiment synthesis",
      "High-converting listing titles and bullet point drafts",
      "Direct response ad headline & caption matrices",
    ],
    highlight: "Intelligence Layer",
  },
];

export function AIShowcase() {
  const [selectedId, setSelectedId] = useState(aiCapabilities[0].id);
  const activeItem = aiCapabilities.find((item) => item.id === selectedId) || aiCapabilities[0];
  const ActiveIcon = activeItem.icon;

  return (
    <section
      id="ai-ecommerce"
      className="py-24 sm:py-32 border-b border-[#F6DBC0]/15 relative overflow-hidden bg-gradient-to-b from-[#130917] via-[#210c28] to-[#130917]"
    >
      {/* Futuristic Violet Dusk Radial Light Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-r from-[#502D55]/50 via-[#935073]/30 to-[#F6DBC0]/15 blur-[160px] pointer-events-none -z-10" />

      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <Badge variant="peach" size="md" className="mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-pulse shadow-[0_0_8px_#F6DBC0]" />
            Practical Generative Acceleration
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F8F4E9]">
            AI × E-commerce
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#d8cfc4] leading-relaxed">
            I don&apos;t use AI for abstract gimmicks. I deploy frontier generative
            models as a practical production and creative acceleration layer —
            multiplying asset variety, testing multiple ad angles, and compressing
            delivery times for your brand.
          </p>
        </div>

        {/* Futuristic Glass Architecture Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Navigation Pills (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {aiCapabilities.map((item) => {
              const Icon = item.icon;
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer focus-ring ${
                    isSelected
                      ? "bg-[rgba(80,45,85,0.7)] border-[#F6DBC0]/50 shadow-[0_10px_30px_-5px_rgba(147,80,115,0.4),inset_0_1px_0_0_rgba(248,244,233,0.25)] scale-[1.01]"
                      : "bg-[rgba(39,17,46,0.45)] border-[#F6DBC0]/10 hover:border-[#F6DBC0]/30 hover:bg-[rgba(56,24,66,0.55)] text-[#d8cfc4]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#F6DBC0] text-[#220d29]"
                          : "bg-[#502D55]/40 text-[#F6DBC0] border border-[#F6DBC0]/15"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#F8F4E9] tracking-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#bba89d] truncate max-w-[220px]">
                        {item.tagline}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                      isSelected
                        ? "bg-[#F8F4E9]/20 text-[#F8F4E9]"
                        : "bg-black/30 text-[#bba89d]"
                    }`}
                  >
                    {item.highlight}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Spotlight Detail Card (7 Cols) */}
          <div className="lg:col-span-7 flex">
            <div className="w-full rounded-2xl bg-gradient-to-br from-[rgba(56,24,66,0.7)] via-[rgba(43,20,53,0.65)] to-[rgba(80,45,85,0.5)] border border-[#F6DBC0]/25 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_25px_60px_-10px_rgba(10,3,14,0.8),inset_0_1px_0_0_rgba(248,244,233,0.2)] flex flex-col justify-between relative overflow-hidden group">
              {/* Decorative Liquid Glow in Card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F6DBC0]/10 blur-3xl rounded-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#F6DBC0]/15 mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#F6DBC0]/15 border border-[#F6DBC0]/30 flex items-center justify-center text-[#F6DBC0] shadow-[0_0_20px_rgba(246,219,192,0.25)]">
                      <ActiveIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0]">
                        AI Acceleration Layer
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-[#F8F4E9] tracking-tight">
                        {activeItem.title}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="peach" size="sm">
                    {activeItem.highlight}
                  </Badge>
                </div>

                <p className="text-base sm:text-lg font-medium text-[#F6DBC0] mb-3">
                  {activeItem.tagline}
                </p>

                <p className="text-sm text-[#d8cfc4] leading-relaxed mb-8">
                  {activeItem.description}
                </p>

                {/* Concrete Features */}
                <div className="space-y-3 pt-6 border-t border-[#F6DBC0]/15 mb-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#bba89d] block mb-2">
                    How This Delivers Practical Business Value:
                  </span>
                  {activeItem.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-xs sm:text-sm text-[#F8F4E9]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action in Card */}
              <div className="pt-6 border-t border-[#F6DBC0]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#bba89d]">
                  Integrated into all client creative &amp; listing packages
                </span>
                <Button href="#contact" variant="primary" size="md">
                  Leverage AI For Your Brand
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
