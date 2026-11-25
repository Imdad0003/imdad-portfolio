"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import {
  defaultHeroQuickStart,
  defaultHeroTrustHighlights,
  defaultSiteContent,
  getSiteContent,
} from "@/lib/cms";
import { resolveStudioIcon } from "@/lib/icon-map";
import type { SiteContentDocument } from "@/types/cms";

interface HeroProps {
  initialContent?: SiteContentDocument;
}

export function Hero({ initialContent }: HeroProps) {
  const [content, setContent] = useState<SiteContentDocument>(
    initialContent || defaultSiteContent
  );

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const hero = content.hero;
  const quickStartItems =
    hero.quickStartItems && hero.quickStartItems.length > 0
      ? hero.quickStartItems
      : defaultHeroQuickStart;
  const trustHighlights =
    hero.trustHighlights && hero.trustHighlights.length > 0
      ? hero.trustHighlights
      : defaultHeroTrustHighlights;

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-5 pb-10 sm:py-16 lg:py-22 bg-[var(--background,#FAF7F2)]"
    >
      {hero.backgroundImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${hero.backgroundImage})`,
            opacity: hero.backgroundImageOpacity ?? 0.08,
          }}
        />
      )}

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 lg:gap-12 items-center">
          {/* Left Copy & Clear CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="peach" size="sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hero.badge || "CREATIVE & TECH STUDIO"}</span>
              </Badge>
              {hero.announcement && (
                <span className="text-[11px] sm:text-xs font-medium text-[var(--ink-body,#5F534D)] bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] px-2.5 sm:px-3 py-1 rounded-full max-w-full truncate">
                  {hero.announcement}
                </span>
              )}
            </div>

            <h1 className="font-display text-[1.95rem] sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-[1.1]">
              {hero.headline || "We Build Ideas Into Digital Experiences."}
            </h1>

            <p className="text-[15px] sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed max-w-2xl">
              {hero.subheadline ||
                "Creative solutions, smart technology, and professional services to help businesses grow."}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1">
              <Button
                href={hero.primaryCtaLink || "/services"}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <span>{hero.primaryCtaText || "Explore Our Services"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                href={hero.secondaryCtaLink || "/projects"}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <span>{hero.secondaryCtaText || "View Our Work"}</span>
              </Button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-3.5 sm:pt-4 border-t border-[var(--border-warm,#E8DFD5)] grid grid-cols-3 gap-2 sm:gap-3.5">
              {trustHighlights.map((item) => {
                const Icon = resolveStudioIcon(item.iconName, CheckCircle2);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 rounded-xl bg-[var(--surface-pure,#FFFFFF)]/65 sm:bg-transparent p-2 sm:p-0 border border-[var(--border-warm,#E8DFD5)]/60 sm:border-0"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral,#C96A50)] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 w-full">
                      <div className="text-[11px] sm:text-xs font-bold text-[var(--ink-primary,#332924)] leading-tight truncate">
                        {item.label}
                      </div>
                      {item.value && (
                        <div className="hidden sm:block text-[11px] text-[var(--ink-muted,#8A7C75)] truncate">
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Easy Quick-Start Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-4 sm:p-6 shadow-[0_14px_34px_-12px_rgba(51,41,36,0.08)] space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[var(--border-warm,#E8DFD5)]">
                <div>
                  <h2 className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary,#332924)]">
                    {hero.quickStartTitle || "Quick Start"}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[var(--ink-muted,#8A7C75)]">
                    {hero.quickStartSubtitle || "Pick what you need to begin"}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] shrink-0">
                  Studio Menu
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {quickStartItems.map((tile) => {
                  const TileIcon = resolveStudioIcon(tile.iconName, Sparkles);
                  return (
                    <Link
                      key={tile.id}
                      href={tile.href}
                      className="group p-3 sm:p-3.5 rounded-2xl bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)]/55 active:scale-[0.98] border border-[var(--border-warm,#E8DFD5)] hover:border-[#D8A999] transition-all flex flex-col justify-between gap-2 sm:gap-3 min-h-[104px]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] flex items-center justify-center text-[var(--accent-coral,#C96A50)] shrink-0">
                          <TileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        {tile.badge && (
                          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)] truncate max-w-[82px]">
                            {tile.badge}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary,#332924)] group-hover:text-[var(--accent-coral,#C96A50)] transition-colors flex items-center justify-between gap-1">
                          <span className="truncate">{tile.title}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                        <p className="text-[11px] sm:text-xs text-[var(--ink-muted,#8A7C75)] mt-0.5 truncate">
                          {tile.subtitle}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[var(--border-warm,#E8DFD5)] flex items-center justify-between text-xs">
                <span className="text-[var(--ink-muted,#8A7C75)]">Not sure which fits?</span>
                <Link
                  href="/pricing"
                  className="font-bold text-[var(--accent-coral,#C96A50)] hover:underline inline-flex items-center gap-1 py-1"
                >
                  <span>Compare All Plans</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
