"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getFeaturedProjects, Project } from "@/data/projectsData";
import { getPublishedProjects } from "@/lib/cms";
import {
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Globe,
  Sparkles,
  Video,
  CheckCircle2,
} from "lucide-react";

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "E-commerce": ShoppingBag,
  "Websites": Globe,
  "Creatives": Sparkles,
  "Video & Ads": Video,
};

export function FeaturedProjectsSection() {
  const [featured, setFeatured] = useState<Project[]>(getFeaturedProjects().slice(0, 4));

  useEffect(() => {
    getPublishedProjects()
      .then((docs) => {
        if (docs && docs.length > 0) {
          const mapped: Project[] = docs
            .filter((d) => d.featured)
            .slice(0, 4)
            .map((d) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              category: d.category as Project["category"],
              tagline: d.shortDescription || "",
              description: d.description,
              scope: d.scope || [],
              tools: d.technologies || [],
              status: d.status,
              featured: d.featured,
              highlight: d.highlight,
              url: d.url,
              accentColor: d.accentColor || "#d97746",
              metrics: d.metrics,
              deliverables: d.deliverables || [],
            }));
          if (mapped.length > 0) {
            setFeatured(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn("FeaturedProjectsSection Firestore sync fallback:", err);
      });
  }, []);

  return (
    <section id="featured-projects" className="py-16 sm:py-24 relative overflow-hidden bg-white/40 border-t border-[#502D55]/08">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#56475C] mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97746] animate-pulse" />
              CASE STUDIES // PROVEN EXECUTION
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#180D1D]">
              Featured Projects
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#56475C] max-w-xl">
              Real commerce ventures, technical storefronts, and conversion-first visual architectures shipped by our studio.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#180D1D] hover:text-[#935073] transition-colors group shrink-0"
          >
            <span>VIEW ALL CASE STUDIES</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2-Column High-Fidelity Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {featured.map((project) => {
            const Icon = categoryIconMap[project.category] || Globe;

            return (
              <div
                key={project.id}
                className="group rounded-3xl bg-white/95 border border-[#502D55]/12 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#935073]/40 hover:shadow-[0_20px_45px_rgba(80,45,85,0.08)] relative overflow-hidden"
              >
                {/* Visual Backdrop Pill */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: project.accentColor }}
                />

                <div>
                  {/* Top Bar: Highlight badge & status */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[10px] font-mono font-bold text-[#180D1D]">
                      <Icon className="w-3 h-3 text-[#935073]" />
                      {project.highlight || project.category}
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#502D55]/10 text-[9px] font-mono text-[#56475C]">
                      {project.status}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight group-hover:text-[#935073] transition-colors mb-2">
                    {project.name}
                  </h3>

                  <p className="text-xs sm:text-sm font-mono text-[#7A6880] mb-4">
                    {project.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Metric Chips if Available */}
                  {project.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08">
                      {project.metrics.map((m, idx) => (
                        <div key={idx}>
                          <span className="text-[9px] font-mono text-[#7A6880] block truncate">
                            {m.label}
                          </span>
                          <span className="text-xs font-bold text-[#180D1D]">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Scope bullets */}
                  <div className="space-y-1.5 mb-6">
                    {project.scope.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#56475C]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#935073] shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Link & Tools */}
                <div className="pt-5 border-t border-[#502D55]/08 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {project.tools.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#502D55]/10 text-[9px] font-mono text-[#7A6880]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#180D1D] hover:text-[#935073] group/link"
                    >
                      <span>Live Site</span>
                      <ExternalLink className="w-3.5 h-3.5 group-link-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#180D1D] hover:text-[#935073] group/link"
                    >
                      <span>Case Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-link-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
