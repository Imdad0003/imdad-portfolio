"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { studioServices } from "@/data/servicesData";
import { getPublishedServices } from "@/lib/cms";
import {
  allServices,
  pricingCategories,
  formatPriceShort,
  ServiceItem,
} from "@/data/pricing";
import {
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Palette,
  Video,
  Globe,
  Share2,
  TrendingUp,
  Cpu,
  FileCheck,
  MessageSquare,
} from "lucide-react";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ecommerce: ShoppingBag,
  creatives: Palette,
  video: Video,
  websites: Globe,
  social: Share2,
  marketing: TrendingUp,
  ai: Cpu,
  setup: FileCheck,
};

const categoryDescriptions: Record<string, string> = {
  ecommerce: "Marketplace listing creation, keyword indexing, catalog mapping, and competitor benchmarking.",
  creatives: "High-contrast hero images, feature callouts, dimensions, and conversion-engineered listing decks.",
  video: "Short-form vertical video demonstration reels and authentic creator-style hooks tested for high CTR.",
  websites: "Fast, mobile-optimized storefronts and corporate websites with seamless Razorpay payment integration.",
  social: "Consistent monthly organic content calendars, post graphics, and reel concepts for brand presence.",
  marketing: "Targeted Meta ad campaigns, pixel tracking, and creative split-testing built to maximize ROAS.",
  ai: "AI-accelerated photorealistic product background staging, video synthesis, and avatar pitches.",
  setup: "Operational documentation support and seller portal walkthroughs. Guidance only, not legal or CA tax representation.",
};

export default function ServicesPage() {
  const categories = pricingCategories.filter((c) => c.id !== "all");
  const [disciplines, setDisciplines] = useState(studioServices);

  useEffect(() => {
    getPublishedServices()
      .then((docs) => {
        if (docs && docs.length > 0) {
          const mapped = docs.map((d, idx) => ({
            id: d.id,
            number: String(idx + 1).padStart(2, "0"),
            title: d.name,
            slug: d.slug,
            tagline: d.shortDescription,
            shortDescription: d.shortDescription,
            fullDescription: d.description,
            capabilities: d.deliverables,
            deliverables: d.deliverables,
            suitableFor: ["Businesses & Creators"],
            process: (d.process || []).map((p) => ({
              step: p.step,
              title: p.title,
              description: p.description,
            })),
            packages: (d.pricing || []).map((pkg) => ({
              name: pkg.tierName,
              price: parseInt(pkg.price.replace(/[^0-9]/g, ""), 10) || 0,
              priceType: "fixed" as const,
              unit: pkg.turnaround || "per project",
              description: pkg.description,
              features: pkg.deliverables,
            })),
            hasRealPricing: true,
            faqs: d.faq || [],
            accentColor: d.accentColor || "#0284C7",
            iconName: d.iconName || "Globe",
          }));
          setDisciplines(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleGetStarted = (service: ServiceItem) => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: service.chatbotPrompt,
        },
      })
    );
  };

  const getServiceTargetUrl = (service: ServiceItem): string => {
    if (
      service.id.includes("amazon") ||
      service.id.includes("creative") ||
      service.id.includes("listing")
    ) {
      return "/services/amazon-listing";
    }
    if (service.category === "ecommerce") {
      return "/services/ecommerce";
    }
    if (service.category === "websites") {
      return "/services/website-development";
    }
    if (service.category === "video") {
      return "/services/video-editing";
    }
    if (service.category === "social") {
      return "/services/social-media";
    }
    return `/contact?service=${encodeURIComponent(service.name)}`;
  };

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Page Header */}
        <SectionHeading
          badgeText="Digital Capabilities"
          title="Digital Services Engineered For E-Commerce &amp; Growth"
          description="Every service is quoted transparently with clear deliverables and an active operator mindset."
          align="center"
          as="h1"
        />

        {/* Category Jump Anchor Bar */}
        <div className="mt-8 flex justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar px-2 sm:px-0">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/85 border border-slate-200 backdrop-blur-xl shadow-xs min-w-max">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-4 py-2 min-h-[44px] inline-flex items-center rounded-full text-xs font-semibold text-slate-600 hover:text-[#0284C7] hover:bg-slate-50 transition-all whitespace-nowrap focus-ring"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>

        {/* 5 Core Studio Disciplines Dedicated Hub */}
        <div className="mt-12 mb-16 p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
            <div>
              <span className="studio-tag text-[10px] text-[#0284C7] font-mono font-bold block mb-1 uppercase tracking-wider">
                IN-DEPTH SERVICE DIRECTORIES
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F]">
                The 5 Studio Disciplines
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Each discipline has dedicated scopes, process blueprints, deliverables, and transparent packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((d, idx) => (
              <Link
                key={d.id}
                href={`/services/${d.slug}`}
                className="p-5 rounded-2xl bg-slate-50/70 hover:bg-sky-50/50 border border-slate-200 hover:border-[#0284C7]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-black text-[#0284C7] block mb-1">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-bold text-base text-[#0A192F] group-hover:text-[#0284C7] flex items-center justify-between">
                    <span>{d.title}</span>
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {d.shortDescription}
                  </p>
                </div>
              </Link>
            ))}

            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="studio-tag text-[10px] text-amber-900 font-mono font-bold block mb-1 uppercase tracking-wider">
                  SHOWCASE PORTFOLIO // 10+ SAMPLES
                </span>
                <h3 className="font-bold text-base text-[#0A192F]">Amazon Listing &amp; A+ Content</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Explore 10+ variation sample decks (7–9 images each), stacked A+ module banners, and transparent packages.
                </p>
              </div>
              <Link
                href="/services/amazon-listing"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
              >
                <span>View Dedicated Showcase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between">
              <div>
                <span className="studio-tag text-[10px] text-[#0284C7] font-mono font-bold block mb-1 uppercase tracking-wider">CUSTOM SCOPE</span>
                <h3 className="font-bold text-base text-[#0A192F]">Need Multi-Service Setup?</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Combine website, cataloging, video ads, and brand packaging into a single coordinated rollout.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:underline"
              >
                <span>Discuss Full-Stack Scope</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Categorized Service Sections */}
        <div className="mt-8 space-y-24">
          {categories.map((cat) => {
            const services = allServices.filter((s) => s.category === cat.id);
            const Icon = categoryIcons[cat.id] || Sparkles;

            return (
              <section key={cat.id} id={cat.id} className="scroll-mt-28">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#0A192F] tracking-tight">
                        {cat.label}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {categoryDescriptions[cat.id]}
                      </p>
                    </div>
                  </div>

                  {cat.id === "setup" && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Process Guidance &amp; Documentation Only</span>
                    </div>
                  )}
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl p-5 sm:p-6 bg-white/80 border border-slate-200 hover:border-[#0284C7]/40 hover:bg-white backdrop-blur-xl transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md hover:-translate-y-1"
                    >
                      <div>
                        {/* Top: Name & Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
                            {service.name}
                          </h3>
                          {service.badge && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7] shrink-0">
                              {service.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Price Display */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1.5">
                          {service.priceType === "starting" && (
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Starting</span>
                          )}
                          <span className="text-2xl font-black text-[#0A192F]">
                            {formatPriceShort(service)}
                          </span>
                          <span className="text-xs text-slate-500">{service.unit}</span>
                        </div>

                        {/* Note disclaimer if applicable */}
                        {service.note && (
                          <div className="mt-2 text-[11px] text-[#0284C7] italic">
                            * {service.note}
                          </div>
                        )}

                        {/* Deliverables */}
                        <div className="mt-5 space-y-1.5">
                          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                            Deliverables:
                          </div>
                          <ul className="space-y-1.5">
                            {service.deliverables.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-slate-600"
                              >
                                <Check className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={getServiceTargetUrl(service)}
                          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-xs font-bold bg-white hover:bg-[#0A192F] hover:text-white text-[#0A192F] border border-slate-200 hover:border-[#0A192F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs focus-ring text-center"
                        >
                          <span>{service.id.includes("amazon") || service.id.includes("creative") || service.id.includes("listing") ? "Explore Showcase" : "View Service Scope"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleGetStarted(service)}
                          className="p-3 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 text-slate-500 hover:text-[#0284C7] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Ask AI Assistant about this service"
                          aria-label="Ask AI Assistant about this service"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-16 sm:mt-24 rounded-3xl bg-white/90 border border-slate-200 p-6 sm:p-10 text-center backdrop-blur-xl max-w-3xl mx-auto shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-[#0A192F]">
            Looking for a custom package or specific scope?
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every business has different SKU volumes and creative requirements. Use our interactive pricing calculator or chat directly with the AI assistant.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] inline-flex items-center justify-center rounded-full text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369A1] transition-all shadow-sm"
            >
              View Pricing Calculator
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] inline-flex items-center justify-center rounded-full text-xs font-semibold text-[#0A192F] hover:bg-slate-50 bg-white border border-slate-200 transition-all"
            >
              Contact Direct
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
