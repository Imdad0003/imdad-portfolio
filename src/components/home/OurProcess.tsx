"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { defaultProcessSection, getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import { ArrowRight } from "lucide-react";

interface OurProcessProps {
  initialContent?: SiteContentDocument;
}

export function OurProcess({ initialContent }: OurProcessProps) {
  const [content, setContent] = useState<SiteContentDocument | undefined>(initialContent);

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const proc = content?.processSection || defaultProcessSection;
  const steps = proc.steps && proc.steps.length > 0 ? proc.steps : defaultProcessSection.steps || [];

  return (
    <section
      id="process"
      className="py-10 sm:py-20 bg-[var(--background,#FAF7F2)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-10">
          <SectionHeading
            badgeText={proc.eyebrow || "HOW WE WORK"}
            title={proc.headline || "Simple 4-Step Delivery Process"}
            description={proc.subheadline}
            className="mb-0"
          />
          {proc.ctaText && (
            <Button
              href={proc.ctaLink || "/contact"}
              variant="secondary"
              size="md"
              className="self-start md:self-auto shrink-0"
            >
              <span>{proc.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {steps.map((st, idx) => (
            <div
              key={st.id || idx}
              className="rounded-2xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-4 sm:p-6 shadow-[0_6px_20px_-6px_rgba(51,41,36,0.05)] flex flex-col justify-between gap-3 sm:gap-4"
            >
              <div className="space-y-2 sm:space-y-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] font-display font-bold text-xs sm:text-sm flex items-center justify-center">
                  {st.step || String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-sm sm:text-lg font-bold text-[var(--ink-primary,#332924)] leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-body,#5F534D)] leading-relaxed">
                  {st.description}
                </p>
              </div>
              {st.badge && (
                <div className="pt-2 border-t border-[var(--border-warm,#E8DFD5)]/70 text-[10px] sm:text-xs font-mono text-[var(--ink-muted,#8A7C75)] truncate">
                  {st.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
