import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { studioServices, getStudioServiceBySlug, StudioService } from "@/data/servicesData";
import { getPublishedServiceBySlug } from "@/lib/cms";
import { getWhatsAppUrl } from "@/data/config";
import { ServiceDemoGallery } from "@/components/services/ServiceDemoGallery";
import { ServiceTeamSection } from "@/components/services/ServiceTeamSection";
import type { ServiceDemoItem, ServiceTeamMember } from "@/types/cms";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
  Sparkles,
  Palette,
  Layers,
  Zap,
  TrendingUp,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return studioServices
    .filter(
      (service) =>
        service.slug !== "ai-resume-builder" &&
        service.slug !== "amazon-listing" &&
        service.slug !== "video-editing"
    )
    .map((service) => ({
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
        tagline: cmsDoc.tagline || cmsDoc.shortDescription,
        shortDescription: cmsDoc.shortDescription,
      }
    : staticService;

  if (!service) {
    return {
      title: "Service Not Found | IMDAD.BUILDS",
    };
  }

  return {
    title: `${service.title} — Info, Pricing, Demos & Team | IMDAD.BUILDS`,
    description: service.shortDescription,
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
  Sparkles,
  Palette,
  Layers,
  Zap,
  TrendingUp,
};

interface ResolvedPricingCard {
  name: string;
  priceDisplay: string;
  unit: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;

  if (slug === "ai-resume-builder") {
    redirect("/services/ai-resume-builder");
  }

  if (slug === "video-editing") {
    redirect("/services/video-editing");
  }

  if (slug === "amazon-listing") {
    redirect("/services/amazon-listing");
  }

  const staticService = getStudioServiceBySlug(slug);
  const cmsDoc = await getPublishedServiceBySlug(slug);

  if (!cmsDoc && !staticService) {
    notFound();
  }

  const service: StudioService = cmsDoc
    ? {
        id: cmsDoc.id,
        number: staticService?.number || String((cmsDoc.sortOrder ?? 0) + 1).padStart(2, "0"),
        title: cmsDoc.name || staticService?.title || "",
        slug: cmsDoc.slug,
        tagline: cmsDoc.tagline || cmsDoc.shortDescription || staticService?.tagline || "",
        shortDescription: cmsDoc.shortDescription || staticService?.shortDescription || "",
        fullDescription: cmsDoc.description || staticService?.fullDescription || "",
        capabilities:
          cmsDoc.capabilities && cmsDoc.capabilities.length > 0
            ? cmsDoc.capabilities
            : staticService?.capabilities || cmsDoc.deliverables || [],
        deliverables:
          cmsDoc.deliverables && cmsDoc.deliverables.length > 0
            ? cmsDoc.deliverables
            : staticService?.deliverables || [],
        suitableFor: staticService?.suitableFor || ["Businesses & Creators"],
        process:
          cmsDoc.process && cmsDoc.process.length > 0
            ? cmsDoc.process.map((p) => ({
                step: p.step,
                title: p.title,
                description: p.description,
              }))
            : staticService?.process || [],
        subTypes: staticService?.subTypes,
        packages: staticService?.packages,
        hasRealPricing:
          (cmsDoc.pricing && cmsDoc.pricing.length > 0) ||
          Boolean(staticService?.hasRealPricing),
        pricingNote: cmsDoc.pricingNote || staticService?.pricingNote,
        demos: cmsDoc.demos ?? staticService?.demos ?? [],
        teamMembers: cmsDoc.teamMembers ?? staticService?.teamMembers ?? [],
        faqs:
          cmsDoc.faq && cmsDoc.faq.length > 0
            ? cmsDoc.faq
            : staticService?.faqs || [],
        accentColor: cmsDoc.accentColor || staticService?.accentColor || "#C96A50",
        iconName: cmsDoc.iconName || staticService?.iconName || "Globe",
      }
    : (staticService as StudioService);

  const pricingCards: ResolvedPricingCard[] =
    cmsDoc && cmsDoc.pricing && cmsDoc.pricing.length > 0
      ? cmsDoc.pricing.map((pkg, idx) => ({
          name: pkg.tierName,
          priceDisplay: pkg.price || "Custom",
          unit: pkg.turnaround || "per project",
          description: pkg.description,
          features: pkg.deliverables || [],
          recommended: idx === 1 || (cmsDoc.pricing.length === 1 && idx === 0),
        }))
      : (service.packages || []).map((pkg) => ({
          name: pkg.name,
          priceDisplay: `₹${pkg.price.toLocaleString("en-IN")}`,
          unit: pkg.unit,
          description: pkg.description,
          features: pkg.features,
          recommended: pkg.recommended,
        }));

  const demos: ServiceDemoItem[] = service.demos || [];
  const teamMembers: ServiceTeamMember[] = service.teamMembers || [];
  const Icon = iconMap[service.iconName] || Globe;

  return (
    <main className="flex-1 py-10 sm:py-16">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/services"
            className="m3-pill-chip inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-[#E8DFD5] text-xs font-semibold text-[#5F534D] hover:text-[#B4583F]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Services</span>
          </Link>

          {/* Quick Jump Anchors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a href="#info" className="m3-pill-chip px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD5] text-[#5F534D] hover:text-[#B4583F] font-medium">
              Info
            </a>
            {demos.length > 0 && (
              <a href="#demos" className="m3-pill-chip px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD5] text-[#5F534D] hover:text-[#B4583F] font-medium">
                Demos ({demos.length})
              </a>
            )}
            <a href="#pricing" className="m3-pill-chip px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD5] text-[#5F534D] hover:text-[#B4583F] font-medium">
              Pricing
            </a>
            {teamMembers.length > 0 && (
              <a href="#team" className="m3-pill-chip px-3 py-1 rounded-full bg-white/80 border border-[#E8DFD5] text-[#5F534D] hover:text-[#B4583F] font-medium">
                Team ({teamMembers.length})
              </a>
            )}
          </div>
        </div>

        {/* Hero Info Banner */}
        <section id="info" className="scroll-mt-24 rounded-[34px] m3-surface-2 p-6 sm:p-12 mb-12 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FAECE4]/85 blur-3xl"
          />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="peach" size="md" pulse>
                Service {service.number} &bull; IMDAD.BUILDS
              </Badge>
              {teamMembers.length > 0 && (
                <Badge variant="default" size="md">
                  {teamMembers.length} {teamMembers.length === 1 ? "Specialist" : "Specialists"} Assigned
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 m3-icon-squircle bg-[#FAECE4] border border-[#F0CFC0] flex items-center justify-center text-[#C96A50] shrink-0">
                <Icon className="w-7 h-7" />
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#332924] tracking-tight">
                {service.title}
              </h1>
            </div>

            <p className="text-base sm:text-xl font-semibold text-[#B4583F]">
              {service.tagline}
            </p>

            <p className="text-sm sm:text-base text-[#5F534D] leading-relaxed">
              {service.fullDescription}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Button
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                variant="primary"
                size="lg"
                className="justify-center"
              >
                <span>Start a {service.title} Project</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                href={getWhatsAppUrl(`Hi Imdad, I would like to discuss a ${service.title} project with your studio.`)}
                variant="secondary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
                className="justify-center"
              >
                <MessageSquare className="w-4 h-4 text-[#C96A50]" />
                <span>Ask on WhatsApp</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Discipline Highlights */}
        {service.slug === "website-development" && (
          <div className="mb-14 p-6 sm:p-8 rounded-[30px] m3-surface-tonal grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider block">
                Performance Architecture
              </span>
              <h3 className="font-display text-xl font-bold text-[#332924]">Mobile-First Engineering</h3>
              <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed">
                Fast Next.js bundles, responsive visuals, and clean layouts engineered for smooth phone browsing.
              </p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#EED2C3] pt-4 md:pt-0 md:pl-6">
              <span className="text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider block">
                Payment Integration
              </span>
              <h3 className="font-display text-xl font-bold text-[#332924]">Direct UPI &amp; Cards</h3>
              <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed">
                Verified Razorpay, Cashfree, or Stripe webhooks connecting instant UPI/card payments to your orders.
              </p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#EED2C3] pt-4 md:pt-0 md:pl-6">
              <span className="text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider block">
                Asset Handover
              </span>
              <h3 className="font-display text-xl font-bold text-[#332924]">100% Client Ownership</h3>
              <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed">
                Full source code repositories, domain keys, and credentials transferred directly to you.
              </p>
            </div>
          </div>
        )}

        {service.slug === "ecommerce" && (
          <div className="mb-14 p-6 sm:p-8 rounded-[30px] m3-surface-1">
            <span className="text-[11px] font-semibold text-[#C96A50] uppercase tracking-wider block mb-1">
              Marketplace Ecosystem
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#332924] mb-6">
              Active Seller Hub Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-[22px] bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-[#332924]">Amazon India</h3>
                  <Badge variant="peach" size="sm">A9 SEO</Badge>
                </div>
                <p className="text-xs text-[#5F534D]">Title keyword indexing, compliance attributes, search terms, and buy-box focus.</p>
              </div>
              <div className="p-5 rounded-[22px] bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-[#332924]">Flipkart</h3>
                  <Badge variant="peach" size="sm">Seller QC</Badge>
                </div>
                <p className="text-xs text-[#5F534D]">Variation mapping, size &amp; color groupings, and fast quality-check clearance.</p>
              </div>
              <div className="p-5 rounded-[22px] bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-[#332924]">Meesho</h3>
                  <Badge variant="peach" size="sm">Supplier Panel</Badge>
                </div>
                <p className="text-xs text-[#5F534D]">Rapid single &amp; combo SKU uploads with accurate tax classification.</p>
              </div>
            </div>
          </div>
        )}

        {/* DEMO SHOWCASE (Admin-Editable) */}
        <ServiceDemoGallery demos={demos} serviceTitle={service.title} />

        {/* Capabilities & Deliverables 2-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[30px] m3-surface-1 space-y-4">
            <span className="text-[11px] font-semibold text-[#C96A50] uppercase tracking-wider block">
              Capabilities &amp; Areas
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#332924] tracking-tight">
              What We Build &amp; Support
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {service.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#332924] p-3 rounded-[16px] bg-[#FAF7F2] border border-[#E8DFD5]">
                  <span className="w-5 h-5 rounded-full bg-[#FAECE4] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#C96A50]" />
                  </span>
                  <span className="font-semibold">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[30px] m3-surface-1 space-y-4">
            <span className="text-[11px] font-semibold text-[#C96A50] uppercase tracking-wider block">
              Tangible Outcomes
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#332924] tracking-tight">
              What You Receive
            </h2>
            <div className="space-y-3 pt-2">
              {service.deliverables.map((del, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-[#5F534D]">
                  <span className="w-5 h-5 rounded-full bg-[#FAECE4] border border-[#F0CFC0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#C96A50]" />
                  </span>
                  <span>{del}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRICING & PACKAGES SECTION */}
        <section id="pricing" className="mb-14 scroll-mt-24">
          {pricingCards.length > 0 ? (
            <>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAECE4]/85 border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2.5">
                    Transparent Rates
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924] tracking-tight">
                    Pricing &amp; Packages
                  </h2>
                </div>
                {service.pricingNote && (
                  <span className="text-xs text-[#8A7C75] max-w-md">
                    {service.pricingNote}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingCards.map((pkg, idx) => (
                  <div
                    key={idx}
                    className={`p-6 sm:p-7 rounded-[30px] m3-card-interactive relative flex flex-col justify-between ${
                      pkg.recommended
                        ? "m3-surface-tonal border-[#D8A999]"
                        : "m3-surface-1"
                    }`}
                  >
                    {pkg.recommended && (
                      <Badge variant="peach" size="sm" className="absolute -top-3 right-6">
                        Recommended
                      </Badge>
                    )}

                    <div>
                      <h3 className="font-display font-bold text-xl text-[#332924] mb-1">
                        {pkg.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5F534D] mb-4">
                        {pkg.description}
                      </p>

                      <div className="flex items-baseline gap-1.5 mb-6 pb-4 border-b border-[#EFE6DD]">
                        <span className="font-display text-3xl font-bold text-[#332924]">
                          {pkg.priceDisplay}
                        </span>
                        <span className="text-xs text-[#8A7C75]">{pkg.unit}</span>
                      </div>

                      <div className="space-y-2.5 mb-6">
                        {pkg.features.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#5F534D]">
                            <span className="w-4 h-4 rounded-full bg-[#FAECE4] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-[#C96A50]" />
                            </span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      href={`/contact?package=${encodeURIComponent(`${service.title} - ${pkg.name}`)}`}
                      variant={pkg.recommended ? "primary" : "tonal"}
                      size="md"
                      className="w-full justify-center"
                    >
                      <span>Select {pkg.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 sm:p-12 rounded-[34px] m3-surface-tonal">
              <div className="max-w-2xl space-y-3">
                <Badge variant="default" size="md">
                  Custom Architecture &amp; Scoping
                </Badge>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924] tracking-tight">
                  Let&apos;s map out your {service.title.toLowerCase()} requirements
                </h2>
                <p className="text-sm text-[#5F534D] leading-relaxed">
                  {service.pricingNote || "Share your requirements so we can quote a clear fixed scope and delivery timeline."}
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <Button
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    variant="primary"
                    size="md"
                  >
                    <span>Request Custom Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    href={getWhatsAppUrl(`Hi Imdad, I would like to scope a ${service.title} project.`)}
                    variant="secondary"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C96A50]" />
                    <span>WhatsApp Discussion</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SERVICE-SPECIFIC TEAM MEMBERS (Admin-Editable) */}
        <ServiceTeamSection members={teamMembers} serviceTitle={service.title} />

        {/* Process Steps */}
        {service.process && service.process.length > 0 && (
          <section className="mb-14">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAECE4]/85 border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2.5">
                Execution Blueprint
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924] tracking-tight">
                Studio Process &amp; Milestones
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {service.process.map((step) => (
                <div
                  key={step.step}
                  className="group p-6 rounded-[28px] m3-surface-1 m3-card-interactive space-y-3"
                >
                  <div className="w-10 h-10 m3-icon-squircle bg-[#FAECE4] border border-[#F0CFC0] group-hover:bg-[#C96A50] group-hover:border-[#C96A50] text-[#B4583F] group-hover:text-white font-display font-bold text-sm flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="font-display font-bold text-base text-[#332924] group-hover:text-[#B4583F] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="mb-8 max-w-3xl">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAECE4]/85 border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2.5">
                Questions Answered
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-[24px] m3-surface-1 space-y-2"
                >
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#332924] flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#C96A50] shrink-0" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
