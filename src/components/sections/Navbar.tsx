"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/navigation";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, MessageSquare, ChevronDown } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2.5 sm:py-3.5 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className={`mx-auto w-full pointer-events-auto rounded-2xl sm:rounded-full transition-all duration-500 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 ${
            isScrolled
              ? "bg-white/90 backdrop-blur-2xl border border-[#502D55]/14 shadow-[0_12px_30px_-5px_rgba(80,45,85,0.07),inset_0_1px_0_0_rgba(255,255,255,0.95)]"
              : "bg-white/75 backdrop-blur-xl border border-[#502D55]/10 shadow-[0_6px_20px_-5px_rgba(80,45,85,0.04)]"
          }`}
        >
          {/* Brand Logo & Studio Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-ring rounded-lg py-1 shrink-0"
            aria-label="IMDAD.BUILDS - Product Studio"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-xl bg-white border border-[#502D55]/10 p-0.5 shadow-2xs group-hover:border-[#935073]/40 transition-colors">
              <Image
                src="/imdad-logo.png"
                alt="IMDAD.BUILDS Logo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#180D1D] group-hover:text-[#935073] transition-colors leading-tight">
                  IMDAD.BUILDS
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" title="Studio Open for Projects" />
              </div>
              <span className="studio-tag text-[7.5px] sm:text-[8px] text-[#7A6880] leading-none">
                PRODUCT STUDIO // LAB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 border border-[#502D55]/08 backdrop-blur-md shadow-xs"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              if (item.subItems && item.label === "Services") {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 relative focus-ring flex items-center gap-1 ${
                        isActive
                          ? "text-[#180D1D] bg-white shadow-[0_2px_8px_rgba(80,45,85,0.08)] border border-[#502D55]/12"
                          : "text-[#56475C] hover:text-[#180D1D] hover:bg-white/60"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </Link>

                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-[#502D55]/12 shadow-[0_20px_40px_rgba(80,45,85,0.12)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-1.5 mb-1 border-b border-[#502D55]/08 flex items-center justify-between">
                          <span className="studio-tag text-[9px] text-[#7A6880]">STUDIO DISCIPLINES</span>
                          <Link href="/services" className="text-[10px] text-[#935073] hover:underline font-semibold">
                            All Services →
                          </Link>
                        </div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className="block p-2 rounded-xl hover:bg-[#FAF4F9] text-left transition-colors group"
                          >
                            <span className="block text-xs font-bold text-[#180D1D] group-hover:text-[#935073]">
                              {sub.label}
                            </span>
                            {sub.description && (
                              <span className="block text-[10px] text-[#7A6880] mt-0.5 leading-snug">
                                {sub.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 relative focus-ring flex items-center gap-1.5 ${
                    isActive
                      ? "text-[#180D1D] bg-white shadow-[0_2px_8px_rgba(80,45,85,0.08)] border border-[#502D55]/12"
                      : "text-[#56475C] hover:text-[#180D1D] hover:bg-white/60"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#502D55]/08 text-[9px] font-mono text-[#935073] uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Instagram & "Start a Project" Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-auto p-2 sm:px-3 rounded-xl text-[#56475C] hover:text-[#180D1D] bg-white/80 hover:bg-white border border-[#502D55]/12 hover:border-[#935073]/35 transition-all focus-ring flex items-center justify-center gap-1.5 text-xs shadow-2xs shrink-0"
              aria-label="Instagram @imdad.builds"
              title="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span className="hidden xl:inline font-semibold text-[11px]">@imdad.builds</span>
            </a>

            <Button
              href="/contact"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex text-xs px-4 py-2 font-bold shadow-xs"
            >
              Start a Project
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            {/* Mobile Menu Trigger (44px touch target) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#180D1D] bg-white/90 border border-[#502D55]/12 hover:border-[#935073]/35 focus-ring cursor-pointer transition-colors shadow-2xs flex items-center justify-center shrink-0"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Glass Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto px-3 sm:px-6 mt-2 pointer-events-auto">
          <div className="rounded-2xl bg-white/98 border border-[#502D55]/14 backdrop-blur-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(80,45,85,0.15)] max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#502D55]/08">
              <span className="studio-tag text-[9px] text-[#7A6880]">IMDAD.BUILDS // NAVIGATION</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300/60 text-[9px] font-mono text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Studio
              </span>
            </div>

            <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <div key={item.label} className="flex flex-col">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 min-h-[44px] flex items-center justify-between rounded-xl text-sm font-semibold transition-colors focus-ring ${
                        isActive
                          ? "text-[#180D1D] bg-[#FAF2EA] border border-[#F6DBC0]/80 shadow-2xs"
                          : "text-[#56475C] hover:text-[#180D1D] hover:bg-[#F5EFF6]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#502D55]/08 text-[9px] font-mono text-[#935073] uppercase">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>

                    {item.subItems && item.label === "Services" && (
                      <div className="pl-4 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 border-[#502D55]/10 ml-3">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium text-[#7A6880] hover:text-[#180D1D] hover:bg-[#FAF4F9] flex items-center justify-between"
                          >
                            <span>{sub.label}</span>
                            <span className="text-[10px] text-[#935073]">→</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-3 mt-2 border-t border-[#502D55]/10 flex flex-col gap-2">
                <a
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-[#180D1D] bg-white border border-[#502D55]/15 hover:border-[#935073]/40 transition-colors focus-ring shadow-2xs"
                >
                  <Instagram className="w-4 h-4 text-[#935073]" />
                  <span>Instagram @imdad.builds</span>
                </a>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-[#180D1D] bg-white border border-[#502D55]/15 hover:border-[#935073]/40 transition-colors focus-ring shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#935073]" />
                  <span>Direct WhatsApp Studio Desk</span>
                </a>

                <Button
                  href="/contact"
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs min-h-[44px] font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
