import { NextRequest, NextResponse } from "next/server";
import { getApprovedReviews, createReview } from "@/lib/reviews";

// Simple in-memory IP submission limiter (IP -> timestamps[])
const submissionLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 5;

  const timestamps = submissionLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxSubmissions) {
    return true;
  }

  recent.push(now);
  submissionLimitMap.set(ip, recent);
  return false;
}

// Basic HTML sanitization to prevent raw HTML execution
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const approvedReviews = await getApprovedReviews();
    return NextResponse.json({ reviews: approvedReviews }, { status: 200 });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, service, rating, review, image, consent } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return NextResponse.json({ error: "Please provide a valid name (2–80 characters)." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!service || typeof service !== "string" || service.trim().length < 2 || service.trim().length > 100) {
      return NextResponse.json({ error: "Please specify the service you purchased." }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5 stars." }, { status: 400 });
    }

    if (!review || typeof review !== "string" || review.trim().length < 10 || review.trim().length > 1500) {
      return NextResponse.json(
        { error: "Review text must be between 10 and 1,500 characters." },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json(
        { error: "You must consent to having this review displayed publicly if approved." },
        { status: 400 }
      );
    }

    // Optional image check
    let sanitizedImage: string | undefined = undefined;
    if (image && typeof image === "string" && image.trim().startsWith("http")) {
      sanitizedImage = image.trim();
    }

    await createReview({
      name: sanitizeText(name),
      email: email.trim(),
      service: sanitizeText(service),
      rating: numericRating,
      review: sanitizeText(review),
      image: sanitizedImage,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been submitted for approval.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
