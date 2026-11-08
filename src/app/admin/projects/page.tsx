"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { verifyAdminStatus, adminSignIn, adminSignInWithGoogle, adminSignOut } from "@/lib/auth";
import { getAllProjectsAdmin, saveProjectAdmin, deleteProjectAdmin } from "@/lib/cms";
import { ProjectDocument, GalleryItem, ProjectPublishStatus } from "@/types/cms";
import { BulkAssetUploader } from "@/components/admin/BulkAssetUploader";
import { GithubIcon } from "@/components/ui/GithubIcon";
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  ExternalLink,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FolderUp,
  Sparkles,
  Layers,
  Globe,
  Calendar,
  Image as ImageIcon,
  Tag,
  Star,
  RefreshCw,
  Archive,
  ArrowUpRight,
  Maximize2,
  Check,
  X,
  Lock,
} from "lucide-react";

export default function AdminProjectsPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Projects data state
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Project Editor Modal State
  const [editingProject, setEditingProject] = useState<Partial<ProjectDocument> | null>(null);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Quick notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Auth Listener
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdmin = await verifyAdminStatus(user);
        setAuthorized(isAdmin);
      } else {
        setAuthorized(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      if (db) {
        const q = query(collection(db, "projects"), orderBy("sortOrder", "asc"));
        const snap = await getDocs(q);
        const list: ProjectDocument[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as ProjectDocument));
        setProjects(list);
      } else {
        const list = await getAllProjectsAdmin();
        setProjects(list);
      }
    } catch (err) {
      console.warn("Could not fetch projects from Firestore:", err);
      // Fallback
      const list = await getAllProjectsAdmin();
      setProjects(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchProjects();
    }
  }, [authorized, fetchProjects]);

  // Auth Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await adminSignIn(emailInput, passwordInput);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  };

  // Categories list derived from existing projects
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === "published") {
        matchesStatus = p.published === true;
      } else if (statusFilter === "draft") {
        matchesStatus = p.published === false && p.publishingStatus !== "archived";
      } else if (statusFilter === "archived") {
        matchesStatus = p.publishingStatus === "archived";
      }

      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  // Toggle Publish Status
  const handleTogglePublish = async (project: ProjectDocument) => {
    const nextPublished = !project.published;
    const nextPubStatus: ProjectPublishStatus = nextPublished ? "published" : "draft";

    try {
      if (db) {
        const docRef = doc(db, "projects", project.id);
        await setDoc(
          docRef,
          {
            published: nextPublished,
            publishingStatus: nextPubStatus,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await saveProjectAdmin({
          ...project,
          published: nextPublished,
          publishingStatus: nextPubStatus,
        });
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? { ...p, published: nextPublished, publishingStatus: nextPubStatus }
            : p
        )
      );

      showToast(
        `Project "${project.name}" is now ${nextPublished ? "Published (Live)" : "Draft (Unpublished)"}.`,
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Failed to update status: ${msg}`, "error");
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      if (db) {
        await deleteDoc(doc(db, "projects", id));
      } else {
        await deleteProjectAdmin(id);
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(`Project "${name}" was permanently removed.`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Delete failed: ${msg}`, "error");
    }
  };

  // Open New Project
  const openNewProject = (initialUpload = false) => {
    const timestamp = Date.now();
    setEditingProject({
      id: `proj_${timestamp}`,
      name: "",
      slug: "",
      category: "Web Development",
      tagline: "",
      shortDescription: "",
      description: "",
      coverImage: "",
      logo: "",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      gallery: [],
      galleryItems: [],
      screenshots: [],
      url: "",
      githubUrl: "",
      completionDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      featured: false,
      sortOrder: projects.length,
      status: "Completed",
      publishingStatus: "published",
      published: true,
      seoTitle: "",
      seoDescription: "",
    });
    setSaveError(null);
    setSaveSuccess(null);
  };

  // Auto-slug generator
  const handleNameChange = (nameVal: string) => {
    if (!editingProject) return;
    const updates: Partial<ProjectDocument> = { name: nameVal };
    // Only auto-generate slug if slug is empty or was previously matched to the old name
    if (!editingProject.slug || editingProject.slug === slugify(editingProject.name || "")) {
      updates.slug = slugify(nameVal);
    }
    setEditingProject((prev) => ({ ...prev, ...updates }));
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Add Tech Tag
  const handleAddTech = () => {
    if (!techInput.trim() || !editingProject) return;
    const current = editingProject.technologies || [];
    if (!current.includes(techInput.trim())) {
      setEditingProject({
        ...editingProject,
        technologies: [...current, techInput.trim()],
      });
    }
    setTechInput("");
  };

  const handleRemoveTech = (tag: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      technologies: (editingProject.technologies || []).filter((t) => t !== tag),
    });
  };

  // Save Project Form Submit
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!editingProject.name?.trim()) {
      setSaveError("Project title is required.");
      return;
    }

    if (!editingProject.slug?.trim()) {
      setSaveError("Unique URL slug is required.");
      return;
    }

    // Check slug uniqueness
    const cleanSlug = slugify(editingProject.slug);
    const existingSlug = projects.find(
      (p) => p.slug.toLowerCase() === cleanSlug.toLowerCase() && p.id !== editingProject.id
    );
    if (existingSlug) {
      setSaveError(`A project with slug "${cleanSlug}" already exists (${existingSlug.name}). Please use a unique slug.`);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const now = new Date().toISOString();
      const isPublished = editingProject.published ?? (editingProject.publishingStatus === "published");
      const pubStatus: ProjectPublishStatus = editingProject.publishingStatus || (isPublished ? "published" : "draft");

      const cleanGalleryItems = editingProject.galleryItems || [];
      const cleanGalleryUrls = cleanGalleryItems.length > 0
        ? cleanGalleryItems.map((g) => g.url)
        : (editingProject.gallery || []);

      const coverImg = editingProject.coverImage || cleanGalleryUrls[0] || "";

      const payload: ProjectDocument = {
        id: editingProject.id || `proj_${Date.now()}`,
        name: editingProject.name.trim(),
        slug: cleanSlug,
        category: editingProject.category || "Web Development",
        tagline: editingProject.tagline?.trim() || "",
        shortDescription: editingProject.shortDescription?.trim() || editingProject.tagline?.trim() || editingProject.name.trim(),
        description: editingProject.description?.trim() || "",
        coverImage: coverImg,
        logo: editingProject.logo?.trim() || undefined,
        gallery: cleanGalleryUrls,
        galleryItems: cleanGalleryItems,
        screenshots: editingProject.screenshots || [],
        technologies: editingProject.technologies || ["Next.js", "TypeScript"],
        scope: editingProject.scope || [],
        deliverables: editingProject.deliverables || [],
        metrics: editingProject.metrics || [],
        url: editingProject.url?.trim() || undefined,
        githubUrl: editingProject.githubUrl?.trim() || undefined,
        completionDate: editingProject.completionDate?.trim() || undefined,
        featured: Boolean(editingProject.featured),
        sortOrder: typeof editingProject.sortOrder === "number" ? editingProject.sortOrder : 0,
        highlight: editingProject.highlight?.trim() || undefined,
        accentColor: editingProject.accentColor?.trim() || "#935073",
        videoUrl: editingProject.videoUrl?.trim() || undefined,
        videos: editingProject.videos || [],
        seoTitle: editingProject.seoTitle?.trim() || undefined,
        seoDescription: editingProject.seoDescription?.trim() || undefined,
        status: editingProject.status || (isPublished ? "Completed" : "Draft"),
        publishingStatus: pubStatus,
        published: isPublished,
        createdAt: editingProject.createdAt || now,
        updatedAt: now,
      };

      if (db) {
        await setDoc(doc(db, "projects", payload.id), payload, { merge: true });
      } else {
        await saveProjectAdmin(payload);
      }

      setProjects((prev) => {
        const idx = prev.findIndex((p) => p.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [payload, ...prev];
      });

      showToast(
        `Project "${payload.name}" successfully ${isPublished ? "published to live portfolio" : "saved as draft"}.`,
        "success"
      );
      setEditingProject(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Failed to save project: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#502D55]/15 shadow-sm text-xs font-mono text-[#56475C]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#935073]" />
          <span>Verifying studio credentials...</span>
        </div>
      </div>
    );
  }

  // Not logged in or not authorized
  if (!currentUser || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFBF9]">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#502D55]/15 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/15 text-[#935073] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#180D1D]">Protected Studio Portal</h1>
            <p className="text-xs text-[#56475C]">
              Sign in with authorized administrator credentials to manage portfolio projects.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#56475C] mb-1">Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="imdad.builds@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#56475C] mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Sign In to Publishing Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-[#502D55]/10 text-center">
            <Link href="/" className="text-xs text-[#56475C] hover:text-[#180D1D] inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Projects Page View
  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-24">
      {/* Toast banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all border ${
            toastMessage.type === "success"
              ? "bg-white text-emerald-800 border-emerald-200"
              : "bg-white text-red-800 border-red-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Sub-Navbar */}
      <div className="border-b border-[#502D55]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-1.5 rounded-xl border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors"
                title="Back to Central Admin"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-[#180D1D] flex items-center gap-2">
                  <span>Portfolio Project Manager</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                    {projects.length} Total
                  </span>
                </h1>
                <p className="text-[11px] text-[#56475C]">
                  Direct publishing, bulk folder upload, asset management, and live previews
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openNewProject(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] hover:bg-[#F3E5D8] transition-all cursor-pointer shadow-xs"
              >
                <FolderUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bulk Folder Upload</span>
              </button>

              <button
                type="button"
                onClick={() => openNewProject(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Project</span>
              </button>

              <Link
                href="/projects"
                target="_blank"
                className="p-2 rounded-xl border border-[#502D55]/15 text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors"
                title="View Live Public Portfolio"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
          <div className="p-4 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs">
            <span className="text-[10px] font-mono text-[#56475C] block uppercase tracking-wider">
              Published (Live)
            </span>
            <div className="text-2xl font-black text-[#180D1D] mt-1">
              {projects.filter((p) => p.published).length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Visible to public visitors</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs">
            <span className="text-[10px] font-mono text-[#56475C] block uppercase tracking-wider">
              Drafts (Private)
            </span>
            <div className="text-2xl font-black text-[#180D1D] mt-1">
              {projects.filter((p) => !p.published && p.publishingStatus !== "archived").length}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">Internal preview only</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs">
            <span className="text-[10px] font-mono text-[#56475C] block uppercase tracking-wider">
              Featured Case Studies
            </span>
            <div className="text-2xl font-black text-[#180D1D] mt-1">
              {projects.filter((p) => p.featured).length}
            </div>
            <span className="text-[10px] text-[#935073] font-medium">Promoted on homepage</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs">
            <span className="text-[10px] font-mono text-[#56475C] block uppercase tracking-wider">
              Total Uploaded Assets
            </span>
            <div className="text-2xl font-black text-[#180D1D] mt-1">
              {projects.reduce((acc, p) => acc + (p.galleryItems?.length || p.gallery?.length || 0), 0)}
            </div>
            <span className="text-[10px] text-blue-600 font-medium">Stored in Firebase Storage</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#502D55]/12 shadow-xs space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, slug, category, technology..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] focus:outline-none focus:border-[#935073]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center bg-[#FAF4F9] p-0.5 rounded-xl border border-[#502D55]/15 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === "all" ? "bg-white text-[#180D1D] font-bold shadow-xs" : "text-[#56475C]"
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("published")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === "published" ? "bg-white text-emerald-700 font-bold shadow-xs" : "text-[#56475C]"
                  }`}
                >
                  Published ({projects.filter((p) => p.published).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("draft")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === "draft" ? "bg-white text-amber-700 font-bold shadow-xs" : "text-[#56475C]"
                  }`}
                >
                  Drafts ({projects.filter((p) => !p.published && p.publishingStatus !== "archived").length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("archived")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === "archived" ? "bg-white text-gray-700 font-bold shadow-xs" : "text-[#56475C]"
                  }`}
                >
                  Archived ({projects.filter((p) => p.publishingStatus === "archived").length})
                </button>
              </div>

              {/* Category Dropdown */}
              {availableCategories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Project List / Table */}
        <div className="bg-white rounded-3xl border border-[#502D55]/12 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-[#56475C] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#935073]" />
              <span>Loading projects from Firestore...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4F9] text-[#935073] flex items-center justify-center mx-auto">
                <FolderUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#180D1D]">No projects match your filter.</p>
              <p className="text-xs text-[#56475C]">Create a new portfolio project or clear active search filters.</p>
              <button
                type="button"
                onClick={() => openNewProject(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4F9] border-b border-[#502D55]/10 text-[10px] font-mono text-[#56475C] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project / Category</th>
                    <th className="py-3 px-4">Slug &amp; Links</th>
                    <th className="py-3 px-4">Assets</th>
                    <th className="py-3 px-4">Technologies</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#502D55]/10">
                  {filteredProjects.map((proj) => {
                    const assetCount = proj.galleryItems?.length || proj.gallery?.length || 0;

                    return (
                      <tr key={proj.id} className="hover:bg-[#FAF4F9]/60 transition-colors">
                        {/* Cover + Title + Category */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {proj.coverImage ? (
                              <img
                                src={proj.coverImage}
                                alt={proj.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-[#180D1D] text-sm flex items-center gap-1.5">
                                <span>{proj.name}</span>
                                {proj.featured && (
                                  <span className="p-0.5 text-amber-500" title="Featured Project">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-[#7A3F26]">
                                {proj.category}
                                {proj.completionDate && ` • ${proj.completionDate}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Slug & Links */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] text-[#56475C]">
                            /{proj.slug}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            {proj.published && (
                              <Link
                                href={`/projects/${proj.slug}`}
                                target="_blank"
                                className="text-[10px] text-[#935073] hover:underline flex items-center gap-0.5"
                              >
                                <span>Public Page</span>
                                <ArrowUpRight className="w-2.5 h-2.5" />
                              </Link>
                            )}
                            {proj.url && (
                              <a
                                href={proj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                <span>Live URL</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-gray-600 hover:underline flex items-center gap-0.5"
                              >
                                <GithubIcon size={11} />
                                <span>Code</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Assets count */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
                            <ImageIcon className="w-3 h-3" />
                            <span>{assetCount} assets</span>
                          </span>
                        </td>

                        {/* Tech stack */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies?.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-md bg-[#FAF4F9] text-[9px] font-mono text-[#56475C] border border-[#502D55]/10"
                              >
                                {t}
                              </span>
                            ))}
                            {(proj.technologies?.length || 0) > 3 && (
                              <span className="text-[9px] font-mono text-gray-400 self-center">
                                +{(proj.technologies?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Featured */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              proj.featured
                                ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                                : "text-gray-400"
                            }`}
                          >
                            {proj.featured ? "Featured" : "Standard"}
                          </span>
                        </td>

                        {/* Publish Status Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(proj)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                              proj.published
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                            }`}
                            title={proj.published ? "Click to set as Draft" : "Click to Publish"}
                          >
                            {proj.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{proj.published ? "Published" : "Draft"}</span>
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProject(proj);
                                setSaveError(null);
                                setSaveSuccess(null);
                              }}
                              className="p-1.5 rounded-lg text-[#56475C] hover:text-[#180D1D] hover:bg-[#FAF4F9] transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id, proj.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>

      {/* ======================================================== */}
      {/* FULL PROJECT PUBLISHING & ASSET MANAGER MODAL            */}
      {/* ======================================================== */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/20 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#502D55]/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#180D1D] flex items-center gap-2">
                  <span>{editingProject.name ? `Edit: ${editingProject.name}` : "Create New Portfolio Project"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0]">
                    {editingProject.publishingStatus || (editingProject.published ? "published" : "draft")}
                  </span>
                </h3>
                <p className="text-xs text-[#56475C]">
                  Configure title, slug, content, SEO, and bulk upload folder images
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {saveError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-6">
              {/* SECTION A: PRIMARY IDENTIFIERS */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#935073] font-bold">
                  1. Project Identification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.name || ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. EasyXO Brand &amp; Storefront"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] focus:outline-none focus:border-[#935073]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      URL Slug * (Unique)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 rounded-l-xl bg-gray-100 border border-r-0 border-[#502D55]/15 text-xs font-mono text-gray-500">
                        /projects/
                      </span>
                      <input
                        type="text"
                        required
                        value={editingProject.slug || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, slug: slugify(e.target.value) })}
                        placeholder="easyxo-brand-storefront"
                        className="w-full px-3.5 py-2.5 rounded-r-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs font-mono text-[#180D1D] focus:outline-none focus:border-[#935073]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Category *
                    </label>
                    <select
                      value={editingProject.category || "Web Development"}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Amazon Listing Design">Amazon Listing Design</option>
                      <option value="Apps & Products">Apps & Products</option>
                      <option value="AI/SaaS">AI/SaaS</option>
                      <option value="Design & Branding">Design & Branding</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Completion Date
                    </label>
                    <input
                      type="text"
                      value={editingProject.completionDate || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, completionDate: e.target.value })}
                      placeholder="e.g. March 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Project Status Label
                    </label>
                    <input
                      type="text"
                      value={editingProject.status || "Completed"}
                      onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                      placeholder="Completed / Live Store / In Production"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                    Short Tagline / Summary (1-2 sentences)
                  </label>
                  <input
                    type="text"
                    value={editingProject.tagline || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                    placeholder="High-converting D2C brand storefront engineered with Next.js 16 and Stripe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                    Full Project Narrative &amp; Case Study Description
                  </label>
                  <textarea
                    rows={5}
                    value={editingProject.description || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Detailed explanation of the project context, technical architecture, visual engineering, client problem solved, and business outcomes."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D] leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION B: BULK FOLDER & MEDIA ASSETS */}
              <div className="space-y-4 pt-4 border-t border-[#502D55]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#935073] font-bold">
                      2. Project Assets &amp; Bulk Gallery Upload
                    </h4>
                    <p className="text-xs text-[#56475C]">
                      Drag a folder of images or select multiple files. Add captions, reorder, and designate a cover photo.
                    </p>
                  </div>
                </div>

                {/* Bulk Uploader Engine */}
                <BulkAssetUploader
                  category="projects"
                  subfolder={editingProject.slug || "temp"}
                  items={editingProject.galleryItems || []}
                  onChange={(newItems) =>
                    setEditingProject({
                      ...editingProject,
                      galleryItems: newItems,
                      gallery: newItems.map((n) => n.url),
                      coverImage: editingProject.coverImage || newItems[0]?.url || "",
                    })
                  }
                  coverImageUrl={editingProject.coverImage}
                  onSetCoverImage={(url) => setEditingProject({ ...editingProject, coverImage: url })}
                />
              </div>

              {/* SECTION C: LOGO, LINKS & TECH STACK */}
              <div className="space-y-4 pt-4 border-t border-[#502D55]/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#935073] font-bold">
                  3. Links, Stack &amp; External Integrations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Cover Image URL (Direct Override)
                    </label>
                    <input
                      type="url"
                      value={editingProject.coverImage || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                      placeholder="https://... (or select from gallery above)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Live Project URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
                      placeholder="https://easyxo.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      GitHub URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={editingProject.githubUrl || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Optional Showcase Video URL (MP4 / WebM / YouTube / Vimeo)
                    </label>
                    <input
                      type="text"
                      value={editingProject.videoUrl || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                      placeholder="https://.../demo.mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      Brand Logo URL
                    </label>
                    <input
                      type="text"
                      value={editingProject.logo || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, logo: e.target.value })}
                      placeholder="https://.../logo.png"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>
                </div>

                {/* Tech Stack Chips Editor */}
                <div>
                  <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                    Technologies Used
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTech();
                        }
                      }}
                      placeholder="Type technology (e.g. Next.js, Stripe, Tailwind) and press Add or Enter"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-4 py-2 rounded-xl bg-[#180D1D] text-white text-xs font-bold hover:bg-[#2B1435] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {editingProject.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs font-mono text-[#180D1D]"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION D: SEO & METADATA */}
              <div className="space-y-4 pt-4 border-t border-[#502D55]/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#935073] font-bold">
                  4. SEO &amp; Search Optimization
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={editingProject.seoTitle || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, seoTitle: e.target.value })}
                      placeholder="Default: [Project Title] — Case Study | IMDAD.BUILDS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#56475C] mb-1 font-bold">
                      SEO Meta Description
                    </label>
                    <input
                      type="text"
                      value={editingProject.seoDescription || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, seoDescription: e.target.value })}
                      placeholder="Comprehensive overview for search engines and social cards"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: PUBLISHING CONTROLS */}
              <div className="space-y-4 pt-4 border-t border-[#502D55]/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#935073] font-bold">
                  5. Publishing Controls
                </h4>

                <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/15">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#180D1D]">
                    <input
                      type="radio"
                      name="pubStatus"
                      checked={editingProject.published === true}
                      onChange={() =>
                        setEditingProject({
                          ...editingProject,
                          published: true,
                          publishingStatus: "published",
                        })
                      }
                      className="text-[#935073] focus:ring-[#935073]"
                    />
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Published (Immediately Live on Website)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#180D1D]">
                    <input
                      type="radio"
                      name="pubStatus"
                      checked={editingProject.published === false && editingProject.publishingStatus !== "archived"}
                      onChange={() =>
                        setEditingProject({
                          ...editingProject,
                          published: false,
                          publishingStatus: "draft",
                        })
                      }
                      className="text-[#935073] focus:ring-[#935073]"
                    />
                    <span className="flex items-center gap-1 text-amber-700">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Save as Draft (Private to Studio Admin)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#180D1D]">
                    <input
                      type="radio"
                      name="pubStatus"
                      checked={editingProject.publishingStatus === "archived"}
                      onChange={() =>
                        setEditingProject({
                          ...editingProject,
                          published: false,
                          publishingStatus: "archived",
                        })
                      }
                      className="text-[#935073] focus:ring-[#935073]"
                    />
                    <span className="flex items-center gap-1 text-gray-700">
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archived</span>
                    </span>
                  </label>

                  <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[#502D55]/15 pt-2 sm:pt-0 sm:pl-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#180D1D]">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProject.featured)}
                        onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      />
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Promote as Featured Case Study</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#502D55]/10">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#56475C] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#180D1D] hover:bg-[#2B1435] text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {editingProject.published ? "Publish Project" : "Save Draft"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
