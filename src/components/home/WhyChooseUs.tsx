"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { defaultWhyUsSection, getSiteContent } from "@/lib/cms";
import { resolveStudioIcon } from "@/lib/icon-map";
import type { SiteContentDocument } from "@/types/cms";
import { ShieldCheck } from "lucide-react";

interface WhyChooseUsProps {
  initialContent?: SiteContentDocument;
}

export function WhyChooseUs({ initialContent }: WhyChooseUsProps) {
  const [content, setContent] = useState<SiteContentDocument | undefined>(initialContent);

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const sec = content?.whyUsSection || defaultWhyUsSection;
  const items = sec.items && sec.items.length > 0 ? sec.items : defaultWhyUsSection.items || [];

  return (
    <section
      id="why-us"
      className="py-10 sm:py-20 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <SectionHeading
          badgeText={sec.eyebrow || "WHY IMDAD.BUILDS"}
          title={sec.headline || "Practical Execution Over Agency Hype"}
          description={sec.subheadline}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
          {items.map((item, idx) => {
            const Icon = resolveStudioIcon(item.iconName, ShieldCheck);
            return (
              <div
                key={item.id || idx}
                className="p-4 sm:p-6 rounded-2xl bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] flex items-start gap-3.5 sm:gap-4"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral,#C96A50)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1 sm:space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary,#332924)]">
                      {item.title}
                    </h3>
                    {item.metric && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] text-[var(--accent-coral-hover,#B4583F)]">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--ink-body,#5F534D)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
