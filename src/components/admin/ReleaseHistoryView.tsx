"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Loader2,
  Calendar,
  HardDrive,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { User } from "firebase/auth";
import { AppDocument } from "@/types/cms";
import { AppReleaseDocument } from "@/types/releases";
import { getAllReleasesAdmin } from "@/lib/cms";

interface ReleaseHistoryViewProps {
  currentUser: User | null;
  apps: AppDocument[];
  onNavigateToUpload?: () => void;
  onRollbackComplete?: () => void;
}

export function ReleaseHistoryView({
  currentUser,
  apps,
  onNavigateToUpload,
  onRollbackComplete,
}: ReleaseHistoryViewProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>("all");
  const [releases, setReleases] = useState<AppReleaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Rollback state
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState<AppReleaseDocument | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await getAllReleasesAdmin(selectedAppId === "all" ? undefined : selectedAppId);
      setReleases(data);
    } catch (err) {
      console.error("Error fetching release history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [selectedAppId]);

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRollback = async (targetRelease: AppReleaseDocument) => {
    if (!currentUser) return;
    setRollingBackId(targetRelease.id);
    setStatusMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/admin/apps/releases/rollback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: targetRelease.appId,
          targetReleaseId: targetRelease.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({
          type: "error",
          text: data.error || "Rollback failed.",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: data.message || `Rolled back to v${targetRelease.versionName}.`,
        });
        setRollbackConfirm(null);
        await fetchReleases();
        if (onRollbackComplete) onRollbackComplete();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ type: "error", text: `Network error: ${msg}` });
    } finally {
      setRollingBackId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#502D55]/10 shadow-xs">
        <div>
          <span className="studio-tag text-[10px] text-[#935073] font-bold block mb-1">
            APP DISTRIBUTION // AUDIT &amp; ROLLBACK
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#180D1D]">
            Application Release History
          </h2>
          <p className="text-xs sm:text-sm text-[#56475C] mt-0.5">
            Audit immutable release metadata, inspect package checksums, and manage instant version rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[#502D55]/20 bg-[#FAF4F9] text-xs font-semibold text-[#180D1D] focus:outline-none focus:border-[#935073] cursor-pointer"
          >
            <option value="all">All Applications ({releases.length})</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>

          {onNavigateToUpload && (
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              + New Release
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="font-semibold">{statusMessage.text}</div>
        </div>
      )}

      {/* Confirmation Modal for Rollback */}
      {rollbackConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white shadow-2xl border border-[#502D55]/20 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#180D1D]">
                  Confirm Version Rollback
                </h3>
                <span className="text-xs text-[#7A6880]">Immediate live update</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
              Are you sure you want to roll back the public stable version of{" "}
              <strong>{rollbackConfirm.appName}</strong> to{" "}
              <strong>v{rollbackConfirm.versionName}</strong> (Version Code: #{rollbackConfirm.versionCode})?
              <br /><br />
              The public download page will immediately point to this binary. Previous version history will be preserved.
            </p>

            <div className="p-3 rounded-xl bg-[#FAF4F9] text-xs font-mono text-[#56475C] space-y-1">
              <div>Target Version: v{rollbackConfirm.versionName}</div>
              <div>SHA-256: {rollbackConfirm.sha256.slice(0, 16)}...</div>
              <div>Hosting: {rollbackConfirm.hostingProvider.toUpperCase()}</div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRollbackConfirm(null)}
                disabled={Boolean(rollingBackId)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRollback(rollbackConfirm)}
                disabled={Boolean(rollingBackId)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {rollingBackId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Rollback...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Confirm &amp; Roll Back</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Release List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#502D55]/10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#935073] mb-3" />
          <div className="text-sm font-bold text-[#180D1D]">Loading release catalog...</div>
        </div>
      ) : releases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#502D55]/10 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-[#7A6880]" />
          <div className="text-base font-bold text-[#180D1D]">No releases recorded yet</div>
          <p className="text-xs text-[#56475C] max-w-md mx-auto">
            Upload and publish your first application release using the Release Manager.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((rel) => {
            const isCopied = copiedHash === rel.id;
            const releaseDateFormatted = new Date(rel.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={rel.id}
                className={`p-6 rounded-2xl bg-white border transition-all shadow-xs space-y-4 ${
                  rel.isLatestStable
                    ? "border-emerald-500 ring-2 ring-emerald-500/10"
                    : "border-[#502D55]/10"
                }`}
              >
                {/* Top Row: Badges, Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#180D1D]">
                      v{rel.versionName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF4F9] border border-[#502D55]/15 font-mono text-[10px] font-bold text-[#7A6880]">
                      #{rel.versionCode}
                    </span>

                    {rel.isLatestStable && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        CURRENT STABLE RELEASE
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rel.channel === "stable"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rel.channel}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        rel.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : rel.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {rel.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase">
                      {rel.hostingProvider}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {rel.downloadUrl && (
                      <a
                        href={rel.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4F9] border border-[#502D55]/15 text-xs font-bold text-[#180D1D] hover:bg-[#502D55]/08 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#935073]" />
                        <span>Download APK</span>
                      </a>
                    )}

                    {!rel.isLatestStable && rel.status === "published" && (
                      <button
                        type="button"
                        onClick={() => setRollbackConfirm(rel)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rollback to this</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Release Title */}
                <div>
                  <h3 className="text-base font-bold text-[#180D1D]">
                    {rel.releaseTitle}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-[#7A6880] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {releaseDateFormatted}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      {rel.fileSizeFormatted}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      Min: {rel.minAndroidVersion}
                    </span>
                  </div>
                </div>

                {/* Release Notes */}
                {rel.releaseNotes && (
                  <div className="p-3.5 rounded-xl bg-[#FAF4F9] border border-[#502D55]/08 text-xs text-[#56475C] font-sans whitespace-pre-line leading-relaxed">
                    {rel.releaseNotes}
                  </div>
                )}

                {/* Security & Checksum Footer */}
                <div className="pt-2 border-t border-[#502D55]/08 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#56475C] truncate">
                    <span className="text-[#7A6880]">SHA-256:</span>
                    <span className="font-bold text-[#180D1D] truncate">{rel.sha256}</span>
                    <button
                      type="button"
                      onClick={() => copyHash(rel.sha256, rel.id)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#7A6880]" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#7A6880] shrink-0">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {rel.isProductionSigned ? "Production Signed" : "Non-production"}
                    </span>
                    <span>By: {rel.uploadedBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
