import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminRequest } from "@/lib/server-auth";
import {
  getAdminWishMusicVisuals,
  saveWishMusicDraft,
  publishWishMusicVisuals,
  restorePreviousWishMusicVisuals,
} from "@/lib/wishmusic-visuals-service";
import { WishMusicVisualContent } from "@/types/wishmusic-visuals";

export const dynamic = "force-dynamic";

/**
 * Admin WishMusic Visual Content API
 * GET: Retrieve full document (draft, published, previous)
 * POST: Execute action ('save_draft' | 'publish' | 'restore_previous')
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized." },
        { status: authResult.statusCode }
      );
    }

    const doc = await getAdminWishMusicVisuals();
    return NextResponse.json({ success: true, doc });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized." },
        { status: authResult.statusCode }
      );
    }

    const body = await req.json();
    const action = body.action as "save_draft" | "publish" | "restore_previous";
    const userEmail = authResult.user?.email || "admin";

    if (!action) {
      return NextResponse.json({ error: "Missing action." }, { status: 400 });
    }

    if (action === "save_draft") {
      const draft = body.draft as WishMusicVisualContent;
      if (!draft) {
        return NextResponse.json({ error: "Missing draft payload." }, { status: 400 });
      }
      await saveWishMusicDraft(draft, userEmail);
      return NextResponse.json({ success: true, message: "Draft saved successfully." });
    }

    if (action === "publish") {
      const result = await publishWishMusicVisuals(userEmail);
      // Invalidate relevant Next.js cache so visitors immediately see new visuals
      try {
        revalidatePath("/apps/wishmusic");
        revalidatePath("/api/apps/wishmusic/visuals");
      } catch (cacheErr) {
        console.warn("revalidatePath notice:", cacheErr);
      }
      return NextResponse.json({
        success: true,
        message: "Visual changes published successfully to live website.",
        published: result.published,
      });
    }

    if (action === "restore_previous") {
      const result = await restorePreviousWishMusicVisuals(userEmail);
      try {
        revalidatePath("/apps/wishmusic");
        revalidatePath("/api/apps/wishmusic/visuals");
      } catch (cacheErr) {
        console.warn("revalidatePath notice:", cacheErr);
      }
      return NextResponse.json({
        success: true,
        message: "Previous version restored successfully.",
        restored: result.restored,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Admin WishMusic visuals POST error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
