// Shape check for a CV before it's published, so a bad submission can't leave
// its page unable to render. Runs in the editor (instant feedback) and again
// in the publish API (the check that counts).

import { en, type Dict } from "./i18n/en";
import type { CvContent, Profile, TwinKnowledge } from "./profile";

// Firestore documents max out at 1 MiB; leave room for the bookkeeping fields.
export const MAX_CV_BYTES = 900_000;

const SECTIONS = ["work", "stack", "certs", "career", "archive", "about", "twin"] as const;

// A saved draft can be unfinished; it only has to be a CV-shaped object that fits.
// `e` is the messages in the visitor's language.
export function draftProblem(content: unknown, e: Dict["errors"] = en.errors): string | null {
  const c = content as Partial<CvContent> | null;
  if (!c || typeof c.profile !== "object" || typeof c.knowledge !== "object") return e.draftShape;
  if (new TextEncoder().encode(JSON.stringify({ profile: c.profile, knowledge: c.knowledge })).length > MAX_CV_BYTES)
    return e.draftTooBig;
  return null;
}

export function validateCv(content: unknown, e: Dict["errors"] = en.errors): string | null {
  const c = content as Partial<CvContent> | null;
  const p = c?.profile as Partial<Profile> | undefined;
  const k = c?.knowledge as Partial<TwinKnowledge> | undefined;
  if (!p || !k) return e.bothRequired;
  if (!p.name?.trim()) return e.needName;
  if (!p.email?.trim()) return e.needEmail;
  const arrays = ["stats", "about", "experience", "skills", "certificates", "projectGroups", "projects", "socials"] as const;
  for (const key of arrays) if (!Array.isArray(p[key])) return e.mustBeList(key);
  if (!p.studio?.sections || !Array.isArray(p.studio.terminal) || !Array.isArray(p.studio.drawers))
    return e.studioIncomplete;
  for (const id of SECTIONS) if (!p.studio.sections[id]) return e.sectionMissing(id);
  if (!p.twin || !Array.isArray(p.twin.suggestions)) return e.twinMissing;
  if (!Array.isArray(k.sources)) return e.sourcesList;
  const keys = new Set(p.projectGroups!.map((g) => g.key));
  const orphan = p.projects!.find((pr) => !keys.has(pr.category));
  if (orphan) return e.orphan(orphan.name, orphan.category);
  if (new TextEncoder().encode(JSON.stringify(c)).length > MAX_CV_BYTES)
    return e.tooBigPublish;
  return null;
}
