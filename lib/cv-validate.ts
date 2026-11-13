// Shape check for a CV before it's published, so a bad submission can't leave
// its page unable to render. Runs in the editor (instant feedback) and again
// in the publish API (the check that counts).

import type { CvContent, Profile, TwinKnowledge } from "./profile";

// Firestore documents max out at 1 MiB; leave room for the bookkeeping fields.
export const MAX_CV_BYTES = 900_000;

const SECTIONS = ["work", "stack", "certs", "career", "archive", "about", "twin"] as const;

// A saved draft can be unfinished; it only has to be a CV-shaped object that fits.
export function draftProblem(content: unknown): string | null {
  const c = content as Partial<CvContent> | null;
  if (!c || typeof c.profile !== "object" || typeof c.knowledge !== "object") return "A draft needs a profile and twin knowledge.";
  if (new TextEncoder().encode(JSON.stringify({ profile: c.profile, knowledge: c.knowledge })).length > MAX_CV_BYTES)
    return "This CV is too large to save. Shorten the twin's sources or use a smaller photo.";
  return null;
}

export function validateCv(content: unknown): string | null {
  const c = content as Partial<CvContent> | null;
  const p = c?.profile as Partial<Profile> | undefined;
  const k = c?.knowledge as Partial<TwinKnowledge> | undefined;
  if (!p || !k) return "Both the profile and the twin knowledge are required.";
  if (!p.name?.trim()) return "Add your name in Basics.";
  if (!p.email?.trim()) return "Add an email address in Basics.";
  const arrays = ["stats", "about", "experience", "skills", "certificates", "projectGroups", "projects", "socials"] as const;
  for (const key of arrays) if (!Array.isArray(p[key])) return `"${key}" must be a list.`;
  if (!p.studio?.sections || !Array.isArray(p.studio.terminal) || !Array.isArray(p.studio.drawers))
    return "The studio settings are incomplete.";
  for (const id of SECTIONS) if (!p.studio.sections[id]) return `Studio section "${id}" is missing.`;
  if (!p.twin || !Array.isArray(p.twin.suggestions)) return "The twin greeting and suggestions are missing.";
  if (!Array.isArray(k.sources)) return "Twin knowledge sources must be a list.";
  const keys = new Set(p.projectGroups!.map((g) => g.key));
  const orphan = p.projects!.find((pr) => !keys.has(pr.category));
  if (orphan) return `Project "${orphan.name}" is in group "${orphan.category}", which doesn't exist.`;
  if (new TextEncoder().encode(JSON.stringify(c)).length > MAX_CV_BYTES)
    return "This CV is too large to publish. Shorten the twin's sources or use a smaller photo.";
  return null;
}
