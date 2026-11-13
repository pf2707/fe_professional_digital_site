// ─────────────────────────────────────────────────────────────────────────────
//  Published CVs: collection `cvs`, one document per CV, document ID = the
//  CV's public path (slug). The document ID is what makes a path unique.
//  New CVs are `status: "pending"`; the owner approves one by changing it to
//  "approved" at /owner (or in the Firebase console), and only then does
//  /scene/<slug> show it.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import type { SignedInUser } from "./auth-server";
import type { CvContent } from "./profile";
import { createDoc, findDocs, getDoc, updateDoc } from "./store";

export type CvStatus = "pending" | "approved";

export type CvRecord = CvContent & {
  slug: string;
  status: CvStatus | string; // anything other than "approved" is not live
  ownerUid: string; // the account that published it (its draft is drafts/<ownerUid>)
  ownerEmail: string;
  // Set by the site owner at /owner; when present it decides whether the twin
  // is on, whatever the customer's own switch says. Customer saves never touch it.
  twinEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getCv = (slug: string) => getDoc<CvRecord>("cvs", slug);

export const isSlugTaken = async (slug: string) => (await getCv(slug)) !== null;

// Reserves the slug and stores the CV as pending. Returns false if the slug
// was taken.
export const createCv = (slug: string, content: CvContent, owner: SignedInUser) =>
  createDoc("cvs", slug, { slug, status: "pending", ...content, ownerUid: owner.uid, ownerEmail: owner.email });

// Saving the editor updates its CV too, but only while the CV waits for
// approval: once it's live, the site owner has to approve changes.
export async function updatePendingCv(slug: string, content: CvContent, owner: SignedInUser) {
  const cv = await getCv(slug);
  if (cv?.status !== "pending" || cv.ownerUid !== owner.uid) return false;
  await updateDoc("cvs", slug, { ...content });
  return true;
}

// CVs waiting for approval, oldest first.
export async function listPendingCvs() {
  const cvs = await findDocs<CvRecord>("cvs", "status", "pending");
  return cvs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// Puts a pending CV live. Returns false if there's no such pending CV.
export async function approveCv(slug: string) {
  const cv = await getCv(slug);
  if (cv?.status !== "pending") return false;
  await updateDoc("cvs", slug, { status: "approved", approvedAt: new Date().toISOString() });
  return true;
}

// The profile as visitors get it: the owner's twin setting, if any, wins.
export function liveProfile(cv: CvRecord) {
  if (cv.twinEnabled === undefined) return cv.profile;
  return { ...cv.profile, twin: { ...cv.profile.twin, enabled: cv.twinEnabled } };
}

// The site owner turns a CV's digital twin on or off.
export async function setCvTwin(slug: string, enabled: boolean) {
  if (!(await getCv(slug))) return false;
  await updateDoc("cvs", slug, { twinEnabled: enabled });
  return true;
}
