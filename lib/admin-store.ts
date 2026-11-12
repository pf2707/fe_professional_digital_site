// ─────────────────────────────────────────────────────────────────────────────
//  Reads and writes the site's content files for /admin.
//  Content lives in the repo (data/*.json), so editing only works while running
//  `npm run dev` locally — commit and deploy to publish. In production the files
//  are read-only and the admin API refuses writes.
//  TODO(auth): there is no login yet; add one before allowing writes anywhere
//  other than a local dev server.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Profile } from "./profile";
import type { TwinKnowledge } from "./twin";

const DATA_DIR = path.join(process.cwd(), "data");
export const FILES = {
  profile: path.join(DATA_DIR, "profile.json"),
  knowledge: path.join(DATA_DIR, "twin-knowledge.json"),
  profileTemplate: path.join(DATA_DIR, "templates", "profile.json"),
  knowledgeTemplate: path.join(DATA_DIR, "templates", "twin-knowledge.json"),
};

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const canEdit = () => process.env.NODE_ENV === "development";

export type Content = { profile: Profile; knowledge: TwinKnowledge };

const readJson = async <T,>(file: string) => JSON.parse(await readFile(file, "utf8")) as T;

export async function readContent(which: "current" | "template" = "current"): Promise<Content> {
  const t = which === "template";
  return {
    profile: await readJson<Profile>(t ? FILES.profileTemplate : FILES.profile),
    knowledge: await readJson<TwinKnowledge>(t ? FILES.knowledgeTemplate : FILES.knowledge),
  };
}

export async function writeContent({ profile, knowledge }: Content) {
  await writeFile(FILES.profile, JSON.stringify(profile, null, 2) + "\n");
  await writeFile(FILES.knowledge, JSON.stringify(knowledge, null, 2) + "\n");
}

// Light shape check so a bad save can't leave the site unable to render.
export function validate(content: unknown): string | null {
  const c = content as Partial<Content> | null;
  const p = c?.profile as Partial<Profile> | undefined;
  const k = c?.knowledge as Partial<TwinKnowledge> | undefined;
  if (!p || !k) return "Both the profile and the twin knowledge are required.";
  if (!p.name?.trim()) return "Name can't be empty.";
  const arrays = ["stats", "about", "experience", "skills", "certificates", "projectGroups", "projects", "socials"] as const;
  for (const key of arrays) if (!Array.isArray(p[key])) return `"${key}" must be a list.`;
  if (!p.studio?.sections || !Array.isArray(p.studio.terminal) || !Array.isArray(p.studio.drawers))
    return "The studio settings are incomplete.";
  for (const id of ["work", "stack", "certs", "career", "archive", "about", "twin"] as const)
    if (!p.studio.sections[id]) return `Studio section "${id}" is missing.`;
  if (!p.twin || !Array.isArray(p.twin.suggestions)) return "The twin greeting and suggestions are missing.";
  if (!Array.isArray(k.sources)) return "Twin knowledge sources must be a list.";
  const keys = new Set(p.projectGroups!.map((g) => g.key));
  const orphan = p.projects!.find((pr) => !keys.has(pr.category));
  if (orphan) return `Project "${orphan.name}" is in group "${orphan.category}", which doesn't exist.`;
  return null;
}
