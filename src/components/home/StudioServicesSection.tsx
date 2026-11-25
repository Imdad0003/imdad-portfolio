"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { defaultSiteContent, getPublishedServices, getSiteContent } from "@/lib/cms";
import { resolveStudioIcon } from "@/lib/icon-map";
import type { ServiceDocument, SiteContentDocument } from "@/types/cms";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface StudioServicesSectionProps {
  initialContent?: SiteContentDocument;
  initialServices?: ServiceDocument[];
}

export function StudioServicesSection({
  initialContent,
  initialServices,
}: StudioServicesSectionProps) {
  const [content, setContent] = useState<SiteContentDocument>(
    initialContent || defaultSiteContent
  );
  const [services, setServices] = useState<ServiceDocument[]>(initialServices || []);

  useEffect(() => {
    Promise.all([getSiteContent(), getPublishedServices()])
      .then(([site, svcs]) => {
        setContent(site);
        setServices(svcs);
      })
      .catch(() => {});
  }, []);

  const sec = content.servicesSection || {};
  const displayedIds = sec.displayedServiceIds || [];
  const filteredServices =
    displayedIds.length > 0
      ? displayedIds
          .map((id) => services.find((s) => s.id === id))
          .filter((s): s is ServiceDocument => Boolean(s))
      : services.filter((s) => s.featured !== false);

  const visibleServices = filteredServices.length > 0 ? filteredServices : services;

  const cols = sec.columns || 3;
  const gridClass =
    cols === 2
      ? "grid-cols-1 md:grid-cols-2"
      : cols === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="services"
      className="py-16 sm:py-20 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <SectionHeading
            badgeText={sec.eyebrow || "OUR SERVICES"}
            title={sec.title || "What We Can Build For You"}
            description={
              sec.subtitle ||
              "Pick a clear digital service below — whether you need quick edits or a full launch."
            }
            className="mb-0"
          />
          <Button
            href={sec.ctaLink || "/services"}
            variant="secondary"
            size="md"
            className="self-start md:self-auto shrink-0"
          >
            <span>{sec.ctaText || "Compare All Services"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className={`grid gap-6 ${gridClass}`}>
          {visibleServices.map((svc) => {
            const Icon = resolveStudioIcon(svc.iconName, Sparkles);
            const firstPrice = svc.pricing?.[0]?.price;

            return (
              <Card key={svc.id} variant="glass" className="flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral,#C96A50)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    {firstPrice && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)]">
                        From {firstPrice}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-[var(--ink-primary,#332924)]">
                      {svc.name}
                    </h3>
                    <p className="text-sm text-[var(--ink-body,#5F534D)] mt-2 leading-relaxed">
                      {svc.shortDescription || svc.description}
                    </p>
                  </div>

                  {svc.deliverables && svc.deliverables.length > 0 && (
                    <ul className="space-y-2 pt-2 border-t border-[var(--border-warm,#E8DFD5)]/70">
                      {svc.deliverables.slice(0, 3).map((deliv, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-[var(--ink-body,#5F534D)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)] shrink-0 mt-0.5" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-coral,#C96A50)] hover:text-[var(--accent-coral-hover,#B4583F)] pt-2"
                >
                  <span>Explore {svc.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
