import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { siteConfig } from "@/data/config";
import { verifyAdminRequest } from "@/lib/server-auth";
import { validateApk } from "@/lib/apk-parser";
import {
  getGitHubConfig,
  createGitHubRelease,
  uploadGitHubReleaseAsset,
} from "@/lib/github-releases";
import { db, storage } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { AppReleaseDocument, ReleaseAuditLogDocument } from "@/types/releases";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce admin authorization
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized admin account." },
        { status: authResult.statusCode }
      );
    }

    const adminEmail = authResult.user?.email || "admin@imdadbuild.space";

    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let fileName: string = "release.apk";
    let appId: string = "wishmusic";
    let appName: string = "WishMusic";
    let releaseTitle: string = "";
    let releaseNotes: string = "Initial production release.";
    let channel: "stable" | "beta" = "stable";
    let status: "published" | "draft" = "published";
    let customDownloadUrl: string = "";
    let stagingPath: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      appId = body.appId || "wishmusic";
      appName = body.appName || "WishMusic";
      releaseTitle = body.releaseTitle || "";
      releaseNotes = body.releaseNotes || "Initial production release.";
      channel = (body.channel || "stable") as "stable" | "beta";
      status = (body.status || "published") as "published" | "draft";
      customDownloadUrl = body.customDownloadUrl || "";
      stagingPath = body.stagingPath;

      if (!body.downloadUrl) {
        return NextResponse.json(
          { success: false, errors: ["Missing downloadUrl or APK binary source."] },
          { status: 400 }
        );
      }

      // Download binary from storage
      const storageRes = await fetch(body.downloadUrl);
      if (!storageRes.ok) {
        return NextResponse.json(
          { success: false, errors: [`Failed to retrieve APK from storage (${storageRes.status})`] },
          { status: 400 }
        );
      }
      const arrayBuf = await storageRes.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
      fileName = body.fileName || (stagingPath ? path.basename(stagingPath).replace(/^\d+_[a-f0-9]+_/, "") : "release.apk");
    } else {
      // Parse multipart form data
      const formData = await req.formData();
      const file = formData.get("apkFile") as File | null;
      appId = (formData.get("appId") as string) || "wishmusic";
      appName = (formData.get("appName") as string) || "WishMusic";
      releaseTitle = (formData.get("releaseTitle") as string) || "";
      releaseNotes = (formData.get("releaseNotes") as string) || "Initial production release.";
      channel = ((formData.get("channel") as string) || "stable") as "stable" | "beta";
      status = ((formData.get("status") as string) || "published") as "published" | "draft";
      customDownloadUrl = (formData.get("customDownloadUrl") as string) || "";

      if (!file) {
        return NextResponse.json(
          { success: false, errors: ["APK file is required."] },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileName = file.name;
    }

    // 3. Inspect existing app record and releases for validation constraints
    let expectedPackage = appId === "wishmusic" ? "com.imdad.wishmusic" : undefined;
    let approvedFingerprint: string | undefined =
      process.env[`APPROVED_CERT_FINGERPRINT_${appId.toUpperCase().replace(/-/g, "_")}`] ||
      (appId === "wishmusic" ? process.env.APPROVED_CERT_FINGERPRINT_WISHMUSIC : undefined);
    let highestVersionCode = 0;

    if (db) {
      try {
        // Check app document
        const appSnap = await getDoc(doc(db, "apps", appId));
        if (appSnap.exists()) {
          const appData = appSnap.data();
          if (appData.packageName) expectedPackage = appData.packageName;
          if (appData.approvedCertificateFingerprint) {
            approvedFingerprint = appData.approvedCertificateFingerprint;
          }
        }

        // Check latest published release for this app to prevent downgrades
        const relSnap = await getDocs(
          query(
            collection(db, "appReleases"),
            where("appId", "==", appId),
            where("status", "==", "published")
          )
        );
        relSnap.forEach((d) => {
          const relData = d.data();
          if (typeof relData.versionCode === "number" && relData.versionCode > highestVersionCode) {
            highestVersionCode = relData.versionCode;
          }
        });
      } catch (err) {
        console.warn("Could not query existing Firestore release metadata:", err);
      }
    }

    // Strict Security Hardening: Disable Trust-On-First-Upload (TOFU).
    // An approved production certificate fingerprint must be explicitly pre-configured on the app.
    if (!approvedFingerprint) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            `Trust-On-First-Upload is strictly disabled. No approved production certificate fingerprint is configured for app '${appId}'. ` +
              `An authorized administrator must explicitly pre-configure 'approvedCertificateFingerprint' on the app record before any releases can be uploaded.`,
          ],
        },
        { status: 400 }
      );
    }

    // 4. Validate APK
    const validation = validateApk(fileBuffer, {
      expectedPackage,
      currentLatestVersionCode: highestVersionCode > 0 ? highestVersionCode : undefined,
      approvedFingerprint,
      fileName,
    });

    if (!validation.valid || !validation.metadata) {
      if (stagingPath && storage) {
        try {
          await deleteObject(ref(storage, stagingPath));
        } catch (cleanErr) {
          console.warn("Staging asset cleanup notice on validation failure:", cleanErr);
        }
      }
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    const meta = validation.metadata;

    // Check for duplicate SHA-256 upload
    if (db) {
      try {
        const dupSnap = await getDocs(
          query(collection(db, "appReleases"), where("sha256", "==", meta.sha256))
        );
        if (!dupSnap.empty) {
          const existing = dupSnap.docs[0].data();
          return NextResponse.json(
            {
              success: false,
              errors: [
                `Duplicate APK detected: An identical binary (SHA-256: ${meta.sha256.slice(0, 16)}...) was already registered as version ${existing.versionName} (Release ID: ${dupSnap.docs[0].id}).`,
              ],
            },
            { status: 400 }
          );
        }
      } catch (err) {
        console.warn("Duplicate check warning:", err);
      }
    }

    // 5. Release Distribution & Asset Hosting
    const ghConfig = getGitHubConfig();
    let hostingProvider: "github" | "storage" | "custom" = "custom";
    let downloadUrl = customDownloadUrl;
    let githubReleaseId: number | undefined;
    let githubTag: string | undefined;
    let githubAssetId: number | undefined;

    if (ghConfig.isConfigured) {
      try {
        const tag = `${appId}-v${meta.versionName}`;
        const title = releaseTitle || `${appName} v${meta.versionName}`;
        const release = await createGitHubRelease({
          tag,
          name: title,
          body: releaseNotes,
          draft: status === "draft",
          prerelease: channel === "beta",
        });

        githubReleaseId = release.id;
        githubTag = release.tagName;

        // Upload asset
        const asset = await uploadGitHubReleaseAsset({
          uploadUrl: release.uploadUrl,
          fileName,
          fileBuffer,
          releaseId: release.id,
        });

        githubAssetId = asset.id;
        downloadUrl = asset.downloadUrl;
        hostingProvider = "github";
      } catch (err: unknown) {
        console.error("GitHub Release creation/upload failed:", err);
        const errDetail = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            success: false,
            errors: [
              `GitHub Release distribution failed: ${errDetail}. Release was not saved to database to prevent broken download links.`,
            ],
          },
          { status: 502 }
        );
      }
    } else if (!downloadUrl) {
      // In production or on Vercel, ephemeral filesystem storage cannot be used.
      // A persistent hosting provider (GitHub Releases CDN or an explicit CDN customDownloadUrl) is required.
      const isEphemeralEnv = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
      if (isEphemeralEnv && process.env.ALLOW_LOCAL_RELEASE_STORAGE !== "true") {
        return NextResponse.json(
          {
            success: false,
            errors: [
              "Production storage unconfigured: GITHUB_TOKEN is not configured and no persistent CDN download URL was provided. Vercel serverless filesystem cannot be used for production binary distribution because it is ephemeral.",
            ],
          },
          { status: 400 }
        );
      }

      // Local development / non-production fallback only
      try {
        const publicDir = path.resolve(process.cwd(), "public/downloads/releases");
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const safeName = `${appId}-${meta.versionName}-${meta.versionCode}.apk`;
        fs.writeFileSync(path.join(publicDir, safeName), fileBuffer);
        downloadUrl = `${siteConfig.siteUrl}/downloads/releases/${safeName}`;
        hostingProvider = "custom";
      } catch (e) {
        console.warn("Could not save to public releases dir:", e);
        return NextResponse.json(
          {
            success: false,
            errors: [
              "Local release storage failed and GitHub Release hosting is not configured. Release was not saved.",
            ],
          },
          { status: 500 }
        );
      }
    }

    const releaseId = `${appId}_${meta.versionCode}`;
    const now = new Date().toISOString();
    const isLatestStable = status === "published" && channel === "stable";

    const releaseDoc: AppReleaseDocument = {
      id: releaseId,
      appId,
      appName,
      packageName: meta.packageName,
      versionName: meta.versionName,
      versionCode: meta.versionCode,
      releaseTitle: releaseTitle || `${appName} v${meta.versionName}`,
      releaseNotes,
      channel,
      status,
      isLatestStable,
      fileName,
      fileSize: meta.fileSize,
      fileSizeFormatted: meta.fileSizeFormatted,
      sha256: meta.sha256,
      minSdkVersion: meta.minSdkVersion,
      minAndroidVersion: meta.minAndroidVersion,
      targetSdkVersion: meta.targetSdkVersion,
      targetAndroidVersion: meta.targetAndroidVersion,
      permissions: meta.permissions,
      certificateFingerprintSha256: meta.certificateFingerprintSha256,
      certificateSubject: meta.certificateSubject,
      isProductionSigned: meta.isProductionSigned,
      hostingProvider,
      downloadUrl,
      githubReleaseId,
      githubTag,
      githubAssetId,
      uploadedBy: adminEmail,
      createdAt: now,
      publishedAt: status === "published" ? now : undefined,
      updatedAt: now,
    };

    // 6. Persist to Firestore
    if (db) {
      try {
        // If this is published as latest stable, mark previous stable releases as not latest
        if (isLatestStable) {
          const prevStableSnap = await getDocs(
            query(
              collection(db, "appReleases"),
              where("appId", "==", appId),
              where("isLatestStable", "==", true)
            )
          );
          for (const prevDoc of prevStableSnap.docs) {
            await updateDoc(doc(db, "appReleases", prevDoc.id), {
              isLatestStable: false,
              updatedAt: now,
            });
          }
        }

        // Save release document
        await setDoc(doc(db, "appReleases", releaseId), releaseDoc);

        // Update App document with latest stable release details
        if (isLatestStable) {
          await setDoc(
            doc(db, "apps", appId),
            {
              version: `v${meta.versionName}`,
              packageName: meta.packageName,
              latestReleaseId: releaseId,
              latestVersionName: meta.versionName,
              latestVersionCode: meta.versionCode,
              latestApkSize: meta.fileSizeFormatted,
              latestSha256: meta.sha256,
              latestDownloadUrl: downloadUrl,
              latestReleaseDate: now,
              approvedCertificateFingerprint: approvedFingerprint,
              updatedAt: now,
            },
            { merge: true }
          );
        }

        // Audit log
        const auditLog: ReleaseAuditLogDocument = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          appId,
          releaseId,
          action: status === "published" ? "publish" : "upload",
          performedBy: adminEmail,
          details: {
            versionName: meta.versionName,
            versionCode: meta.versionCode,
            sha256: meta.sha256,
            hostingProvider,
            channel,
            status,
          },
          timestamp: now,
        };
        await setDoc(doc(db, "releaseAuditLogs", auditLog.id), auditLog);
      } catch (err) {
        console.error("Firestore persistence error during release upload:", err);
        const errDetail = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            success: false,
            published: false,
            error: "Firestore database persistence failed after GitHub upload.",
            errors: [
              `Release asset was safely uploaded to GitHub, but database registration failed: ${errDetail}.`,
              "The release is NOT registered or published on the public website.",
            ],
            recovery: {
              appId,
              releaseId,
              versionName: meta.versionName,
              versionCode: meta.versionCode,
              hostingProvider,
              downloadUrl,
              githubReleaseId,
              githubTag,
              githubAssetId,
              sha256: meta.sha256,
              suggestedAction:
                "Verify database connectivity and permissions. You can safely retry publishing with the same APK; the existing GitHub release will be re-used without creating duplicates.",
            },
          },
          { status: 500 }
        );
      }
    }

    // Clean up temporary staging asset from storage if present
    if (stagingPath && storage) {
      try {
        await deleteObject(ref(storage, stagingPath));
      } catch (cleanErr) {
        console.warn("Staging asset cleanup notice:", cleanErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        release: releaseDoc,
        warnings: validation.warnings,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Release upload API uncaught error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, errors: [`Server processing error: ${msg}`] },
      { status: 500 }
    );
  }
}
