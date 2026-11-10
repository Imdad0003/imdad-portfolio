"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { User } from "firebase/auth";
import {
  WishMusicVisualContent,
  WishMusicVisualContentDoc,
  VisualImage,
  ScreenshotItem,
  GalleryItem,
  SectionVisibility,
} from "@/types/wishmusic-visuals";
import { DEFAULT_WISHMUSIC_VISUALS } from "@/data/wishmusic-defaults";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  RotateCcw,
  X,
  ExternalLink,
  Plus,
} from "lucide-react";

interface WishMusicVisualManagerProps {
  currentUser: User | null;
}

export function WishMusicVisualManager({ currentUser }: WishMusicVisualManagerProps) {
  // Data state
  const [contentDoc, setContentDoc] = useState<WishMusicVisualContentDoc | null>(null);
  const [draft, setDraft] = useState<WishMusicVisualContent>(DEFAULT_WISHMUSIC_VISUALS);
  const [published, setPublished] = useState<WishMusicVisualContent>(DEFAULT_WISHMUSIC_VISUALS);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Active editor tab
  const [activeTab, setActiveTab] = useState<
    "hero" | "screenshots" | "features" | "about" | "gallery" | "visibility"
  >("hero");

  // Live preview mode: "desktop" | "mobile"
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");

  // Status and actions
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ section: string; targetId?: string; fieldName?: string }>({
    section: "general",
  });

  const notify = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper to get auth token
  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    if (!currentUser) return {};
    try {
      const token = await currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch {
      return {};
    }
  }, [currentUser]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const headers = await getAuthHeader();
        const res = await fetch("/api/admin/apps/wishmusic/visuals", { headers });
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && json.doc) {
            setContentDoc(json.doc);
            setDraft(json.doc.draft || DEFAULT_WISHMUSIC_VISUALS);
            setPublished(json.doc.published || DEFAULT_WISHMUSIC_VISUALS);
            setIsDirty(false);
          }
        }
      } catch (err) {
        console.warn("Failed to load visual content:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [getAuthHeader]);

  // Update draft with changes
  const updateDraft = (updater: (prev: WishMusicVisualContent) => WishMusicVisualContent) => {
    setDraft((prev) => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  };

  // -------------------------------------------------------------
  // SAVE DRAFT
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/admin/apps/wishmusic/visuals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          action: "save_draft",
          draft,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save draft");
      }

      setIsDirty(false);
      notify("success", "Visual draft saved. Changes visible in Live Preview.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Failed to save draft: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // PUBLISH CHANGES
  // -------------------------------------------------------------
  const handlePublish = async () => {
    if (!confirm("Publish draft visual content to the live public WishMusic page?")) return;
    setPublishing(true);
    try {
      // First save draft if dirty
      const headers = await getAuthHeader();
      if (isDirty) {
        await fetch("/api/admin/apps/wishmusic/visuals", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ action: "save_draft", draft }),
        });
      }

      const res = await fetch("/api/admin/apps/wishmusic/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "publish" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to publish visual content");
      }

      setPublished(json.published || draft);
      setIsDirty(false);
      notify("success", "Published! Live public WishMusic website updated.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Publish failed: ${msg}`);
    } finally {
      setPublishing(false);
    }
  };

  // -------------------------------------------------------------
  // RESTORE PREVIOUS VERSION
  // -------------------------------------------------------------
  const handleRestorePrevious = async () => {
    if (!contentDoc?.previous) {
      alert("No previous published version found to restore.");
      return;
    }
    if (!confirm("Revert visual content to the previously published snapshot?")) return;
    setRestoring(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/admin/apps/wishmusic/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "restore_previous" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to restore");
      }

      setDraft(json.restored);
      setPublished(json.restored);
      setIsDirty(false);
      notify("success", "Successfully restored previous published version.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Restore failed: ${msg}`);
    } finally {
      setRestoring(false);
    }
  };

  // -------------------------------------------------------------
  // IMAGE UPLOAD HANDLER
  // -------------------------------------------------------------
  const triggerImageUpload = (section: string, fieldName?: string, targetId?: string) => {
    uploadTargetRef.current = { section, fieldName, targetId };
    fileInputRef.current?.click();
  };

  const triggerMultiImageUpload = (section: string) => {
    uploadTargetRef.current = { section };
    multiFileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { section, fieldName, targetId } = uploadTargetRef.current;
    setUploadingSection(section);

    try {
      const headers = await getAuthHeader();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side MIME check
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          alert(`Skipping ${file.name}: only JPG, PNG, and WebP are supported.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("section", section);
        formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("/api/admin/apps/wishmusic/visuals/upload", {
          method: "POST",
          headers,
          body: formData,
        });

        const json = await res.json();
        if (!res.ok || !json.success || !json.asset) {
          throw new Error(json.error || `Upload failed for ${file.name}`);
        }

        const newAsset: VisualImage = json.asset;

        // Apply asset to targeted section
        applyUploadedAsset(section, fieldName, targetId, newAsset);
      }

      notify("success", `Uploaded ${files.length} image(s) to GitHub Releases CDN.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Upload failed: ${msg}`);
    } finally {
      setUploadingSection(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
    }
  };

  const applyUploadedAsset = (
    section: string,
    fieldName?: string,
    targetId?: string,
    asset?: VisualImage
  ) => {
    if (!asset) return;

    updateDraft((prev) => {
      const next = { ...prev };

      // 1. Hero images
      if (section === "hero" && fieldName) {
        next.hero = {
          ...next.hero,
          [fieldName]: asset,
        };
      }

      // 2. Screenshots
      else if (section === "screenshots") {
        if (targetId) {
          // Replace existing screenshot
          next.screenshots = next.screenshots.map((s) =>
            s.id === targetId ? { ...s, image: asset } : s
          );
        } else {
          // Add new screenshot
          const newOrder = next.screenshots.length + 1;
          const newScreenshot: ScreenshotItem = {
            id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            image: asset,
            title: asset.title || `Screenshot ${newOrder}`,
            caption: asset.caption || "",
            displayOrder: newOrder,
            featured: newOrder <= 3,
          };
          next.screenshots = [...next.screenshots, newScreenshot];
        }
      }

      // 3. Features
      else if (section === "features" && targetId) {
        next.features = next.features.map((f) =>
          f.id === targetId ? { ...f, image: asset } : f
        );
      }

      // 4. About section
      else if (section === "about" && fieldName) {
        next.about = {
          ...next.about,
          [fieldName]: asset,
        };
      }

      // 5. Gallery
      else if (section === "gallery") {
        if (targetId) {
          next.gallery = next.gallery.map((g) =>
            g.id === targetId ? { ...g, image: asset } : g
          );
        } else {
          const newOrder = next.gallery.length + 1;
          const newGalItem: GalleryItem = {
            id: `gal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            image: asset,
            title: asset.title || `Wallpaper ${newOrder}`,
            caption: asset.caption || "",
            category: "wallpaper",
            displayOrder: newOrder,
            enabled: true,
          };
          next.gallery = [...next.gallery, newGalItem];
        }
      }

      return next;
    });
  };

  // Reorder helpers
  const moveScreenshot = (index: number, direction: "up" | "down") => {
    updateDraft((prev) => {
      const items = [...prev.screenshots];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return {
        ...prev,
        screenshots: items.map((item, idx) => ({ ...item, displayOrder: idx + 1 })),
      };
    });
  };

  const deleteScreenshot = (id: string) => {
    if (!confirm("Remove this screenshot from the gallery?")) return;
    updateDraft((prev) => ({
      ...prev,
      screenshots: prev.screenshots
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, displayOrder: idx + 1 })),
    }));
  };

  const deleteGalleryItem = (id: string) => {
    if (!confirm("Remove this wallpaper/render from the gallery?")) return;
    updateDraft((prev) => ({
      ...prev,
      gallery: prev.gallery
        .filter((g) => g.id !== id)
        .map((g, idx) => ({ ...g, displayOrder: idx + 1 })),
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#502D55]/10 shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-[#935073] mx-auto mb-3" />
        <p className="text-xs font-mono text-[#56475C]">Loading WishMusic Visual Content CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file inputs for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={multiFileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />

      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-[#180D1D] tracking-tight">
              WishMusic Visual Content Manager
            </h2>
            {isDirty ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                Unsaved Draft Changes
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                Draft Synced
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-[#FAF4F9] text-[#935073] border border-[#502D55]/10 text-[10px] font-mono">
              Live: v{published.version}
            </span>
          </div>
          <p className="text-xs text-[#56475C]">
            Manage all public visual branding, 8–9 screenshots, feature cards, and wallpapers. Zero code changes required.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {contentDoc?.previous && (
            <button
              type="button"
              onClick={handleRestorePrevious}
              disabled={restoring || saving || publishing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#502D55]/15 bg-white text-xs font-semibold text-[#56475C] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Revert to previously published version"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{restoring ? "Reverting..." : "Restore Previous"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-bold text-[#935073] hover:bg-[#F3E5EE] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {publishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Publish to Live Website</span>
          </button>

          <a
            href="/apps/wishmusic"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-[#502D55]/15 bg-white text-[#56475C] hover:text-[#180D1D] hover:bg-gray-50 transition-colors"
            title="Open Live Public WishMusic Website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : notification.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor & Preview Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANE: Visual Controls & Section Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs overflow-x-auto">
            {[
              { id: "hero", label: "Hero & Branding" },
              { id: "screenshots", label: `Screenshots (${draft.screenshots.length})` },
              { id: "features", label: "Feature Cards (8)" },
              { id: "about", label: "About Section" },
              { id: "gallery", label: `Wallpapers (${draft.gallery.length})` },
              { id: "visibility", label: "Visibility & Layout" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "hero" | "screenshots" | "features" | "about" | "gallery" | "visibility")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#180D1D] text-white shadow-xs"
                    : "text-[#56475C] hover:bg-[#FAF4F9] hover:text-[#180D1D]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: HERO SECTION */}
          {activeTab === "hero" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
                <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider">
                  Hero Section Visuals &amp; Copy
                </h3>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#56475C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.hero.enabled}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        hero: { ...p.hero, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-[#935073] focus:ring-[#935073]"
                  />
                  <span>Show Hero</span>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={draft.hero.headline}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        hero: { ...p.hero, headline: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs font-medium text-[#180D1D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                    Description / Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={draft.hero.subheadline}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        hero: { ...p.hero, subheadline: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs font-medium text-[#180D1D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                      Primary CTA Text
                    </label>
                    <input
                      type="text"
                      value={draft.hero.ctaText}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          hero: { ...p.hero, ctaText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs text-[#180D1D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                      Secondary CTA Text
                    </label>
                    <input
                      type="text"
                      value={draft.hero.secondaryCtaText}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          hero: { ...p.hero, secondaryCtaText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs text-[#180D1D]"
                    />
                  </div>
                </div>

                {/* Image Upload Slots for Hero */}
                <div className="pt-2 border-t border-[#502D55]/10 space-y-4">
                  <span className="text-[11px] font-mono font-bold text-[#7A6880] block uppercase">
                    Custom Hero Assets
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Desktop Background */}
                    <div className="p-3.5 rounded-xl border border-[#502D55]/10 bg-[#FAF4F9]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#180D1D]">Desktop Background</span>
                        {draft.hero.desktopBgImage && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft((p) => ({
                                ...p,
                                hero: { ...p.hero, desktopBgImage: null },
                              }))
                            }
                            className="text-red-500 hover:text-red-700 text-[10px]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {draft.hero.desktopBgImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-[#502D55]/15 bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={draft.hero.desktopBgImage.url}
                            alt="Desktop BG"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-dashed border-[#502D55]/20 flex flex-col items-center justify-center p-3 text-center text-[#7A6880]">
                          <ImageIcon className="w-5 h-5 mb-1 text-[#935073]" />
                          <span className="text-[10px]">Default Obsidian Glow Active</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("hero", "desktopBgImage")}
                        disabled={uploadingSection === "hero"}
                        className="w-full py-1.5 px-3 rounded-lg bg-white border border-[#502D55]/15 text-[11px] font-bold text-[#56475C] hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-[#935073]" />
                        <span>Upload Desktop BG</span>
                      </button>
                    </div>

                    {/* App Mockup / Screenshot Slot */}
                    <div className="p-3.5 rounded-xl border border-[#502D55]/10 bg-[#FAF4F9]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#180D1D]">Hero App Mockup</span>
                        {draft.hero.mockupImage && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft((p) => ({
                                ...p,
                                hero: { ...p.hero, mockupImage: null },
                              }))
                            }
                            className="text-red-500 hover:text-red-700 text-[10px]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {draft.hero.mockupImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-[#502D55]/15 bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={draft.hero.mockupImage.url}
                            alt="Mockup"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-dashed border-[#502D55]/20 flex flex-col items-center justify-center p-3 text-center text-[#7A6880]">
                          <Smartphone className="w-5 h-5 mb-1 text-[#935073]" />
                          <span className="text-[10px]">Default SoundLab Player Mockup</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("hero", "mockupImage")}
                        disabled={uploadingSection === "hero"}
                        className="w-full py-1.5 px-3 rounded-lg bg-white border border-[#502D55]/15 text-[11px] font-bold text-[#56475C] hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-[#935073]" />
                        <span>Upload Hero Mockup</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCREENSHOTS SHOWCASE (8–9 SCREENSHOTS) */}
          {activeTab === "screenshots" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#502D55]/10 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider">
                    App Screenshots Gallery ({draft.screenshots.length} Images)
                  </h3>
                  <p className="text-[11px] text-[#56475C]">
                    Drag-and-drop or upload original 1080x2400 / high-res app screenshots.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerMultiImageUpload("screenshots")}
                    disabled={uploadingSection === "screenshots"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#180D1D] hover:bg-[#2A1532] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Screenshots</span>
                  </button>
                </div>
              </div>

              {/* Screenshots List */}
              <div className="space-y-3">
                {draft.screenshots.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-[#502D55]/12 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] transition-all flex items-center gap-4 text-xs"
                  >
                    {/* Index & Order */}
                    <span className="w-6 h-6 rounded-full bg-white border border-[#502D55]/15 text-[#56475C] font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Thumbnail */}
                    <div className="w-12 h-20 rounded-lg overflow-hidden bg-black/10 border border-[#502D55]/15 shrink-0 flex items-center justify-center">
                      {item.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Smartphone className="w-5 h-5 text-[#935073]" />
                      )}
                    </div>

                    {/* Metadata Inputs */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            screenshots: p.screenshots.map((s) =>
                              s.id === item.id ? { ...s, title: e.target.value } : s
                            ),
                          }))
                        }
                        placeholder="Screenshot title (e.g. 10-Band EQ)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#502D55]/15 bg-white text-xs font-bold text-[#180D1D]"
                      />
                      <input
                        type="text"
                        value={item.caption || ""}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            screenshots: p.screenshots.map((s) =>
                              s.id === item.id ? { ...s, caption: e.target.value } : s
                            ),
                          }))
                        }
                        placeholder="Caption / description"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#502D55]/15 bg-white text-[11px] text-[#56475C]"
                      />
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("screenshots", undefined, item.id)}
                        className="p-1.5 rounded-lg border border-[#502D55]/15 bg-white text-[#56475C] hover:text-[#935073]"
                        title="Replace Image"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveScreenshot(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-[#502D55]/15 bg-white text-[#56475C] hover:text-[#180D1D] disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveScreenshot(index, "down")}
                        disabled={index === draft.screenshots.length - 1}
                        className="p-1.5 rounded-lg border border-[#502D55]/15 bg-white text-[#56475C] hover:text-[#180D1D] disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScreenshot(item.id)}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE SHOWCASE (8 CARDS) */}
          {activeTab === "features" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-5">
              <div className="border-b border-[#502D55]/10 pb-3">
                <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider">
                  Configurable Feature Showcase (8 Modules)
                </h3>
                <p className="text-[11px] text-[#56475C]">
                  Customize headlines, descriptions, custom artwork, and visibility for each WishMusic capability.
                </p>
              </div>

              <div className="space-y-4">
                {draft.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-4 rounded-xl border border-[#502D55]/12 bg-[#FAF4F9]/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#935073]/10 text-[#935073] text-[10px] font-mono font-bold">
                          {feat.badge || feat.key}
                        </span>
                        <h4 className="text-xs font-bold text-[#180D1D]">{feat.title}</h4>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-[#56475C] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={feat.enabled}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              features: p.features.map((f) =>
                                f.id === feat.id ? { ...f, enabled: e.target.checked } : f
                              ),
                            }))
                          }
                          className="rounded text-[#935073] focus:ring-[#935073]"
                        />
                        <span>Visible</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                      <div className="sm:col-span-8 space-y-2">
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              features: p.features.map((f) =>
                                f.id === feat.id ? { ...f, title: e.target.value } : f
                              ),
                            }))
                          }
                          placeholder="Feature Title"
                          className="w-full px-3 py-2 rounded-lg border border-[#502D55]/15 bg-white text-xs font-bold text-[#180D1D]"
                        />
                        <textarea
                          rows={2}
                          value={feat.description}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              features: p.features.map((f) =>
                                f.id === feat.id ? { ...f, description: e.target.value } : f
                              ),
                            }))
                          }
                          placeholder="Technical description"
                          className="w-full px-3 py-2 rounded-lg border border-[#502D55]/15 bg-white text-xs text-[#56475C]"
                        />
                      </div>

                      <div className="sm:col-span-4 flex flex-col justify-between p-2 rounded-lg bg-white border border-[#502D55]/12">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#56475C] mb-1">
                          <span>Custom Graphic</span>
                          {feat.image && (
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft((p) => ({
                                  ...p,
                                  features: p.features.map((f) =>
                                    f.id === feat.id ? { ...f, image: null } : f
                                  ),
                                }))
                              }
                              className="text-red-500 text-[10px]"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {feat.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={feat.image.url}
                            alt={feat.title}
                            className="w-full h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="h-14 rounded border border-dashed border-[#502D55]/20 flex items-center justify-center text-[10px] text-[#7A6880]">
                            Default Vector
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerImageUpload("features", undefined, feat.id)}
                          className="w-full mt-2 py-1 px-2 rounded bg-[#FAF4F9] border border-[#502D55]/15 text-[10px] font-bold text-[#56475C] hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-2.5 h-2.5 text-[#935073]" />
                          <span>Upload Image</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT SECTION */}
          {activeTab === "about" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
                <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider">
                  About WishMusic Editorial Section
                </h3>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#56475C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.about.enabled}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        about: { ...p.about, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-[#935073] focus:ring-[#935073]"
                  />
                  <span>Show Section</span>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={draft.about.heading}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        about: { ...p.about, heading: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs font-bold text-[#180D1D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                    Primary Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={draft.about.description}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        about: { ...p.about, description: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs text-[#56475C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#56475C] mb-1">
                    Secondary Narrative (Architecture / Telemetry Free)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.about.secondaryDescription || ""}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        about: { ...p.about, secondaryDescription: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/15 bg-[#FAF4F9] text-xs text-[#56475C]"
                  />
                </div>

                <div className="pt-2 border-t border-[#502D55]/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Editorial Image */}
                  <div className="p-3.5 rounded-xl border border-[#502D55]/10 bg-[#FAF4F9]/60 space-y-2">
                    <span className="font-semibold text-[#180D1D] block">Editorial Graphic</span>
                    {draft.about.primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={draft.about.primaryImage.url}
                        alt="About Primary"
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-28 rounded-lg border border-dashed border-[#502D55]/20 flex items-center justify-center text-[10px] text-[#7A6880]">
                        Default Waveform Mockup
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => triggerImageUpload("about", "primaryImage")}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-[#502D55]/15 text-[11px] font-bold text-[#56475C] hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3 h-3 text-[#935073]" />
                      <span>Upload Graphic</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WALLPAPER & GALLERY */}
          {activeTab === "gallery" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider">
                    Wallpapers &amp; Promotional Gallery ({draft.gallery.length})
                  </h3>
                  <p className="text-[11px] text-[#56475C]">
                    High-resolution desktop/mobile wallpapers and 3D device renders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerMultiImageUpload("gallery")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#180D1D] hover:bg-[#2A1532] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Wallpapers</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {draft.gallery.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#502D55]/12 bg-[#FAF4F9]/60 space-y-2 text-xs"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/10 border border-[#502D55]/15">
                      {item.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#7A6880]">
                          Concept Wallpaper
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          gallery: p.gallery.map((g) =>
                            g.id === item.id ? { ...g, title: e.target.value } : g
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#502D55]/15 bg-white text-xs font-bold text-[#180D1D]"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => triggerImageUpload("gallery", undefined, item.id)}
                        className="text-[11px] font-semibold text-[#935073] hover:underline"
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGalleryItem(item.id)}
                        className="text-[11px] font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SECTION VISIBILITY */}
          {activeTab === "visibility" && (
            <div className="p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#180D1D] uppercase tracking-wider border-b border-[#502D55]/10 pb-3">
                Global Section Visibility Controls
              </h3>
              <p className="text-xs text-[#56475C]">
                Turn individual sections on or off on the public WishMusic product page.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { key: "hero", label: "1. Hero & Branding Header", desc: "Top headline, logos, and CTA" },
                  { key: "screenshots", label: "2. App Screenshots Showcase", desc: "Phone mockups and interactive lightbox" },
                  { key: "features", label: "3. 8-Module Feature Showcase", desc: "Equalizer, visualizer, RGB, lossless engine cards" },
                  { key: "about", label: "4. About & Editorial Narrative", desc: "Manifesto against bloat and engineering highlights" },
                  { key: "gallery", label: "5. Wallpapers & Concept Gallery", desc: "Downloadable wallpapers and render assets" },
                  { key: "download", label: "6. Verified APK Download Section", desc: "Direct APK button and cryptographic checksums" },
                ].map((sec) => (
                  <label
                    key={sec.key}
                    className="p-3.5 rounded-xl border border-[#502D55]/10 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#180D1D] block">{sec.label}</span>
                      <span className="text-[11px] text-[#7A6880]">{sec.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.visibility[sec.key as keyof SectionVisibility]}
                      onChange={(e) =>
                        updateDraft((p) => ({
                          ...p,
                          visibility: {
                            ...p.visibility,
                            [sec.key]: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-[#935073] focus:ring-[#935073] w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Interactive Live Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="p-4 rounded-2xl bg-[#180D1D] text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D8829D]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F3E8F0]">
                  Interactive Live Preview
                </span>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    previewViewport === "desktop"
                      ? "bg-white text-[#180D1D]"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    previewViewport === "mobile"
                      ? "bg-white text-[#180D1D]"
                      : "text-white/70 hover:text-white"
                  }`}
                  title="Mobile Frame Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Real-time representation of the public website. Updates immediately when you edit text, replace images, or toggle sections.
            </p>
          </div>

          {/* Scaled Preview Frame */}
          <div className="rounded-2xl border border-[#502D55]/15 bg-[#0D0612] p-3 shadow-inner overflow-hidden flex justify-center">
            <div
              className={`transition-all duration-300 origin-top overflow-y-auto rounded-xl bg-[#0D0612] text-white border border-white/10 shadow-2xl ${
                previewViewport === "mobile"
                  ? "w-[340px] max-h-[620px] p-4 text-[10px]"
                  : "w-full max-h-[620px] p-5 text-xs"
              }`}
            >
              {/* MINI HERO */}
              {draft.visibility.hero && draft.hero.enabled && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#1E0E25] via-[#2A1032] to-[#120816] border border-white/10 relative overflow-hidden">
                  <span className="px-2 py-0.5 rounded-full bg-[#935073]/20 text-[#D8829D] text-[9px] font-mono font-bold inline-block mb-2">
                    AUDIO ENGINE // SOUNDLAB
                  </span>
                  <h3 className="font-black text-sm text-white tracking-tight leading-tight mb-1.5">
                    {draft.hero.headline}
                  </h3>
                  <p className="text-[10px] text-[#d8cfc4] line-clamp-3 leading-relaxed mb-3">
                    {draft.hero.subheadline}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white font-bold text-[9px]">
                      {draft.hero.ctaText}
                    </span>
                    <span className="text-[9px] text-[#F6DBC0] font-mono">v1.0.0 Stable</span>
                  </div>
                </div>
              )}

              {/* MINI SCREENSHOTS */}
              {draft.visibility.screenshots && draft.screenshots.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#F6DBC0]">
                    <span>APP SCREENSHOTS</span>
                    <span className="text-[9px] text-white/50">{draft.screenshots.length} Views</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {draft.screenshots.map((s) => (
                      <div
                        key={s.id}
                        className="w-16 h-28 rounded-lg bg-white/5 border border-white/10 shrink-0 overflow-hidden relative flex flex-col justify-end p-1 text-[8px]"
                      >
                        {s.image?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image.url}
                            alt={s.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/40">
                            <Smartphone className="w-4 h-4" />
                          </div>
                        )}
                        <span className="relative z-10 font-bold truncate text-white bg-black/60 px-1 rounded">
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MINI FEATURES */}
              {draft.visibility.features && (
                <div className="mb-6 space-y-2">
                  <span className="text-[10px] font-bold text-[#F6DBC0] block">
                    FEATURE LAB (8 MODULES)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {draft.features
                      .filter((f) => f.enabled)
                      .slice(0, 4)
                      .map((f) => (
                        <div
                          key={f.id}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-[9px]"
                        >
                          <span className="font-bold text-white block truncate">{f.title}</span>
                          <span className="text-[8px] text-[#d8cfc4] line-clamp-2">
                            {f.description}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* MINI DOWNLOAD SECTION */}
              {draft.visibility.download && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 block">
                    OFFICIAL RELEASE READY
                  </span>
                  <span className="font-black text-xs text-white block">Download WishMusic APK</span>
                  <span className="text-[9px] text-white/70 block font-mono">v1.0.0 &bull; 80.42 MB</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
