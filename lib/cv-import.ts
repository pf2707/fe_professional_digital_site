// ─────────────────────────────────────────────────────────────────────────────
//  Fill in the editor from a CV PDF. The browser reads the PDF's text
//  (lib/pdf-text.ts); only that text goes to the twin's model, which answers
//  with the CV's fields as JSON. The answer is checked here field by field, so
//  only well-formed values reach the editor. Nothing is stored.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import type { Certificate, Experience, Profile, Project, SkillGroup, Social, Stat } from "./profile";

// What a CV can tell us. Projects have no group yet: the editor files them.
export type ImportedCv = {
  profile: Partial<
    Pick<Profile, "name" | "initials" | "title" | "subtitle" | "tagline" | "location" | "email" | "phone" | "languages"> & {
      stats: Stat[];
      about: string[];
      experience: Experience[];
      skills: SkillGroup[];
      certificates: Certificate[];
      projects: Omit<Project, "category">[];
      socials: Social[];
      suggestions: string[];
    }
  >;
  knowledge: { currentGoal?: string; summary?: string };
};

export const IMPORT_PROMPT = `
You read a person's CV (résumé) and turn it into JSON for their CV website.
Answer with one JSON object and nothing else. Use only what the CV says: never
invent details. Leave out any key the CV gives no information for. Keep the
CV's own language (don't translate).

{
  "name": "full name",
  "initials": "2 letters from the name",
  "title": "current or most recent job title",
  "subtitle": "a short headline, e.g. 'Mobile engineer in Berlin'",
  "tagline": "one sentence on what they do, for search engines",
  "location": "city, country",
  "email": "",
  "phone": "",
  "languages": "spoken languages, comma-separated",
  "stats": [{ "value": "10+", "label": "Years Experience" }],
  "about": ["2–3 short paragraphs introducing the person, in the first person"],
  "experience": [{ "period": "2022 — Present", "role": "", "org": "company", "summary": "what they did and achieved" }],
  "skills": [{ "group": "e.g. Languages, Frameworks, Tools", "items": ["skill"] }],
  "certificates": [{ "title": "", "issuer": "", "instructor": "", "date": "YYYY-MM-DD", "note": "" }],
  "projects": [{ "icon": "one emoji", "name": "", "description": "one or two sentences" }],
  "socials": [{ "title": "LinkedIn", "label": "in", "href": "https://..." }],
  "suggestions": ["3 short questions a recruiter might ask this person's AI twin"],
  "currentGoal": "the role they're looking for, if the CV says",
  "summary": "3–4 sentences introducing the person, in the third person"
}

Experience is newest first. Certificates are newest first; use "YYYY-MM-DD"
dates, with "-01" for an unknown month or day, or "" when there's no date.
Certificates are courses and certifications only, not degrees. At most 3 stats,
only from facts in the CV (years of experience, projects, team size…). A social's
"label" is 1–3 characters ("in", "gh", "@"); emails use "mailto:" links.
`.trim();

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max: number) => (Array.isArray(v) ? v.slice(0, max) : []);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The model's answer, keeping only what's well formed and not empty.
export function importedCv(raw: unknown): ImportedCv {
  const r = obj(raw);
  const profile: ImportedCv["profile"] = {};
  const text = ["name", "initials", "title", "subtitle", "tagline", "location", "email", "phone", "languages"] as const;
  for (const key of text) {
    const v = str(r[key], 300);
    if (v) profile[key] = key === "initials" ? v.slice(0, 3).toUpperCase() : v;
  }

  const strings = (v: unknown, max: number, len = 2000) => list(v, max).map((s) => str(s, len)).filter(Boolean);
  const keep = (key: keyof ImportedCv["profile"], items: unknown[]) => {
    if (items.length) (profile as Record<string, unknown>)[key] = items;
  };

  keep("stats", list(r.stats, 3).map((s) => ({ value: str(obj(s).value, 12), label: str(obj(s).label, 40) })).filter((s) => s.value && s.label));
  keep("about", strings(r.about, 5));
  keep(
    "experience",
    list(r.experience, 30)
      .map(obj)
      .map((e) => ({ period: str(e.period, 60), role: str(e.role, 200), org: str(e.org, 200), summary: str(e.summary) }))
      .filter((e) => e.role || e.org),
  );
  keep(
    "skills",
    list(r.skills, 20)
      .map(obj)
      .map((g) => ({ group: str(g.group, 80), items: strings(g.items, 40, 80) }))
      .filter((g) => g.group && g.items.length),
  );
  keep(
    "certificates",
    list(r.certificates, 40)
      .map(obj)
      .map((c) => {
        const cert: Certificate = { title: str(c.title, 200), issuer: str(c.issuer, 120), instructor: str(c.instructor, 120), date: str(c.date, 10) };
        if (!DATE.test(cert.date)) cert.date = "";
        const note = str(c.note, 500);
        if (note) cert.note = note;
        return cert;
      })
      .filter((c) => c.title),
  );
  keep(
    "projects",
    list(r.projects, 40)
      .map(obj)
      .map((p) => ({ icon: str(p.icon, 8) || "✨", name: str(p.name, 120), description: str(p.description) }))
      .filter((p) => p.name),
  );
  keep(
    "socials",
    list(r.socials, 10)
      .map(obj)
      .map((s) => ({ title: str(s.title, 40), label: str(s.label, 3), href: str(s.href, 500) }))
      .filter((s) => s.title && /^(https?:|mailto:)/i.test(s.href)),
  );
  keep("suggestions", strings(r.suggestions, 5, 120));

  const knowledge: ImportedCv["knowledge"] = {};
  const goal = str(r.currentGoal);
  const summary = str(r.summary);
  if (goal) knowledge.currentGoal = goal;
  if (summary) knowledge.summary = summary;
  return { profile, knowledge };
}
