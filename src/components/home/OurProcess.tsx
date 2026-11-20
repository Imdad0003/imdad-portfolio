"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Search, Compass, Palette, Rocket, ArrowRight } from "lucide-react";

export function OurProcess() {
  const steps = [
    {
      step: "01",
      name: "Discover",
      icon: Search,
      title: "Discover & Scope",
      tagline: "Audience, commercial objectives & requirements",
      description:
        "We dissect your target customer, brand aesthetic, competitor landscape, and core deliverables to define an unambiguous project roadmap.",
      deliverable: "Scope Brief & Technical Spec",
    },
    {
      step: "02",
      name: "Plan",
      icon: Compass,
      title: "Plan & Blueprint",
      tagline: "Wireframes, scripts & creative angles",
      description:
        "We map out wireframes, storyboards, pacing hooks, and interface interactions. Clear architectural direction before touching production files.",
      deliverable: "Visual Moodboard & Wireframes",
    },
    {
      step: "03",
      name: "Create",
      icon: Palette,
      title: "Create & Iterate",
      tagline: "High-precision engineering & video editing",
      description:
        "We edit the video media, code the web platform, or craft the listing infographics with rapid iteration loops and transparent milestone reviews.",
      deliverable: "Staging Previews & Rough Cuts",
    },
    {
      step: "04",
      name: "Deliver",
      icon: Rocket,
      title: "Deliver & Launch",
      tagline: "Testing, deployment & seamless handoff",
      description:
        "Rigorous quality verification across mobile devices, SSL and payment gateway validation, production deployment, and asset handoff.",
      deliverable: "Live Production Launch & Assets",
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-t border-slate-200/80">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] mb-3.5 shadow-2xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
            OUR PROCESS // 4-STAGE METHODOLOGY
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
            Discover &bull; Plan &bull; Create &bull; Deliver.
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
            A transparent, predictable process engineered to deliver high craft without endless meetings or delayed timelines.
          </p>
        </div>

        {/* 4 Process Cards Connected Progressively */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-3xl bg-white/85 hover:bg-white border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-[#0284C7]" />
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      STEP {item.step}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">
                    STAGE {item.step} // {item.name.toUpperCase()}
                  </span>

                  <h3 className="text-lg font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors mt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs font-mono text-slate-500 mt-1">
                    {item.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5">
                    {item.description}
                  </p>
                </div>

                {/* Milestone Output */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    MILESTONE OUTPUT
                  </span>
                  <span className="text-xs font-semibold text-[#0A192F] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item.deliverable}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
