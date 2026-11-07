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
      ? "bg-sky-50 text-sky-800 border-sky-200 shadow-xs"
      : service.badge === "Popular"
      ? "bg-blue-50 text-blue-800 border-blue-200 shadow-xs"
      : "bg-white text-[#0A192F] border-slate-200 shadow-xs";

  return (
    <div
      className={`relative rounded-3xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 group ${
        isHighlighted
          ? "bg-gradient-to-b from-white via-sky-50/20 to-blue-50/20 border-2 border-sky-400/50 shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] hover:border-[#0284C7] hover:shadow-[0_25px_50px_-10px_rgba(2,132,199,0.18)] hover:-translate-y-1"
          : "bg-white/80 border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(10,25,47,0.04)] hover:border-sky-300/60 hover:bg-white hover:shadow-md hover:-translate-y-1"
      } backdrop-blur-2xl`}
    >
      {/* Subtle Glow highlight for featured cards */}
      {isHighlighted && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div>
        {/* Top Bar: Category Pill & Optional Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
            {service.categoryLabel}
          </span>

          {service.badge && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md ${badgeColorClass}`}
            >
              <Sparkles className="w-3 h-3 text-[#0284C7]" />
              {service.badge}
            </span>
          )}
        </div>

        {/* Service Title & Explanation */}
        <h3 className="text-xl font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors tracking-tight">
          {service.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-0 sm:min-h-[2.5rem]">
          {service.description}
        </p>

        {/* Pricing Display */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          {service.priceType === "starting" && (
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
              Starting at
            </div>
          )}

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
              {formatPriceShort(service)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              {service.unit}
            </span>
          </div>

          {/* Conditional Note / Disclaimer */}
          {service.note && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-1.5 text-[11px] text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-tight">{service.note}</span>
            </div>
          )}
        </div>

        {/* Deliverables List */}
        <div className="mt-6 space-y-2.5">
          <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-bold">
            Key Deliverables:
          </div>
          <ul className="space-y-2">
            {service.deliverables.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600"
              >
                <div className="w-4 h-4 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5 text-[#0284C7]">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Action CTA */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleGetStarted}
          className={`w-full py-3 px-4 min-h-[44px] rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs ${
            isHighlighted
              ? "bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold active:scale-[0.98] shadow-sm"
              : "bg-white text-[#0A192F] border border-slate-200 hover:border-[#0A192F] hover:bg-[#0A192F] hover:text-white active:scale-[0.98]"
          }`}
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
