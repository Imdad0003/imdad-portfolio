"use client";

import React from "react";
import type {
  CustomSectionConfig,
  CustomSectionLayout,
  SiteContentDocument,
} from "@/types/cms";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Copy,
  RotateCcw,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

export const BUILT_IN_SECTION_CATALOG: Array<{
  id: string;
  label: string;
  description: string;
  editTab: string;
}> = [
  { id: "hero", label: "Hero & Quick-Start Menu", description: "Main welcome headline, buttons & 4 quick-start tiles", editTab: "hero" },
  { id: "services", label: "Services Showcase", description: "Core studio services cards & starting prices", editTab: "services" },
  { id: "projects", label: "Featured Projects", description: "Selected case studies & live work showcase", editTab: "projects" },
  { id: "overview", label: "About / Why Businesses Pick Us", description: "Studio intro & 3 key pillars", editTab: "overview" },
  { id: "process", label: "4-Step Delivery Process", description: "Step-by-step workflow cards", editTab: "process" },
  { id: "why-us", label: "Why Choose IMDAD.BUILDS", description: "Studio advantages & client guarantees", editTab: "why-us" },
  { id: "team", label: "Meet the Team", description: "Team member profiles, roles & photos", editTab: "team" },
  { id: "final-cta", label: "Final Call-to-Action", description: "Bottom contact & booking banner", editTab: "cta" },
  { id: "packages", label: "Pricing Packages Grid", description: "Transparent package tiers directly on homepage", editTab: "services" },
  { id: "apps", label: "Studio Apps Showcase", description: "WishMusic, WishTracking & mobile apps", editTab: "apps" },
  { id: "reviews", label: "Client Testimonials", description: "Approved customer reviews strip", editTab: "cta" },
  { id: "about", label: "Studio Origin Story", description: "Extended founder narrative block", editTab: "about" },
  { id: "ai-assistant", label: "AI Project Assistant Banner", description: "Interactive chatbot prompt section", editTab: "cta" },
];

export const DEFAULT_HOMEPAGE_ORDER = [
  "hero",
  "services",
  "projects",
  "overview",
  "process",
  "why-us",
  "team",
  "final-cta",
];

const CUSTOM_TEMPLATES: Array<{
  label: string;
  layout: CustomSectionLayout;
  defaultHeadline: string;
  defaultItems: CustomSectionConfig["items"];
}> = [
  {
    label: "Highlight Banner",
    layout: "banner",
    defaultHeadline: "Special Offer or New Studio Launch",
    defaultItems: [],
  },
  {
    label: "3-Card Feature Grid",
    layout: "cards-3",
    defaultHeadline: "Featured Highlights",
    defaultItems: [
      { id: "item_1", title: "Feature One", description: "Explain how this helps clients.", badge: "Highlight" },
      { id: "item_2", title: "Feature Two", description: "Explain your second key benefit." },
      { id: "item_3", title: "Feature Three", description: "Add pricing or turnaround clarity." },
    ],
  },
  {
    label: "4-Card Service Strip",
    layout: "cards-4",
    defaultHeadline: "Compare What You Get",
    defaultItems: [
      { id: "item_1", title: "Fast Turnaround", description: "24–48 hour initial previews." },
      { id: "item_2", title: "Custom Craft", description: "Designed specifically for your brand." },
      { id: "item_3", title: "Clear Pricing", description: "No surprise retainers or fees." },
      { id: "item_4", title: "Direct Support", description: "WhatsApp and direct founder feedback." },
    ],
  },
  {
    label: "Image + Text Split",
    layout: "split-media",
    defaultHeadline: "Showcase a Product or Case Study",
    defaultItems: [
      { id: "item_1", title: "Benefit Point 1", description: "Clean explanation next to visual preview." },
      { id: "item_2", title: "Benefit Point 2", description: "Another clear reason to work together." },
    ],
  },
  {
    label: "FAQ Accordion",
    layout: "faq",
    defaultHeadline: "Frequently Asked Questions",
    defaultItems: [
      { id: "faq_1", title: "How fast do you deliver?", description: "Most creative packs ship in 48–72 hours after project kickoff." },
      { id: "faq_2", title: "Do you include revisions?", description: "Yes, every package includes dedicated revision rounds until you are happy." },
    ],
  },
  {
    label: "Checklist Strip",
    layout: "checklist",
    defaultHeadline: "What Is Included",
    defaultItems: [
      { id: "chk_1", title: "Source Files & Exports", description: "Ready for Amazon, web, or social platforms." },
      { id: "chk_2", title: "Mobile-First Testing", description: "Verified across iOS, Android, and desktop screens." },
    ],
  },
];

function createBlockId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface LayoutBuilderTabProps {
  draft: SiteContentDocument;
  onUpdateDraft: (updater: (prev: SiteContentDocument) => SiteContentDocument) => void;
  onJumpToEditor: (tabId: string) => void;
}

export function LayoutBuilderTab({
  draft,
  onUpdateDraft,
  onJumpToEditor,
}: LayoutBuilderTabProps) {
  const sectionOrder = draft.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER;
  const visibility = draft.metadata?.sectionVisibility || {};
  const customSections = draft.customSections || [];

  const moveSection = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sectionOrder.length) return;
    onUpdateDraft((prev) => {
      const order = [...(prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER)];
      [order[index], order[target]] = [order[target], order[index]];
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          sectionOrder: order,
        },
      };
    });
  };

  const toggleVisibility = (sectionId: string) => {
    onUpdateDraft((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        sectionVisibility: {
          ...(prev.metadata?.sectionVisibility || {}),
          [sectionId]: !(prev.metadata?.sectionVisibility?.[sectionId] ?? true),
        },
      },
    }));
  };

  const addCustomSection = (tpl: (typeof CUSTOM_TEMPLATES)[number]) => {
    const id = createBlockId("custom");
    const newBlock: CustomSectionConfig = {
      id,
      name: tpl.label,
      layout: tpl.layout,
      tone: "cream",
      eyebrow: "CUSTOM BLOCK",
      headline: tpl.defaultHeadline,
      subheadline: "Edit this text and layout directly inside the Custom Section editor.",
      ctaText: "Get Started",
      ctaLink: "/contact",
      items: (tpl.defaultItems || []).map((it, idx) => ({
        ...it,
        id: createBlockId(`${id}_item_${idx}`),
      })),
    };

    onUpdateDraft((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newBlock],
      metadata: {
        ...prev.metadata,
        sectionOrder: [
          ...(prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER).slice(0, -1),
          id,
          ...((prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER).slice(-1)),
        ],
        sectionVisibility: {
          ...(prev.metadata?.sectionVisibility || {}),
          [id]: true,
        },
      },
    }));
    onJumpToEditor(id);
  };

  const duplicateCustomSection = (sec: CustomSectionConfig) => {
    const id = `custom_${Date.now()}`;
    const copy: CustomSectionConfig = {
      ...sec,
      id,
      name: `${sec.name} (Copy)`,
      items: (sec.items || []).map((item, idx) => ({ ...item, id: `${id}_item_${idx}` })),
    };
    onUpdateDraft((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), copy],
      metadata: {
        ...prev.metadata,
        sectionOrder: [...(prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER), id],
        sectionVisibility: {
          ...(prev.metadata?.sectionVisibility || {}),
          [id]: true,
        },
      },
    }));
  };

  const deleteCustomSection = (sectionId: string) => {
    if (!confirm("Delete this custom section from the page layout?")) return;
    onUpdateDraft((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((c) => c.id !== sectionId),
      metadata: {
        ...prev.metadata,
        sectionOrder: (prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER).filter(
          (id) => id !== sectionId
        ),
      },
    }));
  };

  const addMissingBuiltInSection = (sectionId: string) => {
    onUpdateDraft((prev) => {
      const existingOrder = prev.metadata?.sectionOrder || DEFAULT_HOMEPAGE_ORDER;
      const nextOrder = existingOrder.includes(sectionId)
        ? existingOrder
        : [...existingOrder, sectionId];
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          sectionOrder: nextOrder,
          sectionVisibility: {
            ...(prev.metadata?.sectionVisibility || {}),
            [sectionId]: true,
          },
        },
      };
    });
  };

  const resetDefaultLayout = () => {
    if (
      !confirm(
        "Reset section order to the clean default homepage flow? (Your custom section items will remain untouched until deleted.)"
      )
    ) {
      return;
    }
    onUpdateDraft((prev) => {
      const customIds = (prev.customSections || []).map((c) => c.id);
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          sectionOrder: [...DEFAULT_HOMEPAGE_ORDER, ...customIds],
          sectionVisibility: {
            ...(prev.metadata?.sectionVisibility || {}),
            hero: true,
            services: true,
            projects: true,
            overview: true,
            process: true,
            "why-us": true,
            team: true,
            "final-cta": true,
          },
        },
      };
    });
  };

  const missingBuiltIns = BUILT_IN_SECTION_CATALOG.filter(
    (item) => !sectionOrder.includes(item.id)
  );

  return (
    <div className="space-y-6 text-xs">
      {/* Add Custom Section Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="font-display font-bold text-sm text-[#332924] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C96A50]" />
              <span>Add a New Section to Homepage</span>
            </h4>
            <p className="text-[11px] text-[#6E625B] mt-0.5">
              Click any layout block below to insert it into your page and customize it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CUSTOM_TEMPLATES.map((tpl) => (
            <button
              key={tpl.layout}
              type="button"
              onClick={() => addCustomSection(tpl)}
              className="p-2.5 rounded-xl bg-white hover:bg-[#FAECE4]/60 border border-[#E8DFD5] hover:border-[#C96A50] text-left transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-[#C96A50] shrink-0" />
              <span className="font-bold text-[#332924] truncate">{tpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Page Order List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-sm text-[#332924] flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-[#C96A50]" />
              <span>Page Section Order ({sectionOrder.length})</span>
            </h4>
            <p className="text-[11px] text-[#6E625B]">
              Move sections up/down, hide them temporarily, or jump straight to editing.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDefaultLayout}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[11px] font-bold text-[#5F534D] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Order</span>
          </button>
        </div>

        <div className="space-y-2">
          {sectionOrder.map((secId, idx) => {
            const builtIn = BUILT_IN_SECTION_CATALOG.find((b) => b.id === secId);
            const custom = customSections.find((c) => c.id === secId);
            const isVisible = visibility[secId] ?? true;

            const title = custom
              ? custom.name || custom.headline
              : builtIn?.label || secId;
            const desc = custom
              ? `Custom Section (${custom.layout}) — ${custom.headline}`
              : builtIn?.description || "Page section";
            const editTarget = custom ? custom.id : builtIn?.editTab || "hero";

            return (
              <div
                key={secId}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isVisible
                    ? "bg-white border-[#E8DFD5] shadow-2xs"
                    : "bg-[#FAF7F2]/60 border-[#E8DFD5]/60 opacity-65"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-[#FAECE4] text-[#B4583F] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#332924] truncate">{title}</span>
                      {custom && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold">
                          Custom
                        </span>
                      )}
                      {!isVisible && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E625B] truncate">{desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, "up")}
                    title="Move Up"
                    className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#E8DFD5] text-[#332924] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sectionOrder.length - 1}
                    onClick={() => moveSection(idx, "down")}
                    title="Move Down"
                    className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#E8DFD5] text-[#332924] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(secId)}
                    title={isVisible ? "Hide section" : "Show section"}
                    className={`px-2.5 py-1.5 rounded-lg border font-bold inline-flex items-center gap-1 cursor-pointer ${
                      isVisible
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isVisible ? "Visible" : "Hidden"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToEditor(editTarget)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] text-[#332924] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C96A50]" />
                    <span>Edit</span>
                  </button>

                  {custom && (
                    <>
                      <button
                        type="button"
                        onClick={() => duplicateCustomSection(custom)}
                        title="Duplicate Custom Section"
                        className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#E8DFD5] text-[#5F534D] cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomSection(custom.id)}
                        title="Delete Custom Section"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Optional / Removed Built-In Sections */}
      {missingBuiltIns.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="font-bold text-[#332924]">Optional Built-In Sections</div>
          <p className="text-[11px] text-[#6E625B]">
            Enable extra sections on the homepage anytime:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingBuiltIns.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addMissingBuiltInSection(item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] text-[11px] font-bold text-[#332924] cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#C96A50]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
