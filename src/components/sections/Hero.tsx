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
      className="relative min-h-[85vh] flex flex-col items-center justify-center pt-16 pb-16 lg:pt-24 lg:pb-24 overflow-hidden text-center"
    >
      <Container>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Identity Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-[#502D55]/12 text-xs text-[#56475C] mb-6 backdrop-blur-md shadow-xs transition-transform hover:scale-[1.02]">
            <span className="w-2 h-2 rounded-full bg-[#d97746] animate-pulse" />
            <span className="font-bold text-[#180D1D]">Founder of EasyXo</span>
            <span className="text-[#935073]">•</span>
            <span>Digital Solutions for Modern Businesses</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#180D1D] leading-[1.08]">
            I Build Digital Businesses That{" "}
            <span className="text-gradient-dusk font-black block sm:inline">
              Look Better, Sell Better.
            </span>
          </h1>

          {/* Short Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#56475C] max-w-2xl mx-auto leading-relaxed font-normal">
            E-commerce, product creatives, websites, content and digital solutions for modern businesses.
          </p>

          {/* Centered CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button href="/services" variant="primary" size="lg">
              View Services
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Start a Project
            </Button>
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/80 border border-[#502D55]/15 text-xs sm:text-sm font-semibold text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-all shadow-xs focus-ring"
              aria-label="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span>@imdad.builds</span>
            </a>
          </div>

          {/* Operator Mindset Strip */}
          <div className="mt-10 pt-6 border-t border-[#502D55]/10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#7A6880]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#935073]" />
              <div className="text-left">
                <span className="font-bold text-[#180D1D]">100% Real Experience</span>
                <span className="block text-[11px] text-[#7A6880]">Tested firsthand on EasyXo</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#502D55]/15" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d97746]" />
              <div className="text-left">
                <span className="font-bold text-[#180D1D]">Transparent Pricing</span>
                <span className="block text-[11px] text-[#7A6880]">Scope-based starting rates</span>
              </div>
            </div>
          </div>

          {/* Quick Disciplines Pill Dock */}
          <div className="mt-10 w-full max-w-3xl">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/70 border border-[#502D55]/08 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(80,45,85,0.05)] grid grid-cols-2 md:grid-cols-4 gap-2">
              <Link
                href="/services#ecommerce"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#935073] group-hover:scale-110 transition-transform" />
                <span className="truncate">Marketplaces</span>
              </Link>
              <Link
                href="/services#creatives"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97746] group-hover:scale-110 transition-transform" />
                <span className="truncate">7-Image Decks</span>
              </Link>
              <Link
                href="/services#websites"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#935073] group-hover:scale-110 transition-transform" />
                <span className="truncate">Online Stores</span>
              </Link>
              <Link
                href="/services#marketing"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#502D55]/06 hover:border-[#935073]/25 transition-all text-xs font-semibold text-[#180D1D] group shadow-2xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#d97746] group-hover:scale-110 transition-transform" />
                <span className="truncate">Growth &amp; UGC</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
