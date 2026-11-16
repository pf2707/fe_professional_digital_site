import "server-only";
import sample from "@/data/twin-knowledge.json";
import type { Profile, TwinKnowledge } from "./profile";

// The model the digital twin runs on — matches the existing twin project
// (OpenRouter + Google Gemini). Change here if you switch providers.
export const TWIN_MODEL = "google/gemini-2.5-flash-lite";
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// The sample CV's knowledge (/scene). Published CVs bring their own.
export const sampleKnowledge = sample as TwinKnowledge;

// Everything the person filled in on their CV, as text the model can read.
// The editor's preview sends the profile from the browser, so every field is
// read defensively.
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function profileText(p: Partial<Profile>): string {
  const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  const lines = (title: string, items: string[]) => {
    const kept = items.map(str).filter(Boolean);
    return kept.length ? `## ${title}\n\n${kept.join("\n")}` : "";
  };

  const basics = [
    ["Name", p.name],
    ["Job title", p.title],
    ["Headline", p.subtitle],
    ["Tagline", p.tagline],
    ["Location", p.location],
    ["Email", p.email],
    ["Phone", p.phone],
    ["Languages", p.languages],
  ]
    .filter(([, v]) => str(v))
    .map(([k, v]) => `- ${k}: ${str(v)}`);
  if (typeof p.available === "boolean") basics.push(`- Open to new opportunities: ${p.available ? "yes" : "no"}`);

  const groups = new Map(list<Profile["projectGroups"][number]>(p.projectGroups).map((g) => [g?.key, g]));
  return [
    basics.length ? `## Basics\n\n${basics.join("\n")}` : "",
    lines("Highlights", list<Profile["stats"][number]>(p.stats).map((s) => `- ${str(s?.value)} ${str(s?.label)}`.trim()).filter((s) => s !== "-")),
    lines("About", list<string>(p.about)),
    lines(
      "Career",
      list<Profile["experience"][number]>(p.experience).map(
        (e) => `- ${[str(e?.role), str(e?.org), str(e?.period)].filter(Boolean).join(", ")}${str(e?.summary) ? `: ${str(e?.summary)}` : ""}`,
      ),
    ),
    lines(
      "Skills",
      list<Profile["skills"][number]>(p.skills).map(
        (g) => `- ${str(g?.group)}${g?.archived ? " (earlier)" : ""}: ${list<string>(g?.items).map(str).filter(Boolean).join(", ")}`,
      ),
    ),
    lines(
      "Certificates",
      list<Profile["certificates"][number]>(p.certificates).map(
        (c) =>
          `- ${[str(c?.title), str(c?.issuer), str(c?.instructor) && `taught by ${str(c?.instructor)}`, str(c?.date)].filter(Boolean).join(", ")}${str(c?.note) ? `: ${str(c?.note)}` : ""}`,
      ),
    ),
    lines(
      "Projects",
      list<Profile["projects"][number]>(p.projects).map((pr) => {
        const g = groups.get(pr?.category);
        const group = g ? ` [${str(g.label) || str(g.key)}${g.archived ? ", earlier work" : ""}]` : "";
        return `- ${str(pr?.name)}${group}${str(pr?.description) ? `: ${str(pr?.description)}` : ""}`;
      }),
    ),
    lines("Links", list<Profile["socials"][number]>(p.socials).map((s) => `- ${str(s?.title) || str(s?.label)}: ${str(s?.href)}`)),
    lines("Motto", [str(p.studio?.neon).replace(/\n+/g, " · ")]),
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Mirrors digital_twin/context.py — same persona and rules. Built from one
// CV only: its profile and its twin knowledge. Nothing about any other CV is
// ever in the prompt.
export function buildSystemPrompt(profile: Partial<Profile>, { currentGoal, summary, sources, rules }: TwinKnowledge) {
  const name = str(profile.name) || "this person";
  const sourceBlocks = [
    `## The CV\n\n${profileText(profile)}`,
    ...sources.filter((s) => s.content.trim()).map((s) => `## ${s.title}\n\n${s.content}`),
  ].join("\n\n");
  const intro = summary.trim() || [str(profile.title), str(profile.tagline)].filter(Boolean).join(". ") || "See the CV below.";
  const goal = currentGoal.trim() || str(profile.title) || "See the CV below.";

  return `
# Your role

You are a digital twin running on a website, chatting with visitors of the website.
You represent ${name}, the person whose CV website you are on.
You answer questions related to their career, background, skills and experience.

Here are the details of the person you are representing:

${intro}

If asked, you explain clearly that you are an AI that is the digital twin of this person.

# Current career goal

The person's current job title and career goal (this is the most up-to-date information,
and it takes priority over older sources such as LinkedIn):

${goal}

# Context

Here is what you know about the person, so that you can answer questions. It is
everything they filled in on their CV. Older sources may describe older roles; prefer
the current career goal above when they differ:

${sourceBlocks}

# Rules

Engage with the user. Be professional and engaging, as if talking to a potential client or future employer who came across the website.
Only answer questions related to career, background, skills and experience.
If the user asks about something unrelated, then steer the conversation back to professional topics.

Always stay in character as the digital twin of the person you are representing. Represent the person.

You only know about ${name}. This website hosts CVs for many people, but you represent
${name} alone. If the user asks about anyone else — another person, another CV on this
site, or someone with a similar name — say that you can only answer questions about ${name}.
Never guess, invent or borrow details about other people, and never describe ${name}
using anything that isn't in the context above.

Reply in the language the user writes in (for example Vietnamese or English), even though the context above may be in another language.

If the user would like to get in touch, then ask for their email so they can be followed up with.

IMPORTANT:
If you don't know the answer, tell the user honestly that you don't know rather than making something up. Never make up an answer.

${rules.trim() ? `IMPORTANT — PERSON-SPECIFIC RULES:\n${rules.trim()}\n\n` : ""}Use styling (in markdown, no code blocks) to make the response more engaging and easy to read.
`.trim();
}
