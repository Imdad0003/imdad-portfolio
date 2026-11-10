"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { uploadStudioAsset } from "@/lib/storage";
import {
  AmazonListingSample,
  APlusModuleSample,
  AmazonPricingPackage,
  ListingImageItem,
  ListingImageType,
  APlusModuleType,
} from "@/types/amazon-portfolio";
import {
  amazonListingSamples,
  aPlusContentSamples,
  amazonPricingPackages,
} from "@/data/amazonListingData";
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Upload,
  CheckCircle2,
  RefreshCw,
  Eye,
  Layers,
  Save,
  Tag,
  ExternalLink,
  Sliders,
  Check,
  AlertCircle,
  X,
} from "lucide-react";

interface AmazonPortfolioManagerProps {
  currentUser: User | null;
}

export function AmazonPortfolioManager({ currentUser }: AmazonPortfolioManagerProps) {
  // Tabs: "listings" | "aplus" | "packages"
  const [activeTab, setActiveTab] = useState<"listings" | "aplus" | "packages">("listings");

  // Data states
  const [samples, setSamples] = useState<AmazonListingSample[]>(amazonListingSamples);
  const [aplusModules, setAplusModules] = useState<APlusModuleSample[]>(aPlusContentSamples);
  const [packages, setPackages] = useState<AmazonPricingPackage[]>(amazonPricingPackages);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Listing Modal
  const [editingSample, setEditingSample] = useState<Partial<AmazonListingSample> | null>(null);

  // Edit A+ Module Modal
  const [editingModule, setEditingModule] = useState<Partial<APlusModuleSample> | null>(null);

  // Edit Package Modal
  const [editingPackage, setEditingPackage] = useState<Partial<AmazonPricingPackage> | null>(null);

  const notify = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch data from Firestore with static defaults fallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (db) {
        // 1. Fetch Listings
        const snap = await getDocs(query(collection(db, "amazonListings"), orderBy("sortOrder", "asc")));
        if (!snap.empty) {
          setSamples(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AmazonListingSample)));
        } else {
          setSamples(amazonListingSamples);
        }

        // 2. Fetch A+ Modules
        const aplusSnap = await getDocs(query(collection(db, "amazonAPlusModules"), orderBy("sortOrder", "asc")));
        if (!aplusSnap.empty) {
          setAplusModules(aplusSnap.docs.map((d) => ({ id: d.id, ...d.data() } as APlusModuleSample)));
        } else {
          setAplusModules(aPlusContentSamples);
        }

        // 3. Fetch Packages
        const pkgSnap = await getDocs(query(collection(db, "amazonPackages"), orderBy("price", "asc")));
        if (!pkgSnap.empty) {
          setPackages(pkgSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AmazonPricingPackage)));
        } else {
          setPackages(amazonPricingPackages);
        }
      }
    } catch (err) {
      console.warn("Notice: Firestore fetch fallback to local defaults:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Seed Defaults to Firestore
  const handleSeedDefaults = async () => {
    if (!db) return;
    if (!confirm("Populate Firestore with default Amazon Listing sample sets and A+ modules?")) return;
    setSaving(true);
    try {
      for (const s of amazonListingSamples) {
        await setDoc(doc(db, "amazonListings", s.id), s, { merge: true });
      }
      for (const m of aPlusContentSamples) {
        await setDoc(doc(db, "amazonAPlusModules", m.id), m, { merge: true });
      }
      for (const p of amazonPricingPackages) {
        await setDoc(doc(db, "amazonPackages", p.id), p, { merge: true });
      }
      notify("success", "Successfully synchronized default Amazon portfolio to Firestore!");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Seed failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Upload image helper
  const handleUploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const url = await uploadStudioAsset(file, "services");
      return url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      alert(`Storage Upload Error: ${msg}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Listing Sample
  const handleSaveListingSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSample || !editingSample.id || !editingSample.title) {
      alert("Sample ID and Title are required.");
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: AmazonListingSample = {
        id: editingSample.id.trim(),
        title: editingSample.title.trim(),
        brand: editingSample.brand?.trim() || "Studio Brand",
        category: editingSample.category?.trim() || "General",
        badge: editingSample.badge?.trim() || undefined,
        summary: editingSample.summary?.trim() || "",
        coverImage: editingSample.coverImage?.trim() || editingSample.images?.[0]?.url || "",
        highlights: editingSample.highlights || [],
        images: editingSample.images || [],
        sortOrder: typeof editingSample.sortOrder === "number" ? editingSample.sortOrder : samples.length + 1,
        featured: Boolean(editingSample.featured),
        updatedAt: now,
        createdAt: editingSample.createdAt || now,
      };

      if (db) {
        await setDoc(doc(db, "amazonListings", payload.id), payload, { merge: true });
      }

      setSamples((prev) => {
        const idx = prev.findIndex((s) => s.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [...prev, payload];
      });

      setEditingSample(null);
      notify("success", `Listing sample "${payload.title}" saved successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Failed to save sample: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete Listing Sample
  const handleDeleteSample = async (id: string) => {
    if (!confirm(`Delete listing sample "${id}"?`)) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "amazonListings", id));
      }
      setSamples((prev) => prev.filter((s) => s.id !== id));
      notify("success", "Sample removed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Delete failed: ${msg}`);
    }
  };

  // Save A+ Module
  const handleSaveAPlusModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editingModule.id || !editingModule.title) {
      alert("Module ID and Title are required.");
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: APlusModuleSample = {
        id: editingModule.id.trim(),
        brandName: editingModule.brandName?.trim() || "Brand Story",
        productTitle: editingModule.productTitle?.trim() || "Product Showcase",
        category: editingModule.category?.trim() || "Standard Module",
        moduleType: editingModule.moduleType || "header_banner",
        bannerUrl: editingModule.bannerUrl?.trim() || "",
        title: editingModule.title.trim(),
        subtitle: editingModule.subtitle?.trim() || undefined,
        description: editingModule.description?.trim() || "",
        features: editingModule.features || [],
        comparisonItems: editingModule.comparisonItems || [],
        sortOrder: typeof editingModule.sortOrder === "number" ? editingModule.sortOrder : aplusModules.length + 1,
        updatedAt: now,
        createdAt: editingModule.createdAt || now,
      };

      if (db) {
        await setDoc(doc(db, "amazonAPlusModules", payload.id), payload, { merge: true });
      }

      setAplusModules((prev) => {
        const idx = prev.findIndex((m) => m.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [...prev, payload];
      });

      setEditingModule(null);
      notify("success", `A+ module "${payload.title}" saved successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Failed to save module: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete A+ Module
  const handleDeleteModule = async (id: string) => {
    if (!confirm(`Delete A+ module "${id}"?`)) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "amazonAPlusModules", id));
      }
      setAplusModules((prev) => prev.filter((m) => m.id !== id));
      notify("success", "Module removed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notify("error", `Delete failed: ${msg}`);
    }
  };

  // Reorder sample
  const moveSample = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= samples.length) return;
    const reordered = [...samples];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const updated = reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setSamples(updated);

    if (db) {
      for (const item of updated) {
        await setDoc(doc(db, "amazonListings", item.id), { sortOrder: item.sortOrder }, { merge: true });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#502D55]/12 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              PORTFOLIO CMS // AMAZON LISTINGS &amp; A+ CONTENT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#180D1D]">
            Amazon Listing &amp; A+ Content Manager
          </h2>
          <p className="text-xs text-[#56475C] mt-0.5">
            Add, update, reorder sample variations and A+ module banners. Changes dynamically sync to <code>/services/amazon-listing</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF4F9] text-[#935073] border border-[#502D55]/15 hover:bg-[#F3E5EE] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Seed 10+ samples & modules to Firestore"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Seed Portfolio Defaults</span>
          </button>

          <Link
            href="/services/amazon-listing"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Showcase</span>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#502D55]/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "listings"
              ? "bg-[#180D1D] text-white shadow-xs"
              : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Product Listing Samples ({samples.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("aplus")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "aplus"
              ? "bg-[#180D1D] text-white shadow-xs"
              : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>A+ Content Modules ({aplusModules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "packages"
              ? "bg-[#180D1D] text-white shadow-xs"
              : "bg-white text-[#56475C] border border-[#502D55]/15 hover:bg-[#FAF4F9]"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Packages &amp; Pricing ({packages.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT LISTING SAMPLES MANAGER */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#180D1D]">
                Amazon Product Listing Variations ({samples.length} Sets)
              </h3>
              <p className="text-xs text-[#56475C]">
                Each sample displays product title, category, and 7–9 interactive gallery images with full Lightbox.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditingSample({
                  id: `listing_${Date.now()}`,
                  title: "",
                  brand: "",
                  category: "Audio & Wearables",
                  badge: "Amazon Choice",
                  summary: "",
                  coverImage: "",
                  highlights: [
                    "Pure White Hero (100% Amazon RGB 255)",
                    "A9 SEO Optimized Title & Bullets",
                    "Dimensions & Sizing Infographic",
                  ],
                  images: [],
                  sortOrder: samples.length + 1,
                  featured: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Sample Set</span>
            </button>
          </div>

          {/* Listing Samples Table */}
          <div className="bg-white rounded-2xl border border-[#502D55]/12 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Product / Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Images</th>
                  <th className="py-3 px-4">Badge</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#502D55]/10">
                {samples.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-[#FAF4F9]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#56475C]">
                      <div className="flex items-center gap-1">
                        <span>{idx + 1}</span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSample(idx, "up")}
                            className="text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === samples.length - 1}
                            onClick={() => moveSample(idx, "down")}
                            className="text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-[#502D55]/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.coverImage || s.images?.[0]?.url || "/favicon.png"}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#180D1D] truncate max-w-xs">{s.title}</div>
                          <div className="text-[10px] font-mono text-[#7A6880]">{s.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                        {s.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-[#0284C7]">
                      {s.images?.length || 0} Images
                    </td>

                    <td className="py-3 px-4">
                      {s.badge ? (
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {s.badge}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingSample(s)}
                          className="p-1.5 rounded-lg border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                          title="Edit Sample & Gallery"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSample(s.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Sample"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: A+ CONTENT MODULES MANAGER */}
      {activeTab === "aplus" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#180D1D]">
                Amazon A+ Content (EBC) Modules ({aplusModules.length} Modules)
              </h3>
              <p className="text-xs text-[#56475C]">
                Manage stacked banners: Header Banners, Brand Story, 4-Image Quad, Split Features, and Comparison Tables.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditingModule({
                  id: `aplus_${Date.now()}`,
                  brandName: "",
                  productTitle: "",
                  category: "Enhanced Brand Content",
                  moduleType: "header_banner",
                  bannerUrl: "",
                  title: "",
                  subtitle: "",
                  description: "",
                  features: [],
                  sortOrder: aplusModules.length + 1,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add A+ Module</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aplusModules.map((mod, idx) => (
              <div
                key={mod.id}
                className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 uppercase">
                      {mod.moduleType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Order: {idx + 1}</span>
                  </div>

                  <h4 className="font-bold text-sm text-[#180D1D] leading-snug">{mod.title}</h4>
                  <p className="text-[11px] text-[#7A6880] font-mono">{mod.brandName} &bull; {mod.productTitle}</p>
                  <p className="text-xs text-[#56475C] line-clamp-2">{mod.description}</p>

                  {mod.bannerUrl && (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mod.bannerUrl} alt={mod.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#502D55]/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Features: {mod.features?.length || 0} &bull; Comp Rows: {mod.comparisonItems?.length || 0}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingModule(mod)}
                      className="p-1.5 rounded-lg border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PACKAGES & PRICING */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#180D1D]">
              Amazon Commercial Pricing Packages ({packages.length} Tiers)
            </h3>
            <p className="text-xs text-[#56475C]">
              Basic (₹499), Premium (₹799), Brand Package (₹999), and Full A+ Content (₹1,699).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200">
                      {pkg.badge || "Standard"}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{pkg.turnaround}</span>
                  </div>

                  <h4 className="font-black text-[#180D1D] text-base">{pkg.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#180D1D]">{pkg.priceDisplay}</span>
                    <span className="text-[11px] text-[#7A6880]">{pkg.unit}</span>
                  </div>

                  <p className="text-xs text-[#56475C]">{pkg.tagline}</p>

                  <ul className="space-y-1 text-xs text-[#56475C] pt-2 border-t border-slate-100">
                    {pkg.deliverables.slice(0, 4).map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-[#0284C7] shrink-0" />
                        <span className="truncate">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#502D55]/10">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(pkg)}
                    className="w-full py-2 rounded-xl border border-[#502D55]/15 text-xs font-bold text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer text-center"
                  >
                    Edit Package Scope &amp; Price
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EDIT LISTING SAMPLE & GALLERY */}
      {editingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
              <h3 className="text-base font-bold text-[#180D1D]">
                {editingSample.title ? `Edit: ${editingSample.title}` : "Add New Listing Sample Set"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSample(null)}
                className="text-xs text-gray-500 hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveListingSample} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Sample ID *</label>
                  <input
                    type="text"
                    required
                    value={editingSample.id || ""}
                    onChange={(e) => setEditingSample({ ...editingSample, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    placeholder="e.g. anc-earbuds-sample"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Brand Name</label>
                  <input
                    type="text"
                    value={editingSample.brand || ""}
                    onChange={(e) => setEditingSample({ ...editingSample, brand: e.target.value })}
                    placeholder="e.g. AuraWave Labs"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingSample.title || ""}
                  onChange={(e) => setEditingSample({ ...editingSample, title: e.target.value })}
                  placeholder="e.g. AuraWave Pro ANC Wireless Earbuds (Spatial Audio)"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Category</label>
                  <input
                    type="text"
                    value={editingSample.category || ""}
                    onChange={(e) => setEditingSample({ ...editingSample, category: e.target.value })}
                    placeholder="e.g. Audio & Wearables, Kitchen, Tech"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    value={editingSample.badge || ""}
                    onChange={(e) => setEditingSample({ ...editingSample, badge: e.target.value })}
                    placeholder="e.g. Amazon Choice, Bestseller, Trending"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">Summary Description</label>
                <textarea
                  rows={3}
                  value={editingSample.summary || ""}
                  onChange={(e) => setEditingSample({ ...editingSample, summary: e.target.value })}
                  placeholder="Describe the conversion strategy and key buyer objections answered in this deck..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              {/* Multiple Gallery Images (7–9 Images) */}
              <div className="p-4 rounded-2xl bg-[#FAF4F9]/60 border border-[#502D55]/12 space-y-3">
                <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-2">
                  <span className="font-bold text-[#180D1D] text-xs">
                    Listing Gallery Images ({editingSample.images?.length || 0} Creatives)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newImg: ListingImageItem = {
                        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        url: "",
                        type: "infographic",
                        label: "Feature Infographic",
                        caption: "",
                      };
                      setEditingSample((prev) => ({
                        ...prev,
                        images: [...(prev?.images || []), newImg],
                      }));
                    }}
                    className="text-[11px] font-bold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Image Slot</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {editingSample.images?.map((img, iIdx) => (
                    <div
                      key={img.id || iIdx}
                      className="p-2.5 rounded-xl bg-white border border-[#502D55]/10 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">#{iIdx + 1}</span>
                        <select
                          value={img.type}
                          onChange={(e) => {
                            const val = e.target.value as ListingImageType;
                            const nextImgs = [...(editingSample.images || [])];
                            nextImgs[iIdx] = { ...nextImgs[iIdx], type: val };
                            setEditingSample({ ...editingSample, images: nextImgs });
                          }}
                          className="px-2 py-1 rounded bg-[#FAF4F9] border border-slate-200 text-[10px] font-mono"
                        >
                          <option value="hero">hero</option>
                          <option value="infographic">infographic</option>
                          <option value="dimension">dimension</option>
                          <option value="lifestyle">lifestyle</option>
                          <option value="comparison">comparison</option>
                          <option value="detail">detail</option>
                          <option value="packaging">packaging</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const nextImgs = (editingSample.images || []).filter((_, idx) => idx !== iIdx);
                            setEditingSample({ ...editingSample, images: nextImgs });
                          }}
                          className="text-red-500 hover:text-red-700 text-[10px]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={img.url}
                          onChange={(e) => {
                            const nextImgs = [...(editingSample.images || [])];
                            nextImgs[iIdx] = { ...nextImgs[iIdx], url: e.target.value };
                            setEditingSample({ ...editingSample, images: nextImgs });
                          }}
                          placeholder="Image URL or upload"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#FAF4F9] border border-slate-200 text-[11px]"
                        />

                        <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer shrink-0 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingImage ? "..." : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await handleUploadImage(f);
                                if (url) {
                                  const nextImgs = [...(editingSample.images || [])];
                                  nextImgs[iIdx] = { ...nextImgs[iIdx], url };
                                  setEditingSample({ ...editingSample, images: nextImgs });
                                }
                              }
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        value={img.label}
                        onChange={(e) => {
                          const nextImgs = [...(editingSample.images || [])];
                          nextImgs[iIdx] = { ...nextImgs[iIdx], label: e.target.value };
                          setEditingSample({ ...editingSample, images: nextImgs });
                        }}
                        placeholder="Label / Title (e.g. Dimensions & Sizing)"
                        className="w-full px-2.5 py-1 rounded bg-[#FAF4F9] border border-slate-200 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#502D55]/10">
                <button
                  type="button"
                  onClick={() => setEditingSample(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] hover:bg-[#2B1435] text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Listing Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT A+ MODULE */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
              <h3 className="text-base font-bold text-[#180D1D]">
                {editingModule.title ? `Edit A+ Module: ${editingModule.title}` : "Add New A+ Module"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="text-xs text-gray-500 hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveAPlusModule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Module ID *</label>
                  <input
                    type="text"
                    required
                    value={editingModule.id || ""}
                    onChange={(e) => setEditingModule({ ...editingModule, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    placeholder="e.g. aplus-brand-story"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Module Type</label>
                  <select
                    value={editingModule.moduleType || "header_banner"}
                    onChange={(e) => setEditingModule({ ...editingModule, moduleType: e.target.value as APlusModuleType })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono text-[11px]"
                  >
                    <option value="header_banner">header_banner</option>
                    <option value="brand_story">brand_story</option>
                    <option value="four_image_quad">four_image_quad</option>
                    <option value="split_feature">split_feature</option>
                    <option value="comparison_table">comparison_table</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Module Title *</label>
                <input
                  type="text"
                  required
                  value={editingModule.title || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  placeholder="e.g. From Our Own Inventory to Your Brand's Catalog"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">Banner Image URL / Upload</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingModule.bannerUrl || ""}
                    onChange={(e) => setEditingModule({ ...editingModule, bannerUrl: e.target.value })}
                    placeholder="https://... or upload banner"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] text-xs font-bold cursor-pointer hover:bg-[#F3E5D8] shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          if (url) setEditingModule((prev) => ({ ...prev, bannerUrl: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingModule.description || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#502D55]/10">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] hover:bg-[#2B1435] text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save A+ Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PACKAGE */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-3">
              <h3 className="text-base font-bold text-[#180D1D]">Configure Package: {editingPackage.name}</h3>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="text-xs text-gray-500 hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingPackage || !editingPackage.id) return;
                setSaving(true);
                try {
                  const payload = editingPackage as AmazonPricingPackage;
                  if (db) {
                    await setDoc(doc(db, "amazonPackages", payload.id), payload, { merge: true });
                  }
                  setPackages((prev) => prev.map((p) => (p.id === payload.id ? payload : p)));
                  setEditingPackage(null);
                  notify("success", `Package "${payload.name}" updated.`);
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  notify("error", `Failed: ${msg}`);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Package Name</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.name || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#56475C] mb-1 font-bold">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingPackage.price || 0}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setEditingPackage({ ...editingPackage, price: p, priceDisplay: `₹${p.toLocaleString("en-IN")}` });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingPackage.tagline || ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">Turnaround Timeline</label>
                <input
                  type="text"
                  value={editingPackage.turnaround || ""}
                  onChange={(e) => setEditingPackage({ ...editingPackage, turnaround: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#56475C] mb-1">
                  Deliverables (one per line)
                </label>
                <textarea
                  rows={5}
                  value={(editingPackage.deliverables || []).join("\n")}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      deliverables: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#502D55]/10">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] hover:bg-[#2B1435] text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
