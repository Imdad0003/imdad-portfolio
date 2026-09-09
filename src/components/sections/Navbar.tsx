"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/navigation";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, MessageSquare } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2.5 sm:py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className={`mx-auto w-full pointer-events-auto rounded-2xl sm:rounded-full transition-all duration-500 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-3 ${
            isScrolled
              ? "bg-white/85 backdrop-blur-2xl border border-[#502D55]/12 shadow-[0_12px_30px_-5px_rgba(80,45,85,0.06),inset_0_1px_0_0_rgba(255,255,255,0.95)]"
              : "bg-white/65 backdrop-blur-xl border border-[#502D55]/08 shadow-[0_6px_20px_-5px_rgba(80,45,85,0.04)]"
          }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus-ring rounded-lg py-1 shrink-0"
            aria-label="Imdad Digital Studio - Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
              <Image
                src="/imdad-logo.png"
                alt="Imdad Digital Studio Logo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#180D1D] group-hover:text-[#935073] transition-colors leading-tight">
                IMDAD
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-mono tracking-[0.2em] text-[#7A6880] uppercase">
                Digital Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 border border-[#502D55]/08 backdrop-blur-md shadow-sm"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 relative focus-ring ${
                    isActive
                      ? "text-[#180D1D] font-bold bg-white shadow-[0_2px_8px_rgba(80,45,85,0.08)] border border-[#502D55]/10"
                      : "text-[#56475C] hover:text-[#180D1D] hover:bg-white/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Instagram & "Get Started" Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-auto p-2 sm:px-3 rounded-xl text-[#56475C] hover:text-[#180D1D] bg-white/75 hover:bg-white border border-[#502D55]/12 hover:border-[#935073]/35 transition-all focus-ring flex items-center justify-center gap-1.5 text-xs shadow-xs shrink-0"
              aria-label="Instagram @imdad.builds"
              title="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span className="hidden xl:inline font-medium text-[11px]">@imdad.builds</span>
            </a>

            <Button
              href="/contact"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex text-xs px-4 py-2"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            {/* Mobile Menu Trigger (44px touch target) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#180D1D] bg-white/80 border border-[#502D55]/12 hover:border-[#935073]/35 focus-ring cursor-pointer transition-colors shadow-xs flex items-center justify-center shrink-0"
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
          <div className="rounded-2xl bg-white/95 border border-[#502D55]/12 backdrop-blur-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(80,45,85,0.12)] max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 min-h-[44px] flex items-center rounded-xl text-sm font-medium transition-colors focus-ring ${
                      isActive
                        ? "text-[#180D1D] font-bold bg-[#FAF2EA] border border-[#F6DBC0]/60"
                        : "text-[#56475C] hover:text-[#180D1D] hover:bg-[#F5EFF6]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-[#502D55]/10 flex flex-col gap-2">
                <a
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-[#180D1D] bg-white border border-[#502D55]/15 hover:border-[#935073]/40 transition-colors focus-ring shadow-xs"
                >
                  <Instagram className="w-4 h-4 text-[#935073]" />
                  <span>Instagram: @imdad.builds</span>
                </a>

                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs font-semibold text-[#180D1D] bg-white border border-[#502D55]/15 hover:border-[#935073]/40 transition-colors focus-ring shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#935073]" />
                  <span>WhatsApp: +91 7352608269</span>
                </a>

                <Button
                  href="/contact"
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
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
