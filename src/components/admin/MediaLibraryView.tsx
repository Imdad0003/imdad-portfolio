"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { User } from "firebase/auth";
import {
  Upload,
  Search,
  Check,
  Trash2,
  Copy,
  Info,
  ExternalLink,
  AlertTriangle,
  Folder,
  Grid,
  List,
  RefreshCw,
  Plus,
  X,
  FileImage,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import type { MediaAssetDocument } from "@/types/cms";
import {
  getAllMediaAssetsAdmin,
  saveMediaAssetAdmin,
  deleteMediaAssetAdmin,
  checkAssetUsage,
} from "@/lib/cms";
import { uploadMediaAssetToCloudinary } from "@/lib/cloudinary";

interface MediaLibraryViewProps {
  currentUser?: User | null;
}

const CATEGORIES: Array<{
  id: MediaAssetDocument["category"] | "all";
  label: string;
}> = [
  { id: "all", label: "All Assets" },
  { id: "logos", label: "Logos & Icons" },
  { id: "hero", label: "Hero & Visuals" },
  { id: "apps", label: "App Showcases" },
  { id: "projects", label: "Projects & Covers" },
  { id: "services", label: "Services" },
  { id: "general", label: "General Media" },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function MediaLibraryView({ currentUser }: MediaLibraryViewProps) {
  const [assets, setAssets] = useState<MediaAssetDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    MediaAssetDocument["category"] | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetDocument | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Inspector / drawer editing
  const [altTextInput, setAltTextInput] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    loading: boolean;
    inUse: boolean;
    locations: string[];
  } | null>(null);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] =
    useState<MediaAssetDocument["category"]>("general");
  const [uploadAltText, setUploadAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assets
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
    queueMicrotask(() => {
      void loadAssets();
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedAsset) {
      queueMicrotask(() => {
        setAltTextInput(selectedAsset.alt || "");
        setUsageInfo(null);
      });
    }
  }, [selectedAsset]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setActionNotice({
        type: "error",
        text: "File exceeds 20MB limit. Please optimize or compress the asset.",
      });
      return;
    }

    setUploading(true);
    setActionNotice(null);

    try {
      const uploadResult = await uploadMediaAssetToCloudinary(file, {
        folder: `studio-assets/${uploadCategory}`,
      });
      const rawFmt = uploadResult.format || file.type.split("/")[1] || "png";
      const normalizedFmt = rawFmt.toLowerCase().includes("svg") ? "svg" : rawFmt.toLowerCase();
      const newAsset: Partial<MediaAssetDocument> & { id: string } = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        category: uploadCategory,
        alt: uploadAltText || file.name.replace(/\.[^/.]+$/, ""),
        format: normalizedFmt,
        fileSize: uploadResult.bytes || file.size,
        createdAt: new Date().toISOString(),
      };

      await saveMediaAssetAdmin(newAsset);
      setActionNotice({
        type: "success",
        text: `Uploaded "${file.name}" to Cloudinary successfully.`,
      });
      setShowUploadModal(false);
      setUploadAltText("");
      await loadAssets();
    } catch (err) {
      console.error("Upload error:", err);
      setActionNotice({
        type: "error",
        text: "Failed to upload asset to Cloudinary. Verify connection.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  // Save updated alt text
  const handleSaveAltText = async () => {
    if (!selectedAsset) return;
    setSavingAlt(true);
    try {
      await saveMediaAssetAdmin({
        ...selectedAsset,
        alt: altTextInput,
      });
      setSelectedAsset({ ...selectedAsset, alt: altTextInput });
      setActionNotice({
        type: "success",
        text: "Asset alt text updated successfully.",
      });
      await loadAssets();
    } catch {
      setActionNotice({
        type: "error",
        text: "Could not save updated alt text.",
      });
    } finally {
      setSavingAlt(false);
    }
  };

  // Inspect usage
  const handleCheckUsage = async () => {
    if (!selectedAsset) return;
    setUsageInfo({ loading: true, inUse: false, locations: [] });
    try {
      const res = await checkAssetUsage(selectedAsset.url);
      setUsageInfo({ loading: false, inUse: res.inUse, locations: res.locations });
    } catch {
      setUsageInfo({ loading: false, inUse: false, locations: [] });
    }
  };

  // Delete asset
  const handleDeleteAsset = async (asset: MediaAssetDocument) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      let res = await deleteMediaAssetAdmin(asset.id, asset.url);
      if (
        !res.success &&
        res.error?.includes("Still used in") &&
        window.confirm(`${res.error}\n\nDelete from Media Library anyway?`)
      ) {
        res = await deleteMediaAssetAdmin(asset.id, asset.url, { force: true });
      }
      if (res.success) {
        setActionNotice({
          type: "success",
          text: res.warning || `Asset "${asset.name}" removed from library.`,
        });
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null);
        }
        await loadAssets();
      } else {
        setActionNotice({
          type: "error",
          text: res.error || "Cannot delete asset while referenced in content.",
        });
      }
    } catch {
      setActionNotice({
        type: "error",
        text: "Failed to delete media asset.",
      });
    }
  };

  // Filter assets by search query
  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      asset.name?.toLowerCase().includes(q) ||
      asset.alt?.toLowerCase().includes(q) ||
      asset.category?.toLowerCase().includes(q) ||
      asset.url?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Media Asset Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Central CDN Media Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store, categorize, inspect usage, and distribute high-resolution
            images across IMDAD.BUILDS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadAssets()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                loading ? "animate-spin text-[#0284C7]" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
            actionNotice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Control Bar: Categories, Search & View Toggle */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Layout toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset name, alt description, or URL..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {filteredAssets.length} asset{filteredAssets.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#0A192F] shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#0A192F] shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Asset Showcase & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Asset Grid or List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0284C7]" />
              <span className="text-xs font-mono">Loading assets from Cloudinary...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-8">
              <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0A192F]">
                No media assets found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No files match your search criteria. Try a different query."
                  : "Upload high-resolution photography, logos, and product mockups to build your library."}
              </p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0284C7] bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Asset</span>
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`rounded-xl bg-white border overflow-hidden transition-all cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-sm"
                        : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <Image
                        src={asset.url}
                        alt={asset.alt || asset.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-white/90 text-slate-700 backdrop-blur-xs border border-slate-200/80">
                        {asset.category}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <div className="text-xs font-bold text-[#0A192F] truncate">
                        {asset.name}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                        <span>{formatBytes(asset.fileSize || 0)}</span>
                        {asset.width && asset.height && (
                          <span>
                            {asset.width}×{asset.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Mode */
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Name / Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <tr
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSelected ? "bg-sky-50/60" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                              <Image
                                src={asset.url}
                                alt={asset.alt || asset.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#0A192F]">
                            <div>{asset.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                              {asset.alt || asset.url}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {asset.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                            {formatBytes(asset.fileSize || 0)}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(asset.url);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#0284C7] rounded-md transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Asset Inspector Drawer (1 col) */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs sticky top-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#0284C7]" />
              <span>Asset Inspector</span>
            </h3>
            {selectedAsset && (
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {!selectedAsset ? (
            <div className="py-12 text-center text-slate-400">
              <FileImage className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-xs font-semibold">Select an asset</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Click any thumbnail to inspect dimensions, edit metadata, check
                usage, or copy its CDN link.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={selectedAsset.url}
                  alt={selectedAsset.alt || selectedAsset.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Title and metadata */}
              <div>
                <h4 className="text-sm font-bold text-[#0A192F] truncate">
                  {selectedAsset.name}
                </h4>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedAsset.id}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Dimensions
                  </span>
                  <span className="font-bold text-slate-700">
                    {selectedAsset.width && selectedAsset.height
                      ? `${selectedAsset.width} × ${selectedAsset.height} px`
                      : "Scalable"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    File Size
                  </span>
                  <span className="font-bold text-slate-700">
                    {formatBytes(selectedAsset.fileSize || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Format
                  </span>
                  <span className="font-bold uppercase text-slate-700">
                    {selectedAsset.format || "Web Image"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Category
                  </span>
                  <span className="font-bold capitalize text-slate-700">
                    {selectedAsset.category}
                  </span>
                </div>
              </div>

              {/* Alt Text Updater */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Accessible Alt Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={altTextInput}
                    onChange={(e) => setAltTextInput(e.target.value)}
                    placeholder="Describe image for SEO and screen readers..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAltText}
                    disabled={savingAlt}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0052cc] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingAlt ? "..." : "Save"}
                  </button>
                </div>
              </div>

              {/* Usage Inspector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Content Dependencies
                  </span>
                  <button
                    type="button"
                    onClick={handleCheckUsage}
                    className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                  >
                    Check Usage
                  </button>
                </div>

                {usageInfo && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    {usageInfo.loading ? (
                      <span className="text-slate-400">Scanning CMS...</span>
                    ) : usageInfo.inUse ? (
                      <div className="text-amber-700 space-y-1">
                        <div className="font-bold">
                          In Use across {usageInfo.locations.length} section(s):
                        </div>
                        <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                          {usageInfo.locations.map((loc, idx) => (
                            <li key={idx}>{loc}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        Not referenced in any active section. Safe to delete.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0A192F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied CDN Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Public CDN Link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Raw</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(selectedAsset)}
                    className="py-2 px-3 rounded-xl text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal Dialog */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0284C7]" />
                <span>Upload Media Asset</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Target Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) =>
                    setUploadCategory(
                      e.target.value as MediaAssetDocument["category"]
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                >
                  <option value="general">General Media</option>
                  <option value="logos">Logos & Icons</option>
                  <option value="hero">Hero & Visuals</option>
                  <option value="apps">App Showcases</option>
                  <option value="projects">Projects & Covers</option>
                  <option value="services">Services</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Accessible Description (Alt Text)
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g., WishMusic dynamic playlist screenshot..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-[#0284C7] rounded-xl p-8 text-center bg-slate-50 hover:bg-sky-50/50 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-[#0A192F]">
                  Click or drag file to upload
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  PNG, JPG, WebP, SVG up to 20MB
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileUpload(file);
                  }}
                />
              </div>

              {uploading && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#0284C7] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudinary CDN...</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
