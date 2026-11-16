"use client";

import React from "react";
import { VideoPricingPackage } from "@/types/video-editing";
import { Check, ArrowRight, Sparkles, MessageCircle, Info } from "lucide-react";
import { getWhatsAppUrl } from "@/data/config";

interface VideoPricingSectionProps {
  packages: VideoPricingPackage[];
}

export function VideoPricingSection({ packages }: VideoPricingSectionProps) {
  const handleStartAiOrder = (pkg: VideoPricingPackage) => {
    // Determine default aspect ratio based on package type
    const defaultRatio = pkg.id === "youtube-longform" ? "16:9" : "9:16";
    const prompt = `I would like to order the ${pkg.name} package (Service ID: ${pkg.id}, Price: ₹${pkg.price.toLocaleString("en-IN")}). Approximate duration: ${pkg.videoDuration}, Preferred ratio: ${defaultRatio}. Please guide me through the order details and verification.`;

    // Dispatch custom event to trigger AI Chatbot Order Intake
    window.dispatchEvent(
      new CustomEvent("open-chat", {
        detail: {
          prompt,
          serviceId: pkg.id,
          serviceName: pkg.name,
          packagePrice: pkg.price,
          duration: pkg.videoDuration,
          aspectRatio: defaultRatio,
        },
      })
    );
  };
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT PACKAGES &amp; RATES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A192F] tracking-tight">
            Predictable Video Editing Packages
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Select a package matched to your content output. Every tier includes hook engineering, kinetic titles, and studio-grade sound mixing.
          </p>
        </div>

        {/* Demo Pricing Transparency Notice */}
        <div className="max-w-3xl mx-auto mb-12 p-3 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-center gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="leading-relaxed">
            <strong>Sample Pricing Notice:</strong> Displayed rates are demo estimates for portfolio presentation. Final production quotes are calculated based on raw footage volume, custom motion graphics, and delivery speed.
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-white border-2 border-[#0284C7] shadow-xl ring-4 ring-[#0284C7]/10"
                    : "bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Popular / Feature Pill */}
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs ${
                        isPopular
                          ? "bg-[#0284C7] text-white"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Tier Title & Description */}
                  <div className="border-b border-slate-100 pb-5 mb-5">
                    <span className="font-mono text-[10px] font-bold text-[#0284C7] uppercase tracking-wider block mb-1">
                      {pkg.tier}
                    </span>
                    <h3 className="text-xl font-black text-[#0A192F] mb-2">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#0A192F]">
                      {pkg.currency}{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{pkg.unit}</span>
                  </div>

                  {/* Technical Specifications Specs (Duration, Revisions, Turnaround) */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 text-xs text-slate-700 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-[11px]">Duration:</span>
                      <span className="font-bold text-[#0A192F]">{pkg.videoDuration}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-400 font-mono text-[11px]">Revisions:</span>
                      <span className="font-bold text-[#0A192F]">{pkg.revisions}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-400 font-mono text-[11px]">Turnaround:</span>
                      <span className="font-bold text-[#0284C7]">{pkg.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2.5 mb-8">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      INCLUDED DELIVERABLES:
                    </span>
                    {pkg.deliverables.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions: AI Order Collection System Integration + Direct WhatsApp */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartAiOrder(pkg)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isPopular
                        ? "bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md hover:shadow-lg"
                        : "bg-[#0A192F] hover:bg-[#1E293B] text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                    <span>Order via AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={getWhatsAppUrl(pkg.orderPrompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>Or Discuss on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
