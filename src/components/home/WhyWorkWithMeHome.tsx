import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2, ShieldCheck, Zap, UserCheck } from "lucide-react";

interface Differentiator {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const points: Differentiator[] = [
  {
    title: "Active Operator Experience",
    description:
      "I don't just advise from the sidelines. As founder of EasyXo, every listing strategy, visual deck, and ad angle is tested firsthand on real inventory.",
    icon: ShieldCheck,
  },
  {
    title: "Conversion-First Execution",
    description:
      "Aesthetics matter, but sales matter more. Creatives and copy are engineered to address buyer friction points, highlight dimensions, and earn clicks.",
    icon: Zap,
  },
  {
    title: "Transparent Starting Rates",
    description:
      "Every service has visible starting prices and itemized deliverables. No opaque retainers, hidden agency markups, or billing surprises.",
    icon: CheckCircle2,
  },
  {
    title: "Direct Studio Partnership",
    description:
      "You work directly with me. No junior account managers, hand-offs, or lost communication—just fast, accountable pair execution.",
    icon: UserCheck,
  },
];

export function WhyWorkWithMeHome() {
  return (
    <section className="py-20 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="The Operator Advantage"
          title="Why Work With Me"
          description="A personal studio approach combining real business ownership with multi-disciplinary digital craft."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-2xl p-6 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-start group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                  {point.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#56475C] leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
