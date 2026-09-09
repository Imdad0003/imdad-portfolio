"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  allServices,
  pricingCategories,
  formatPriceShort,
  ServiceItem,
} from "@/data/pricing";
import {
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Palette,
  Video,
  Globe,
  Share2,
  TrendingUp,
  Cpu,
  FileCheck,
} from "lucide-react";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ecommerce: ShoppingBag,
  creatives: Palette,
  video: Video,
  websites: Globe,
  social: Share2,
  marketing: TrendingUp,
  ai: Cpu,
  setup: FileCheck,
};

const categoryDescriptions: Record<string, string> = {
  ecommerce: "Marketplace listing creation, keyword indexing, catalog mapping, and competitor benchmarking.",
  creatives: "High-contrast hero images, feature callouts, dimensions, and conversion-engineered listing decks.",
  video: "Short-form vertical video demonstration reels and authentic creator-style hooks tested for high CTR.",
  websites: "Fast, mobile-optimized storefronts and corporate websites with seamless Razorpay payment integration.",
  social: "Consistent monthly organic content calendars, post graphics, and reel concepts for brand presence.",
  marketing: "Targeted Meta ad campaigns, pixel tracking, and creative split-testing built to maximize ROAS.",
  ai: "AI-accelerated photorealistic product background staging, video synthesis, and avatar pitches.",
  setup: "Operational documentation support and seller portal walkthroughs. Guidance only, not legal or CA tax representation.",
};

export default function ServicesPage() {
  const categories = pricingCategories.filter((c) => c.id !== "all");

  const handleGetStarted = (service: ServiceItem) => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: service.chatbotPrompt,
        },
      })
    );
  };

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Page Header */}
        <SectionHeading
          badgeText="Digital Capabilities"
          title="Digital Services Engineered For E-Commerce &amp; Growth"
          description="Every service is quoted transparently with clear deliverables and an active operator mindset."
          align="center"
        />

        {/* Category Jump Anchor Bar */}
        <div className="mt-8 flex justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar px-2 sm:px-0">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/80 border border-[#502D55]/10 backdrop-blur-xl shadow-xs min-w-max">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-3.5 py-1.5 min-h-[36px] inline-flex items-center rounded-full text-xs font-medium text-[#56475C] hover:text-[#180D1D] hover:bg-white transition-all whitespace-nowrap"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>

        {/* Categorized Service Sections */}
        <div className="mt-16 space-y-24">
          {categories.map((cat) => {
            const services = allServices.filter((s) => s.category === cat.id);
            const Icon = categoryIcons[cat.id] || Sparkles;

            return (
              <section key={cat.id} id={cat.id} className="scroll-mt-28">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#502D55]/10 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#180D1D] tracking-tight">
                        {cat.label}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#56475C]">
                        {categoryDescriptions[cat.id]}
                      </p>
                    </div>
                  </div>

                  {cat.id === "setup" && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[11px] text-[#7A3F26] font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#d97746]" />
                      <span>Process Guidance &amp; Documentation Only</span>
                    </div>
                  )}
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl p-5 sm:p-6 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
                    >
                      <div>
                        {/* Top: Name & Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                            {service.name}
                          </h3>
                          {service.badge && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF0F4] border border-[#d69fb5]/40 text-[#78284C] shrink-0">
                              {service.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#56475C] leading-relaxed">
                          {service.description}
                        </p>

                        {/* Price Display */}
                        <div className="mt-4 pt-4 border-t border-[#502D55]/08 flex items-baseline gap-1.5">
                          {service.priceType === "starting" && (
                            <span className="text-[10px] text-[#7A6880] uppercase font-mono">Starting</span>
                          )}
                          <span className="text-2xl font-black text-[#180D1D]">
                            {formatPriceShort(service)}
                          </span>
                          <span className="text-xs text-[#7A6880]">{service.unit}</span>
                        </div>

                        {/* Note disclaimer if applicable */}
                        {service.note && (
                          <div className="mt-2 text-[11px] text-[#935073] italic">
                            * {service.note}
                          </div>
                        )}

                        {/* Deliverables */}
                        <div className="mt-5 space-y-1.5">
                          <div className="text-[10px] font-mono uppercase text-[#7A6880] font-bold">
                            Deliverables:
                          </div>
                          <ul className="space-y-1.5">
                            {service.deliverables.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-[#56475C]"
                              >
                                <Check className="w-3.5 h-3.5 text-[#935073] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 pt-4 border-t border-[#502D55]/08">
                        <button
                          type="button"
                          onClick={() => handleGetStarted(service)}
                          className="w-full py-3 px-4 min-h-[44px] rounded-xl text-xs font-bold bg-white hover:bg-[#180D1D] hover:text-[#F8F4E9] text-[#180D1D] border border-[#502D55]/15 hover:border-[#180D1D] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <span>Get Started</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-16 sm:mt-24 rounded-3xl bg-white/80 border border-[#502D55]/10 p-6 sm:p-10 text-center backdrop-blur-xl max-w-3xl mx-auto shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">
            Looking for a custom package or specific scope?
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-[#56475C] leading-relaxed">
            Every business has different SKU volumes and creative requirements. Use our interactive pricing calculator or chat directly with the AI assistant.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] inline-flex items-center justify-center rounded-full text-xs font-bold bg-[#180D1D] text-[#F8F4E9] hover:bg-[#2B1435] transition-all shadow-sm"
            >
              View Pricing Calculator
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] inline-flex items-center justify-center rounded-full text-xs font-semibold text-[#180D1D] hover:bg-white bg-white/70 border border-[#502D55]/15 transition-all"
            >
              Contact Direct
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
