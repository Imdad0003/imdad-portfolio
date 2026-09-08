import fs from "fs/promises";
import path from "path";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  name: string;
  email: string; // Stored securely on the server; NEVER exposed publicly
  service: string;
  rating: number; // 1 to 5
  review: string;
  image?: string;
  status: ReviewStatus;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PublicReview = Omit<Review, "email">;

const DATA_DIR = path.join(process.cwd(), "data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(REVIEWS_FILE);
  } catch {
    // Initialize with empty array - strictly no fake or placeholder reviews
    await fs.writeFile(REVIEWS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function getAllReviews(): Promise<Review[]> {
  await ensureFile();
  try {
    const content = await fs.readFile(REVIEWS_FILE, "utf-8");
    return JSON.parse(content) as Review[];
  } catch (err) {
    console.error("Error reading reviews file:", err);
    return [];
  }
}

export async function getApprovedReviews(): Promise<PublicReview[]> {
  const reviews = await getAllReviews();
  return reviews
    .filter((r) => r.status === "approved")
    .map((r) => ({
      id: r.id,
      name: r.name,
      service: r.service,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      verified: r.verified,
      status: r.status,
      image: r.image,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(input: {
  name: string;
  email: string;
  service: string;
  rating: number;
  review: string;
  image?: string;
}): Promise<Review> {
  await ensureFile();
  const reviews = await getAllReviews();

  const now = new Date().toISOString();
  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    service: input.service.trim(),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    review: input.review.trim(),
    image: input.image?.trim() || undefined,
    status: "pending", // All reviews start as pending until manually approved
    verified: false, // Verification is independent of approval
    createdAt: now,
    updatedAt: now,
  };

  reviews.push(newReview);
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");

  return newReview;
}

export async function updateReview(
  id: string,
  updates: Partial<Pick<Review, "status" | "verified" | "review" | "rating" | "service">>
): Promise<Review | null> {
  await ensureFile();
  const reviews = await getAllReviews();
  const index = reviews.findIndex((r) => r.id === id);

  if (index === -1) return null;

  const current = reviews[index];
  const updated: Review = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  reviews[index] = updated;
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");

  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  await ensureFile();
  const reviews = await getAllReviews();
  const filtered = reviews.filter((r) => r.id !== id);

  if (filtered.length === reviews.length) return false;

  await fs.writeFile(REVIEWS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
