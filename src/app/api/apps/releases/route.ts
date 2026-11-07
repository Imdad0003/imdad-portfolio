import { NextRequest, NextResponse } from "next/server";
import { getPublishedReleases } from "@/lib/cms";
import { AppReleaseDocument } from "@/types/releases";

export const dynamic = "force-dynamic";

/**
 * Public Releases API
 * Returns published releases for an application.
 * Never exposes draft, revoked, or unpublished releases.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId") || "wishmusic";

    const releases: AppReleaseDocument[] = await getPublishedReleases(appId);
    const latest = releases.find((r) => r.isLatestStable) || releases[0] || null;

    return NextResponse.json(
      {
        appId,
        latest,
        releases,
        count: releases.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Public releases query error:", err);
    return NextResponse.json({ appId: "wishmusic", releases: [], latest: null }, { status: 200 });
  }
}
