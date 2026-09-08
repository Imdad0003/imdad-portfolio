"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { ShoppingBag, Layers, ShieldCheck, Cpu } from "lucide-react";

const trustPillars = [
  {
    icon: ShoppingBag,
    title: "E-Commerce Focused",
    subtitle: "Built for margin & transaction conversion",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(246,219,192,0.3)]",
    iconColor: "text-[#F6DBC0]",
  },
  {
    icon: Layers,
    title: "Multi-Skill Execution",
    subtitle: "From listings & design to web & ad copy",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(184,104,144,0.3)]",
    iconColor: "text-[#d68fad]",
  },
  {
    icon: ShieldCheck,
    title: "Real Business Experience",
    subtitle: "Active founder operating EasyXo",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(248,244,233,0.3)]",
    iconColor: "text-[#F8F4E9]",
  },
  {
    icon: Cpu,
    title: "AI-Powered Workflows",
    subtitle: "Fast prototyping & asset acceleration",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(246,219,192,0.3)]",
    iconColor: "text-[#F6DBC0]",
  },
];

export function TrustStrip() {
  return (
    <section className="py-8 relative z-20">
      <Container>
        <div className="relative rounded-2xl bg-gradient-to-r from-[rgba(56,24,66,0.65)] via-[rgba(43,20,53,0.7)] to-[rgba(70,30,82,0.65)] border border-[#F6DBC0]/20 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(10,3,14,0.7),inset_0_1px_0_0_rgba(248,244,233,0.15)]">
          {/* Subtle Ambient Glow Behind Panel */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#502D55]/30 via-[#935073]/20 to-[#F6DBC0]/15 rounded-2xl blur-xl -z-10 opacity-70" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {trustPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-[rgba(80,45,85,0.35)]"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-[rgba(30,12,38,0.7)] border border-[#F6DBC0]/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:border-[#F6DBC0]/40 ${pillar.glowColor}`}
                  >
                    <Icon className={`w-6 h-6 ${pillar.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F8F4E9] tracking-tight group-hover:text-[#F6DBC0] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#bba89d] mt-0.5 leading-snug">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
