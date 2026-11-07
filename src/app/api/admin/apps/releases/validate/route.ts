import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";
import { validateApk } from "@/lib/apk-parser";

export const dynamic = "force-dynamic";

/**
 * Admin APK Validation API
 * Analyzes and validates an uploaded APK binary before saving or publishing.
 * Verifies package ID, version codes, production certificate, rejects debug keys.
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
