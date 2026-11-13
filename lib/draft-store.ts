// ─────────────────────────────────────────────────────────────────────────────
//  Saved editor drafts: collection `drafts`, one per account, document ID =
//  the user's Firebase Auth uid. Only the signed-in owner can read or save it
//  (the API checks the caller's ID token).
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import type { SignedInUser } from "./auth-server";
import type { CvContent } from "./profile";
import { getDoc, setDoc } from "./store";

export type DraftRecord = CvContent & {
  ownerEmail: string;
  slug?: string; // set once the draft is published
  createdAt: string;
  updatedAt: string;
};

export const getDraft = (user: SignedInUser) => getDoc<DraftRecord>("drafts", user.uid);

export const saveDraft = (user: SignedInUser, { profile, knowledge }: CvContent) =>
  setDoc("drafts", user.uid, { profile, knowledge, ownerEmail: user.email });

export const linkDraftToCv = (user: SignedInUser, slug: string) => setDoc("drafts", user.uid, { slug });
