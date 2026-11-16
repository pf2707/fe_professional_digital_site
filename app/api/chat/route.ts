import OpenAI from "openai";
import { signInRequired, userFrom } from "@/lib/auth-server";
import { getCv, liveProfile } from "@/lib/cv-store";
import { CONTACT } from "@/lib/business";
import type { Dict } from "@/lib/i18n";
import { getDict } from "@/lib/i18n/server";
import { isOwner } from "@/lib/owner-auth";
import { PREVIEW_QUESTIONS } from "@/lib/premium";
import { sampleProfile, twinEnabled, type Profile, type TwinKnowledge } from "@/lib/profile";
import { slugProblem } from "@/lib/slug";
import { buildSystemPrompt, OPENROUTER_BASE_URL, sampleKnowledge, TWIN_MODEL } from "@/lib/twin";

export const runtime = "nodejs";
export const maxDuration = 30;

type IncomingMessage = { role: "user" | "assistant"; content: string };

// Keep a long or abusive conversation from running up the model bill.
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
// The editor's preview sends the CV being edited; keep it to a sane size.
const MAX_PREVIEW_KNOWLEDGE_BYTES = 300_000;

// The system prompt for one CV: the sample on /scene (no slug), or a published
// CV. Each request loads its own CV by slug, so twins never share knowledge.
// The site owner can also talk to a pending CV's twin while reviewing it.
async function promptFor(t: Dict, slug: unknown): Promise<string | Response> {
  if (slug === undefined || slug === null || slug === "") {
    return buildSystemPrompt(sampleProfile, sampleKnowledge);
  }
  if (typeof slug !== "string" || slugProblem(slug)) return new Response(t.errors.unknownCv, { status: 404 });
  const cv = await getCv(slug);
  if (!cv || (cv.status !== "approved" && !(await isOwner()))) return new Response(t.errors.notPublished, { status: 404 });
  if (!twinEnabled(liveProfile(cv))) return new Response(t.errors.twinOff, { status: 403 });
  return buildSystemPrompt(cv.profile, cv.knowledge);
}

// The editor's preview: a signed-in user tries the twin on the CV they're
// editing (the working copy, saved or not), for a few questions. The full
// twin is a premium feature.
async function previewPromptFor(
  t: Dict,
  req: Request,
  preview: unknown,
  messages: IncomingMessage[],
): Promise<string | Response> {
  if (!(await userFrom(req))) return signInRequired();
  const p = preview as { profile?: Partial<Profile>; knowledge?: Partial<TwinKnowledge> } | null;
  if (!p?.profile || typeof p.profile !== "object" || !p.knowledge || typeof p.knowledge !== "object")
    return new Response(t.errors.previewNeeds, { status: 400 });
  if (new TextEncoder().encode(JSON.stringify(p)).length > MAX_PREVIEW_KNOWLEDGE_BYTES)
    return new Response(t.errors.previewTooBig, { status: 413 });
  if (messages.filter((m) => m.role === "user").length > PREVIEW_QUESTIONS) return new Response(t.premium.limit(CONTACT.email), { status: 402 });
  // It comes from the browser, so take only well-formed fields.
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const k = p.knowledge;
  const knowledge: TwinKnowledge = {
    currentGoal: text(k.currentGoal),
    summary: text(k.summary),
    rules: text(k.rules),
    sources: (Array.isArray(k.sources) ? k.sources : []).map((s) => ({ title: text(s?.title), content: text(s?.content) })),
  };
  return buildSystemPrompt(p.profile, knowledge);
}

export async function POST(req: Request) {
  const t = await getDict();
  if (!process.env.OPENROUTER_API_KEY) return new Response(t.errors.twinNotConfigured, { status: 500 });

  let messages: IncomingMessage[];
  let slug: unknown;
  let preview: unknown;
  try {
    const body = await req.json();
    slug = body.slug;
    preview = body.preview;
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(t.errors.noMessages, { status: 400 });
    }
  } catch {
    return new Response(t.errors.badBody, { status: 400 });
  }
  messages = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (messages.length === 0) return new Response(t.errors.noMessages, { status: 400 });

  const system = preview ? await previewPromptFor(t, req, preview, messages) : await promptFor(t, slug);
  if (system instanceof Response) return system;

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: TWIN_MODEL,
          stream: true,
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`\n\n[The twin ran into an error: ${message}]`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
