import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { VideoEditingContentDocument } from "@/types/video-editing";
import { defaultVideoEditingContent } from "@/data/videoEditingData";

const FIRESTORE_COLLECTION = "siteContent";
const FIRESTORE_DOC_ID = "videoEditing";

/**
 * Retrieves the published Video Editing service content from Firestore,
 * gracefully falling back to default structured data if uninitialized or offline.
 */
export async function getVideoEditingContent(): Promise<VideoEditingContentDocument> {
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<VideoEditingContentDocument>;
        
        return {
          id: "video-editing",
          hero: {
            ...defaultVideoEditingContent.hero,
            ...(remoteData.hero || {}),
          },
          watermark: {
            ...defaultVideoEditingContent.watermark,
            ...(remoteData.watermark || {}),
          },
          categories: remoteData.categories || defaultVideoEditingContent.categories,
          samples: remoteData.samples && remoteData.samples.length > 0
            ? remoteData.samples
            : defaultVideoEditingContent.samples,
          pricing: remoteData.pricing && remoteData.pricing.length > 0
            ? remoteData.pricing
            : defaultVideoEditingContent.pricing,
          about: {
            ...defaultVideoEditingContent.about,
            ...(remoteData.about || {}),
          },
          editors: remoteData.editors && remoteData.editors.length > 0
            ? remoteData.editors
            : defaultVideoEditingContent.editors,
          updatedAt: remoteData.updatedAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("Firestore fetch for videoEditing fallback:", err);
    }
  }

  // Fallback to static structured data
  return defaultVideoEditingContent;
}

/**
 * Saves/updates Video Editing content in Cloud Firestore.
 * Used for future Admin Panel CMS integration.
 */
export async function saveVideoEditingContent(
  content: VideoEditingContentDocument
): Promise<{ success: boolean; error?: string }> {
  if (!db || !isFirebaseConfigured) {
    return { success: false, error: "Firebase is not configured in this environment." };
  }

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    await setDoc(
      docRef,
      {
        ...content,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save video editing content";
    return { success: false, error: message };
  }
}
