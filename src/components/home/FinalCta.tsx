import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import { ArrowRight, Compass } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function FinalCta() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        <div className="rounded-3xl bg-gradient-to-b from-white/95 via-[#FDF9F5]/90 to-[#FAF0F4]/90 border border-[#502D55]/14 p-8 sm:p-16 text-center backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(80,45,85,0.08)] max-w-4xl mx-auto relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#935073] font-bold mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            DIRECT FOUNDER COLLABORATION // Q2-Q3 2026
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#180D1D] tracking-tight leading-[1.1]">
            Have something worth{" "}
            <span className="text-gradient-dusk block sm:inline">
              building?
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#56475C] max-w-xl mx-auto leading-relaxed">
            Whether you are conceptualizing a new mobile app, need an e-commerce storefront, or want high-converting marketplace listing assets—let&apos;s turn it into a reality.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all flex items-center justify-center gap-2 focus-ring active:scale-95"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-white text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/40 hover:bg-[#FAF4F9] transition-all flex items-center justify-center gap-2 focus-ring shadow-2xs active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#935073]" />
              <span>Explore the Studio</span>
            </Link>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl font-bold text-xs sm:text-sm bg-white/90 text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/40 hover:text-[#935073] transition-all flex items-center justify-center gap-2 focus-ring shadow-2xs active:scale-95"
              aria-label="Instagram @imdad.builds"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span>@imdad.builds</span>
            </a>
          </div>

          <div className="mt-8 pt-5 border-t border-[#502D55]/08 text-[11px] font-mono text-[#7A6880]">
            ESTIMATED TIMELINES: 3–14 DAYS &bull; SCOPED FIXED RATES &bull; ZERO RETAINER TRAPS
          </div>
        </div>
      </Container>
    </section>
  );
}
