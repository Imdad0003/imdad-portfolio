import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/config";
import {
  ShoppingBag,
  Sparkles,
  Globe,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <SectionHeading
          badgeText="About The Founder"
          title="Imdad — E-commerce Entrepreneur &amp; Digital Specialist"
          description="Building digital businesses that look better, convert higher, and operate smoothly."
          align="center"
        />

        {/* Founder Bio & Abstract Avatar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-12">
          {/* Left Column: Abstract Studio Identity Visual (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#F6DBC0]/20 via-[#935073]/10 to-transparent rounded-3xl blur-2xl opacity-70 pointer-events-none" />

              <div className="relative rounded-3xl bg-white/80 border border-[#502D55]/12 p-8 backdrop-blur-2xl text-center space-y-6 shadow-sm">
                {/* Studio Brand Mark */}
                <div className="w-28 h-28 mx-auto rounded-2xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center p-3.5 shadow-sm">
                  <Image
                    src="/imdad-logo.png"
                    alt="Imdad Digital Studio Emblem"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#180D1D]">Imdad</h3>
                  <p className="text-xs text-[#7A3F26] font-semibold mt-1">
                    Founder of EasyXo • Digital Specialist
                  </p>
                  <p className="text-[11px] text-[#7A6880] font-mono mt-0.5">
                    Build • Create • Scale
                  </p>
                </div>

                <div className="pt-4 border-t border-[#502D55]/08 flex items-center justify-center gap-3">
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#502D55]/15 text-xs text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-colors shadow-2xs"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#935073]" />
                    <span>@imdad.builds</span>
                  </a>
                </div>

                <div className="text-[10px] text-[#7A6880] italic">
                  * Official Imdad Digital Studio brand mark — zero stock photos or fake portraits.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Narrative & Experience (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-sm text-[#56475C] leading-relaxed">
            <h3 className="text-2xl font-bold text-[#180D1D] tracking-tight">
              An Active E-Commerce Operator, Not An Agency Theory.
            </h3>

            <p>
              I run and grow e-commerce ventures firsthand. As the founder of <strong>EasyXo</strong>, I navigate the exact same challenges every seller and brand faces: marketplace cataloging friction, listing indexation, creative CTR bottlenecks, ad spend efficiency, and payment operations.
            </p>

            <p>
              Rather than offering generic consulting advice, I bridge strategy and direct hands-on execution. Whether you need a 7-image conversion deck for Amazon, a turnkey Shopify storefront, or video ad creatives for Meta campaigns, every deliverable is built around what actually sells.
            </p>

            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/75 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <ShoppingBag className="w-4 h-4 text-[#935073]" />
                  Marketplace Specialist
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Amazon, Flipkart &amp; Meesho cataloging, attribute mapping, SEO titles, bullet points, and search terms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/75 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <Sparkles className="w-4 h-4 text-[#d97746]" />
                  Product Creatives
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  High-contrast hero shots, feature callouts, dimensions, and conversion-engineered 7 &amp; 10-image decks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/75 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <Globe className="w-4 h-4 text-[#935073]" />
                  Websites &amp; Stores
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Clean, fast D2C storefronts (Shopify, WordPress) integrated with Razorpay UPI and automated checkout.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/75 border border-[#502D55]/08 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D] mb-1">
                  <TrendingUp className="w-4 h-4 text-[#d97746]" />
                  Growth &amp; AI Tools
                </div>
                <p className="text-[11px] text-[#7A6880]">
                  Meta ad campaign structures, short-form video reels, and AI-accelerated product staging.
                </p>
              </div>
            </div>

            {/* Operating Principles */}
            <div className="pt-6 border-t border-[#502D55]/10 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-[#180D1D]">
                <ShieldCheck className="w-4 h-4 text-[#935073]" />
                How I Work With Clients
              </div>
              <ul className="space-y-2 text-xs text-[#56475C]">
                <li>• <strong>No Middlemen:</strong> You work directly with me from discovery to final delivery.</li>
                <li>• <strong>Transparent Rates:</strong> Clear, honest starting rates. Zero hidden agency markups.</li>
                <li>• <strong>Pragmatic Guidance:</strong> Business setup assistance is administrative documentation support only, never framed as legal/CA tax representation.</li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button href="/services" variant="primary" size="md">
                Explore Services
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button href="/contact" variant="secondary" size="md">
                Start a Conversation
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
