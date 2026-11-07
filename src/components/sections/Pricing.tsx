"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  pricingCategories,
  getServicesByCategory,
  PricingCategory,
} from "@/data/pricing";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";
import { CorePackagesSection } from "@/components/pricing/CorePackagesSection";
import { siteConfig } from "@/data/config";
import { Instagram } from "@/components/ui/InstagramIcon";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export function Pricing() {
  const [activeCategory, setActiveCategory] = useState<PricingCategory>("all");

  const filteredServices = getServicesByCategory(activeCategory);

  const handleOpenEstimate = () => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt:
            "Hi Imdad, I would like to get a project estimate for my business. Can you guide me through your services and pricing?",
        },
      })
    );
  };

  return (
    <section id="pricing" className="py-14 sm:py-24 relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl pointer-events-none" />

      <Container>
        {/* Section Heading */}
        <SectionHeading
          badgeText="Transparent Investment"
          title="Simple Pricing. Clear Deliverables."
          description="Direct flat-rate packages for commercial listings, product creatives, storefronts, and catalog scaling."
          align="center"
          as="h1"
        />

        {/* 1. Core Commercial Packages Showcase */}
        <div className="mt-12 sm:mt-16">
          <CorePackagesSection />
        </div>

        {/* Divider & Full Catalog Heading */}
        <div className="mt-20 pt-16 border-t border-slate-200/80 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight">
            Itemized Service Catalog
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Browse specialized deliverables across e-commerce, websites, video, and digital growth.
          </p>
        </div>

        {/* Horizontally Scrollable Category Filter Tabs */}
        <div className="mt-8 sm:mt-10 flex justify-start sm:justify-center overflow-x-auto pb-4 pt-1 scrollbar-none gap-2 no-scrollbar">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/85 border border-slate-200/80 backdrop-blur-xl shadow-xs min-w-max">
            {pricingCategories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap focus-ring ${
                    isActive
                      ? "bg-[#0A192F] text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-50"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredServices.map((service) => (
            <PricingCard key={service.id} service={service} />
          ))}
        </div>

        {/* Interactive "Build Your Package" Calculator */}
        <div className="mt-14 sm:mt-24">
          <PricingCalculator />
        </div>

        {/* Final Pricing Note & Dual Conversion Actions */}
        <div className="mt-14 sm:mt-20 rounded-3xl bg-white/90 border border-slate-200 p-6 sm:p-12 text-center backdrop-blur-2xl shadow-sm max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs text-[#0284C7] mb-4 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Honest &amp; Scope-Based</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
            Have a custom volume or multi-brand requirement?
          </h3>

          <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All prices shown are starting prices unless mentioned otherwise. Final pricing may vary depending on project scope, complexity and catalog variations.
            <br className="hidden sm:inline" />
            For custom requirements, talk to the AI assistant or reach out on Instagram for an immediate project quote.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleOpenEstimate}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Get a Project Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white text-[#0A192F] border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 focus-ring shadow-xs active:scale-[0.98]"
            >
              <Instagram className="w-4 h-4 text-[#0284C7]" />
              <span>Talk to Me on Instagram</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
