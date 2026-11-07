"use client";

import React, { useState, useEffect } from "react";
import { corePackages, CorePackage } from "@/data/pricing";
import { getPublishedPackages } from "@/lib/cms";
import { Check, Sparkles, Clock, ArrowRight } from "lucide-react";

interface CorePackagesSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CorePackagesSection({
  title = "Core Commercial Packages",
  subtitle = "Direct flat-rate packages for marketplace cataloging, listing creatives, and brand story design.",
  className = "",
}: CorePackagesSectionProps) {
  const [packages, setPackages] = useState<CorePackage[]>(corePackages);

  useEffect(() => {
    getPublishedPackages().then((docs) => {
      if (docs && docs.length > 0) {
        const commercialDocs = docs.filter(
          (d) =>
            d.websiteType === "Commercial Package" ||
            d.id.includes("amazon") ||
            d.id.includes("aplus") ||
            d.id.includes("listing")
        );
        const targetDocs = commercialDocs.length > 0 ? commercialDocs.slice(0, 4) : docs.slice(0, 4);
        const mapped: CorePackage[] = targetDocs.map((d) => ({
          id: d.id,
          name: d.name,
          tagline: d.description,
          price: d.price,
          badge: (d.badge as CorePackage["badge"]) || undefined,
          turnaround: d.unit || "24–48 Hours",
          deliverables: d.features,
          popular: d.recommended,
          chatbotPrompt: `Hi Imdad, I am interested in the ${d.name} (₹${d.price.toLocaleString("en-IN")}). What are the next steps to get started?`,
        }));
        setPackages(mapped);
      }
    }).catch(() => {
      // Fallback already in state
    });
  }, []);

  const handleSelectPackage = (pkg: CorePackage) => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: pkg.chatbotPrompt,
        },
      })
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-mono text-[#0284C7] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Most Requested Packages</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          const isFeatured = pkg.badge === "Best Value" || pkg.popular;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl ${
                isFeatured
                  ? "bg-white border-2 border-[#0284C7]/50 shadow-[0_15px_40px_-10px_rgba(2,132,199,0.15)] hover:border-[#0284C7] hover:-translate-y-1"
                  : "bg-white/85 border border-slate-200/80 shadow-[0_8px_30px_-5px_rgba(10,25,47,0.04)] hover:border-slate-300 hover:bg-white hover:-translate-y-1"
              }`}
            >
              {/* Optional Top Tag */}
              {pkg.badge && (
                <div className="absolute -top-3 left-6">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                      pkg.badge === "Best Value"
                        ? "bg-[#0284C7] text-white"
                        : pkg.popular
                        ? "bg-slate-900 text-white"
                        : "bg-sky-100 text-sky-900 border border-sky-200"
                    }`}
                  >
                    {pkg.highlight || pkg.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mt-1">
                  <h3 className="text-lg font-black text-[#0A192F] tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 min-h-[32px] leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#0A192F] tracking-tight">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / package
                    </span>
                  </div>

                  {/* Turnaround Badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 font-mono">
                    <Clock className="w-3 h-3 text-[#0284C7]" />
                    <span>{pkg.turnaround}</span>
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Deliverables:
                  </span>
                  <ul className="space-y-2">
                    {pkg.deliverables.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-600 leading-snug"
                      >
                        <div className="w-4 h-4 rounded-full bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0 mt-0.5 text-[#0284C7]">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order / Inquire Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs ${
                    isFeatured
                      ? "bg-[#0284C7] hover:bg-[#0369A1] text-white active:scale-[0.98]"
                      : "bg-[#0A192F] hover:bg-[#1E293B] text-white active:scale-[0.98]"
                  }`}
                >
                  <span>Select Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
