"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { SiteContentDocument, AppDocument } from "@/types/cms";
import { getSiteContent, getPublishedApps, defaultSiteContent } from "@/lib/cms";
import {
  ArrowRight,
  Music,
  ShoppingBag,
  Video,
  Globe,
  ExternalLink,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface HeroProps {
  initialContent?: SiteContentDocument["hero"];
}

interface ShowcaseTab {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  badge: string;
  statusLabel: string;
  inspectLink: string;
  inspectLabel: string;
  type: "video" | "store" | "audio" | "web";
}

const defaultShowcaseTabs: ShowcaseTab[] = [
  {
    id: "video",
    label: "Video",
    title: "Product Reel & Commercial Cuts",
    subtitle: "High-retention social reels & commercial advertisements",
    badge: "VIDEO CREATIVE LAB",
    statusLabel: "Active Production",
    inspectLink: "/services/video-editing",
    inspectLabel: "Order Video Editing",
    type: "video",
  },
  {
    id: "easyxo",
    label: "EasyXo",
    title: "EasyXo Brand Platform",
    subtitle: "Founder-operated direct-to-consumer commerce venture",
    badge: "EASYXO D2C ENGINE",
    statusLabel: "Live Brand",
    inspectLink: "/apps/easyxo",
    inspectLabel: "Inspect Brand",
    type: "store",
  },
  {
    id: "wishmusic",
    label: "WishMusic",
    title: "WishMusic Audio Experience",
    subtitle: "Tactile, distraction-free player interface for iOS & Android",
    badge: "AUDIOENGINE v0.8.2",
    statusLabel: "In Development",
    inspectLink: "/apps/wishmusic",
    inspectLabel: "Inspect App",
    type: "audio",
  },
  {
    id: "web",
    label: "Web",
    title: "Full-Stack Web Architecture",
    subtitle: "Sub-second Next.js web platforms with integrated payments",
    badge: "HIGH-SPEED WEB",
    statusLabel: "Production Ready",
    inspectLink: "/services/website-development",
    inspectLabel: "View Web Services",
    type: "web",
  },
];

export function Hero({ initialContent }: HeroProps) {
  const [heroContent, setHeroContent] = useState<SiteContentDocument["hero"]>(
    initialContent || defaultSiteContent.hero
  );
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [activeTab, setActiveTab] = useState<string>("video");
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.hero) {
          setHeroContent(content.hero);
        }
      })
      .catch(() => {});

    getPublishedApps()
      .then((data) => {
        if (data && data.length > 0) {
          setApps(data);
        }
      })
      .catch(() => {});
  }, []);

  // Determine headline and copy: align with explicit user specifications
  const isOldDefaultHeadline =
    !heroContent.headline ||
    heroContent.headline === "Apps, Platforms & Digital Commerce.";

  const headline = isOldDefaultHeadline
    ? "We Build Ideas Into Digital Experiences."
    : heroContent.headline;

  const subheadline = isOldDefaultHeadline
    ? "Creative solutions, smart technology, and professional services to help businesses grow."
    : heroContent.subheadline;

  const primaryCtaText = isOldDefaultHeadline
    ? "Explore Our Services"
    : heroContent.primaryCtaText || "Explore Our Services";

  const primaryCtaLink = isOldDefaultHeadline
    ? "/services"
    : heroContent.primaryCtaLink || "/services";

  const secondaryCtaText = isOldDefaultHeadline
    ? "View Our Work"
    : heroContent.secondaryCtaText || "View Our Work";

  const secondaryCtaLink = isOldDefaultHeadline
    ? "/projects"
    : heroContent.secondaryCtaLink || "/projects";

  const currentTab = defaultShowcaseTabs.find((t) => t.id === activeTab) || defaultShowcaseTabs[0];

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-center pt-8 pb-16 sm:pt-14 sm:pb-22 overflow-hidden"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0A192F_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* Editable Hero Background Image (Configurable via Admin CMS) */}
      {heroContent.backgroundImage ? (
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center transition-opacity duration-500 z-0"
          style={{
            backgroundImage: `url(${heroContent.backgroundImage})`,
            opacity: (heroContent.backgroundImageOpacity ?? 20) / 100,
          }}
        />
      ) : null}

      <Container>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Creative & Tech Studio Display (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Studio Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/90 text-[10px] sm:text-[11px] font-mono text-slate-600 mb-5 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-[#0A192F]">IMDAD.BUILDS</span>
              <span className="text-[#0284C7]">•</span>
              <span className="text-slate-500 uppercase">
                {heroContent.badge || "CREATIVE & TECH STUDIO"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[4.15rem] font-black tracking-[-0.03em] text-[#0A192F] leading-[1.08]">
              {headline.includes("Digital Experiences.") ? (
                <>
                  {headline.split("Digital Experiences.")[0]}
                  <span className="text-[#0284C7]">Digital Experiences.</span>
                </>
              ) : (
                headline
              )}
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed font-normal">
              {subheadline}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Button
                href={primaryCtaLink}
                variant="primary"
                size="lg"
                className="justify-center min-h-[48px] font-bold shadow-xs px-7 bg-[#0284C7] hover:bg-[#0369A1] text-white"
              >
                {primaryCtaText}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                href={secondaryCtaLink}
                variant="secondary"
                size="lg"
                className="justify-center min-h-[48px] font-bold px-7 border-slate-200 text-[#0A192F] hover:bg-slate-50"
              >
                {secondaryCtaText}
              </Button>
            </div>

            {/* Technical Proof Points Strip */}
            <div className="mt-10 pt-6 border-t border-slate-200/90 grid grid-cols-3 gap-3 sm:gap-8 w-full max-w-lg">
              <div>
                <span className="studio-tag text-[9px] text-slate-400 font-mono font-bold block mb-0.5 uppercase tracking-wider">
                  CREATIVE
                </span>
                <span className="font-black text-sm sm:text-base text-[#0A192F]">Video &amp; Ads</span>
                <span className="block text-[11px] text-slate-500">Reels &amp; Creatives</span>
              </div>
              <div className="border-l border-slate-200 pl-3 sm:pl-5">
                <span className="studio-tag text-[9px] text-slate-400 font-mono font-bold block mb-0.5 uppercase tracking-wider">
                  TECHNOLOGY
                </span>
                <span className="font-black text-sm sm:text-base text-[#0A192F]">Web &amp; Apps</span>
                <span className="block text-[11px] text-slate-500">Next.js &amp; Mobile</span>
              </div>
              <div className="border-l border-slate-200 pl-3 sm:pl-5">
                <span className="studio-tag text-[9px] text-slate-400 font-mono font-bold block mb-0.5 uppercase tracking-wider">
                  SOLUTIONS
                </span>
                <span className="font-black text-sm sm:text-base text-[#0A192F]">Live Brands</span>
                <span className="block text-[11px] text-slate-500">Active Operator</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Liquid Glass Studio Viewport (5 Cols) */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative rounded-3xl bg-white/85 border border-sky-100/90 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,132,199,0.08)] overflow-hidden">
              {/* Product Stage Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <span className="studio-tag text-[9px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                    STUDIO VIEWPORT // INTERACTIVE SHOWCASE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#0284C7] bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-full font-bold">
                  LIQUID GLASS UI
                </span>
              </div>

              {/* Segmented Showcase Switcher */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                {defaultShowcaseTabs.map((tab) => {
                  const isSelected = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-white text-[#0A192F] shadow-xs font-bold"
                          : "text-slate-500 hover:text-[#0A192F]"
                      }`}
                    >
                      {tab.type === "video" && <Video className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                      {tab.type === "store" && <ShoppingBag className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                      {tab.type === "audio" && <Music className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                      {tab.type === "web" && <Globe className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Viewport */}
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0A192F] via-[#0F172A] to-[#1E293B] text-white shadow-inner relative overflow-hidden border border-white/10">
                  {/* Badge & Status */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-sky-200 mb-3">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {currentTab.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-400/20 text-emerald-300 border-emerald-300/30">
                      {currentTab.statusLabel}
                    </span>
                  </div>

                  {/* Header Info */}
                  <div className="mb-3">
                    <h4 className="font-bold text-base tracking-tight text-white">
                      {currentTab.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {currentTab.subtitle}
                    </p>
                  </div>

                  {/* Dynamic Sub-View depending on Tab */}
                  {currentTab.type === "video" && (
                    <div className="space-y-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-sky-200">
                          <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                          9:16 Vertical Reel Master
                        </span>
                        <span className="font-mono text-[10px] bg-white/15 px-2 py-0.5 rounded text-white">
                          ₹999 Package
                        </span>
                      </div>

                      <div className="h-6 flex items-center gap-1 px-1">
                        {[40, 70, 95, 60, 85, 100, 50, 75, 90, 45, 80, 60, 95, 70, 40, 85, 90, 50, 75, 60, 90].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              i < 12 ? "bg-sky-400" : isPlaying ? "bg-white/30" : "bg-white/15"
                            }`}
                            style={{ height: `${isPlaying ? h : Math.max(20, h * 0.4)}%` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{isPlaying ? "PLAYING AUDIO HOOK" : "PAUSED"}</span>
                        </button>
                        <span className="text-emerald-400 font-bold">STOP-SCROLL PACING</span>
                      </div>
                    </div>
                  )}

                  {currentTab.type === "store" && (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                          <span className="text-sky-200 block text-[9px]">STOREFRONT</span>
                          <span className="font-bold text-white text-xs">easyxo.in</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                          <span className="text-sky-200 block text-[9px]">MARKETPLACES</span>
                          <span className="font-bold text-white text-xs">Amazon &bull; Flipkart</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span>PAYMENTS: RAZORPAY UPI &amp; CARDS</span>
                        <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
                      </div>
                    </div>
                  )}

                  {currentTab.type === "audio" && (
                    <div className="space-y-3 pt-1">
                      <div className="h-6 flex items-center gap-1 px-1">
                        {[30, 60, 85, 45, 95, 75, 40, 80, 100, 55, 35, 70, 90, 65, 45, 80, 95, 40, 70, 50, 85].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${i < 10 ? "bg-sky-400" : "bg-white/20"}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span>OFFLINE-FIRST ENGINE</span>
                        <span className="text-sky-300 font-bold">LOSSLESS AUDIO</span>
                      </div>
                    </div>
                  )}

                  {currentTab.type === "web" && (
                    <div className="space-y-2.5 pt-1">
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-sky-200">STACK: NEXT.JS 16 &bull; TS</span>
                        <span className="text-emerald-400 font-bold">SUB-SECOND TTI</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                        <span>MOBILE-FIRST ARCHITECTURE</span>
                        <span className="text-sky-300 font-bold">100/100 LIGHTHOUSE</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspect Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-[#0A192F] block">{currentTab.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Powered by imdad.builds</span>
                  </div>
                  <Link
                    href={currentTab.inspectLink}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:underline shrink-0"
                  >
                    <span>{currentTab.inspectLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bottom Stamp */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>IMDAD.BUILDS PRODUCT LAB</span>
                <span className="text-[#0A192F] font-bold">BUILD &bull; CREATE &bull; SCALE</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
