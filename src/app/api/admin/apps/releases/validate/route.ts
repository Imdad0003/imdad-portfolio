import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";
import { validateApk, validateApkInspection, ApkInspectionPayload } from "@/lib/apk-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Admin APK Validation API
 *
 * Analyzes and validates an APK before saving or publishing.
 * Supports:
 * 1. JSON with inspectionPayload: Instant client-extracted manifest & signature block (~20KB, 0MB payload).
 * 2. JSON with downloadUrl: Validates an already-staged APK in storage.
 * 3. FormData with apkFile: Direct buffer validation (for test suites and files < 4.5 MB).
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { valid: false, error: authResult.error || "Unauthorized admin account." },
        { status: authResult.statusCode }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // MODE 1 & 2: JSON Payload (inspectionPayload or downloadUrl)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const {
        inspectionPayload,
        downloadUrl,
        expectedPackage,
        currentLatestVersionCode,
        approvedFingerprint,
      } = body;

      if (inspectionPayload) {
        const validation = validateApkInspection(inspectionPayload as ApkInspectionPayload, {
          expectedPackage: expectedPackage || undefined,
          currentLatestVersionCode: typeof currentLatestVersionCode === "number"
            ? currentLatestVersionCode
            : undefined,
          approvedFingerprint: approvedFingerprint || undefined,
        });

        return NextResponse.json(validation, { status: 200 });
      }

      if (downloadUrl) {
        // Download from storage
        const fetchRes = await fetch(downloadUrl);
        if (!fetchRes.ok) {
          return NextResponse.json(
            { valid: false, errors: [`Failed to retrieve APK from storage (${fetchRes.status})`] },
            { status: 400 }
          );
        }
        const arrayBuf = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const validation = validateApk(buffer, {
          expectedPackage: expectedPackage || undefined,
          currentLatestVersionCode: typeof currentLatestVersionCode === "number"
            ? currentLatestVersionCode
            : undefined,
          approvedFingerprint: approvedFingerprint || undefined,
          fileName: body.fileName || "release.apk",
        });

        return NextResponse.json(validation, { status: 200 });
      }

      return NextResponse.json(
        { valid: false, errors: ["Missing inspectionPayload or downloadUrl in JSON body."] },
        { status: 400 }
      );
    }

    // MODE 3: Multipart Form Data (for automated tests and small binaries)
    const formData = await req.formData();
    const file = formData.get("apkFile") as File | null;
    const expectedPackage = (formData.get("expectedPackage") as string) || undefined;
    const currentLatestVersionCodeStr = formData.get("currentLatestVersionCode") as string | null;
    const approvedFingerprint = (formData.get("approvedFingerprint") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { valid: false, errors: ["Missing APK file in request."] },
        { status: 400 }
      );
    }

    const currentLatestVersionCode = currentLatestVersionCodeStr
      ? parseInt(currentLatestVersionCodeStr, 10)
      : undefined;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateApk(buffer, {
      expectedPackage,
      currentLatestVersionCode: isNaN(currentLatestVersionCode || NaN)
        ? undefined
        : currentLatestVersionCode,
      approvedFingerprint,
      fileName: file.name,
    });

    return NextResponse.json(validation, { status: 200 });
  } catch (err: unknown) {
    console.error("APK validation API error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { valid: false, errors: [`Validation processing error: ${msg}`] },
      { status: 500 }
    );
  }
}
