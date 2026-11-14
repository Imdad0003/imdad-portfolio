"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import type { SiteContentDocument } from "@/types/cms";
import { getSiteContent } from "@/lib/cms";
import { ArrowRight, Compass } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

interface FinalCtaProps {
  initialContent?: SiteContentDocument["finalCta"];
}

export function FinalCta({ initialContent }: FinalCtaProps) {
  const [ctaContent, setCtaContent] = useState<SiteContentDocument["finalCta"]>(
    initialContent || {
      eyebrow: "DIRECT FOUNDER COLLABORATION // Q2-Q3 2026",
      headline: "Have something worth building?",
      description:
        "Whether you are conceptualizing a new mobile app, need an e-commerce storefront, or want high-converting marketplace listing assets—let's turn it into a reality.",
      primaryCtaText: "Start a Project",
      secondaryCtaText: "Explore the Studio",
    }
  );

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.finalCta) {
          setCtaContent(content.finalCta);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        <div className="rounded-3xl bg-gradient-to-b from-white via-sky-50/20 to-blue-50/20 border border-slate-200 p-8 sm:p-16 text-center backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(10,25,47,0.08)] max-w-4xl mx-auto relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono text-[#0284C7] font-bold mb-4 shadow-2xs uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {ctaContent.eyebrow}
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0A192F] tracking-tight leading-[1.1]">
            {ctaContent.headline}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {ctaContent.description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={ctaContent.primaryCtaLink || "/contact"}
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md transition-all flex items-center justify-center gap-2 focus-ring active:scale-95"
            >
              <span>{ctaContent.primaryCtaText || "Start a Project"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ctaContent.secondaryCtaLink || "/about"}
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-white text-[#0A192F] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 focus-ring shadow-2xs active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#0284C7]" />
              <span>{ctaContent.secondaryCtaText || "Explore the Studio"}</span>
            </Link>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-white text-[#0A192F] border border-slate-200 hover:border-slate-300 hover:text-[#0284C7] transition-all flex items-center justify-center gap-2 focus-ring shadow-2xs active:scale-95"
              aria-label="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#0284C7]" />
              <span>@imdad.builds</span>
            </a>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-200/80 text-[11px] font-mono text-slate-500">
            {ctaContent.footnote || "ESTIMATED TIMELINES: 3–14 DAYS • SCOPED FIXED RATES • ZERO RETAINER TRAPS"}
          </div>
        </div>
      </Container>
    </section>
  );
}
