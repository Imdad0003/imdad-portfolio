"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRight } from "lucide-react";
import type { SiteContentDocument } from "@/types/cms";
import { getSiteContent } from "@/lib/cms";

interface StudioAboutSectionProps {
  initialContent?: SiteContentDocument["about"];
}

export function StudioAboutSection({ initialContent }: StudioAboutSectionProps) {
  const [aboutContent, setAboutContent] = useState<SiteContentDocument["about"]>(
    initialContent || {
      eyebrow: "THE STUDIO MANIFESTO // INDEPENDENT OPERATOR",
      headline: "An independent studio built around tangible execution.",
      bio: "Imdad.builds was founded on a simple premise: modern businesses and creators don't need generic agency buzzwords or bloated retainers. They need fast, reliable digital products that actually convert and perform.",
      ethos: "Zero bloat. Fast iterations. Real products powered by imdad.builds.",
      location: "India • Global Distribution",
    }
  );

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.about) {
          setAboutContent(content.about);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="studio-about" className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Manifesto & Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono text-[#0284C7] shadow-2xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
              {aboutContent.eyebrow}
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
              {aboutContent.headline}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {aboutContent.bio}
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {aboutContent.ethos}
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0A192F] hover:text-[#0284C7] transition-colors group"
              >
                <span>READ THE FULL STUDIO MANIFESTO</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Operational Pillars (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="font-black text-base text-[#0A192F]">Real Products, Zero Fluff</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                We build working codebases, deployed mobile applications, and verified marketplace listings. No fake startup metrics or vanity presentations.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="font-black text-base text-[#0A192F]">Direct Founder Partnership</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                No middle managers or delegated offshore handoffs. You collaborate directly with the builder who architects, codes, and refines your solution.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="font-black text-base text-[#0A192F]">Conversion-First Engineering</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-11">
                Every layout, visual contrast choice, and micro-interaction is engineered to remove customer hesitation, speed up transactions, and maximize conversion rates.
              </p>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
