import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { AppReleaseDocument, ReleaseAuditLogDocument } from "@/types/releases";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized admin account." },
        { status: authResult.statusCode }
      );
    }

    const adminEmail = authResult.user?.email || "admin@imdadbuild.space";
    const body = await req.json();
    const { appId, targetReleaseId } = body;

    if (!appId || !targetReleaseId) {
      return NextResponse.json(
        { success: false, error: "appId and targetReleaseId are required." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database is not connected." },
        { status: 500 }
      );
    }

    const targetRef = doc(db, "appReleases", targetReleaseId);
    const targetSnap = await getDoc(targetRef);

    if (!targetSnap.exists()) {
      return NextResponse.json(
        { success: false, error: `Release '${targetReleaseId}' not found.` },
        { status: 404 }
      );
    }

    const targetRelease = targetSnap.data() as AppReleaseDocument;
    if (targetRelease.appId !== appId) {
      return NextResponse.json(
        { success: false, error: "Target release does not belong to the specified app." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Unset isLatestStable on all other releases for this app
    const otherReleasesSnap = await getDocs(
      query(collection(db, "appReleases"), where("appId", "==", appId))
    );

    for (const rDoc of otherReleasesSnap.docs) {
      if (rDoc.id !== targetReleaseId && rDoc.data().isLatestStable) {
        await updateDoc(doc(db, "appReleases", rDoc.id), {
          isLatestStable: false,
          updatedAt: now,
        });
      }
    }

    // 2. Set target release to published and isLatestStable
    await updateDoc(targetRef, {
      isLatestStable: true,
      status: "published",
      updatedAt: now,
    });

    // 3. Update the app document
    await setDoc(
      doc(db, "apps", appId),
      {
        version: `v${targetRelease.versionName}`,
        latestReleaseId: targetRelease.id,
        latestVersionName: targetRelease.versionName,
        latestVersionCode: targetRelease.versionCode,
        latestApkSize: targetRelease.fileSizeFormatted,
        latestSha256: targetRelease.sha256,
        latestDownloadUrl: targetRelease.downloadUrl,
        updatedAt: now,
      },
      { merge: true }
    );

    // 4. Create Audit Log
    const auditLog: ReleaseAuditLogDocument = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appId,
      releaseId: targetReleaseId,
      action: "rollback",
      performedBy: adminEmail,
      details: {
        rolledBackToVersionName: targetRelease.versionName,
        rolledBackToVersionCode: targetRelease.versionCode,
        previousState: targetRelease.status,
      },
      timestamp: now,
    };
    await setDoc(doc(db, "releaseAuditLogs", auditLog.id), auditLog);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully rolled back to release v${targetRelease.versionName} (Code: ${targetRelease.versionCode}).`,
        activeRelease: {
          ...targetRelease,
          isLatestStable: true,
          status: "published",
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Rollback API error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Rollback failed: ${msg}` },
      { status: 500 }
    );
  }
}
