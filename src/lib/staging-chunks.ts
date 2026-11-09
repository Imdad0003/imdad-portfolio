import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";
import {
  firestoreRestPatch,
  firestoreRestGet,
  firestoreRestList,
  firestoreRestDelete,
} from "./firestore-rest";

export interface StagingSession {
  sessionId: string;
  appId: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  adminEmail: string;
  createdAt: number;
  expiresAt: number;
  status: string;
}

export interface StagingChunk {
  index: number;
  data: string; // base64
  size: number;
  receivedAt: number;
}

// In-memory fallback store for local testing or transient fallbacks
const memorySessions = new Map<string, StagingSession>();
const memoryChunks = new Map<string, Map<number, StagingChunk>>();

export async function saveStagingSession(
  session: StagingSession,
  idToken?: string
): Promise<void> {
  memorySessions.set(session.sessionId, session);

  // 1. Try authenticated Firestore REST API
  if (idToken) {
    const ok = await firestoreRestPatch(
      `stagingReleaseSessions/${session.sessionId}`,
      session as unknown as Record<string, unknown>,
      idToken
    );
    if (ok) return;
  }

  // 2. Try Firestore Client SDK
  if (db) {
    try {
      await setDoc(doc(db, "stagingReleaseSessions", session.sessionId), session);
      return;
    } catch (err) {
      console.warn("Notice: Firestore session write fallback to memory:", err);
    }
  }
}

export async function getStagingSession(
  sessionId: string,
  idToken?: string
): Promise<StagingSession | null> {
  // 1. Try in-memory
  const mem = memorySessions.get(sessionId);
  if (mem) return mem;

  // 2. Try authenticated Firestore REST API
  if (idToken) {
    const res = await firestoreRestGet<StagingSession>(
      `stagingReleaseSessions/${sessionId}`,
      idToken
    );
    if (res && res.sessionId) {
      memorySessions.set(sessionId, res);
      return res;
    }
  }

  // 3. Try Firestore Client SDK (now allowed by rules: allow read: if isAdmin() || true)
  if (db) {
    try {
      const snap = await getDoc(doc(db, "stagingReleaseSessions", sessionId));
      if (snap.exists()) {
        const data = snap.data() as StagingSession;
        memorySessions.set(sessionId, data);
        return data;
      }
    } catch (err) {
      console.warn("Notice: Firestore session read fallback:", err);
    }
  }

  return null;
}

export async function saveStagingChunk(
  sessionId: string,
  chunk: StagingChunk,
  idToken?: string
): Promise<void> {
  let chunksMap = memoryChunks.get(sessionId);
  if (!chunksMap) {
    chunksMap = new Map();
    memoryChunks.set(sessionId, chunksMap);
  }
  chunksMap.set(chunk.index, chunk);

  // 1. Try authenticated Firestore REST API
  if (idToken) {
    const ok = await firestoreRestPatch(
      `stagingReleaseSessions/${sessionId}/chunks/${chunk.index}`,
      chunk as unknown as Record<string, unknown>,
      idToken
    );
    if (ok) return;
  }

  // 2. Try Firestore Client SDK
  if (db) {
    try {
      await setDoc(
        doc(db, "stagingReleaseSessions", sessionId, "chunks", String(chunk.index)),
        chunk
      );
      return;
    } catch (err) {
      console.warn("Notice: Firestore chunk write fallback to memory:", err);
    }
  }
}

export async function getStagingChunks(
  sessionId: string,
  idToken?: string
): Promise<StagingChunk[]> {
  // 1. Try authenticated Firestore REST API (single HTTP request fetches all chunks!)
  if (idToken) {
    const docs = await firestoreRestList<StagingChunk>(
      `stagingReleaseSessions/${sessionId}/chunks`,
      idToken,
      300
    );
    if (docs && docs.length > 0) {
      docs.sort((a, b) => a.index - b.index);
      return docs;
    }
  }

  // 2. Try Firestore Client SDK (allowed by rules: allow read: if isAdmin() || true)
  if (db) {
    try {
      const snap = await getDocs(
        collection(db, "stagingReleaseSessions", sessionId, "chunks")
      );
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as StagingChunk);
        list.sort((a, b) => a.index - b.index);
        return list;
      }
    } catch (err) {
      console.warn("Notice: Firestore chunks read fallback to memory:", err);
    }
  }

  // 3. Fallback to in-memory store
  const mem = memoryChunks.get(sessionId);
  if (mem) {
    return Array.from(mem.values()).sort((a, b) => a.index - b.index);
  }

  return [];
}

export async function deleteStagingSession(
  sessionId: string,
  idToken?: string
): Promise<void> {
  memorySessions.delete(sessionId);
  memoryChunks.delete(sessionId);

  // 1. Try authenticated Firestore REST API
  if (idToken) {
    const chunks = await firestoreRestList<{ index: number }>(
      `stagingReleaseSessions/${sessionId}/chunks`,
      idToken,
      300
    );
    await Promise.all(
      chunks.map((c) =>
        firestoreRestDelete(
          `stagingReleaseSessions/${sessionId}/chunks/${c.index}`,
          idToken
        )
      )
    );
    await firestoreRestDelete(`stagingReleaseSessions/${sessionId}`, idToken);
  }

  // 2. Also try Firestore Client SDK
  if (db) {
    try {
      const snap = await getDocs(
        collection(db, "stagingReleaseSessions", sessionId, "chunks")
      );
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "stagingReleaseSessions", sessionId));
    } catch (err) {
      console.warn("Notice: Firestore session cleanup notice:", err);
    }
  }
}
