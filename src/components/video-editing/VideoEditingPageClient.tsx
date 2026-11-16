"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { VideoEditingContentDocument } from "@/types/video-editing";
import { VideoHeroSection } from "./VideoHeroSection";
import { VideoPortfolioGallery } from "./VideoPortfolioGallery";
import { VideoPricingSection } from "./VideoPricingSection";
import { VideoAboutSection } from "./VideoAboutSection";
import { VideoEditorsSection } from "./VideoEditorsSection";
import { ArrowRight, MessageCircle, Sparkles, Video } from "lucide-react";
import { getWhatsAppUrl } from "@/data/config";

interface VideoEditingPageClientProps {
  initialContent: VideoEditingContentDocument;
}

export function VideoEditingPageClient({ initialContent }: VideoEditingPageClientProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Breadcrumb Navigation */}
      <div className="pt-4 pb-2 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm">
        <Container>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              STUDIO
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-900 transition-colors">
              SERVICES
            </Link>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">04 VIDEO EDITING</span>
          </div>
        </Container>
      </div>

      {/* 1. HERO SECTION */}
      <VideoHeroSection content={initialContent.hero} />

      {/* 2. PORTFOLIO GALLERY */}
      <VideoPortfolioGallery
        samples={initialContent.samples}
        categories={initialContent.categories}
        watermark={initialContent.watermark}
      />

      {/* 3. ABOUT SECTION */}
      <VideoAboutSection content={initialContent.about} />

      {/* 4. OUR EDITORS SECTION */}
      <VideoEditorsSection editors={initialContent.editors} />

      {/* 5. PRICING SECTION */}
      <VideoPricingSection packages={initialContent.pricing} />

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <Container>
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#0F172A] to-[#1E293B] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl text-center md:text-left relative z-10">
              <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider block mb-2">
                HAVE RAW FOOTAGE READY?
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Send Us Your Raw Clips &amp; Get A Sample Edit.
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Connect directly on WhatsApp or send raw Google Drive/Dropbox links. We cut the first 15 seconds to demonstrate pacing before you commit to a full package.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
              <a
                href={getWhatsAppUrl("Hi Imdad! I have raw video footage and want to discuss a video editing project with your studio.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/contact?service=Video%20Editing"
                className="px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition-all text-center"
              >
                <span>Request Custom Quote</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
