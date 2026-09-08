"use client";

import React from "react";
import { Container } from "@/components/ui/Container";

const platforms = [
  { name: "Amazon", role: "Catalog & Ads" },
  { name: "Flipkart", role: "Seller Hub" },
  { name: "Meesho", role: "Marketplace" },
  { name: "Shopify", role: "D2C Commerce" },
  { name: "WordPress", role: "Web & Content" },
  { name: "SmartBiz", role: "Storefront" },
  { name: "Meta Ads", role: "Paid Acquisition" },
  { name: "Canva", role: "Creative Design" },
  { name: "Gemini", role: "Generative AI" },
  { name: "Razorpay", role: "Payments" },
];

export function PlatformStrip() {
  return (
    <section className="py-10 border-y border-[#F6DBC0]/10 bg-[rgba(24,10,29,0.55)] backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#130917] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#130917] to-transparent z-10 pointer-events-none" />

      <Container size="wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="shrink-0 text-center md:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F6DBC0]/80 block">
              Execution Platforms
            </span>
            <span className="text-xs text-[#bba89d]">
              Ecosystem &amp; Tools I Deploy
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none w-full md:w-auto justify-start md:justify-end">
            {platforms.map((platform, idx) => (
              <div
                key={idx}
                className="group shrink-0 px-4 py-2.5 rounded-xl bg-[rgba(56,24,66,0.35)] hover:bg-[rgba(80,45,85,0.55)] border border-[#F6DBC0]/12 hover:border-[#F6DBC0]/35 transition-all duration-300 flex flex-col items-center justify-center cursor-default backdrop-blur-sm"
              >
                <span className="text-xs sm:text-sm font-bold text-[#F8F4E9] tracking-tight group-hover:text-[#F6DBC0] transition-colors">
                  {platform.name}
                </span>
                <span className="text-[10px] text-[#bba89d] group-hover:text-[#e0d5c8] transition-colors">
                  {platform.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
