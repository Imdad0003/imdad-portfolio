"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CorePackagesSection } from "@/components/pricing/CorePackagesSection";
import { ArrowRight } from "lucide-react";

export function HomePackagesSection() {
  return (
    <section className="py-14 sm:py-20 border-b border-[#E8DFD5] bg-white">
      <Container>
        <CorePackagesSection
          title="Direct Commercial Packages"
          subtitle="Fixed-rate packages for Amazon listings, A+ Content, and digital commerce."
        />
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C96A50] hover:text-[#B4583F] transition-colors"
          >
            <span>Explore full service pricing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
