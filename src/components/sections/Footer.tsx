import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { navItems, legalNavItems } from "@/data/navigation";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { ArrowUp, Mail, MessageSquare } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Footer() {
  return (
    <footer className="bg-white/70 border-t border-[#502D55]/10 pt-16 pb-12 text-[#56475C] text-xs sm:text-sm backdrop-blur-xl relative overflow-hidden">
      {/* Subtle Bottom Warm Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-gradient-to-t from-[#F6DBC0]/20 to-transparent blur-3xl pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#502D55]/10">
          {/* Column 1: Studio Identity (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                <Image
                  src="/imdad-logo.png"
                  alt="Imdad Digital Studio Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-[#180D1D]">
                  IMDAD
                </span>
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#935073] uppercase font-semibold">
                  Digital Studio
                </span>
              </div>
            </div>

            <p className="text-[#56475C] max-w-sm leading-relaxed text-xs sm:text-sm">
              E-commerce Entrepreneur &amp; Digital Business Specialist.
              Founder of EasyXo. Building conversion-engineered marketplace listings,
              product creatives, digital storefronts, and growth assets.
            </p>

            {/* Direct Connect Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="WhatsApp (+91 7352608269)"
                title="Chat on WhatsApp (+91 7352608269)"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="Instagram @imdad.builds"
                title="Instagram @imdad.builds"
              >
                <Instagram className="w-4 h-4 text-[#935073]" />
              </a>
              <a
                href={siteConfig.links.email}
                className="w-9 h-9 rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="Email"
                title="Email Imdad"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-[#7A6880] pt-1">
              Instagram:{" "}
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#935073] hover:underline font-semibold"
              >
                {siteConfig.contact.instagramHandle}
              </a>
            </p>
          </div>

          {/* Column 2: Navigation Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold">
              Navigation
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded text-xs sm:text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & FAQ (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#180D1D] font-bold">
              Legal &amp; Policy
            </div>
            <ul className="space-y-2 text-[#56475C] text-xs sm:text-sm">
              {legalNavItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[#7A6880] pt-3 leading-relaxed">
              Independent personal brand &amp; digital services studio. All business setup assistance is process guidance &amp; documentation support only.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6880]">
          <p>© 2026 Imdad. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Independent Personal Brand</span>
            <a
              href="#"
              className="flex items-center gap-1 text-[#180D1D] hover:text-[#935073] transition-colors font-medium"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
