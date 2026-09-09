"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/config";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Globe,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[80vh] sm:min-h-[85vh] flex flex-col items-center justify-center pt-8 pb-12 sm:pt-16 sm:pb-24 overflow-hidden text-center"
    >
      <Container>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Identity Eyebrow Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/85 border border-[#502D55]/12 text-[11px] sm:text-xs text-[#56475C] mb-5 sm:mb-6 backdrop-blur-md shadow-xs max-w-full text-center">
            <span className="w-2 h-2 rounded-full bg-[#d97746] animate-pulse shrink-0" />
            <span className="font-bold text-[#180D1D]">Founder of EasyXo</span>
            <span className="text-[#935073] hidden sm:inline">•</span>
            <span className="whitespace-normal">Digital Solutions for Modern Businesses</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#180D1D] leading-[1.12] sm:leading-[1.08]">
            I Build Digital Businesses That{" "}
            <span className="text-gradient-dusk font-black block sm:inline">
              Look Better, Sell Better.
            </span>
          </h1>

          {/* Short Supporting Copy */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-[#56475C] max-w-2xl mx-auto leading-relaxed font-normal">
            E-commerce, product creatives, websites, content and digital solutions for modern businesses.
          </p>

          {/* Centered CTA Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
            <Button href="/services" variant="primary" size="lg" className="w-full sm:w-auto min-h-[48px]">
              View Services
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto min-h-[48px]">
              Start a Project
            </Button>
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-white/80 border border-[#502D55]/15 text-xs sm:text-sm font-semibold text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-all shadow-xs focus-ring"
              aria-label="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span>@imdad.builds</span>
            </a>
          </div>

          {/* Operator Mindset Strip */}
          <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#502D55]/10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs text-[#7A6880] w-full">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#935073] shrink-0" />
              <div className="text-left">
                <span className="font-bold text-[#180D1D]">100% Real Experience</span>
                <span className="block text-[11px] text-[#7A6880]">Tested firsthand on EasyXo</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#502D55]/15" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d97746] shrink-0" />
              <div className="text-left">
                <span className="font-bold text-[#180D1D]">Transparent Pricing</span>
                <span className="block text-[11px] text-[#7A6880]">Scope-based starting rates</span>
              </div>
            </div>
          </div>

          {/* Quick Disciplines Pill Dock */}
          <div className="mt-8 sm:mt-10 w-full max-w-3xl">
            <div className="p-1.5 sm:p-2.5 rounded-2xl bg-white/70 border border-[#502D55]/08 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(80,45,85,0.05)] grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              <Link
                href="/services#ecommerce"
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs min-h-[44px]"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#935073] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Marketplaces</span>
              </Link>
              <Link
                href="/services#creatives"
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97746] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">7-Image Decks</span>
              </Link>
              <Link
                href="/services#websites"
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs min-h-[44px]"
              >
                <Globe className="w-3.5 h-3.5 text-[#935073] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Online Stores</span>
              </Link>
              <Link
                href="/services#marketing"
                className="flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs min-h-[44px]"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#d97746] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Growth &amp; UGC</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
