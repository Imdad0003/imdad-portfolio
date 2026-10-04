"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRight, ShieldCheck, Terminal, Cpu, Award } from "lucide-react";

export function StudioAboutSection() {
  return (
    <section id="studio-about" className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Manifesto & Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#56475C] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#180D1D]" />
              THE STUDIO MANIFESTO // INDEPENDENT OPERATOR
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#180D1D] leading-tight">
              An independent studio built around{" "}
              <span className="text-gradient-dusk">
                tangible execution.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#56475C] leading-relaxed">
              Imdad.builds was founded on a simple premise: modern businesses and creators don&apos;t need generic agency buzzwords or bloated retainers. They need fast, reliable digital products that actually convert and perform.
            </p>

            <p className="text-sm sm:text-base text-[#56475C] leading-relaxed">
              As an active operator and founder of the e-commerce brand <strong>EasyXo</strong>, I test marketplace catalogs, payment gateways, video retention hooks, and direct-to-consumer store architectures in the real world every day. That firsthand experience directly informs every app, website, and creative asset shipped from this studio.
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#180D1D] hover:text-[#935073] transition-colors group"
              >
                <span>READ THE FULL STUDIO MANIFESTO</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Operational Pillars (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/90 border border-[#502D55]/12 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#502D55]/10 text-[#502D55] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="font-black text-base text-[#180D1D]">Real Products, Zero Fluff</h4>
              </div>
              <p className="text-xs text-[#56475C] leading-relaxed pl-11">
                We build working codebases, deployed mobile applications, and verified marketplace listings. No fake startup metrics or vanity presentations.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/90 border border-[#502D55]/12 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#935073]/10 text-[#935073] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="font-black text-base text-[#180D1D]">Direct Founder Partnership</h4>
              </div>
              <p className="text-xs text-[#56475C] leading-relaxed pl-11">
                No middle managers or delegated offshore handoffs. You collaborate directly with the builder who architects, codes, and refines your solution.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/90 border border-[#502D55]/12 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#d97746]/10 text-[#d97746] flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="font-black text-base text-[#180D1D]">Conversion-First Engineering</h4>
              </div>
              <p className="text-xs text-[#56475C] leading-relaxed pl-11">
                Every layout, visual contrast choice, and micro-interaction is engineered to remove customer hesitation, speed up transactions, and maximize conversion rates.
              </p>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
