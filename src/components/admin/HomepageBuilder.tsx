"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getSiteContent,
  saveSiteContentDraft,
  publishSiteContent,
} from "@/lib/cms";
import type {
  AppDocument,
  ProjectDocument,
  ReviewDocument,
  ServiceDocument,
  SiteContentDocument,
  WebsitePackageDocument,
} from "@/types/cms";
import { MediaLibraryModal } from "./MediaLibraryModal";
import { LayoutBuilderTab } from "./builder/LayoutBuilderTab";
import { SectionEditorsTab } from "./builder/SectionEditorsTab";
import { ThemeAndSeoTab } from "./builder/ThemeAndSeoTab";
import { LiveHomepagePreview } from "./builder/LiveHomepagePreview";
import {
  Save,
  Rocket,
  RotateCcw,
  Monitor,
  Smartphone,
  Columns2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Palette,
  Search,
  Sparkles,
  Layers,
  Navigation,
  PanelBottom,
  Users,
  Briefcase,
  FolderKanban,
  Workflow,
  ShieldCheck,
  Megaphone,
} from "lucide-react";

interface HomepageBuilderProps {
  currentUserEmail?: string;
  apps: AppDocument[];
  projects: ProjectDocument[];
  services: ServiceDocument[];
  packages?: WebsitePackageDocument[];
  reviews?: ReviewDocument[];
  onRefreshAll?: () => Promise<void>;
}

const BUILDER_TABS = [
  { id: "layout", label: "Page Layout & Custom Blocks", icon: LayoutGrid, group: "structure" },
  { id: "theme", label: "Colors & Fonts", icon: Palette, group: "design" },
  { id: "navigation", label: "Top Navbar & Menu", icon: Navigation, group: "structure" },
  { id: "hero", label: "Hero & Quick Start", icon: Sparkles, group: "sections" },
  { id: "services", label: "Services Section", icon: Briefcase, group: "sections" },
  { id: "projects", label: "Projects Showcase", icon: FolderKanban, group: "sections" },
  { id: "overview", label: "About / Overview", icon: Layers, group: "sections" },
  { id: "process", label: "4-Step Process", icon: Workflow, group: "sections" },
  { id: "why-us", label: "Why Choose Us", icon: ShieldCheck, group: "sections" },
  { id: "team", label: "Team Members", icon: Users, group: "sections" },
  { id: "cta", label: "Bottom Call-to-Action", icon: Megaphone, group: "sections" },
  { id: "footer", label: "Footer & Contact", icon: PanelBottom, group: "structure" },
  { id: "seo", label: "Google Search & SEO", icon: Search, group: "design" },
];

export function HomepageBuilder({
  currentUserEmail,
  apps,
  projects,
  services,
  onRefreshAll,
}: HomepageBuilderProps) {
  const [draft, setDraft] = useState<SiteContentDocument | null>(null);
  const [publishedSnapshot, setPublishedSnapshot] = useState<SiteContentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>("layout");
  const [previewMode, setPreviewMode] = useState<"split" | "desktop" | "mobile">("split");
  const [statusNotice, setStatusNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mediaCallback, setMediaCallback] = useState<((url: string) => void) | null>(null);

  const loadBuilderContent = useCallback(async () => {
    setLoading(true);
    try {
      const [live, draftDoc] = await Promise.all([
        getSiteContent({ isDraft: false }),
        getSiteContent({ isDraft: true }),
      ]);
      setPublishedSnapshot(live);
      setDraft(draftDoc);
    } catch (err) {
      setStatusNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Could not load builder content.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadBuilderContent();
    });
  }, [loadBuilderContent]);

  if (loading || !draft) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8DFD5] p-16 text-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#C96A50] mx-auto" />
        <p className="text-xs font-mono text-[#6E625B]">Loading Visual Page &amp; Theme Builder...</p>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setStatusNotice(null);
    try {
      await saveSiteContentDraft(draft);
      setStatusNotice({
        type: "success",
        text: "Draft saved! Preview looks good? Click Publish Live whenever ready.",
      });
    } catch (err) {
      setStatusNotice({
        type: "error",
        text: `Could not save draft: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Publish all changes directly to your live public website?")) return;
    setPublishing(true);
    setStatusNotice(null);
    try {
      await publishSiteContent(draft, currentUserEmail);
      setPublishedSnapshot(draft);
      if (onRefreshAll) {
        await onRefreshAll().catch(() => {});
      }
      setStatusNotice({
        type: "success",
        text: "Published live! Open the homepage in a new tab to see your updated site.",
      });
    } catch (err) {
      setStatusNotice({
        type: "error",
        text: `Publish failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardDraft = () => {
    if (!publishedSnapshot) return;
    if (!confirm("Reset editor back to the currently published live version?")) return;
    setDraft(publishedSnapshot);
    setStatusNotice({ type: "success", text: "Reverted editor to live published content." });
  };

  const customSections = draft.customSections || [];
  const activeCustomSection = customSections.find((c) => c.id === activeSubTab);

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-base text-[#332924]">
            Visual Homepage, Layout &amp; Theme Builder
          </h2>
          <p className="text-xs text-[#6E625B]">
            Reorder or add sections, customize colors/fonts, edit text &amp; team profiles, and publish live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preview Viewport Selector */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD5]">
            <button
              type="button"
              onClick={() => setPreviewMode("split")}
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                previewMode === "split" ? "bg-white text-[#332924] shadow-2xs" : "text-[#6E625B]"
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                previewMode === "desktop" ? "bg-white text-[#332924] shadow-2xs" : "text-[#6E625B]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                previewMode === "mobile" ? "bg-white text-[#332924] shadow-2xs" : "text-[#6E625B]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDiscardDraft}
            className="px-3.5 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#E8DFD5] text-xs font-bold text-[#5F534D] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="px-4 py-2 rounded-full bg-[#332924] hover:bg-[#4A3D36] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingDraft ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="px-5 py-2 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
            <span>{publishing ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Notice */}
      {statusNotice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            statusNotice.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="flex items-center gap-2">
            {statusNotice.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Navigation Pills */}
        {previewMode === "split" && (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8DFD5] p-3 shadow-2xs space-y-4">
            <div>
              <div className="px-2.5 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A7C75]">
                Sections &amp; Style
              </div>
              <div className="space-y-1">
                {BUILDER_TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeSubTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveSubTab(t.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? "bg-[#FAECE4] text-[#B4583F] border border-[#EED3C5]"
                          : "text-[#5F534D] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {customSections.length > 0 && (
              <div>
                <div className="px-2.5 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A7C75]">
                  Your Custom Sections
                </div>
                <div className="space-y-1">
                  {customSections.map((c) => {
                    const active = activeSubTab === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveSubTab(c.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? "bg-[#C96A50] text-white"
                            : "text-[#332924] bg-[#FAF7F2] hover:bg-[#FAECE4]"
                        }`}
                      >
                        <span className="truncate">{c.name || c.headline}</span>
                        <span className="text-[9px] font-mono uppercase opacity-75 shrink-0">
                          {c.layout}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center Editor Area */}
        {previewMode === "split" && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DFD5] p-5 shadow-2xs max-h-[82vh] overflow-y-auto">
            {activeCustomSection && (
              <div className="mb-4 pb-3 border-b border-[#E8DFD5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#C96A50]">
                  Editing Custom Block: {activeCustomSection.name}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("layout")}
                  className="text-xs font-semibold text-[#5F534D] hover:underline cursor-pointer"
                >
                  ← Back to Layout Order
                </button>
              </div>
            )}

            {activeSubTab === "layout" ? (
              <LayoutBuilderTab
                draft={draft}
                onUpdateDraft={(fn) => setDraft((prev) => (prev ? fn(prev) : prev))}
                onJumpToEditor={(tabId) => setActiveSubTab(tabId)}
              />
            ) : activeSubTab === "theme" || activeSubTab === "seo" ? (
              <ThemeAndSeoTab
                mode={activeSubTab}
                draft={draft}
                onUpdateDraft={(fn) => setDraft((prev) => (prev ? fn(prev) : prev))}
                onOpenMediaPicker={(cb) => setMediaCallback(() => cb)}
              />
            ) : (
              <SectionEditorsTab
                activeSectionId={activeSubTab}
                draft={draft}
                apps={apps}
                projects={projects}
                services={services}
                onUpdateDraft={(fn) => setDraft((prev) => (prev ? fn(prev) : prev))}
                onOpenMediaPicker={(cb) => setMediaCallback(() => cb)}
              />
            )}
          </div>
        )}

        {/* Live Preview Pane */}
        <div
          className={
            previewMode === "split"
              ? "lg:col-span-4 space-y-2.5 lg:sticky lg:top-20"
              : "lg:col-span-12 space-y-2.5"
          }
        >
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#6E625B]">
            <span>LIVE INTERACTIVE PREVIEW</span>
            <span>Click any block to edit it</span>
          </div>
          <LiveHomepagePreview
            draft={draft}
            device={previewMode === "mobile" ? "mobile" : "desktop"}
            onClickSection={(key) => {
              setPreviewMode("split");
              setActiveSubTab(key);
            }}
          />
        </div>
      </div>

      {mediaCallback && (
        <MediaLibraryModal
          isOpen={true}
          onClose={() => setMediaCallback(null)}
          onSelect={(asset) => {
            mediaCallback(asset.url);
            setMediaCallback(null);
          }}
        />
      )}
    </div>
  );
}
