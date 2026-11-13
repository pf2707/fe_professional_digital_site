// ─────────────────────────────────────────────────────────────────────────────
//  The CV being edited in /scene/admin. Each account has one CV. The editor keeps a
//  working copy in this browser as you type (the preview pane and the publish
//  page read it back); Save stores it in the database through /api/drafts,
//  signed with the user's Firebase ID token.
// ─────────────────────────────────────────────────────────────────────────────

import blankKnowledge from "@/data/templates/twin-knowledge.json";
import blankProfile from "@/data/templates/profile.json";
import type { User } from "firebase/auth";
import type { CvContent, Profile, TwinKnowledge } from "./profile";

// One working copy per account, so two people sharing a browser don't see each other's CV.
export const draftKey = (uid: string) => `cv-draft:${uid}`;

export const blankCv = (): CvContent =>
  structuredClone({
    profile: blankProfile as Profile,
    knowledge: blankKnowledge as TwinKnowledge,
  });

export function loadDraft(uid: string): CvContent | null {
  try {
    const raw = localStorage.getItem(draftKey(uid));
    return raw ? (JSON.parse(raw) as CvContent) : null;
  } catch {
    return null;
  }
}

export function saveDraft(uid: string, content: CvContent) {
  try {
    localStorage.setItem(draftKey(uid), JSON.stringify(content));
    return true;
  } catch {
    return false; // storage full (a very large photo) or blocked
  }
}

export type SavedCv = CvContent & { slug?: string };

async function api(user: User, init?: RequestInit) {
  return fetch("/api/drafts", {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
  });
}

// The account's saved CV, or null before its first save.
export async function loadFromCloud(user: User): Promise<SavedCv | null> {
  const res = await api(user);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Couldn't load your saved CV. Reload the page to try again.");
  return res.json();
}

// Saves to the database. Says what happened to the account's published CV, if it has one.
export async function saveToCloud(user: User, content: CvContent): Promise<{ cv: "updated" | "live" | null; slug: string | null }> {
  const res = await api(user, { method: "PUT", body: JSON.stringify({ profile: content.profile, knowledge: content.knowledge }) });
  if (!res.ok) throw new Error((await res.text()) || "Couldn't save. Check your connection and try again.");
  return res.json();
}

// Drop blank lines and items left over from editing.
export function cleanCv(c: CvContent): CvContent {
  const n = structuredClone(c);
  const nonEmpty = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);
  n.profile.about = nonEmpty(n.profile.about);
  n.profile.studio.terminal = n.profile.studio.terminal.filter((s) => s.trim());
  n.profile.studio.neon = nonEmpty(n.profile.studio.neon.split("\n")).join("\n");
  n.profile.phone = (n.profile.phone ?? "").trim();
  n.profile.twin.suggestions = nonEmpty(n.profile.twin.suggestions);
  n.profile.skills = n.profile.skills.map((g) => ({ ...g, items: nonEmpty(g.items) }));
  n.profile.certificates = n.profile.certificates.map((cert) => {
    const out = { ...cert };
    if (!out.note?.trim()) delete out.note;
    if (!out.badge?.trim()) delete out.badge;
    return out;
  });
  return n;
}
