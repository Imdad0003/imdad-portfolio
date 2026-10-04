"use client";

import React from "react";
import Link from "next/link";
import { App } from "@/data/apps";
import {
  ArrowRight,
  ExternalLink,
  Music,
  Target,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export function AppCard({ app }: { app: App }) {
  const isLive = app.status === "live";
  const isInDev = app.status === "in-development";

  return (
    <div className="group rounded-3xl bg-white/95 border border-[#502D55]/12 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#935073]/40 hover:shadow-[0_20px_45px_rgba(80,45,85,0.08)] relative overflow-hidden">
      {/* Background Accent Glow */}
      <div
        className="absolute top-0 right-0 w-44 h-44 opacity-10 rounded-full blur-3xl pointer-events-none group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: app.accentColor }}
      />

      <div>
        {/* Top Header: Status + Platforms */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
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
                  : "bg-purple-500"
              }`}
            />
            {app.statusLabel}
          </span>

          <div className="flex items-center gap-1">
            {app.platform.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-md bg-[#FAF4F9] border border-[#502D55]/08 text-[9px] font-mono text-[#56475C]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Identity & Logo */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/60 text-white"
            style={{ backgroundColor: app.accentColor }}
          >
            {app.id === "wishmusic" && <Music className="w-7 h-7" />}
            {app.id === "wishtracking" && <Target className="w-7 h-7" />}
            {app.id === "easyxo" && <ShoppingBag className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#180D1D] tracking-tight group-hover:text-[#935073] transition-colors">
              {app.name}
            </h3>
            <p className="text-xs font-mono text-[#7A6880]">
              {app.category} &bull; {app.version || "Studio Build"}
            </p>
          </div>
        </div>

        {/* Tagline & Short Description */}
        <p className="text-xs sm:text-sm font-semibold text-[#180D1D] mb-2">
          {app.tagline}
        </p>
        <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed mb-6 font-normal">
          {app.description}
        </p>

        {/* Key Features */}
        <div className="space-y-2 mb-6 pt-4 border-t border-[#502D55]/08">
          <span className="studio-tag text-[9px] text-[#7A6880] block mb-2">
            CORE CAPABILITIES
          </span>
          {app.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#56475C]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#935073] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#180D1D]">{feat.title}: </span>
                <span className="text-[#7A6880]">{feat.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {app.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md bg-white border border-[#502D55]/10 text-[10px] font-mono text-[#56475C]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-5 border-t border-[#502D55]/08 flex items-center justify-between">
        <span className="studio-tag text-[9px] text-[#7A6880]">
          RELEASE: {app.releaseDate || "Q2 2026"}
        </span>

        <div className="flex items-center gap-2">
          {app.links.liveUrl && (
            <a
              href={app.links.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white hover:bg-[#FAF4F9] border border-[#502D55]/12 text-[#180D1D] transition-colors"
              aria-label={`Open ${app.name} live`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            href={`/apps/${app.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF2EA] hover:bg-[#180D1D] hover:text-white border border-[#502D55]/10 text-xs font-bold text-[#180D1D] transition-all group/btn shadow-2xs"
          >
            <span>Product Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
