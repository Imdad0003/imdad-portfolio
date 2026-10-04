import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { navItems, legalNavItems } from "@/data/navigation";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { ArrowUp, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function Footer() {
  return (
    <footer className="bg-white/80 border-t border-[#502D55]/12 pt-14 sm:pt-18 pb-[max(3rem,calc(env(safe-area-inset-bottom)+2.5rem))] text-[#56475C] text-xs sm:text-sm backdrop-blur-2xl relative overflow-hidden">
      {/* Subtle Bottom Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-[#F6DBC0]/25 via-[#935073]/05 to-transparent blur-3xl pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#502D55]/10">
          {/* Column 1: Studio Identity (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white border border-[#502D55]/10 p-0.5 shadow-2xs">
                <Image
                  src="/imdad-logo.png"
                  alt="IMDAD.BUILDS Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-[#180D1D]">
                  IMDAD.BUILDS
                </span>
                <span className="studio-tag text-[8px] text-[#935073] font-bold">
                  PRODUCT STUDIO // LAB
                </span>
              </div>
            </div>

            <p className="text-[#56475C] max-w-sm leading-relaxed text-xs sm:text-sm">
              Independent digital product studio founded by Imdad. We architect and build mobile apps, web applications, e-commerce solutions, and high-retention creative media.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[11px] font-mono text-[#180D1D] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Powered by imdad.builds
              </span>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="Direct WhatsApp Studio Desk"
                title="Direct WhatsApp (+91 7352608269)"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="Instagram @imdad.builds"
                title="Instagram @imdad.builds"
              >
                <Instagram className="w-4 h-4 text-[#935073]" />
              </a>
              <a
                href={siteConfig.links.email}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-white border border-[#502D55]/15 flex items-center justify-center text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/50 transition-all focus-ring shadow-2xs"
                aria-label="Email Studio"
                title="Email imdad.builds@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Studio Services (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="studio-tag text-xs text-[#180D1D] font-bold">
              STUDIO SERVICES
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/services/website-development"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium flex items-center justify-between group"
                >
                  <span>01 Website Development</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/services/app-development"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium flex items-center justify-between group"
                >
                  <span>02 App Development</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/services/ecommerce"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium flex items-center justify-between group"
                >
                  <span>03 E-commerce</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/services/video-editing"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium flex items-center justify-between group"
                >
                  <span>04 Video Editing</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/services/social-media"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium flex items-center justify-between group"
                >
                  <span>05 Social Media</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Apps & Ecosystem (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="studio-tag text-xs text-[#180D1D] font-bold">
              PRODUCT LAB
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/apps/wishmusic"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium"
                >
                  WishMusic
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/wishtracking"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium"
                >
                  WishTracking
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/easyxo"
                  className="text-[#56475C] hover:text-[#935073] transition-colors focus-ring rounded font-medium"
                >
                  EasyXo Platform
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/apps"
                  className="text-[11px] font-mono text-[#935073] hover:underline font-bold"
                >
                  View All Apps →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Studio Navigation & Legal (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="studio-tag text-xs text-[#180D1D] font-bold">
              EXPLORE &amp; LEGAL
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <ul className="space-y-2">
                {navItems.map((item) => (
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
              <ul className="space-y-2 text-[#7A6880]">
                {legalNavItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-[#180D1D] transition-colors focus-ring rounded"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Studio Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6880]">
          <p>© 2026 IMDAD.BUILDS. Independent Digital Product Studio.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">BUILD • CREATE • SCALE</span>
            <a
              href="#"
              className="flex items-center gap-1 text-[#180D1D] hover:text-[#935073] transition-colors font-medium focus-ring rounded"
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
