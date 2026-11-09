import { firebaseConfig } from "./firebase";

/**
 * Cloud Firestore REST API Client
 *
 * Provides authenticated, direct HTTP access to Cloud Firestore using
 * the administrator's Firebase Auth ID token (Bearer token).
 *
 * This bypasses Node.js client SDK authentication limitations in serverless environments,
 * enabling authenticated read/write/list operations directly evaluated against firestore.rules
 * with the administrator's verified identity (request.auth).
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function fromFirestoreValue(fieldVal: Record<string, unknown>): unknown {
  if (!fieldVal || typeof fieldVal !== "object") return null;
  if ("stringValue" in fieldVal) return fieldVal.stringValue;
  if ("integerValue" in fieldVal) return parseInt(fieldVal.integerValue as string, 10);
  if ("doubleValue" in fieldVal) return fieldVal.doubleValue;
  if ("booleanValue" in fieldVal) return fieldVal.booleanValue;
  if ("nullValue" in fieldVal) return null;
  if ("mapValue" in fieldVal) {
    const fields = (fieldVal.mapValue as { fields?: Record<string, unknown> })?.fields || {};
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = fromFirestoreValue(v as Record<string, unknown>);
    }
    return res;
  }
  if ("arrayValue" in fieldVal) {
    const vals = (fieldVal.arrayValue as { values?: Array<Record<string, unknown>> })?.values || [];
    return vals.map(fromFirestoreValue);
  }
  return null;
}

/**
 * Writes or updates a Firestore document via REST API.
 */
export async function firestoreRestPatch(
  documentPath: string,
  data: Record<string, unknown>,
  idToken?: string
): Promise<boolean> {
  try {
    const cleanPath = documentPath.replace(/^\//, "");
    const url = `${BASE_URL}/${cleanPath}`;
    const fields = Object.fromEntries(
      Object.entries(data)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, toFirestoreValue(v)])
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`firestoreRestPatch [${cleanPath}] HTTP ${res.status}:`, errText);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("firestoreRestPatch error:", err);
    return false;
  }
}

/**
 * Retrieves a Firestore document via REST API.
 */
export async function firestoreRestGet<T = Record<string, unknown>>(
  documentPath: string,
  idToken?: string
): Promise<T | null> {
  try {
    const cleanPath = documentPath.replace(/^\//, "");
    const url = `${BASE_URL}/${cleanPath}`;
    const headers: Record<string, string> = {};
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.fields) return null;

    const parsed = Object.fromEntries(
      Object.entries(json.fields).map(([k, v]) => [
        k,
        fromFirestoreValue(v as Record<string, unknown>),
      ])
    );

    return parsed as T;
  } catch (err) {
    console.warn("firestoreRestGet error:", err);
    return null;
  }
}

/**
 * Lists documents in a collection via REST API.
 */
export async function firestoreRestList<T = Record<string, unknown>>(
  collectionPath: string,
  idToken?: string,
  pageSize = 300
): Promise<T[]> {
  try {
    const cleanPath = collectionPath.replace(/^\//, "");
    const url = `${BASE_URL}/${cleanPath}?pageSize=${pageSize}`;
    const headers: Record<string, string> = {};
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) return [];

    const json = await res.json();
    if (!json.documents || !Array.isArray(json.documents)) return [];

    const docs = json.documents.map((d: { fields?: Record<string, unknown> }) => {
      if (!d.fields) return {};
      return Object.fromEntries(
        Object.entries(d.fields).map(([k, v]) => [
          k,
          fromFirestoreValue(v as Record<string, unknown>),
        ])
      );
    });

    return docs as T[];
  } catch (err) {
    console.warn("firestoreRestList error:", err);
    return [];
  }
}

/**
 * Deletes a document via REST API.
 */
export async function firestoreRestDelete(
  documentPath: string,
  idToken?: string
): Promise<boolean> {
  try {
    const cleanPath = documentPath.replace(/^\//, "");
    const url = `${BASE_URL}/${cleanPath}`;
    const headers: Record<string, string> = {};
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const res = await fetch(url, { method: "DELETE", headers });
    return res.ok;
  } catch (err) {
    console.warn("firestoreRestDelete error:", err);
    return false;
  }
}
