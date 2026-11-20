"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ExternalLink,
  Check,
  X,
  Sparkles,
  DollarSign,
  HelpCircle,
  Package,
} from "lucide-react";
import type { ServiceDocument, ServiceTierItem, ServiceFaqItem } from "@/types/cms";

interface ServicesAdminViewProps {
  services: ServiceDocument[];
  onTogglePublished: (service: ServiceDocument) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onSaveService: (service: Partial<ServiceDocument>) => Promise<void>;
}

export function ServicesAdminView({
  services,
  onTogglePublished,
  onDeleteService,
  onSaveService,
}: ServicesAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] =
    useState<Partial<ServiceDocument> | null>(null);
  const [deliverableInput, setDeliverableInput] = useState("");

  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.shortDescription?.toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setEditingService({
      id: `service_${Date.now()}`,
      name: "",
      slug: "",
      category: "Studio Discipline",
      shortDescription: "",
      description: "",
      deliverables: ["Consultation & Architecture", "High-Performance Implementation"],
      process: [],
      pricing: [],
      faq: [],
      published: true,
      featured: true,
      sortOrder: services.length,
    });
  };

  const handleSaveModal = async () => {
    if (!editingService || !editingService.id) return;
    await onSaveService(editingService);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Studio Disciplines
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Commercial Services & Capabilities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure studio service verticals, pricing tiers, deliverables, and
            client FAQs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Studio Service</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines by name or description..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredServices.length} active vertical{filteredServices.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-[#0284C7]/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-md">
                    {svc.category || "Studio Vertical"}
                  </span>
                  <h3 className="text-base font-bold text-[#0A192F] mt-1">
                    {svc.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    /services/{svc.slug || svc.id}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void onTogglePublished(svc)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                      svc.published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {svc.published ? (
                      <Eye className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{svc.published ? "Published" : "Draft"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingService(svc)}
                    className="p-1.5 text-slate-500 hover:text-[#0A192F] rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteService(svc.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {svc.shortDescription || svc.description}
              </p>

              {/* Deliverables snippet */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Core Deliverables ({(svc.deliverables || []).length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(svc.deliverables || []).slice(0, 3).map((d, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60"
                    >
                      {d}
                    </span>
                  ))}
                  {(svc.deliverables || []).length > 3 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{(svc.deliverables || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{(svc.pricing || []).length} Pricing Tiers</span>
              <span>{(svc.faq || []).length} FAQs</span>
            </div>
          </div>
        ))}
      </div>

      {/* Service Editor Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0284C7]" />
                <span>
                  {editingService.id?.startsWith("service_")
                    ? "Create Studio Discipline"
                    : `Edit Service: ${editingService.name}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="service-name-input" className="font-semibold text-slate-700 block mb-1">
                    Service Name *
                  </label>
                  <input
                    id="service-name-input"
                    type="text"
                    value={editingService.name || ""}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        name: e.target.value,
                        slug:
                          editingService.slug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    placeholder="e.g., Full-Stack Web Development"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="service-slug-input" className="font-semibold text-slate-700 block mb-1">
                    URL Slug *
                  </label>
                  <input
                    id="service-slug-input"
                    type="text"
                    value={editingService.slug || ""}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        slug: e.target.value,
                      })
                    }
                    placeholder="e.g., web-development"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service-short-desc-input" className="font-semibold text-slate-700 block mb-1">
                  Short Description
                </label>
                <textarea
                  id="service-short-desc-input"
                  rows={2}
                  value={editingService.shortDescription || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Summary for landing cards..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Deliverables
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingService.deliverables || []).map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-[#0284C7] text-[11px]"
                    >
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (
                            editingService.deliverables || []
                          ).filter((_, i) => i !== idx);
                          setEditingService({
                            ...editingService,
                            deliverables: updated,
                          });
                        }}
                        className="text-sky-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="Add deliverable..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0A192F]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && deliverableInput.trim()) {
                        e.preventDefault();
                        const next = [
                          ...(editingService.deliverables || []),
                          deliverableInput.trim(),
                        ];
                        setEditingService({
                          ...editingService,
                          deliverables: next,
                        });
                        setDeliverableInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (deliverableInput.trim()) {
                        const next = [
                          ...(editingService.deliverables || []),
                          deliverableInput.trim(),
                        ];
                        setEditingService({
                          ...editingService,
                          deliverables: next,
                        });
                        setDeliverableInput("");
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
                    checked={editingService.published ?? true}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        published: e.target.checked,
                      })
                    }
                  />
                  <span>Published to Public Site</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0052cc] shadow-xs transition-colors cursor-pointer"
              >
                Save Discipline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
