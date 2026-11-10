import { NextResponse } from "next/server";
import { getPublishedWishMusicVisuals } from "@/lib/wishmusic-visuals-service";

export const dynamic = "force-dynamic";

/**
 * Public WishMusic Visual Content Endpoint
 * Serves published visual assets, screenshots, and copy to public visitors.
 */
export async function GET() {
  try {
    const visuals = await getPublishedWishMusicVisuals();
    return NextResponse.json(
      { success: true, visuals },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Public WishMusic visuals GET error:", msg);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve WishMusic visual content." },
      { status: 500 }
    );
  }
}
