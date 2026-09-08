"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { portfolioProjects } from "@/data/portfolio";
import { PortfolioCategory, PortfolioProject } from "@/types";
import {
  ArrowUpRight,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

const categories: PortfolioCategory[] = [
  "All",
  "E-commerce",
  "Product Creatives",
  "Websites",
  "Ads",
  "Videos",
  "Branding",
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("All");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const filteredProjects =
    activeCategory === "All"
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="Featured Work"
          title="Curated Projects &amp; Commercial Workflows"
          description="Explore real e-commerce systems, marketplace creative decks, storefront builds, and direct-response advertising workflows."
        />

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer focus-ring ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] shadow-[0_0_20px_rgba(246,219,192,0.4)]"
                  : "bg-[rgba(43,20,53,0.45)] text-[#d8cfc4] hover:text-[#F8F4E9] hover:bg-[rgba(80,45,85,0.45)] border border-[#F6DBC0]/15"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cinematic Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-3xl overflow-hidden bg-gradient-to-br from-[rgba(56,24,66,0.6)] via-[rgba(43,20,53,0.5)] to-[rgba(30,12,38,0.7)] border border-[#F6DBC0]/18 hover:border-[#F6DBC0]/40 backdrop-blur-2xl shadow-[0_15px_35px_rgba(10,3,14,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(80,45,85,0.4)] flex flex-col justify-between"
            >
              <div>
                {/* Visual Preview Slot */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-[#2b1435] via-[#1c0d20] to-[#130917] border-b border-[#F6DBC0]/15 flex flex-col items-center justify-center p-6 text-center group-hover:from-[#3a1945] transition-colors overflow-hidden">
                  {/* Subtle Light Bloom */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#F6DBC0]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                  <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.85)] border border-[#F6DBC0]/25 flex items-center justify-center text-[#F6DBC0] mb-2 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#F8F4E9] tracking-tight">
                    {project.imagePlaceholderText}
                  </span>
                  <span className="text-[10px] text-[#bba89d] mt-1">
                    Visual preview slot • Real asset ready
                  </span>

                  {project.highlight && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="peach" size="sm">
                        {project.highlight}
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[rgba(24,10,30,0.85)] border border-[#F6DBC0]/15 text-[#F6DBC0] font-mono font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-7">
                  <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight group-hover:text-[#F6DBC0] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#F6DBC0] mt-1">
                    {project.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-[#d8cfc4] mt-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Scope Checklist */}
                  <div className="mt-4 pt-4 border-t border-[#F6DBC0]/12 space-y-1.5">
                    {project.scope.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-[#F8F4E9] truncate"
                      >
                        <Check className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer with Tools & Modal Trigger */}
              <div className="p-6 sm:p-7 pt-0">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-[rgba(24,10,30,0.8)] border border-[#F6DBC0]/12 text-[#bba89d] font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[rgba(56,24,66,0.6)] hover:bg-[rgba(80,45,85,0.7)] border border-[#F6DBC0]/20 hover:border-[#F6DBC0]/40 text-xs font-bold text-[#F8F4E9] hover:text-[#F6DBC0] flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-ring shadow-sm"
                >
                  View Case Details
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Project Details */}
        {selectedProject && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="relative w-full max-w-2xl bg-[rgba(32,13,40,0.95)] border border-[#F6DBC0]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(10,3,14,0.95)] max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-[#d8cfc4] hover:text-[#F8F4E9] bg-[rgba(56,24,66,0.6)] hover:bg-[rgba(80,45,85,0.8)] border border-[#F6DBC0]/20 cursor-pointer focus-ring"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="peach" size="sm">
                  {selectedProject.category}
                </Badge>
                {selectedProject.highlight && (
                  <Badge variant="default" size="sm">
                    {selectedProject.highlight}
                  </Badge>
                )}
              </div>

              <h3
                id="modal-title"
                className="text-xl sm:text-2xl font-black text-[#F8F4E9] tracking-tight"
              >
                {selectedProject.title}
              </h3>
              <p className="text-sm text-[#F6DBC0] font-semibold mt-1">
                {selectedProject.tagline}
              </p>

              <p className="text-sm text-[#d8cfc4] mt-4 leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="mt-6 pt-6 border-t border-[#F6DBC0]/15">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bba89d] mb-3">
                  Scope &amp; Deliverables Breakdown
                </h4>
                <ul className="space-y-2.5">
                  {selectedProject.scope.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F8F4E9]"
                    >
                      <Check className="w-4 h-4 text-[#F6DBC0] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-[#F6DBC0]/15">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bba89d] mb-2.5">
                  Tools &amp; Capabilities Applied
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(24,10,30,0.8)] border border-[#F6DBC0]/15 text-[#F8F4E9] font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F6DBC0]/15 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#bba89d]">
                  Want similar execution for your brand?
                </span>
                <Button
                  href="#contact"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                >
                  Inquire About This Service
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
