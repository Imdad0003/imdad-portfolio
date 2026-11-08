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
  Clock,
} from "lucide-react";
import { User } from "firebase/auth";
import { AppDocument } from "@/types/cms";
import { ApkParsedMetadata, AppReleaseDocument } from "@/types/releases";
import { parseApkClient, formatBytes, ApkInspectionPayload } from "@/lib/apk-parser-client";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from "firebase/storage";

export type WorkflowState =
  | "idle"
  | "selected"
  | "validating"
  | "validated"
  | "uploading"
  | "uploaded"
  | "publishing"
  | "published"
  | "failed";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

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

  // 2. Workflow state machine
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [apkMeta, setApkMeta] = useState<ApkParsedMetadata | null>(null);
  const [cachedInspection, setCachedInspection] = useState<ApkInspectionPayload | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
  });

  const [copiedHash, setCopiedHash] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTaskRef = useRef<UploadTask | null>(null);

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  // When selected app changes, re-run validation if a file is loaded
  useEffect(() => {
    if (file && cachedInspection) {
      runServerValidation(cachedInspection, selectedAppId);
    }
  }, [selectedAppId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await startValidationProcess(selected, selectedAppId);
  };

  /**
   * Fast, reliable validation:
   * 1. Extracts manifest, signing block, and SHA-256 in browser via Web APIs (< 300ms).
   * 2. Sends tiny inspection payload (~20KB) to server for authoritative cryptographic check.
   * 3. Completely bypasses Vercel 4.5MB request body limits.
   */
  const startValidationProcess = async (apkFile: File, appId: string) => {
    setWorkflowState("validating");
    setValidationErrors([]);
    setValidationWarnings([]);
    setApkMeta(null);
    setPublishSuccess(null);
    setPublishError(null);

    // Timeout safety: Force state transition out of validating if it exceeds 15 seconds
    const timeoutHandle = setTimeout(() => {
      setWorkflowState("failed");
      setValidationErrors(["Validation timed out. Please verify your connection and try again."]);
    }, 15000);

    try {
      if (!currentUser) {
        throw new Error("You must be logged in as an administrator.");
      }

      // 1. Client-Side Parsing
      const { metadata: clientMeta, inspectionPayload } = await parseApkClient(apkFile);
      setCachedInspection(inspectionPayload);

      // 2. Server-Side Cryptographic & Policy Verification
      await runServerValidation(inspectionPayload, appId, clientMeta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([`APK validation error: ${msg}`]);
      setWorkflowState("failed");
    } finally {
      clearTimeout(timeoutHandle);
    }
  };

  const runServerValidation = async (
    inspectionPayload: ApkInspectionPayload,
    appId: string,
    fallbackMeta?: ApkParsedMetadata
  ) => {
    setWorkflowState("validating");
    try {
      if (!currentUser) throw new Error("Administrator session expired.");
      const token = await currentUser.getIdToken();
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
        const resolvedMeta = data.metadata || fallbackMeta;
        setApkMeta(resolvedMeta);
        setValidationWarnings(data.warnings || []);
        setWorkflowState("validated");

        // Auto-fill title if empty
        if (!releaseTitle && resolvedMeta) {
          setReleaseTitle(`${currentApp?.name || "App"} v${resolvedMeta.versionName}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([`Server validation check failed: ${msg}`]);
      setWorkflowState("failed");
    }
  };

  const handleCancelUpload = () => {
    if (currentUploadTaskRef.current) {
      currentUploadTaskRef.current.cancel();
      currentUploadTaskRef.current = null;
    }
    setWorkflowState("validated");
    setUploadProgress({ bytesTransferred: 0, totalBytes: 0, percentage: 0 });
    setPublishError("Upload cancelled by administrator.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !apkMeta) {
      setPublishError("Please select and validate an APK file before proceeding.");
      return;
    }
    if (validationErrors.length > 0 || workflowState === "failed") {
      setPublishError("Resolve all validation errors before publishing.");
      return;
    }
    if (workflowState === "uploading" || workflowState === "publishing") {
      return; // Prevent duplicate submission
    }

    setPublishError(null);
    setPublishSuccess(null);

    try {
      if (!currentUser) throw new Error("Administrator session expired.");
      const token = await currentUser.getIdToken();

      // CASE A: Custom download URL provided (bypasses direct storage upload)
      if (customDownloadUrl && customDownloadUrl.trim().length > 0) {
        setWorkflowState("publishing");
        const res = await fetch("/api/admin/apps/releases/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appId: selectedAppId,
            appName: selectedApp?.name || "WishMusic",
            downloadUrl: customDownloadUrl,
            fileName: file.name,
            releaseTitle: releaseTitle || `${selectedApp?.name} v${apkMeta.versionName}`,
            releaseNotes: releaseNotes || "Standard production release.",
            channel,
            status: publishStatus,
            customDownloadUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.errors?.join(" • ") || data.error || "Failed to publish release.");
        }

        setPublishSuccess(
          `Release v${data.release.versionName} successfully ${publishStatus === "published" ? "published" : "saved as draft"}!`
        );
        setWorkflowState("published");
        if (onReleaseCreated) onReleaseCreated(data.release);
        return;
      }

      // CASE B: Standard Distribution — Authenticated Upload Session & Storage Pipeline
      setWorkflowState("uploading");

      // 1. Request upload session
      const sessionRes = await fetch("/api/admin/apps/releases/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionData.error || "Failed to initialize upload session.");
      }

      if (!storage) {
        throw new Error(
          "Firebase Storage is not initialized on this website. Please verify storageBucket configuration."
        );
      }

      // 2. Direct browser upload to Firebase Storage staging with real-time progress
      const storageRef = ref(storage, sessionData.stagingPath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: "application/vnd.android.package-archive",
        customMetadata: {
          uploadedBy: currentUser.email || "admin",
          appId: selectedAppId,
          versionName: apkMeta.versionName,
          versionCode: String(apkMeta.versionCode),
          sha256: apkMeta.sha256,
        },
      });

      currentUploadTaskRef.current = uploadTask;

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = snapshot.totalBytes > 0
              ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              : 0;
            setUploadProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: pct,
            });
          },
          (uploadErr) => {
            currentUploadTaskRef.current = null;
            if (uploadErr.code === "storage/bucket-not-found" || uploadErr.message?.includes("bucket")) {
              reject(
                new Error(
                  `Firebase Storage bucket '${sessionData.storageBucket}' is not yet provisioned. Go to https://console.firebase.google.com/project/imdadbuilds-ead39/storage and click 'Get Started' to enable large binary uploads.`
                )
              );
            } else {
              reject(uploadErr);
            }
          },
          () => {
            currentUploadTaskRef.current = null;
            setWorkflowState("uploaded");
            resolve();
          }
        );
      });

      // 3. Staging complete, publish release to GitHub Releases & Firestore
      setWorkflowState("publishing");
      const stagingDownloadUrl = await getDownloadURL(storageRef);

      const publishRes = await fetch("/api/admin/apps/releases/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          appName: selectedApp?.name || "WishMusic",
          stagingPath: sessionData.stagingPath,
          downloadUrl: stagingDownloadUrl,
          fileName: file.name,
          releaseTitle: releaseTitle || `${selectedApp?.name} v${apkMeta.versionName}`,
          releaseNotes: releaseNotes || "Standard production release.",
          channel,
          status: publishStatus,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || !publishData.success) {
        throw new Error(publishData.errors?.join(" • ") || publishData.error || "Failed to publish release.");
      }

      setPublishSuccess(
        `Release v${publishData.release.versionName} successfully ${publishStatus === "published" ? "published" : "saved as draft"}! Download portal updated.`
      );
      setWorkflowState("published");
      if (onReleaseCreated) onReleaseCreated(publishData.release);

      // Reset form
      setFile(null);
      setApkMeta(null);
      setCachedInspection(null);
      setReleaseTitle("");
      setReleaseNotes("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(`Publication error: ${msg}`);
      setWorkflowState("failed");
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="font-semibold">{publishSuccess}</div>
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
              <div className="font-bold">Publication Notice</div>
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
                  2. Select Android APK (.apk)
                </label>
                <span className="text-[10px] font-mono text-[#7A6880]">
                  Max 150MB &bull; Production Signed Only
                </span>
              </div>

              <div
                onClick={() => {
                  if (workflowState !== "uploading" && workflowState !== "publishing") {
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                  workflowState === "validated"
                    ? "border-emerald-400 bg-emerald-50/40"
                    : workflowState === "failed"
                    ? "border-rose-300 bg-rose-50/40"
                    : workflowState === "uploading" || workflowState === "publishing"
                    ? "border-[#0284C7]/40 bg-sky-50/30 cursor-not-allowed"
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
                  {workflowState === "validating" ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#935073]" />
                  ) : workflowState === "uploading" || workflowState === "publishing" ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#0284C7]" />
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
                    ? "Validating APK structure, signature, and manifest..."
                    : workflowState === "uploading"
                    ? `Uploading APK (${uploadProgress.percentage}%)`
                    : workflowState === "publishing"
                    ? "Distributing release to GitHub..."
                    : file
                    ? file.name
                    : "Click to select or drag and drop an Android APK"}
                </div>

                <p className="text-xs text-[#7A6880] mt-1">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB &bull; ${
                        workflowState === "validated"
                          ? "Cryptographic signature verified"
                          : workflowState === "validating"
                          ? "Inspecting binary"
                          : workflowState === "failed"
                          ? "Inspection issues found"
                          : "Selected"
                      }`
                    : "Supports release binaries up to 150MB with instant browser inspection"}
                </p>
              </div>

              {/* Upload Progress Bar (When Uploading) */}
              {workflowState === "uploading" && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-900">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading binary to secure release staging:
                    </span>
                    <span>{uploadProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#0284C7] h-2.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-sky-800 pt-1">
                    <span>
                      {formatBytes(uploadProgress.bytesTransferred)} of {formatBytes(uploadProgress.totalBytes)}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              )}

              {/* Validation Status & Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>APK Validation Blocked ({validationErrors.length} Issue{validationErrors.length > 1 ? "s" : ""})</span>
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={() => startValidationProcess(file, selectedAppId)}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 underline font-mono cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
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
                  Leave empty to auto-publish to GitHub Releases via studio release manager.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    !file ||
                    !apkMeta ||
                    validationErrors.length > 0 ||
                    workflowState !== "validated"
                  }
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !file ||
                    !apkMeta ||
                    validationErrors.length > 0 ||
                    workflowState !== "validated"
                      ? "bg-gray-300 cursor-not-allowed opacity-60"
                      : "bg-[#0284C7] hover:bg-[#0369A1] cursor-pointer"
                  }`}
                >
                  {workflowState === "uploading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Binary ({uploadProgress.percentage}%)...</span>
                    </>
                  ) : workflowState === "publishing" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Distributing Release...</span>
                    </>
                  ) : workflowState === "validating" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating APK...</span>
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
                    handleCancelUpload();
                    setFile(null);
                    setApkMeta(null);
                    setCachedInspection(null);
                    setValidationErrors([]);
                    setValidationWarnings([]);
                    setWorkflowState("idle");
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
