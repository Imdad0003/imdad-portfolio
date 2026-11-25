"use client";

import React from "react";
import type { SiteContentDocument, SiteThemeSettings } from "@/types/cms";
import { THEME_PRESETS, FONT_PAIRING_OPTIONS } from "@/lib/theme";
import { Palette, Type, Search, Image as ImageIcon, RotateCcw } from "lucide-react";

interface ThemeAndSeoTabProps {
  mode: "theme" | "seo";
  draft: SiteContentDocument;
  onUpdateDraft: (updater: (prev: SiteContentDocument) => SiteContentDocument) => void;
  onOpenMediaPicker: (onPicked: (url: string) => void) => void;
}

export function ThemeAndSeoTab({
  mode,
  draft,
  onUpdateDraft,
  onOpenMediaPicker,
}: ThemeAndSeoTabProps) {
  const theme: SiteThemeSettings = draft.themeSettings || {};
  const seo = draft.metadata?.seo || {};

  const updateTheme = (patch: Partial<SiteThemeSettings>) => {
    onUpdateDraft((prev) => ({
      ...prev,
      themeSettings: {
        ...(prev.themeSettings || {}),
        ...patch,
      },
    }));
  };

  if (mode === "theme") {
    return (
      <div className="space-y-6 text-xs">
        {/* Preset Palettes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-sm text-[#332924] flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#C96A50]" />
                <span>Soft Light Color Palettes</span>
              </h4>
              <p className="text-[11px] text-[#6E625B]">
                Choose a curated palette or customize individual website colors below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateTheme({ ...THEME_PRESETS[0], presetId: "warm-cream" })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] font-bold text-[#5F534D] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Warm Cream</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = (theme.presetId || "warm-cream") === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    updateTheme({
                      presetId: preset.id,
                      backgroundColor: preset.backgroundColor,
                      surfaceColor: preset.surfaceColor,
                      sandColor: preset.sandColor,
                      peachColor: preset.peachColor,
                      accentColor: preset.accentColor,
                      accentHoverColor: preset.accentHoverColor,
                      headingColor: preset.headingColor,
                      bodyColor: preset.bodyColor,
                      borderColor: preset.borderColor,
                    })
                  }
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FAECE4]/40 border-[#C96A50] ring-2 ring-[#C96A50]/20"
                      : "bg-white border-[#E8DFD5] hover:border-[#D8A999]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.backgroundColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.peachColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.headingColor }}
                    />
                  </div>
                  <div className="font-bold text-[#332924]">{preset.name}</div>
                  <p className="text-[11px] text-[#6E625B] mt-0.5">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Grained Color Pickers */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-3">
          <div className="font-bold text-[#332924]">Custom Fine-Tuning Colors</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              [
                { key: "backgroundColor", label: "Page Background", fallback: "#FAF7F2" },
                { key: "surfaceColor", label: "Cards Background", fallback: "#FFFFFF" },
                { key: "peachColor", label: "Soft Highlight Tint", fallback: "#FAECE4" },
                { key: "accentColor", label: "Buttons & Accent", fallback: "#C96A50" },
                { key: "headingColor", label: "Headings Ink", fallback: "#332924" },
                { key: "bodyColor", label: "Paragraph Text", fallback: "#5F534D" },
              ] as const
            ).map((field) => {
              const val = (theme[field.key] as string) || field.fallback;
              return (
                <div
                  key={field.key}
                  className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#332924] truncate">{field.label}</div>
                    <div className="text-[10px] font-mono text-[#8A7C75] uppercase">{val}</div>
                  </div>
                  <input
                    type="color"
                    value={val}
                    onChange={(e) =>
                      updateTheme({
                        presetId: "custom",
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-9 h-8 rounded-lg border border-[#E8DFD5] cursor-pointer bg-white shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Typography Picker */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-3">
          <div className="font-bold text-[#332924] flex items-center gap-1.5">
            <Type className="w-4 h-4 text-[#C96A50]" />
            <span>Website Typography &amp; Fonts</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {FONT_PAIRING_OPTIONS.map((opt) => {
              const selected = (theme.headingFont || "plus-jakarta") === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    updateTheme({
                      headingFont: opt.id,
                      bodyFont: opt.id === "plus-jakarta" ? "dm-sans" : opt.id,
                    })
                  }
                  className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                    selected
                      ? "bg-[#FAECE4]/40 border-[#C96A50]"
                      : "bg-[#FAF7F2] border-[#E8DFD5] hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#332924]">{opt.label}</div>
                    <div className="text-[11px] text-[#6E625B]">{opt.description}</div>
                  </div>
                  {selected && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#C96A50] text-white">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // SEO Mode
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-2 font-display font-bold text-sm text-[#332924]">
        <Search className="w-4 h-4 text-[#C96A50]" />
        <span>Search Engine &amp; Social Share SEO</span>
      </div>

      <div>
        <label className="font-bold text-[#332924] block mb-1">Google Search Page Title</label>
        <input
          type="text"
          value={seo.title || ""}
          onChange={(e) =>
            onUpdateDraft((prev) => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                seo: { ...(prev.metadata?.seo || {}), title: e.target.value },
              },
            }))
          }
          placeholder="IMDAD.BUILDS | Digital Product Studio"
          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
        />
      </div>

      <div>
        <label className="font-bold text-[#332924] block mb-1">Meta Description</label>
        <textarea
          rows={3}
          value={seo.description || ""}
          onChange={(e) =>
            onUpdateDraft((prev) => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                seo: { ...(prev.metadata?.seo || {}), description: e.target.value },
              },
            }))
          }
          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
        />
      </div>

      <div>
        <label className="font-bold text-[#332924] block mb-1">Social Preview Image (OG Image)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seo.ogImage || ""}
            onChange={(e) =>
              onUpdateDraft((prev) => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  seo: { ...(prev.metadata?.seo || {}), ogImage: e.target.value },
                },
              }))
            }
            placeholder="/imdad-logo.png"
            className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] font-mono"
          />
          <button
            type="button"
            onClick={() =>
              onOpenMediaPicker((url) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    seo: { ...(prev.metadata?.seo || {}), ogImage: url },
                  },
                }))
              )
            }
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAECE4] border border-[#E8DFD5] font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C96A50]" />
            <span>Pick Image</span>
          </button>
        </div>
      </div>

      <div>
        <label className="font-bold text-[#332924] block mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={(seo.keywords || []).join(", ")}
          onChange={(e) =>
            onUpdateDraft((prev) => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                seo: {
                  ...(prev.metadata?.seo || {}),
                  keywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                },
              },
            }))
          }
          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
        />
      </div>
    </div>
  );
}
