import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import { ArrowRight } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <Container>
        <div className="rounded-3xl bg-gradient-to-b from-white/90 via-[#FDF9F5]/90 to-[#FAF0F4]/85 border border-[#502D55]/10 p-8 sm:p-14 text-center backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(80,45,85,0.07)] max-w-4xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#935073] font-bold mb-3">
            Available For Select Projects
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#180D1D] tracking-tight">
            Have a project in mind? <br />
            <span className="text-gradient-dusk">Let&apos;s build it.</span>
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-[#56475C] max-w-xl mx-auto leading-relaxed">
            Whether you need high-converting marketplace listings, an online store, or creative visual assets—let&apos;s turn your product into a strong digital business.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all flex items-center justify-center gap-2 focus-ring active:scale-95"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white/90 text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/40 hover:bg-white hover:text-[#935073] transition-all flex items-center justify-center gap-2 focus-ring shadow-xs active:scale-95"
            >
              <Instagram className="w-4 h-4 text-[#935073]" />
              <span>DM on Instagram</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
