import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { VideoEditingHeroContent } from "@/types/video-editing";
import { ArrowRight, Video, Play, Sparkles, ShieldCheck, Zap, Layers } from "lucide-react";

interface VideoHeroSectionProps {
  content: VideoEditingHeroContent;
}

export function VideoHeroSection({ content }: VideoHeroSectionProps) {
  return (
    <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-20 overflow-hidden">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0A192F_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-5 left-10 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <Container>
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Studio Monospace Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-600 mb-5 shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse shrink-0" />
            <span className="font-bold text-[#0A192F]">IMDAD.BUILDS</span>
            <span className="text-[#0284C7]">•</span>
            <span className="text-slate-500 uppercase">{content.eyebrow}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-[#0A192F] leading-[1.08] max-w-3xl">
            {content.headline}{" "}
            <span className="text-[#0284C7] inline-block">{content.highlightedText}</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
            {content.description}
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto">
            <Button
              href={content.primaryCtaLink}
              variant="primary"
              size="lg"
              className="justify-center min-h-[48px] font-bold shadow-xs px-8 bg-[#0284C7] hover:bg-[#0369A1] text-white"
            >
              <Play className="w-4 h-4 fill-white mr-2" />
              <span>{content.primaryCtaText}</span>
            </Button>
            <Button
              href={content.secondaryCtaLink}
              variant="secondary"
              size="lg"
              className="justify-center min-h-[48px] font-bold px-8 border-slate-200 text-[#0A192F] hover:bg-slate-50"
            >
              <span>{content.secondaryCtaText}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* Technical Proof Points Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200/90 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
            {content.stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs text-center flex flex-col justify-center"
              >
                <span className="font-mono text-2xl sm:text-3xl font-black text-[#0A192F]">
                  {stat.value}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  {stat.label}
                </span>
                {stat.sublabel && (
                  <span className="text-[11px] text-slate-400 mt-0.5 hidden sm:inline">
                    {stat.sublabel}
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
