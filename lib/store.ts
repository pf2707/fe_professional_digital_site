// ─────────────────────────────────────────────────────────────────────────────
//  A tiny document store: Firestore when FIREBASE_ADMIN_CREDENTIALS is set
//  (the service-account JSON from Firebase console → Project settings →
//  Service accounts), otherwise JSON files in .data/<collection>/ for local
//  development. Server-only: browsers never touch the database directly.
//  The same credentials verify signed-in users (lib/auth-server.ts).
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export type Collection = "cvs" | "drafts";
type Data = Record<string, unknown>;

function credentials(): ServiceAccount | null {
  const raw = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS isn't valid JSON. Put the whole service-account file on one line, in single quotes.");
  }
}

const usingFirestore = () => !!process.env.FIREBASE_ADMIN_CREDENTIALS;

// The Firebase Admin app, or null when the credentials aren't set.
export function adminApp() {
  if (!usingFirestore()) return null;
  return getApps()[0] ?? initializeApp({ credential: cert(credentials()!) });
}

function db() {
  if (!usingFirestore() && process.env.NODE_ENV === "production") {
    throw new Error("Firestore isn't configured: set FIREBASE_ADMIN_CREDENTIALS.");
  }
  const app = adminApp();
  return app ? getFirestore(app) : null;
}

// Firestore timestamps come back as ISO strings, like the local store's.
function plain(d: Data): Data {
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v instanceof Timestamp ? v.toDate().toISOString() : v]));
}

const LOCAL_DIR = path.join(process.cwd(), ".data");
const localFile = (col: Collection, id: string) => path.join(LOCAL_DIR, col, `${id}.json`);

export async function getDoc<T>(col: Collection, id: string): Promise<T | null> {
  const fs = db();
  if (fs) {
    const snap = await fs.collection(col).doc(id).get();
    return snap.exists ? (plain(snap.data()!) as T) : null;
  }
  try {
    return JSON.parse(await readFile(localFile(col, id), "utf8")) as T;
  } catch {
    return null;
  }
}

// Every document whose `field` equals `value`, with its ID.
export async function findDocs<T>(col: Collection, field: string, value: string): Promise<(T & { id: string })[]> {
  const fs = db();
  if (fs) {
    const snap = await fs.collection(col).where(field, "==", value).get();
    return snap.docs.map((d) => ({ ...(plain(d.data()) as T), id: d.id }));
  }
  let files: string[];
  try {
    files = (await readdir(path.join(LOCAL_DIR, col))).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const docs = await Promise.all(files.map(async (f): Promise<Data> => ({ ...(await getDoc<Data>(col, f.slice(0, -5))), id: f.slice(0, -5) })));
  return docs.filter((d) => d[field] === value) as (T & { id: string })[];
}

// Creates the document, or returns false if the ID is already taken — even
// by a request that arrived a moment earlier.
export async function createDoc(col: Collection, id: string, data: Data): Promise<boolean> {
  const now = new Date().toISOString();
  const doc = { ...data, createdAt: now, updatedAt: now };
  const fs = db();
  if (fs) {
    try {
      await fs.collection(col).doc(id).create(doc);
      return true;
    } catch (err) {
      if ((err as { code?: number }).code === 6) return false; // gRPC ALREADY_EXISTS
      throw err;
    }
  }
  await mkdir(path.dirname(localFile(col, id)), { recursive: true });
  try {
    await writeFile(localFile(col, id), JSON.stringify(doc, null, 2) + "\n", { flag: "wx" });
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw err;
  }
}

// Creates the document or replaces the given top-level fields of it.
export async function setDoc(col: Collection, id: string, data: Data) {
  const now = new Date().toISOString();
  const fs = db();
  if (fs) {
    const ref = fs.collection(col).doc(id);
    await fs.runTransaction(async (tx) => {
      const exists = (await tx.get(ref)).exists;
      tx.set(ref, { ...data, updatedAt: now, ...(exists ? {} : { createdAt: now }) }, { merge: true });
    });
    return;
  }
  const current = await getDoc<Data>(col, id);
  await mkdir(path.dirname(localFile(col, id)), { recursive: true });
  await writeFile(localFile(col, id), JSON.stringify({ createdAt: now, ...current, ...data, updatedAt: now }, null, 2) + "\n");
}

// Replaces the given top-level fields of an existing document.
export async function updateDoc(col: Collection, id: string, data: Data) {
  const doc = { ...data, updatedAt: new Date().toISOString() };
  const fs = db();
  if (fs) return void (await fs.collection(col).doc(id).update(doc));
  const current = await getDoc<Data>(col, id);
  if (!current) throw new Error(`${col}/${id} doesn't exist.`);
  await writeFile(localFile(col, id), JSON.stringify({ ...current, ...doc }, null, 2) + "\n");
}
