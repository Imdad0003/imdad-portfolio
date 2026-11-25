import fs from "fs/promises";
import path from "path";
import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

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

async function readLocalReviews(): Promise<Review[]> {
  await ensureFile();
  try {
    const content = await fs.readFile(REVIEWS_FILE, "utf-8");
    return JSON.parse(content) as Review[];
  } catch (err) {
    console.error("Error reading reviews file:", err);
    return [];
  }
}

export async function getAllReviews(): Promise<Review[]> {
  const localReviews = await readLocalReviews();
  const merged = new Map<string, Review>(localReviews.map((r) => [r.id, r]));

  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, "reviews"));
      snap.docs.forEach((d) => {
        const data = d.data() as Partial<Review>;
        merged.set(d.id, {
          id: d.id,
          name: String(data.name || "Client"),
          email: String(data.email || ""),
          service: String(data.service || ""),
          rating: Number(data.rating || 5),
          review: String(data.review || ""),
          status: (data.status as ReviewStatus) || "pending",
          verified: Boolean(data.verified),
          createdAt: String(data.createdAt || new Date().toISOString()),
          updatedAt: String(data.updatedAt || data.createdAt || new Date().toISOString()),
          ...(data.image ? { image: String(data.image) } : {}),
        });
      });
    } catch (err) {
      console.warn("Firestore getAllReviews merge fallback:", err);
    }
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getApprovedReviews(): Promise<PublicReview[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("status", "==", "approved")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name,
              service: data.service,
              rating: data.rating,
              review: data.review,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              verified: data.verified,
              status: data.status,
              image: data.image,
            } as PublicReview;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn("Firestore getApprovedReviews fallback:", err);
    }
  }

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
  const reviews = await readLocalReviews();

  const now = new Date().toISOString();
  const cleanImage = input.image?.trim();
  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    service: input.service.trim(),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    review: input.review.trim(),
    ...(cleanImage ? { image: cleanImage } : {}),
    status: "pending", // All reviews start as pending until manually approved
    verified: false, // Verification is independent of approval
    createdAt: now,
    updatedAt: now,
  };

  reviews.push(newReview);
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");

  // Also sync to Firestore if configured
  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, "reviews", newReview.id), newReview);
    } catch (err) {
      console.warn("Firestore createReview sync fallback:", err);
    }
  }

  return newReview;
}

export async function updateReview(
  id: string,
  updates: Partial<Pick<Review, "status" | "verified" | "review" | "rating" | "service">>
): Promise<Review | null> {
  await ensureFile();
  const reviews = await readLocalReviews();
  const index = reviews.findIndex((r) => r.id === id);
  const now = new Date().toISOString();

  let updated: Review | null = null;

  if (index !== -1) {
    updated = {
      ...reviews[index],
      ...updates,
      updatedAt: now,
    };
    reviews[index] = updated;
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  }

  if (db && isFirebaseConfigured) {
    try {
      const refDoc = doc(db, "reviews", id);
      const snap = await getDoc(refDoc);
      if (snap.exists() || updated) {
        const base = snap.exists() ? (snap.data() as Review) : updated!;
        updated = {
          ...base,
          ...updates,
          id,
          updatedAt: now,
        };
        await setDoc(refDoc, updated, { merge: true });
      }
    } catch (err) {
      console.warn("Firestore updateReview sync fallback:", err);
    }
  }

  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  await ensureFile();
  const reviews = await readLocalReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  let deletedAny = filtered.length < reviews.length;

  if (deletedAny) {
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  }

  if (db && isFirebaseConfigured) {
    try {
      const refDoc = doc(db, "reviews", id);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        await deleteDoc(refDoc);
        deletedAny = true;
      }
    } catch (err) {
      console.warn("Firestore deleteReview sync fallback:", err);
    }
  }

  return deletedAny;
}
