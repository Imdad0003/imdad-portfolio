"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { appsData, App, AppPlatform, AppStatus } from "@/data/apps";
import { getPublishedApps, getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import {
  ArrowRight,
  Music,
  Target,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

interface NewAppsSectionProps {
  initialContent?: SiteContentDocument["appsSection"];
}

export function NewAppsSection({ initialContent }: NewAppsSectionProps) {
  const [apps, setApps] = useState<App[]>(appsData);
  const [headerContent, setHeaderContent] = useState({
    eyebrow: initialContent?.eyebrow || "PRODUCT LAB // CURRENT RELEASES",
    title: initialContent?.title || "New Apps",
    subtitle: initialContent?.subtitle || "Digital products conceptualized, engineered, and shipped by Imdad.builds. Distinctive tools with zero bloat.",
    ctaText: initialContent?.ctaText || "VIEW ALL APPS & ECOSYSTEM",
    ctaLink: initialContent?.ctaLink || "/apps",
  });

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.appsSection) {
          setHeaderContent({
            eyebrow: content.appsSection.eyebrow || "PRODUCT LAB // CURRENT RELEASES",
            title: content.appsSection.title || "New Apps",
            subtitle: content.appsSection.subtitle || "Digital products conceptualized, engineered, and shipped by Imdad.builds. Distinctive tools with zero bloat.",
            ctaText: content.appsSection.ctaText || "VIEW ALL APPS & ECOSYSTEM",
            ctaLink: content.appsSection.ctaLink || "/apps",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getPublishedApps()
      .then((docs) => {
        if (docs && docs.length > 0) {
          setApps(
            docs.map((d) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              logo: d.logo,
              tagline: d.tagline || d.shortDescription,
              description: d.shortDescription || d.description,
              fullDescription: d.description,
              platform: (d.platform || ["Web"]) as AppPlatform[],
              status: (d.status === "LIVE"
                ? "live"
                : d.status === "IN_DEVELOPMENT"
                ? "in-development"
                : "coming-soon") as AppStatus,
              statusLabel:
                d.status === "LIVE"
                  ? "Live Brand"
                  : d.status === "IN_DEVELOPMENT"
                  ? "In Development"
                  : "Coming Soon",
              isNew: d.isNew ?? false,
              featured: d.featured ?? true,
              category: d.category || "Application",
              accentColor: d.accentColor || "#935073",
              version: d.version,
              releaseDate: d.releaseDate,
              features: d.features || [],
              techStack: d.technologies || [],
              links: { liveUrl: d.url, waitlistUrl: d.waitlistUrl },
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Firestore NewAppsSection load error:", err);
      });
  }, []);
  return (
    <section id="new-apps" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-y border-slate-200">
      {/* Decorative architectural grid markers */}
      <div className="absolute top-0 left-8 text-[10px] font-mono text-slate-300 select-none pointer-events-none">
        +---+ APP_LAB_01
      </div>
      <div className="absolute bottom-0 right-8 text-[10px] font-mono text-slate-300 select-none pointer-events-none">
        +---+ IMDAD.BUILDS
      </div>

      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono text-[#0284C7] mb-3 shadow-2xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
              {headerContent.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F]">
              {headerContent.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              {headerContent.subtitle}
            </p>
          </div>

          <Link
            href={headerContent.ctaLink || "/apps"}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0A192F] hover:text-[#0284C7] transition-colors group shrink-0"
          >
            <span>{headerContent.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3-Card Studio Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {apps.map((app) => {
            const isLive = app.status === "live";
            const isInDev = app.status === "in-development";

            return (
              <div
                key={app.id}
                className="group rounded-3xl bg-white/95 border border-slate-200 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#0284C7]/40 hover:shadow-[0_20px_45px_rgba(10,25,47,0.08)] relative overflow-hidden"
              >
                {/* Top Ambient Glow on Hover */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl pointer-events-none group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: app.accentColor }}
                />

                <div>
                  {/* Top Bar: Status Badge + Platform Tags */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
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
                            : "bg-sky-500"
                        }`}
                      />
                      {app.statusLabel}
                    </span>

                    <div className="flex items-center gap-1">
                      {app.platform.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-mono text-slate-600"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* App Title & Identity */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200 overflow-hidden bg-white text-white"
                    >
                      {app.logo ? (
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0284C7] text-white">
                          {app.id === "wishmusic" && <Music className="w-6 h-6" />}
                          {app.id === "wishtracking" && <Target className="w-6 h-6" />}
                          {app.id === "easyxo" && <ShoppingBag className="w-6 h-6" />}
                          {app.id !== "wishmusic" && app.id !== "wishtracking" && app.id !== "easyxo" && (
                            <span className="font-black text-sm">{app.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {app.category}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {app.description}
                  </p>

                  {/* App Feature Highlights */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {app.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#0A192F]">{feat.title}: </span>
                          <span className="text-slate-500">{feat.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {app.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="studio-tag text-[9px] text-slate-400 font-mono">
                    {app.version || "STUDIO LAB"}
                  </span>

                  <Link
                    href={`/apps/${app.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-[#0284C7] hover:text-white border border-sky-200 text-xs font-bold text-[#0284C7] transition-all group/btn shadow-2xs"
                  >
                    <span>Inspect App</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Studio Stamp Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-white/80 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-[#0A192F]">Independent Product Lab:</span>
            <span>All apps engineered with tactile performance and zero telemetry bloat.</span>
          </div>
          <span className="studio-tag text-[9px] text-[#0284C7] font-mono font-bold uppercase tracking-wider">
            POWERED BY IMDAD.BUILDS
          </span>
        </div>
      </Container>
    </section>
  );
}
