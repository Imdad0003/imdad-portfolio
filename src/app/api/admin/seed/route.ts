import { NextRequest, NextResponse } from "next/server";
import { migrateInitialDataToFirestore } from "@/lib/migration";

const ADMIN_ALLOWED_EMAILS = (
  process.env.ADMIN_ALLOWED_EMAILS || "imdad.builds@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-admin-email") || "";
    const adminKey = req.headers.get("x-admin-key") || "";
    const expectedKey = process.env.ADMIN_SECRET_KEY || "imdad-admin-2026";

    const isEmailAuthorized = ADMIN_ALLOWED_EMAILS.includes(authHeader.toLowerCase());
    const isKeyAuthorized = adminKey === expectedKey;

    if (!isEmailAuthorized && !isKeyAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const { force } = await req.json().catch(() => ({ force: false }));
    const result = await migrateInitialDataToFirestore(Boolean(force));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to migrate data" },
      { status: 500 }
    );
  }
}
