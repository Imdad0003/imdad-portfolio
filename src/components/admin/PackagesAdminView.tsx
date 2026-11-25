"use client";

import React, { useState } from "react";
import type { WebsitePackageDocument } from "@/types/cms";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Check,
  Loader2,
  Package,
} from "lucide-react";

interface PackagesAdminViewProps {
  packages: WebsitePackageDocument[];
  onToggleActive: (pkg: WebsitePackageDocument) => Promise<void>;
  onDeletePackage: (id: string) => Promise<void>;
  onSavePackage: (pkg: Partial<WebsitePackageDocument>) => Promise<void>;
}

export function PackagesAdminView({
  packages,
  onToggleActive,
  onDeletePackage,
  onSavePackage,
}: PackagesAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPackage, setEditingPackage] = useState<Partial<WebsitePackageDocument> | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = packages.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.websiteType.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setEditingPackage({
      id: `pkg_${Date.now()}`,
      name: "",
      websiteType: "Commercial Package",
      price: 1999,
      priceType: "fixed",
      unit: "3–5 Days",
      description: "",
      features: [],
      ctaText: "Book Package",
      badge: null,
      recommended: false,
      active: true,
      sortOrder: packages.length,
      published: true,
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeletePackage(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveModal = async () => {
    if (!editingPackage || !editingPackage.name?.trim()) {
      alert("Please enter a Package Name.");
      return;
    }
    setSaving(true);
    try {
      await onSavePackage(editingPackage);
      setEditingPackage(null);
    } catch {
      // handled by parent toast/alert
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-[#332924]">Pricing Packages</h2>
          <p className="text-xs text-[#6E625B]">
            Customize package prices, ranges, badges, button labels, and included features.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package Plan</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E8DFD5] shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A7C75] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages by name, category, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#332924] focus:outline-none focus:border-[#C96A50]"
          />
        </div>
      </div>

      {/* Packages Table */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center space-y-2">
          <Package className="w-8 h-8 text-[#8A7C75] mx-auto" />
          <p className="text-sm font-bold text-[#332924]">No pricing packages yet</p>
          <p className="text-xs text-[#6E625B]">Click &quot;Add Package Plan&quot; to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFD5] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2] text-[10px] font-mono uppercase tracking-wider text-[#8A7C75]">
                  <th className="py-3.5 px-5 font-bold">Package</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Pricing</th>
                  <th className="py-3.5 px-4 font-bold">Features</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECE4] text-xs">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2 font-bold text-[#332924]">
                        <span>{pkg.name}</span>
                        {pkg.recommended && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      {pkg.badge && (
                        <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold">
                          {pkg.badge}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#5F534D]">{pkg.websiteType}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#332924]">
                      {pkg.priceType === "range" && pkg.priceMax
                        ? `₹${pkg.price.toLocaleString("en-IN")} – ₹${pkg.priceMax.toLocaleString("en-IN")}`
                        : `${pkg.priceType === "starting" ? "From " : ""}₹${pkg.price.toLocaleString("en-IN")}`}
                      <div className="text-[10px] font-normal text-[#8A7C75]">{pkg.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5F534D]">
                      {pkg.features?.length || 0} deliverables
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => void onToggleActive(pkg)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${
                          pkg.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {pkg.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{pkg.active ? "Active" : "Paused"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPackage({ ...pkg })}
                          className="p-1.5 rounded-lg text-[#5F534D] hover:text-[#332924] hover:bg-[#FAF7F2] border border-[#E8DFD5] cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(pkg.id)}
                          disabled={deletingId === pkg.id}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer disabled:opacity-50"
                          title="Delete Package"
                        >
                          {deletingId === pkg.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
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

      {/* Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#332924]/45 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-[#E8DFD5] shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
              <h3 className="font-display font-bold text-base text-[#332924]">
                {editingPackage.name ? `Edit: ${editingPackage.name}` : "New Pricing Package"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="p-1.5 rounded-lg text-[#6E625B] hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Package Name *</label>
                  <input
                    type="text"
                    value={editingPackage.name || ""}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    placeholder="e.g., Amazon Listing Pro"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingPackage.websiteType || ""}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, websiteType: e.target.value })
                    }
                    placeholder="e.g., Commercial Package"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Price Type</label>
                  <select
                    value={editingPackage.priceType || "fixed"}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        priceType: e.target.value as WebsitePackageDocument["priceType"],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="starting">Starting From</option>
                    <option value="range">Price Range</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Price (INR)</label>
                  <input
                    type="number"
                    value={editingPackage.price ?? 0}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, price: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                  />
                </div>
                {editingPackage.priceType === "range" ? (
                  <div>
                    <label className="font-bold text-[#332924] block mb-1">Max Price (INR)</label>
                    <input
                      type="number"
                      value={editingPackage.priceMax ?? ""}
                      onChange={(e) =>
                        setEditingPackage({
                          ...editingPackage,
                          priceMax: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-[#332924] block mb-1">Turnaround / Unit</label>
                    <input
                      type="text"
                      value={editingPackage.unit || ""}
                      onChange={(e) =>
                        setEditingPackage({ ...editingPackage, unit: e.target.value })
                      }
                      placeholder="48 Hours / per project"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Badge Label</label>
                  <select
                    value={editingPackage.badge || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        badge: (e.target.value || null) as WebsitePackageDocument["badge"],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  >
                    <option value="">None</option>
                    <option value="Popular">Popular</option>
                    <option value="Best Value">Best Value</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Starter">Starter</option>
                    <option value="Brand Story">Brand Story</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Button CTA Label</label>
                  <input
                    type="text"
                    value={editingPackage.ctaText || ""}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, ctaText: e.target.value })
                    }
                    placeholder="Book Plan"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingPackage.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        sortOrder: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#332924] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPackage.description || ""}
                  onChange={(e) =>
                    setEditingPackage({ ...editingPackage, description: e.target.value })
                  }
                  placeholder="Who this package is designed for..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#332924] block mb-1">Included Features</label>
                <div className="space-y-1.5 mb-2">
                  {(editingPackage.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPackage({
                            ...editingPackage,
                            features: (editingPackage.features || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && featureInput.trim()) {
                        e.preventDefault();
                        setEditingPackage({
                          ...editingPackage,
                          features: [...(editingPackage.features || []), featureInput.trim()],
                        });
                        setFeatureInput("");
                      }
                    }}
                    placeholder="Add included feature & press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!featureInput.trim()) return;
                      setEditingPackage({
                        ...editingPackage,
                        features: [...(editingPackage.features || []), featureInput.trim()],
                      });
                      setFeatureInput("");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#332924] text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 border-t border-[#F3ECE4]">
                <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.active ?? true}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, active: e.target.checked })
                    }
                  />
                  <span>Active on Pricing Page</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.recommended ?? false}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, recommended: e.target.checked })
                    }
                  />
                  <span>Highlight as Recommended</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8DFD5] flex items-center justify-end gap-2.5 bg-[#FAF7F2]">
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#5F534D] hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={saving}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#C96A50] hover:bg-[#B4583F] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{saving ? "Saving..." : "Save Package"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
