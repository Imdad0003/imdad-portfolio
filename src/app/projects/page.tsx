"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { projectsData, Project } from "@/data/projectsData";
import {
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Globe,
  Sparkles,
  Video,
  CheckCircle2,
  Layers,
  Award,
} from "lucide-react";

type ProjectCategoryFilter =
  | "all"
  | "E-commerce"
  | "Websites"
  | "Creatives"
  | "Video & Ads"
  | "Branding";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategoryFilter>("all");

  const filteredProjects =
    activeCategory === "all"
      ? projectsData
      : projectsData.filter((p) => p.category === activeCategory);

  // Split into Tier 1 (Flagship), Tier 2 (Core), and Tier 3 (Supporting)
  const flagshipProject = projectsData.find((p) => p.id === "easyxo-brand-ecosystem");
  const secondaryProjects = projectsData.filter(
    (p) => p.id === "d2c-storefront-smartbiz" || p.id === "marketplace-infographic-system"
  );
  const supportingProjects = projectsData.filter(
    (p) => p.id !== "easyxo-brand-ecosystem" && p.id !== "d2c-storefront-smartbiz" && p.id !== "marketplace-infographic-system"
  );

  return (
    <main className="flex-1 py-10 sm:py-16">
      <Container>
        {/* Projects Hero Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#56475C] mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97746] animate-pulse" />
            CASE STUDIES // PROVEN COMMERCIAL EXECUTION
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#180D1D] leading-[1.08]">
            Selected Case Studies
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#56475C] leading-relaxed">
            Real e-commerce brands, high-speed digital storefronts, and conversion-engineered visual assets. Work executed firsthand in the studio.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-12 border-b border-[#502D55]/10">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Work" },
              { id: "E-commerce", label: "E-Commerce" },
              { id: "Websites", label: "Websites" },
              { id: "Creatives", label: "Creatives" },
              { id: "Video & Ads", label: "Video & Ads" },
              { id: "Branding", label: "Branding" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as ProjectCategoryFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#180D1D] text-white shadow-2xs"
                    : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="studio-tag text-[10px] text-[#7A6880]">
            SHOWING {filteredProjects.length} CASE STUDIES
          </span>
        </div>

        {/* IF FILTER IS 'all': RENDER EDITORIAL 3-TIER HIERARCHY */}
        {activeCategory === "all" ? (
          <div className="space-y-16">
            
            {/* TIER 1: FLAGSHIP CASE STUDY SHOWCASE (FULL-WIDTH HERO SCALE) */}
            {flagshipProject && (
              <div className="rounded-3xl bg-gradient-to-br from-white via-[#FAF5F2] to-white border border-[#502D55]/14 p-6 sm:p-12 shadow-[0_20px_50px_rgba(80,45,85,0.06)] relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#502D55]/08">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#d97746]/10 text-[#d97746] border border-[#d97746]/25 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      FLAGSHIP VENTURE CASE STUDY
                    </span>
                    <span className="studio-tag text-[10px] text-[#7A6880]">FOUNDER OPERATED</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
                    Active Live Brand
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-2xl sm:text-4xl font-black text-[#180D1D] tracking-tight">
                      {flagshipProject.name}
                    </h2>
                    <p className="text-sm sm:text-base font-semibold text-[#935073]">
                      {flagshipProject.tagline}
                    </p>
                    <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
                      {flagshipProject.description}
                    </p>

                    {/* Operational Scope */}
                    <div className="space-y-2 pt-2">
                      <span className="studio-tag text-[9px] text-[#7A6880] block">
                        FULL-STACK RESPONSIBILITIES
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {flagshipProject.scope.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#56475C]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <a
                        href="https://easyxo.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs"
                      >
                        <span>Visit Live Store (easyxo.in)</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Live Metrics & Tech Stack */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-white/90 border border-[#502D55]/10 space-y-4">
                    <span className="studio-tag text-[9px] text-[#7A6880] block">
                      COMMERCIAL &amp; OPERATIONAL SCOPE
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {flagshipProject.metrics?.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                          <span className="text-[10px] font-mono text-[#7A6880] block truncate">
                            {m.label}
                          </span>
                          <span className="text-base font-black text-[#180D1D]">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#502D55]/08">
                      <span className="studio-tag text-[9px] text-[#7A6880] block mb-1.5">
                        PLATFORMS &amp; TOOLS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {flagshipProject.tools.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0] text-[10px] font-mono font-bold text-[#180D1D]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIER 2: SECONDARY CORE PROJECTS (2-COL BALANCED SPREAD) */}
            <div>
              <div className="mb-6">
                <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
                  CORE INFRASTRUCTURE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">
                  Web Storefronts &amp; Listing Architectures
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#502D55]/12 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[10px] font-mono font-bold text-[#180D1D]">
                          {project.highlight}
                        </span>
                        <span className="text-[10px] font-mono text-[#7A6880]">
                          {project.status}
                        </span>
                      </div>

                      <h4 className="text-xl font-bold text-[#180D1D] mb-1">
                        {project.name}
                      </h4>
                      <p className="text-xs font-mono text-[#7A6880] mb-3">
                        {project.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed mb-4">
                        {project.description}
                      </p>

                      <div className="space-y-1.5 mb-4">
                        {project.deliverables.map((del, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#56475C]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#502D55]/08 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap gap-1">
                        {project.tools.slice(0, 2).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-[#FAF4F9] text-[9px] font-mono text-[#7A6880]">
                            {t}
                          </span>
                        ))}
                      </div>

                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#180D1D] hover:text-[#935073] flex items-center gap-1"
                        >
                          <span>Live Site</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          href="/contact"
                          className="font-bold text-[#180D1D] hover:text-[#935073] flex items-center gap-1"
                        >
                          <span>Inquire Scope</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 3: EDITORIAL ARCHITECTURAL LIST (ADS, VIDEO, BRANDING) */}
            <div>
              <div className="mb-6">
                <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
                  CREATIVE MEDIA &amp; IDENTITY
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">
                  Video Campaigns, Reels &amp; Packaging
                </h3>
              </div>

              <div className="divide-y divide-[#502D55]/12 border-y border-[#502D55]/12 bg-white/60 rounded-2xl overflow-hidden px-6">
                {supportingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-base text-[#180D1D]">{project.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-[#FAF2EA] text-[9px] font-mono text-[#7A3F26]">
                          {project.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#56475C]">{project.tagline}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {project.tools.slice(0, 2).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white border border-[#502D55]/10 text-[9px] font-mono text-[#7A6880]">
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/contact?subject=${encodeURIComponent(`Case study inquiry: ${project.name}`)}`}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF4F9] border border-[#502D55]/12 text-xs font-bold text-[#180D1D] flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <span>Inquire</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* FILTERED VIEW GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#502D55]/12 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[10px] font-mono font-bold text-[#180D1D]">
                      {project.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#7A6880]">
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs font-mono text-[#7A6880] mb-3">
                    {project.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#502D55]/08 flex items-center justify-between text-xs">
                  <span className="studio-tag text-[9px] text-[#7A6880]">
                    {project.tools[0]}
                  </span>
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#180D1D] hover:text-[#935073] flex items-center gap-1"
                    >
                      <span>Live Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href="/contact"
                      className="font-bold text-[#180D1D] hover:text-[#935073] flex items-center gap-1"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kickoff Banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-[#FAF2EA] border border-[#F6DBC0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="studio-tag text-[10px] text-[#7A3F26] font-bold block mb-1">REAL EXECUTION ONLY</span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">Have a project worth building?</h3>
            <p className="text-xs sm:text-sm text-[#56475C] mt-1 max-w-xl">
              We apply this exact battle-tested framework to your product, storefront, or marketplace listings.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold text-xs sm:text-sm shrink-0 transition-all shadow-2xs"
          >
            Start a Project
          </Link>
        </div>
      </Container>
    </main>
  );
}
