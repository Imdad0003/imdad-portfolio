"use client";

import React, { useState } from "react";
import {
  Download,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileCode,
  HardDrive,
  Calendar,
  Smartphone,
  ExternalLink,
  Info,
  Clock,
} from "lucide-react";
import { AppReleaseDocument } from "@/types/releases";

interface WishMusicDownloadClientProps {
  latestRelease: AppReleaseDocument | null;
  allReleases: AppReleaseDocument[];
}

export function WishMusicDownloadClient({
  latestRelease,
  allReleases,
}: WishMusicDownloadClientProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const copyChecksum = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const downloadTargetUrl = latestRelease?.downloadUrl || "/api/apps/download/wishmusic";

  const previousReleases = allReleases.filter(
    (r) => r.id !== latestRelease?.id && r.status === "published"
  );

  return (
    <div className="space-y-10">
      {/* Primary Download Callout Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1A0A1F] via-[#2A1032] to-[#140618] text-white border border-white/12 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#935073]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#502D55]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {latestRelease ? (
                <>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Latest Stable Release
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#F6DBC0] text-xs font-mono border border-white/10">
                    v{latestRelease.versionName}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#d8cfc4] text-xs font-mono border border-white/10">
                    Build #{latestRelease.versionCode}
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Release In Preparation // Keystore Verification Pending
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#F6DBC0] text-xs font-mono border border-white/10">
                    v1.0.0 Upcoming
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#d8cfc4] text-xs font-mono border border-white/10">
                    Build #100 (Pre-Flight)
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {latestRelease
                ? "Download WishMusic for Android"
                : "WishMusic for Android (v1.0.0 Upcoming)"}
            </h2>

            <p className="text-sm sm:text-base text-[#d8cfc4] leading-relaxed">
              {latestRelease
                ? "Official, clean, unbloated Android release binary. Directly engineered by IMDAD.BUILDS. No telemetry, no third-party trackers, and no store intermediaries."
                : "The official Android production APK is currently undergoing final cryptographic keystore signing and apksigner verification. Once published through the studio release manager, direct APK downloads and verified SHA-256 checksums will be active here."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#F6DBC0] pt-2">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#935073]" />
                {latestRelease?.fileSizeFormatted || "~24 MB (Estimated)"}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#935073]" />
                Requires {latestRelease?.minAndroidVersion || "Android 7.0+ (Nougat)"}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#935073]" />
                {latestRelease?.createdAt
                  ? new Date(latestRelease.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Awaiting Keystore Signing"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 shrink-0">
            {latestRelease ? (
              <a
                href={downloadTargetUrl}
                download={latestRelease.fileName || "wishmusic.apk"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-base transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Official APK</span>
              </a>
            ) : (
              <div className="space-y-2">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/10 text-white/80 font-bold text-base border border-white/15 cursor-not-allowed select-none">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Release In Preparation</span>
                </div>
                <p className="text-[11px] font-mono text-center text-[#d8cfc4]/70">
                  Pre-flight keystore verification
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowInstallGuide(!showInstallGuide)}
                className="text-xs font-mono text-[#d8cfc4] hover:text-white underline underline-offset-4 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>How to install on Android</span>
                {showInstallGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* SHA-256 Checksum Verification Pill */}
        {latestRelease?.sha256 && (
          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#d8cfc4] overflow-hidden">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="shrink-0 text-[#F6DBC0]">SHA-256:</span>
              <span className="text-white font-bold truncate select-all">{latestRelease.sha256}</span>
            </div>

            <button
              type="button"
              onClick={() => copyChecksum(latestRelease.sha256, "latest")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              {copiedHash === "latest" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Checksum Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Checksum</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Honest Android APK Installation Guide */}
      {showInstallGuide && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF4F9] border border-[#502D55]/15 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#502D55] text-white flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#180D1D]">
                Android APK Installation Guide
              </h3>
              <p className="text-xs text-[#56475C]">
                Honest explanation of standard Android security warnings for direct APK installs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-[#502D55]/10 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#935073] text-white font-bold flex items-center justify-center text-[11px]">
                1
              </span>
              <h4 className="font-bold text-[#180D1D]">Tap Download APK</h4>
              <p className="text-[#56475C] leading-relaxed">
                Download the official binary from the button above directly to your device.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#502D55]/10 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#935073] text-white font-bold flex items-center justify-center text-[11px]">
                2
              </span>
              <h4 className="font-bold text-[#180D1D]">&ldquo;File might be harmful&rdquo;</h4>
              <p className="text-[#56475C] leading-relaxed">
                Android displays this standard alert for <em>any</em> APK downloaded from a browser instead of the Play Store. Tap <strong>Download anyway</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#502D55]/10 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#935073] text-white font-bold flex items-center justify-center text-[11px]">
                3
              </span>
              <h4 className="font-bold text-[#180D1D]">Allow Unknown Apps</h4>
              <p className="text-[#56475C] leading-relaxed">
                When prompted, open your browser Settings and enable &ldquo;Allow from this source&rdquo; to permit the package installer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#502D55]/10 space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#935073] text-white font-bold flex items-center justify-center text-[11px]">
                4
              </span>
              <h4 className="font-bold text-[#180D1D]">Google Play Protect</h4>
              <p className="text-[#56475C] leading-relaxed">
                Play Protect may scan the package. WishMusic contains zero advertising SDKs or telemetry. Tap <strong>Install</strong> to finish.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Previous Version History Drawer */}
      {previousReleases.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#502D55]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#180D1D]">
                Previous Releases &amp; Rollback History
              </h3>
              <p className="text-xs text-[#56475C]">
                Verified previous APK versions preserved for compatibility and testing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF4F9] text-xs font-bold text-[#180D1D] hover:bg-[#502D55]/10 transition-colors cursor-pointer"
            >
              <span>{showHistory ? "Hide History" : `Show Previous (${previousReleases.length})`}</span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-3 pt-3 border-t border-[#502D55]/10 animate-fade-in">
              {previousReleases.map((rel) => (
                <div
                  key={rel.id}
                  className="p-4 rounded-2xl bg-[#FAF4F9] border border-[#502D55]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#180D1D]">
                        v{rel.versionName}
                      </span>
                      <span className="font-mono text-[10px] text-[#7A6880]">
                        #{rel.versionCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                        {rel.channel}
                      </span>
                      <span className="text-[11px] text-[#7A6880]">
                        {new Date(rel.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-[#56475C] truncate max-w-md">
                      SHA-256: {rel.sha256.slice(0, 20)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyChecksum(rel.sha256, rel.id)}
                      className="p-2 rounded-lg bg-white border border-[#502D55]/15 hover:bg-gray-50 transition-colors cursor-pointer text-[#56475C]"
                      title="Copy SHA-256 Checksum"
                    >
                      {copiedHash === rel.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={rel.downloadUrl}
                      download={rel.fileName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
