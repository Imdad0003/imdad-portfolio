"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CustomSectionConfig } from "@/types/cms";

interface CustomSectionBlockProps {
  section: CustomSectionConfig;
}

function getToneWrapperClass(tone?: CustomSectionConfig["tone"]) {
  if (tone === "white") {
    return "bg-[var(--surface-pure,#FFFFFF)]";
  }
  if (tone === "peach") {
    return "bg-[var(--surface-peach,#FAECE4)]/55";
  }
  return "bg-[var(--background,#FAF7F2)]";
}

function SmartActionLink({
  href,
  label,
  variant = "primary",
  size = "md",
}: {
  href?: string;
  label: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const safeHref = href?.trim() || "/contact";
  const isExternal = safeHref.startsWith("http");
  if (isExternal) {
    return (
      <Button href={safeHref} variant={variant} size={size} target="_blank" rel="noopener noreferrer">
        <span>{label}</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    );
  }
  return (
    <Button href={safeHref} variant={variant} size={size}>
      <span>{label}</span>
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}

export function CustomSectionBlock({ section }: CustomSectionBlockProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const items = section.items || [];
  const toneClass = getToneWrapperClass(section.tone);

  const gridColsClass =
    section.layout === "cards-2"
      ? "grid-cols-1 md:grid-cols-2"
      : section.layout === "cards-4"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id={section.id}
      className={`py-14 sm:py-20 border-t border-[var(--border-warm,#E8DFD5)]/70 ${toneClass}`}
    >
      <Container>
        {section.layout === "banner" ? (
          <div className="rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-6 sm:p-10 lg:p-12 shadow-[0_12px_32px_-8px_rgba(51,41,36,0.06)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className={section.mediaUrl ? "lg:col-span-7 space-y-4" : "lg:col-span-12 max-w-3xl space-y-4"}>
                {section.eyebrow && <Badge variant="peach">{section.eyebrow}</Badge>}
                <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-tight">
                  {section.headline}
                </h2>
                {section.subheadline && (
                  <p className="text-base sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed">
                    {section.subheadline}
                  </p>
                )}
                {section.bodyText && (
                  <p className="text-sm text-[var(--ink-muted,#8A7C75)] leading-relaxed">
                    {section.bodyText}
                  </p>
                )}
                {(section.ctaText || section.secondaryCtaText) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {section.ctaText && (
                      <SmartActionLink href={section.ctaLink} label={section.ctaText} variant="primary" />
                    )}
                    {section.secondaryCtaText && (
                      <SmartActionLink
                        href={section.secondaryCtaLink}
                        label={section.secondaryCtaText}
                        variant="secondary"
                      />
                    )}
                  </div>
                )}
              </div>

              {section.mediaUrl && (
                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border border-[var(--border-warm,#E8DFD5)] bg-[var(--surface-sand,#F3ECE4)] aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.mediaUrl}
                      alt={section.mediaAlt || section.headline}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : section.layout === "split-media" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              {section.eyebrow && <Badge variant="peach">{section.eyebrow}</Badge>}
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-[1.15]">
                {section.headline}
              </h2>
              {section.subheadline && (
                <p className="text-base sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed">
                  {section.subheadline}
                </p>
              )}
              {section.bodyText && (
                <p className="text-sm text-[var(--ink-muted,#8A7C75)] leading-relaxed whitespace-pre-line">
                  {section.bodyText}
                </p>
              )}
              {items.length > 0 && (
                <ul className="space-y-2.5 pt-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2.5 text-sm text-[var(--ink-body,#5F534D)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-coral,#C96A50)] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[var(--ink-primary,#332924)]">{item.title}</span>
                        {item.description ? ` — ${item.description}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {(section.ctaText || section.secondaryCtaText) && (
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  {section.ctaText && (
                    <SmartActionLink href={section.ctaLink} label={section.ctaText} variant="primary" />
                  )}
                  {section.secondaryCtaText && (
                    <SmartActionLink
                      href={section.secondaryCtaLink}
                      label={section.secondaryCtaText}
                      variant="secondary"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden border border-[var(--border-warm,#E8DFD5)] bg-[var(--surface-pure,#FFFFFF)] shadow-[0_12px_30px_-8px_rgba(51,41,36,0.07)] aspect-[4/3] flex items-center justify-center">
                {section.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={section.mediaUrl}
                    alt={section.mediaAlt || section.headline}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <p className="font-display font-bold text-lg text-[var(--ink-primary,#332924)]">
                      {section.headline}
                    </p>
                    <p className="text-xs text-[var(--ink-muted,#8A7C75)]">
                      Add an image in Page Builder to showcase visuals here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : section.layout === "faq" ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 space-y-3">
              {section.eyebrow && <Badge variant="peach">{section.eyebrow}</Badge>}
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink-primary,#332924)]">
                {section.headline}
              </h2>
              {section.subheadline && (
                <p className="text-base text-[var(--ink-body,#5F534D)]">{section.subheadline}</p>
              )}
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-display font-semibold text-sm sm:text-base text-[var(--ink-primary,#332924)] cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--accent-coral,#C96A50)] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-[var(--ink-body,#5F534D)] leading-relaxed border-t border-[var(--border-warm,#E8DFD5)]/60 pt-3">
                        {item.description || item.subtitle}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl space-y-3">
                {section.eyebrow && <Badge variant="peach">{section.eyebrow}</Badge>}
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary,#332924)]">
                  {section.headline}
                </h2>
                {section.subheadline && (
                  <p className="text-base sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed">
                    {section.subheadline}
                  </p>
                )}
              </div>
              {section.ctaText && (
                <SmartActionLink href={section.ctaLink} label={section.ctaText} variant="secondary" />
              )}
            </div>

            {items.length > 0 && (
              <div
                className={
                  section.layout === "checklist"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : `grid gap-5 ${gridColsClass}`
                }
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-6 shadow-[0_6px_22px_-6px_rgba(51,41,36,0.05)] flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {item.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-[var(--border-warm,#E8DFD5)] aspect-video bg-[var(--surface-sand,#F3ECE4)] mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        {item.badge && <Badge variant="peach" size="sm">{item.badge}</Badge>}
                        {item.price && (
                          <span className="text-sm font-bold text-[var(--accent-coral,#C96A50)]">
                            {item.price}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold text-[var(--ink-primary,#332924)]">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs font-medium text-[var(--ink-muted,#8A7C75)]">
                          {item.subtitle}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm text-[var(--ink-body,#5F534D)] leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {item.bullets.map((b, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-start gap-2 text-xs text-[var(--ink-body,#5F534D)]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)] shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {item.buttonText && (
                      <Link
                        href={item.buttonLink || "/contact"}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-coral,#C96A50)] hover:text-[var(--accent-coral-hover,#B4583F)] pt-2"
                      >
                        <span>{item.buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
