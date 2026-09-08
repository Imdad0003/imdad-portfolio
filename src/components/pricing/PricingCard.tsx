"use client";

import React from "react";
import { ServiceItem, formatPriceShort } from "@/data/pricing";
import { Check, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";

interface PricingCardProps {
  service: ServiceItem;
}

export function PricingCard({ service }: PricingCardProps) {
  const isHighlighted = Boolean(service.badge || service.recommended);

  const handleGetStarted = () => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: service.chatbotPrompt,
        },
      })
    );
  };

  const badgeColorClass =
    service.badge === "Recommended"
      ? "bg-[#FAF0F4] text-[#78284C] border-[#d69fb5]/50 shadow-xs"
      : service.badge === "Popular"
      ? "bg-[#FAF2EA] text-[#7A3F26] border-[#F6DBC0] shadow-xs"
      : "bg-white text-[#180D1D] border-[#502D55]/15 shadow-xs";

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group ${
        isHighlighted
          ? "bg-gradient-to-b from-white via-[#FDF9F5] to-[#FAF0F4] border-2 border-[#935073]/40 shadow-[0_20px_45px_-10px_rgba(147,80,115,0.1)] hover:border-[#935073]/60 hover:shadow-[0_25px_50px_-10px_rgba(147,80,115,0.16)] hover:-translate-y-1"
          : "bg-white/75 border border-[#502D55]/08 shadow-[0_10px_30px_-5px_rgba(80,45,85,0.04)] hover:border-[#935073]/30 hover:bg-white/95 hover:shadow-md hover:-translate-y-1"
      } backdrop-blur-2xl`}
    >
      {/* Subtle Glow highlight for featured cards */}
      {isHighlighted && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#935073]/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div>
        {/* Top Bar: Category Pill & Optional Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[#7A3F26] font-semibold">
            {service.categoryLabel}
          </span>

          {service.badge && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md ${badgeColorClass}`}
            >
              <Sparkles className="w-3 h-3 text-[#d97746]" />
              {service.badge}
            </span>
          )}
        </div>

        {/* Service Title & Explanation */}
        <h3 className="text-xl font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors tracking-tight">
          {service.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#56475C] leading-relaxed min-h-[2.5rem]">
          {service.description}
        </p>

        {/* Pricing Display */}
        <div className="mt-6 pt-5 border-t border-[#502D55]/08">
          {service.priceType === "starting" && (
            <div className="text-[11px] font-medium text-[#7A6880] uppercase tracking-wider font-mono">
              Starting at
            </div>
          )}

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-[#180D1D] tracking-tight">
              {formatPriceShort(service)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#7A6880]">
              {service.unit}
            </span>
          </div>

          {/* Conditional Note / Disclaimer */}
          {service.note && (
            <div className="mt-2.5 p-2 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-start gap-1.5 text-[11px] text-[#7A3F26]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#d97746] shrink-0 mt-0.5" />
              <span className="leading-tight">{service.note}</span>
            </div>
          )}
        </div>

        {/* Deliverables List */}
        <div className="mt-6 space-y-2.5">
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#7A6880] font-bold">
            Key Deliverables:
          </div>
          <ul className="space-y-2">
            {service.deliverables.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-[#56475C]"
              >
                <div className="w-4 h-4 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center shrink-0 mt-0.5 text-[#7A3F26]">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Action CTA */}
      <div className="mt-8 pt-4 border-t border-[#502D55]/08">
        <button
          type="button"
          onClick={handleGetStarted}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs ${
            isHighlighted
              ? "bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold active:scale-[0.98] shadow-sm"
              : "bg-white text-[#180D1D] border border-[#502D55]/15 hover:border-[#180D1D] hover:bg-[#180D1D] hover:text-[#F8F4E9] active:scale-[0.98]"
          }`}
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
