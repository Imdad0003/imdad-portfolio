import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  WishMusicVisualContent,
  WishMusicVisualContentDoc,
} from "@/types/wishmusic-visuals";
import { DEFAULT_WISHMUSIC_VISUALS } from "@/data/wishmusic-defaults";

const DOC_ID = "wishmusic";
const COLLECTION_NAME = "appVisualContent";

/**
 * Fetch published visual content for the public WishMusic product showcase.
 * Unauthenticated safe. Returns authentic defaults if not yet customized in Firestore.
 */
export async function getPublishedWishMusicVisuals(): Promise<WishMusicVisualContent> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
      if (snap.exists()) {
        const data = snap.data() as Partial<WishMusicVisualContentDoc>;
        if (data.published) {
          // Merge with defaults to guarantee all required fields and keys exist
          return mergeWithDefaults(data.published);
        }
      }
    } catch (err) {
      console.warn("getPublishedWishMusicVisuals Firestore fetch warning:", err);
    }
  }
  return DEFAULT_WISHMUSIC_VISUALS;
}

/**
 * Fetch full visual content document (draft, published, previous) for Admin Visual Content Manager.
 */
export async function getAdminWishMusicVisuals(): Promise<WishMusicVisualContentDoc> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
      if (snap.exists()) {
        const data = snap.data() as Partial<WishMusicVisualContentDoc>;
        return {
          id: DOC_ID,
          draft: mergeWithDefaults(data.draft || data.published || DEFAULT_WISHMUSIC_VISUALS),
          published: mergeWithDefaults(data.published || DEFAULT_WISHMUSIC_VISUALS),
          previous: data.previous ? mergeWithDefaults(data.previous) : undefined,
          updatedAt: data.updatedAt || new Date().toISOString(),
          publishedAt: data.publishedAt,
        };
      }
    } catch (err) {
      console.warn("getAdminWishMusicVisuals Firestore fetch warning:", err);
    }
  }

  return {
    id: DOC_ID,
    draft: DEFAULT_WISHMUSIC_VISUALS,
    published: DEFAULT_WISHMUSIC_VISUALS,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save working draft visual content.
 */
export async function saveWishMusicDraft(
  draft: WishMusicVisualContent,
  performedBy: string
): Promise<boolean> {
  if (!db) return false;
  try {
    const now = new Date().toISOString();
    const updatedDraft: WishMusicVisualContent = {
      ...draft,
      id: DOC_ID,
      version: (draft.version || 1) + 1,
      updatedAt: now,
      updatedBy: performedBy,
    };

    await setDoc(
      doc(db, COLLECTION_NAME, DOC_ID),
      {
        id: DOC_ID,
        draft: updatedDraft,
        updatedAt: now,
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("saveWishMusicDraft error:", err);
    throw err;
  }
}

/**
 * Publish working draft to live production.
 * Backs up current published version to `previous` for instant rollback.
 */
export async function publishWishMusicVisuals(
  performedBy: string
): Promise<{ success: boolean; published: WishMusicVisualContent }> {
  if (!db) throw new Error("Firestore not initialized");

  const current = await getAdminWishMusicVisuals();
  const now = new Date().toISOString();

  const newPublished: WishMusicVisualContent = {
    ...current.draft,
    id: DOC_ID,
    version: (current.published.version || 1) + 1,
    updatedAt: now,
    updatedBy: performedBy,
  };

  const payload: WishMusicVisualContentDoc = {
    id: DOC_ID,
    draft: newPublished,
    published: newPublished,
    previous: current.published,
    updatedAt: now,
    publishedAt: now,
  };

  await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload);
  return { success: true, published: newPublished };
}

/**
 * Restore previous published version.
 */
export async function restorePreviousWishMusicVisuals(
  performedBy: string
): Promise<{ success: boolean; restored: WishMusicVisualContent }> {
  if (!db) throw new Error("Firestore not initialized");

  const current = await getAdminWishMusicVisuals();
  if (!current.previous) {
    throw new Error("No previous version available to restore.");
  }

  const now = new Date().toISOString();
  const restored: WishMusicVisualContent = {
    ...current.previous,
    id: DOC_ID,
    version: (current.draft.version || 1) + 1,
    updatedAt: now,
    updatedBy: performedBy,
  };

  const payload: WishMusicVisualContentDoc = {
    id: DOC_ID,
    draft: restored,
    published: restored,
    previous: current.published,
    updatedAt: now,
    publishedAt: now,
  };

  await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload);
  return { success: true, restored };
}

/**
 * Defensive merge helper: guarantees all keys, features, screenshots, and visibility flags exist.
 */
function mergeWithDefaults(incoming: Partial<WishMusicVisualContent>): WishMusicVisualContent {
  return {
    id: DOC_ID,
    version: incoming.version || 1,
    updatedAt: incoming.updatedAt || new Date().toISOString(),
    updatedBy: incoming.updatedBy || "admin",
    visibility: {
      ...DEFAULT_WISHMUSIC_VISUALS.visibility,
      ...(incoming.visibility || {}),
    },
    hero: {
      ...DEFAULT_WISHMUSIC_VISUALS.hero,
      ...(incoming.hero || {}),
    },
    screenshots: incoming.screenshots && incoming.screenshots.length > 0
      ? incoming.screenshots
      : DEFAULT_WISHMUSIC_VISUALS.screenshots,
    features: incoming.features && incoming.features.length > 0
      ? DEFAULT_WISHMUSIC_VISUALS.features.map((defFeat) => {
          const match = incoming.features?.find((f) => f.key === defFeat.key || f.id === defFeat.id);
          return match ? { ...defFeat, ...match } : defFeat;
        })
      : DEFAULT_WISHMUSIC_VISUALS.features,
    about: {
      ...DEFAULT_WISHMUSIC_VISUALS.about,
      ...(incoming.about || {}),
    },
    gallery: incoming.gallery && incoming.gallery.length > 0
      ? incoming.gallery
      : DEFAULT_WISHMUSIC_VISUALS.gallery,
  };
}
