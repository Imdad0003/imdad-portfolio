"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  defaultFooterColumns,
  getSettings,
  getSiteContent,
} from "@/lib/cms";
import type { SettingsDocument, SiteContentDocument } from "@/types/cms";
import { ArrowUp, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

interface FooterProps {
  initialContent?: SiteContentDocument;
  initialSettings?: SettingsDocument | null;
}

export function Footer({ initialContent, initialSettings }: FooterProps) {
  const pathname = usePathname();
  const [siteContent, setSiteContent] = useState<SiteContentDocument | undefined>(initialContent);
  const [settings, setSettings] = useState<SettingsDocument | null | undefined>(initialSettings);

  useEffect(() => {
    Promise.all([getSiteContent(), getSettings()])
      .then(([site, setDocData]) => {
        setSiteContent(site);
        setSettings(setDocData);
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const footerData = siteContent?.footer;
  const studioName = footerData?.studioName || settings?.studioName || siteConfig.name;
  const studioBadge = footerData?.studioBadge || "Product Studio & Digital Services";
  const tagline = footerData?.tagline || settings?.tagline || siteConfig.subTagline;
  const copyrightYear = footerData?.copyrightYear || 2026;
  const logoSrc = footerData?.logo || settings?.secondaryLogo || settings?.primaryLogo || "/imdad-logo.png";

  const columns =
    footerData?.columns && footerData.columns.length > 0
      ? footerData.columns
      : defaultFooterColumns;

  const email = siteContent?.contact?.email || settings?.contactEmail || siteConfig.contact.email;
  const whatsappDisplay =
    siteContent?.contact?.whatsappDisplay ||
    settings?.whatsappNumber ||
    siteConfig.contact.whatsappDisplay;
  const instagramHandle =
    siteContent?.contact?.instagramHandle ||
    settings?.instagramHandle ||
    siteConfig.contact.instagramHandle;
  const instagramUrl =
    siteContent?.socialLinks?.instagram ||
    settings?.instagramUrl ||
    siteConfig.links.instagram;
  const whatsappUrl = siteContent?.socialLinks?.whatsapp || getWhatsAppUrl();

  return (
    <footer className="bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)] text-[var(--ink-body,#5F534D)] pb-24 md:pb-0">
      <Container className="py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-10 border-b border-[var(--border-warm,#E8DFD5)]">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] flex items-center justify-center p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt={studioName} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-display font-bold text-base text-[var(--ink-primary,#332924)]">
                  {studioName}
                </div>
                <div className="text-[11px] font-medium text-[var(--accent-coral,#C96A50)]">
                  {studioBadge}
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[var(--ink-body,#5F534D)] max-w-sm">
              {tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-xs font-medium text-[var(--ink-primary,#332924)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>{email}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-xs font-medium text-[var(--ink-primary,#332924)] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>{whatsappDisplay}</span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-xs font-medium text-[var(--ink-primary,#332924)] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>{instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {columns.map((col) => (
              <div key={col.id} className="space-y-2.5 sm:space-y-3">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--ink-primary,#332924)]">
                  {col.title}
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {col.links.map((lnk, idx) => (
                    <li key={idx}>
                      <Link
                        href={lnk.href}
                        className="text-sm text-[var(--ink-body,#5F534D)] hover:text-[var(--accent-coral,#C96A50)] transition-colors inline-flex items-center gap-1 py-1 sm:py-0 group"
                      >
                        <span>{lnk.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:inline" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-muted,#8A7C75)]">
          <p>
            {footerData?.copyrightText ||
              `© ${copyrightYear} ${studioName}. Built with clarity and craft.`}
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-xs font-semibold text-[var(--ink-primary,#332924)] cursor-pointer transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
            <span>Back to top</span>
          </button>
        </div>
      </Container>
    </footer>
  );
}
