import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { appsData, getAppBySlug, App } from "@/data/apps";
import { getPublishedAppBySlug } from "@/lib/cms";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Music,
  Target,
  ShoppingBag,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Play,
  Volume2,
  Calendar,
  Lock,
  Zap,
} from "lucide-react";

interface AppDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return appsData
    .filter((app) => app.slug.toLowerCase() !== "wishmusic")
    .map((app) => ({
      slug: app.slug,
    }));
}

export async function generateMetadata({
  params,
}: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cmsApp = await getPublishedAppBySlug(slug);
  const staticApp = getAppBySlug(slug);

  if (!cmsApp && !staticApp) {
    return {
      title: "App Not Found | IMDAD.BUILDS",
    };
  }

  const name = cmsApp?.name || staticApp?.name || "App";
  const tagline = cmsApp?.tagline || cmsApp?.shortDescription || staticApp?.tagline || "";
  const description =
    cmsApp?.shortDescription || cmsApp?.description || staticApp?.description || "";

  return {
    title: `${name} — ${tagline} | IMDAD.BUILDS Product Lab`,
    description,
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  if (slug.toLowerCase() === "wishmusic") {
    redirect("/apps/wishmusic");
  }

  const cmsApp = await getPublishedAppBySlug(slug);
  const staticApp = getAppBySlug(slug);

  if (!cmsApp && !staticApp) {
    notFound();
  }

  const app: App = cmsApp
    ? {
        id: cmsApp.id,
        name: cmsApp.name,
        slug: cmsApp.slug,
        tagline: cmsApp.tagline || cmsApp.shortDescription,
        description: cmsApp.shortDescription || cmsApp.description,
        fullDescription: cmsApp.description,
        platform: (cmsApp.platform || ["Web"]) as any,
        status: (cmsApp.status === "LIVE"
          ? "live"
          : cmsApp.status === "IN_DEVELOPMENT"
          ? "in-development"
          : "coming-soon"),
        statusLabel:
          cmsApp.status === "LIVE"
            ? "Live Brand"
            : cmsApp.status === "IN_DEVELOPMENT"
            ? "In Development"
            : "Coming Soon",
        isNew: cmsApp.isNew ?? false,
        featured: cmsApp.featured ?? true,
        category: cmsApp.category || "Application",
        accentColor: cmsApp.accentColor || "#935073",
        version: cmsApp.version,
        releaseDate: cmsApp.releaseDate,
        features: cmsApp.features || [],
        techStack: cmsApp.technologies || [],
        links: { liveUrl: cmsApp.url, waitlistUrl: cmsApp.waitlistUrl },
      }
    : staticApp!;

  const isLive = app.status === "live";
  const isInDev = app.status === "in-development";

  return (
    <main className="flex-1 py-10 sm:py-16">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#56475C] hover:text-[#180D1D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ALL APPS</span>
          </Link>
        </div>

        {/* Product Hero Header */}
        <div className="rounded-3xl bg-white/95 border border-[#502D55]/14 backdrop-blur-2xl p-6 sm:p-12 mb-12 shadow-[0_20px_50px_rgba(80,45,85,0.06)] relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-80 opacity-15 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: app.accentColor }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
                    isLive
                      ? "badge-live"
                      : isInDev
                      ? "badge-in-development"
                      : "badge-coming-soon"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLive
                        ? "bg-emerald-500 animate-pulse"
                        : isInDev
                        ? "bg-amber-500"
                        : "bg-purple-500"
                    }`}
                  />
                  {app.statusLabel}
                </span>

                <span className="studio-tag px-2.5 py-1 rounded-full bg-[#FAF4F9] border border-[#502D55]/10 text-[#56475C]">
                  {app.category}
                </span>

                {app.version && (
                  <span className="studio-tag px-2.5 py-1 rounded-full bg-white border border-[#502D55]/10 text-[#7A6880]">
                    {app.version}
                  </span>
                )}
              </div>

              {/* Title & App Mark */}
              <div className="flex items-center gap-4 pt-1">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/60 text-white"
                  style={{ backgroundColor: app.accentColor }}
                >
                  {app.id === "wishmusic" && <Music className="w-8 h-8 sm:w-10 sm:h-10" />}
                  {app.id === "wishtracking" && <Target className="w-8 h-8 sm:w-10 sm:h-10" />}
                  {app.id === "easyxo" && <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-black text-[#180D1D] tracking-tight">
                    {app.name}
                  </h1>
                  <p className="text-sm sm:text-base font-semibold text-[#935073] mt-1">
                    {app.tagline}
                  </p>
                </div>
              </div>

              {/* Full Narrative */}
              <p className="text-sm sm:text-base text-[#56475C] leading-relaxed pt-2">
                {app.fullDescription}
              </p>

              {/* Action CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                {app.id === "wishmusic" ? (
                  <Link
                    href="/apps/wishmusic"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Download Official APK</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : app.links.liveUrl ? (
                  <a
                    href={app.links.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Visit Live Store</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={
                      app.links.waitlistUrl ||
                      `/contact?subject=${encodeURIComponent(`Early Beta Access: ${app.name}`)}`
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    <span>Request Early Beta Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <a
                  href={getWhatsAppUrl(`Hi Imdad, I am interested in testing ${app.name} or discussing its product architecture.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#502D55]/15 text-xs sm:text-sm font-semibold text-[#180D1D] hover:text-[#935073] hover:border-[#935073]/40 transition-all shadow-2xs"
                >
                  <span>Chat with Founder</span>
                </a>
              </div>
            </div>

            {/* Right Meta Column: Specs & Platforms (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF2EA]/85 border border-[#502D55]/10 space-y-4">
              <div>
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-1.5">
                  SUPPORTED PLATFORMS
                </span>
                <div className="flex flex-wrap gap-2">
                  {app.platform.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded-lg bg-white border border-[#502D55]/10 text-xs font-mono font-bold text-[#180D1D] flex items-center gap-1.5 shadow-2xs"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#935073]" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#502D55]/08 pt-3">
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-1.5">
                  ENGINEERING STACK
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {app.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#502D55]/10 text-[10px] font-mono font-bold text-[#56475C]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#502D55]/08 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="studio-tag text-[9px] text-[#7A6880] block">TARGET RELEASE</span>
                  <span className="font-bold text-[#180D1D]">{app.releaseDate || "Q2 2026"}</span>
                </div>
                <div>
                  <span className="studio-tag text-[9px] text-[#7A6880] block">STUDIO DISCIPLINE</span>
                  <span className="font-bold text-[#180D1D]">{app.category}</span>
                </div>
              </div>

              <div className="border-t border-[#502D55]/08 pt-3 text-[10px] font-mono text-[#7A6880] flex items-center justify-between">
                <span>INDEPENDENT STUDIO PROPERTY</span>
                <span className="text-[#180D1D] font-bold">POWERED BY IMDAD.BUILDS</span>
              </div>
            </div>

          </div>
        </div>

        {/* BESPOKE PRODUCT INTERFACE SHOWCASE VIEWPORT */}
        {app.id === "wishmusic" && (
          <div className="mb-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#120816] via-[#24132B] to-[#120816] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
              <div>
                <span className="studio-tag text-[10px] text-[#F6DBC0] font-bold block mb-1">
                  TACTILE AUDIOENGINE // INTERFACE PREVIEW
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  WishMusic High-Fidelity Audio Interface
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-[#F6DBC0]">
                v0.8.2 Alpha Preview
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Mockup Stage (6 Cols) */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white/05 border border-white/10 backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between text-xs font-mono text-[#F6DBC0]/80">
                  <span>INTERFACE PREVIEW</span>
                  <span>Simulated Audio Scrubber</span>
                </div>

                <div className="w-full aspect-square max-w-[280px] mx-auto rounded-2xl bg-gradient-to-tr from-[#935073] via-[#b86890] to-[#F6DBC0] flex flex-col items-center justify-center p-6 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <Music className="w-16 h-16 text-white relative z-10 mb-2" />
                  <span className="relative z-10 text-xs font-mono font-bold text-white tracking-wider">
                    WISHMUSIC SOUNDLAB
                  </span>
                </div>

                <div className="text-center">
                  <h4 className="font-black text-lg text-white">Lossless Ambient Sessions</h4>
                  <p className="text-xs text-[#d8cfc4]">Concept Track &bull; Simulated Interface Mockup</p>
                </div>

                {/* Equalizer Waveform Bars */}
                <div className="h-10 flex items-center justify-between gap-1 px-2">
                  {[35, 60, 85, 45, 95, 70, 30, 80, 100, 65, 40, 75, 90, 55, 65, 90, 45, 85, 60, 70, 40, 65, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-[#935073] to-[#F6DBC0]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#d8cfc4]">
                  <span>02:14</span>
                  <span>04:38</span>
                </div>
              </div>

              {/* Right Technical Specification (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Audio Engine Architecture</h3>
                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed">
                  WishMusic was engineered to eliminate streaming bloat. Built on an optimized low-latency audio core, it caches playlists locally, handles track transitions with zero auditory gap, and dynamically tints the UI using dominant colors extracted from album artwork.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">DECODER ENGINE</span>
                    <span className="text-sm font-bold text-white">Lossless FLAC / ALAC</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">AUDIO PIPELINE</span>
                    <span className="text-sm font-bold text-white">Low-Latency Core</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">OFFLINE CACHING</span>
                    <span className="text-sm font-bold text-white">Zero Cloud Lock-in</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">GESTURE HAPTICS</span>
                    <span className="text-sm font-bold text-white">Tactile Scrubbing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {app.id === "wishtracking" && (
          <div className="mb-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#120A17] via-[#2B1435] to-[#120A17] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
              <div>
                <span className="studio-tag text-[10px] text-[#F6DBC0] font-bold block mb-1">
                  MOMENTUM ENGINE // INTERFACE PREVIEW
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  WishTracking Minimalist Habit Architecture
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-[#F6DBC0]">
                v0.4.0 Preview
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Habit Screen (6 Cols) */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white/05 border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/08 text-[10px] font-mono text-[#F6DBC0]/80">
                  <span>UI PROTOTYPE</span>
                  <span>SIMULATED STREAK DEMO</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-2xl font-black text-white">Day 42</div>
                    <div className="text-xs text-[#d8cfc4]">Sample Habit Horizon</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-300/30 text-xs font-mono font-bold">
                    Compound Velocity Model
                  </span>
                </div>

                {/* Habit checklist */}
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-xl bg-white/08 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#935073] flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Deep Work &bull; 3.5 Hours</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#d8cfc4]">100% DONE</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/08 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#935073] flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Core Movement &bull; 45 Mins</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#d8cfc4]">100% DONE</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/08 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#935073] flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Writing &amp; Code Sprint &bull; 2 Hours</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#d8cfc4]">100% DONE</span>
                  </div>
                </div>
              </div>

              {/* Right Technical Specs (6 Cols) */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Anti-Social Network Tracking</h3>
                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed">
                  Most habit apps force you into leaderboards, badges, and social comparison feeds. WishTracking is designed as an intimate cockpit for builders: two-tap entry, compound trajectory projections, and zero commercial tracking scripts.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">PRIVACY MODEL</span>
                    <span className="text-sm font-bold text-white">100% On-Device SQLite</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">ADVERTISING</span>
                    <span className="text-sm font-bold text-white">Zero Ads Ever</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">MOMENTUM LOGIC</span>
                    <span className="text-sm font-bold text-white">Compound Curves</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">DATA EXPORT</span>
                    <span className="text-sm font-bold text-white">Full JSON Download</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {app.id === "easyxo" && (
          <div className="mb-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1C1008] via-[#381E10] to-[#1C1008] text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
              <div>
                <span className="studio-tag text-[10px] text-[#F6DBC0] font-bold block mb-1">
                  LIVE COMMERCE INFRASTRUCTURE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  EasyXo Direct-to-Consumer &amp; Marketplace Engine
                </h2>
              </div>
              <a
                href="https://easyxo.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white text-[#180D1D] font-bold text-xs flex items-center gap-1.5 hover:bg-[#F6DBC0] transition-colors"
              >
                <span>Visit easyxo.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white/05 border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#F6DBC0]">
                  <span>STOREFRONT UI</span>
                  <span className="text-emerald-400">&bull; 100% OPERATIONAL</span>
                </div>

                <div className="p-4 rounded-xl bg-white/08 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Direct Checkout Engine</span>
                    <span className="text-xs font-mono text-emerald-400">1-Tap UPI Enabled</span>
                  </div>
                  <p className="text-xs text-[#d8cfc4]">
                    Custom mobile checkout flow with Razorpay webhooks, instant automated receipts, and automated order routing.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-white/06 border border-white/08">
                    <span className="text-[10px] font-mono text-[#F6DBC0]/70 block">AMAZON</span>
                    <span className="font-bold text-white">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/06 border border-white/08">
                    <span className="text-[10px] font-mono text-[#F6DBC0]/70 block">FLIPKART</span>
                    <span className="font-bold text-white">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/06 border border-white/08">
                    <span className="text-[10px] font-mono text-[#F6DBC0]/70 block">MEESHO</span>
                    <span className="font-bold text-white">Active</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Founder Proof of Work</h3>
                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed">
                  EasyXo is our living laboratory. We test product listings, 7-image infographic stacks, payment webhook automations, and ad creative formats on our own balance sheet before offering them to clients.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">MARKETPLACE INDEXING</span>
                    <span className="text-sm font-bold text-white">Multi-Channel Sync</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/05 border border-white/10">
                    <span className="text-[10px] font-mono text-[#F6DBC0] block">PAYMENT HOOKS</span>
                    <span className="text-sm font-bold text-white">Instant UPI &amp; Cards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Feature Breakdown Grid */}
        <div className="mb-14">
          <div className="mb-8">
            <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
              SPECIFICATIONS &amp; CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
              Product Features &amp; Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {app.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/95 border border-[#502D55]/10 backdrop-blur-md shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#935073] shrink-0" />
                  <h3 className="font-bold text-base text-[#180D1D]">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed pl-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Kickoff Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF2EA] border border-[#F6DBC0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="studio-tag text-[10px] text-[#7A3F26] font-bold block mb-1">BESPOKE SOFTWARE BUILDS</span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">Want an app built with this level of craft?</h3>
            <p className="text-xs sm:text-sm text-[#56475C] mt-1 max-w-xl">
              We design and engineer bespoke cross-platform mobile applications, progressive web utilities, and commerce engines.
            </p>
          </div>
          <Link
            href={`/contact?subject=${encodeURIComponent(`Inquiry for custom app build inspired by ${app.name}`)}`}
            className="px-6 py-3.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold text-xs sm:text-sm shrink-0 transition-all shadow-2xs"
          >
            Start App Project
          </Link>
        </div>
      </Container>
    </main>
  );
}
