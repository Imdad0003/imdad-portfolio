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
  XCircle,
  ExternalLink,
  Terminal,
  FileJson,
  CheckCircle,
} from "lucide-react";
import { User } from "firebase/auth";
import { AppDocument } from "@/types/cms";
import {
  ApkParsedMetadata,
  AppReleaseDocument,
  StructuredReleaseManifest,
} from "@/types/releases";
import {
  parseApkClient,
  formatBytes,
  ApkInspectionPayload,
} from "@/lib/apk-parser-client";

export type PublishMode = "manifest" | "inspect";
export type WorkflowState =
  | "idle"
  | "selected"
  | "validating"
  | "validated"
  | "publishing"
  | "published"
  | "failed";

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
  // Mode selection
  const [activeMode, setActiveMode] = useState<PublishMode>("manifest");

  // Selected app
  const [selectedAppId, setSelectedAppId] = useState<string>(
    apps.find((a) => a.id === "wishmusic")?.id || apps[0]?.id || "wishmusic"
  );
  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // Form states
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [channel, setChannel] = useState<"stable" | "beta">("stable");
  const [publishStatus, setPublishStatus] = useState<"published" | "draft">("published");

  // Manifest mode states
  const [manifestRaw, setManifestRaw] = useState("");
  const [manifestObj, setManifestObj] = useState<StructuredReleaseManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const manifestFileInputRef = useRef<HTMLInputElement>(null);

  // Direct APK Inspection states (Mode 2)
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkMeta, setApkMeta] = useState<ApkParsedMetadata | null>(null);
  const [cachedInspection, setCachedInspection] = useState<ApkInspectionPayload | null>(null);
  const [customDownloadUrl, setCustomDownloadUrl] = useState("");
  const apkFileInputRef = useRef<HTMLInputElement>(null);

  // Workflow & notifications
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [registeredRelease, setRegisteredRelease] = useState<AppReleaseDocument | null>(null);

  // ---------------------------------------------------------------------------
  // MANIFEST PARSING & VALIDATION
  // ---------------------------------------------------------------------------
  const parseAndApplyManifest = (jsonString: string) => {
    setManifestError(null);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const data = JSON.parse(jsonString);

      const requiredKeys: (keyof StructuredReleaseManifest)[] = [
        "githubReleaseId",
        "releaseTag",
        "assetId",
        "assetFileName",
        "assetSize",
        "sha256",
        "packageName",
        "versionName",
        "versionCode",
        "certificateFingerprintSha256",
      ];

      for (const k of requiredKeys) {
        if (data[k] === undefined || data[k] === null || data[k] === "") {
          throw new Error(`Manifest is missing required field: '${k}'`);
        }
      }

      const manifest = data as StructuredReleaseManifest;
      setManifestObj(manifest);
      setManifestRaw(JSON.stringify(manifest, null, 2));

      // Auto-populate title and notes if empty
      if (!releaseTitle || releaseTitle.trim() === "") {
        setReleaseTitle(
          manifest.releaseName || `${selectedApp?.name || manifest.appName || "App"} v${manifest.versionName}`
        );
      }
      if (!releaseNotes || releaseNotes.trim() === "") {
        setReleaseNotes(
          `Official production release of ${selectedApp?.name || manifest.appName || "App"} v${manifest.versionName} (Build #${manifest.versionCode}).`
        );
      }

      // Check package match with selected app
      const expectedPkg = selectedApp?.packageName || (selectedAppId === "wishmusic" ? "com.imdad.wishmusic" : null);
      if (expectedPkg && manifest.packageName !== expectedPkg) {
        setValidationWarnings([
          `Warning: Manifest package name (${manifest.packageName}) does not match expected target (${expectedPkg}). Please verify target app.`,
        ]);
      } else {
        setValidationWarnings([]);
      }

      setWorkflowState("validated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setManifestObj(null);
      setManifestError(`Invalid manifest JSON: ${msg}`);
      setWorkflowState("failed");
    }
  };

  const handleManifestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseAndApplyManifest(content);
      }
    };
    reader.onerror = () => {
      setManifestError("Failed to read manifest file.");
    };
    reader.readAsText(file);
  };

  // ---------------------------------------------------------------------------
  // MANIFEST REGISTRATION SUBMISSION
  // ---------------------------------------------------------------------------
  const handleRegisterManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestObj) {
      setPublishError("Please load and review a valid release manifest before registering.");
      return;
    }

    setWorkflowState("publishing");
    setPublishError(null);
    setPublishSuccess(null);

    try {
      if (!currentUser) throw new Error("Administrator session expired. Please log in.");
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/apps/releases/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          manifest: manifestObj,
          releaseTitle: releaseTitle || manifestObj.releaseName || `${selectedApp?.name} v${manifestObj.versionName}`,
          releaseNotes: releaseNotes || `Official production release of ${selectedApp?.name} v${manifestObj.versionName}.`,
          channel,
          status: publishStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.errors?.join(" • ") || data.error || "Failed to register release.");
      }

      setRegisteredRelease(data.release);
      setPublishSuccess(
        `Release v${data.release.versionName} successfully registered! Asset is live on GitHub Releases and available via official public download.`
      );
      setWorkflowState("published");

      if (onReleaseCreated) onReleaseCreated(data.release);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(msg);
      setWorkflowState("failed");
    }
  };

  // ---------------------------------------------------------------------------
  // DIRECT APK LOCAL INSPECTION (MODE 2)
  // ---------------------------------------------------------------------------
  const handleApkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setApkFile(selected);
    await startApkInspection(selected, selectedAppId);
  };

  const startApkInspection = async (file: File, appId: string) => {
    setWorkflowState("validating");
    setValidationErrors([]);
    setValidationWarnings([]);
    setApkMeta(null);
    setPublishSuccess(null);
    setPublishError(null);

    try {
      if (!currentUser) throw new Error("Administrator session expired.");
      const token = await currentUser.getIdToken();

      // Client-side inspection
      const { metadata: clientMeta, inspectionPayload } = await parseApkClient(file);
      setCachedInspection(inspectionPayload);

      // Server cryptographic pre-flight
      const currentApp = apps.find((a) => a.id === appId);
      const expectedPackage = currentApp?.packageName || (appId === "wishmusic" ? "com.imdad.wishmusic" : undefined);
      const currentLatestVersionCode = currentApp?.latestVersionCode;
      const approvedFingerprint = currentApp?.approvedCertificateFingerprint;

      const res = await fetch("/api/admin/apps/releases/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionPayload,
          expectedPackage,
          currentLatestVersionCode,
          approvedFingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setValidationErrors(data.errors || [data.error || "Validation failed."]);
        setValidationWarnings(data.warnings || []);
        if (data.metadata) setApkMeta(data.metadata);
        setWorkflowState("failed");
      } else {
        const resolvedMeta = data.metadata || clientMeta;
        setApkMeta(resolvedMeta);
        setValidationWarnings(data.warnings || []);
        setWorkflowState("validated");

        if (!releaseTitle) {
          setReleaseTitle(`${currentApp?.name || "App"} v${resolvedMeta.versionName}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([`APK inspection error: ${msg}`]);
      setWorkflowState("failed");
    }
  };

  const handleCustomUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apkFile || !apkMeta) {
      setPublishError("Please select and inspect an APK file first.");
      return;
    }
    if (!customDownloadUrl || customDownloadUrl.trim().length === 0) {
      setPublishError("Please provide a valid custom download URL.");
      return;
    }

    setWorkflowState("publishing");
    setPublishError(null);
    try {
      if (!currentUser) throw new Error("Administrator session expired.");
      const token = await currentUser.getIdToken();

      const res = await fetch("/api/admin/apps/releases/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          appName: selectedApp?.name || "App",
          downloadUrl: customDownloadUrl,
          fileName: apkFile.name,
          releaseTitle: releaseTitle || `${selectedApp?.name} v${apkMeta.versionName}`,
          releaseNotes: releaseNotes || "Production release.",
          channel,
          status: publishStatus,
          customDownloadUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.join(" • ") || data.error || "Failed to publish release.");
      }

      setPublishSuccess(`Release v${data.release.versionName} successfully published!`);
      setWorkflowState("published");
      if (onReleaseCreated) onReleaseCreated(data.release);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(msg);
      setWorkflowState("failed");
    }
  };

  const copyCliCommand = () => {
    const cmd = `npm run publish:apk -- --apk /path/to/${selectedApp?.name || "WishMusic"}-release.apk`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
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
            Zero-cost, secure distribution powered by local cryptographic verification and GitHub Releases.
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

      {/* Target Application Selector */}
      <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-3">
        <label className="text-xs font-bold text-[#180D1D] block">
          Target Application
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
                      {app.version ? `v${app.version}` : "No release yet"}
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
                Current Active Version Code: #{selectedApp.latestVersionCode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-[#502D55]/15">
        <button
          type="button"
          onClick={() => setActiveMode("manifest")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMode === "manifest"
              ? "border-[#935073] text-[#935073]"
              : "border-transparent text-[#7A6880] hover:text-[#180D1D]"
          }`}
        >
          <FileJson className="w-4 h-4" />
          <span>Register Verified Manifest (Recommended)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("inspect")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMode === "inspect"
              ? "border-[#935073] text-[#935073]"
              : "border-transparent text-[#7A6880] hover:text-[#180D1D]"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Local Inspection &amp; Custom URL</span>
        </button>
      </div>

      {/* Notification Banners */}
      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold">{publishSuccess}</div>
              {registeredRelease && (
                <div className="text-xs text-emerald-700 flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={registeredRelease.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline text-emerald-800 hover:text-emerald-950"
                  >
                    <span>Download APK directly</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>&bull;</span>
                  <a
                    href={`/api/apps/download/${registeredRelease.appId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline text-emerald-800 hover:text-emerald-950"
                  >
                    <span>Test Public Download Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPublishSuccess(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {publishError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Publication Error</div>
              <div className="text-xs text-rose-700 leading-relaxed">{publishError}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPublishError(null)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 1: REGISTER VERIFIED MANIFEST (PRIMARY PRODUCTION ARCHITECTURE) */}
      {/* ===================================================================== */}
      {activeMode === "manifest" && (
        <div className="space-y-6">
          {/* CLI Publishing Helper Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#180D1D] to-[#2D1B36] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D8829D]" />
                <span className="text-xs font-mono font-bold text-[#F3E8F0] tracking-wider uppercase">
                  Step 1: Local Publishing Utility (macOS)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/80">
                Zero Cloud Storage Cost
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              To bypass Vercel&apos;s serverless timeout and payload limits, run the verified CLI utility locally.
              It uses the Android SDK <code className="text-[#D8829D]">apksigner</code> to verify Scheme v2/v3 signatures,
              calculates full SHA-256 digests, and streams binaries directly to GitHub Releases.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 font-mono text-xs">
              <code className="text-[#D8829D] truncate">
                npm run publish:apk -- --apk /path/to/{selectedApp?.name || "WishMusic"}-release.apk
              </code>
              <button
                type="button"
                onClick={copyCliCommand}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCli ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegisterManifest} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Manifest File & Validation Badges */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#180D1D]">
                    Step 2: Load Release Manifest (release-manifest.json)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowJsonInput(!showJsonInput)}
                    className="text-[11px] font-bold text-[#935073] hover:underline cursor-pointer"
                  >
                    {showJsonInput ? "Switch to File Upload" : "Paste JSON Directly"}
                  </button>
                </div>

                {!showJsonInput ? (
                  <div
                    onClick={() => manifestFileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                      manifestObj
                        ? "border-emerald-400 bg-emerald-50/40"
                        : manifestError
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#502D55]/20 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] hover:border-[#502D55]/40"
                    }`}
                  >
                    <input
                      ref={manifestFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleManifestFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#502D55]/10 flex items-center justify-center mx-auto text-[#935073] mb-3 shadow-2xs">
                      {manifestObj ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : manifestError ? (
                        <XCircle className="w-6 h-6 text-rose-600" />
                      ) : (
                        <FileJson className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#180D1D]">
                      {manifestObj
                        ? `Manifest Loaded: ${manifestObj.assetFileName}`
                        : "Click to select release-manifest.json"}
                    </div>
                    <p className="text-xs text-[#7A6880] mt-1">
                      {manifestObj
                        ? `${manifestObj.assetSizeFormatted} &bull; v${manifestObj.versionName} (Build #${manifestObj.versionCode})`
                        : "Generated by scripts/publish-apk.ts"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={8}
                      value={manifestRaw}
                      onChange={(e) => {
                        setManifestRaw(e.target.value);
                        if (e.target.value.trim().length > 0) {
                          parseAndApplyManifest(e.target.value);
                        } else {
                          setManifestObj(null);
                        }
                      }}
                      placeholder={`{\n  "appId": "wishmusic",\n  "versionName": "1.0.0",\n  "versionCode": 1,\n  "sha256": "...",\n  "assetId": 12345678\n}`}
                      className="w-full p-3 font-mono text-xs rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] focus:outline-none focus:border-[#935073]"
                    />
                  </div>
                )}

                {manifestError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{manifestError}</span>
                  </div>
                )}

                {/* Verified Manifest Details Card */}
                {manifestObj && (
                  <div className="p-5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                          Verified Release Manifest
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
                        {manifestObj.verifiedLocallyBy ? `Verified by ${manifestObj.verifiedLocallyBy}` : "Cryptographically Verified"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">APPLICATION</span>
                        <span className="font-bold text-emerald-950 truncate block">
                          {manifestObj.appName || manifestObj.appId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">PACKAGE ID</span>
                        <span className="font-mono font-bold text-emerald-950 truncate block">
                          {manifestObj.packageName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">VERSION</span>
                        <span className="font-bold text-emerald-950">
                          v{manifestObj.versionName}{" "}
                          <span className="font-mono text-[10px] text-emerald-800">
                            (#{manifestObj.versionCode})
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">ANDROID OS</span>
                        <span className="font-semibold text-emerald-950">
                          {manifestObj.minAndroidVersion || `API ${manifestObj.minSdkVersion}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">BINARY SIZE</span>
                        <span className="font-bold text-emerald-950">
                          {manifestObj.assetSizeFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800/80 block">GITHUB ASSET ID</span>
                        <span className="font-mono font-bold text-emerald-950">
                          #{manifestObj.assetId}
                        </span>
                      </div>
                    </div>

                    {/* Certificate Fingerprint */}
                    <div className="pt-2 border-t border-emerald-200 text-[11px] font-mono text-emerald-950">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 font-semibold text-[10px]">
                          SIGNING CERTIFICATE SHA-256:
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Production Keystore
                        </span>
                      </div>
                      <div className="truncate font-bold mt-0.5">
                        {manifestObj.certificateFingerprintSha256}
                      </div>
                    </div>

                    {/* SHA-256 Checksum */}
                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between gap-2 text-[11px] font-mono text-emerald-950">
                      <div className="truncate">
                        <span className="text-emerald-800 font-semibold text-[10px] block">
                          COMPLETE APK SHA-256 CHECKSUM:
                        </span>
                        <span className="font-bold">{manifestObj.sha256}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyHash(manifestObj.sha256)}
                        className="px-2 py-1 rounded bg-white border border-emerald-300 hover:bg-emerald-100 transition-colors text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* GitHub Download Link */}
                    <div className="pt-2 border-t border-emerald-200 text-[11px] font-mono flex items-center justify-between">
                      <span className="text-emerald-800">GitHub Tag: <strong>{manifestObj.releaseTag}</strong></span>
                      <a
                        href={manifestObj.assetDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-800 font-bold underline flex items-center gap-1 hover:text-emerald-950"
                      >
                        <span>View Asset</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Metadata & Publishing Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <label className="text-xs font-bold text-[#180D1D] block">
                  Step 3: Release Configuration
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

                {/* Channel & Status */}
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
                    Release Notes / Changelog
                  </label>
                  <textarea
                    rows={6}
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    placeholder="• Production APK signature verified&#10;• Full lossless audio engine&#10;• Official initial release"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                    required
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={!manifestObj || workflowState === "publishing"}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                      !manifestObj || workflowState === "publishing"
                        ? "bg-gray-300 cursor-not-allowed opacity-60"
                        : "bg-[#0284C7] hover:bg-[#0369A1] cursor-pointer"
                    }`}
                  >
                    {workflowState === "publishing" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying &amp; Registering Release...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {publishStatus === "published"
                            ? "Register &amp; Publish Release"
                            : "Save Release as Draft"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setManifestObj(null);
                      setManifestRaw("");
                      setManifestError(null);
                      setPublishSuccess(null);
                      setPublishError(null);
                      setWorkflowState("idle");
                      if (manifestFileInputRef.current) manifestFileInputRef.current.value = "";
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#502D55]/15 bg-white text-xs font-semibold text-[#56475C] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Reset Manifest
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: DIRECT APK LOCAL INSPECTION & CUSTOM URL                      */}
      {/* ===================================================================== */}
      {activeMode === "inspect" && (
        <form onSubmit={handleCustomUrlSubmit} className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Notice for Large APK Binaries (&gt; 4.5 MB):</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Vercel Hobby serverless functions have a 4.5 MB request body limit and a 10s execution timeout.
              Direct browser binary streaming across serverless functions is fundamentally unreliable in production.
              Use this mode only for local pre-flight APK inspection or if you already have an existing direct download URL.
              For production releases, use <strong>Register Verified Manifest</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: APK Inspection Dropzone */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <label className="text-xs font-bold text-[#180D1D] block">
                  Select Android APK for Local Inspection
                </label>

                <div
                  onClick={() => apkFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    workflowState === "validated"
                      ? "border-emerald-400 bg-emerald-50/40"
                      : workflowState === "failed"
                      ? "border-rose-300 bg-rose-50/40"
                      : "border-[#502D55]/20 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] hover:border-[#502D55]/40"
                  }`}
                >
                  <input
                    ref={apkFileInputRef}
                    type="file"
                    accept=".apk,application/vnd.android.package-archive"
                    onChange={handleApkFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-xl bg-white border border-[#502D55]/10 flex items-center justify-center mx-auto text-[#935073] mb-3 shadow-2xs">
                    {workflowState === "validating" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#935073]" />
                    ) : workflowState === "validated" ? (
                      <FileCode className="w-6 h-6 text-emerald-600" />
                    ) : workflowState === "failed" ? (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div className="text-sm font-bold text-[#180D1D]">
                    {workflowState === "validating"
                      ? "Inspecting APK binary in browser..."
                      : apkFile
                      ? apkFile.name
                      : "Click to select an Android APK file"}
                  </div>

                  <p className="text-xs text-[#7A6880] mt-1">
                    {apkFile
                      ? `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Instant browser inspection`
                      : "Extracts package name, version codes, and certificates locally"}
                  </p>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Validation Issues:</span>
                    </div>
                    <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inspected APK Card */}
                {apkMeta && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          APK Structure &amp; Signature Valid
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-200 px-2 py-0.5 rounded text-emerald-800">
                        Scheme {apkMeta.signingScheme.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 block">PACKAGE</span>
                        <span className="font-mono font-bold text-emerald-950 truncate block">
                          {apkMeta.packageName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 block">VERSION</span>
                        <span className="font-bold text-emerald-950">
                          v{apkMeta.versionName} (#{apkMeta.versionCode})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 block">FINGERPRINT</span>
                        <span className="font-mono text-[10px] font-bold text-emerald-950 truncate block">
                          {apkMeta.certificateFingerprintSha256.slice(0, 24)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 block">SHA-256</span>
                        <span className="font-mono text-[10px] font-bold text-emerald-950 truncate block">
                          {apkMeta.sha256.slice(0, 24)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 cols: Custom Download URL & Submit */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <label className="text-xs font-bold text-[#180D1D] block">
                  Custom Distribution Settings
                </label>

                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Direct APK Download URL *
                  </label>
                  <input
                    type="url"
                    value={customDownloadUrl}
                    onChange={(e) => setCustomDownloadUrl(e.target.value)}
                    placeholder="https://github.com/.../releases/download/.../app.apk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                    required
                  />
                  <span className="text-[10px] text-[#7A6880] mt-1 block">
                    Direct public URL where the APK is hosted.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Release Title
                  </label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="e.g. WishMusic v1.0.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Release Notes
                  </label>
                  <textarea
                    rows={4}
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    placeholder="Release details..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!apkFile || !customDownloadUrl || workflowState === "publishing"}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Publish via Custom URL
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
