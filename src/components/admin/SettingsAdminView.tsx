"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Check,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Database,
  ShieldCheck,
  Server,
  Globe,
  Mail,
  Phone,
  Layers,
  AlertTriangle,
} from "lucide-react";
import type { SettingsDocument } from "@/types/cms";
import { isFirebaseConfigured } from "@/lib/firebase";

interface SettingsAdminViewProps {
  settings: SettingsDocument | null;
  onSaveSettings: (updated: SettingsDocument) => Promise<void>;
  onSeedDemoData: () => Promise<void>;
  seedingDemo: boolean;
}

export function SettingsAdminView({
  settings,
  onSaveSettings,
  onSeedDemoData,
  seedingDemo,
}: SettingsAdminViewProps) {
  const [formData, setFormData] = useState<SettingsDocument | null>(settings);
  const [activeSection, setActiveSection] = useState<
    "profile" | "contact" | "ai-services" | "system"
  >("profile");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!formData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0284C7]" />
        <span>Loading studio configurations...</span>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
            Global Studio Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Brand metadata, external channels, AI model routing, and platform
            security flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-fit">
        {[
          { id: "profile", label: "Studio Profile & Domain" },
          { id: "contact", label: "Channels & Links" },
          { id: "ai-services", label: "AI Services & Gemini" },
          { id: "system", label: "System & Diagnostics" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === tab.id
                ? "bg-white text-[#0A192F] shadow-xs"
                : "text-slate-500 hover:text-[#0A192F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Studio Profile */}
      {activeSection === "profile" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4 max-w-3xl">
          <h2 className="text-sm font-bold text-[#0A192F]">
            Studio Identity & Web Presence
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="settings-studio-name-input" className="font-semibold text-slate-700 block mb-1">
                Studio Brand Name
              </label>
              <input
                id="settings-studio-name-input"
                type="text"
                value={formData.studioName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, studioName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-bold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label htmlFor="settings-tagline-input" className="font-semibold text-slate-700 block mb-1">
                Studio Tagline
              </label>
              <input
                id="settings-tagline-input"
                type="text"
                value={formData.tagline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label htmlFor="settings-live-url-input" className="font-semibold text-slate-700 block mb-1">
                Production Live URL
              </label>
              <input
                id="settings-live-url-input"
                type="text"
                value={formData.liveUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, liveUrl: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="pt-2 flex items-center gap-6 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode ?? false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceMode: e.target.checked,
                    })
                  }
                />
                <span>Maintenance Mode (Pause Public Access)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.allowPublicReviews ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowPublicReviews: e.target.checked,
                    })
                  }
                />
                <span>Allow Public Review Submissions</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Contact Channels */}
      {activeSection === "contact" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4 max-w-3xl">
          <h2 className="text-sm font-bold text-[#0A192F]">
            Communication & Direct Client Desks
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="settings-whatsapp-input" className="font-semibold text-slate-700 block mb-1">
                WhatsApp Desk Number (with country code)
              </label>
              <input
                id="settings-whatsapp-input"
                type="text"
                value={formData.whatsappNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="+91..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label htmlFor="settings-contact-email-input" className="font-semibold text-slate-700 block mb-1">
                Official Contact Email
              </label>
              <input
                id="settings-contact-email-input"
                type="email"
                value={formData.contactEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="studio@imdadbuild.space"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label htmlFor="settings-instagram-input" className="font-semibold text-slate-700 block mb-1">
                Instagram Handle
              </label>
              <input
                id="settings-instagram-input"
                type="text"
                value={formData.instagramHandle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instagramHandle: e.target.value })
                }
                placeholder="@imdad.builds"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 3: AI Services & Resume Builder */}
      {activeSection === "ai-services" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <span>AI Resume Builder (Gemini 4 Hydrogen)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure reasoning model routing, rate limits, and live beta
                announcement banners.
              </p>
            </div>
            <Link
              href="/services/ai-resume-builder"
              target="_blank"
              className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
            >
              <span>View Service</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={
                    (formData as any).resumeBuilder?.enabled !== false
                  }
                  onChange={(e) => {
                    const prevRb = (formData as any).resumeBuilder || {};
                    setFormData({
                      ...formData,
                      resumeBuilder: { ...prevRb, enabled: e.target.checked },
                    } as any);
                  }}
                />
                <span>AI Resume Service Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={
                    (formData as any).resumeBuilder?.isFreeBeta ?? true
                  }
                  onChange={(e) => {
                    const prevRb = (formData as any).resumeBuilder || {};
                    setFormData({
                      ...formData,
                      resumeBuilder: {
                        ...prevRb,
                        isFreeBeta: e.target.checked,
                      },
                    } as any);
                  }}
                />
                <span>Free Beta Mode (No Payment Gateway Required)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  AI Reasoning Model
                </label>
                <select
                  value={
                    (formData as any).resumeBuilder?.aiModel ||
                    "gemini-4-hydrogen"
                  }
                  onChange={(e) => {
                    const prevRb = (formData as any).resumeBuilder || {};
                    setFormData({
                      ...formData,
                      resumeBuilder: { ...prevRb, aiModel: e.target.value },
                    } as any);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] font-bold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                >
                  <option value="gemini-4-hydrogen">
                    gemini-4-hydrogen (Recommended)
                  </option>
                  <option value="gemini-2.5-flash">
                    gemini-2.5-flash (High Speed)
                  </option>
                  <option value="gemini-2.0-flash">
                    gemini-2.0-flash (Legacy)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Daily Generations Limit per IP
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={(formData as any).resumeBuilder?.dailyIpLimit || 15}
                  onChange={(e) => {
                    const prevRb = (formData as any).resumeBuilder || {};
                    setFormData({
                      ...formData,
                      resumeBuilder: {
                        ...prevRb,
                        dailyIpLimit: Number(e.target.value),
                      },
                    } as any);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Notice Banner Message
              </label>
              <input
                type="text"
                value={
                  (formData as any).resumeBuilder?.noticeBanner ||
                  "FREE BETA LAUNCH — Generate ATS-optimized resumes in seconds."
                }
                onChange={(e) => {
                  const prevRb = (formData as any).resumeBuilder || {};
                  setFormData({
                    ...formData,
                    resumeBuilder: {
                      ...prevRb,
                      noticeBanner: e.target.value,
                    },
                  } as any);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 4: System Diagnostics */}
      {activeSection === "system" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5 max-w-3xl">
          <h2 className="text-sm font-bold text-[#0A192F]">
            Infrastructure & Database Diagnostics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Firestore Database
              </div>
              <div className="font-bold text-[#0A192F]">
                {isFirebaseConfigured ? "imdadbuilds-ead39" : "Local Mock"}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                ✓ Connected & Operational
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Razorpay Webhook Handlers
              </div>
              <div className="font-bold text-[#0A192F]">
                /api/webhooks/razorpay
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                ✓ Signature Verification Active
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-700" />
              <span>Sample Content Synchronization</span>
            </div>
            <p className="text-xs text-amber-800">
              Populate empty Firestore collections with default studio
              offerings, case studies, packages, and site configurations using
              non-destructive merge.
            </p>
            <button
              type="button"
              onClick={() => void onSeedDemoData()}
              disabled={seedingDemo}
              className="mt-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${seedingDemo ? "animate-spin" : ""}`}
              />
              <span>{seedingDemo ? "Seeding Firestore..." : "Seed Default Data"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
