import { NextRequest, NextResponse } from "next/server";

const ADMIN_ALLOWED_EMAILS = (
  process.env.ADMIN_ALLOWED_EMAILS || "imdad.builds@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isAuthorized = ADMIN_ALLOWED_EMAILS.includes(normalizedEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        { authorized: false, error: "Email is not authorized for Studio Admin access." },
        { status: 403 }
      );
    }

    return NextResponse.json({ authorized: true, email: normalizedEmail }, { status: 200 });
  } catch (err) {
    console.error("Auth verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
