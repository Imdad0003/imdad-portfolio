"use client";

import React, { useState, useEffect } from "react";
import { corePackages, CorePackage } from "@/data/pricing";
import { getPublishedPackages } from "@/lib/cms";
import Link from "next/link";
import { Check, Sparkles, Clock, ArrowRight, MessageSquare } from "lucide-react";

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE4] border border-[#EED3C5] text-[11px] font-mono text-[#B4583F] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#C96A50]" />
          <span>Most Requested Packages</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#332924] tracking-tight font-display">
          {title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#5F534D] leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          const isFeatured = pkg.badge === "Best Value" || pkg.popular;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                isFeatured
                  ? "bg-white border-2 border-[#C96A50]/50 shadow-[0_15px_40px_-10px_rgba(201,106,80,0.14)] hover:border-[#C96A50] hover:-translate-y-1"
                  : "bg-white/95 border border-[#E8DFD5] shadow-[0_8px_30px_-5px_rgba(51,41,36,0.04)] hover:border-[#D8A999] hover:bg-white hover:-translate-y-1"
              }`}
            >
              {/* Optional Top Tag */}
              {pkg.badge && (
                <div className="absolute -top-3 left-6">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                      pkg.badge === "Best Value"
                        ? "bg-[#C96A50] text-white"
                        : pkg.popular
                        ? "bg-[#332924] text-white"
                        : "bg-[#FAECE4] text-[#B4583F] border border-[#EED3C5]"
                    }`}
                  >
                    {pkg.highlight || pkg.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mt-1">
                  <h3 className="text-lg font-bold text-[#332924] tracking-tight font-display">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#5F534D] min-h-[32px] leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-[#E8DFD5]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#332924] tracking-tight font-display">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#8A7C75] font-medium">
                      / package
                    </span>
                  </div>

                  {/* Turnaround Badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] text-[#5F534D] font-mono">
                    <Clock className="w-3 h-3 text-[#C96A50]" />
                    <span>{pkg.turnaround}</span>
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A7C75] block">
                    Deliverables:
                  </span>
                  <ul className="space-y-2">
                    {pkg.deliverables.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-[#5F534D] leading-snug"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#FAECE4] border border-[#EED3C5] flex items-center justify-center shrink-0 mt-0.5 text-[#C96A50]">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order / Inquire Button */}
              <div className="mt-8 pt-4 border-t border-[#E8DFD5] flex items-center gap-2">
                <Link
                  href="/services/amazon-listing#packages"
                  className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs text-center ${
                    isFeatured
                      ? "bg-[#C96A50] hover:bg-[#B4583F] text-white active:scale-[0.98]"
                      : "bg-[#332924] hover:bg-[#4A3D36] text-white active:scale-[0.98]"
                  }`}
                >
                  <span>Explore &amp; Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg)}
                  className="p-3 rounded-full border border-[#E8DFD5] text-[#5F534D] hover:text-[#C96A50] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  title="Ask AI Assistant about this package"
                  aria-label="Ask AI Assistant about this package"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
