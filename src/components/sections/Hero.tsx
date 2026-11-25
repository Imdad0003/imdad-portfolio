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
      className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-[var(--background,#FAF7F2)]"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Copy & Clear CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="peach" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hero.badge || "CREATIVE & TECH STUDIO"}</span>
              </Badge>
              {hero.announcement && (
                <span className="text-xs font-medium text-[var(--ink-body,#5F534D)] bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] px-3 py-1 rounded-full">
                  {hero.announcement}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-[1.08]">
              {hero.headline || "We Build Ideas Into Digital Experiences."}
            </h1>

            <p className="text-base sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed max-w-2xl">
              {hero.subheadline ||
                "Creative solutions, smart technology, and professional services to help businesses grow."}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                href={hero.primaryCtaLink || "/services"}
                variant="primary"
                size="lg"
              >
                <span>{hero.primaryCtaText || "Explore Our Services"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                href={hero.secondaryCtaLink || "/projects"}
                variant="secondary"
                size="lg"
              >
                <span>{hero.secondaryCtaText || "View Our Work"}</span>
              </Button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-4 border-t border-[var(--border-warm,#E8DFD5)] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {trustHighlights.map((item) => {
                const Icon = resolveStudioIcon(item.iconName, CheckCircle2);
                return (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral,#C96A50)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--ink-primary,#332924)] truncate">
                        {item.label}
                      </div>
                      {item.value && (
                        <div className="text-[11px] text-[var(--ink-muted,#8A7C75)] truncate">
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
            <div className="rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-5 sm:p-6 shadow-[0_18px_40px_-14px_rgba(51,41,36,0.08)] space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-warm,#E8DFD5)]">
                <div>
                  <h2 className="font-display font-bold text-base text-[var(--ink-primary,#332924)]">
                    {hero.quickStartTitle || "Quick Start"}
                  </h2>
                  <p className="text-xs text-[var(--ink-muted,#8A7C75)]">
                    {hero.quickStartSubtitle || "Pick what you need to begin"}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)]">
                  Studio Menu
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickStartItems.map((tile) => {
                  const TileIcon = resolveStudioIcon(tile.iconName, Sparkles);
                  return (
                    <Link
                      key={tile.id}
                      href={tile.href}
                      className="group p-3.5 rounded-2xl bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)]/55 border border-[var(--border-warm,#E8DFD5)] hover:border-[#D8A999] transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] flex items-center justify-center text-[var(--accent-coral,#C96A50)]">
                          <TileIcon className="w-4 h-4" />
                        </div>
                        {tile.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)]">
                            {tile.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-[var(--ink-primary,#332924)] group-hover:text-[var(--accent-coral,#C96A50)] transition-colors flex items-center justify-between gap-1">
                          <span className="truncate">{tile.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                        <p className="text-xs text-[var(--ink-muted,#8A7C75)] mt-0.5 truncate">
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
                  className="font-bold text-[var(--accent-coral,#C96A50)] hover:underline inline-flex items-center gap-1"
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
