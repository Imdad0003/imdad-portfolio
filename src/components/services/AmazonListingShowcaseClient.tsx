"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AmazonListingSample,
  APlusModuleSample,
  AmazonPricingPackage,
  ListingImageItem,
} from "@/types/amazon-portfolio";
import { getWhatsAppUrl } from "@/data/config";
import {
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageCircle,
  ShoppingBag,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Clock,
  Eye,
  Sliders,
  Award,
  ExternalLink,
} from "lucide-react";

interface AmazonListingShowcaseClientProps {
  initialSamples: AmazonListingSample[];
  initialAPlusModules: APlusModuleSample[];
  initialPackages: AmazonPricingPackage[];
}

export function AmazonListingShowcaseClient({
  initialSamples,
  initialAPlusModules,
  initialPackages,
}: AmazonListingShowcaseClientProps) {
  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Per-sample active thumbnail state: { [sampleId]: imageIndex }
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  // Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    sample: AmazonListingSample;
    imageIndex: number;
  } | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialSamples.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [initialSamples]);

  // Filtered samples
  const filteredSamples = useMemo(() => {
    if (activeCategory === "All") return initialSamples;
    return initialSamples.filter((s) => s.category === activeCategory);
  }, [initialSamples, activeCategory]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxState) return;
      if (e.key === "Escape") {
        setLightboxState(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxState((prev) => {
          if (!prev) return null;
          const nextIdx =
            prev.imageIndex > 0 ? prev.imageIndex - 1 : prev.sample.images.length - 1;
          return { ...prev, imageIndex: nextIdx };
        });
      } else if (e.key === "ArrowRight") {
        setLightboxState((prev) => {
          if (!prev) return null;
          const nextIdx =
            prev.imageIndex < prev.sample.images.length - 1 ? prev.imageIndex + 1 : 0;
          return { ...prev, imageIndex: nextIdx };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxState]);

  const openLightbox = (sample: AmazonListingSample, index: number) => {
    setLightboxState({ sample, imageIndex: index });
  };

  const handleOpenChat = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: { prompt },
      })
    );
  };

  return (
    <div className="space-y-24">
      {/* =================================================================== */}
      {/* 1. TOP HALF: 10+ PRODUCT LISTING SAMPLE SETS (GALLERY & LIGHTBOX)    */}
      {/* =================================================================== */}
      <section id="listing-samples" className="space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-900 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>10+ HIGH-CONVERTING VARIATION SAMPLE SETS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
              Product Listing Creative Gallery
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Every deck is conversion-engineered to answer buyer doubts, showcase real dimensions, emphasize build materials, and pass Amazon Zoom &amp; A9 compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive 7–9 Image Stacks</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#0A192F] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
              {cat === "All" && ` (${initialSamples.length})`}
            </button>
          ))}
        </div>

        {/* Product Listing Sets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {filteredSamples.map((sample) => {
            const activeIdx = activeImageIndices[sample.id] || 0;
            const currentImg = sample.images[activeIdx] || sample.images[0];

            return (
              <div
                key={sample.id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-[#0284C7]/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7] uppercase">
                          {sample.category}
                        </span>
                        {sample.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                            ★ {sample.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-600 font-semibold">
                          {sample.images.length} Images in Deck
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors leading-snug">
                        {sample.title}
                      </h3>
                      <p className="text-[11px] font-mono text-[#0369A1] mt-0.5 font-bold">
                        Brand: {sample.brand}
                      </p>
                    </div>
                  </div>

                  {/* Main Active Preview Image Container */}
                  <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-b from-slate-50 to-white overflow-hidden p-4 sm:p-6 flex items-center justify-center border-b border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImg.url}
                      alt={currentImg.label}
                      className="max-h-full max-w-full object-contain rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    {/* Image Type Tag Overlay */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-mono text-white font-bold uppercase tracking-wider">
                      {currentImg.type} // {currentImg.label}
                    </div>

                    {/* Zoom / Lightbox Trigger Button */}
                    <button
                      type="button"
                      onClick={() => openLightbox(sample, activeIdx)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-md border border-slate-200 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
                      title="Inspect full-resolution image"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Full View</span>
                    </button>
                  </div>

                  {/* Interactive Thumbnail Carousel Strip (7–9 images) */}
                  <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold">
                      <span>Click image to switch view:</span>
                      <span className="text-[#0284C7] font-bold">
                        Slide {activeIdx + 1} of {sample.images.length}
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {sample.images.map((img, idx) => {
                        const isSelected = activeIdx === idx;
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() =>
                              setActiveImageIndices((prev) => ({
                                ...prev,
                                [sample.id]: idx,
                              }))
                            }
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 shrink-0 overflow-hidden relative transition-all cursor-pointer p-0.5 bg-white ${
                              isSelected
                                ? "border-[#0284C7] ring-2 ring-[#0284C7]/20 scale-105 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-mono text-white text-center truncate px-0.5">
                              {img.type}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary & Key Conversion Highlights */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sample.summary}
                    </p>

                    {sample.highlights && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {sample.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 sm:p-6 pt-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/60 mt-2 pt-4">
                  <button
                    type="button"
                    onClick={() => openLightbox(sample, 0)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0284C7] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View all {sample.images.length} in Lightbox</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(
                      `Hi Imdad, I saw your Amazon Listing creative deck for "${sample.title}". I want a similar 7-9 image conversion deck for my product.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Order Deck on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. BOTTOM HALF: AMAZON A+ CONTENT (EBC) SHOWCASE                     */}
      {/* =================================================================== */}
      <section id="aplus-showcase" className="space-y-10 pt-8 border-t border-slate-200">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-mono text-purple-900 font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>ENHANCED BRAND CONTENT (EBC) / A+ SUITE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
              Amazon A+ Content Showcase
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Standard and Premium A+ modular banners engineered like an official Amazon Brand Store. Proven to build brand equity, reduce return rates, and increase conversion rate by 15–20%.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 font-bold">
            <Award className="w-4 h-4 text-purple-700" />
            <span>Brand Registry Compliant (970px &amp; 1464px)</span>
          </div>
        </div>

        {/* Stacked A+ Modules Container (Simulating Amazon Listing Detail Page) */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800 space-y-12 overflow-hidden">
          
          {/* A+ Header Notice */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-mono">
            <span className="text-[#F6DBC0] font-bold">
              AMAZON A+ CONTENT MODULE BLUEPRINT // STACKED VIEW
            </span>
            <span className="text-slate-400">Exact Dimensions &bull; Ready For Seller Central</span>
          </div>

          {/* Module 1: Wide Header Brand Banner */}
          {initialAPlusModules.find((m) => m.moduleType === "header_banner") && (
            <div className="rounded-2xl overflow-hidden border border-slate-700 relative group shadow-xl">
              <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    initialAPlusModules.find((m) => m.moduleType === "header_banner")
                      ?.bannerUrl
                  }
                  alt="A+ Header"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex flex-col justify-center p-6 sm:p-12 max-w-xl">
                  <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-2">
                    {initialAPlusModules.find((m) => m.moduleType === "header_banner")?.brandName} // PREMIUM AUDIO
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight mb-2">
                    {initialAPlusModules.find((m) => m.moduleType === "header_banner")?.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
                    {initialAPlusModules.find((m) => m.moduleType === "header_banner")?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: The Operator Advantage / Brand Story */}
          {initialAPlusModules.find((m) => m.moduleType === "brand_story") && (
            <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-6 sm:p-10 space-y-6">
              <div className="max-w-3xl space-y-2">
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  BRAND STORY CAROUSEL // FOUNDER ETHOS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {initialAPlusModules.find((m) => m.moduleType === "brand_story")?.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {initialAPlusModules.find((m) => m.moduleType === "brand_story")?.description}
                </p>
              </div>

              {/* 4 Brand Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {initialAPlusModules
                  .find((m) => m.moduleType === "brand_story")
                  ?.features?.map((f, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{f.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Module 3: 4-Module Quad Specification Cards */}
          {initialAPlusModules.find((m) => m.moduleType === "four_image_quad") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Four Pillars of Hardware Mastery</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Standard Quad Module</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {initialAPlusModules
                  .find((m) => m.moduleType === "four_image_quad")
                  ?.features?.map((item, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2 hover:border-purple-400/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                        0{i + 1}
                      </div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Module 4: Technical Split Feature Module */}
          {initialAPlusModules.find((m) => m.moduleType === "split_feature") && (
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/80 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    initialAPlusModules.find((m) => m.moduleType === "split_feature")
                      ?.bannerUrl
                  }
                  alt="Split Feature"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  TECHNICAL DEEP-DIVE MODULE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {initialAPlusModules.find((m) => m.moduleType === "split_feature")?.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {initialAPlusModules.find((m) => m.moduleType === "split_feature")?.description}
                </p>

                <div className="space-y-2 pt-2">
                  {initialAPlusModules
                    .find((m) => m.moduleType === "split_feature")
                    ?.features?.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">{f.title}: </strong>
                          <span>{f.desc}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 5: Amazon Product Comparison Table */}
          {initialAPlusModules.find((m) => m.moduleType === "comparison_table") && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cross-Selling &amp; Competitive Comparison Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Highest-converting module in Amazon A+ Content; drives buyers toward premium SKUs.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                  High-Conversion Layout
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-300 font-mono text-[11px]">
                    <tr>
                      <th className="py-4 px-5">Specification / Feature</th>
                      <th className="py-4 px-5 bg-sky-950/50 text-[#0284C7] font-bold border-x border-slate-700">
                        Imdad.builds Studio Execution
                      </th>
                      <th className="py-4 px-5 text-slate-400">Typical Freelancer</th>
                      <th className="py-4 px-5 text-slate-400">Generic Agency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {initialAPlusModules
                      .find((m) => m.moduleType === "comparison_table")
                      ?.comparisonItems?.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-5 font-medium text-slate-300">{row.feature}</td>
                          <td className="py-3 px-5 bg-sky-950/30 font-bold text-white border-x border-slate-700">
                            {typeof row.ourProduct === "boolean" ? (
                              row.ourProduct ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <Check className="w-4 h-4" /> Included Full Suite
                                </span>
                              ) : (
                                "No"
                              )
                            ) : (
                              row.ourProduct
                            )}
                          </td>
                          <td className="py-3 px-5 text-slate-400">
                            {typeof row.competitorA === "boolean" ? (
                              row.competitorA ? (
                                "Yes"
                              ) : (
                                <span className="text-red-400">✕ Extra Cost</span>
                              )
                            ) : (
                              row.competitorA
                            )}
                          </td>
                          <td className="py-3 px-5 text-slate-400">
                            {typeof row.competitorB === "boolean" ? (
                              row.competitorB ? (
                                "Yes"
                              ) : (
                                <span className="text-red-400">✕ Missing</span>
                              )
                            ) : (
                              row.competitorB
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. PACKAGES & DIRECT INQUIRY CTA SECTION                            */}
      {/* =================================================================== */}
      <section id="packages" className="space-y-10 pt-8 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>TRANSPARENT FLAT-RATE PACKAGES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
            Amazon Listing &amp; A+ Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Direct founder execution with zero agency markup. Choose your tier and start instantly via WhatsApp.
          </p>
        </div>

        {/* 4 Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialPackages.map((pkg) => {
            const isRec = pkg.recommended;
            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isRec
                    ? "bg-white border-2 border-[#0284C7] shadow-xl ring-2 ring-[#0284C7]/20 -translate-y-1"
                    : "bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-6">
                    <span
                      className={`text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                        isRec
                          ? "bg-[#0284C7] text-white shadow-xs"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="mt-1">
                    <h3 className="text-lg font-black text-[#0A192F] tracking-tight">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#0A192F] tracking-tight">
                        {pkg.priceDisplay}
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-medium">
                        {pkg.unit}
                      </span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600">
                      <Clock className="w-3 h-3 text-[#0284C7]" />
                      <span>{pkg.turnaround}</span>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      Included Scope:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {pkg.deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
                  <a
                    href={getWhatsAppUrl(pkg.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isRec
                        ? "bg-[#0284C7] hover:bg-[#0369A1] text-white"
                        : "bg-[#0A192F] hover:bg-[#1E293B] text-white"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Inquire on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenChat(
                        `Hi Imdad, I am interested in the ${pkg.name} (${pkg.priceDisplay}). How do we get started?`
                      )
                    }
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-center cursor-pointer"
                  >
                    Ask AI Assistant
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Volume Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-white border border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider block">
              BULK CATALOG DISCOUNTS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0A192F]">
              Have 5+ SKUs or an entire catalog to launch?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We offer volume pricing for manufacturers and D2C brands launching multi-variation catalogs across Amazon, Flipkart, and Meesho.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={getWhatsAppUrl(
                "Hi Imdad, I have multiple SKUs (5+ products) and want a bulk catalog design and A+ Content package quote."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Bulk Inquiry</span>
            </a>
            <Link
              href="/contact?subject=Bulk%20Amazon%20Listing%20Inquiry"
              className="px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-2xs"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. FULL-SCREEN LIGHTBOX MODAL                                       */}
      {/* =================================================================== */}
      {lightboxState && (
        <div
          onClick={() => setLightboxState(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center space-y-4"
          >
            {/* Top Bar with Title, Counter & Close Button */}
            <div className="w-full flex items-center justify-between text-white text-xs px-2">
              <div>
                <span className="font-bold text-sm block">
                  {lightboxState.sample.title}
                </span>
                <span className="text-[11px] font-mono text-[#F6DBC0]">
                  Image {lightboxState.imageIndex + 1} of{" "}
                  {lightboxState.sample.images.length} &bull;{" "}
                  {lightboxState.sample.images[lightboxState.imageIndex]?.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxState(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage with Left/Right Navigation */}
            <div className="relative w-full flex items-center justify-center max-h-[68vh]">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() =>
                  setLightboxState((prev) => {
                    if (!prev) return null;
                    const nextIdx =
                      prev.imageIndex > 0
                        ? prev.imageIndex - 1
                        : prev.sample.images.length - 1;
                    return { ...prev, imageIndex: nextIdx };
                  })
                }
                className="absolute left-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                title="Previous Image (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxState.sample.images[lightboxState.imageIndex]?.url}
                alt={lightboxState.sample.images[lightboxState.imageIndex]?.label}
                className="max-h-[66vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/15"
              />

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setLightboxState((prev) => {
                    if (!prev) return null;
                    const nextIdx =
                      prev.imageIndex < prev.sample.images.length - 1
                        ? prev.imageIndex + 1
                        : 0;
                    return { ...prev, imageIndex: nextIdx };
                  })
                }
                className="absolute right-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                title="Next Image (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption Strip */}
            {lightboxState.sample.images[lightboxState.imageIndex]?.caption && (
              <p className="text-xs text-slate-300 text-center max-w-2xl px-4">
                {lightboxState.sample.images[lightboxState.imageIndex]?.caption}
              </p>
            )}

            {/* Bottom Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
              {lightboxState.sample.images.map((img, idx) => {
                const isSelected = lightboxState.imageIndex === idx;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() =>
                      setLightboxState((prev) => (prev ? { ...prev, imageIndex: idx } : null))
                    }
                    className={`w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0284C7] scale-105"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
