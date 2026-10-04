"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/config";
import {
  ArrowRight,
  Music,
  Target,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"wishmusic" | "wishtracking" | "easyxo">("wishmusic");
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] lg:min-h-[88vh] flex flex-col justify-center pt-6 pb-16 sm:pt-12 sm:pb-20 overflow-hidden"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#180D1D_1px,transparent_1px)] [background-size:28px_28px]" />

      <Container>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Asymmetric Editorial Studio Identity (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Studio Monospace Metadata Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#502D55]/12 text-[10px] sm:text-[11px] font-mono text-[#56475C] mb-5 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-[#180D1D]">IMDAD.BUILDS</span>
              <span className="text-[#935073]">•</span>
              <span className="text-[#7A6880]">INDEPENDENT PRODUCT LAB</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black tracking-[-0.03em] text-[#180D1D] leading-[1.06]">
              Building digital products, apps &amp;{" "}
              <span className="text-gradient-dusk block">
                experiences.
              </span>
            </h1>

            {/* Supporting Editorial Copy */}
            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-[#56475C] max-w-xl leading-relaxed font-normal">
              An independent studio where products are built from scratch: mobile apps, web applications, e-commerce engines, and high-retention creative media.
            </p>

            {/* Primary & Secondary Studio CTAs */}
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                href="/apps"
                variant="primary"
                size="lg"
                className="justify-center min-h-[48px] font-bold shadow-xs px-7"
              >
                Explore Apps
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                href="/services"
                variant="secondary"
                size="lg"
                className="justify-center min-h-[48px] font-bold px-7"
              >
                View Services
              </Button>
            </div>

            {/* Technical Proof Points Strip */}
            <div className="mt-10 pt-6 border-t border-[#502D55]/10 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg">
              <div>
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-0.5">DISCIPLINE</span>
                <span className="font-black text-sm sm:text-base text-[#180D1D]">Product Lab</span>
                <span className="block text-[11px] text-[#7A6880]">Real code &amp; tools</span>
              </div>
              <div className="border-l border-[#502D55]/10 pl-4">
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-0.5">ECOSYSTEM</span>
                <span className="font-black text-sm sm:text-base text-[#180D1D]">Apps &amp; Web</span>
                <span className="block text-[11px] text-[#7A6880]">Mobile, D2C, Video</span>
              </div>
              <div className="border-l border-[#502D55]/10 pl-4">
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-0.5">OPERATOR</span>
                <span className="font-black text-sm sm:text-base text-[#180D1D]">EasyXo</span>
                <span className="block text-[11px] text-[#7A6880]">Live brand founder</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Product Stage Preview (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-white/95 border border-[#502D55]/14 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(80,45,85,0.08)] overflow-hidden">
              
              {/* Product Stage Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#502D55]/08 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#180D1D]" />
                  <span className="studio-tag text-[9px] text-[#56475C] font-bold">
                    STUDIO VIEWPORT // INTERACTIVE PROTOTYPE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#935073] bg-[#935073]/08 px-2 py-0.5 rounded-full font-bold">
                  UI PROTOTYPE
                </span>
              </div>

              {/* Product Selector Segment Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#FAF2EA] border border-[#502D55]/08 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("wishmusic")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "wishmusic"
                      ? "bg-white text-[#180D1D] shadow-2xs font-bold"
                      : "text-[#7A6880] hover:text-[#180D1D]"
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-[#935073]" />
                  <span className="truncate">WishMusic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("wishtracking")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "wishtracking"
                      ? "bg-white text-[#180D1D] shadow-2xs font-bold"
                      : "text-[#7A6880] hover:text-[#180D1D]"
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-[#502D55]" />
                  <span className="truncate">WishTrack</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("easyxo")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "easyxo"
                      ? "bg-white text-[#180D1D] shadow-2xs font-bold"
                      : "text-[#7A6880] hover:text-[#180D1D]"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#d97746]" />
                  <span className="truncate">EasyXo</span>
                </button>
              </div>

              {/* VIEWPORT 1: WISHMUSIC TACTILE PLAYER */}
              {activeTab === "wishmusic" && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#180D1D] via-[#24132B] to-[#120816] text-white shadow-inner relative overflow-hidden border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#F6DBC0]/80 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        AUDIOENGINE PROTOTYPE v0.8.2
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[9px] font-bold">
                        In Development
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#935073] to-[#F6DBC0] flex items-center justify-center shadow-md shrink-0">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm tracking-tight text-white truncate">
                          Midnight Resonance — Chapter IV
                        </h4>
                        <p className="text-[11px] text-[#d8cfc4] truncate">
                          Sample Track &bull; Simulated Waveform Scrubber
                        </p>
                      </div>
                    </div>

                    {/* Interactive Audio Waveform Scrub Mockup */}
                    <div className="space-y-1.5 pt-1">
                      <div className="h-7 flex items-center justify-between gap-1 px-1">
                        {[40, 65, 80, 45, 90, 75, 30, 85, 95, 60, 40, 70, 85, 50, 65, 90, 40, 80, 55, 70, 35, 60].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              i < 13
                                ? "bg-[#F6DBC0]"
                                : isPlaying
                                ? "bg-white/20"
                                : "bg-white/10"
                            }`}
                            style={{ height: `${isPlaying ? h : Math.max(20, h * 0.5)}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-[#d8cfc4]/70">
                        <span>02:14</span>
                        <span>04:38</span>
                      </div>
                    </div>

                    {/* Mini Player Controls */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-7 h-7 rounded-full bg-white text-[#180D1D] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                          aria-label={isPlaying ? "Pause simulated preview" : "Play simulated preview"}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </button>
                        <span className="text-[10px] font-mono text-[#d8cfc4]">
                          {isPlaying ? "SIMULATED PLAY" : "PAUSED"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#F6DBC0]/80">
                        LOCAL-FIRST CONCEPT
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="font-bold text-[#180D1D]">WishMusic Player</span>
                      <p className="text-[11px] text-[#7A6880]">Tactile audio architecture &bull; iOS, Android, Web</p>
                    </div>
                    <Link
                      href="/apps/wishmusic"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#935073] hover:underline"
                    >
                      Inspect App
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* VIEWPORT 2: WISHTRACKING MOMENTUM APP */}
              {activeTab === "wishtracking" && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120A17] to-[#2B1435] text-white shadow-inner relative overflow-hidden border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#F6DBC0]/80 mb-3">
                      <span>MOMENTUM ENGINE PROTOTYPE</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30 text-[9px] font-bold">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-2xl font-black text-white">Day 42</div>
                        <div className="text-[10px] font-mono text-[#d8cfc4]">Simulated Streak Metric</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-[#10B981] font-bold">Consistency Model</div>
                        <div className="text-[9px] text-[#d8cfc4]">Compound Curve</div>
                      </div>
                    </div>

                    {/* Streak Week Grid */}
                    <div className="grid grid-cols-7 gap-1 pt-1 mb-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-mono text-[#d8cfc4]/60">{d}</span>
                          <div className={`w-full h-6 rounded-md flex items-center justify-center ${i < 6 ? "bg-[#935073] text-white" : "bg-white/10 text-white/40"}`}>
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#d8cfc4]">
                      <span>ZERO ADS &bull; LOCAL FIRST</span>
                      <span className="text-[#10B981]">100% PRIVATE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="font-bold text-[#180D1D]">WishTracking</span>
                      <p className="text-[11px] text-[#7A6880]">Compound milestone tracker &bull; Zero noise</p>
                    </div>
                    <Link
                      href="/apps/wishtracking"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#935073] hover:underline"
                    >
                      Join Waitlist
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* VIEWPORT 3: EASYXO PLATFORM */}
              {activeTab === "easyxo" && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C1008] to-[#381E10] text-white shadow-inner relative overflow-hidden border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#F6DBC0]/80 mb-3">
                      <span>EASYXO D2C ENGINE</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 text-[9px] font-bold">
                        Live Brand
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xl font-bold text-white">easyxo.in</div>
                        <div className="text-[10px] text-[#F6DBC0]">Direct-to-Consumer Storefront</div>
                      </div>
                      <a
                        href="https://easyxo.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Visit EasyXo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 mb-2">
                      <div className="p-2 rounded-lg bg-white/08 border border-white/06">
                        <span className="text-[#F6DBC0]/70 block">Marketplaces</span>
                        <span className="font-bold text-white">Amazon &bull; Flipkart &bull; Meesho</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/08 border border-white/06">
                        <span className="text-[#F6DBC0]/70 block">Checkout Engine</span>
                        <span className="font-bold text-white">UPI &bull; Razorpay Webhooks</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#d8cfc4]">
                      <span>GATEWAY: RAZORPAY UPI &amp; CARDS</span>
                      <span className="text-emerald-400">ACTIVE PRODUCTION</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="font-bold text-[#180D1D]">EasyXo Brand Platform</span>
                      <p className="text-[11px] text-[#7A6880]">Founder-operated e-commerce venture</p>
                    </div>
                    <Link
                      href="/apps/easyxo"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#d97746] hover:underline"
                    >
                      Case Study
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Bottom Stamp */}
              <div className="mt-3.5 pt-3 border-t border-[#502D55]/08 flex items-center justify-between text-[10px] font-mono text-[#7A6880]">
                <span>ARCHITECTURE: NEXT.JS &bull; REACT NATIVE</span>
                <span className="text-[#180D1D] font-bold">POWERED BY IMDAD.BUILDS</span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
