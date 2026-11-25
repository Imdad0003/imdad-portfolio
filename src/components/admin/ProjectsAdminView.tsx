"use client";

import React, { useState } from "react";
import type { ProjectDocument } from "@/types/cms";
import { MediaLibraryModal } from "./MediaLibraryModal";
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Loader2,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

interface ProjectsAdminViewProps {
  projects: ProjectDocument[];
  onTogglePublished: (project: ProjectDocument) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onSaveProject: (project: Partial<ProjectDocument>) => Promise<void>;
  handleFileUpload: (
    file: File,
    category: "apps" | "projects" | "services" | "general"
  ) => Promise<string | null>;
  uploadingImage: boolean;
}

const CATEGORIES = [
  "all",
  "Apps & Products",
  "Web Development",
  "Amazon Listing Design",
  "Design & Branding",
  "AI/SaaS",
];

export function ProjectsAdminView({
  projects,
  onTogglePublished,
  onDeleteProject,
  onSaveProject,
  handleFileUpload,
  uploadingImage,
}: ProjectsAdminViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProject, setEditingProject] = useState<Partial<ProjectDocument> | null>(null);
  const [techInput, setTechInput] = useState("");
  const [deliverableInput, setDeliverableInput] = useState("");
  const [scopeInput, setScopeInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<"cover" | "gallery" | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesCat =
      selectedCategory === "all" ||
      (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.shortDescription || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingProject({
      id: `proj_${Date.now()}`,
      name: "",
      slug: "",
      category: "Web Development",
      status: "Completed",
      shortDescription: "",
      description: "",
      highlight: "",
      url: "",
      githubUrl: "",
      coverImage: "",
      gallery: [],
      technologies: [],
      scope: [],
      deliverables: [],
      metrics: [],
      featured: true,
      sortOrder: projects.length,
      published: true,
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteProject(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveModal = async () => {
    if (!editingProject || !editingProject.name?.trim()) {
      alert("Please enter a Project Name.");
      return;
    }
    setSaving(true);
    try {
      const slug =
        editingProject.slug?.trim() ||
        editingProject.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      await onSaveProject({
        ...editingProject,
        slug,
        description: editingProject.description?.trim() || editingProject.shortDescription || "",
      });
      setEditingProject(null);
    } catch {
      // error alert shown by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-[#332924]">Projects &amp; Case Studies</h2>
          <p className="text-xs text-[#6E625B]">
            Add, edit, feature, hide, or delete portfolio work and case study visuals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Category & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD5] shadow-2xs space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#332924] text-white"
                  : "bg-[#FAF7F2] text-[#5F534D] border border-[#E8DFD5] hover:bg-[#FAECE4]"
              }`}
            >
              {cat === "all" ? "All Projects" : cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A7C75] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, tag, or summary..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#332924] focus:outline-none focus:border-[#C96A50]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] self-end">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-white text-[#332924] shadow-2xs" : "text-[#8A7C75]"
              }`}
              title="Table view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "grid" ? "bg-white text-[#332924] shadow-2xs" : "text-[#8A7C75]"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State or Data View */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center space-y-2">
          <FolderKanban className="w-8 h-8 text-[#8A7C75] mx-auto" />
          <p className="text-sm font-bold text-[#332924]">No matching projects</p>
          <p className="text-xs text-[#6E625B]">Try another search or add a new project.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-[#E8DFD5] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2] text-[10px] font-mono uppercase tracking-wider text-[#8A7C75]">
                  <th className="py-3.5 px-5 font-bold">Project</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Stage</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECE4] text-xs">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[#FAF7F2]/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] overflow-hidden shrink-0 flex items-center justify-center">
                          {proj.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={proj.coverImage}
                              alt={proj.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[#8A7C75]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-[#332924]">
                            <span>{proj.name}</span>
                            {proj.featured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#8A7C75] truncate max-w-xs">
                            {proj.shortDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAECE4] text-[#B4583F] text-[11px] font-semibold">
                        {proj.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5F534D]">{proj.status}</td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => void onTogglePublished(proj)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${
                          proj.published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {proj.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{proj.published ? "Live" : "Draft"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-[#5F534D] hover:text-[#332924] border border-[#E8DFD5]"
                            title="Open Project URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...proj })}
                          className="p-1.5 rounded-lg text-[#5F534D] hover:text-[#332924] hover:bg-[#FAF7F2] border border-[#E8DFD5] cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(proj.id)}
                          disabled={deletingId === proj.id}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer disabled:opacity-50"
                          title="Delete Project"
                        >
                          {deletingId === proj.id ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-[#E8DFD5] overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video bg-[#FAF7F2] border-b border-[#E8DFD5] flex items-center justify-center overflow-hidden relative">
                  {proj.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proj.coverImage}
                      alt={proj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#8A7C75]" />
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#E8DFD5] text-[10px] font-bold text-[#332924]">
                    {proj.category}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-sm text-[#332924] truncate">
                      {proj.name}
                    </h3>
                    {proj.featured && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#6E625B] line-clamp-2">{proj.shortDescription}</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[#F3ECE4] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => void onTogglePublished(proj)}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                    proj.published
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {proj.published ? "Live" : "Draft"}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingProject({ ...proj })}
                    className="px-3 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] text-xs font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(proj.id)}
                    disabled={deletingId === proj.id}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Project Modal Editor */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#332924]/45 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-[#E8DFD5] shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2] sticky top-0 z-10">
              <h3 className="font-display font-bold text-base text-[#332924]">
                {editingProject.name ? `Edit: ${editingProject.name}` : "Create New Project"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1.5 rounded-lg text-[#6E625B] hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={editingProject.name || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        name: e.target.value,
                        slug:
                          editingProject.slug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                      })
                    }
                    placeholder="e.g., EasyXo Brand Ecosystem"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">URL Slug *</label>
                  <input
                    type="text"
                    value={editingProject.slug || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Category</label>
                  <select
                    value={editingProject.category || "Web Development"}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  >
                    {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Project Stage</label>
                  <select
                    value={editingProject.status || "Completed"}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  >
                    <option value="Active Brand">Active Brand</option>
                    <option value="Live Store">Live Store</option>
                    <option value="Completed">Completed</option>
                    <option value="In Production">In Production</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Highlight Badge</label>
                  <input
                    type="text"
                    value={editingProject.highlight || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, highlight: e.target.value })
                    }
                    placeholder="Flagship Venture"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Live Website URL</label>
                  <input
                    type="text"
                    value={editingProject.url || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, url: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingProject.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        sortOrder: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#332924] block mb-1">Card Summary</label>
                <input
                  type="text"
                  value={editingProject.shortDescription || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, shortDescription: e.target.value })
                  }
                  placeholder="One-line outcome summary..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#332924] block mb-1">Full Case Study Story</label>
                <textarea
                  rows={3}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Challenge, solution, and commercial results..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>

              {/* Cover Image with Direct Upload + Media Library Picker */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5">
                <label className="font-bold text-[#332924] block">Cover Image</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editingProject.coverImage || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, coverImage: e.target.value })
                    }
                    placeholder="https://... image URL"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E8DFD5] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaTarget("cover")}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAECE4] border border-[#E8DFD5] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#C96A50]" />
                    <span>Pick Image</span>
                  </button>
                  <label className="px-3.5 py-2 rounded-xl bg-[#332924] hover:bg-[#4A3D36] text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await handleFileUpload(f, "projects");
                        if (url) setEditingProject({ ...editingProject, coverImage: url });
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="font-bold text-[#332924] block mb-1">Tools / Stack</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingProject.technologies || []).map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] font-semibold"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            technologies: (editingProject.technologies || []).filter(
                              (_, idx) => idx !== i
                            ),
                          })
                        }
                        className="cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && techInput.trim()) {
                        e.preventDefault();
                        setEditingProject({
                          ...editingProject,
                          technologies: [
                            ...(editingProject.technologies || []),
                            techInput.trim(),
                          ],
                        });
                        setTechInput("");
                      }
                    }}
                    placeholder="Add tool & press Enter (e.g. Next.js, Razorpay)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!techInput.trim()) return;
                      setEditingProject({
                        ...editingProject,
                        technologies: [...(editingProject.technologies || []), techInput.trim()],
                      });
                      setTechInput("");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#332924] text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Scope & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#332924] block mb-1">Scope</label>
                  <div className="space-y-1 mb-2">
                    {(editingProject.scope || []).map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5]"
                      >
                        <span className="truncate">{s}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              scope: (editingProject.scope || []).filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={scopeInput}
                      onChange={(e) => setScopeInput(e.target.value)}
                      placeholder="Add scope..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!scopeInput.trim()) return;
                        setEditingProject({
                          ...editingProject,
                          scope: [...(editingProject.scope || []), scopeInput.trim()],
                        });
                        setScopeInput("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#332924] text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#332924] block mb-1">Deliverables</label>
                  <div className="space-y-1 mb-2">
                    {(editingProject.deliverables || []).map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5]"
                      >
                        <span className="truncate">{d}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              deliverables: (editingProject.deliverables || []).filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={deliverableInput}
                      onChange={(e) => setDeliverableInput(e.target.value)}
                      placeholder="Add deliverable..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!deliverableInput.trim()) return;
                        setEditingProject({
                          ...editingProject,
                          deliverables: [
                            ...(editingProject.deliverables || []),
                            deliverableInput.trim(),
                          ],
                        });
                        setDeliverableInput("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#332924] text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 border-t border-[#F3ECE4]">
                <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.published ?? true}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, published: e.target.checked })
                    }
                  />
                  <span>Published Live</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured ?? false}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, featured: e.target.checked })
                    }
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8DFD5] flex items-center justify-end gap-2.5 bg-[#FAF7F2] sticky bottom-0">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
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
                <span>{saving ? "Saving..." : "Save Project"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaTarget && editingProject && (
        <MediaLibraryModal
          isOpen={true}
          onClose={() => setMediaTarget(null)}
          onSelect={(asset) => {
            if (mediaTarget === "cover") {
              setEditingProject({ ...editingProject, coverImage: asset.url });
            } else {
              setEditingProject({
                ...editingProject,
                gallery: [...(editingProject.gallery || []), asset.url],
              });
            }
          }}
        />
      )}
    </div>
  );
}
