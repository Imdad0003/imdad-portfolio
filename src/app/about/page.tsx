import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/config";
import {
  ShoppingBag,
  Sparkles,
  Globe,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export const metadata: Metadata = {
  title: "About | IMDAD.BUILDS Product Studio",
  description:
    "Learn about Imdad.builds, an independent digital product studio building mobile apps, web applications, e-commerce systems, and conversion-first media.",
  alternates: {
    canonical: `${siteConfig.siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <SectionHeading
          badgeText="Product Studio &amp; Builder"
          title="IMDAD.BUILDS — Digital Product Lab"
          description="A personal digital studio engineering mobile apps, web applications, e-commerce engines, and high-retention media."
          align="center"
          as="h1"
        />

        {/* Studio Identity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-12">
          {/* Left Column: Studio Emblem & Quick Meta (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#F6DBC0]/20 via-[#935073]/10 to-transparent rounded-3xl blur-2xl opacity-70 pointer-events-none" />

              <div className="relative rounded-3xl bg-white/90 border border-[#502D55]/12 p-6 sm:p-8 backdrop-blur-2xl text-center space-y-6 shadow-sm">
                {/* Studio Brand Mark */}
                <div className="w-28 h-28 mx-auto rounded-2xl bg-white border border-[#502D55]/10 flex items-center justify-center p-3.5 shadow-xs">
                  <Image
                    src="/imdad-logo.png"
                    alt="IMDAD.BUILDS Studio Emblem"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#180D1D]">IMDAD</h3>
                  <p className="text-xs text-[#935073] font-bold mt-1 font-mono tracking-wider uppercase">
                    Product Creator &bull; Studio Founder
                  </p>
                  <p className="text-[11px] text-[#7A6880] font-mono mt-0.5">
                    Founder of EasyXo &bull; BUILD • CREATE • SCALE
                  </p>
                </div>

                <div className="pt-4 border-t border-[#502D55]/08 flex items-center justify-center gap-3">
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-full bg-white border border-[#502D55]/15 text-xs font-semibold text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-colors shadow-2xs"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#935073]" />
                    <span>@imdad.builds</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] text-left text-xs space-y-1">
                  <span className="studio-tag text-[9px] text-[#7A3F26] font-bold block">STUDIO MOTTO</span>
                  <p className="text-[#180D1D] font-bold text-xs">
                    &quot;Powered by imdad.builds&quot;
                  </p>
                  <p className="text-[11px] text-[#56475C]">
                    Every product we incubate or build for clients carries the stamp of rigorous firsthand execution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Studio Manifesto & Direct Experience (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-sm text-[#56475C] leading-relaxed">
            <h3 className="text-2xl font-black text-[#180D1D] tracking-tight">
              A Studio Run By An Active Builder &amp; Operator.
            </h3>

            <p>
              Imdad.builds is not an agency of theories, presentations, and account managers. It is an independent digital product lab where software, mobile apps, digital storefronts, and conversion-engineered media are conceptualized and built directly by me.
            </p>

            <p>
              As the founder of <strong>EasyXo</strong>, I live inside real e-commerce operations every single day: marketplace indexing across Amazon, Flipkart, and Meesho, direct-to-consumer Razorpay payment flows, 9:16 vertical video ad hooks, and high-CTR visual listing assets. Everything built in this studio is grounded in what actually performs in the wild.
            </p>

            {/* Studio Disciplines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/85 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <Smartphone className="w-4 h-4 text-[#935073]" />
                  Mobile &amp; Web Apps
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Tactile, low-latency mobile apps (WishMusic, WishTracking) and progressive web tools with zero telemetry bloat.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/85 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <Globe className="w-4 h-4 text-[#d97746]" />
                  Websites &amp; Storefronts
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Lightning-fast Next.js business sites, landing funnels, and turnkey Shopify/SmartBiz digital stores.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/85 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <ShoppingBag className="w-4 h-4 text-[#935073]" />
                  E-Commerce Systems
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Marketplace cataloging (Amazon, Flipkart, Meesho), keyword indexing, and friction-free payment webhooks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/85 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <Sparkles className="w-4 h-4 text-[#d97746]" />
                  Video &amp; Product Creatives
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  High-retention Reels, Shorts, UGC-style video ads, and 7-card conversion-focused marketplace listing decks.
                </p>
              </div>
            </div>

            {/* Operating Principles */}
            <div className="pt-6 border-t border-[#502D55]/10 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D]">
                <ShieldCheck className="w-4 h-4 text-[#935073]" />
                Studio Principles
              </div>
              <ul className="space-y-2 text-xs text-[#56475C]">
                <li>&bull; <strong>Direct Builder Access:</strong> You talk directly with the engineer building your product.</li>
                <li>&bull; <strong>Transparent Fixed Scopes:</strong> Every package and timeline is stated clearly with no hidden fees.</li>
                <li>&bull; <strong>Ownership Guaranteed:</strong> 100% of the code, domain assets, and accounts belong to you upon handover.</li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button href="/apps" variant="primary" size="md" className="w-full sm:w-auto font-bold">
                Explore Studio Apps
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button href="/services" variant="secondary" size="md" className="w-full sm:w-auto font-semibold">
                View Services &amp; Rates
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
