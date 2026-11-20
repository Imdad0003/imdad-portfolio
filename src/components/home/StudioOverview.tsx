"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Sparkles, Code2, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";

interface StudioOverviewProps {
  eyebrow?: string;
  headline?: string;
  description?: string;
}

export function StudioOverview({
  eyebrow = "STUDIO OVERVIEW // CREATIVE & TECH STUDIO",
  headline = "Where creative storytelling meets precision technology.",
  description = "imdad.builds is an independent Creative & Tech Studio. We partner with ambitious businesses, founders, and creators to engineer high-retention digital media, modern web applications, and commercial platforms that deliver tangible business results.",
}: StudioOverviewProps) {
  const pillars = [
    {
      icon: Sparkles,
      number: "01",
      title: "Creative Thinking",
      tagline: "Narrative clarity & visual excellence",
      description:
        "Every video cut, listing graphic, and interface is engineered to eliminate customer friction, communicate value instantly, and command attention in competitive markets.",
      highlights: [
        "High-Retention Video Editing",
        "E-Commerce Creative Decks",
        "Visual Brand Systems",
        "Audience Engagement Pacing",
      ],
      accent: "from-sky-500/10 to-blue-500/10",
      iconColor: "text-[#0284C7]",
      badge: "CREATIVE",
    },
    {
      icon: Code2,
      number: "02",
      title: "Modern Technology",
      tagline: "Speed, architecture & clean code",
      description:
        "Production-grade engineering built on Next.js, TypeScript, Tailwind CSS, and secure cloud backends. Blazing-fast page loads, mobile-first responsiveness, and rock-solid uptime.",
      highlights: [
        "Next.js 16 Web Applications",
        "Cross-Platform Mobile Apps",
        "Razorpay Payment Workflows",
        "Automated Cloud Integrations",
      ],
      accent: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-[#2563EB]",
      badge: "TECHNOLOGY",
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "Business-Focused Solutions",
      tagline: "Direct operator experience & conversion",
      description:
        "Founded by an active operator of real digital brands. We don't theorize from an ivory tower — our solutions are battle-tested in real marketplace environments to maximize sales and retention.",
      highlights: [
        "Conversion-Engineered Funnels",
        "Direct-to-Consumer Engines",
        "Marketplace Compliance",
        "Measurable Commercial Growth",
      ],
      accent: "from-cyan-500/10 to-emerald-500/10",
      iconColor: "text-emerald-600",
      badge: "SOLUTIONS",
    },
  ];

  return (
    <section id="overview" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Subtle ice blue ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-100/30 via-blue-50/20 to-sky-100/30 blur-3xl pointer-events-none -z-10" />

      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] mb-3.5 shadow-2xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
            {eyebrow}
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
            {headline}
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* 3 Pillars: Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative rounded-3xl bg-white/80 hover:bg-white/95 border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Badge & Number */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {pillar.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {pillar.number}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-[#0284C7] mt-1">
                    {pillar.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5">
                    {pillar.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    CORE CAPABILITIES
                  </span>
                  <ul className="space-y-1.5">
                    {pillar.highlights.map((item) => (
                      <li
                        key={item}
                        className="text-xs text-slate-700 font-medium flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Studio Anchor Note */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0A192F] block">
                Direct Operator Partnership &bull; No Delegated Offshoring
              </span>
              <span className="text-[11px] text-slate-500 block">
                You work directly with the builder and specialists who execute, refine, and deploy your work.
              </span>
            </div>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors shrink-0 group"
          >
            <span>Learn More About Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
