import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { studioServices, getStudioServiceBySlug, StudioService } from "@/data/servicesData";
import { getPublishedServiceBySlug } from "@/lib/cms";
import { getWhatsAppUrl } from "@/data/config";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
  HelpCircle,
} from "lucide-react";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return studioServices.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const staticService = getStudioServiceBySlug(slug);
  const cmsDoc = await getPublishedServiceBySlug(slug);
  const service = cmsDoc
    ? {
        title: cmsDoc.name,
        number: staticService?.number || "01",
        tagline: cmsDoc.shortDescription,
        shortDescription: cmsDoc.shortDescription,
      }
    : staticService;

  if (!service) {
    return {
      title: "Service Not Found | IMDAD.BUILDS",
    };
  }

  return {
    title: `${service.title} (${service.number}) — ${service.tagline} | IMDAD.BUILDS`,
    description: service.shortDescription,
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
};

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const staticService = getStudioServiceBySlug(slug);
  const cmsDoc = await getPublishedServiceBySlug(slug);

  const service: StudioService | null = cmsDoc
    ? {
        id: cmsDoc.id,
        number: staticService?.number || "01",
        title: cmsDoc.name || staticService?.title || "",
        slug: cmsDoc.slug,
        tagline: cmsDoc.shortDescription || staticService?.tagline || "",
        shortDescription: cmsDoc.shortDescription,
        fullDescription: cmsDoc.description,
        capabilities: staticService?.capabilities || cmsDoc.deliverables,
        deliverables: cmsDoc.deliverables,
        suitableFor: staticService?.suitableFor || ["Businesses & Creators"],
        process: (cmsDoc.process || []).map((p) => ({
          step: p.step,
          title: p.title,
          description: p.description,
        })),
        packages: (cmsDoc.pricing || []).map((pkg) => ({
          name: pkg.tierName,
          price: parseInt(pkg.price.replace(/[^0-9]/g, ""), 10) || 0,
          priceType: "fixed" as const,
          unit: pkg.turnaround || "per project",
          description: pkg.description,
          features: pkg.deliverables,
        })),
        hasRealPricing: staticService?.hasRealPricing ?? true,
        faqs: cmsDoc.faq || [],
        accentColor: cmsDoc.accentColor || staticService?.accentColor || "#0284C7",
        iconName: cmsDoc.iconName || staticService?.iconName || "Globe",
      }
    : (staticService || null);

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.iconName] || Globe;

  return (
    <main className="flex-1 py-10 sm:py-16">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#56475C] hover:text-[#180D1D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL SERVICES</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="rounded-3xl bg-white/95 border border-[#502D55]/14 backdrop-blur-2xl p-6 sm:p-12 mb-12 shadow-[0_20px_50px_rgba(80,45,85,0.06)] relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-80 opacity-10 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: service.accentColor }}
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-[#935073]">
                DISCIPLINE {service.number}
              </span>
              <span className="text-[#502D55]/20">&bull;</span>
              <span className="studio-tag text-[10px] text-[#7A6880]">
                IMDAD.BUILDS STUDIO
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: service.accentColor }}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#180D1D] tracking-tight">
                {service.title}
              </h1>
            </div>

            <p className="text-base sm:text-lg font-semibold text-[#180D1D]">
              {service.tagline}
            </p>

            <p className="text-sm sm:text-base text-[#56475C] leading-relaxed">
              {service.fullDescription}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="px-6 py-3 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <span>Start a {service.title} Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={getWhatsAppUrl(`Hi Imdad, I would like to discuss a ${service.title} project with your studio.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white border border-[#502D55]/15 text-xs sm:text-sm font-semibold text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-all shadow-2xs"
              >
                WhatsApp Founder Desk
              </a>
            </div>
          </div>
        </div>

        {/* BESPOKE SERVICE SHOWCASE VIEWPORTS BASED ON DISCIPLINE */}

        {/* 1. Website Development: Performance & Tech Benchmark */}
        {service.slug === "website-development" && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-[#FAF2EA] border border-[#F6DBC0] grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="studio-tag text-[9px] text-[#7A3F26] font-bold block">PERFORMANCE ARCHITECTURE</span>
              <h4 className="text-xl font-black text-[#180D1D]">Mobile-First Engineering</h4>
              <p className="text-xs text-[#56475C]">Code-split Next.js bundles, optimized responsive images, and clean semantic layouts designed for rapid mobile loading.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#502D55]/10 pt-4 md:pt-0 md:pl-6">
              <span className="studio-tag text-[9px] text-[#7A3F26] font-bold block">PAYMENT INTEGRATION</span>
              <h4 className="text-xl font-black text-[#180D1D]">Direct Gateway Webhooks</h4>
              <p className="text-xs text-[#56475C]">Seamless Razorpay, Cashfree or Stripe webhook integrations connecting payments directly to order notifications.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#502D55]/10 pt-4 md:pt-0 md:pl-6">
              <span className="studio-tag text-[9px] text-[#7A3F26] font-bold block">IP &amp; ASSET HANDOVER</span>
              <h4 className="text-xl font-black text-[#180D1D]">100% Client Ownership</h4>
              <p className="text-xs text-[#56475C]">Full source code repositories, domain keys, and platform credentials transferred directly to your organization.</p>
            </div>
          </div>
        )}

        {/* 2. Video Editing: The 3-Second Hook Architecture */}
        {service.slug === "video-editing" && (
          <div className="mb-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#180D1D] to-[#2B1435] text-white shadow-xl">
            <span className="studio-tag text-[10px] text-[#F6DBC0] font-bold block mb-2">
              CREATIVE ARCHITECTURE // VERTICAL FEED RETENTION
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              The 3-Second Hook Blueprint
            </h3>
            <p className="text-xs sm:text-sm text-[#d8cfc4] max-w-2xl mb-8">
              We cut video specifically for algorithmic discovery on Instagram Reels and Meta Ads feeds, where drop-off happens in the first 3 seconds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/08 border border-white/10 space-y-2">
                <span className="font-mono text-xs text-[#F6DBC0] font-bold block">0:00 — 0:03</span>
                <h4 className="font-bold text-sm text-white">Visual &amp; Verbal Hook</h4>
                <p className="text-xs text-[#d8cfc4]">An unignorable pattern interrupt that halts scrolling by targeting a high-friction buyer problem.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/08 border border-white/10 space-y-2">
                <span className="font-mono text-xs text-[#F6DBC0] font-bold block">0:03 — 0:20</span>
                <h4 className="font-bold text-sm text-white">Fast-Paced Demonstration</h4>
                <p className="text-xs text-[#d8cfc4]">Kinetic captions, macro product b-roll, and micro-cuts removing all dead air to maintain retention.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/08 border border-white/10 space-y-2">
                <span className="font-mono text-xs text-[#F6DBC0] font-bold block">0:20 — 0:30</span>
                <h4 className="font-bold text-sm text-white">Direct-Response Outro</h4>
                <p className="text-xs text-[#d8cfc4]">Singular call to action with on-screen visual arrow and discount/offer overlay prompting clicks.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. E-Commerce: Multi-Marketplace Channel Integration */}
        {service.slug === "ecommerce" && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#502D55]/12 shadow-xs">
            <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-2">
              MARKETPLACE ECOSYSTEM // MULTI-CHANNEL INDEXING
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] mb-6">
              Active Marketplace Seller Hub Expertise
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAF4F9]/70 border border-[#502D55]/08 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#180D1D]">Amazon India</h4>
                  <span className="text-[10px] font-mono text-[#935073] font-bold">A9 SEO READY</span>
                </div>
                <p className="text-xs text-[#56475C]">Title keyword indexing, mandatory compliance attributes, search terms matrix, and buy-box strategy.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF4F9]/70 border border-[#502D55]/08 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#180D1D]">Flipkart</h4>
                  <span className="text-[10px] font-mono text-[#935073] font-bold">SELLER HUB QC</span>
                </div>
                <p className="text-xs text-[#56475C]">Complex variation mapping, size and color groupings, and fast-track quality check error clearance.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF4F9]/70 border border-[#502D55]/08 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#180D1D]">Meesho</h4>
                  <span className="text-[10px] font-mono text-[#935073] font-bold">SUPPLIER PANEL</span>
                </div>
                <p className="text-xs text-[#56475C]">Rapid single and combo SKU uploads with accurate tax code classification and inventory setups.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Social Media: 30-Day Content Framework */}
        {service.slug === "social-media" && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#502D55]/12 shadow-xs">
            <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-2">
              EDITORIAL FRAMEWORK // 30-DAY CALENDAR ARCHITECTURE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] mb-6">
              The 4 Content Pillars We Build Around
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0]">
                <span className="font-mono text-xs font-bold text-[#7A3F26] block mb-1">PILLAR 01</span>
                <h5 className="font-bold text-sm text-[#180D1D] mb-1">Proof of Work</h5>
                <p className="text-[#56475C]">Real demonstrations, unboxing clips, and active customer orders showing product credibility.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                <span className="font-mono text-xs font-bold text-[#935073] block mb-1">PILLAR 02</span>
                <h5 className="font-bold text-sm text-[#180D1D] mb-1">Objection Busters</h5>
                <p className="text-[#56475C]">Carousels answering size, material durability, and shipping questions before buyers hesitate.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0]">
                <span className="font-mono text-xs font-bold text-[#7A3F26] block mb-1">PILLAR 03</span>
                <h5 className="font-bold text-sm text-[#180D1D] mb-1">Behind The Build</h5>
                <p className="text-[#56475C]">Studio craft, founder stories, and production highlights that establish brand authority.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                <span className="font-mono text-xs font-bold text-[#935073] block mb-1">PILLAR 04</span>
                <h5 className="font-bold text-sm text-[#180D1D] mb-1">Direct Offer Drops</h5>
                <p className="text-[#56475C]">High-urgency promotional graphics and story discount sequences driving immediate checkout.</p>
              </div>
            </div>
          </div>
        )}

        {/* Deliverables & Capabilities 2-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/90 border border-[#502D55]/10 shadow-2xs space-y-4">
            <span className="studio-tag text-[10px] text-[#935073] font-bold block">
              CAPABILITIES &amp; AREAS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight">
              What We Build &amp; Support
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {service.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#56475C] p-2.5 rounded-xl bg-[#FAF4F9]/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#935073] shrink-0" />
                  <span className="font-semibold text-[#180D1D]">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/90 border border-[#502D55]/10 shadow-2xs space-y-4">
            <span className="studio-tag text-[10px] text-[#502D55] font-bold block">
              TANGIBLE OUTCOMES
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight">
              What You Receive
            </h3>
            <div className="space-y-2.5 pt-2">
              {service.deliverables.map((del, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#56475C]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{del}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Website Types (Specific to Website Development) */}
        {service.subTypes && service.subTypes.length > 0 && (
          <div className="mb-14">
            <div className="mb-6">
              <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
                CATEGORIES &amp; ARCHITECTURES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
                Supported Types &amp; Scopes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subTypes.map((type, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/95 border border-[#502D55]/12 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-[#180D1D]">{type.name}</h4>
                      {type.priceDisplay && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-xs font-mono font-bold text-[#180D1D]">
                          {type.priceDisplay}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#56475C] leading-relaxed mb-3">
                      {type.description}
                    </p>
                    <p className="text-[11px] font-mono text-[#7A6880] mb-4">
                      Scope: {type.scope}
                    </p>
                    <div className="space-y-1.5 pt-2 border-t border-[#502D55]/08">
                      {type.features.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-[#56475C]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#935073] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#502D55]/08">
                    <Link
                      href={`/contact?service=${encodeURIComponent(`${service.title} - ${type.name}`)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#180D1D] hover:text-[#935073] transition-colors"
                    >
                      <span>Inquire About {type.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing / Packages Section */}
        {service.hasRealPricing && service.packages && service.packages.length > 0 ? (
          <div className="mb-14">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
                  TRANSPARENT RATES
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
                  Pricing &amp; Starting Packages
                </h2>
              </div>
              <span className="text-xs font-mono text-[#7A6880]">
                {service.pricingNote}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-white border transition-all relative flex flex-col justify-between ${
                    pkg.recommended
                      ? "border-[#935073] shadow-md ring-1 ring-[#935073]/30"
                      : "border-[#502D55]/12 shadow-2xs"
                  }`}
                >
                  {pkg.recommended && (
                    <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#935073] text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                      Recommended
                    </span>
                  )}

                  <div>
                    <h4 className="font-black text-xl text-[#180D1D] mb-1">{pkg.name}</h4>
                    <p className="text-xs text-[#56475C] mb-4">{pkg.description}</p>
                    
                    <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-[#502D55]/10">
                      <span className="text-3xl font-black text-[#180D1D]">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-mono text-[#7A6880]">{pkg.unit}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {pkg.features.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-[#56475C]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/contact?package=${encodeURIComponent(`${service.title} - ${pkg.name}`)}`}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center transition-all ${
                      pkg.recommended
                        ? "bg-[#180D1D] text-white hover:bg-[#2B1435]"
                        : "bg-[#FAF2EA] text-[#180D1D] hover:bg-[#180D1D] hover:text-white border border-[#502D55]/10"
                    }`}
                  >
                    Select {pkg.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* For App Development or bespoke services: High-Touch Consultation Scoping Box */
          <div className="mb-14 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-[#FAF4F9] to-white border border-[#502D55]/14 shadow-sm">
            <div className="max-w-2xl space-y-3">
              <span className="studio-tag text-[10px] text-[#935073] font-bold block">
                CUSTOM ARCHITECTURE &amp; SCOPING
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
                Let&apos;s map out your application requirements
              </h3>
              <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
                {service.pricingNote}
              </p>
              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="px-6 py-3.5 rounded-xl bg-[#180D1D] text-[#F8F4E9] font-bold text-xs sm:text-sm hover:bg-[#2B1435] transition-all shadow-xs"
                >
                  Schedule a Scope Call
                </Link>
                <a
                  href={getWhatsAppUrl(`Hi Imdad, I would like to scope an application development project.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-white border border-[#502D55]/15 text-xs sm:text-sm font-semibold text-[#180D1D] hover:text-[#935073] transition-all shadow-2xs"
                >
                  WhatsApp Discussion
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Process Steps */}
        <div className="mb-14">
          <div className="mb-6">
            <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
              EXECUTION BLUEPRINT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
              Studio Process &amp; Milestones
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.process.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-white/90 border border-[#502D55]/10 shadow-2xs space-y-2"
              >
                <span className="font-mono text-xl font-black text-[#935073]">
                  {step.step}
                </span>
                <h4 className="font-bold text-sm text-[#180D1D]">{step.title}</h4>
                <p className="text-xs text-[#56475C] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-14 max-w-3xl">
            <div className="mb-6">
              <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
                QUESTIONS ANSWERED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/90 border border-[#502D55]/10 shadow-2xs space-y-2"
                >
                  <h4 className="font-bold text-sm text-[#180D1D] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#935073] shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
