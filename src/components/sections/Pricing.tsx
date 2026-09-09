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
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#F6DBC0]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#935073]/10 rounded-full blur-3xl pointer-events-none" />

      <Container>
        {/* Section Heading */}
        <SectionHeading
          badgeText="Transparent Investment"
          title="Simple Pricing. Clear Deliverables."
          description="Choose the service you need. Every project is quoted transparently, with no unnecessary surprises."
          align="center"
          as="h1"
        />

        {/* Horizontally Scrollable Category Filter Tabs */}
        <div className="mt-8 sm:mt-12 flex justify-start sm:justify-center overflow-x-auto pb-4 pt-1 scrollbar-none gap-2 no-scrollbar">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/80 border border-[#502D55]/10 backdrop-blur-xl shadow-xs min-w-max">
            {pricingCategories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap focus-ring ${
                    isActive
                      ? "bg-[#180D1D] text-[#F8F4E9] font-bold shadow-xs"
                      : "text-[#56475C] hover:text-[#180D1D] hover:bg-white"
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
        <div className="mt-14 sm:mt-20 rounded-3xl bg-white/80 border border-[#502D55]/10 p-5 sm:p-12 text-center backdrop-blur-2xl shadow-sm max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-xs text-[#7A3F26] mb-4 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#d97746]" />
            <span>Honest &amp; Scope-Based</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
            Have a custom volume or multi-brand requirement?
          </h3>

          <p className="mt-4 text-xs sm:text-sm text-[#56475C] max-w-2xl mx-auto leading-relaxed">
            All prices shown are starting prices unless mentioned otherwise. Final pricing may vary depending on project scope, complexity and requirements.
            <br className="hidden sm:inline" />
            For custom requirements, talk to the AI assistant and get a project estimate.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleOpenEstimate}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-[#F6DBC0]" />
              <span>Get a Project Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white/90 text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/40 hover:bg-white hover:text-[#935073] transition-all flex items-center justify-center gap-2 focus-ring shadow-xs active:scale-[0.98]"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span>Talk to Me on Instagram</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
