"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getFeaturedProjects, Project } from "@/data/projectsData";
import { getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import {
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Globe,
  Music,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface FeaturedProjectsSectionProps {
  initialContent?: SiteContentDocument["projectsSection"];
}

export function FeaturedProjectsSection({ initialContent }: FeaturedProjectsSectionProps) {
  const [headerContent, setHeaderContent] = useState({
    eyebrow: initialContent?.eyebrow || "FEATURED WORK // REAL CASE STUDIES",
    title: initialContent?.title || "Real Products & Shipped Projects",
    subtitle:
      initialContent?.subtitle ||
      "Explore live commerce ventures, technical storefronts, and digital applications engineered by imdad.builds.",
    ctaText: initialContent?.ctaText || "VIEW ALL CASE STUDIES & WORK",
    ctaLink: initialContent?.ctaLink || "/projects",
  });

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.projectsSection) {
          setHeaderContent({
            eyebrow: content.projectsSection.eyebrow || "FEATURED WORK // REAL CASE STUDIES",
            title: content.projectsSection.title || "Real Products & Shipped Projects",
            subtitle:
              content.projectsSection.subtitle ||
              "Explore live commerce ventures, technical storefronts, and digital applications engineered by imdad.builds.",
            ctaText: content.projectsSection.ctaText || "VIEW ALL CASE STUDIES & WORK",
            ctaLink: content.projectsSection.ctaLink || "/projects",
          });
        }
      })
      .catch(() => {});
  }, []);

  // Guarantee EasyXo, WishMusic, and real studio portfolio projects are featured
  const allProjects = getFeaturedProjects();
  const easyxo = allProjects.find((p) => p.slug.includes("easyxo")) || allProjects[0];
  const wishmusic = allProjects.find((p) => p.slug.includes("wishmusic")) || allProjects[1];
  const infographic = allProjects.find((p) => p.slug.includes("infographic")) || allProjects[2];
  const d2c = allProjects.find((p) => p.slug.includes("d2c") || p.slug.includes("storefront")) || allProjects[3];

  const featuredList: Project[] = [
    easyxo,
    wishmusic,
    infographic,
    d2c,
  ].filter(Boolean);

  return (
    <section id="projects" className="py-16 sm:py-24 relative overflow-hidden">
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

        {/* Featured Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {featuredList.map((project) => {
            const isEasyXo = project.slug.includes("easyxo");
            const isWishMusic = project.slug.includes("wishmusic");
            const projectLink = isEasyXo
              ? "/apps/easyxo"
              : isWishMusic
              ? "/apps/wishmusic"
              : `/projects/${project.slug}`;

            return (
              <div
                key={project.id}
                className="group relative rounded-3xl bg-white/85 hover:bg-white border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Row: Category + Status Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/80">
                      {project.category}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        project.status === "Active Brand" || project.status === "Live Store"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors flex items-center justify-between">
                    <span>{project.name}</span>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#0284C7] transition-colors p-1"
                        aria-label={`Visit live site for ${project.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm font-mono font-medium text-slate-500 mt-1">
                    {project.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5">
                    {project.description}
                  </p>

                  {/* Visual Preview / Simulated Architecture Box */}
                  <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    {isEasyXo && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-[#0A192F] flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#0284C7]" />
                            EASYXO.IN D2C STOREFRONT
                          </span>
                          <span className="text-emerald-600 font-bold">LIVE PRODUCTION</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Direct-to-consumer e-commerce brand founded and operated by Imdad. Complete product cataloging, mobile checkout, and marketplace integration.
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {["Direct Storefront", "Amazon & Flipkart", "Razorpay UPI", "Custom Packaging"].map((item) => (
                            <span
                              key={item}
                              className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isWishMusic && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-[#0A192F] flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5 text-[#0284C7]" />
                            WISHMUSIC PLAYER ENGINE
                          </span>
                          <span className="text-amber-600 font-bold">IN DEVELOPMENT</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Tactile, low-latency audio player interface. Gesture controls, offline playback, high-contrast album typography, and lossless audio support.
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {["iOS & Android", "Offline-First SQLite", "Lossless Audio", "AudioEngine v0.8"].map((item) => (
                            <span
                              key={item}
                              className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isEasyXo && !isWishMusic && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-[#0A192F] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                            DELIVERABLE ARCHITECTURE
                          </span>
                          <span className="text-slate-500 font-bold">{project.category.toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {project.highlight || "Commercial-grade digital asset engineered for conversion velocity and platform standards."}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.tools.slice(0, 4).map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-medium"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scope / Deliverables List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      KEY DELIVERABLES &amp; SCOPE
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.scope.slice(0, 4).map((item) => (
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

                {/* Inspect Link */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={projectLink}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors"
                  >
                    <span>{isEasyXo ? "INSPECT EASYXO ECOSYSTEM" : isWishMusic ? "INSPECT WISHMUSIC APP" : "VIEW CASE STUDY"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[10px] font-mono text-slate-400">
                    VERIFIED PROJECT
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
