"use client";

import React from "react";
import type {
  AppDocument,
  CustomSectionLayout,
  CustomSectionTone,
  ProjectDocument,
  ServiceDocument,
  SiteContentDocument,
} from "@/types/cms";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from "lucide-react";

interface SectionEditorsTabProps {
  activeSectionId: string;
  draft: SiteContentDocument;
  apps: AppDocument[];
  projects: ProjectDocument[];
  services: ServiceDocument[];
  onUpdateDraft: (updater: (prev: SiteContentDocument) => SiteContentDocument) => void;
  onOpenMediaPicker: (onPicked: (url: string) => void) => void;
}

function moveItem<T>(arr: T[], idx: number, dir: "up" | "down"): T[] {
  const target = dir === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  [copy[idx], copy[target]] = [copy[target], copy[idx]];
  return copy;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  mono,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="font-bold text-[#332924] block mb-1">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] text-[#332924] focus:outline-none focus:border-[#C96A50] ${
            mono ? "font-mono" : ""
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] text-[#332924] focus:outline-none focus:border-[#C96A50] ${
            mono ? "font-mono" : ""
          }`}
        />
      )}
    </div>
  );
}

export function SectionEditorsTab({
  activeSectionId,
  draft,
  apps,
  projects,
  services,
  onUpdateDraft,
  onOpenMediaPicker,
}: SectionEditorsTabProps) {
  // Custom section editor (when user clicks Edit on custom_*)
  if (activeSectionId.startsWith("custom_")) {
    const customList = draft.customSections || [];
    const customIndex = customList.findIndex((c) => c.id === activeSectionId);
    const custom = customList[customIndex];

    if (!custom) {
      return (
        <div className="p-6 rounded-2xl bg-white border border-[#E8DFD5] text-xs text-[#6E625B]">
          This custom section was removed or does not exist. Choose another section from Layout Builder.
        </div>
      );
    }

    const updateCustom = (patch: Partial<typeof custom>) => {
      onUpdateDraft((prev) => ({
        ...prev,
        customSections: (prev.customSections || []).map((c) =>
          c.id === custom.id ? { ...c, ...patch } : c
        ),
      }));
    };

    const items = custom.items || [];

    return (
      <div className="space-y-5 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="font-display font-bold text-sm text-[#332924]">
            Custom Block Configuration
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              label="Section Name (Admin)"
              value={custom.name}
              onChange={(v) => updateCustom({ name: v })}
              placeholder="e.g. Offer Banner"
            />
            <div>
              <label className="font-bold text-[#332924] block mb-1">Layout Template</label>
              <select
                value={custom.layout}
                onChange={(e) => updateCustom({ layout: e.target.value as CustomSectionLayout })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
              >
                <option value="banner">Highlight Banner</option>
                <option value="cards-2">2-Column Cards</option>
                <option value="cards-3">3-Column Cards</option>
                <option value="cards-4">4-Column Cards</option>
                <option value="split-media">Image + Text Split</option>
                <option value="faq">FAQ Accordion</option>
                <option value="checklist">Checklist Strip</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#332924] block mb-1">Background Tone</label>
              <select
                value={custom.tone || "cream"}
                onChange={(e) => updateCustom({ tone: e.target.value as CustomSectionTone })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
              >
                <option value="cream">Soft Cream</option>
                <option value="white">Pure Ivory White</option>
                <option value="peach">Soft Peach Highlight</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Eyebrow Label"
              value={custom.eyebrow || ""}
              onChange={(v) => updateCustom({ eyebrow: v })}
              placeholder="OPTIONAL LABEL"
            />
            <Field
              label="Headline"
              value={custom.headline}
              onChange={(v) => updateCustom({ headline: v })}
              placeholder="Section title..."
            />
          </div>

          <Field
            label="Subheadline"
            value={custom.subheadline || ""}
            onChange={(v) => updateCustom({ subheadline: v })}
            placeholder="Supporting sentence..."
          />

          {(custom.layout === "banner" || custom.layout === "split-media") && (
            <>
              <Field
                label="Body Copy"
                value={custom.bodyText || ""}
                onChange={(v) => updateCustom({ bodyText: v })}
                multiline
              />
              <div>
                <label className="font-bold text-[#332924] block mb-1">Feature Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={custom.mediaUrl || ""}
                    onChange={(e) => updateCustom({ mediaUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMediaPicker((url) => updateCustom({ mediaUrl: url }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAECE4] border border-[#E8DFD5] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#C96A50]" />
                    <span>Pick Image</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Primary Button Label"
              value={custom.ctaText || ""}
              onChange={(v) => updateCustom({ ctaText: v })}
              placeholder="Get Started"
            />
            <Field
              label="Primary Button Link"
              value={custom.ctaLink || ""}
              onChange={(v) => updateCustom({ ctaLink: v })}
              placeholder="/contact"
              mono
            />
          </div>
        </div>

        {/* Custom Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#332924]">
              Section Cards / Items ({items.length})
            </div>
            <button
              type="button"
              onClick={() =>
                updateCustom({
                  items: [
                    ...items,
                    {
                      id: `item_${Date.now()}`,
                      title: "New Item Title",
                      description: "Describe this feature, question, or card.",
                      buttonText: "",
                      buttonLink: "/contact",
                    },
                  ],
                })
              }
              className="px-3 py-1.5 rounded-full bg-[#C96A50] text-white font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#332924]">Item #{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateCustom({ items: moveItem(items, idx, "up") })}
                    disabled={idx === 0}
                    className="p-1 rounded border border-[#E8DFD5] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCustom({ items: moveItem(items, idx, "down") })}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded border border-[#E8DFD5] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateCustom({ items: items.filter((i) => i.id !== item.id) })
                    }
                    className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Field
                  label="Title / Question"
                  value={item.title}
                  onChange={(v) =>
                    updateCustom({
                      items: items.map((x) => (x.id === item.id ? { ...x, title: v } : x)),
                    })
                  }
                />
                <Field
                  label="Badge (optional)"
                  value={item.badge || ""}
                  onChange={(v) =>
                    updateCustom({
                      items: items.map((x) => (x.id === item.id ? { ...x, badge: v } : x)),
                    })
                  }
                />
                <Field
                  label="Price / Metric (optional)"
                  value={item.price || ""}
                  onChange={(v) =>
                    updateCustom({
                      items: items.map((x) => (x.id === item.id ? { ...x, price: v } : x)),
                    })
                  }
                />
              </div>

              <Field
                label="Description / Answer"
                value={item.description || ""}
                onChange={(v) =>
                  updateCustom({
                    items: items.map((x) => (x.id === item.id ? { ...x, description: v } : x)),
                  })
                }
                multiline
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Field
                  label="Button Label (optional)"
                  value={item.buttonText || ""}
                  onChange={(v) =>
                    updateCustom({
                      items: items.map((x) => (x.id === item.id ? { ...x, buttonText: v } : x)),
                    })
                  }
                />
                <Field
                  label="Button Link"
                  value={item.buttonLink || ""}
                  onChange={(v) =>
                    updateCustom({
                      items: items.map((x) => (x.id === item.id ? { ...x, buttonLink: v } : x)),
                    })
                  }
                  mono
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSectionId === "hero") {
    const quickItems = draft.hero.quickStartItems || [];
    const highlights = draft.hero.trustHighlights || [];

    return (
      <div className="space-y-6 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="font-display font-bold text-sm text-[#332924]">Main Hero Banner</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Top Badge Pill"
              value={draft.hero.badge}
              onChange={(v) =>
                onUpdateDraft((prev) => ({ ...prev, hero: { ...prev.hero, badge: v } }))
              }
            />
            <Field
              label="Top Announcement Note"
              value={draft.hero.announcement}
              onChange={(v) =>
                onUpdateDraft((prev) => ({ ...prev, hero: { ...prev.hero, announcement: v } }))
              }
            />
          </div>
          <Field
            label="Main Headline"
            value={draft.hero.headline}
            onChange={(v) =>
              onUpdateDraft((prev) => ({ ...prev, hero: { ...prev.hero, headline: v } }))
            }
          />
          <Field
            label="Supporting Subheadline"
            value={draft.hero.subheadline}
            onChange={(v) =>
              onUpdateDraft((prev) => ({ ...prev, hero: { ...prev.hero, subheadline: v } }))
            }
            multiline
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Primary Button Text"
              value={draft.hero.primaryCtaText}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, primaryCtaText: v },
                }))
              }
            />
            <Field
              label="Primary Button Link"
              value={draft.hero.primaryCtaLink}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, primaryCtaLink: v },
                }))
              }
              mono
            />
            <Field
              label="Secondary Button Text"
              value={draft.hero.secondaryCtaText}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, secondaryCtaText: v },
                }))
              }
            />
            <Field
              label="Secondary Button Link"
              value={draft.hero.secondaryCtaLink}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, secondaryCtaLink: v },
                }))
              }
              mono
            />
          </div>
        </div>

        {/* Hero Right-Hand Quick Start Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#332924]">Hero Quick-Start Action Tiles</div>
            <button
              type="button"
              onClick={() =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    quickStartItems: [
                      ...(prev.hero.quickStartItems || []),
                      {
                        id: `qs_${Date.now()}`,
                        title: "New Quick Link",
                        subtitle: "Short tagline",
                        href: "/services",
                        badge: "New",
                        iconName: "Sparkles",
                      },
                    ],
                  },
                }))
              }
              className="px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Tile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Card Header"
              value={draft.hero.quickStartTitle || "Quick Start"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({ ...prev, hero: { ...prev.hero, quickStartTitle: v } }))
              }
            />
            <Field
              label="Card Subtitle"
              value={draft.hero.quickStartSubtitle || "Pick what you need to begin"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, quickStartSubtitle: v },
                }))
              }
            />
          </div>

          <div className="space-y-2.5">
            {quickItems.map((q, idx) => (
              <div key={q.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#332924]">Tile #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        onUpdateDraft((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            quickStartItems: moveItem(quickItems, idx, "up"),
                          },
                        }))
                      }
                      className="p-1 border border-[#E8DFD5] rounded bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateDraft((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            quickStartItems: quickItems.filter((x) => x.id !== q.id),
                          },
                        }))
                      }
                      className="p-1 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Field
                    label="Title"
                    value={q.title}
                    onChange={(v) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          quickStartItems: quickItems.map((x) =>
                            x.id === q.id ? { ...x, title: v } : x
                          ),
                        },
                      }))
                    }
                  />
                  <Field
                    label="Subtitle"
                    value={q.subtitle}
                    onChange={(v) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          quickStartItems: quickItems.map((x) =>
                            x.id === q.id ? { ...x, subtitle: v } : x
                          ),
                        },
                      }))
                    }
                  />
                  <Field
                    label="Link URL"
                    value={q.href}
                    onChange={(v) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          quickStartItems: quickItems.map((x) =>
                            x.id === q.id ? { ...x, href: v } : x
                          ),
                        },
                      }))
                    }
                    mono
                  />
                  <Field
                    label="Badge"
                    value={q.badge || ""}
                    onChange={(v) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          quickStartItems: quickItems.map((x) =>
                            x.id === q.id ? { ...x, badge: v } : x
                          ),
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Trust Highlights */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#332924]">Trust Bar Items (Under Buttons)</div>
            <button
              type="button"
              onClick={() =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    trustHighlights: [
                      ...highlights,
                      { id: `th_${Date.now()}`, label: "New Highlight", value: "Detail text" },
                    ],
                  },
                }))
              }
              className="px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
            >
              + Add Point
            </button>
          </div>
          {highlights.map((h) => (
            <div key={h.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <Field
                  label="Label"
                  value={h.label}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        trustHighlights: highlights.map((x) =>
                          x.id === h.id ? { ...x, label: v } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-6">
                <Field
                  label="Value"
                  value={h.value || ""}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        trustHighlights: highlights.map((x) =>
                          x.id === h.id ? { ...x, value: v } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        trustHighlights: highlights.filter((x) => x.id !== h.id),
                      },
                    }))
                  }
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSectionId === "navigation") {
    const navLinks = draft.navigation?.navLinks || [];
    const servicesDropdown = draft.navigation?.servicesDropdown || [];

    return (
      <div className="space-y-5 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="font-display font-bold text-sm text-[#332924]">Top Header Brand &amp; CTA</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Brand Display Name"
              value={draft.navigation?.brandName || "IMDAD.BUILDS"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  navigation: { ...(prev.navigation || {}), brandName: v },
                }))
              }
            />
            <Field
              label="Right Button Text"
              value={draft.navigation?.ctaText || "Start a Project"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  navigation: { ...(prev.navigation || {}), ctaText: v },
                }))
              }
            />
            <Field
              label="Right Button Link"
              value={draft.navigation?.ctaLink || "/contact"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  navigation: { ...(prev.navigation || {}), ctaLink: v },
                }))
              }
              mono
            />
            <div>
              <label className="font-bold text-[#332924] block mb-1">Navbar Logo Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft.navigation?.logo || "/imdad-logo.png"}
                  onChange={(e) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: { ...(prev.navigation || {}), logo: e.target.value },
                    }))
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        navigation: { ...(prev.navigation || {}), logo: url },
                      }))
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] font-bold cursor-pointer"
                >
                  Pick
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Links */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#332924]">Top Menu Links</span>
            <button
              type="button"
              onClick={() =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  navigation: {
                    ...(prev.navigation || {}),
                    navLinks: [...navLinks, { label: "New Link", href: "/" }],
                  },
                }))
              }
              className="px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
            >
              + Add Menu Item
            </button>
          </div>
          {navLinks.map((lnk, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <Field
                  label="Label"
                  value={lnk.label}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        navLinks: navLinks.map((x, i) => (i === idx ? { ...x, label: v } : x)),
                      },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-6">
                <Field
                  label="URL"
                  value={lnk.href}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        navLinks: navLinks.map((x, i) => (i === idx ? { ...x, href: v } : x)),
                      },
                    }))
                  }
                  mono
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        navLinks: navLinks.filter((_, i) => i !== idx),
                      },
                    }))
                  }
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Services Dropdown */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#332924]">Services Dropdown Sub-Items</span>
            <button
              type="button"
              onClick={() =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  navigation: {
                    ...(prev.navigation || {}),
                    servicesDropdown: [
                      ...servicesDropdown,
                      { label: "New Service", href: "/services", description: "Short summary", enabled: true },
                    ],
                  },
                }))
              }
              className="px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
            >
              + Add Sub-Item
            </button>
          </div>
          {servicesDropdown.map((sub, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4">
                <Field
                  label="Title"
                  value={sub.label}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        servicesDropdown: servicesDropdown.map((x, i) =>
                          i === idx ? { ...x, label: v } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-4">
                <Field
                  label="Description"
                  value={sub.description || ""}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        servicesDropdown: servicesDropdown.map((x, i) =>
                          i === idx ? { ...x, description: v } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-3">
                <Field
                  label="Link"
                  value={sub.href}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        servicesDropdown: servicesDropdown.map((x, i) =>
                          i === idx ? { ...x, href: v } : x
                        ),
                      },
                    }))
                  }
                  mono
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      navigation: {
                        ...(prev.navigation || {}),
                        servicesDropdown: servicesDropdown.filter((_, i) => i !== idx),
                      },
                    }))
                  }
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSectionId === "overview") {
    const pillars = draft.overviewSection?.pillars || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <Field
            label="Eyebrow"
            value={draft.overviewSection?.eyebrow || "ABOUT US"}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                overviewSection: { ...(prev.overviewSection || {}), eyebrow: v },
              }))
            }
          />
          <Field
            label="Headline"
            value={draft.overviewSection?.headline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                overviewSection: { ...(prev.overviewSection || {}), headline: v },
              }))
            }
          />
          <Field
            label="Subheadline"
            value={draft.overviewSection?.subheadline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                overviewSection: { ...(prev.overviewSection || {}), subheadline: v },
              }))
            }
            multiline
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#332924]">Overview Pillars ({pillars.length})</span>
          <button
            type="button"
            onClick={() =>
              onUpdateDraft((prev) => ({
                ...prev,
                overviewSection: {
                  ...(prev.overviewSection || {}),
                  pillars: [
                    ...pillars,
                    {
                      id: `ov_${Date.now()}`,
                      number: String(pillars.length + 1).padStart(2, "0"),
                      title: "New Pillar",
                      description: "Explain why this matters for clients.",
                      iconName: "Compass",
                    },
                  ],
                },
              }))
            }
            className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
          >
            + Add Pillar
          </button>
        </div>
        {pillars.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#332924]">{p.title}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    overviewSection: {
                      ...(prev.overviewSection || {}),
                      pillars: pillars.filter((x) => x.id !== p.id),
                    },
                  }))
                }
                className="text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Field
              label="Title"
              value={p.title}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  overviewSection: {
                    ...(prev.overviewSection || {}),
                    pillars: pillars.map((x) => (x.id === p.id ? { ...x, title: v } : x)),
                  },
                }))
              }
            />
            <Field
              label="Description"
              value={p.description}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  overviewSection: {
                    ...(prev.overviewSection || {}),
                    pillars: pillars.map((x) => (x.id === p.id ? { ...x, description: v } : x)),
                  },
                }))
              }
              multiline
            />
          </div>
        ))}
      </div>
    );
  }

  if (activeSectionId === "services") {
    const selectedIds = draft.servicesSection?.displayedServiceIds || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Eyebrow"
              value={draft.servicesSection?.eyebrow || "OUR SERVICES"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  servicesSection: { ...(prev.servicesSection || {}), eyebrow: v },
                }))
              }
            />
            <div>
              <label className="font-bold text-[#332924] block mb-1">Cards Per Row</label>
              <select
                value={draft.servicesSection?.columns || 3}
                onChange={(e) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    servicesSection: {
                      ...(prev.servicesSection || {}),
                      columns: Number(e.target.value) as 2 | 3 | 4,
                    },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>
          <Field
            label="Headline"
            value={draft.servicesSection?.title || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                servicesSection: { ...(prev.servicesSection || {}), title: v },
              }))
            }
          />
          <Field
            label="Subtitle"
            value={draft.servicesSection?.subtitle || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                servicesSection: { ...(prev.servicesSection || {}), subtitle: v },
              }))
            }
            multiline
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Button Text"
              value={draft.servicesSection?.ctaText || "See All Services"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  servicesSection: { ...(prev.servicesSection || {}), ctaText: v },
                }))
              }
            />
            <Field
              label="Button Link"
              value={draft.servicesSection?.ctaLink || "/services"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  servicesSection: { ...(prev.servicesSection || {}), ctaLink: v },
                }))
              }
              mono
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="font-bold text-[#332924]">
            Choose Services Shown on Homepage (leave all unchecked to auto-show all featured)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((svc) => {
              const checked = selectedIds.includes(svc.id);
              return (
                <label
                  key={svc.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedIds, svc.id]
                        : selectedIds.filter((id) => id !== svc.id);
                      onUpdateDraft((prev) => ({
                        ...prev,
                        servicesSection: {
                          ...(prev.servicesSection || {}),
                          displayedServiceIds: next,
                        },
                      }));
                    }}
                  />
                  <span className="font-semibold text-[#332924]">{svc.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeSectionId === "projects") {
    const selectedIds = draft.projectsSection?.displayedProjectIds || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Eyebrow"
              value={draft.projectsSection?.eyebrow || "OUR WORK"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  projectsSection: { ...(prev.projectsSection || {}), eyebrow: v },
                }))
              }
            />
            <div>
              <label className="font-bold text-[#332924] block mb-1">Cards Per Row</label>
              <select
                value={draft.projectsSection?.columns || 3}
                onChange={(e) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    projectsSection: {
                      ...(prev.projectsSection || {}),
                      columns: Number(e.target.value) as 2 | 3,
                    },
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8DFD5]"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
              </select>
            </div>
          </div>
          <Field
            label="Headline"
            value={draft.projectsSection?.title || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                projectsSection: { ...(prev.projectsSection || {}), title: v },
              }))
            }
          />
          <Field
            label="Subtitle"
            value={draft.projectsSection?.subtitle || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                projectsSection: { ...(prev.projectsSection || {}), subtitle: v },
              }))
            }
            multiline
          />
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
          <div className="font-bold text-[#332924]">
            Pin Specific Projects on Homepage (leave empty for top Featured projects)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((proj) => {
              const checked = selectedIds.includes(proj.id);
              return (
                <label
                  key={proj.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedIds, proj.id]
                        : selectedIds.filter((id) => id !== proj.id);
                      onUpdateDraft((prev) => ({
                        ...prev,
                        projectsSection: {
                          ...(prev.projectsSection || {}),
                          displayedProjectIds: next,
                        },
                      }));
                    }}
                  />
                  <span className="font-semibold text-[#332924] truncate">{proj.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeSectionId === "process") {
    const steps = draft.processSection?.steps || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <Field
            label="Eyebrow"
            value={draft.processSection?.eyebrow || "HOW WE WORK"}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                processSection: { ...(prev.processSection || {}), eyebrow: v },
              }))
            }
          />
          <Field
            label="Headline"
            value={draft.processSection?.headline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                processSection: { ...(prev.processSection || {}), headline: v },
              }))
            }
          />
          <Field
            label="Subheadline"
            value={draft.processSection?.subheadline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                processSection: { ...(prev.processSection || {}), subheadline: v },
              }))
            }
            multiline
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#332924]">Steps ({steps.length})</span>
          <button
            type="button"
            onClick={() =>
              onUpdateDraft((prev) => ({
                ...prev,
                processSection: {
                  ...(prev.processSection || {}),
                  steps: [
                    ...steps,
                    {
                      id: `proc_${Date.now()}`,
                      step: String(steps.length + 1).padStart(2, "0"),
                      title: "New Step",
                      description: "Step details",
                    },
                  ],
                },
              }))
            }
            className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
          >
            + Add Step
          </button>
        </div>

        {steps.map((st, idx) => (
          <div key={st.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#332924]">Step {st.step}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      processSection: {
                        ...(prev.processSection || {}),
                        steps: moveItem(steps, idx, "up"),
                      },
                    }))
                  }
                  className="p-1 border border-[#E8DFD5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      processSection: {
                        ...(prev.processSection || {}),
                        steps: steps.filter((x) => x.id !== st.id),
                      },
                    }))
                  }
                  className="p-1 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field
                label="Number"
                value={st.step}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    processSection: {
                      ...(prev.processSection || {}),
                      steps: steps.map((x) => (x.id === st.id ? { ...x, step: v } : x)),
                    },
                  }))
                }
              />
              <div className="sm:col-span-2">
                <Field
                  label="Step Title"
                  value={st.title}
                  onChange={(v) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      processSection: {
                        ...(prev.processSection || {}),
                        steps: steps.map((x) => (x.id === st.id ? { ...x, title: v } : x)),
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Field
              label="Description"
              value={st.description}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  processSection: {
                    ...(prev.processSection || {}),
                    steps: steps.map((x) => (x.id === st.id ? { ...x, description: v } : x)),
                  },
                }))
              }
              multiline
            />
          </div>
        ))}
      </div>
    );
  }

  if (activeSectionId === "why-us") {
    const items = draft.whyUsSection?.items || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <Field
            label="Eyebrow"
            value={draft.whyUsSection?.eyebrow || "WHY CHOOSE US"}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                whyUsSection: { ...(prev.whyUsSection || {}), eyebrow: v },
              }))
            }
          />
          <Field
            label="Headline"
            value={draft.whyUsSection?.headline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                whyUsSection: { ...(prev.whyUsSection || {}), headline: v },
              }))
            }
          />
          <Field
            label="Subheadline"
            value={draft.whyUsSection?.subheadline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                whyUsSection: { ...(prev.whyUsSection || {}), subheadline: v },
              }))
            }
            multiline
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#332924]">Advantage Cards ({items.length})</span>
          <button
            type="button"
            onClick={() =>
              onUpdateDraft((prev) => ({
                ...prev,
                whyUsSection: {
                  ...(prev.whyUsSection || {}),
                  items: [
                    ...items,
                    { id: `why_${Date.now()}`, title: "New Advantage", description: "", metric: "Guaranteed" },
                  ],
                },
              }))
            }
            className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
          >
            + Add Card
          </button>
        </div>

        {items.map((w) => (
          <div key={w.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#332924]">{w.title}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    whyUsSection: {
                      ...(prev.whyUsSection || {}),
                      items: items.filter((x) => x.id !== w.id),
                    },
                  }))
                }
                className="text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field
                label="Title"
                value={w.title}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    whyUsSection: {
                      ...(prev.whyUsSection || {}),
                      items: items.map((x) => (x.id === w.id ? { ...x, title: v } : x)),
                    },
                  }))
                }
              />
              <Field
                label="Tag / Badge"
                value={w.metric || ""}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    whyUsSection: {
                      ...(prev.whyUsSection || {}),
                      items: items.map((x) => (x.id === w.id ? { ...x, metric: v } : x)),
                    },
                  }))
                }
              />
            </div>
            <Field
              label="Description"
              value={w.description}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  whyUsSection: {
                    ...(prev.whyUsSection || {}),
                    items: items.map((x) => (x.id === w.id ? { ...x, description: v } : x)),
                  },
                }))
              }
              multiline
            />
          </div>
        ))}
      </div>
    );
  }

  if (activeSectionId === "team") {
    const members = draft.teamSection?.members || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <Field
            label="Eyebrow"
            value={draft.teamSection?.eyebrow || "STUDIO TEAM"}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                teamSection: { ...(prev.teamSection || {}), eyebrow: v },
              }))
            }
          />
          <Field
            label="Headline"
            value={draft.teamSection?.headline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                teamSection: { ...(prev.teamSection || {}), headline: v },
              }))
            }
          />
          <Field
            label="Subheadline"
            value={draft.teamSection?.subheadline || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                teamSection: { ...(prev.teamSection || {}), subheadline: v },
              }))
            }
            multiline
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#332924]">Team Members ({members.length})</span>
          <button
            type="button"
            onClick={() =>
              onUpdateDraft((prev) => ({
                ...prev,
                teamSection: {
                  ...(prev.teamSection || {}),
                  members: [
                    ...members,
                    {
                      id: `member_${Date.now()}`,
                      name: "New Team Member",
                      role: "Designer",
                      title: "Creative Specialist",
                      badge: "Studio Team",
                      bio: "",
                      initials: "TM",
                      specialties: [],
                      enabled: true,
                    },
                  ],
                },
              }))
            }
            className="px-3 py-1.5 rounded-full bg-[#C96A50] text-white font-bold cursor-pointer"
          >
            + Add Member
          </button>
        </div>

        {members.map((m, idx) => (
          <div key={m.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.enabled ?? true}
                  onChange={(e) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      teamSection: {
                        ...(prev.teamSection || {}),
                        members: members.map((x) =>
                          x.id === m.id ? { ...x, enabled: e.target.checked } : x
                        ),
                      },
                    }))
                  }
                />
                <span>{m.name}</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      teamSection: {
                        ...(prev.teamSection || {}),
                        members: moveItem(members, idx, "up"),
                      },
                    }))
                  }
                  className="p-1 border border-[#E8DFD5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      teamSection: {
                        ...(prev.teamSection || {}),
                        members: members.filter((x) => x.id !== m.id),
                      },
                    }))
                  }
                  className="p-1 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field
                label="Name"
                value={m.name}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    teamSection: {
                      ...(prev.teamSection || {}),
                      members: members.map((x) => (x.id === m.id ? { ...x, name: v } : x)),
                    },
                  }))
                }
              />
              <Field
                label="Role"
                value={m.role}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    teamSection: {
                      ...(prev.teamSection || {}),
                      members: members.map((x) => (x.id === m.id ? { ...x, role: v } : x)),
                    },
                  }))
                }
              />
              <Field
                label="Badge"
                value={m.badge || ""}
                onChange={(v) =>
                  onUpdateDraft((prev) => ({
                    ...prev,
                    teamSection: {
                      ...(prev.teamSection || {}),
                      members: members.map((x) => (x.id === m.id ? { ...x, badge: v } : x)),
                    },
                  }))
                }
              />
            </div>

            <div>
              <label className="font-bold text-[#332924] block mb-1">Photo / Avatar URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={m.avatarUrl || ""}
                  onChange={(e) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      teamSection: {
                        ...(prev.teamSection || {}),
                        members: members.map((x) =>
                          x.id === m.id ? { ...x, avatarUrl: e.target.value } : x
                        ),
                      },
                    }))
                  }
                  placeholder="/imdad-logo.png or https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((url) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        teamSection: {
                          ...(prev.teamSection || {}),
                          members: members.map((x) =>
                            x.id === m.id ? { ...x, avatarUrl: url } : x
                          ),
                        },
                      }))
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] font-bold cursor-pointer"
                >
                  Pick Photo
                </button>
              </div>
            </div>

            <Field
              label="Short Bio"
              value={m.bio}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  teamSection: {
                    ...(prev.teamSection || {}),
                    members: members.map((x) => (x.id === m.id ? { ...x, bio: v } : x)),
                  },
                }))
              }
              multiline
            />

            <Field
              label="Skills (comma-separated)"
              value={(m.specialties || []).join(", ")}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  teamSection: {
                    ...(prev.teamSection || {}),
                    members: members.map((x) =>
                      x.id === m.id
                        ? {
                            ...x,
                            specialties: v
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : x
                    ),
                  },
                }))
              }
            />
          </div>
        ))}
      </div>
    );
  }

  if (activeSectionId === "cta") {
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="font-display font-bold text-sm text-[#332924]">
            Final Bottom Call-to-Action &amp; Contact Links
          </div>
          <Field
            label="Eyebrow"
            value={draft.finalCta.eyebrow}
            onChange={(v) =>
              onUpdateDraft((prev) => ({ ...prev, finalCta: { ...prev.finalCta, eyebrow: v } }))
            }
          />
          <Field
            label="Headline"
            value={draft.finalCta.headline}
            onChange={(v) =>
              onUpdateDraft((prev) => ({ ...prev, finalCta: { ...prev.finalCta, headline: v } }))
            }
          />
          <Field
            label="Description"
            value={draft.finalCta.description}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                finalCta: { ...prev.finalCta, description: v },
              }))
            }
            multiline
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Primary Button Text"
              value={draft.finalCta.primaryCtaText}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  finalCta: { ...prev.finalCta, primaryCtaText: v },
                }))
              }
            />
            <Field
              label="Primary Button Link"
              value={draft.finalCta.primaryCtaLink || "/contact"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  finalCta: { ...prev.finalCta, primaryCtaLink: v },
                }))
              }
              mono
            />
            <Field
              label="Secondary Button Text"
              value={draft.finalCta.secondaryCtaText}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  finalCta: { ...prev.finalCta, secondaryCtaText: v },
                }))
              }
            />
            <Field
              label="Secondary Button Link"
              value={draft.finalCta.secondaryCtaLink || "/services"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  finalCta: { ...prev.finalCta, secondaryCtaLink: v },
                }))
              }
              mono
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSectionId === "footer") {
    const columns = draft.footer.columns || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <div className="font-display font-bold text-sm text-[#332924]">Footer Identity &amp; Info</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Studio Name"
              value={draft.footer.studioName}
              onChange={(v) =>
                onUpdateDraft((prev) => ({ ...prev, footer: { ...prev.footer, studioName: v } }))
              }
            />
            <Field
              label="Studio Badge"
              value={draft.footer.studioBadge || "Product Studio & Digital Services"}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, studioBadge: v },
                }))
              }
            />
          </div>
          <Field
            label="Footer Bio / Tagline"
            value={draft.footer.tagline}
            onChange={(v) =>
              onUpdateDraft((prev) => ({ ...prev, footer: { ...prev.footer, tagline: v } }))
            }
            multiline
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Copyright Year"
              value={String(draft.footer.copyrightYear || 2026)}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, copyrightYear: Number(v) || 2026 },
                }))
              }
            />
            <Field
              label="Contact Email"
              value={draft.contact.email}
              onChange={(v) =>
                onUpdateDraft((prev) => ({ ...prev, contact: { ...prev.contact, email: v } }))
              }
            />
            <Field
              label="WhatsApp Number"
              value={draft.contact.whatsappDisplay}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, whatsappDisplay: v, whatsappNumber: v },
                }))
              }
            />
            <Field
              label="Instagram Handle"
              value={draft.contact.instagramHandle}
              onChange={(v) =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, instagramHandle: v },
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#332924]">Footer Columns ({columns.length})</span>
            <button
              type="button"
              onClick={() =>
                onUpdateDraft((prev) => ({
                  ...prev,
                  footer: {
                    ...prev.footer,
                    columns: [
                      ...columns,
                      { id: `col_${Date.now()}`, title: "New Column", links: [{ label: "Home", href: "/" }] },
                    ],
                  },
                }))
              }
              className="px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer"
            >
              + Add Column
            </button>
          </div>
          {columns.map((col) => (
            <div key={col.id} className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) =>
                    onUpdateDraft((prev) => ({
                      ...prev,
                      footer: {
                        ...prev.footer,
                        columns: columns.map((c) =>
                          c.id === col.id ? { ...c, title: e.target.value } : c
                        ),
                      },
                    }))
                  }
                  className="font-bold text-[#332924] px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: columns.map((c) =>
                            c.id === col.id
                              ? { ...c, links: [...c.links, { label: "Link", href: "/" }] }
                              : c
                          ),
                        },
                      }))
                    }
                    className="text-[11px] text-[#C96A50] font-bold cursor-pointer"
                  >
                    + Link
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: columns.filter((c) => c.id !== col.id),
                        },
                      }))
                    }
                    className="text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {col.links.map((lnk, lIdx) => (
                <div key={lIdx} className="grid grid-cols-11 gap-2 items-center">
                  <input
                    type="text"
                    value={lnk.label}
                    onChange={(e) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: columns.map((c) =>
                            c.id === col.id
                              ? {
                                  ...c,
                                  links: c.links.map((l, i) =>
                                    i === lIdx ? { ...l, label: e.target.value } : l
                                  ),
                                }
                              : c
                          ),
                        },
                      }))
                    }
                    className="col-span-5 px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                  <input
                    type="text"
                    value={lnk.href}
                    onChange={(e) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: columns.map((c) =>
                            c.id === col.id
                              ? {
                                  ...c,
                                  links: c.links.map((l, i) =>
                                    i === lIdx ? { ...l, href: e.target.value } : l
                                  ),
                                }
                              : c
                          ),
                        },
                      }))
                    }
                    className="col-span-5 px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          columns: columns.map((c) =>
                            c.id === col.id
                              ? { ...c, links: c.links.filter((_, i) => i !== lIdx) }
                              : c
                          ),
                        },
                      }))
                    }
                    className="col-span-1 text-rose-500 cursor-pointer flex justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback optional built-in sections (`apps`, `about`)
  if (activeSectionId === "apps") {
    const selectedIds = draft.appsSection?.displayedAppIds || [];
    return (
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
          <Field
            label="Eyebrow"
            value={draft.appsSection?.eyebrow || "STUDIO APPS"}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                appsSection: { ...(prev.appsSection || {}), eyebrow: v },
              }))
            }
          />
          <Field
            label="Title"
            value={draft.appsSection?.title || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                appsSection: { ...(prev.appsSection || {}), title: v },
              }))
            }
          />
          <Field
            label="Subtitle"
            value={draft.appsSection?.subtitle || ""}
            onChange={(v) =>
              onUpdateDraft((prev) => ({
                ...prev,
                appsSection: { ...(prev.appsSection || {}), subtitle: v },
              }))
            }
            multiline
          />
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8DFD5] space-y-2">
          <div className="font-bold text-[#332924]">Displayed Apps</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {apps.map((app) => (
              <label key={app.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(app.id)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedIds, app.id]
                      : selectedIds.filter((x) => x !== app.id);
                    onUpdateDraft((prev) => ({
                      ...prev,
                      appsSection: { ...(prev.appsSection || {}), displayedAppIds: next },
                    }));
                  }}
                />
                <span className="font-semibold text-[#332924]">{app.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // `about` story block
  return (
    <div className="space-y-4 text-xs p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
      <Field
        label="Studio Story Eyebrow"
        value={draft.about.eyebrow}
        onChange={(v) =>
          onUpdateDraft((prev) => ({ ...prev, about: { ...prev.about, eyebrow: v } }))
        }
      />
      <Field
        label="Headline"
        value={draft.about.headline}
        onChange={(v) =>
          onUpdateDraft((prev) => ({ ...prev, about: { ...prev.about, headline: v } }))
        }
      />
      <Field
        label="Founder Bio / Description"
        value={draft.about.bio}
        onChange={(v) =>
          onUpdateDraft((prev) => ({ ...prev, about: { ...prev.about, bio: v } }))
        }
        multiline
      />
      <Field
        label="Studio Motto / Ethos"
        value={draft.about.ethos}
        onChange={(v) =>
          onUpdateDraft((prev) => ({ ...prev, about: { ...prev.about, ethos: v } }))
        }
      />
    </div>
  );
}
