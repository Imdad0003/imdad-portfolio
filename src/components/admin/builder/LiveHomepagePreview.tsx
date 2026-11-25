"use client";

import React from "react";
import type { SiteContentDocument } from "@/types/cms";
import { buildThemeCssVariables } from "@/lib/theme";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface LiveHomepagePreviewProps {
  draft: SiteContentDocument;
  device: "desktop" | "mobile";
  onClickSection?: (sectionKey: string) => void;
}

export function LiveHomepagePreview({
  draft,
  device,
  onClickSection,
}: LiveHomepagePreviewProps) {
  const vars = buildThemeCssVariables(draft.themeSettings);
  const order = draft.metadata?.sectionOrder || [];
  const vis = draft.metadata?.sectionVisibility || {};
  const quickItems = draft.hero.quickStartItems || [];
  const customSections = draft.customSections || [];

  const handleJump = (key: string) => {
    if (onClickSection) onClickSection(key);
  };

  return (
    <div
      style={vars}
      className={`mx-auto rounded-2xl border border-[#E8DFD5] overflow-hidden shadow-lg transition-all ${
        device === "mobile" ? "max-w-[380px]" : "w-full"
      }`}
    >
      <div
        className="text-[11px] leading-normal transition-colors"
        style={{
          backgroundColor: "var(--background, #FAF7F2)",
          color: "var(--ink-primary, #332924)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Mini Navbar */}
        <div
          onClick={() => handleJump("navigation")}
          className="px-4 py-3 border-b flex items-center justify-between gap-2 cursor-pointer hover:opacity-90"
          style={{
            backgroundColor: "var(--surface-pure, #FFFFFF)",
            borderColor: "var(--border-warm, #E8DFD5)",
          }}
        >
          <span className="font-bold tracking-tight text-xs">
            {draft.navigation?.brandName || draft.footer?.studioName || "IMDAD.BUILDS"}
          </span>
          {device === "desktop" && (
            <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--ink-body, #5F534D)" }}>
              {(draft.navigation?.navLinks || []).slice(0, 4).map((l, idx) => (
                <span key={idx}>{l.label}</span>
              ))}
            </div>
          )}
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: "var(--accent-coral, #C96A50)" }}
          >
            {draft.navigation?.ctaText || "Start Project"}
          </span>
        </div>

        {/* Ordered Sections */}
        <div className="divide-y" style={{ borderColor: "var(--border-warm, #E8DFD5)" }}>
          {order
            .filter((secId) => vis[secId] ?? true)
            .map((secId) => {
              if (secId === "hero") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("hero")}
                    className="p-5 sm:p-6 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                  >
                    <div
                      className={`grid gap-4 items-center ${
                        device === "desktop" ? "grid-cols-12" : "grid-cols-1"
                      }`}
                    >
                      <div className={device === "desktop" ? "col-span-7 space-y-2.5" : "space-y-2"}>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold"
                          style={{
                            backgroundColor: "var(--surface-peach, #FAECE4)",
                            color: "var(--accent-coral, #C96A50)",
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{draft.hero.badge}</span>
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold leading-tight">
                          {draft.hero.headline}
                        </h3>
                        <p className="text-[11px]" style={{ color: "var(--ink-body, #5F534D)" }}>
                          {draft.hero.subheadline}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span
                            className="px-3 py-1.5 rounded-full text-[10px] font-bold text-white inline-flex items-center gap-1"
                            style={{ backgroundColor: "var(--accent-coral, #C96A50)" }}
                          >
                            <span>{draft.hero.primaryCtaText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                          <span
                            className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
                            style={{
                              backgroundColor: "var(--surface-pure, #FFFFFF)",
                              borderColor: "var(--border-warm, #E8DFD5)",
                            }}
                          >
                            {draft.hero.secondaryCtaText}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border space-y-2 ${
                          device === "desktop" ? "col-span-5" : ""
                        }`}
                        style={{
                          backgroundColor: "var(--surface-pure, #FFFFFF)",
                          borderColor: "var(--border-warm, #E8DFD5)",
                        }}
                      >
                        <div className="text-[10px] font-bold">
                          {draft.hero.quickStartTitle || "Quick Start"}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {quickItems.slice(0, 4).map((q) => (
                            <div
                              key={q.id}
                              className="p-2 rounded-xl border text-[9px]"
                              style={{
                                backgroundColor: "var(--background, #FAF7F2)",
                                borderColor: "var(--border-warm, #E8DFD5)",
                              }}
                            >
                              <div className="font-bold truncate">{q.title}</div>
                              <div className="truncate opacity-75">{q.subtitle}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (secId === "services") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("services")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                    style={{ backgroundColor: "var(--surface-pure, #FFFFFF)" }}
                  >
                    <div className="text-[9px] font-bold uppercase opacity-70">
                      {draft.servicesSection?.eyebrow || "SERVICES"}
                    </div>
                    <div className="font-bold text-sm mt-0.5">
                      {draft.servicesSection?.title || "What We Can Build For You"}
                    </div>
                    <p className="text-[10px] opacity-75 mt-1">
                      Grid Columns: {draft.servicesSection?.columns || 3} • Click to edit services copy
                    </p>
                  </div>
                );
              }

              if (secId === "projects") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("projects")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                  >
                    <div className="text-[9px] font-bold uppercase opacity-70">
                      {draft.projectsSection?.eyebrow || "RECENT WORK"}
                    </div>
                    <div className="font-bold text-sm mt-0.5">
                      {draft.projectsSection?.title || "Selected Projects"}
                    </div>
                    <p className="text-[10px] opacity-75 mt-1">
                      Columns: {draft.projectsSection?.columns || 3} •{" "}
                      {(draft.projectsSection?.displayedProjectIds || []).length || "All"} projects pinned
                    </p>
                  </div>
                );
              }

              if (secId === "overview") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("overview")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                    style={{ backgroundColor: "var(--surface-pure, #FFFFFF)" }}
                  >
                    <div className="text-[9px] font-bold uppercase opacity-70">
                      {draft.overviewSection?.eyebrow || "ABOUT US"}
                    </div>
                    <div className="font-bold text-sm mt-0.5">
                      {draft.overviewSection?.headline}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {(draft.overviewSection?.pillars || []).map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded-xl border text-[9px]"
                          style={{
                            backgroundColor: "var(--background, #FAF7F2)",
                            borderColor: "var(--border-warm, #E8DFD5)",
                          }}
                        >
                          <div className="font-bold truncate">{p.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (secId === "process") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("process")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                  >
                    <div className="font-bold text-sm">{draft.processSection?.headline}</div>
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {(draft.processSection?.steps || []).map((s) => (
                        <div
                          key={s.id}
                          className="p-2 rounded-lg border text-[9px]"
                          style={{
                            backgroundColor: "var(--surface-pure, #FFFFFF)",
                            borderColor: "var(--border-warm, #E8DFD5)",
                          }}
                        >
                          <span className="font-bold">{s.step}.</span> {s.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (secId === "why-us") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("why-us")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                    style={{ backgroundColor: "var(--surface-pure, #FFFFFF)" }}
                  >
                    <div className="font-bold text-sm">{draft.whyUsSection?.headline}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(draft.whyUsSection?.items || []).map((w) => (
                        <span
                          key={w.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold"
                          style={{ backgroundColor: "var(--surface-peach, #FAECE4)" }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{w.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (secId === "team") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("team")}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                  >
                    <div className="font-bold text-sm">{draft.teamSection?.headline}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(draft.teamSection?.members || [])
                        .filter((m) => m.enabled ?? true)
                        .map((m) => (
                          <div
                            key={m.id}
                            className="px-2.5 py-1.5 rounded-xl border text-[10px]"
                            style={{
                              backgroundColor: "var(--surface-pure, #FFFFFF)",
                              borderColor: "var(--border-warm, #E8DFD5)",
                            }}
                          >
                            <span className="font-bold">{m.name}</span> • {m.role}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }

              if (secId === "final-cta") {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump("cta")}
                    className="p-5 cursor-pointer text-center hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                    style={{ backgroundColor: "var(--surface-peach, #FAECE4)" }}
                  >
                    <div className="font-bold text-sm">{draft.finalCta.headline}</div>
                    <div className="mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "var(--accent-coral, #C96A50)" }}>
                      {draft.finalCta.primaryCtaText}
                    </div>
                  </div>
                );
              }

              const custom = customSections.find((c) => c.id === secId);
              if (custom) {
                return (
                  <div
                    key={secId}
                    onClick={() => handleJump(custom.id)}
                    className="p-5 cursor-pointer hover:ring-2 hover:ring-inset hover:ring-[#C96A50]/40"
                    style={{
                      backgroundColor:
                        custom.tone === "white"
                          ? "var(--surface-pure, #FFFFFF)"
                          : custom.tone === "peach"
                          ? "var(--surface-peach, #FAECE4)"
                          : "var(--background, #FAF7F2)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase opacity-75">
                        Custom ({custom.layout})
                      </span>
                      <span className="text-[9px] font-bold underline">Edit block</span>
                    </div>
                    <div className="font-bold text-sm mt-0.5">{custom.headline}</div>
                    {custom.items && custom.items.length > 0 && (
                      <div className="text-[10px] opacity-75 mt-1">
                        {custom.items.length} item(s) inside this section
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={secId}
                  onClick={() => handleJump("layout")}
                  className="p-4 text-[10px] opacity-75 cursor-pointer"
                >
                  Built-in Block: {secId}
                </div>
              );
            })}
        </div>

        {/* Mini Footer */}
        <div
          onClick={() => handleJump("footer")}
          className="px-4 py-3 border-t flex items-center justify-between text-[10px] cursor-pointer"
          style={{
            backgroundColor: "var(--surface-pure, #FFFFFF)",
            borderColor: "var(--border-warm, #E8DFD5)",
            color: "var(--ink-body, #5F534D)",
          }}
        >
          <span>© {draft.footer.copyrightYear} {draft.footer.studioName}</span>
          <span>Click to edit Footer</span>
        </div>
      </div>
    </div>
  );
}
