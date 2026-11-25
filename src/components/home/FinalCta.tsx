"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getWhatsAppUrl } from "@/data/config";
import { defaultSiteContent, getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import { ArrowRight, Mail, MessageSquare } from "lucide-react";

interface FinalCtaProps {
  initialContent?: SiteContentDocument;
}

export function FinalCta({ initialContent }: FinalCtaProps) {
  const [content, setContent] = useState<SiteContentDocument>(
    initialContent || defaultSiteContent
  );

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const cta = content.finalCta;
  const email = content.contact?.email || "imdad.builds@gmail.com";
  const whatsappUrl = content.socialLinks?.whatsapp || getWhatsAppUrl();

  return (
    <section
      id="final-cta"
      className="py-10 sm:py-24 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <div className="rounded-3xl bg-gradient-to-br from-[var(--surface-peach,#FAECE4)]/70 via-[var(--background,#FAF7F2)] to-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-6 sm:p-12 lg:p-16 text-center shadow-[0_14px_36px_-10px_rgba(51,41,36,0.06)]">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
            {cta.eyebrow && <Badge variant="peach">{cta.eyebrow}</Badge>}

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-[1.12]">
              {cta.headline}
            </h2>

            <p className="text-sm sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed">
              {cta.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 pt-2">
              <Button
                href={cta.primaryCtaLink || "/contact"}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <span>{cta.primaryCtaText || "Start a Project"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                href={cta.secondaryCtaLink || "/services"}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <span>{cta.secondaryCtaText || "Explore Services"}</span>
              </Button>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-[var(--border-warm,#E8DFD5)]/80 flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs font-semibold text-[var(--ink-body,#5F534D)]">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--accent-coral,#C96A50)] transition-colors py-1"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>{email}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--accent-coral,#C96A50)] transition-colors py-1"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>Chat directly on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
