"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import {
  Video,
  ShoppingBag,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Film,
  Play,
  Layers,
  Code,
} from "lucide-react";

interface StudioServicesSectionProps {
  initialContent?: SiteContentDocument["servicesSection"];
}

interface CoreServiceCard {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  deliverables: string[];
  featuresBadge: string;
  badgeVariant: string;
  visualType: "video" | "ecom" | "web" | "tech";
}

export function StudioServicesSection({ initialContent }: StudioServicesSectionProps) {
  const [headerContent, setHeaderContent] = useState({
    eyebrow: initialContent?.eyebrow || "STUDIO SERVICES // 4 CORE DISCIPLINES",
    title: initialContent?.title || "Specialized Studio Services",
    subtitle:
      initialContent?.subtitle ||
      "Direct-response video editing, marketplace e-commerce creatives, custom web architecture, and purpose-built digital tools.",
    ctaText: initialContent?.ctaText || "VIEW ALL SERVICES & PACKAGES",
    ctaLink: initialContent?.ctaLink || "/services",
  });

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.servicesSection) {
          setHeaderContent({
            eyebrow: content.servicesSection.eyebrow || "STUDIO SERVICES // 4 CORE DISCIPLINES",
            title: content.servicesSection.title || "Specialized Studio Services",
            subtitle:
              content.servicesSection.subtitle ||
              "Direct-response video editing, marketplace e-commerce creatives, custom web architecture, and purpose-built digital tools.",
            ctaText: content.servicesSection.ctaText || "VIEW ALL SERVICES & PACKAGES",
            ctaLink: content.servicesSection.ctaLink || "/services",
          });
        }
      })
      .catch(() => {});
  }, []);

  const coreServices: CoreServiceCard[] = [
    {
      id: "video-editing",
      number: "01",
      title: "Video Editing",
      subtitle: "Reels, YouTube videos & commercial advertisements",
      description:
        "High-retention video production tailored to stop the scroll, sustain watch-time, and drive conversion. Fast delivery, custom sound design, and platform-specific pacing for modern social platforms.",
      route: "/services/video-editing",
      icon: Video,
      deliverables: [
        "Short-Form Reels & Shorts (9:16)",
        "YouTube Long-Form Content",
        "Commercial & Direct-Response Ads",
        "Kinetic Captions & Sound Effects",
      ],
      featuresBadge: "FAST 24-48H TURNAROUND",
      badgeVariant: "emerald",
      visualType: "video",
    },
    {
      id: "ecommerce-creative",
      number: "02",
      title: "E-commerce Creative",
      subtitle: "Amazon listing images, product creatives & A+ content",
      description:
        "Conversion-engineered visual assets for marketplace sellers and D2C brands. High-contrast main hero images, infographic decks, dimension breakdowns, and cohesive A+ brand storytelling.",
      route: "/services/amazon-listing",
      icon: ShoppingBag,
      deliverables: [
        "Amazon Listing Infographics (7-Image Decks)",
        "A+ Brand Story & Premium Modules",
        "High-CTR Main Product Images",
        "Packaging & Unboxing Collateral",
      ],
      featuresBadge: "ALGORITHM & CONVERSION FIRST",
      badgeVariant: "blue",
      visualType: "ecom",
    },
    {
      id: "web-development",
      number: "03",
      title: "Web Development",
      subtitle: "Business websites, web applications & digital platforms",
      description:
        "High-speed, conversion-focused websites engineered with Next.js, React 19, TypeScript, and Tailwind CSS. Seamless mobile experiences, automated payment checkouts, and clean on-page SEO.",
      route: "/services/website-development",
      icon: Globe,
      deliverables: [
        "Modern Business & Portfolio Websites",
        "Next.js E-Commerce Storefronts",
        "Razorpay & Cashfree Payment Gateways",
        "Technical SEO & Core Web Vitals Optimization",
      ],
      featuresBadge: "100/100 LIGHTHOUSE SPEED",
      badgeVariant: "sky",
      visualType: "web",
    },
    {
      id: "digital-solutions",
      number: "04",
      title: "Digital Solutions",
      subtitle: "Custom digital tools & technology solutions",
      description:
        "Purpose-built software tools, cross-platform mobile apps, and workflow automations. We turn manual operational bottlenecks into reliable, cloud-connected digital platforms.",
      route: "/services/app-development",
      icon: Cpu,
      deliverables: [
        "Cross-Platform Mobile Apps (iOS & Android)",
        "Internal Business Management Dashboards",
        "Custom Workflow Automations & APIs",
        "Cloud Storage & Microservice Setups",
      ],
      featuresBadge: "TAILORED TECH ARCHITECTURE",
      badgeVariant: "purple",
      visualType: "tech",
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-t border-slate-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] mb-3.5 shadow-2xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
              {headerContent.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
              {headerContent.title}
            </h2>
            <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
              {headerContent.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={headerContent.ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200 hover:border-[#0284C7]/50 text-xs font-mono font-bold text-[#0A192F] hover:text-[#0284C7] transition-all shadow-2xs group"
            >
              <span>{headerContent.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 4 Core Service Cards in 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {coreServices.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="group relative rounded-3xl bg-white/85 hover:bg-white border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Card Accent Ribbon */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-100/50 via-transparent to-transparent rounded-tr-3xl pointer-events-none" />

                {/* Top Row: Icon + Badge + Step Number */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-[#0284C7]" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100/80 text-[#0284C7] uppercase tracking-wide">
                        {service.featuresBadge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {service.number}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#0284C7] mt-1 font-mono">
                    {service.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5">
                    {service.description}
                  </p>

                  {/* Interactive Visual Element */}
                  <div className="my-5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                    {service.visualType === "video" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1.5 font-bold text-[#0A192F]">
                            <Play className="w-3 h-3 text-[#0284C7] fill-current" />
                            SHORT-FORM REEL TIMELINE
                          </span>
                          <span className="text-emerald-600 font-bold">9:16 VERTICAL</span>
                        </div>
                        <div className="h-4 flex items-center gap-1 px-1 bg-white rounded-lg border border-slate-200/60 overflow-hidden">
                          {[30, 70, 95, 60, 40, 85, 100, 45, 65, 80, 50, 90, 70, 40, 60, 85, 95, 50, 75, 45, 90].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-[#0284C7]/80 rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>00:00 (Hook)</span>
                          <span className="text-[#0284C7] font-bold">Retention Pacing</span>
                          <span>00:30 (CTA)</span>
                        </div>
                      </div>
                    )}

                    {service.visualType === "ecom" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="font-bold text-[#0A192F]">AMAZON LISTING ARCHITECTURE</span>
                          <span className="text-[#0284C7] font-bold">7-IMAGE DECK</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono">
                          <span className="p-1 rounded-md bg-white border border-slate-200 text-[#0A192F] font-bold">01 Main</span>
                          <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-600">02 Feature</span>
                          <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-600">03 Scale</span>
                          <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-600">04 Story</span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 flex justify-between">
                          <span>Compliant 2000x2000px</span>
                          <span className="text-emerald-600 font-bold">High CTR Guarantee</span>
                        </div>
                      </div>
                    )}

                    {service.visualType === "web" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="font-bold text-[#0A192F]">FULL-STACK WEB ENGINE</span>
                          <span className="text-emerald-600 font-bold">SUB-SECOND TTI</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">Next.js 16</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">TypeScript</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">Razorpay</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">100% SEO</span>
                        </div>
                      </div>
                    )}

                    {service.visualType === "tech" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="font-bold text-[#0A192F]">CUSTOM PRODUCT ARCHITECTURE</span>
                          <span className="text-purple-600 font-bold">CROSS-PLATFORM</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">Flutter</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">Node / Cloud</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">REST APIs</span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-[#0284C7] font-bold">Offline-First</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      KEY DELIVERABLES
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.deliverables.map((item) => (
                        <div
                          key={item}
                          className="text-xs text-slate-700 font-medium flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explore Service CTA */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={service.route}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors"
                  >
                    <span>EXPLORE {service.title.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[10px] font-mono text-slate-400">
                    IMDAD.BUILDS STUDIO
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
