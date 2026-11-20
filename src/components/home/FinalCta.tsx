"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import type { SiteContentDocument } from "@/types/cms";
import { getSiteContent } from "@/lib/cms";
import { ArrowRight, Video, MessageSquare, Mail } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

interface FinalCtaProps {
  initialContent?: SiteContentDocument["finalCta"];
}

export function FinalCta({ initialContent }: FinalCtaProps) {
  const [ctaContent, setCtaContent] = useState<SiteContentDocument["finalCta"]>(
    initialContent || {
      eyebrow: "COLLABORATE WITH IMDAD.BUILDS // OPEN FOR PROJECTS",
      headline: "Have an Idea? Let’s Make It Happen.",
      description:
        "Creative solutions, smart technology, and professional services to help businesses grow. Let's discuss your project goals and build something exceptional together.",
      primaryCtaText: "Start a Project",
      primaryCtaLink: "/contact",
      secondaryCtaText: "Order Video Editing",
      secondaryCtaLink: "/services/video-editing",
      badgeText: "STUDIO OPEN FOR PROJECTS",
      footnote: "ESTIMATED TIMELINES: 3–14 DAYS • SCOPED FIXED RATES • ZERO RETAINER TRAPS",
    }
  );

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.finalCta) {
          setCtaContent({
            ...content.finalCta,
            headline: content.finalCta.headline || "Have an Idea? Let’s Make It Happen.",
            primaryCtaText: content.finalCta.primaryCtaText || "Start a Project",
            primaryCtaLink: content.finalCta.primaryCtaLink || "/contact",
            secondaryCtaText: content.finalCta.secondaryCtaText || "Order Video Editing",
            secondaryCtaLink: content.finalCta.secondaryCtaLink || "/services/video-editing",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="contact-cta" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-t border-slate-200/80">
      <Container>
        <div className="rounded-3xl bg-white/85 border border-slate-200/90 backdrop-blur-2xl p-8 sm:p-14 lg:p-16 text-center shadow-[0_20px_50px_-10px_rgba(2,132,199,0.08)] max-w-4xl mx-auto relative overflow-hidden">
          {/* Subtle Ambient Ice Blue Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-sky-100/60 to-transparent blur-3xl pointer-events-none" />

          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] font-bold mb-5 shadow-2xs uppercase tracking-wider relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {ctaContent.eyebrow || "COLLABORATE WITH IMDAD.BUILDS // OPEN FOR PROJECTS"}
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0A192F] tracking-tight leading-[1.1] relative z-10">
            {ctaContent.headline}
          </h2>

          {/* Supporting Copy */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed relative z-10">
            {ctaContent.description}
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 relative z-10">
            <Link
              href={ctaContent.primaryCtaLink || "/contact"}
              className="px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs transition-all flex items-center justify-center gap-2 focus-ring"
            >
              <span>{ctaContent.primaryCtaText || "Start a Project"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ctaContent.secondaryCtaLink || "/services/video-editing"}
              className="px-7 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-white text-[#0A192F] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 focus-ring shadow-2xs"
            >
              <Video className="w-4 h-4 text-[#0284C7]" />
              <span>{ctaContent.secondaryCtaText || "Order Video Editing"}</span>
            </Link>
          </div>

          {/* Direct Communication Channels Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 text-xs font-mono relative z-10">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0A192F] hover:border-[#0284C7]/40 transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>{siteConfig.contact.email}</span>
            </a>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0A192F] hover:border-emerald-500/40 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp Desk</span>
            </a>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0A192F] hover:border-[#0284C7]/40 transition-colors shadow-2xs"
            >
              <Instagram className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>@imdad.builds</span>
            </a>
          </div>

          <div className="mt-5 text-[10px] sm:text-[11px] font-mono text-slate-400 relative z-10">
            {ctaContent.footnote || "ESTIMATED TIMELINES: 3–14 DAYS • SCOPED FIXED RATES • ZERO RETAINER TRAPS"}
          </div>
        </div>
      </Container>
    </section>
  );
}
