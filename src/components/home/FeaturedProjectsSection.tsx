"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { defaultSiteContent, getPublishedProjects, getSiteContent } from "@/lib/cms";
import type { ProjectDocument, SiteContentDocument } from "@/types/cms";
import { ArrowRight, ExternalLink, Layers } from "lucide-react";

interface FeaturedProjectsSectionProps {
  initialContent?: SiteContentDocument;
  initialProjects?: ProjectDocument[];
}

export function FeaturedProjectsSection({
  initialContent,
  initialProjects,
}: FeaturedProjectsSectionProps) {
  const [content, setContent] = useState<SiteContentDocument>(
    initialContent || defaultSiteContent
  );
  const [projects, setProjects] = useState<ProjectDocument[]>(initialProjects || []);

  useEffect(() => {
    Promise.all([getSiteContent(), getPublishedProjects()])
      .then(([site, projs]) => {
        setContent(site);
        setProjects(projs);
      })
      .catch(() => {});
  }, []);

  const sec = content.projectsSection || {};
  const pinnedIds = sec.displayedProjectIds || [];
  const selected =
    pinnedIds.length > 0
      ? pinnedIds
          .map((id) => projects.find((p) => p.id === id))
          .filter((p): p is ProjectDocument => Boolean(p))
      : projects.filter((p) => p.featured).slice(0, 6);

  const visibleProjects = selected.length > 0 ? selected : projects.slice(0, 3);
  const cols = sec.columns || 3;
  const gridClass = cols === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="projects"
      className="py-10 sm:py-20 bg-[var(--background,#FAF7F2)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-10">
          <SectionHeading
            badgeText={sec.eyebrow || "OUR WORK"}
            title={sec.title || "Selected Projects & Brands Built"}
            description={
              sec.subtitle ||
              "Real stores, mobile apps, and commercial creative work built cleanly for growth."
            }
            className="mb-0"
          />
          <Button
            href={sec.ctaLink || "/projects"}
            variant="secondary"
            size="md"
            className="self-start md:self-auto shrink-0"
          >
            <span>{sec.ctaText || "See Full Portfolio"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] text-center text-sm text-[var(--ink-body,#5F534D)]">
            No published projects selected yet. Add projects inside the Admin Panel.
          </div>
        ) : (
          <>
            {visibleProjects.length > 1 && (
              <div className="md:hidden flex items-center justify-between text-[11px] font-medium text-[var(--ink-muted,#8A7C75)] mb-2.5">
                <span>{visibleProjects.length} featured projects</span>
                <span>Swipe cards →</span>
              </div>
            )}
            <div
              className={`flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-3.5 sm:gap-6 -mx-4 px-4 pb-3 md:mx-0 md:px-0 md:pb-0 scrollbar-none ${gridClass}`}
            >
              {visibleProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="group w-[84vw] max-w-[320px] md:w-auto md:max-w-none shrink-0 snap-start rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] overflow-hidden shadow-[0_6px_22px_-6px_rgba(51,41,36,0.05)] hover:border-[#D8A999] hover:shadow-[0_16px_34px_-10px_rgba(201,106,80,0.12)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] bg-[var(--surface-sand,#F3ECE4)] border-b border-[var(--border-warm,#E8DFD5)] overflow-hidden relative flex items-center justify-center">
                      {proj.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proj.coverImage}
                          alt={proj.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[var(--ink-muted,#8A7C75)]">
                          <Layers className="w-8 h-8 text-[var(--accent-coral,#C96A50)] opacity-60" />
                          <span className="text-xs font-medium">{proj.category}</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge variant="default" size="sm">
                          {proj.category}
                        </Badge>
                        {proj.highlight && (
                          <Badge variant="peach" size="sm">
                            {proj.highlight}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-2.5 sm:space-y-3">
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--ink-primary,#332924)]">
                        {proj.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--ink-body,#5F534D)] leading-relaxed line-clamp-2">
                        {proj.shortDescription || proj.description}
                      </p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-muted,#8A7C75)]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-[var(--border-warm,#E8DFD5)]/70 flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="inline-flex items-center gap-1 text-[var(--accent-coral,#C96A50)] hover:text-[var(--accent-coral-hover,#B4583F)] py-1"
                    >
                      <span>View Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--ink-muted,#8A7C75)] hover:text-[var(--ink-primary,#332924)] py-1"
                      >
                        <span>Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
