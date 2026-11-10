import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/config";
import { getPublishedAppBySlug, getPublishedReleases, getLatestStableRelease } from "@/lib/cms";
import { getPublishedWishMusicVisuals } from "@/lib/wishmusic-visuals-service";
import { WishMusicShowcaseClient } from "@/components/apps/WishMusicShowcaseClient";
import { AppReleaseDocument } from "@/types/releases";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WishMusic for Android — Official APK Download & SoundLab | IMDAD.BUILDS",
  description:
    "Official Android APK release for WishMusic. Distraction-free, gesture-driven high-fidelity audio player with lossless FLAC playback, dynamic album palette extraction, and zero telemetry bloat.",
  openGraph: {
    title: "WishMusic for Android — Official APK Download | IMDAD.BUILDS",
    description:
      "Download WishMusic APK directly from the official developer studio. Lossless FLAC/ALAC, offline caching, and tactile waveform scrubbing.",
    url: `${siteConfig.siteUrl}/apps/wishmusic`,
    images: [
      {
        url: `${siteConfig.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "WishMusic Android Release by IMDAD.BUILDS",
      },
    ],
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/apps/wishmusic`,
  },
};

export default async function WishMusicPage() {
  const app = await getPublishedAppBySlug("wishmusic");
  if (!app) {
    notFound();
  }

  // Fetch visual content from CMS / Firestore (falls back to authentic defaults)
  const visuals = await getPublishedWishMusicVisuals();

  // Fetch releases
  let latestRelease = await getLatestStableRelease("wishmusic");
  let releases = await getPublishedReleases("wishmusic");

  // Robust release synchronization:
  // If compound query returned empty due to caching, but apps document has verified release info:
  if (!latestRelease && app.latestDownloadUrl) {
    latestRelease = {
      id: app.latestReleaseId || "wishmusic_1",
      appId: "wishmusic",
      appName: app.name,
      versionName: app.latestVersionName || app.version || "1.0.0",
      versionCode: app.latestVersionCode || 1,
      minSdkVersion: (app as unknown as Record<string, unknown>).minSdkVersion ? Number((app as unknown as Record<string, unknown>).minSdkVersion) : 24,
      targetSdkVersion: (app as unknown as Record<string, unknown>).targetSdkVersion ? Number((app as unknown as Record<string, unknown>).targetSdkVersion) : 36,
      minAndroidVersion: ((app as unknown as Record<string, unknown>).minAndroidVersion as string) || "Android 7.0 (Nougat)",
      targetAndroidVersion: ((app as unknown as Record<string, unknown>).targetAndroidVersion as string) || "Android 16",
      sha256: app.latestSha256 || "6c3b4c785267ae5b64803d50008c1a92fec770da0da6362557530e55d96f71f1",
      certificateFingerprintSha256: app.approvedCertificateFingerprint || "CB1DFC5B5116E0E82D23733601AABA90C23EB70C8FC9F9BCECDE6293FC2CE4EB",
      certificateSubject: "CN=Imdad Ansar, O=Imdad.Builds",
      isProductionSigned: true,
      downloadUrl: app.latestDownloadUrl,
      fileSize: 84329949,
      fileSizeFormatted: app.latestApkSize || "80.42 MB",
      status: "published",
      channel: "stable",
      isLatestStable: true,
      publishedAt: app.updatedAt || new Date().toISOString(),
      releaseTitle: `WishMusic v${app.latestVersionName || "1.0.0"} Launch`,
      releaseNotes: "Official production launch of WishMusic v1.0.0 featuring tactile waveform scrubbing, lossless audio engine, and verified APK Signature Scheme v2.",
      hostingProvider: "github",
    } as AppReleaseDocument;

    if (releases.length === 0) {
      releases = [latestRelease];
    }
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF9]">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#7A6880] mb-8">
          <Link href="/" className="hover:text-[#180D1D] transition-colors">
            STUDIO
          </Link>
          <span>/</span>
          <Link href="/apps" className="hover:text-[#180D1D] transition-colors">
            APPS
          </Link>
          <span>/</span>
          <span className="text-[#935073] font-bold">WISHMUSIC</span>
        </div>

        {/* Interactive Product Showcase Client */}
        <WishMusicShowcaseClient
          app={app}
          visuals={visuals}
          latestRelease={latestRelease}
          allReleases={releases}
        />

        {/* Bottom Bespoke App Inquiry Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-[#FAF2EA] border border-[#F6DBC0] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="studio-tag text-[10px] text-[#7A3F26] font-bold block mb-1">
              BESPOKE SOFTWARE LAB
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#180D1D]">
              Want an app engineered with this level of craft?
            </h3>
            <p className="text-xs sm:text-sm text-[#56475C] mt-1 max-w-xl leading-relaxed">
              We design and engineer bespoke cross-platform mobile applications, progressive web utilities, and lossless media engines.
            </p>
          </div>
          <Link
            href="/contact?subject=Inquiry%20for%20custom%20app%20build%20inspired%20by%20WishMusic"
            className="px-6 py-3.5 rounded-xl bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold text-xs sm:text-sm shrink-0 transition-all shadow-xs"
          >
            Start App Project
          </Link>
        </div>
      </Container>
    </div>
  );
}
