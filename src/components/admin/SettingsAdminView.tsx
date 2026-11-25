"use client";

import React, { useState, useEffect } from "react";
import type { SettingsDocument } from "@/types/cms";
import { MediaLibraryModal } from "./MediaLibraryModal";
import {
  Save,
  RefreshCw,
  Image as ImageIcon,
  Phone,
  Bot,
  Database,
  Building2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface SettingsAdminViewProps {
  settings: SettingsDocument | null;
  onSaveSettings: (updated: SettingsDocument) => Promise<void>;
  onSeedDemoData: () => Promise<void>;
  seedingDemo?: boolean;
}

export function SettingsAdminView({
  settings,
  onSaveSettings,
  onSeedDemoData,
  seedingDemo = false,
}: SettingsAdminViewProps) {
  const [formState, setFormState] = useState<SettingsDocument | null>(settings);
  const [activeSection, setActiveSection] = useState<
    "profile" | "contact" | "ai-services" | "system"
  >("profile");
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    "primaryLogo" | "secondaryLogo" | "favicon" | null
  >(null);

  useEffect(() => {
    queueMicrotask(() => {
      setFormState(settings);
    });
  }, [settings]);

  if (!formState) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8DFD5] p-12 text-center text-xs text-[#6E625B]">
        Loading settings...
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSavedBanner(false);
    try {
      await onSaveSettings({
        ...formState,
        id: "global",
        published: true,
        updatedAt: new Date().toISOString(),
      });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    } catch {
      // alert already shown in parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#332924]">Studio Settings &amp; Brand Profile</h2>
          <p className="text-xs text-[#6E625B]">
            Update your logos, contact numbers, AI Resume tool config, and starter data templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedBanner && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "profile", label: "Studio & Logos", icon: Building2 },
          { id: "contact", label: "Contact & Links", icon: Phone },
          { id: "ai-services", label: "AI Resume Tool", icon: Bot },
          { id: "system", label: "System & Seed Data", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                active
                  ? "bg-[#332924] text-white"
                  : "bg-white text-[#5F534D] border border-[#E8DFD5] hover:bg-[#FAECE4]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-2xs space-y-5 text-xs">
        {activeSection === "profile" && (
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#332924] block mb-1">Studio Name</label>
                <input
                  type="text"
                  value={formState.studioName || ""}
                  onChange={(e) => setFormState({ ...formState, studioName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>
              <div>
                <label className="font-bold text-[#332924] block mb-1">Live Site URL</label>
                <input
                  type="text"
                  value={formState.liveUrl || ""}
                  onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#332924] block mb-1">Studio Tagline</label>
              <input
                type="text"
                value={formState.tagline || ""}
                onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
              />
            </div>

            {/* Logo Pickers */}
            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[#F3ECE4]">
              {(
                [
                  { key: "primaryLogo", label: "Primary Logo URL (Navbar & Hero)" },
                  { key: "secondaryLogo", label: "Secondary Logo URL (Footer)" },
                  { key: "favicon", label: "Favicon URL" },
                ] as const
              ).map((item) => (
                <div key={item.key}>
                  <label className="font-bold text-[#332924] block mb-1">{item.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={(formState[item.key] as string) || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, [item.key]: e.target.value })
                      }
                      placeholder="/imdad-logo.png or https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget(item.key)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#C96A50]" />
                      <span>Pick Image</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#332924] block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formState.contactEmail || ""}
                  onChange={(e) => setFormState({ ...formState, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>
              <div>
                <label className="font-bold text-[#332924] block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formState.whatsappNumber || ""}
                  onChange={(e) =>
                    setFormState({ ...formState, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#332924] block mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={formState.instagramHandle || ""}
                  onChange={(e) =>
                    setFormState({ ...formState, instagramHandle: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>
              <div>
                <label className="font-bold text-[#332924] block mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={formState.instagramUrl || ""}
                  onChange={(e) =>
                    setFormState({ ...formState, instagramUrl: e.target.value })
                  }
                  placeholder="https://www.instagram.com/imdad.builds"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "ai-services" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-display font-bold text-sm text-[#332924]">
              AI Resume Builder Controls
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.resumeBuilder?.enabled ?? true}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      resumeBuilder: {
                        ...(formState.resumeBuilder || {}),
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
                <span>Enable AI Resume Tool</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.resumeBuilder?.isFreeBeta ?? true}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      resumeBuilder: {
                        ...(formState.resumeBuilder || {}),
                        isFreeBeta: e.target.checked,
                      },
                    })
                  }
                />
                <span>Free Access Mode</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.resumeBuilder?.maintenanceMode ?? false}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      resumeBuilder: {
                        ...(formState.resumeBuilder || {}),
                        maintenanceMode: e.target.checked,
                      },
                    })
                  }
                />
                <span>Pause AI Resume Tool</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#332924] block mb-1">Daily IP Limit</label>
                <input
                  type="number"
                  value={formState.resumeBuilder?.dailyIpLimit ?? 5}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      resumeBuilder: {
                        ...(formState.resumeBuilder || {}),
                        dailyIpLimit: Number(e.target.value) || 5,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>
              <div>
                <label className="font-bold text-[#332924] block mb-1">Notice Banner</label>
                <input
                  type="text"
                  value={formState.resumeBuilder?.noticeBanner || ""}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      resumeBuilder: {
                        ...(formState.resumeBuilder || {}),
                        noticeBanner: e.target.value,
                      },
                    })
                  }
                  placeholder="Optional top banner message..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5]"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "system" && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.maintenanceMode ?? false}
                  onChange={(e) =>
                    setFormState({ ...formState, maintenanceMode: e.target.checked })
                  }
                />
                <span>Site Maintenance Mode</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-[#332924] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.allowPublicReviews ?? true}
                  onChange={(e) =>
                    setFormState({ ...formState, allowPublicReviews: e.target.checked })
                  }
                />
                <span>Allow Public Review Submissions</span>
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
              <div>
                <h4 className="font-display font-bold text-sm text-[#332924]">
                  Sync Default Studio Templates
                </h4>
                <p className="text-xs text-[#6E625B] mt-1">
                  Safely writes initial studio services, packages, projects, and homepage sections to Cloud Firestore without deleting your custom edits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onSeedDemoData()}
                disabled={seedingDemo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#332924] hover:bg-[#4A3D36] text-white font-bold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seedingDemo ? "animate-spin" : ""}`} />
                <span>{seedingDemo ? "Syncing Templates..." : "Sync Starter Data to Firestore"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {pickerTarget && (
        <MediaLibraryModal
          isOpen={true}
          onClose={() => setPickerTarget(null)}
          onSelect={(asset) => {
            setFormState({ ...formState, [pickerTarget]: asset.url });
          }}
        />
      )}
    </div>
  );
}
