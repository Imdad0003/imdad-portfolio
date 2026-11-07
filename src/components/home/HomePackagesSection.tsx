"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CorePackagesSection } from "@/components/pricing/CorePackagesSection";
import { ArrowRight } from "lucide-react";

export function HomePackagesSection() {
  return (
    <section className="py-14 sm:py-20 border-b border-slate-200/60 bg-gradient-to-b from-transparent via-white/50 to-transparent relative">
      <Container>
        <CorePackagesSection
          title="Direct Commercial Packages"
          subtitle="Fixed-rate, conversion-focused packages for Amazon listings, A+ Content, and digital commerce."
        />
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors"
          >
            <span>Explore full service pricing &amp; custom calculator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
