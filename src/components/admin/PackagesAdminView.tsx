"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Check,
  X,
  Edit3,
  Trash2,
  DollarSign,
  Tag,
  Star,
  CheckCircle2,
} from "lucide-react";
import type { WebsitePackageDocument } from "@/types/cms";

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
  const [editingPackage, setEditingPackage] =
    useState<Partial<WebsitePackageDocument> | null>(null);
  const [featureInput, setFeatureInput] = useState("");

  const filteredPackages = packages.filter((pkg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      pkg.name?.toLowerCase().includes(q) ||
      pkg.websiteType?.toLowerCase().includes(q) ||
      pkg.description?.toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setEditingPackage({
      id: `pkg_${Date.now()}`,
      name: "",
      websiteType: "Commercial Package",
      description: "",
      price: 2999,
      priceType: "fixed",
      unit: "/ project",
      features: ["Custom Responsive Layout", "SEO & Meta Configuration"],
      badge: "Best Value",
      recommended: false,
      active: true,
      published: true,
      sortOrder: packages.length,
    });
  };

  const handleSaveModal = async () => {
    if (!editingPackage || !editingPackage.id) return;
    await onSavePackage(editingPackage);
    setEditingPackage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Commercial Offerings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Website & Development Packages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure transparent studio rates, feature inclusions, badge
            labels, and popular recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Commercial Package</span>
        </button>
      </div>

      {/* Search & Meta Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages by title or category..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredPackages.length} package{filteredPackages.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Packages Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-medium">Package Name</th>
                <th className="py-3.5 px-4 font-medium">Category</th>
                <th className="py-3.5 px-4 font-medium">Price</th>
                <th className="py-3.5 px-4 font-medium">Features</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0A192F] flex items-center gap-2">
                      <span>{pkg.name}</span>
                      {pkg.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {pkg.badge}
                        </span>
                      )}
                      {pkg.recommended && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                          ★ Recommended
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                        {pkg.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {pkg.websiteType}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0A192F]">
                    ₹{pkg.price?.toLocaleString("en-IN")}{" "}
                    <span className="text-slate-400 font-normal text-[11px]">
                      {pkg.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {(pkg.features || []).length} deliverables
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => void onToggleActive(pkg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        pkg.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pkg.active ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{pkg.active ? "Active" : "Archived"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingPackage(pkg)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeletePackage(pkg.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Package"
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

      {/* Package Editor Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0284C7]" />
                <span>
                  {editingPackage.id?.startsWith("pkg_")
                    ? "Create New Package"
                    : `Edit Package: ${editingPackage.name}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="package-name-input" className="font-semibold text-slate-700 block mb-1">
                    Package Name *
                  </label>
                  <input
                    id="package-name-input"
                    type="text"
                    value={editingPackage.name || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Commercial Starter"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="package-type-input" className="font-semibold text-slate-700 block mb-1">
                    Category Tag
                  </label>
                  <input
                    id="package-type-input"
                    type="text"
                    value={editingPackage.websiteType || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        websiteType: e.target.value,
                      })
                    }
                    placeholder="e.g., Commercial Package"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="package-price-input" className="font-semibold text-slate-700 block mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    id="package-price-input"
                    type="number"
                    value={editingPackage.price || 0}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-bold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="package-unit-input" className="font-semibold text-slate-700 block mb-1">
                    Unit / Turnaround
                  </label>
                  <input
                    id="package-unit-input"
                    type="text"
                    value={editingPackage.unit || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        unit: e.target.value,
                      })
                    }
                    placeholder="e.g., / project or 3-5 days"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="package-badge-input" className="font-semibold text-slate-700 block mb-1">
                    Badge Label
                  </label>
                  <input
                    id="package-badge-input"
                    type="text"
                    value={editingPackage.badge || ""}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        badge: e.target.value,
                      })
                    }
                    placeholder="e.g., Best Value"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="package-description-input" className="font-semibold text-slate-700 block mb-1">
                  Tagline / Description
                </label>
                <input
                  id="package-description-input"
                  type="text"
                  value={editingPackage.description || ""}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      description: e.target.value,
                    })
                  }
                  placeholder="One-line pitch for this package tier..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Features List */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Features & Deliverables
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingPackage.features || []).map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (
                            editingPackage.features || []
                          ).filter((_, i) => i !== idx);
                          setEditingPackage({
                            ...editingPackage,
                            features: updated,
                          });
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add feature (e.g., Razorpay Gateway, Domain Setup)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0A192F]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && featureInput.trim()) {
                        e.preventDefault();
                        const next = [
                          ...(editingPackage.features || []),
                          featureInput.trim(),
                        ];
                        setEditingPackage({
                          ...editingPackage,
                          features: next,
                        });
                        setFeatureInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (featureInput.trim()) {
                        const next = [
                          ...(editingPackage.features || []),
                          featureInput.trim(),
                        ];
                        setEditingPackage({
                          ...editingPackage,
                          features: next,
                        });
                        setFeatureInput("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPackage.active ?? true}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        active: e.target.checked,
                      })
                    }
                  />
                  <span>Active Commercial Offering</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPackage.recommended ?? false}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        recommended: e.target.checked,
                      })
                    }
                  />
                  <span>Highlighted / Recommended</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0052cc] shadow-xs transition-colors cursor-pointer"
              >
                Save Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
