"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ExternalLink,
  Upload,
  RefreshCw,
  Sparkles,
  Grid,
  List,
  Check,
  X,
  Layers,
  Tag,
} from "lucide-react";
import type { ProjectDocument } from "@/types/cms";

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

export function ProjectsAdminView({
  projects,
  onTogglePublished,
  onDeleteProject,
  onSaveProject,
  handleFileUpload,
  uploadingImage,
}: ProjectsAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Editing state
  const [editingProject, setEditingProject] =
    useState<Partial<ProjectDocument> | null>(null);
  const [techInput, setTechInput] = useState("");
  const [deliverableInput, setDeliverableInput] = useState("");

  const categories = [
    "all",
    ...Array.from(
      new Set(projects.map((p) => p.category).filter(Boolean))
    ),
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.published) ||
      (statusFilter === "draft" && !p.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingProject({
      id: `proj_${Date.now()}`,
      name: "",
      slug: "",
      category: "Web Application",
      tagline: "",
      shortDescription: "",
      description: "",
      scope: ["Design", "Full-Stack Development"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      deliverables: ["Responsive UI", "Production Deployment"],
      published: true,
      featured: true,
      status: "Completed",
      sortOrder: projects.length,
    });
  };

  const handleSaveModal = async () => {
    if (!editingProject || !editingProject.id) return;
    await onSaveProject(editingProject);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Portfolio & Case Studies
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Projects Management Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish client deliverables, commercial applications, and interactive
            case studies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Study</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0A192F] hover:bg-slate-100"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Search, Status, and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, or technologies..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "published" | "draft")
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#0A192F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            >
              <option value="all">All Status ({projects.length})</option>
              <option value="published">
                Published ({projects.filter((p) => p.published).length})
              </option>
              <option value="draft">
                Drafts ({projects.filter((p) => !p.published).length})
              </option>
            </select>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#0A192F] shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
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
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-8">
          <Globe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0A192F]">
            No projects match your filter
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, or create a new case study to showcase
            your work.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Cover & Title</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Deliverables</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Visibility</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {proj.coverImage ? (
                            <Image
                              src={proj.coverImage}
                              alt={proj.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Globe className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#0A192F]">
                            {proj.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /projects/{proj.slug || proj.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {proj.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <span>{(proj.deliverables || []).length} items</span>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {proj.technologies.slice(0, 3).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                        {proj.status || "Completed"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => void onTogglePublished(proj)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          proj.published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {proj.published ? (
                          <Eye className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{proj.published ? "Published" : "Draft"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/projects/${proj.slug || proj.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-slate-100 transition-colors"
                          title="View Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingProject(proj)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Project"
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
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:border-[#0284C7]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {proj.coverImage ? (
                    <Image
                      src={proj.coverImage}
                      alt={proj.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Globe className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-white/95 text-slate-700 backdrop-blur-xs border border-slate-200">
                    {proj.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#0A192F] line-clamp-1">
                      {proj.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.published
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {proj.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {proj.shortDescription || proj.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {(proj.technologies || []).slice(0, 2).join(", ")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingProject(proj)}
                    className="p-1.5 text-slate-500 hover:text-[#0A192F] rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteProject(proj.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Editor Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0284C7]" />
                <span>
                  {editingProject.id?.startsWith("proj_")
                    ? "Create New Case Study"
                    : `Edit Project: ${editingProject.name}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-name-input" className="font-semibold text-slate-700 block mb-1">
                    Project Name *
                  </label>
                  <input
                    id="project-name-input"
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
                            .replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    placeholder="e.g., WishMusic Stream"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="project-slug-input" className="font-semibold text-slate-700 block mb-1">
                    URL Slug *
                  </label>
                  <input
                    id="project-slug-input"
                    type="text"
                    value={editingProject.slug || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        slug: e.target.value,
                      })
                    }
                    placeholder="e.g., wishmusic-stream"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="project-category-input" className="font-semibold text-slate-700 block mb-1">
                    Category
                  </label>
                  <input
                    id="project-category-input"
                    type="text"
                    value={editingProject.category || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g., Web Application, E-commerce"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
                <div>
                  <label htmlFor="project-status-input" className="font-semibold text-slate-700 block mb-1">
                    Status Label
                  </label>
                  <input
                    id="project-status-input"
                    type="text"
                    value={editingProject.status || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        status: e.target.value,
                      })
                    }
                    placeholder="e.g., Completed, Live Store, In Production"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              {/* Tagline & Short Description */}
              <div>
                <label htmlFor="project-tagline-input" className="font-semibold text-slate-700 block mb-1">
                  Tagline / Subheadline
                </label>
                <input
                  id="project-tagline-input"
                  type="text"
                  value={editingProject.tagline || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tagline: e.target.value,
                    })
                  }
                  placeholder="e.g., Ultra-lightweight ad-free music player for Android"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label htmlFor="project-description-input" className="font-semibold text-slate-700 block mb-1">
                  Full Description
                </label>
                <textarea
                  id="project-description-input"
                  rows={3}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed project summary..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              {/* Cover Image Upload via Cloudinary */}
              <div>
                <label htmlFor="project-cover-image-input" className="font-semibold text-slate-700 block mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="project-cover-image-input"
                    type="text"
                    value={editingProject.coverImage || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        coverImage: e.target.value,
                      })
                    }
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, "projects");
                          if (url) {
                            setEditingProject({
                              ...editingProject,
                              coverImage: url,
                            });
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <span className="text-[11px] text-[#0284C7] mt-1 block">
                    Uploading image to Cloudinary...
                  </span>
                )}
              </div>

              {/* Tech Stack Pills */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Technologies
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingProject.technologies || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (
                            editingProject.technologies || []
                          ).filter((_, i) => i !== idx);
                          setEditingProject({
                            ...editingProject,
                            technologies: updated,
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
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Add technology (e.g. Next.js, Flutter)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0A192F]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && techInput.trim()) {
                        e.preventDefault();
                        const next = [
                          ...(editingProject.technologies || []),
                          techInput.trim(),
                        ];
                        setEditingProject({
                          ...editingProject,
                          technologies: next,
                        });
                        setTechInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (techInput.trim()) {
                        const next = [
                          ...(editingProject.technologies || []),
                          techInput.trim(),
                        ];
                        setEditingProject({
                          ...editingProject,
                          technologies: next,
                        });
                        setTechInput("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Key Deliverables
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingProject.deliverables || []).map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-[#0284C7] text-[11px]"
                    >
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (
                            editingProject.deliverables || []
                          ).filter((_, i) => i !== idx);
                          setEditingProject({
                            ...editingProject,
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
                    placeholder="Add deliverable (e.g. Dark Mode System, Payment Gateway)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0A192F]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && deliverableInput.trim()) {
                        e.preventDefault();
                        const next = [
                          ...(editingProject.deliverables || []),
                          deliverableInput.trim(),
                        ];
                        setEditingProject({
                          ...editingProject,
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
                          ...(editingProject.deliverables || []),
                          deliverableInput.trim(),
                        ];
                        setEditingProject({
                          ...editingProject,
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

              {/* Flags */}
              <div className="pt-2 flex items-center gap-6 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProject.published ?? true}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        published: e.target.checked,
                      })
                    }
                  />
                  <span>Published to Public Site</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProject.featured ?? false}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        featured: e.target.checked,
                      })
                    }
                  />
                  <span>Featured Case Study</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0052cc] shadow-xs transition-colors cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
