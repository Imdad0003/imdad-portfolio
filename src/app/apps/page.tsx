"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { appsData, App, AppPlatform, AppStatus } from "@/data/apps";
import { AppCard } from "@/components/apps/AppCard";
import { getPublishedApps } from "@/lib/cms";
import {
  Sparkles,
  Layers,
  Terminal,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>(appsData);
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | AppStatus>("all");

  useEffect(() => {
    getPublishedApps()
      .then((docs) => {
        if (docs && docs.length > 0) {
          setApps(
            docs.map((d) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
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
      .catch((err) => console.warn("Firestore AppsPage load error:", err));
  }, []);

  const filteredApps = apps.filter((app) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new") return app.isNew;
    return app.status === activeFilter;
  });

  return (
    <main className="flex-1 py-12 sm:py-20">
      <Container>
        {/* Apps Hero */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#56475C] mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            IMDAD.BUILDS // PRODUCT ECOSYSTEM
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#180D1D] leading-[1.1]">
            Apps I&apos;ve Built
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#56475C] leading-relaxed">
            A portfolio of independent digital products, mobile applications, and software tools conceptualized and built in the Imdad.builds studio.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 border-b border-[#502D55]/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-[#180D1D] text-white shadow-2xs"
                  : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
              }`}
            >
              All Apps ({appsData.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("new")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFilter === "new"
                  ? "bg-[#180D1D] text-white shadow-2xs"
                  : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
              }`}
            >
              New Apps ({appsData.filter((a) => a.isNew).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("live")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFilter === "live"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-white text-[#065F46] hover:bg-emerald-50 border border-emerald-300/60"
              }`}
            >
              Live Brands ({appsData.filter((a) => a.status === "live").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("in-development")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFilter === "in-development"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-white text-[#92400E] hover:bg-amber-50 border border-amber-300/60"
              }`}
            >
              In Development ({appsData.filter((a) => a.status === "in-development").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("coming-soon")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeFilter === "coming-soon"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-white text-[#6B21A8] hover:bg-purple-50 border border-purple-300/60"
              }`}
            >
              Coming Soon ({appsData.filter((a) => a.status === "coming-soon").length})
            </button>
          </div>

          <span className="studio-tag text-[10px] text-[#7A6880]">
            SHOWING {filteredApps.length} PRODUCTS
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Studio Principles Note */}
        <div className="mt-16 p-6 rounded-3xl bg-white/80 border border-[#502D55]/12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#56475C]">
          <div className="space-y-1">
            <span className="font-bold text-[#180D1D] block">Future Apps In Incubation</span>
            <p>Our studio continuously prototypes tools in media playback, personal productivity, and commerce automation.</p>
          </div>
          <span className="studio-tag text-[9px] text-[#935073] font-bold shrink-0">
            POWERED BY IMDAD.BUILDS
          </span>
        </div>
      </Container>
    </main>
  );
}
