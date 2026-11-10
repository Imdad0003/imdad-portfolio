import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  getPublishedListingSamples,
  getPublishedAPlusModules,
  getPublishedAmazonPackages,
} from "@/lib/amazon-portfolio-service";
import { AmazonListingShowcaseClient } from "@/components/services/AmazonListingShowcaseClient";
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Amazon Product Listing & A+ Content (EBC) Showcase | IMDAD.BUILDS",
  description:
    "Explore 10+ conversion-engineered Amazon product listing sample decks, 7–9 image infographic galleries, and stacked Amazon A+ Content (EBC) modules designed by IMDAD.BUILDS.",
  openGraph: {
    title: "Amazon Product Listing & A+ Content Showcase | IMDAD.BUILDS",
    description:
      "Explore 10+ product listing sample decks with 7-9 images, stacked A+ modules, and direct flat-rate packages (₹499 to ₹1,699).",
    url: `${siteConfig.siteUrl}/services/amazon-listing`,
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/services/amazon-listing`,
  },
};

export default async function AmazonListingShowcasePage() {
  const [samples, aPlusModules, packages] = await Promise.all([
    getPublishedListingSamples(),
    getPublishedAPlusModules(),
    getPublishedAmazonPackages(),
  ]);

  return (
    <main className="pt-24 sm:pt-28 pb-24 min-h-screen bg-[#FDFBF9]">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            STUDIO
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-slate-900 transition-colors">
            SERVICES
          </Link>
          <span>/</span>
          <span className="text-[#0284C7] font-bold">AMAZON LISTING &amp; A+ CONTENT</span>
        </div>

        {/* Hero Header */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-12 mb-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-900 font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                <span>E-COMMERCE CATALOG LAB</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>EasyXo Active Brand Operator</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0A192F] tracking-tight leading-tight">
              Amazon Listing &amp; A+ Content Showcase
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We design product listing image stacks and Amazon Enhanced Brand Content (EBC) engineered to maximize search discovery, overcome buyer hesitation in the first 3 seconds, and reduce return rates.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Sample Variations</span>
                <span className="text-lg font-black text-[#0A192F]">10+ Decks</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Images Per Set</span>
                <span className="text-lg font-black text-[#0A192F]">7–9 Creatives</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Starting Rate</span>
                <span className="text-lg font-black text-emerald-600">₹499 / SKU</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Turnaround</span>
                <span className="text-lg font-black text-[#0284C7]">24–48 Hours</span>
              </div>
            </div>

            {/* Fast Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="#listing-samples"
                className="px-6 py-3 rounded-xl bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                Browse 10+ Listing Sets
              </a>
              <a
                href="#aplus-showcase"
                className="px-5 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs sm:text-sm transition-all"
              >
                View A+ (EBC) Modules
              </a>
              <a
                href={getWhatsAppUrl("Hi Imdad, I would like to order an Amazon Listing Creative or A+ Content package.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Founder Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Client Showcase: Top Half Listings + Bottom Half A+ Content + Packages & Lightbox */}
        <AmazonListingShowcaseClient
          initialSamples={samples}
          initialAPlusModules={aPlusModules}
          initialPackages={packages}
        />
      </Container>
    </main>
  );
}
