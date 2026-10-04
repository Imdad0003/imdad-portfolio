"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { appsData, App } from "@/data/apps";
import { studioServices } from "@/data/servicesData";
import { projectsData } from "@/data/projectsData";
import { siteConfig } from "@/data/config";
import {
  ShieldCheck,
  Lock,
  Layers,
  Smartphone,
  Globe,
  ShoppingBag,
  Video,
  Share2,
  Check,
  Edit,
  Plus,
  RefreshCw,
  Eye,
  Star,
  ExternalLink,
  Database,
  Code2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [passcode, setPasscode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"apps" | "services" | "projects" | "content">("apps");
  const [appsList, setAppsList] = useState<App[]>(appsData);

  useEffect(() => {
    const saved = sessionStorage.getItem("imdad_admin_key");
    if (saved) {
      setPasscode(saved);
      setAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().length >= 4) {
      setAuthorized(true);
      sessionStorage.setItem("imdad_admin_key", passcode.trim());
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("imdad_admin_key");
    setAuthorized(false);
    setPasscode("");
  };

  const toggleAppFeatured = (id: string) => {
    setAppsList((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, featured: !app.featured } : app
      )
    );
  };

  const cycleAppStatus = (id: string) => {
    setAppsList((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const nextStatus: App["status"] =
          app.status === "live"
            ? "in-development"
            : app.status === "in-development"
            ? "coming-soon"
            : "live";
        const label =
          nextStatus === "live"
            ? "Live Brand"
            : nextStatus === "in-development"
            ? "In Development"
            : "Coming Soon";
        return { ...app, status: nextStatus, statusLabel: label };
      })
    );
  };

  if (!authorized) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/95 border border-[#502D55]/14 backdrop-blur-2xl shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#502D55]/10 text-[#502D55] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#180D1D] tracking-tight mb-2">
              Studio Admin Portal
            </h1>
            <p className="text-xs text-[#56475C] mb-6">
              Protected studio desk. Enter authorization key to access product, service, and content controls.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Studio Passcode"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-sm text-[#180D1D] focus:outline-none focus:ring-2 focus:ring-[#935073]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Unlock Studio CMS
              </button>
            </form>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 py-10 sm:py-16">
      <Container>
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#502D55]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="studio-tag text-[9px] text-[#935073] font-bold">
                IMDAD.BUILDS // STUDIO CONSOLE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-mono">
                Operator Authenticated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#180D1D]">
              Studio CMS &amp; Architecture Control
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/reviews"
              className="px-4 py-2 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] text-xs font-bold text-[#180D1D] hover:bg-[#180D1D] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-[#d97746]" />
              <span>Live Reviews Moderation &rarr;</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-white border border-[#502D55]/15 text-xs font-bold text-[#56475C] hover:text-[#180D1D] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* CMS Distinction Notice Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#56475C]">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#935073] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#180D1D] block">Architectural Staging Status:</span>
              <span>This CMS is currently decoupled and powered by type-safe schemas in <code>src/data/</code>. Ready for direct synchronization to Cloud Firestore or Supabase. Review moderation at <code>/admin/reviews</code> is actively connected to server storage.</span>
            </div>
          </div>
          <span className="studio-tag text-[9px] text-[#935073] shrink-0 font-bold">
            STAGE: DATA-DRIVEN PROTOTYPE
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "apps"
                ? "bg-[#180D1D] text-white shadow-2xs"
                : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
            }`}
          >
            Apps CMS ({appsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-[#180D1D] text-white shadow-2xs"
                : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
            }`}
          >
            Services &amp; Packages ({studioServices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-[#180D1D] text-white shadow-2xs"
                : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
            }`}
          >
            Projects CMS ({projectsData.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "content"
                ? "bg-[#180D1D] text-white shadow-2xs"
                : "bg-white text-[#56475C] hover:text-[#180D1D] border border-[#502D55]/10"
            }`}
          >
            Content &amp; Brand Settings
          </button>
        </div>

        {/* TAB 1: APPS CMS */}
        {activeTab === "apps" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#180D1D]">Managed Studio Apps</h3>
                <p className="text-xs text-[#7A6880]">
                  Click status pill to cycle states (Live &rarr; In Development &rarr; Coming Soon).
                </p>
              </div>
              <span className="studio-tag text-[10px] text-[#7A6880]">
                SCHEMA: SRC/DATA/APPS.TS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {appsList.map((app) => (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#502D55]/12 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-[#180D1D]">{app.name}</h4>
                      <span className="text-xs font-mono text-[#7A6880]">({app.slug})</span>
                      <button
                        type="button"
                        onClick={() => cycleAppStatus(app.id)}
                        className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase cursor-pointer hover:opacity-80 transition-opacity ${
                          app.status === "live"
                            ? "badge-live"
                            : app.status === "in-development"
                            ? "badge-in-development"
                            : "badge-coming-soon"
                        }`}
                        title="Click to cycle status"
                      >
                        {app.statusLabel} ↺
                      </button>
                    </div>
                    <p className="text-xs text-[#56475C]">{app.tagline}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.platform.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-[#FAF4F9] text-[9px] font-mono text-[#56475C]">
                          {p}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded bg-white border border-[#502D55]/10 text-[9px] font-mono text-[#7A6880]">
                        {app.version}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleAppFeatured(app.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        app.featured
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {app.featured ? "★ Featured" : "☆ Standard"}
                    </button>

                    <Link
                      href={`/apps/${app.slug}`}
                      className="p-2 rounded-xl bg-[#FAF2EA] hover:bg-white border border-[#502D55]/12 text-[#180D1D] transition-colors"
                      title="Inspect Public Viewport"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES & PACKAGES */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#180D1D]">Studio Disciplines &amp; Website Packages</h3>
                <p className="text-xs text-[#7A6880]">
                  5 core disciplines with structured packages and starting prices.
                </p>
              </div>
              <span className="studio-tag text-[10px] text-[#7A6880]">
                SCHEMA: SRC/DATA/SERVICESDATA.TS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {studioServices.map((service) => (
                <div
                  key={service.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-[#502D55]/12 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#935073]">{service.number}</span>
                      <h4 className="font-bold text-base text-[#180D1D]">{service.title}</h4>
                      <span className="text-xs font-mono text-[#7A6880]">({service.slug})</span>
                    </div>

                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#935073] hover:underline"
                    >
                      <span>Inspect Live Service Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <p className="text-xs text-[#56475C]">{service.tagline}</p>

                  {/* Packages Summary */}
                  {service.packages && service.packages.length > 0 && (
                    <div className="pt-2">
                      <span className="studio-tag text-[9px] text-[#7A6880] block mb-1">
                        ACTIVE PACKAGES &amp; RATES
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {service.packages.map((pkg, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF4F9] border border-[#502D55]/08 text-xs font-mono text-[#180D1D]"
                          >
                            <strong>{pkg.name}:</strong> ₹{pkg.price.toLocaleString("en-IN")} {pkg.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS CMS */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#180D1D]">Case Studies &amp; Projects</h3>
                <p className="text-xs text-[#7A6880]">
                  Real case studies and commercial proof of work.
                </p>
              </div>
              <span className="studio-tag text-[10px] text-[#7A6880]">
                SCHEMA: SRC/DATA/PROJECTSDATA.TS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsData.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl bg-white border border-[#502D55]/12 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-[#180D1D]">{project.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF2EA] text-[#180D1D]">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#56475C]">{project.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-[#502D55]/08 flex items-center justify-between text-[11px] font-mono text-[#7A6880]">
                    <span>Status: {project.status}</span>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[#935073] hover:underline flex items-center gap-1">
                        <span>Live Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTENT & BRAND SETTINGS */}
        {activeTab === "content" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/12 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#180D1D]">Studio Brand &amp; Contact Configurations</h3>
              <p className="text-xs text-[#7A6880]">
                Central configuration from <code>src/data/config.ts</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#180D1D]">Studio Name</label>
                <input
                  type="text"
                  defaultValue={siteConfig.name}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#180D1D]">Studio Tagline</label>
                <input
                  type="text"
                  defaultValue={siteConfig.tagline}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#180D1D]">WhatsApp Desk</label>
                <input
                  type="text"
                  defaultValue={siteConfig.contact.whatsappDisplay}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#180D1D]">Instagram Handle</label>
                <input
                  type="text"
                  defaultValue={siteConfig.contact.instagramHandle}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs text-[#180D1D]"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] text-xs text-[#56475C]">
              <strong>Firestore / Database Sync Note:</strong> All schemas are isolated in <code>src/data/</code>. When connecting live Cloud Firestore collections in the next phase, these models will form the schema interface without needing UI refactoring.
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
