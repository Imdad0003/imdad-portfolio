"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  Upload,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Globe,
  Sparkles,
  Layers,
  Settings,
  Link as LinkIcon,
  Folder,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import type {
  SiteContentDocument,
  SettingsDocument,
  AppDocument,
  ProjectDocument,
  ServiceDocument,
} from "@/types/cms";
import {
  getSiteContent,
  saveSiteContentDraft,
  publishSiteContent,
  getSettings,
  saveSettingsAdmin,
  defaultSiteContent,
} from "@/lib/cms";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface HomepageBuilderProps {
  currentUserEmail?: string;
  apps: AppDocument[];
  projects: ProjectDocument[];
  services: ServiceDocument[];
}

type BuilderSubTab =
  | "global"
  | "navigation"
  | "hero"
  | "apps"
  | "services"
  | "projects"
  | "about"
  | "cta"
  | "footer"
  | "layout"
  | "seo";

type PreviewDevice = "editor" | "desktop" | "mobile";

export function HomepageBuilder({
  currentUserEmail,
  apps,
  projects,
  services,
}: HomepageBuilderProps) {
  // Working draft state
  const [content, setContent] = useState<SiteContentDocument>(defaultSiteContent);
  const [globalSettings, setGlobalSettings] = useState<SettingsDocument | null>(null);

  // Status & loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // View state
  const [activeSubTab, setActiveSubTab] = useState<BuilderSubTab>("hero");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("editor");

  // Media Library Modal state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<string | null>(null);

  // Load draft & settings on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load draft first; falls back to main
        const draftContent = await getSiteContent({ isDraft: true });
        const settingsDoc = await getSettings();
        setContent(draftContent);
        setGlobalSettings(settingsDoc);

        // Check if draft has unpublished changes compared to main
        const publishedContent = await getSiteContent({ isDraft: false });
        if (draftContent.draftModifiedAt && publishedContent.publishedAt) {
          setHasUnpublishedChanges(
            new Date(draftContent.draftModifiedAt) > new Date(publishedContent.publishedAt)
          );
        }
      } catch (err) {
        console.warn("Failed to load Homepage Builder data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update content helper with auto-flag for unpublished changes
  const updateContent = (updater: (prev: SiteContentDocument) => SiteContentDocument) => {
    setContent((prev) => {
      const next = updater(prev);
      setHasUnpublishedChanges(true);
      return next;
    });
  };

  // Draft Save Handler
  const handleSaveDraft = async () => {
    setSaving(true);
    setStatusNotice(null);
    try {
      await saveSiteContentDraft(content);
      if (globalSettings) {
        await saveSettingsAdmin(globalSettings);
      }
      setHasUnpublishedChanges(true);
      setStatusNotice({
        type: "success",
        text: "Draft changes saved. These changes are NOT visible publicly until you click 'Publish Changes'.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusNotice({ type: "error", text: `Failed to save draft: ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  // Publish to Live Handler
  const handlePublish = async () => {
    if (!confirm("Are you ready to publish all draft changes to the live public homepage?")) {
      return;
    }
    setPublishing(true);
    setStatusNotice(null);
    try {
      await publishSiteContent(content, currentUserEmail);
      if (globalSettings) {
        await saveSettingsAdmin(globalSettings);
      }
      setHasUnpublishedChanges(false);
      setStatusNotice({
        type: "success",
        text: "Website published successfully! Changes are now live on https://imdadbuild.space.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusNotice({ type: "error", text: `Failed to publish: ${msg}` });
    } finally {
      setPublishing(false);
    }
  };

  // Open Media Library for a specific field
  const openMediaLibrary = (targetField: string) => {
    setMediaTargetField(targetField);
    setMediaModalOpen(true);
  };

  // Media Library Selection Receiver
  const handleMediaSelected = (asset: { url: string; alt?: string }) => {
    if (!mediaTargetField) return;

    if (mediaTargetField === "global.primaryLogo" && globalSettings) {
      setGlobalSettings({ ...globalSettings, primaryLogo: asset.url });
      setHasUnpublishedChanges(true);
    } else if (mediaTargetField === "global.secondaryLogo" && globalSettings) {
      setGlobalSettings({ ...globalSettings, secondaryLogo: asset.url });
      setHasUnpublishedChanges(true);
    } else if (mediaTargetField === "navigation.logo") {
      updateContent((prev) => ({
        ...prev,
        navigation: { ...(prev.navigation || defaultSiteContent.navigation!), logo: asset.url },
      }));
    } else if (mediaTargetField === "hero.heroImage") {
      updateContent((prev) => ({
        ...prev,
        hero: { ...prev.hero, heroImage: asset.url, heroImageAlt: asset.alt || prev.hero.heroImageAlt },
      }));
    } else if (mediaTargetField === "footer.logo") {
      updateContent((prev) => ({
        ...prev,
        footer: { ...prev.footer, logo: asset.url },
      }));
    } else if (mediaTargetField === "seo.ogImage") {
      updateContent((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          seo: { ...prev.metadata?.seo, ogImage: asset.url },
        },
      }));
    }

    setMediaTargetField(null);
  };

  // Reordering sections
  const moveSection = (idx: number, direction: "up" | "down") => {
    const list = [...(content.metadata?.sectionOrder || defaultSiteContent.metadata!.sectionOrder!)];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    updateContent((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        sectionOrder: list,
      },
    }));
  };

  // Toggle section visibility
  const toggleSection = (sectionKey: string) => {
    const current = content.metadata?.sectionVisibility?.[sectionKey] !== false;
    updateContent((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        sectionVisibility: {
          ...(prev.metadata?.sectionVisibility || {}),
          [sectionKey]: !current,
        },
      },
    }));
  };

  const SUB_TABS: Array<{ id: BuilderSubTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "hero", label: "Hero Section", icon: Sparkles },
    { id: "apps", label: "Featured Apps", icon: Smartphone },
    { id: "services", label: "Services", icon: Layers },
    { id: "projects", label: "Projects", icon: Globe },
    { id: "about", label: "About Studio", icon: HelpCircle },
    { id: "cta", label: "Start Project CTA", icon: CheckCircle2 },
    { id: "navigation", label: "Navigation Bar", icon: LinkIcon },
    { id: "footer", label: "Footer", icon: Folder },
    { id: "layout", label: "Order & Visibility", icon: Layers },
    { id: "global", label: "Global Branding", icon: Settings },
    { id: "seo", label: "SEO & Social", icon: Globe },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-500 bg-white rounded-3xl border border-slate-200">
        Loading Homepage Builder &amp; Content Architecture...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action & Status Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black tracking-tight text-[#0A192F]">
              Homepage Visual Builder
            </h2>
            {hasUnpublishedChanges ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unpublished Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Published
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize all visible content, CTAs, cards, and branding without touching code.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Device Preview Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreviewDevice("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "editor"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-600 hover:text-[#0A192F]"
              }`}
            >
              <span>Editor</span>
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-600 hover:text-[#0A192F]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-600 hover:text-[#0A192F]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Media Library Shortcut */}
          <button
            onClick={() => {
              setMediaTargetField(null);
              setMediaModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#0A192F] border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="hidden sm:inline">Media Library</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0A192F] transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          {/* Publish Changes */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{publishing ? "Publishing..." : "Publish Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            statusNotice.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : statusNotice.type === "error"
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : "bg-sky-50 text-sky-900 border-sky-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode 1: LIVE INTERACTIVE PREVIEW (Desktop or Mobile) */}
      {previewDevice !== "editor" ? (
        <div className="flex flex-col items-center justify-center py-6 bg-slate-900/5 rounded-3xl border border-slate-200">
          <div className="mb-4 text-xs font-mono text-slate-500 flex items-center gap-2">
            <span>Viewing Live Draft Preview</span>
            <span>•</span>
            <span className="font-bold uppercase text-[#0A192F]">{previewDevice} VIEWPORT</span>
          </div>

          <div
            className={`transition-all duration-300 bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 ${
              previewDevice === "mobile"
                ? "w-[390px] h-[780px] max-w-full"
                : "w-full max-w-5xl h-[780px]"
            }`}
          >
            {/* Embedded Frame Device Header */}
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white text-[11px] font-mono">
              <span className="truncate">imdadbuild.space (Draft Preview)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            {/* Scrollable Preview Body */}
            <div className="w-full h-[calc(100%-36px)] overflow-y-auto bg-[#F8FAFC]">
              {/* Preview Hero */}
              {content.metadata?.sectionVisibility?.hero !== false && (
                <div className="p-6 sm:p-10 border-b border-slate-200 text-left bg-white">
                  <div className="inline-block px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] font-mono text-[10px] font-bold uppercase mb-4 border border-sky-100">
                    {content.hero.badge}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight leading-tight">
                    {content.hero.headline}
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                    {content.hero.subheadline}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <button className="px-5 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs">
                      {content.hero.primaryCtaText}
                    </button>
                    <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-[#0A192F] font-bold text-xs">
                      {content.hero.secondaryCtaText}
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Apps */}
              {content.metadata?.sectionVisibility?.apps !== false && (
                <div className="p-6 sm:p-10 border-b border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">
                    {content.appsSection?.eyebrow || "PRODUCT LAB"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A192F]">
                    {content.appsSection?.title || "New Apps"}
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    {content.appsSection?.subtitle || "Distinctive tools with zero bloat."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {apps.slice(0, 2).map((app) => (
                      <div key={app.id} className="p-4 rounded-2xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-sm text-[#0A192F]">{app.name}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-sky-50 text-[#0284C7] font-bold">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{app.shortDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Services */}
              {content.metadata?.sectionVisibility?.services !== false && (
                <div className="p-6 sm:p-10 border-b border-slate-200 bg-white">
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">
                    {content.servicesSection?.eyebrow || "STUDIO CAPABILITIES"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A192F]">
                    {content.servicesSection?.title || "Studio Services"}
                  </h2>
                  <div className="mt-4 space-y-2">
                    {services.slice(0, 3).map((s) => (
                      <div key={s.id} className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0A192F]">{s.name}</span>
                        <span className="font-mono text-slate-400">View Service &rarr;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview About */}
              {content.metadata?.sectionVisibility?.about !== false && (
                <div className="p-6 sm:p-10 border-b border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">
                    {content.about.eyebrow}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] mb-3">
                    {content.about.headline}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{content.about.bio}</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(content.about.pillars || []).map((p, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                        <span className="font-mono font-bold text-[#0284C7] mr-2">{p.number}</span>
                        <span className="font-bold text-[#0A192F]">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Final CTA */}
              {content.metadata?.sectionVisibility?.["final-cta"] !== false && (
                <div className="p-6 sm:p-10 text-center bg-gradient-to-b from-white to-sky-50/30">
                  <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase block mb-2">
                    {content.finalCta.eyebrow}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] max-w-md mx-auto">
                    {content.finalCta.headline}
                  </h2>
                  <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
                    {content.finalCta.description}
                  </p>
                  <button className="mt-5 px-6 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs">
                    {content.finalCta.primaryCtaText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: SECTION-BY-SECTION EDITOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sub Navigation Sidebar (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Homepage Sections
            </div>
            {SUB_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0A192F] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#0284C7]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-300"}`} />
                </button>
              );
            })}
          </div>

          {/* Active Section Editor (9 Cols) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* 1. HERO SECTION */}
            {activeSubTab === "hero" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Hero Section</h3>
                    <p className="text-xs text-slate-500">
                      Primary storefront landing header, value proposition, and main CTAs
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.hero !== false}
                      onChange={() => toggleSection("hero")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow Badge Text
                      </label>
                      <input
                        type="text"
                        value={content.hero.badge || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, badge: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. DIGITAL PRODUCT STUDIO"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Live Announcement Bar
                      </label>
                      <input
                        type="text"
                        value={content.hero.announcement || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, announcement: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. Now building: WishMusic & WishTracking"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={content.hero.headline || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, headline: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                      placeholder="e.g. Apps, Platforms & Digital Commerce."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Highlighted Headline Text (Blue Accent)
                    </label>
                    <input
                      type="text"
                      value={content.hero.highlightedText || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, highlightedText: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                      placeholder="e.g. Digital Commerce."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Subheadline / Supporting Editorial Description
                    </label>
                    <textarea
                      rows={3}
                      value={content.hero.subheadline || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, subheadline: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-[#0A192F] block">Primary Button</span>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Label</label>
                        <input
                          type="text"
                          value={content.hero.primaryCtaText || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, primaryCtaText: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Destination Link</label>
                        <input
                          type="text"
                          value={content.hero.primaryCtaLink || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, primaryCtaLink: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-[#0A192F] block">Secondary Button</span>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Label</label>
                        <input
                          type="text"
                          value={content.hero.secondaryCtaText || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, secondaryCtaText: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Destination Link</label>
                        <input
                          type="text"
                          value={content.hero.secondaryCtaLink || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, secondaryCtaLink: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Visual Image Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0A192F]">Hero Image / Lab Visual</label>
                    <div className="flex gap-3 items-center">
                      {content.hero.heroImage && (
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={content.hero.heroImage} alt="Hero Visual" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={content.hero.heroImage || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, heroImage: e.target.value },
                          }))
                        }
                        placeholder="https://... or choose from Media Library"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                      <button
                        type="button"
                        onClick={() => openMediaLibrary("hero.heroImage")}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0A192F] font-bold text-xs border border-slate-200 shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. FEATURED APPS SECTION */}
            {activeSubTab === "apps" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Featured Apps Section</h3>
                    <p className="text-xs text-slate-500">
                      Product lab showcase highlighting proprietary applications (WishMusic, WishTracking, EasyXo)
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.apps !== false}
                      onChange={() => toggleSection("apps")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={content.appsSection?.eyebrow || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            appsSection: { ...(prev.appsSection || {}), eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. PRODUCT LAB // CURRENT RELEASES"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={content.appsSection?.title || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            appsSection: { ...(prev.appsSection || {}), title: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. New Apps"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Section Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.appsSection?.subtitle || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          appsSection: { ...(prev.appsSection || {}), subtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Ecosystem Link Text
                      </label>
                      <input
                        type="text"
                        value={content.appsSection?.ctaText || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            appsSection: { ...(prev.appsSection || {}), ctaText: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. VIEW ALL APPS & ECOSYSTEM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Ecosystem Link URL
                      </label>
                      <input
                        type="text"
                        value={content.appsSection?.ctaLink || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            appsSection: { ...(prev.appsSection || {}), ctaLink: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="/apps"
                      />
                    </div>
                  </div>

                  {/* App Cards Quick Reference */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A192F]">
                        Apps In Ecosystem ({apps.length})
                      </span>
                      <Link
                        href="/admin/apps"
                        className="text-xs font-mono font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                      >
                        <span>Manage Individual App Releases</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {apps.map((app) => (
                        <div key={app.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            {app.logo && (
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-[#0A192F]">{app.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 ml-2">/{app.slug}</span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                              app.published
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {app.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STUDIO SERVICES SECTION */}
            {activeSubTab === "services" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Services Section</h3>
                    <p className="text-xs text-slate-500">
                      Commercial engineering and media capabilities stack
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.services !== false}
                      onChange={() => toggleSection("services")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={content.servicesSection?.eyebrow || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            servicesSection: { ...(prev.servicesSection || {}), eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. STUDIO CAPABILITIES // 5 DISCIPLINES"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={content.servicesSection?.title || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            servicesSection: { ...(prev.servicesSection || {}), title: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. Studio Services"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Section Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.servicesSection?.subtitle || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          servicesSection: { ...(prev.servicesSection || {}), subtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        View All Services Link Text
                      </label>
                      <input
                        type="text"
                        value={content.servicesSection?.ctaText || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            servicesSection: { ...(prev.servicesSection || {}), ctaText: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. EXPLORE ALL SERVICES & PRICING"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        View All Services URL
                      </label>
                      <input
                        type="text"
                        value={content.servicesSection?.ctaLink || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            servicesSection: { ...(prev.servicesSection || {}), ctaLink: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="/services"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SELECTED PROJECTS SECTION */}
            {activeSubTab === "projects" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Projects Section</h3>
                    <p className="text-xs text-slate-500">
                      Curated case studies demonstrating commercial execution
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.projects !== false}
                      onChange={() => toggleSection("projects")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={content.projectsSection?.eyebrow || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            projectsSection: { ...(prev.projectsSection || {}), eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. CASE STUDIES // PROVEN EXECUTION"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={content.projectsSection?.title || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            projectsSection: { ...(prev.projectsSection || {}), title: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. Featured Projects"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Section Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.projectsSection?.subtitle || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          projectsSection: { ...(prev.projectsSection || {}), subtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        View All Projects Link Text
                      </label>
                      <input
                        type="text"
                        value={content.projectsSection?.ctaText || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            projectsSection: { ...(prev.projectsSection || {}), ctaText: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="e.g. VIEW ALL CASE STUDIES"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        View All Projects URL
                      </label>
                      <input
                        type="text"
                        value={content.projectsSection?.ctaLink || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            projectsSection: { ...(prev.projectsSection || {}), ctaLink: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                        placeholder="/projects"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ABOUT STUDIO SECTION */}
            {activeSubTab === "about" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">About Studio Section</h3>
                    <p className="text-xs text-slate-500">
                      Studio manifesto, founder narrative, ethos, and the 3 operational pillars
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.about !== false}
                      onChange={() => toggleSection("about")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow
                      </label>
                      <input
                        type="text"
                        value={content.about.eyebrow || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            about: { ...prev.about, eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={content.about.headline || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            about: { ...prev.about, headline: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Studio Bio / Main Narrative
                    </label>
                    <textarea
                      rows={3}
                      value={content.about.bio || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          about: { ...prev.about, bio: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Studio Ethos Quote
                      </label>
                      <input
                        type="text"
                        value={content.about.ethos || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            about: { ...prev.about, ethos: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Location / Distribution
                      </label>
                      <input
                        type="text"
                        value={content.about.location || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            about: { ...prev.about, location: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  {/* 3 Operational Pillars */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <span className="text-xs font-bold text-[#0A192F] block">
                      3 Operational Pillars (Right Column)
                    </span>
                    {(content.about.pillars || []).map((pillar, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={pillar.number}
                            onChange={(e) => {
                              const newPillars = [...(content.about.pillars || [])];
                              newPillars[idx] = { ...newPillars[idx], number: e.target.value };
                              updateContent((prev) => ({
                                ...prev,
                                about: { ...prev.about, pillars: newPillars },
                              }));
                            }}
                            className="w-16 px-2 py-1 rounded bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-[#0284C7]"
                          />
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => {
                              const newPillars = [...(content.about.pillars || [])];
                              newPillars[idx] = { ...newPillars[idx], title: e.target.value };
                              updateContent((prev) => ({
                                ...prev,
                                about: { ...prev.about, pillars: newPillars },
                              }));
                            }}
                            placeholder="Pillar Title"
                            className="w-full px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-bold text-[#0A192F]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={pillar.description}
                          onChange={(e) => {
                            const newPillars = [...(content.about.pillars || [])];
                            newPillars[idx] = { ...newPillars[idx], description: e.target.value };
                            updateContent((prev) => ({
                              ...prev,
                              about: { ...prev.about, pillars: newPillars },
                            }));
                          }}
                          placeholder="Pillar Description"
                          className="w-full px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. START A PROJECT CTA SECTION */}
            {activeSubTab === "cta" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#0A192F]">Start a Project CTA</h3>
                    <p className="text-xs text-slate-500">
                      Conversion banner inviting ambitious clients to book projects or contact the studio
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0A192F]">
                    <input
                      type="checkbox"
                      checked={content.metadata?.sectionVisibility?.["final-cta"] !== false}
                      onChange={() => toggleSection("final-cta")}
                      className="rounded text-[#0284C7]"
                    />
                    <span>Section Visible</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={content.finalCta.eyebrow || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            finalCta: { ...prev.finalCta, eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Main Headline
                      </label>
                      <input
                        type="text"
                        value={content.finalCta.headline || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            finalCta: { ...prev.finalCta, headline: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={content.finalCta.description || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          finalCta: { ...prev.finalCta, description: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-[#0A192F] block">Primary Button</span>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Label</label>
                        <input
                          type="text"
                          value={content.finalCta.primaryCtaText || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              finalCta: { ...prev.finalCta, primaryCtaText: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Destination Link</label>
                        <input
                          type="text"
                          value={content.finalCta.primaryCtaLink || "/contact"}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              finalCta: { ...prev.finalCta, primaryCtaLink: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-[#0A192F] block">Secondary Button</span>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Label</label>
                        <input
                          type="text"
                          value={content.finalCta.secondaryCtaText || ""}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              finalCta: { ...prev.finalCta, secondaryCtaText: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Destination Link</label>
                        <input
                          type="text"
                          value={content.finalCta.secondaryCtaLink || "/about"}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              finalCta: { ...prev.finalCta, secondaryCtaLink: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Bottom Footnote Note
                    </label>
                    <input
                      type="text"
                      value={content.finalCta.footnote || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          finalCta: { ...prev.finalCta, footnote: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. NAVIGATION & HEADER */}
            {activeSubTab === "navigation" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-black text-[#0A192F]">Navigation Bar</h3>
                  <p className="text-xs text-slate-500">
                    Header logo, studio identity tag, navigation menu items, and CTA button
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Brand Text
                      </label>
                      <input
                        type="text"
                        value={content.navigation?.brandName || "IMDAD.BUILDS"}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            navigation: {
                              ...(prev.navigation || defaultSiteContent.navigation!),
                              brandName: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Sub-brand Badge Tag
                      </label>
                      <input
                        type="text"
                        value={content.navigation?.badgeText || "PRODUCT STUDIO // LAB"}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            navigation: {
                              ...(prev.navigation || defaultSiteContent.navigation!),
                              badgeText: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  {/* Nav Logo Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0A192F]">Header Logo</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.navigation?.logo || "/imdad-logo.png"}
                          alt="Navbar Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={content.navigation?.logo || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            navigation: {
                              ...(prev.navigation || defaultSiteContent.navigation!),
                              logo: e.target.value,
                            },
                          }))
                        }
                        placeholder="/imdad-logo.png or upload image"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                      <button
                        type="button"
                        onClick={() => openMediaLibrary("navigation.logo")}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0A192F] font-bold text-xs border border-slate-200 shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>

                  {/* Nav Links Editor */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A192F]">Navigation Links</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentLinks = [
                            ...(content.navigation?.navLinks || defaultSiteContent.navigation?.navLinks || []),
                          ];
                          currentLinks.push({ label: "New Link", href: "/" });
                          updateContent((prev) => ({
                            ...prev,
                            navigation: {
                              ...(prev.navigation || defaultSiteContent.navigation!),
                              navLinks: currentLinks,
                            },
                          }));
                        }}
                        className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(content.navigation?.navLinks || defaultSiteContent.navigation?.navLinks || []).map(
                        (item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const newLinks = [
                                  ...(content.navigation?.navLinks || defaultSiteContent.navigation?.navLinks || []),
                                ];
                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                updateContent((prev) => ({
                                  ...prev,
                                  navigation: {
                                    ...(prev.navigation || defaultSiteContent.navigation!),
                                    navLinks: newLinks,
                                  },
                                }));
                              }}
                              placeholder="Label"
                              className="w-1/3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0A192F]"
                            />
                            <input
                              type="text"
                              value={item.href}
                              onChange={(e) => {
                                const newLinks = [
                                  ...(content.navigation?.navLinks || defaultSiteContent.navigation?.navLinks || []),
                                ];
                                newLinks[idx] = { ...newLinks[idx], href: e.target.value };
                                updateContent((prev) => ({
                                  ...prev,
                                  navigation: {
                                    ...(prev.navigation || defaultSiteContent.navigation!),
                                    navLinks: newLinks,
                                  },
                                }));
                              }}
                              placeholder="/destination"
                              className="w-2/3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#0A192F]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newLinks = (
                                  content.navigation?.navLinks || defaultSiteContent.navigation?.navLinks || []
                                ).filter((_, i) => i !== idx);
                                updateContent((prev) => ({
                                  ...prev,
                                  navigation: {
                                    ...(prev.navigation || defaultSiteContent.navigation!),
                                    navLinks: newLinks,
                                  },
                                }));
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. FOOTER CONTENT */}
            {activeSubTab === "footer" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-black text-[#0A192F]">Footer Content</h3>
                  <p className="text-xs text-slate-500">
                    Footer description, tagline, copyright text, and legal navigation
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Studio Tagline
                    </label>
                    <input
                      type="text"
                      value={content.footer.tagline || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, tagline: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Footer Long Description
                    </label>
                    <textarea
                      rows={3}
                      value={content.footer.description || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, description: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Copyright Year
                      </label>
                      <input
                        type="number"
                        value={content.footer.copyrightYear || 2026}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            footer: { ...prev.footer, copyrightYear: Number(e.target.value) || 2026 },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Copyright Text
                      </label>
                      <input
                        type="text"
                        value={content.footer.copyrightText || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            footer: { ...prev.footer, copyrightText: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. SECTION ORDER & VISIBILITY */}
            {activeSubTab === "layout" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-black text-[#0A192F]">Homepage Section Layout &amp; Reordering</h3>
                  <p className="text-xs text-slate-500">
                    Drag or use arrows to rearrange sections. Toggle visibility to hide sections without deleting content.
                  </p>
                </div>

                <div className="space-y-2">
                  {(content.metadata?.sectionOrder || defaultSiteContent.metadata!.sectionOrder!).map(
                    (secKey, idx, arr) => {
                      const isVisible = content.metadata?.sectionVisibility?.[secKey] !== false;
                      const labels: Record<string, string> = {
                        hero: "Hero Section",
                        packages: "Pricing Packages",
                        apps: "Featured Apps",
                        services: "Studio Services",
                        projects: "Selected Projects",
                        about: "About Studio",
                        reviews: "Client Reviews",
                        "ai-assistant": "Studio AI Assistant",
                        "final-cta": "Start a Project CTA",
                      };

                      return (
                        <div
                          key={secKey}
                          className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                            isVisible ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-xs text-[#0A192F]">
                                {labels[secKey] || secKey}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 ml-2">({secKey})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSection(secKey)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                isVisible
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{isVisible ? "Visible" : "Hidden"}</span>
                            </button>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer text-slate-600"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => moveSection(idx, "down")}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 cursor-pointer text-slate-600"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* 10. GLOBAL BRANDING & SETTINGS */}
            {activeSubTab === "global" && globalSettings && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-black text-[#0A192F]">Global Branding &amp; Studio Settings</h3>
                  <p className="text-xs text-slate-500">
                    Brand identity, studio logos, communication handles, and social links
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={globalSettings.studioName || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, studioName: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={globalSettings.tagline || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, tagline: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  {/* Primary Logo Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0A192F]">Primary Brand Logo</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={globalSettings.primaryLogo || "/imdad-logo.png"}
                          alt="Primary Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={globalSettings.primaryLogo || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, primaryLogo: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        placeholder="https://... or choose from Media Library"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                      <button
                        type="button"
                        onClick={() => openMediaLibrary("global.primaryLogo")}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0A192F] font-bold text-xs border border-slate-200 shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary Logo / Favicon Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0A192F]">Secondary Logo / Favicon</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={globalSettings.secondaryLogo || "/favicon.png"}
                          alt="Secondary Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <input
                        type="text"
                        value={globalSettings.secondaryLogo || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, secondaryLogo: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        placeholder="https://... or choose from Media Library"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                      <button
                        type="button"
                        onClick={() => openMediaLibrary("global.secondaryLogo")}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0A192F] font-bold text-xs border border-slate-200 shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={globalSettings.contactEmail || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, contactEmail: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={globalSettings.whatsappNumber || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, whatsappNumber: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={globalSettings.instagramHandle || ""}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, instagramHandle: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={globalSettings.instagramUrl || "https://www.instagram.com/imdad.builds"}
                        onChange={(e) => {
                          setGlobalSettings({ ...globalSettings, instagramUrl: e.target.value });
                          setHasUnpublishedChanges(true);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. SEO METADATA */}
            {activeSubTab === "seo" && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-black text-[#0A192F]">SEO &amp; Social Share Metadata</h3>
                  <p className="text-xs text-slate-500">
                    Search engine titles, descriptions, and OpenGraph social card previews
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={content.metadata?.seo?.title || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            seo: {
                              ...prev.metadata?.seo,
                              title: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={content.metadata?.seo?.description || ""}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            seo: {
                              ...prev.metadata?.seo,
                              description: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
                    />
                  </div>

                  {/* OG Image Picker */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-[#0A192F]">OpenGraph Social Share Image</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-10 rounded-xl bg-white border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={content.metadata?.seo?.ogImage || "/imdad-logo.png"}
                          alt="OG Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        value={content.metadata?.seo?.ogImage || ""}
                        onChange={(e) =>
                          updateContent((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              seo: {
                                ...prev.metadata?.seo,
                                ogImage: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="/imdad-logo.png or upload image"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0A192F]"
                      />
                      <button
                        type="button"
                        onClick={() => openMediaLibrary("seo.ogImage")}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0A192F] font-bold text-xs border border-slate-200 shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Library Modal Picker */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelected}
        title={mediaTargetField ? `Choose Image for ${mediaTargetField}` : "Media Asset Library"}
      />
    </div>
  );
}
