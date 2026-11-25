"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ServiceDocument, ServiceDemoItem, ServiceTeamMember } from "@/types/cms";
import { studioTeam } from "@/data/team";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  Briefcase,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Sparkles,
} from "lucide-react";

interface ServicesAdminViewProps {
  services: ServiceDocument[];
  onTogglePublished: (service: ServiceDocument) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onSaveService: (service: Partial<ServiceDocument>) => Promise<void>;
}

const ICON_OPTIONS = [
  "Globe",
  "Video",
  "ShoppingBag",
  "Smartphone",
  "Sparkles",
  "Palette",
  "Layers",
  "Zap",
  "TrendingUp",
];

export function ServicesAdminView({
  services,
  onTogglePublished,
  onDeleteService,
  onSaveService,
}: ServicesAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState<Partial<ServiceDocument> | null>(null);
  const [deliverableInput, setDeliverableInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalSection, setModalSection] = useState<
    "basics" | "pricing" | "demos" | "team" | "process" | "faq"
  >("basics");

  const filteredServices = services.filter((svc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      svc.name.toLowerCase().includes(q) ||
      (svc.shortDescription || "").toLowerCase().includes(q) ||
      (svc.category || "").toLowerCase().includes(q)
    );
  });

  const handleOpenCreateModal = () => {
    setModalSection("basics");
    setEditingService({
      id: `service_${Date.now()}`,
      name: "",
      slug: "",
      category: "",
      tagline: "",
      iconName: "Globe",
      shortDescription: "",
      description: "",
      deliverables: [],
      process: [],
      pricing: [],
      pricingNote: "",
      demos: [],
      teamMembers: [],
      faq: [],
      featured: true,
      sortOrder: services.length,
      published: true,
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteService(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveModal = async () => {
    if (!editingService || !editingService.name?.trim()) {
      alert("Please enter a Service Title.");
      return;
    }
    setSaving(true);
    try {
      const cleanSlug =
        editingService.slug?.trim() ||
        editingService.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      await onSaveService({
        ...editingService,
        slug: cleanSlug,
        description: editingService.description?.trim() || editingService.shortDescription || "",
      });
      setEditingService(null);
    } catch {
      // error banner already shown by parent handler
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-[#332924]">Studio Services</h2>
          <p className="text-xs text-[#6E625B]">
            Add, edit, hide, or delete your core studio services, pricing tiers, steps, and FAQs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
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
            placeholder="Search services by name, category, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#332924] placeholder:text-[#8A7C75] focus:outline-none focus:border-[#C96A50]"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center space-y-2">
          <Briefcase className="w-8 h-8 text-[#8A7C75] mx-auto" />
          <p className="text-sm font-bold text-[#332924]">No services found</p>
          <p className="text-xs text-[#6E625B]">Click &quot;Add New Service&quot; to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-[#E8DFD5] p-5 flex flex-col justify-between shadow-2xs hover:border-[#D8A999] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAECE4] text-[#B4583F]">
                      {svc.category || "Studio Service"}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#332924] mt-2">
                      {svc.name}
                    </h3>
                    <div className="text-[11px] font-mono text-[#8A7C75]">/{svc.slug}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void onTogglePublished(svc)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${
                      svc.published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {svc.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{svc.published ? "Live" : "Hidden"}</span>
                  </button>
                </div>

                <p className="text-xs text-[#5F534D] line-clamp-2">{svc.shortDescription}</p>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[#6E625B]">
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5]">
                    {svc.deliverables?.length || 0} deliverables
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5]">
                    {svc.pricing?.length || 0} tiers
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5]">
                    {svc.demos?.length || 0} demos
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5]">
                    {svc.teamMembers?.length || 0} team
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5]">
                    {svc.faq?.length || 0} FAQs
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F3ECE4] flex items-center justify-between gap-2">
                <Link
                  href={`/services/${svc.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#C96A50] hover:underline"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalSection("basics");
                      setEditingService({ ...svc });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FAECE4] text-[#332924] text-xs font-bold border border-[#E8DFD5] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(svc.id)}
                    disabled={deletingId === svc.id}
                    title="Delete Service"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === svc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Service Editor Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#332924]/45 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-[#E8DFD5] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <h3 className="font-display font-bold text-base text-[#332924]">
                  {editingService.name ? `Edit: ${editingService.name}` : "Create New Service"}
                </h3>
                <p className="text-[11px] text-[#8A7C75]">
                  Customize details, pricing tiers, delivery steps, and FAQs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1.5 rounded-lg text-[#6E625B] hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-section switcher inside modal */}
            <div className="px-6 py-2.5 border-b border-[#E8DFD5] flex flex-wrap gap-2 bg-white">
              {[
                { id: "basics", label: "1. Info & Deliverables" },
                { id: "pricing", label: `2. Price (${editingService.pricing?.length || 0})` },
                { id: "demos", label: `3. Demos (${editingService.demos?.length || 0})` },
                { id: "team", label: `4. Team (${editingService.teamMembers?.length || 0})` },
                { id: "process", label: `5. Steps (${editingService.process?.length || 0})` },
                { id: "faq", label: `6. FAQs (${editingService.faq?.length || 0})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalSection(t.id as typeof modalSection)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    modalSection === t.id
                      ? "bg-[#C96A50] text-white"
                      : "bg-[#FAF7F2] text-[#5F534D] hover:bg-[#F3ECE4]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {modalSection === "basics" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#332924] block mb-1">Service Title *</label>
                      <input
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
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, ""),
                          })
                        }
                        placeholder="e.g., Video Editing"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#332924] block mb-1">URL Slug *</label>
                      <input
                        type="text"
                        value={editingService.slug || ""}
                        onChange={(e) =>
                          setEditingService({ ...editingService, slug: e.target.value })
                        }
                        placeholder="e.g., video-editing"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono text-[#332924]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#332924] block mb-1">Category Tag</label>
                      <input
                        type="text"
                        value={editingService.category || ""}
                        onChange={(e) =>
                          setEditingService({ ...editingService, category: e.target.value })
                        }
                        placeholder="e.g., Media & Reels"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#332924] block mb-1">Icon</label>
                      <select
                        value={editingService.iconName || "Globe"}
                        onChange={(e) =>
                          setEditingService({ ...editingService, iconName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                      >
                        {ICON_OPTIONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[#332924] block mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={editingService.sortOrder ?? 0}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            sortOrder: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#332924] block mb-1">
                      Tagline (Shown on Service Page Hero)
                    </label>
                    <input
                      type="text"
                      value={editingService.tagline || ""}
                      onChange={(e) =>
                        setEditingService({ ...editingService, tagline: e.target.value })
                      }
                      placeholder="Short catchy tagline for the service header..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#332924] block mb-1">
                      Short Card Summary
                    </label>
                    <input
                      type="text"
                      value={editingService.shortDescription || ""}
                      onChange={(e) =>
                        setEditingService({ ...editingService, shortDescription: e.target.value })
                      }
                      placeholder="1-2 sentence overview shown on homepage cards..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#332924] block mb-1">Full Description</label>
                    <textarea
                      rows={3}
                      value={editingService.description || ""}
                      onChange={(e) =>
                        setEditingService({ ...editingService, description: e.target.value })
                      }
                      placeholder="Detailed service breakdown for the dedicated service page..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#332924] block mb-1">Deliverables</label>
                    <div className="space-y-1.5 mb-2">
                      {(editingService.deliverables || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                        >
                          <span className="text-[#332924]">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingService({
                                ...editingService,
                                deliverables: (editingService.deliverables || []).filter(
                                  (_, i) => i !== idx
                                ),
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
                        value={deliverableInput}
                        onChange={(e) => setDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && deliverableInput.trim()) {
                            e.preventDefault();
                            setEditingService({
                              ...editingService,
                              deliverables: [
                                ...(editingService.deliverables || []),
                                deliverableInput.trim(),
                              ],
                            });
                            setDeliverableInput("");
                          }
                        }}
                        placeholder="Add deliverable and press Enter..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!deliverableInput.trim()) return;
                          setEditingService({
                            ...editingService,
                            deliverables: [
                              ...(editingService.deliverables || []),
                              deliverableInput.trim(),
                            ],
                          });
                          setDeliverableInput("");
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
                        checked={editingService.published ?? true}
                        onChange={(e) =>
                          setEditingService({ ...editingService, published: e.target.checked })
                        }
                      />
                      <span>Published Live</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingService.featured ?? true}
                        onChange={(e) =>
                          setEditingService({ ...editingService, featured: e.target.checked })
                        }
                      />
                      <span>Featured on Homepage</span>
                    </label>
                  </div>
                </>
              )}

              {modalSection === "pricing" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-[#332924] block mb-1">
                      Pricing Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingService.pricingNote || ""}
                      onChange={(e) =>
                        setEditingService({ ...editingService, pricingNote: e.target.value })
                      }
                      placeholder="e.g., Transparent fixed packages. Custom scopes available."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#332924]">Service Pricing Tiers</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingService({
                          ...editingService,
                          pricing: [
                            ...(editingService.pricing || []),
                            {
                              tierName: "Standard Package",
                              price: "₹999",
                              description: "",
                              deliverables: [],
                              turnaround: "2-3 Days",
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pricing Tier</span>
                    </button>
                  </div>

                  {(editingService.pricing || []).map((tier, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#332924]">Tier #{tIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingService({
                              ...editingService,
                              pricing: (editingService.pricing || []).filter((_, i) => i !== tIdx),
                            })
                          }
                          className="text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Remove Tier
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={tier.tierName}
                          onChange={(e) => {
                            const next = [...(editingService.pricing || [])];
                            next[tIdx] = { ...tier, tierName: e.target.value };
                            setEditingService({ ...editingService, pricing: next });
                          }}
                          placeholder="Tier Name"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={tier.price}
                          onChange={(e) => {
                            const next = [...(editingService.pricing || [])];
                            next[tIdx] = { ...tier, price: e.target.value };
                            setEditingService({ ...editingService, pricing: next });
                          }}
                          placeholder="e.g., ₹1,499"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={tier.turnaround || ""}
                          onChange={(e) => {
                            const next = [...(editingService.pricing || [])];
                            next[tIdx] = { ...tier, turnaround: e.target.value };
                            setEditingService({ ...editingService, pricing: next });
                          }}
                          placeholder="Turnaround (48 Hours)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => {
                          const next = [...(editingService.pricing || [])];
                          next[tIdx] = { ...tier, description: e.target.value };
                          setEditingService({ ...editingService, pricing: next });
                        }}
                        placeholder="Short tier description"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                      <textarea
                        rows={2}
                        value={(tier.deliverables || []).join("\n")}
                        onChange={(e) => {
                          const next = [...(editingService.pricing || [])];
                          next[tIdx] = {
                            ...tier,
                            deliverables: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          };
                          setEditingService({ ...editingService, pricing: next });
                        }}
                        placeholder="One deliverable per line..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {modalSection === "demos" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#332924] block">Service Demos &amp; Samples</span>
                      <span className="text-[11px] text-[#8A7C75]">
                        Showcase images, videos, or live demo links shown on this service&apos;s custom page.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingService({
                          ...editingService,
                          demos: [
                            ...(editingService.demos || []),
                            {
                              id: `demo_${Date.now()}`,
                              title: "",
                              description: "",
                              category: "Live Demo",
                              mediaType: "link",
                              mediaUrl: "",
                              thumbnailUrl: "/imdad-logo.png",
                              demoLink: "",
                              metricsLabel: "",
                            } as ServiceDemoItem,
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Demo</span>
                    </button>
                  </div>

                  {(editingService.demos || []).length === 0 && (
                    <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#D8CBBF] text-center space-y-1">
                      <Sparkles className="w-5 h-5 text-[#C96A50] mx-auto" />
                      <p className="font-bold text-[#332924]">No demos added yet</p>
                      <p className="text-[11px] text-[#6E625B]">
                        Click &quot;Add Demo&quot; to attach live preview links, images, or video samples.
                      </p>
                    </div>
                  )}

                  {(editingService.demos || []).map((demo, dIdx) => (
                    <div
                      key={demo.id || dIdx}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#332924]">Demo #{dIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingService({
                              ...editingService,
                              demos: (editingService.demos || []).filter((_, i) => i !== dIdx),
                            })
                          }
                          className="text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Remove Demo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={demo.title}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, title: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Demo Title (e.g., EasyXo Storefront)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={demo.category || ""}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, category: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Category Tag (e.g., E-Commerce)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={demo.mediaType || "link"}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = {
                              ...demo,
                              mediaType: e.target.value as ServiceDemoItem["mediaType"],
                            };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        >
                          <option value="link">Live Link / Preview</option>
                          <option value="image">Image Sample</option>
                          <option value="video">Video Sample</option>
                        </select>
                        <input
                          type="text"
                          value={demo.metricsLabel || ""}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, metricsLabel: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Badge (e.g., +42% CTR / Live)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={demo.demoLink || ""}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, demoLink: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Live URL (https://... or /...)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={demo.mediaUrl || ""}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, mediaUrl: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Image or Video URL"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={demo.thumbnailUrl || ""}
                          onChange={(e) => {
                            const next = [...(editingService.demos || [])];
                            next[dIdx] = { ...demo, thumbnailUrl: e.target.value };
                            setEditingService({ ...editingService, demos: next });
                          }}
                          placeholder="Thumbnail Image URL"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={demo.description}
                        onChange={(e) => {
                          const next = [...(editingService.demos || [])];
                          next[dIdx] = { ...demo, description: e.target.value };
                          setEditingService({ ...editingService, demos: next });
                        }}
                        placeholder="Short description of what this demo shows..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {modalSection === "team" && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#332924] block">Team For This Service</span>
                      <span className="text-[11px] text-[#8A7C75]">
                        Names and roles displayed on this service&apos;s page (removed from homepage).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingService({
                          ...editingService,
                          teamMembers: [
                            ...(editingService.teamMembers || []),
                            {
                              id: `member_${Date.now()}`,
                              name: "",
                              role: "",
                              bio: "",
                              avatarUrl: "",
                              initials: "",
                              specialties: [],
                            } as ServiceTeamMember,
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer inline-flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Team Member</span>
                    </button>
                  </div>

                  {/* Quick-Add Studio Roster Helper */}
                  <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
                    <span className="text-[11px] font-semibold text-[#6E625B] mr-1">
                      Quick add:
                    </span>
                    {studioTeam.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setEditingService({
                            ...editingService,
                            teamMembers: [
                              ...(editingService.teamMembers || []),
                              {
                                id: `${m.id}_${Date.now()}`,
                                name: m.name,
                                role: m.title || m.role,
                                bio: m.bio,
                                avatarUrl: m.avatarUrl || "",
                                initials: m.initials,
                                specialties: m.specialties,
                              },
                            ],
                          })
                        }
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FAECE4] border border-[#E8DFD5] text-[11px] font-bold text-[#332924] cursor-pointer"
                      >
                        + {m.name} ({m.role})
                      </button>
                    ))}
                  </div>

                  {(editingService.teamMembers || []).length === 0 && (
                    <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#D8CBBF] text-center space-y-1">
                      <Users className="w-5 h-5 text-[#C96A50] mx-auto" />
                      <p className="font-bold text-[#332924]">No team members assigned yet</p>
                      <p className="text-[11px] text-[#6E625B]">
                        Add real specialist names and roles for this service above.
                      </p>
                    </div>
                  )}

                  {(editingService.teamMembers || []).map((member, mIdx) => (
                    <div
                      key={member.id || mIdx}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#332924]">
                          Team Member #{mIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingService({
                              ...editingService,
                              teamMembers: (editingService.teamMembers || []).filter(
                                (_, i) => i !== mIdx
                              ),
                            })
                          }
                          className="text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const next = [...(editingService.teamMembers || [])];
                            next[mIdx] = { ...member, name: e.target.value };
                            setEditingService({ ...editingService, teamMembers: next });
                          }}
                          placeholder="Full Name (e.g., Imdad)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => {
                            const next = [...(editingService.teamMembers || [])];
                            next[mIdx] = { ...member, role: e.target.value };
                            setEditingService({ ...editingService, teamMembers: next });
                          }}
                          placeholder="Role (e.g., Senior Editor)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={member.initials || ""}
                          onChange={(e) => {
                            const next = [...(editingService.teamMembers || [])];
                            next[mIdx] = { ...member, initials: e.target.value };
                            setEditingService({ ...editingService, teamMembers: next });
                          }}
                          placeholder="Initials (e.g., IB)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={member.avatarUrl || ""}
                          onChange={(e) => {
                            const next = [...(editingService.teamMembers || [])];
                            next[mIdx] = { ...member, avatarUrl: e.target.value };
                            setEditingService({ ...editingService, teamMembers: next });
                          }}
                          placeholder="Avatar Image URL (optional)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                        <input
                          type="text"
                          value={(member.specialties || []).join(", ")}
                          onChange={(e) => {
                            const next = [...(editingService.teamMembers || [])];
                            next[mIdx] = {
                              ...member,
                              specialties: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setEditingService({ ...editingService, teamMembers: next });
                          }}
                          placeholder="Specialties (comma-separated)"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={member.bio || ""}
                        onChange={(e) => {
                          const next = [...(editingService.teamMembers || [])];
                          next[mIdx] = { ...member, bio: e.target.value };
                          setEditingService({ ...editingService, teamMembers: next });
                        }}
                        placeholder="Short bio / what they handle for this service..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {modalSection === "process" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#332924]">Workflow Steps</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingService({
                          ...editingService,
                          process: [
                            ...(editingService.process || []),
                            {
                              step: String((editingService.process?.length || 0) + 1).padStart(
                                2,
                                "0"
                              ),
                              title: "",
                              description: "",
                              deliverable: "Milestone Review",
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>

                  {(editingService.process || []).map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#332924]">Step {st.step}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() => {
                              const arr = [...(editingService.process || [])];
                              [arr[sIdx - 1], arr[sIdx]] = [arr[sIdx], arr[sIdx - 1]];
                              setEditingService({ ...editingService, process: arr });
                            }}
                            className="p-1 text-[#6E625B] disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === (editingService.process?.length || 1) - 1}
                            onClick={() => {
                              const arr = [...(editingService.process || [])];
                              [arr[sIdx], arr[sIdx + 1]] = [arr[sIdx + 1], arr[sIdx]];
                              setEditingService({ ...editingService, process: arr });
                            }}
                            className="p-1 text-[#6E625B] disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingService({
                                ...editingService,
                                process: (editingService.process || []).filter((_, i) => i !== sIdx),
                              })
                            }
                            className="text-rose-600 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const arr = [...(editingService.process || [])];
                          arr[sIdx] = { ...st, title: e.target.value };
                          setEditingService({ ...editingService, process: arr });
                        }}
                        placeholder="Step title"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                      <textarea
                        rows={2}
                        value={st.description}
                        onChange={(e) => {
                          const arr = [...(editingService.process || [])];
                          arr[sIdx] = { ...st, description: e.target.value };
                          setEditingService({ ...editingService, process: arr });
                        }}
                        placeholder="Step details"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {modalSection === "faq" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#332924]">Frequently Asked Questions</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingService({
                          ...editingService,
                          faq: [...(editingService.faq || []), { question: "", answer: "" }],
                        })
                      }
                      className="px-3 py-1.5 rounded-full bg-[#FAECE4] text-[#B4583F] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  {(editingService.faq || []).map((item, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#332924]">FAQ #{fIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingService({
                              ...editingService,
                              faq: (editingService.faq || []).filter((_, i) => i !== fIdx),
                            })
                          }
                          className="text-rose-600 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const arr = [...(editingService.faq || [])];
                          arr[fIdx] = { ...item, question: e.target.value };
                          setEditingService({ ...editingService, faq: arr });
                        }}
                        placeholder="Question"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const arr = [...(editingService.faq || [])];
                          arr[fIdx] = { ...item, answer: e.target.value };
                          setEditingService({ ...editingService, faq: arr });
                        }}
                        placeholder="Answer"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD5]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E8DFD5] flex items-center justify-end gap-2.5 bg-[#FAF7F2]">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#5F534D] hover:bg-white border border-transparent hover:border-[#E8DFD5] cursor-pointer"
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
                <span>{saving ? "Saving..." : "Save Service"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
