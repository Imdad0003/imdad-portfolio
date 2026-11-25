"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/navigation";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { getSettings, getSiteContent } from "@/lib/cms";
import type { SettingsDocument, SiteContentDocument } from "@/types/cms";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, MessageSquare, ChevronDown } from "lucide-react";

interface NavbarProps {
  initialContent?: SiteContentDocument;
  initialSettings?: SettingsDocument | null;
}

export function Navbar({ initialContent, initialSettings }: NavbarProps) {
  const pathname = usePathname();
  const [siteContent, setSiteContent] = useState<SiteContentDocument | undefined>(initialContent);
  const [settings, setSettings] = useState<SettingsDocument | null | undefined>(initialSettings);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getSiteContent(), getSettings()])
      .then(([site, setDocData]) => {
        setSiteContent(site);
        setSettings(setDocData);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      setServicesOpen(false);
    });
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navConfig = siteContent?.navigation;
  const brandName = navConfig?.brandName || settings?.studioName || siteConfig.name;
  const logoSrc = navConfig?.logo || settings?.primaryLogo || "/imdad-logo.png";
  const ctaText = navConfig?.ctaText || "Start a Project";
  const ctaLink = navConfig?.ctaLink || "/contact";
  const topLinks =
    navConfig?.navLinks && navConfig.navLinks.length > 0
      ? navConfig.navLinks
      : navItems.map((n) => ({ label: n.label, href: n.href, isExternal: false }));

  const servicesSubItems = (
    navConfig?.servicesDropdown && navConfig.servicesDropdown.length > 0
      ? navConfig.servicesDropdown.filter((s) => s.enabled ?? true)
      : navItems.find((n) => n.label === "Services")?.subItems || []
  );

  const whatsappUrl = siteContent?.socialLinks?.whatsapp || getWhatsAppUrl();

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-[var(--surface-pure,#FFFFFF)]/95 backdrop-blur-md border-b border-[var(--border-warm,#E8DFD5)] shadow-[0_4px_20px_-6px_rgba(51,41,36,0.06)]"
          : "bg-[var(--background,#FAF7F2)]/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] flex items-center justify-center p-1.5 shadow-2xs group-hover:border-[var(--accent-coral,#C96A50)] transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt={brandName} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-[var(--ink-primary,#332924)] leading-none">
              {brandName}
            </span>
            <span className="text-[10px] font-medium text-[var(--ink-muted,#8A7C75)] hidden sm:block mt-0.5">
              {navConfig?.badgeText || "Digital Product Studio"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {topLinks.map((item) => {
            const isServices =
              item.href === "/services" || item.label.toLowerCase() === "services";
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            if (isServices && servicesSubItems.length > 0) {
              return (
                <div key={item.label} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setServicesOpen(!servicesOpen)}
                    aria-expanded={servicesOpen}
                    className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      isActive || servicesOpen
                        ? "bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] font-semibold"
                        : "text-[var(--ink-body,#5F534D)] hover:text-[var(--ink-primary,#332924)] hover:bg-[var(--surface-pure,#FFFFFF)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {servicesOpen && (
                    <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] shadow-xl p-2 space-y-1 z-50">
                      {servicesSubItems.map((sub) => (
                        <Link
                          key={sub.href + sub.label}
                          href={sub.href}
                          className="block p-3 rounded-xl hover:bg-[var(--background,#FAF7F2)] transition-colors group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-[var(--ink-primary,#332924)] group-hover:text-[var(--accent-coral,#C96A50)]">
                              {sub.label}
                            </span>
                            {sub.badge && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)]">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-xs text-[var(--ink-muted,#8A7C75)] mt-0.5">
                              {sub.description}
                            </p>
                          )}
                        </Link>
                      ))}
                      <div className="pt-1 mt-1 border-t border-[var(--border-warm,#E8DFD5)]">
                        <Link
                          href="/services"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[var(--accent-coral,#C96A50)] hover:bg-[var(--surface-peach,#FAECE4)]/50"
                        >
                          <span>View All Studio Services</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (item.isExternal) {
              return (
                <a
                  key={item.label + item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-full text-sm font-medium text-[var(--ink-body,#5F534D)] hover:text-[var(--ink-primary,#332924)] hover:bg-[var(--surface-pure,#FFFFFF)] transition-colors"
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] font-semibold"
                    : "text-[var(--ink-body,#5F534D)] hover:text-[var(--ink-primary,#332924)] hover:bg-[var(--surface-pure,#FFFFFF)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--border-warm,#E8DFD5)] bg-[var(--surface-pure,#FFFFFF)] hover:border-[#D8A999] text-xs font-semibold text-[var(--ink-primary,#332924)] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
            <span>WhatsApp</span>
          </a>
          <Button href={ctaLink} variant="primary" size="sm">
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Right Quick Actions */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-xl bg-[var(--surface-peach,#FAECE4)] border border-[#F0CFC0] text-xs font-bold text-[var(--accent-coral-hover,#B4583F)] active:scale-95 transition-transform"
            aria-label="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)] cursor-pointer active:scale-95 transition-transform"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[#332924]/20 z-30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden relative z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)] px-4 pt-3 pb-6 space-y-1.5 shadow-xl">
            {topLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 min-h-[46px] rounded-2xl text-sm font-semibold active:scale-[0.99] transition-transform ${
                    isActive
                      ? "bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)]"
                      : "text-[var(--ink-primary,#332924)] hover:bg-[var(--background,#FAF7F2)]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-45" />
                </Link>
              );
            })}

            {servicesSubItems.length > 0 && (
              <div className="pt-2 mt-1 border-t border-[var(--border-warm,#E8DFD5)] space-y-1.5">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted,#8A7C75)] cursor-pointer"
                >
                  <span>Studio Services Menu</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileServicesOpen && (
                  <div className="grid grid-cols-1 gap-1.5">
                    {servicesSubItems.map((sub) => (
                      <Link
                        key={sub.href + sub.label}
                        href={sub.href}
                        className="flex items-center justify-between gap-2 px-3.5 min-h-[44px] py-2 rounded-xl bg-[var(--background,#FAF7F2)] active:bg-[var(--surface-peach,#FAECE4)] transition-colors"
                      >
                        <span className="text-xs font-semibold text-[var(--ink-primary,#332924)] truncate">
                          {sub.label}
                        </span>
                        {sub.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] shrink-0">
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 grid grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 min-h-[46px] px-3 rounded-full border border-[var(--border-warm,#E8DFD5)] bg-[var(--background,#FAF7F2)] text-xs font-bold text-[var(--ink-primary,#332924)]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
                <span>WhatsApp</span>
              </a>
              <Button href={ctaLink} variant="primary" size="md" className="w-full justify-center">
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
