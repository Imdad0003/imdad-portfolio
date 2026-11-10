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
  Zap,
  Activity,
  Pause,
  Play,
} from "lucide-react";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
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
import {
  ConcurrentChunkUploader,
  ChunkErrorDetails,
  UploadProgressInfo,
} from "@/lib/chunk-uploader";

export type PublishMode = "direct" | "manifest" | "custom";
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

export interface UploadProgressDisplay {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speed: string;
  speedMBps: number;
  currentChunk: number;
  totalChunks: number;
  eta: string;
  isStalled: boolean;
  stalledSeconds: number;
  activeWorkers: number;
  retriedChunks: number;
  lastError?: ChunkErrorDetails | null;
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
  // Mode selection: "direct" is the default production chunked upload pipeline
  const [activeMode, setActiveMode] = useState<PublishMode>("direct");

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

  // DIRECT APK UPLOAD STATES (MODE 1: PRIMARY)
  const [file, setFile] = useState<File | null>(null);
  const [apkMeta, setApkMeta] = useState<ApkParsedMetadata | null>(null);
  const [cachedInspection, setCachedInspection] = useState<ApkInspectionPayload | null>(null);
  const [concurrencySetting, setConcurrencySetting] = useState<number>(1);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressDisplay>({
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
    speed: "0.00 MB/s",
    speedMBps: 0,
    currentChunk: 0,
    totalChunks: 0,
    eta: "--",
    isStalled: false,
    stalledSeconds: 0,
    activeWorkers: 1,
    retriedChunks: 0,
    lastError: null,
  });
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);

  // MANIFEST REGISTRATION STATES (MODE 2: SECONDARY / OFFLINE)
  const [manifestRaw, setManifestRaw] = useState("");
  const [manifestObj, setManifestObj] = useState<StructuredReleaseManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const manifestFileInputRef = useRef<HTMLInputElement>(null);

  // CUSTOM URL STATES (MODE 3)
  const [customDownloadUrl, setCustomDownloadUrl] = useState("");

  // Workflow machine & notifications
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedRelease, setPublishedRelease] = useState<AppReleaseDocument | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeUploaderRef = useRef<ConcurrentChunkUploader | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  // Re-run validation when app changes if file is loaded
  useEffect(() => {
    if (file && cachedInspection) {
      runServerValidation(cachedInspection, selectedAppId);
    }
  }, [selectedAppId]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 1. FILE SELECTION & PRE-FLIGHT VALIDATION
  // ---------------------------------------------------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await startValidationProcess(selected, selectedAppId);
  };

  const startValidationProcess = async (apkFile: File, appId: string) => {
    setWorkflowState("validating");
    setValidationErrors([]);
    setValidationWarnings([]);
    setApkMeta(null);
    setPublishSuccess(null);
    setPublishError(null);
    setActiveSessionId(null);
    setUploadLogs([]);

    const timeoutHandle = setTimeout(() => {
      setWorkflowState("failed");
      setValidationErrors(["Validation timed out. Please check your connection and try again."]);
    }, 30000);

    try {
      if (!currentUser) {
        throw new Error("You must be logged in as an administrator.");
      }

      // Client-side ZIP & APK signing block parsing (< 300ms)
      const { metadata: clientMeta, inspectionPayload } = await parseApkClient(apkFile);
      setCachedInspection(inspectionPayload);

      // Authoritative server-side cryptographic and package verification
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
        const combinedWarnings = [...(data.warnings || [])];
        if (!approvedFingerprint) {
          combinedWarnings.push(
            "Security Notice: No production certificate fingerprint is pinned for this app. Ensure the fingerprint matches your official release key."
          );
        }
        setValidationWarnings(combinedWarnings);
        setWorkflowState("validated");

        if (!releaseTitle && resolvedMeta) {
          setReleaseTitle(`${currentApp?.name || "App"} v${resolvedMeta.versionName}`);
        }
        if (!releaseNotes && resolvedMeta) {
          setReleaseNotes(`Official production release of ${currentApp?.name || "App"} v${resolvedMeta.versionName} (Build #${resolvedMeta.versionCode}).`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationErrors([`Server validation check failed: ${msg}`]);
      setWorkflowState("failed");
    }
  };

  // ---------------------------------------------------------------------------
  // 2. CONCURRENT CHUNKED UPLOAD & PUBLICATION (ZERO FIREBASE STORAGE)
  // ---------------------------------------------------------------------------
  const handleCancelUpload = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeUploaderRef.current = null;
    const sessToClean = currentSessionIdRef.current || activeSessionId;
    currentSessionIdRef.current = null;
    setActiveSessionId(null);

    setWorkflowState("validated");
    setPublishError("Upload was cancelled by administrator. Staging session cleaned up.");

    // Clean up staging session and chunk documents in Firestore
    if (sessToClean && currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await fetch(`/api/admin/apps/releases/session?sessionId=${encodeURIComponent(sessToClean)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploadLogs((prev) => [...prev, `Cancelled session ${sessToClean} deleted from Firestore.`]);
      } catch (err) {
        console.warn("Notice: Failed to clean up cancelled session:", err);
      }
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
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
      return;
    }

    setPublishError(null);
    setPublishSuccess(null);
    setPublishedRelease(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (!currentUser) throw new Error("Administrator session expired. Please sign in again.");
      const token = await currentUser.getIdToken();

      setWorkflowState("uploading");
      setUploadLogs([`Initializing upload session for ${file.name} (${formatBytes(file.size)})...`]);

      // 1. Initialize or resume upload session
      let sessionId = activeSessionId;
      let sessionData: {
        sessionId: string;
        chunkSize: number;
        totalChunks: number;
      };

      if (!sessionId) {
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
          signal: abortController.signal,
        });

        sessionData = await sessionRes.json();
        if (!sessionRes.ok) {
          throw new Error(sessionData.sessionId ? "Session error" : (sessionData as any).error || "Failed to initialize upload session.");
        }
        sessionId = sessionData.sessionId;
        setActiveSessionId(sessionId);
        currentSessionIdRef.current = sessionId;
      } else {
        sessionData = {
          sessionId,
          chunkSize: 500 * 1024,
          totalChunks: Math.ceil(file.size / (500 * 1024)),
        };
        currentSessionIdRef.current = sessionId;
      }

      setUploadLogs((prev) => [
        ...prev,
        `Session created: ${sessionId}. Slicing into ${sessionData.totalChunks} chunks (~500 KB each).`,
        `Spawning initial verified worker direct to Cloud Firestore (adapting to 4, 6, 8 workers)...`,
      ]);

      // 2. Launch high-throughput concurrent chunk uploader
      const uploader = new ConcurrentChunkUploader({
        file,
        sessionId,
        chunkSize: sessionData.chunkSize,
        totalChunks: sessionData.totalChunks,
        idToken: token,
        signal: abortController.signal,
        db,
        initialConcurrency: concurrencySetting,
        minConcurrency: 1,
        maxConcurrency: 8,
        onProgress: (info: UploadProgressInfo) => {
          let etaFormatted = "--";
          if (info.estimatedSecondsRemaining > 0) {
            etaFormatted =
              info.estimatedSecondsRemaining < 60
                ? `${Math.ceil(info.estimatedSecondsRemaining)}s remaining`
                : `${Math.floor(info.estimatedSecondsRemaining / 60)}m ${Math.ceil(
                    info.estimatedSecondsRemaining % 60
                  )}s remaining`;
          }

          setUploadProgress({
            bytesTransferred: info.bytesTransferred,
            totalBytes: info.totalBytes,
            percentage: info.percentage,
            speed: info.speedFormatted,
            speedMBps: info.speedMBps,
            currentChunk: info.completedChunks,
            totalChunks: info.totalChunks,
            eta: etaFormatted,
            isStalled: info.isStalled,
            stalledSeconds: info.stalledSeconds,
            activeWorkers: info.activeConcurrency,
            retriedChunks: info.retriedChunks,
            lastError: info.lastError,
          });
        },
        onLog: (msg: string) => {
          setUploadLogs((prev) => [...prev.slice(-4), msg]);
        },
      });

      activeUploaderRef.current = uploader;
      await uploader.start();

      // 3. Chunks complete! Request server assembly, verification, and GitHub publication
      setUploadProgress((prev) => ({ ...prev, percentage: 100 }));
      setWorkflowState("publishing");
      setUploadLogs((prev) => [
        ...prev,
        "All chunks successfully staged in Firestore!",
        "Triggering serverless assembly, Merkle verification, and GitHub Release publication...",
      ]);

      const publishToken = await currentUser.getIdToken();
      const publishRes = await fetch("/api/admin/apps/releases/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publishToken}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          appName: selectedApp?.name || "WishMusic",
          sessionId,
          fileName: file.name,
          releaseTitle: releaseTitle || `${selectedApp?.name} v${apkMeta.versionName}`,
          releaseNotes: releaseNotes || "Standard production release.",
          channel,
          status: publishStatus,
        }),
        signal: abortController.signal,
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || !publishData.success) {
        throw new Error(publishData.errors?.join(" • ") || publishData.error || "Failed to publish release on server.");
      }

      setPublishedRelease(publishData.release);
      setPublishSuccess(
        `Release v${publishData.release.versionName} successfully ${publishStatus === "published" ? "published" : "saved as draft"}! Binary asset is live on GitHub Releases.`
      );
      setWorkflowState("published");
      if (onReleaseCreated) onReleaseCreated(publishData.release);

      // Clean up session state
      setActiveSessionId(null);
      activeUploaderRef.current = null;
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        setPublishError("Upload was cancelled.");
        setWorkflowState("validated");
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      setPublishError(`Publication error: ${msg}`);
      setWorkflowState("failed");
    }
  };

  // ---------------------------------------------------------------------------
  // 3. OFFLINE MANIFEST MODE HANDLERS (MODE 2)
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

      setWorkflowState("validated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setManifestObj(null);
      setManifestError(`Invalid manifest JSON: ${msg}`);
      setWorkflowState("failed");
    }
  };

  const handleRegisterManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestObj) {
      setPublishError("Please load a valid release manifest before registering.");
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

      setPublishedRelease(data.release);
      setPublishSuccess(
        `Release v${data.release.versionName} successfully registered! Asset is live on GitHub Releases.`
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
  // 4. CUSTOM DOWNLOAD URL SUBMIT (MODE 3)
  // ---------------------------------------------------------------------------
  const handleCustomUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !apkMeta) {
      setPublishError("Please select and validate an APK file first.");
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
          fileName: file.name,
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

      setPublishedRelease(data.release);
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
            Zero-cost, high-speed chunked staging to Cloud Firestore and persistent GitHub Releases distribution.
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
          onClick={() => setActiveMode("direct")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMode === "direct"
              ? "border-[#935073] text-[#935073]"
              : "border-transparent text-[#7A6880] hover:text-[#180D1D]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Direct APK Upload (Concurrent 4-8x)</span>
        </button>

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
          <span>Register Local Manifest (CLI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("custom")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMode === "custom"
              ? "border-[#935073] text-[#935073]"
              : "border-transparent text-[#7A6880] hover:text-[#180D1D]"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Custom Download URL</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold">{publishSuccess}</div>
              {publishedRelease && (
                <div className="text-xs text-emerald-700 flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={publishedRelease.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline text-emerald-800 hover:text-emerald-950"
                  >
                    <span>Download APK directly</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>&bull;</span>
                  <a
                    href={`/api/apps/download/${publishedRelease.appId}`}
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

      {/* Error Notification Banner */}
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

      {/* ===================================================================== */}
      {/* MODE 1: DIRECT APK UPLOAD & HIGH-SPEED CONCURRENT DISTRIBUTION        */}
      {/* ===================================================================== */}
      {activeMode === "direct" && (
        <form onSubmit={handleStartUpload} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: File Selector, Validation & Concurrent Speed Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#180D1D] block">
                    Step 1: Select Production APK Binary
                  </label>
                  {/* Concurrency Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#56475C]">Workers:</span>
                    {[4, 6, 8].map((n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={workflowState === "uploading"}
                        onClick={() => setConcurrencySetting(n)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          concurrencySetting === n
                            ? "bg-[#935073] text-white"
                            : "bg-[#FAF4F9] text-[#56475C] hover:bg-[#502D55]/10"
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  onClick={() => {
                    if (workflowState !== "uploading" && workflowState !== "publishing") {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
                    workflowState === "uploading" || workflowState === "publishing"
                      ? "border-[#502D55]/30 bg-[#FAF4F9]/30 cursor-not-allowed"
                      : workflowState === "validated"
                      ? "border-emerald-400 bg-emerald-50/40 cursor-pointer"
                      : workflowState === "failed"
                      ? "border-rose-300 bg-rose-50/40 cursor-pointer"
                      : "border-[#502D55]/20 bg-[#FAF4F9]/60 hover:bg-[#FAF4F9] hover:border-[#502D55]/40 cursor-pointer"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk,application/vnd.android.package-archive"
                    onChange={handleFileChange}
                    disabled={workflowState === "uploading" || workflowState === "publishing"}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-xl bg-white border border-[#502D55]/10 flex items-center justify-center mx-auto text-[#935073] mb-3 shadow-2xs">
                    {workflowState === "validating" ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#935073]" />
                    ) : workflowState === "validated" ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : workflowState === "uploading" || workflowState === "publishing" ? (
                      <Zap className="w-6 h-6 text-[#935073] animate-pulse" />
                    ) : workflowState === "failed" ? (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div className="text-sm font-bold text-[#180D1D]">
                    {workflowState === "validating"
                      ? "Inspecting APK structure and signature..."
                      : file
                      ? file.name
                      : "Click to select Android APK (.apk)"}
                  </div>

                  <p className="text-xs text-[#7A6880] mt-1">
                    {file
                      ? `${formatBytes(file.size)} &bull; ${Math.ceil(file.size / (700 * 1024))} staging chunks &bull; Instant browser inspection`
                      : "Supports direct uploads up to 150 MB with zero Firebase Storage dependency"}
                  </p>
                </div>

                {/* Validation Status & Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Validation Blocked ({validationErrors.length} Issue{validationErrors.length > 1 ? "s" : ""})</span>
                      </div>
                      {file && (
                        <button
                          type="button"
                          onClick={() => startValidationProcess(file, selectedAppId)}
                          className="inline-flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 underline font-mono cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry Check</span>
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

                {/* Warnings */}
                {validationWarnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Security &amp; Policy Notice:</span>
                    </div>
                    {validationWarnings.map((w, i) => (
                      <p key={i} className="text-[11px] leading-relaxed text-amber-700">{w}</p>
                    ))}
                  </div>
                )}

                {/* Inspected APK Details Card */}
                {apkMeta && (
                  <div className="p-4 rounded-xl bg-[#FAF4F9] border border-[#502D55]/10 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-[#502D55]/10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#180D1D]">
                          Validated APK Specifications
                        </span>
                      </div>
                      <span className="studio-tag text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Scheme {apkMeta.signingScheme?.toUpperCase() || "V2"} Signed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">PACKAGE ID</span>
                        <span className="font-mono font-bold text-[#180D1D] truncate block">
                          {apkMeta.packageName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">VERSION</span>
                        <span className="font-bold text-[#180D1D]">
                          v{apkMeta.versionName}{" "}
                          <span className="font-mono text-[10px] text-[#935073]">
                            (#{apkMeta.versionCode})
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">MIN OS</span>
                        <span className="font-semibold text-[#180D1D]">
                          {apkMeta.minAndroidVersion || `API ${apkMeta.minSdkVersion}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">TARGET OS</span>
                        <span className="font-semibold text-[#180D1D]">
                          {apkMeta.targetAndroidVersion || `API ${apkMeta.targetSdkVersion}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">BINARY SIZE</span>
                        <span className="font-bold text-[#180D1D]">
                          {apkMeta.fileSizeFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#56475C] block">SIGNATURE STATUS</span>
                        <span className="font-bold text-emerald-700">
                          {apkMeta.isProductionSigned ? "Production Keystore" : "Debug Key"}
                        </span>
                      </div>
                    </div>

                    {/* SHA-256 Digest */}
                    <div className="pt-2 border-t border-[#502D55]/10 flex items-center justify-between text-[11px] font-mono text-[#56475C]">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-[#7A6880] block">SHA-256 CHECKSUM:</span>
                        <span className="font-bold text-[#180D1D]">{apkMeta.sha256}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyHash(apkMeta.sha256)}
                        className="px-2 py-1 rounded bg-white border border-[#502D55]/15 hover:bg-[#FAF4F9] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* HIGH-SPEED CONCURRENT UPLOAD PROGRESS PANEL */}
                {workflowState === "uploading" && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF4F9] to-white border border-[#935073]/30 space-y-3 animate-fade-in shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#935073] animate-pulse" />
                        <span className="font-bold text-[#180D1D]">
                          Staging Binary Chunks to Cloud Firestore
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#935073]">
                        {uploadProgress.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-[#502D55]/10 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#935073] to-[#B3688E] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>

                    {/* Live Throughput Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-white border border-[#502D55]/10">
                        <span className="text-[10px] text-[#56475C] block">SPEED</span>
                        <span className="font-bold text-[#180D1D]">{uploadProgress.speed}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#502D55]/10">
                        <span className="text-[10px] text-[#56475C] block">CHUNKS</span>
                        <span className="font-bold text-[#180D1D]">
                          {uploadProgress.currentChunk} / {uploadProgress.totalChunks}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#502D55]/10">
                        <span className="text-[10px] text-[#56475C] block">EST. REMAINING</span>
                        <span className="font-bold text-[#935073]">{uploadProgress.eta}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#502D55]/10">
                        <span className="text-[10px] text-[#56475C] block">PIPELINE</span>
                        <span className="font-bold text-emerald-700">
                          {uploadProgress.activeWorkers} concurrent
                        </span>
                      </div>
                    </div>

                    {/* Granular Chunk Failure Alert */}
                    {uploadProgress.lastError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5 animate-fade-in">
                        <div className="flex items-center gap-2 font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            Chunk #{uploadProgress.lastError.chunkIndex + 1} of {uploadProgress.lastError.totalChunks} Failed
                            (Attempt {uploadProgress.lastError.retryAttempt} of {uploadProgress.lastError.maxRetries})
                          </span>
                        </div>
                        <div className="p-2 rounded bg-rose-100/70 font-mono text-[10.5px] text-rose-900 break-all leading-normal select-all">
                          {uploadProgress.lastError.errorMessage}
                        </div>
                      </div>
                    )}

                    {/* Stalled Banner (only if no active chunk failure is displayed) */}
                    {uploadProgress.isStalled && !uploadProgress.lastError && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Upload temporarily stalled ({uploadProgress.stalledSeconds}s). Workers are automatically retrying with backoff...</span>
                      </div>
                    )}

                    {/* Live Log */}
                    {uploadLogs.length > 0 && (
                      <div className="p-2 rounded bg-black/5 font-mono text-[10px] text-[#56475C] space-y-0.5">
                        {uploadLogs.slice(-3).map((log, i) => (
                          <div key={i} className="truncate">{log}</div>
                        ))}
                      </div>
                    )}

                    {/* Cancel Action */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        Cancel Upload
                      </button>
                    </div>
                  </div>
                )}

                {/* PUBLISHING STATE PANEL */}
                {workflowState === "publishing" && (
                  <div className="p-5 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs text-purple-950 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                      <span>Assembling Chunks &amp; Publishing to GitHub Releases...</span>
                    </div>
                    <p className="text-purple-800 leading-relaxed text-[11px]">
                      Serverless runtime is reading staging chunks from Firestore, reassembling the 80MB binary,
                      authoritatively verifying APK Scheme v2/v3 Merkle content digests, creating the release on
                      GitHub, and attaching the persistent CDN download asset.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Release Metadata & Action Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <label className="text-xs font-bold text-[#180D1D] block">
                  Step 2: Release Metadata &amp; Distribution
                </label>

                {/* Title */}
                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Release Title *
                  </label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="e.g. WishMusic v1.0.0 Official Launch"
                    disabled={workflowState === "uploading" || workflowState === "publishing"}
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
                      disabled={workflowState === "uploading" || workflowState === "publishing"}
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
                      disabled={workflowState === "uploading" || workflowState === "publishing"}
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
                    placeholder="• Production APK signature verified&#10;• Full lossless FLAC audio engine&#10;• Ultra-low latency playback"
                    disabled={workflowState === "uploading" || workflowState === "publishing"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={
                      !file ||
                      !apkMeta ||
                      validationErrors.length > 0 ||
                      workflowState === "uploading" ||
                      workflowState === "publishing"
                    }
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                      !file ||
                      !apkMeta ||
                      validationErrors.length > 0 ||
                      workflowState === "uploading" ||
                      workflowState === "publishing"
                        ? "bg-gray-300 cursor-not-allowed opacity-60"
                        : "bg-[#0284C7] hover:bg-[#0369A1] cursor-pointer"
                    }`}
                  >
                    {workflowState === "uploading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Chunks ({uploadProgress.percentage}%)...</span>
                      </>
                    ) : workflowState === "publishing" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Distributing to GitHub Releases...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {publishStatus === "published" ? "Publish Release" : "Save Draft"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (workflowState === "uploading") {
                        handleCancelUpload();
                      }
                      setFile(null);
                      setApkMeta(null);
                      setCachedInspection(null);
                      setValidationErrors([]);
                      setValidationWarnings([]);
                      setUploadLogs([]);
                      setActiveSessionId(null);
                      setWorkflowState("idle");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={workflowState === "publishing"}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#502D55]/15 bg-white text-xs font-semibold text-[#56475C] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: REGISTER VERIFIED MANIFEST (CLI PUBLISHING UTILITY)           */}
      {/* ===================================================================== */}
      {activeMode === "manifest" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#180D1D] to-[#2D1B36] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D8829D]" />
                <span className="text-xs font-mono font-bold text-[#F3E8F0] tracking-wider uppercase">
                  Local Terminal Publisher (Alternative)
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/80">
                macOS SDK apksigner
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              If preferred, you can also publish directly from your workstation CLI using the Android SDK.
              The CLI validates Scheme v2/v3 signatures, streams the binary to GitHub Releases, and outputs a signed manifest.
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
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#180D1D]">
                    Load Signed Manifest (release-manifest.json)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowJsonInput(!showJsonInput)}
                    className="text-[11px] font-bold text-[#935073] hover:underline cursor-pointer"
                  >
                    {showJsonInput ? "Switch to File Drop" : "Paste JSON"}
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
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = (ev) => {
                          const c = ev.target?.result as string;
                          if (c) parseAndApplyManifest(c);
                        };
                        r.readAsText(f);
                      }}
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
                )}

                {manifestError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{manifestError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
                <label className="text-xs font-bold text-[#180D1D] block">
                  Manifest Registration Controls
                </label>
                <div>
                  <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                    Release Title
                  </label>
                  <input
                    type="text"
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manifestObj || workflowState === "publishing"}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Register Manifest
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: CUSTOM DIRECT DOWNLOAD URL                                    */}
      {/* ===================================================================== */}
      {activeMode === "custom" && (
        <form onSubmit={handleCustomUrlSubmit} className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs space-y-4 max-w-2xl">
            <label className="text-xs font-bold text-[#180D1D] block">
              Publish via External Download URL
            </label>
            <div>
              <label className="text-[11px] font-semibold text-[#56475C] block mb-1">
                Direct APK URL (GitHub Releases or CDN) *
              </label>
              <input
                type="url"
                value={customDownloadUrl}
                onChange={(e) => setCustomDownloadUrl(e.target.value)}
                placeholder="https://github.com/.../releases/download/.../app.apk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
                required
              />
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-medium text-[#180D1D] focus:outline-none focus:border-[#935073]"
              />
            </div>
            <button
              type="submit"
              disabled={!customDownloadUrl || workflowState === "publishing"}
              className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Publish Custom Release
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
