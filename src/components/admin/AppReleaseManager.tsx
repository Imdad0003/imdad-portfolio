"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { User } from "firebase/auth";
import { AppDocument } from "@/types/cms";
import { ApkParsedMetadata, AppReleaseDocument } from "@/types/releases";

interface AppReleaseManagerProps {
  currentUser: User | null;
  apps: AppDocument[];
  onReleaseCreated?: (release: AppReleaseDocument) => void;
  onNavigateToHistory?: () => void;
}

export function AppReleaseManager({
  currentUser,
  apps,
  onReleaseCreated,
  onNavigateToHistory,
}: AppReleaseManagerProps) {
  // 1. Form state
  const [selectedAppId, setSelectedAppId] = useState<string>(
    apps.find((a) => a.id === "wishmusic")?.id || apps[0]?.id || "wishmusic"
  );
  const [file, setFile] = useState<File | null>(null);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [channel, setChannel] = useState<"stable" | "beta">("stable");
  const [publishStatus, setPublishStatus] = useState<"published" | "draft">("published");
  const [customDownloadUrl, setCustomDownloadUrl] = useState("");

  // 2. Validation & Processing state
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [apkMeta, setApkMeta] = useState<ApkParsedMetadata | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // When app changes, clear previous file validation
  useEffect(() => {
    if (file) {
      handleValidateFile(file, selectedAppId);
    }
  }, [selectedAppId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await handleValidateFile(selected, selectedAppId);
  };

  const handleValidateFile = async (apkFile: File, appId: string) => {
    setValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setApkMeta(null);
    setPublishSuccess(null);
    setPublishError(null);

    try {
      if (!currentUser) {
        throw new Error("You must be logged in as an administrator.");
      }

      const token = await currentUser.getIdToken();
      const currentApp = apps.find((a) => a.id === appId);
      const expectedPackage = currentApp?.packageName || (appId === "wishmusic" ? "com.imdad.wishmusic" : undefined);
      const currentLatestVersionCode = currentApp?.latestVersionCode;
      const approvedFingerprint = currentApp?.approvedCertificateFingerprint;

      const fd = new FormData();
      fd.append("apkFile", apkFile);
      if (expectedPackage) fd.append("expectedPackage", expectedPackage);
      if (currentLatestVersionCode) fd.append("currentLatestVersionCode", String(currentLatestVersionCode));
      if (approvedFingerprint) fd.append("approvedFingerprint", approvedFingerprint);

      const res = await fetch("/api/admin/apps/releases/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setValidationErrors(data.errors || [data.error || "Validation failed."]);
        setValidationWarnings(data.warnings || []);
        if (data.metadata) setApkMeta(data.metadata);
      } else {
        setApkMeta(data.metadata);
        setValidationWarnings(data.warnings || []);
        // Auto-fill title if empty
        if (!releaseTitle && data.metadata) {
          setReleaseTitle(`${currentApp?.name || "App"} v${data.metadata.versionName}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([`Validation request failed: ${msg}`]);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !apkMeta) {
      setPublishError("Please select a valid APK file before proceeding.");
      return;
    }
    if (validationErrors.length > 0) {
      setPublishError("Resolve validation errors before publishing.");
      return;
    }

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      if (!currentUser) throw new Error("Administrator session expired.");
      const token = await currentUser.getIdToken();

      const fd = new FormData();
      fd.append("apkFile", file);
      fd.append("appId", selectedAppId);
      fd.append("appName", selectedApp?.name || "WishMusic");
      fd.append("releaseTitle", releaseTitle || `${selectedApp?.name} v${apkMeta.versionName}`);
      fd.append("releaseNotes", releaseNotes || "Standard production release.");
      fd.append("channel", channel);
      fd.append("status", publishStatus);
      if (customDownloadUrl) fd.append("customDownloadUrl", customDownloadUrl);

      const res = await fetch("/api/admin/apps/releases/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPublishError(data.errors?.join(" • ") || data.error || "Failed to publish release.");
      } else {
        setPublishSuccess(
          `Release v${data.release.versionName} successfully ${publishStatus === "published" ? "published" : "saved as draft"}! Download page updated.`
        );
        if (onReleaseCreated) {
          onReleaseCreated(data.release);
        }
        // Reset form
        setFile(null);
        setApkMeta(null);
        setReleaseTitle("");
        setReleaseNotes("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(`Upload error: ${msg}`);
    } finally {
      setPublishing(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="studio-tag text-[10px] text-[#935073] font-bold">
              APP DISTRIBUTION // RELEASE MANAGER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#180D1D]">
            Publish Application Release
          </h2>
          <p className="text-xs sm:text-sm text-[#56475C] mt-0.5">
            Upload, validate, sign-check, and distribute official Android binaries for your studio apps.
          </p>
        </div>

        {onNavigateToHistory && (
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/15 text-xs font-bold text-[#180D1D] hover:bg-[#502D55]/08 transition-all shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#935073]" />
            <span>View Release History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">{publishSuccess}</div>
        </div>
      )}

      {publishError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="font-semibold">{publishError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Target App & APK Upload (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. App Selector */}
            <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-3">
              <label className="text-xs font-bold text-[#180D1D] block">
                1. Select Application Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {apps.map((app) => {
                  const isSelected = selectedAppId === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#502D55]/08 border-[#502D55] ring-2 ring-[#502D55]/20 shadow-xs"
                          : "bg-white border-[#502D55]/10 hover:border-[#502D55]/30 hover:bg-[#FAF4F9]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                          style={{ backgroundColor: app.accentColor || "#935073" }}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-[#180D1D] truncate">
                            {app.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#7A6880] truncate">
                            {app.version || "No release yet"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedApp && (
                <div className="p-3 rounded-xl bg-[#FAF4F9] border border-[#502D55]/10 text-xs flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#56475C]">
                    Expected Package ID:{" "}
                    <code className="font-mono font-bold text-[#180D1D]">
                      {selectedApp.packageName || (selectedApp.id === "wishmusic" ? "com.imdad.wishmusic" : "Any")}
                    </code>
                  </span>
                  {selectedApp.latestVersionCode && (
                    <span className="font-mono text-[10px] text-[#935073]">
                      Current Version Code: #{selectedApp.latestVersionCode}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. APK Upload Dropzone */}
            <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#180D1D]">
                  2. Upload Android APK (.apk)
                </label>
                <span className="text-[10px] font-mono text-[#7A6880]">
                  Max 150MB &bull; Production Signed Only
                </span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                  file
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-[#502D55]/20 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] hover:border-[#502D55]/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-white border border-[#502D55]/10 flex items-center justify-center mx-auto text-[#935073] mb-3 shadow-2xs">
                  {validating ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#935073]" />
                  ) : file ? (
                    <FileCode className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="text-sm font-bold text-[#180D1D]">
                  {validating
                    ? "Validating APK structure, signature, and manifest..."
                    : file
                    ? file.name
                    : "Click to select or drag and drop an Android APK"}
                </div>
                <p className="text-xs text-[#7A6880] mt-1">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for deployment`
                    : "Supports Release APKs built with Gradle, Expo, or React Native"}
                </p>
              </div>

              {/* Validation Status & Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>APK Validation Blocked ({validationErrors.length} Issue{validationErrors.length > 1 ? "s" : ""})</span>
                  </div>
                  <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Release Advisory Notes:</span>
                  </div>
                  {validationWarnings.map((w, i) => (
                    <div key={i} className="pl-5 text-amber-700">
                      &bull; {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Verified APK Details Pill */}
              {apkMeta && validationErrors.length === 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">
                        APK Production Signature Verified
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                      Scheme {apkMeta.signingScheme}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">PACKAGE ID</span>
                      <span className="font-mono font-bold text-emerald-950 truncate block">
                        {apkMeta.packageName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">VERSION NAME</span>
                      <span className="font-bold text-emerald-950">
                        v{apkMeta.versionName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">VERSION CODE</span>
                      <span className="font-mono font-bold text-emerald-950">
                        #{apkMeta.versionCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">MIN ANDROID</span>
                      <span className="font-semibold text-emerald-950">
                        {apkMeta.minAndroidVersion}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">TARGET ANDROID</span>
                      <span className="font-semibold text-emerald-950">
                        {apkMeta.targetAndroidVersion}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-800/80 block">FILE SIZE</span>
                      <span className="font-bold text-emerald-950">
                        {apkMeta.fileSizeFormatted}
                      </span>
                    </div>
                  </div>

                  {/* SHA-256 Checksum */}
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2 text-[11px] font-mono text-emerald-900">
                    <div className="truncate">
                      <span className="text-emerald-700">SHA-256: </span>
                      <span className="font-bold">{apkMeta.sha256}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyHash(apkMeta.sha256)}
                      className="px-2 py-1 rounded bg-white border border-emerald-300 hover:bg-emerald-100 transition-colors text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Release Metadata & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
              <label className="text-xs font-bold text-[#180D1D] block">
                3. Release Configuration &amp; Metadata
              </label>

              {/* Release Title */}
              <div>
                <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                  Release Title
                </label>
                <input
                  type="text"
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  placeholder="e.g. WishMusic v1.0.0 Launch"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  required
                />
              </div>

              {/* Release Channel */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as "stable" | "beta")}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  >
                    <option value="stable">Stable (Production)</option>
                    <option value="beta">Beta (Preview)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Publication Status
                  </label>
                  <select
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value as "published" | "draft")}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              {/* Release Notes */}
              <div>
                <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                  Release Notes / What&apos;s New
                </label>
                <textarea
                  rows={6}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="• Fixed audio gapless looping&#10;• Added lossless FLAC support&#10;• Improved tactile scrubber animation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  required
                />
              </div>

              {/* Optional Custom Distribution URL */}
              <div>
                <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                  Custom Distribution / GitHub URL (Optional)
                </label>
                <input
                  type="url"
                  value={customDownloadUrl}
                  onChange={(e) => setCustomDownloadUrl(e.target.value)}
                  placeholder="https://github.com/.../releases/download/.../app.apk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                />
                <span className="text-[10px] text-[#7A6880] mt-1 block">
                  Leave empty to auto-publish to GitHub Releases or local secure release storage.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!file || !apkMeta || validationErrors.length > 0 || publishing || validating}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    !file || !apkMeta || validationErrors.length > 0 || publishing || validating
                      ? "bg-gray-300 cursor-not-allowed opacity-60"
                      : "bg-[#0284C7] hover:bg-[#0369A1]"
                  }`}
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Distributing APK Release...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{publishStatus === "published" ? "Publish Release" : "Save Draft"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setApkMeta(null);
                    setValidationErrors([]);
                    setValidationWarnings([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-3 rounded-xl border border-[#502D55]/20 bg-white text-xs font-semibold text-[#56475C] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
