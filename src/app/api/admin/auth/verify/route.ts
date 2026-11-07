import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/server-auth";

/**
 * Admin Session Verification API
 * Verifies whether the incoming request contains a valid, authorized administrator token.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          authorized: false,
          error: authResult.error || "Unauthorized or non-administrator account.",
        },
        { status: authResult.statusCode }
      );
    }

    return NextResponse.json(
      {
        authorized: true,
        user: {
          uid: authResult.user?.uid,
          email: authResult.user?.email,
          authType: authResult.user?.authType,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Auth verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
