// ─────────────────────────────────────────────────────────────────────────────
//  Rules for a CV's public path (localhost:3000/scene/<slug>). Shared by the publish
//  page (instant feedback) and the API (the check that counts).
// ─────────────────────────────────────────────────────────────────────────────

// Paths the site itself uses, or might use later, under /scene or at the
// root. A CV can't take these.
const RESERVED = new Set([
  "admin", "owner", "api", "scene", "cv", "publish", "login", "logout", "signup", "register",
  "account", "settings", "dashboard", "about", "contact", "pricing", "terms",
  "privacy", "help", "support", "blog", "docs", "static", "assets", "uploads",
  "images", "new", "edit", "preview", "app", "www", "mail", "home", "index",
  "robots", "sitemap", "favicon", "icon",
]);

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
export function slugProblem(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Use at least ${SLUG_MIN} characters.`;
  if (slug.length > SLUG_MAX) return `Use at most ${SLUG_MAX} characters.`;
  if (!/^[a-z0-9-]+$/.test(slug)) return "Use only lowercase letters, numbers and dashes.";
  if (slug.startsWith("-") || slug.endsWith("-")) return "Start and end with a letter or number.";
  if (slug.includes("--")) return "Don't put two dashes in a row.";
  if (RESERVED.has(slug)) return "That path is reserved by the site. Try another.";
  return null;
}
