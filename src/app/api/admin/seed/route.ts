import { NextRequest, NextResponse } from "next/server";
import { migrateInitialDataToFirestore } from "@/lib/migration";
import { verifyAdminRequest } from "@/lib/server-auth";

/**
 * Administrative Database Migration / Seeding Endpoint
 *
 * Security Requirements:
 * - Disabled by default unless ENABLE_ADMIN_SEED=true is set in server environment variables.
 * - Requires verified administrator authentication via Bearer token (Firebase Auth ID Token) or configured server secret.
 * - Rejects any unauthenticated requests, forged headers (e.g. x-admin-email), or non-admin accounts.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Safety Gate: Disabled by default unless explicitly enabled
    const isSeedAllowed =
      process.env.ENABLE_ADMIN_SEED === "true" ||
      process.env.NODE_ENV === "development";

    if (!isSeedAllowed) {
      return NextResponse.json(
        {
          error:
            "Database seeding endpoint is disabled by default for safety. Set ENABLE_ADMIN_SEED=true in server environment variables to enable.",
        },
        { status: 403 }
      );
    }

    // 2. Strict Administrator Authorization Verification
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized. Admin privileges required." },
        { status: authResult.statusCode }
      );
    }

    const { force } = await req.json().catch(() => ({ force: false }));
    const result = await migrateInitialDataToFirestore(Boolean(force));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Admin seed error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to migrate data" },
      { status: 500 }
    );
  }
}
