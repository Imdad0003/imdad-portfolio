"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { defaultOverviewSection, getSiteContent } from "@/lib/cms";
import { resolveStudioIcon } from "@/lib/icon-map";
import type { SiteContentDocument } from "@/types/cms";
import { Compass } from "lucide-react";

interface StudioOverviewProps {
  initialContent?: SiteContentDocument;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function StudioOverview({
  initialContent,
  eyebrow,
  title,
  description,
}: StudioOverviewProps) {
  const [content, setContent] = useState<SiteContentDocument | undefined>(initialContent);

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const ov = content?.overviewSection || defaultOverviewSection;
  const pillars = ov.pillars && ov.pillars.length > 0 ? ov.pillars : defaultOverviewSection.pillars || [];

  return (
    <section
      id="overview"
      className="py-10 sm:py-20 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <SectionHeading
          badgeText={eyebrow || ov.eyebrow || "ABOUT US"}
          title={title || ov.headline || "Built for Businesses, Not Generic Agency Fluff"}
          description={description || ov.subheadline}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = resolveStudioIcon(pillar.iconName, Compass);
            return (
              <Card key={pillar.id || idx} variant="glass" className="flex flex-col justify-between gap-3 sm:gap-4 p-4 sm:p-6">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral,#C96A50)] flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--ink-muted,#8A7C75)]">
                      {pillar.number || String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink-primary,#332924)]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--ink-body,#5F534D)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
