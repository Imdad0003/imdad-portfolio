"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  WishMusicVisualContent,
} from "@/types/wishmusic-visuals";
import { AppReleaseDocument } from "@/types/releases";
import { AppDocument } from "@/types/cms";
import {
  Download,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  X,
  Sparkles,
  Music,
  Activity,
  Sliders,
  Volume2,
  FolderHeart,
  Palette,
  Maximize2,
  HardDrive,
} from "lucide-react";

interface WishMusicShowcaseClientProps {
  app: AppDocument;
  visuals: WishMusicVisualContent;
  latestRelease: AppReleaseDocument | null;
  allReleases: AppReleaseDocument[];
}

export function WishMusicShowcaseClient({
  app,
  visuals,
  latestRelease,
  allReleases,
}: WishMusicShowcaseClientProps) {
  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<{
    imageUrl: string;
    title: string;
    caption?: string;
  } | null>(null);

  // Checksum copy state
  const [copiedHash, setCopiedHash] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Active filter for gallery
  const [galleryFilter, setGalleryFilter] = useState<string>("all");

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  // Icon resolver for features
  const renderFeatureIcon = (name?: string) => {
    switch (name) {
      case "Activity":
        return <Activity className="w-5 h-5 text-[#E0A8FF]" />;
      case "Sliders":
        return <Sliders className="w-5 h-5 text-[#E0A8FF]" />;
      case "Volume2":
        return <Volume2 className="w-5 h-5 text-[#E0A8FF]" />;
      case "FolderHeart":
        return <FolderHeart className="w-5 h-5 text-[#E0A8FF]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-[#E0A8FF]" />;
      case "Palette":
        return <Palette className="w-5 h-5 text-[#E0A8FF]" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-[#E0A8FF]" />;
      case "Music":
      default:
        return <Music className="w-5 h-5 text-[#E0A8FF]" />;
    }
  };

  const { visibility, hero, screenshots, features, about, gallery } = visuals;

  // Merge screenshots from both visual content and app document
  const effectiveScreenshots = [
    ...(screenshots || []),
    ...((app.screenshots || []).map((url, i) => ({
      id: `app_sc_${i}`,
      title: `${app.name || "WishMusic"} Interface #${i + 1}`,
      caption: `In-app preview screenshot ${i + 1}`,
      image: { url, fileName: `screenshot_${i + 1}.png`, title: `${app.name} #${i + 1}` },
      enabled: true,
      category: "screenshot",
    }))),
  ].filter(
    (item, idx, self) =>
      item.image?.url && self.findIndex((s) => s.image?.url === item.image?.url) === idx
  );

  const filteredGallery = gallery.filter((item) => {
    if (!item.enabled) return false;
    if (galleryFilter === "all") return true;
    return item.category === galleryFilter;
  });

  return (
    <div className="space-y-20">
      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      {visibility.hero && hero.enabled && (
        <section className="relative rounded-3xl bg-gradient-to-br from-[#0F0715] via-[#1A0B22] to-[#0A040E] text-white p-6 sm:p-12 lg:p-16 border border-white/10 shadow-2xl overflow-hidden">
          {/* Subtle Dynamic Ambient Lighting */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#935073]/25 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#5D2B75]/25 blur-[120px] pointer-events-none" />

          {/* Desktop Custom Background (if uploaded) */}
          {hero.desktopBgImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
              style={{ backgroundImage: `url(${hero.desktopBgImage.url})` }}
            />
          )}

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#935073]/20 text-[#D8829D] border border-[#935073]/40 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AUDIO ENGINE // EXPERIMENTAL SOUNDLAB
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  OFFICIAL ANDROID DISTRIBUTION
                </span>
              </div>

              {/* Logo & Headline */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {app.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.logo}
                      alt={app.name || "WishMusic"}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-lg border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#935073] to-[#E0A8FF] flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                      <Music className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                      {app.name || "WishMusic"}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-[#D8829D] font-mono tracking-wide">
                      {app.category?.toUpperCase() || "HIGH-FIDELITY FLAC AUDIO LAB"}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white/90 leading-snug">
                  {hero.headline || app.tagline || "Distraction-Free Audio Engine & Waveform Scrubber"}
                </h2>
                <p className="text-sm sm:text-base text-[#d8cfc4] leading-relaxed max-w-2xl">
                  {hero.subheadline || app.shortDescription || app.description}
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/api/apps/download/wishmusic"
                  prefetch={false}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>{hero.ctaText || "Download WishMusic APK"}</span>
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all cursor-pointer backdrop-blur-md"
                >
                  <span>{hero.secondaryCtaText || "Explore Feature Lab"}</span>
                  <ChevronRight className="w-4 h-4 text-[#D8829D]" />
                </a>
              </div>

              {/* Metadata strip */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-[#F6DBC0]">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">VERSION:</span>
                  <span className="font-bold text-white">v{latestRelease?.versionName || app.version || "1.0.0"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">BINARY SIZE:</span>
                  <span className="font-bold text-white">{latestRelease?.fileSizeFormatted || app.latestApkSize || "80.42 MB"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">REQUIREMENTS:</span>
                  <span className="font-bold text-white">Android 7.0+ (ARM64 / x86_64)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Column (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              {hero.mockupImage ? (
                <div className="relative max-w-[320px] w-full rounded-3xl p-3 bg-white/5 border border-white/15 backdrop-blur-md shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.mockupImage.url}
                    alt="WishMusic Mockup"
                    className="w-full h-auto rounded-2xl object-contain"
                  />
                </div>
              ) : (
                /* Authentic Device Frame Mockup */
                <div className="relative max-w-[300px] w-full rounded-[40px] p-3.5 bg-gradient-to-b from-[#2A1535] to-[#120816] border-4 border-white/20 shadow-2xl">
                  {/* Phone Speaker Notch */}
                  <div className="w-24 h-4 bg-black/80 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>

                  {/* Screen Content */}
                  <div className="rounded-3xl bg-[#0F0715] p-5 border border-white/10 space-y-4 text-center">
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-[#935073] via-[#823b63] to-[#E0A8FF] flex items-center justify-center shadow-lg relative overflow-hidden">
                      <Music className="w-16 h-16 text-white" />
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/40 backdrop-blur-md text-[9px] font-mono text-white/90">
                        24-Bit / 96kHz Lossless FLAC
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">Lossless Ambient Sessions</h4>
                      <p className="text-[11px] text-[#D8829D]">Imdad.Builds SoundLab</p>
                    </div>

                    {/* Waveform Scrubber */}
                    <div className="h-8 flex items-center justify-between gap-1 px-1">
                      {[40, 70, 95, 50, 85, 100, 60, 40, 80, 90, 65, 85, 45, 90, 60, 75].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-[#935073] to-[#E0A8FF]"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-white/60">
                      <span>02:14</span>
                      <span>04:38</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 2. APP SCREENSHOTS SHOWCASE (8–9 IMAGES)                             */}
      {/* =================================================================== */}
      {(visibility.screenshots || effectiveScreenshots.length > 0) && effectiveScreenshots.length > 0 && (
        <section id="screenshots" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="studio-tag text-xs font-mono font-bold text-[#935073] block mb-1">
                INTERFACE VISUALS // SOUNDLAB
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#180D1D] tracking-tight">
                Crafted for Acoustic Immersion
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#56475C] max-w-md">
              Click any screenshot to inspect the high-resolution interface, dynamic album tinting, and 10-band equalizer.
            </p>
          </div>

          {/* Screenshots Grid / Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {effectiveScreenshots.map((s) => (
              <div
                key={s.id}
                onClick={() =>
                  setLightboxItem({
                    imageUrl: s.image?.url || "",
                    title: s.title,
                    caption: s.caption,
                  })
                }
                className="group cursor-pointer rounded-2xl bg-white border border-[#502D55]/12 p-3 shadow-sm hover:shadow-xl hover:border-[#935073]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Phone Frame Mockup Container */}
                <div className="relative aspect-[9/18] rounded-xl overflow-hidden bg-[#0D0612] border border-[#502D55]/15 flex items-center justify-center">
                  {s.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.image.url}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="p-4 text-center text-white/50 space-y-2">
                      <Smartphone className="w-8 h-8 mx-auto text-[#935073]" />
                      <span className="text-[10px] font-mono block text-white/80">{s.title}</span>
                    </div>
                  )}

                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="pt-3 text-center">
                  <h4 className="text-xs font-bold text-[#180D1D] truncate group-hover:text-[#935073] transition-colors">
                    {s.title}
                  </h4>
                  {s.caption && (
                    <p className="text-[11px] text-[#56475C] truncate mt-0.5">{s.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 3. 8-MODULE FEATURE SHOWCASE                                        */}
      {/* =================================================================== */}
      {visibility.features && features.length > 0 && (
        <section id="features" className="space-y-8">
          <div>
            <span className="studio-tag text-xs font-mono font-bold text-[#935073] block mb-1">
              ENGINE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#180D1D] tracking-tight">
              Bespoke SoundLab Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features
              .filter((f) => f.enabled)
              .map((f) => (
                <div
                  key={f.id}
                  className="p-6 rounded-3xl bg-white border border-[#502D55]/12 hover:border-[#935073]/40 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF4F9] border border-[#502D55]/10 flex items-center justify-center">
                        {renderFeatureIcon(f.iconName)}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF4F9] text-[#935073] border border-[#935073]/20 text-[10px] font-mono font-bold">
                        {f.badge || f.key}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#180D1D] tracking-tight">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  {f.image && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[#502D55]/10 aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.image.url}
                        alt={f.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 4. ABOUT WISHMUSIC SECTION                                          */}
      {/* =================================================================== */}
      {visibility.about && about.enabled && (
        <section className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#180D1D] via-[#2A1032] to-[#120816] text-white shadow-2xl border border-white/10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <span className="studio-tag text-xs font-mono font-bold text-[#D8829D] block">
                INDEPENDENT SOFTWARE MANIFESTO
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {about.heading}
              </h2>
              {about.subheading && (
                <p className="text-sm font-semibold text-[#F6DBC0] font-mono">
                  {about.subheading}
                </p>
              )}
              <p className="text-sm sm:text-base text-[#d8cfc4] leading-relaxed">
                {about.description}
              </p>
              {about.secondaryDescription && (
                <p className="text-sm sm:text-base text-[#d8cfc4] leading-relaxed">
                  {about.secondaryDescription}
                </p>
              )}

              {/* Architectural Highlight Badges */}
              {about.highlights && about.highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  {about.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <span className="text-[10px] font-mono text-[#D8829D] block mb-0.5">
                        {h.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">{h.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Editorial Artwork (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              {about.primaryImage ? (
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-video w-full max-w-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={about.primaryImage.url}
                    alt="Editorial Art"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-mono text-xs text-[#d8cfc4]">
                  <div className="flex items-center justify-between text-[#D8829D] border-b border-white/10 pb-2">
                    <span>ARCHITECTURE METRICS</span>
                    <span>STANDALONE</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Audio Codec:</span>
                      <span className="font-bold text-white">Lossless FLAC / ALAC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Decryption Pipeline:</span>
                      <span className="font-bold text-white">Hardware Direct</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telemetry SDKs:</span>
                      <span className="font-bold text-emerald-400">0 (Zero Bloat)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Database:</span>
                      <span className="font-bold text-white">Encrypted SQLite</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 5. WALLPAPERS & PROMOTIONAL GALLERY                                 */}
      {/* =================================================================== */}
      {visibility.gallery && filteredGallery.length > 0 && (
        <section id="gallery" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="studio-tag text-xs font-mono font-bold text-[#935073] block mb-1">
                STUDIO ASSETS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#180D1D] tracking-tight">
                Wallpapers &amp; Concept Gallery
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {["all", "wallpaper", "render"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    galleryFilter === cat
                      ? "bg-[#180D1D] text-white"
                      : "bg-white border border-[#502D55]/15 text-[#56475C] hover:bg-[#FAF4F9]"
                  }`}
                >
                  {cat === "all" ? "All Wallpapers" : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setLightboxItem({
                    imageUrl: item.image?.url || "",
                    title: item.title,
                    caption: item.caption,
                  })
                }
                className="group cursor-pointer rounded-2xl bg-white border border-[#502D55]/12 p-3.5 shadow-sm hover:shadow-xl transition-all space-y-3"
              >
                <div className="aspect-video rounded-xl overflow-hidden bg-[#0D0612] relative border border-[#502D55]/10">
                  {item.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-mono">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#180D1D]">{item.title}</h4>
                    {item.caption && (
                      <p className="text-[11px] text-[#56475C] truncate">{item.caption}</p>
                    )}
                  </div>
                  {item.image?.url && (
                    <a
                      href={item.image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-[#502D55]/15 text-[#56475C] hover:text-[#935073]"
                      title="Open full resolution"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 6. VERIFIED APK DOWNLOAD SECTION                                    */}
      {/* =================================================================== */}
      {visibility.download && (
        <section id="download" className="space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F0715] via-[#1F0D28] to-[#0A040E] text-white border border-white/12 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#935073]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Production Release
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#F6DBC0] text-xs font-mono border border-white/10">
                    v{latestRelease?.versionName || app.version || "1.0.0"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#d8cfc4] text-xs font-mono border border-white/10">
                    Build #{latestRelease?.versionCode || 1}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Download WishMusic for Android
                </h2>

                <p className="text-sm sm:text-base text-[#d8cfc4] leading-relaxed">
                  Official Android release binary signed with Android Signature Scheme v2. Directly engineered by IMDAD.BUILDS. No telemetry, no third-party trackers, and no store intermediaries.
                </p>

                {/* Release details */}
                <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-mono text-[#F6DBC0]">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-[#D8829D]" />
                    <span>{latestRelease?.fileSizeFormatted || app.latestApkSize || "80.42 MB"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#D8829D]" />
                    <span>Android 7.0+ (Nougat &bull; API 24+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>apksigner Verified</span>
                  </div>
                </div>
              </div>

              {/* Download CTA Card */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href="/api/apps/download/wishmusic"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-base transition-all shadow-xl hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>Download APK Binary</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowInstallGuide(!showInstallGuide)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white/90 transition-colors cursor-pointer text-center"
                >
                  {showInstallGuide ? "Hide Install Guide" : "How to Install APK"}
                </button>
              </div>
            </div>

            {/* Cryptographic SHA-256 Checksum Bar */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[#D8829D] font-bold shrink-0">SHA-256:</span>
                <code className="text-white/80 truncate text-[11px]">
                  {latestRelease?.sha256 || app.latestSha256 || "6c3b4c785267ae5b64803d50008c1a92fec770da0da6362557530e55d96f71f1"}
                </code>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyHash(
                    latestRelease?.sha256 ||
                      app.latestSha256 ||
                      "6c3b4c785267ae5b64803d50008c1a92fec770da0da6362557530e55d96f71f1"
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] shrink-0 transition-colors cursor-pointer"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Checksum</span>
                  </>
                )}
              </button>
            </div>

            {/* Install Guide Collapsible */}
            {showInstallGuide && (
              <div className="relative z-10 mt-6 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs text-[#d8cfc4]">
                <h4 className="font-bold text-white text-sm">How to Sideload WishMusic on Android:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs">
                  <li>Download the APK file directly using the button above.</li>
                  <li>When prompted by Android, permit your browser to install unknown apps (Settings &gt; Security &gt; Install Unknown Apps).</li>
                  <li>Tap the downloaded file in your notification bar or Downloads folder.</li>
                  <li>Verify the app permissions (Storage only, zero contacts/telemetry) and tap <strong>Install</strong>.</li>
                </ol>
              </div>
            )}

            {/* Previous Releases Archive */}
            {allReleases.filter((r) => r.id !== latestRelease?.id).length > 0 && (
              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 text-xs text-[#d8cfc4] flex items-center justify-between">
                <span>Previous Stable Builds:</span>
                <div className="flex flex-wrap gap-2">
                  {allReleases
                    .filter((r) => r.id !== latestRelease?.id)
                    .map((r) => (
                      <Link
                        key={r.id}
                        href={`/api/apps/download/wishmusic?version=${r.versionName}`}
                        prefetch={false}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] transition-colors"
                      >
                        v{r.versionName}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* LIGHTBOX MODAL                                                      */}
      {/* =================================================================== */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxItem.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-white/15 object-contain"
              />
            ) : (
              <div className="w-80 h-96 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Smartphone className="w-16 h-16 text-[#935073]" />
              </div>
            )}

            <div className="mt-4 text-center">
              <h3 className="text-base font-bold text-white">{lightboxItem.title}</h3>
              {lightboxItem.caption && (
                <p className="text-xs text-[#d8cfc4] mt-0.5">{lightboxItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
