"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { appsData, App, AppPlatform, AppStatus } from "@/data/apps";
import { getPublishedApps, getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";
import { ArrowRight, Music, Target, ShoppingBag, CheckCircle2 } from "lucide-react";

interface NewAppsSectionProps {
  initialContent?: SiteContentDocument["appsSection"];
}

export function NewAppsSection({ initialContent }: NewAppsSectionProps) {
  const [apps, setApps] = useState<App[]>(appsData);
  const [headerContent, setHeaderContent] = useState({
    eyebrow: initialContent?.eyebrow || "Our Apps",
    title: initialContent?.title || "Apps & Tools We Build",
    subtitle:
      initialContent?.subtitle ||
      "Simple mobile apps and helpful digital products built inside our studio.",
    ctaText: initialContent?.ctaText || "View All Apps",
    ctaLink: initialContent?.ctaLink || "/apps",
  });

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.appsSection) {
          setHeaderContent({
            eyebrow: content.appsSection.eyebrow || "Our Apps",
            title: content.appsSection.title || "Apps & Tools We Build",
            subtitle:
              content.appsSection.subtitle ||
              "Simple mobile apps and helpful digital products built inside our studio.",
            ctaText: content.appsSection.ctaText || "View All Apps",
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
                  ? "Live"
                  : d.status === "IN_DEVELOPMENT"
                  ? "In Progress"
                  : "Coming Soon",
              isNew: d.isNew ?? false,
              featured: d.featured ?? true,
              category: d.category || "Application",
              accentColor: d.accentColor || "#C96A50",
              version: d.version,
              releaseDate: d.releaseDate,
              features: d.features || [],
              techStack: d.technologies || [],
              links: { liveUrl: d.url, waitlistUrl: d.waitlistUrl },
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="new-apps" className="py-16 sm:py-20 bg-[#F4EFE8]/75 border-y border-[#E8DFD5]">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAECE4] border border-[#F0CFC0] text-xs font-semibold text-[#B4583F] mb-3">
              {headerContent.eyebrow}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#332924]">
              {headerContent.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#5F534D] max-w-xl">
              {headerContent.subtitle}
            </p>
          </div>

          <Link
            href={headerContent.ctaLink || "/apps"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C96A50] hover:text-[#B4583F] transition-colors shrink-0"
          >
            <span>{headerContent.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const isLive = app.status === "live";
            const isInDev = app.status === "in-development";

            return (
              <div
                key={app.id}
                className="rounded-3xl bg-white border border-[#E8DFD5] p-6 sm:p-7 flex flex-col justify-between hover:border-[#D8A999] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isLive
                          ? "badge-live"
                          : isInDev
                          ? "badge-in-development"
                          : "badge-coming-soon"
                      }`}
                    >
                      {app.statusLabel}
                    </span>

                    <div className="flex items-center gap-1">
                      {app.platform.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#5F534D]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-[#E8DFD5] overflow-hidden bg-[#FAF7F2]">
                      {app.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FAECE4] text-[#C96A50]">
                          {app.id === "wishmusic" && <Music className="w-6 h-6" />}
                          {app.id === "wishtracking" && <Target className="w-6 h-6" />}
                          {app.id === "easyxo" && <ShoppingBag className="w-6 h-6" />}
                          {app.id !== "wishmusic" &&
                            app.id !== "wishtracking" &&
                            app.id !== "easyxo" && (
                              <span className="font-bold text-sm">
                                {app.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#332924]">
                        {app.name}
                      </h3>
                      <p className="text-xs text-[#8A7C75]">{app.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#5F534D] leading-relaxed mb-5">
                    {app.description}
                  </p>

                  <div className="space-y-2 mb-5 pt-4 border-t border-[#F3ECE4]">
                    {app.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#5F534D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C96A50] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#332924]">{feat.title}: </span>
                          <span>{feat.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F3ECE4] flex items-center justify-between">
                  <span className="text-xs text-[#8A7C75]">{app.version || "Studio App"}</span>

                  <Link
                    href={`/apps/${app.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAECE4] hover:bg-[#C96A50] hover:text-white text-xs font-semibold text-[#B4583F] transition-colors"
                  >
                    <span>View App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
