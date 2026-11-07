import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import { getPublishedAppBySlug, getPublishedReleases, getLatestStableRelease } from "@/lib/cms";
import { WishMusicDownloadClient } from "@/components/apps/WishMusicDownloadClient";
import {
  Music,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  CheckCircle2,
  HardDrive,
  Cpu,
  Volume2,
  Sliders,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WishMusic for Android — Official APK Download & SoundLab | IMDAD.BUILDS",
  description:
    "Official Android APK release for WishMusic. Distraction-free, gesture-driven high-fidelity audio player with lossless FLAC playback, dynamic album palette extraction, and zero telemetry bloat.",
  openGraph: {
    title: "WishMusic for Android — Official APK Download | IMDAD.BUILDS",
    description:
      "Download WishMusic APK directly from the official developer studio. Lossless FLAC/ALAC, offline caching, and tactile waveform scrubbing.",
    url: `${siteConfig.siteUrl}/apps/wishmusic`,
    images: [
      {
        url: `${siteConfig.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "WishMusic Android Release by IMDAD.BUILDS",
      },
    ],
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/apps/wishmusic`,
  },
};

export default async function WishMusicPage() {
  const app = await getPublishedAppBySlug("wishmusic");
  if (!app) {
    notFound();
  }

  const releases = await getPublishedReleases("wishmusic");
  const latestRelease = await getLatestStableRelease("wishmusic");

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#7A6880] mb-8">
          <Link href="/" className="hover:text-[#180D1D] transition-colors">
            STUDIO
          </Link>
          <span>/</span>
          <Link href="/apps" className="hover:text-[#180D1D] transition-colors">
            APPS
          </Link>
          <span>/</span>
          <span className="text-[#935073] font-bold">WISHMUSIC</span>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1 & 2: HERO & BRANDING                           */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-12 rounded-3xl bg-white border border-[#502D55]/12 shadow-sm mb-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand & Tagline (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="studio-tag px-3 py-1 rounded-full bg-[#935073]/10 text-[#935073] border border-[#935073]/20 font-bold text-[10px]">
                  AUDIO ENGINE // EXPERIMENTAL SOUNDLAB
                </span>
                <span className="studio-tag px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                  OFFICIAL ANDROID DISTRIBUTION
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/60 text-white"
                  style={{ backgroundColor: app.accentColor || "#935073" }}
                >
                  <Music className="w-8 h-8 sm:w-10 sm:h-10" />
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

              <p className="text-sm sm:text-base text-[#56475C] leading-relaxed pt-2">
                {app.description}
              </p>

              <div className="pt-2 text-xs text-[#7A6880] flex items-center gap-2 font-mono">
                <span>POWERED BY IMDAD.BUILDS</span>
                <span>&bull;</span>
                <span>OFFICIAL RELEASE CHANNEL</span>
              </div>
            </div>

            {/* Right Meta Column: Quick Specs (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF2EA]/85 border border-[#502D55]/10 space-y-4">
              <div>
                <span className="studio-tag text-[9px] text-[#7A6880] block mb-1.5">
                  CORE PLATFORM TARGETS
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Android (Direct APK)", "Android 7.0+", "ARM64 / x86_64"].map((p) => (
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

              <div className="border-t border-[#502D55]/08 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="studio-tag text-[9px] text-[#7A6880] block">CURRENT BUILD</span>
                  <span className="font-bold text-[#180D1D]">
                    v{latestRelease?.versionName || app.version || "1.0.0"}
                  </span>
                </div>
                <div>
                  <span className="studio-tag text-[9px] text-[#7A6880] block">BINARY SIZE</span>
                  <span className="font-bold text-[#180D1D]">
                    {latestRelease?.fileSizeFormatted || "23.4 MB"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#502D55]/08 pt-3 text-[10px] font-mono text-[#7A6880] flex items-center justify-between">
                <span>INDEPENDENT PROPERTY</span>
                <span className="text-[#180D1D] font-bold">ZERO TELEMETRY</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTIONS 3–7, 13, 14: INTERACTIVE DOWNLOAD & CHECKSUM    */}
        {/* ======================================================== */}
        <div className="mb-14">
          <WishMusicDownloadClient
            latestRelease={latestRelease}
            allReleases={releases}
          />
        </div>

        {/* ======================================================== */}
        {/* SECTION 8: SCREENSHOTS & INTERFACE PREVIEW               */}
        {/* ======================================================== */}
        <div className="mb-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#120816] via-[#24132B] to-[#120816] text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
            <div>
              <span className="studio-tag text-[10px] text-[#F6DBC0] font-bold block mb-1">
                INTERFACE VISUALS // SOUNDLAB
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                WishMusic High-Fidelity Audio Interface
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-[#F6DBC0]">
              Fluid Cover Art Motion
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Screen Mockup */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white/05 border border-white/10 backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between text-xs font-mono text-[#F6DBC0]/80">
                <span>INTERFACE STAGE</span>
                <span>Tactile Audio Scrubber</span>
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
                <p className="text-xs text-[#d8cfc4]">Direct Audio Core &bull; Frame-Perfect Waveform</p>
              </div>

              {/* Waveform Visualization Bars */}
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

            {/* Architecture Details */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Engineering Architecture</h3>
              <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed">
                WishMusic strips away bloated recommendation feeds and social notifications. Built on a low-latency audio core, it caches playlists locally, handles track transitions with zero auditory gap, and dynamically extracts accent palettes from cover artwork.
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

        {/* ======================================================== */}
        {/* SECTION 9: WHAT'S NEW IN THIS RELEASE                    */}
        {/* ======================================================== */}
        {latestRelease?.releaseNotes && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#935073]" />
              <h3 className="text-lg font-black text-[#180D1D]">
                What&apos;s New in v{latestRelease.versionName}
              </h3>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/08 text-xs sm:text-sm text-[#56475C] font-sans whitespace-pre-line leading-relaxed">
              {latestRelease.releaseNotes}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 10: MAIN FEATURES                                */}
        {/* ======================================================== */}
        <div className="mb-14 space-y-6">
          <div>
            <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
              ENGINEERED CAPABILITIES
            </span>
            <h2 className="text-2xl font-black text-[#180D1D]">
              Built for Audio Purists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Volume2,
                title: "Tactile Waveform Scrubbing",
                desc: "Precise gesture scrubbing with micro-haptic feedback and frame-perfect audio seeking.",
              },
              {
                icon: Sparkles,
                title: "Dynamic Palette Extraction",
                desc: "Real-time background fluid glow extracted directly from album artwork colors.",
              },
              {
                icon: Zap,
                title: "Zero-Latency Queue Engine",
                desc: "Instantaneous track switching and resilient offline local audio caching.",
              },
              {
                icon: Lock,
                title: "100% Privacy & Zero Ads",
                desc: "No third-party SDKs, no ad networks, no analytics trackers, and zero telemetry bloat.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF4F9] border border-[#502D55]/10 flex items-center justify-center text-[#935073]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#180D1D]">{f.title}</h4>
                  <p className="text-xs text-[#56475C] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 11 & 12: PRIVACY & PERMISSIONS DISCLOSURE        */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
          {/* Privacy Policy Summary (6 Cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#180D1D]">
              <Lock className="w-5 h-5 text-[#935073]" />
              <h3 className="text-lg font-black">WishMusic Privacy Policy</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
              WishMusic is built on an anti-surveillance philosophy. Unlike commercial streaming apps that monetize user listening behaviors, WishMusic operates as an independent media player:
            </p>

            <ul className="text-xs text-[#56475C] space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Account Required:</strong> You never have to create an account, provide an email, or sign in to play audio.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Zero Ad Networks:</strong> No advertising banners, interstitial video ads, or tracking identifiers (IDFA/GAID).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>100% Local Storage:</strong> Playlists, favorites, and cached tracks stay strictly on your device.</span>
              </li>
            </ul>
          </div>

          {/* Permissions Disclosure (6 Cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#180D1D]">
              <Eye className="w-5 h-5 text-[#935073]" />
              <h3 className="text-lg font-black">Android Permissions Disclosure</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
              We declare only the minimum permissions essential for high-fidelity audio playback:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                <div className="font-mono font-bold text-[#180D1D]">android.permission.INTERNET</div>
                <div className="text-[#56475C] text-[11px] mt-0.5">
                  Allows fetching remote audio streams, podcast feeds, and album artwork.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                <div className="font-mono font-bold text-[#180D1D]">android.permission.FOREGROUND_SERVICE</div>
                <div className="text-[#56475C] text-[11px] mt-0.5">
                  Enables continuous gapless music playback while the screen is locked or while multitasking.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                <div className="font-mono font-bold text-[#180D1D]">android.permission.WAKE_LOCK</div>
                <div className="text-[#56475C] text-[11px] mt-0.5">
                  Prevents CPU deep sleep stutter during high-resolution FLAC audio playback.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 15 & 16: DEVELOPER INFO & SUPPORT CONTACT        */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF4F9] border border-[#502D55]/12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#935073] font-bold">
              OFFICIAL STUDIO PROPERTY
            </span>
            <h3 className="text-lg font-black text-[#180D1D]">
              Designed &amp; Engineered by IMDAD.BUILDS
            </h3>
            <p className="text-xs text-[#56475C]">
              Direct support for releases, feature requests, or technical bug reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="mailto:wishmusic@imdadbuild.space"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#180D1D] text-white text-xs font-bold hover:bg-[#2B1435] transition-all shadow-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#F6DBC0]" />
              <span>wishmusic@imdadbuild.space</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#502D55]/15 text-xs font-semibold text-[#180D1D] hover:bg-gray-50 transition-colors"
            >
              <span>Contact Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
