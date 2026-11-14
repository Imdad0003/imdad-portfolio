"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Search,
  Check,
  Trash2,
  Copy,
  Info,
  Filter,
  ExternalLink,
  AlertTriangle,
  Folder,
} from "lucide-react";
import type { MediaAssetDocument } from "@/types/cms";
import {
  getAllMediaAssetsAdmin,
  saveMediaAssetAdmin,
  deleteMediaAssetAdmin,
} from "@/lib/cms";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: { url: string; alt?: string; name?: string }) => void;
  initialCategory?: MediaAssetDocument["category"] | "all";
  title?: string;
}

const CATEGORIES: Array<{ id: MediaAssetDocument["category"] | "all"; label: string }> = [
  { id: "all", label: "All Assets" },
  { id: "logos", label: "Logos & Icons" },
  { id: "hero", label: "Hero & Visuals" },
  { id: "apps", label: "App Showcases" },
  { id: "projects", label: "Projects & Covers" },
  { id: "services", label: "Services" },
  { id: "general", label: "General Media" },
];

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  initialCategory = "all",
  title = "Media Asset Library",
}: MediaLibraryModalProps) {
  const [assets, setAssets] = useState<MediaAssetDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaAssetDocument["category"] | "all">(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [altTextInput, setAltTextInput] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await getAllMediaAssetsAdmin(
        selectedCategory === "all" ? undefined : selectedCategory
      );
      setAssets(data);
    } catch (err) {
      console.warn("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, selectedCategory]);

  useEffect(() => {
    if (selectedAsset) {
      setAltTextInput(selectedAsset.alt || "");
    }
  }, [selectedAsset]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setActionNotice(null);
    try {
      const category = selectedCategory === "all" ? "general" : selectedCategory;
      const url = await uploadToCloudinary(file, { folder: `studio-assets/${category}` });

      // Measure dimensions if image
      let width: number | undefined;
      let height: number | undefined;

      try {
        const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve({ w: 0, h: 0 });
          img.src = URL.createObjectURL(file);
        });
        if (dimensions.w > 0) {
          width = dimensions.w;
          height = dimensions.h;
        }
      } catch {
        // Fallback
      }

      const newAsset: MediaAssetDocument = {
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url,
        name: file.name.replace(/\.[^/.]+$/, ""),
        alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        category,
        fileSize: file.size,
        format: file.type.split("/")[1] || "png",
        width,
        height,
        createdAt: new Date().toISOString(),
      };

      await saveMediaAssetAdmin(newAsset);
      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      setActionNotice({ type: "success", text: `"${file.name}" uploaded successfully!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionNotice({ type: "error", text: `Upload failed: ${msg}` });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveAlt = async () => {
    if (!selectedAsset) return;
    setSavingAlt(true);
    try {
      const updated = { ...selectedAsset, alt: altTextInput, updatedAt: new Date().toISOString() };
      await saveMediaAssetAdmin(updated);
      setAssets((prev) => prev.map((a) => (a.id === selectedAsset.id ? updated : a)));
      setSelectedAsset(updated);
      setActionNotice({ type: "success", text: "Alt text saved." });
    } catch (err) {
      setActionNotice({ type: "error", text: "Failed to update alt text." });
    } finally {
      setSavingAlt(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    if (!confirm(`Are you sure you want to delete "${selectedAsset.name}"?`)) return;

    setActionNotice(null);
    try {
      const result = await deleteMediaAssetAdmin(selectedAsset.id, selectedAsset.url);
      if (!result.success) {
        setActionNotice({ type: "error", text: result.error || "Cannot delete asset." });
        return;
      }

      setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
      setSelectedAsset(null);
      setActionNotice({ type: "success", text: "Asset safely deleted." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionNotice({ type: "error", text: `Delete failed: ${msg}` });
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.alt && a.alt.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A192F]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-[#0284C7] flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0A192F]">{title}</h2>
              <p className="text-xs text-slate-500">
                Organize, preview, and reuse studio media assets across the website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369A1] transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading to Cloud..." : "Upload New Image"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notices */}
        {actionNotice && (
          <div
            className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
              actionNotice.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{actionNotice.text}</span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shrink-0">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0A192F] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search filename or alt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/40">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading assets...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                <Folder className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-[#0A192F]">No media assets found</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Upload an image to get started. Uploads are hosted directly via Cloudinary CDN and can be reused across all sections.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369A1] transition-all cursor-pointer"
                >
                  Upload First Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group relative rounded-2xl border p-2 cursor-pointer transition-all flex flex-col ${
                        isSelected
                          ? "bg-white border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.alt || asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-[#0A192F]/70 text-white font-mono text-[9px] uppercase backdrop-blur-xs">
                          {asset.format || "img"}
                        </div>
                      </div>
                      <div className="mt-2 flex-1 flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-[#0A192F] truncate block">
                          {asset.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                          <span>{formatFileSize(asset.fileSize)}</span>
                          {asset.width && asset.height && (
                            <span>{asset.width}x{asset.height}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector Panel */}
          {selectedAsset ? (
            <div className="w-80 border-l border-slate-200 p-6 bg-white overflow-y-auto flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Asset Details
                  </h3>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full aspect-video rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.alt || selectedAsset.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Filename</label>
                    <div className="font-bold text-[#0A192F] break-all">{selectedAsset.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block font-mono text-[10px]">Dimensions</span>
                      <span className="font-semibold text-slate-700">
                        {selectedAsset.width && selectedAsset.height
                          ? `${selectedAsset.width} × ${selectedAsset.height} px`
                          : "Auto"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono text-[10px]">File Size</span>
                      <span className="font-semibold text-slate-700">
                        {formatFileSize(selectedAsset.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-0.5">Category</label>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono capitalize">
                      {selectedAsset.category}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Descriptive Alt Text
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={altTextInput}
                        onChange={(e) => setAltTextInput(e.target.value)}
                        placeholder="Describe image for accessibility..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:border-[#0284C7]"
                      />
                      <button
                        onClick={handleSaveAlt}
                        disabled={savingAlt || altTextInput === selectedAsset.alt}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0A192F] font-bold text-xs disabled:opacity-50 cursor-pointer"
                      >
                        {savingAlt ? "..." : "Save"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Public URL</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={selectedAsset.url}
                        className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 truncate"
                      />
                      <button
                        onClick={() => handleCopy(selectedAsset.url)}
                        title="Copy URL"
                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={selectedAsset.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in new tab"
                        className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {onSelect && (
                  <button
                    onClick={() => {
                      onSelect({
                        url: selectedAsset.url,
                        alt: selectedAsset.alt,
                        name: selectedAsset.name,
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Choose This Image</span>
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset Safely</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-80 border-l border-slate-200 p-6 bg-slate-50/60 hidden md:flex flex-col items-center justify-center text-center text-slate-400">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-600">No Asset Selected</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Click any thumbnail on the left to inspect file metadata, edit alt text, or insert into your section.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
