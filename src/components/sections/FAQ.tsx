"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/data/faq";
import { ChevronDown, ArrowRight } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 border-b border-[#502D55]/10 relative overflow-hidden">
      <Container size="narrow">
        <SectionHeading
          badgeText="Questions &amp; Answers"
          title="Frequently Asked Questions"
          description="Straightforward, honest answers about project scopes, marketplace deliverables, store setups, and working together."
          align="center"
        />

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white/95 border-[#935073]/30 shadow-[0_10px_30px_-5px_rgba(80,45,85,0.06)]"
                    : "bg-white/70 border-[#502D55]/08 hover:border-[#935073]/25 hover:bg-white/90 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus-ring"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base sm:text-lg font-bold text-[#180D1D] tracking-tight">
                    {item.question}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#180D1D] text-[#F8F4E9]"
                        : "bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-5 pb-6 sm:px-6 text-sm text-[#56475C] leading-relaxed border-t border-[#502D55]/08 pt-4"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom inquiry callout */}
        <div className="mt-12 text-center p-6 sm:p-7 rounded-2xl bg-white/80 border border-[#502D55]/10 shadow-sm">
          <p className="text-sm text-[#56475C]">
            Have a specific question about your product catalog or brand?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#935073] hover:text-[#180D1D] mt-2 transition-colors"
          >
            <span>Ask directly or chat with AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </Container>
    </section>
  );
}
