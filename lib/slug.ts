// ─────────────────────────────────────────────────────────────────────────────
//  Rules for a CV's public path (localhost:3000/scene/<slug>). Shared by the publish
//  page (instant feedback) and the API (the check that counts).
// ─────────────────────────────────────────────────────────────────────────────

import { en, type Dict } from "./i18n/en";

// Paths the site itself uses, or might use later, under /scene or at the
// root. A CV can't take these.
const RESERVED = new Set([
  "admin", "owner", "api", "scene", "cv", "publish", "login", "logout", "signup", "register",
  "account", "settings", "dashboard", "about", "contact", "pricing", "terms",
  "privacy", "help", "support", "blog", "docs", "static", "assets", "uploads",
  "images", "new", "edit", "preview", "app", "www", "mail", "home", "index",
  "robots", "sitemap", "favicon", "icon", "thaitran",
]);

// The site owner's own CV (data/profile.json), built in rather than published:
// /scene/thaitran is the link to hand an interviewer.
export const OWNER_SLUG = "thaitran";

// Where a CV lives.
export const cvPath = (slug: string) => `/scene/${slug}`;

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;

// "Thái Trần " → "thai-tran"
export function toSlug(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
}

// Returns why a slug can't be used, or null if its shape is fine. Whether it's
// already taken is a separate check against the database.
// `e` is the messages in the visitor's language.
export function slugProblem(slug: string, e: Dict["errors"] = en.errors): string | null {
  if (slug.length < SLUG_MIN) return e.slugShort(SLUG_MIN);
  if (slug.length > SLUG_MAX) return e.slugLong(SLUG_MAX);
  if (!/^[a-z0-9-]+$/.test(slug)) return e.slugChars;
  if (slug.startsWith("-") || slug.endsWith("-")) return e.slugEnds;
  if (slug.includes("--")) return e.slugDashes;
  if (RESERVED.has(slug)) return e.slugReserved;
  return null;
}
