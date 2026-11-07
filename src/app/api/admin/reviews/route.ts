import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, updateReview, deleteReview } from "@/lib/reviews";
import { verifyAdminRequest } from "@/lib/server-auth";

/**
 * Privileged Admin Review Management API
 *
 * Security Requirements:
 * - Requires verified administrator authentication (Bearer Firebase ID token or configured server secret).
 * - Query-parameter authentication (?key=) is strictly prohibited.
 * - Insecure fallback credentials removed.
 * - Protects GET (including private emails), PATCH (moderation status), and DELETE operations.
 */

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || "Unauthorized access." },
      { status: authResult.statusCode }
    );
  }

  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || "Unauthorized access." },
      { status: authResult.statusCode }
    );
  }

  try {
    const body = await req.json();
    const { id, status, verified, review, rating, service } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const updates: Parameters<typeof updateReview>[1] = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updates.status = status;
    }
    if (typeof verified === "boolean") {
      updates.verified = verified;
    }
    if (typeof review === "string") {
      updates.review = review.trim();
    }
    if (typeof rating === "number") {
      updates.rating = Math.max(1, Math.min(5, Math.round(rating)));
    }
    if (typeof service === "string") {
      updates.service = service.trim();
    }

    const updated = await updateReview(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admin/reviews error:", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || "Unauthorized access." },
      { status: authResult.statusCode }
    );
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const success = await deleteReview(id);
    if (!success) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/admin/reviews error:", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
