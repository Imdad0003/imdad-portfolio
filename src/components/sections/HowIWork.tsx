import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/process";
import { Check } from "lucide-react";

export function HowIWork() {
  return (
    <section id="process" className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="Work Methodology"
          title="How I Work"
          description="A structured, transparent 4-stage process designed to eliminate guesswork, align deliverables, and move from concept to live deployment."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="group rounded-3xl p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-[rgba(56,24,66,0.55)] via-[rgba(43,20,53,0.5)] to-[rgba(30,12,38,0.65)] border border-[#F6DBC0]/18 hover:border-[#F6DBC0]/40 backdrop-blur-2xl shadow-[0_15px_35px_rgba(10,3,14,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(80,45,85,0.4)]"
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl sm:text-4xl font-black text-[#F6DBC0] font-mono">
                    {step.step}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#d8cfc4] bg-[rgba(24,10,30,0.8)] px-2.5 py-1 rounded-lg border border-[#F6DBC0]/15">
                    Phase {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F6DBC0] font-medium leading-normal mb-4">
                  {step.summary}
                </p>

                {/* Scope Breakdown */}
                <ul className="space-y-2 pt-3 border-t border-[#F6DBC0]/12">
                  {step.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      className="flex items-start gap-2 text-xs text-[#d8cfc4]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
