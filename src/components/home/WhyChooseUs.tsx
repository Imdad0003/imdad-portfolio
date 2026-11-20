"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Sparkles, Zap, ShieldCheck, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WhyChooseUs() {
  const strengths = [
    {
      icon: Sparkles,
      title: "Creative Execution",
      badge: "CRAFT & RETENTION",
      description:
        "Every video edit, color grade, and listing graphic is crafted with meticulous aesthetic discipline. We design media that captures high attention, conveys perceived product value, and eliminates buyer friction.",
      metrics: "Custom pacing, bespoke sound design & high-CTR visual assets.",
    },
    {
      icon: Zap,
      title: "Modern Technology",
      badge: "SPEED & ARCHITECTURE",
      description:
        "Built on modern stacks — Next.js 16, React 19, TypeScript, and Tailwind CSS. Sub-second page loads, mobile-first responsive interfaces, and rock-solid payment integrations with zero bloat.",
      metrics: "100% responsive, secure payment gateways & clean codebase architecture.",
    },
    {
      icon: ShieldCheck,
      title: "Practical Solutions",
      badge: "ACTIVE OPERATOR",
      description:
        "We build and run live commerce ventures ourselves (including EasyXo). We understand real marketplace compliance, payment friction, and fulfillment logistics — delivering practical, proven solutions.",
      metrics: "Real-world testing across Amazon, Flipkart, D2C, and social channels.",
    },
    {
      icon: Target,
      title: "Focus on Business Outcomes",
      badge: "COMMERCIAL CONVERSION",
      description:
        "We align design and engineering directly with commercial results: higher conversion rates, longer video retention, lower cart abandonment, and customer trust. Zero vanity metrics.",
      metrics: "Tied directly to revenue, user engagement, and measurable ROI.",
    },
  ];

  return (
    <section id="why-us" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-t border-slate-200/80">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] mb-3.5 shadow-2xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
            WHY CHOOSE US // STUDIO ADVANTAGE
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
            Engineered For Commercial Impact, Not Vanity.
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
            Why growing brands, ambitious businesses, and digital creators partner directly with imdad.builds.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {strengths.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-3xl bg-white/85 hover:bg-white border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-[#0284C7]" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0284C7] uppercase tracking-wide">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-700">{item.metrics}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
