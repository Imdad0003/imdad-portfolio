import { NextRequest, NextResponse } from "next/server";
import { defaultVideoOrderConfig } from "@/data/video-order-config";
import { VideoOrderAdminConfig } from "@/types/video-order";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { verifyAdminRequest } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Admin Configuration API for Video Editing Order Options
 * IMDAD.BUILDS — Agent 02 Specification
 *
 * Exposes editable data structures for:
 * - Service options
 * - Video formats
 * - Aspect ratios
 * - File upload settings
 * - Order form fields
 * - Delivery options
 */
export async function GET() {
  try {
    // Attempt to load customized config from Firestore if available
    if (db) {
      try {
        const snap = await getDoc(doc(db, "orderConfigurations", "video-editing"));
        if (snap.exists()) {
          const remoteData = snap.data() as Partial<VideoOrderAdminConfig>;
          return NextResponse.json({
            success: true,
            config: {
              ...defaultVideoOrderConfig,
              ...remoteData,
            },
            isCustomized: true,
          });
        }
      } catch (dbErr) {
        console.warn("[VideoOrderConfigAPI] Firestore read warning:", dbErr);
      }
    }

    // Default configuration (with production-ready dummy data)
    return NextResponse.json({
      success: true,
      config: defaultVideoOrderConfig,
      isCustomized: false,
    });
  } catch (error) {
    console.error("[VideoOrderConfigAPI] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load video order configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Unauthorized. Admin credentials required." },
        { status: authResult.statusCode }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid configuration payload." },
        { status: 400 }
      );
    }

    if (db) {
      await setDoc(doc(db, "orderConfigurations", "video-editing"), {
        ...defaultVideoOrderConfig,
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Video editing order configuration updated.",
    });
  } catch (error) {
    console.error("[VideoOrderConfigAPI] Update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update configuration." },
      { status: 500 }
    );
  }
}
