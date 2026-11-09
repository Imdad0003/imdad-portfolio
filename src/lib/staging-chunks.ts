import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";

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

export async function saveStagingSession(session: StagingSession): Promise<void> {
  memorySessions.set(session.sessionId, session);
  if (db) {
    try {
      await setDoc(doc(db, "stagingReleaseSessions", session.sessionId), session);
    } catch (err) {
      console.warn("Notice: Firestore session write fallback to memory:", err);
    }
  }
}

export async function getStagingSession(sessionId: string): Promise<StagingSession | null> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, "stagingReleaseSessions", sessionId));
      if (snap.exists()) return snap.data() as StagingSession;
    } catch (err) {
      console.warn("Notice: Firestore session read fallback to memory:", err);
    }
  }
  return memorySessions.get(sessionId) || null;
}

export async function saveStagingChunk(sessionId: string, chunk: StagingChunk): Promise<void> {
  let chunksMap = memoryChunks.get(sessionId);
  if (!chunksMap) {
    chunksMap = new Map();
    memoryChunks.set(sessionId, chunksMap);
  }
  chunksMap.set(chunk.index, chunk);

  if (db) {
    try {
      await setDoc(doc(db, "stagingReleaseSessions", sessionId, "chunks", String(chunk.index)), chunk);
    } catch (err) {
      console.warn("Notice: Firestore chunk write fallback to memory:", err);
    }
  }
}

export async function getStagingChunks(sessionId: string): Promise<StagingChunk[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, "stagingReleaseSessions", sessionId, "chunks"));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StagingChunk);
      }
    } catch (err) {
      console.warn("Notice: Firestore chunks read fallback to memory:", err);
    }
  }
  const mem = memoryChunks.get(sessionId);
  if (mem) {
    return Array.from(mem.values());
  }
  return [];
}

export async function deleteStagingSession(sessionId: string): Promise<void> {
  memorySessions.delete(sessionId);
  memoryChunks.delete(sessionId);
  if (db) {
    try {
      const snap = await getDocs(collection(db, "stagingReleaseSessions", sessionId, "chunks"));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "stagingReleaseSessions", sessionId));
    } catch (err) {
      console.warn("Notice: Firestore session cleanup notice:", err);
    }
  }
}
