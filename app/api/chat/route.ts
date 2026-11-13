import OpenAI from "openai";
import { signInRequired, userFrom } from "@/lib/auth-server";
import { getCv, liveProfile } from "@/lib/cv-store";
import { isOwner } from "@/lib/owner-auth";
import { PREVIEW_QUESTIONS, previewLimitMessage } from "@/lib/premium";
import { sampleProfile, twinEnabled, type TwinKnowledge } from "@/lib/profile";
import { slugProblem } from "@/lib/slug";
import { buildSystemPrompt, OPENROUTER_BASE_URL, sampleKnowledge, TWIN_MODEL } from "@/lib/twin";

export const runtime = "nodejs";
export const maxDuration = 30;

type IncomingMessage = { role: "user" | "assistant"; content: string };

// Keep a long or abusive conversation from running up the model bill.
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
// The editor's preview sends the knowledge being edited; keep it to a sane size.
const MAX_PREVIEW_KNOWLEDGE_BYTES = 300_000;

// The system prompt for one CV: the sample on /scene (no slug), or a published
// CV. Each request loads its own CV by slug, so twins never share knowledge.
// The site owner can also talk to a pending CV's twin while reviewing it.
async function promptFor(slug: unknown): Promise<string | Response> {
  if (slug === undefined || slug === null || slug === "") {
    return buildSystemPrompt(sampleProfile.name, sampleKnowledge);
  }
  if (typeof slug !== "string" || slugProblem(slug)) return new Response("Unknown CV.", { status: 404 });
  const cv = await getCv(slug);
  if (!cv || (cv.status !== "approved" && !(await isOwner()))) return new Response("This CV isn't published yet.", { status: 404 });
  if (!twinEnabled(liveProfile(cv))) return new Response("This CV's digital twin is turned off.", { status: 403 });
  return buildSystemPrompt(cv.profile.name, cv.knowledge);
}

// The editor's preview: a signed-in user tries the twin on the CV they're
// editing, for a few questions. The full twin is a premium feature.
async function previewPromptFor(req: Request, preview: unknown, messages: IncomingMessage[]): Promise<string | Response> {
  if (!(await userFrom(req))) return signInRequired();
  const p = preview as { name?: unknown; knowledge?: Partial<TwinKnowledge> } | null;
  if (typeof p?.name !== "string" || !p.knowledge || !Array.isArray(p.knowledge.sources))
    return new Response("The preview needs the CV's name and twin knowledge.", { status: 400 });
  if (new TextEncoder().encode(JSON.stringify(p.knowledge)).length > MAX_PREVIEW_KNOWLEDGE_BYTES)
    return new Response("The twin's knowledge is too large to preview. Shorten its sources.", { status: 413 });
  if (messages.filter((m) => m.role === "user").length > PREVIEW_QUESTIONS) return new Response(previewLimitMessage, { status: 402 });
  // It comes from the browser, so take only well-formed fields.
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const k = p.knowledge;
  const knowledge: TwinKnowledge = {
    currentGoal: text(k.currentGoal),
    summary: text(k.summary),
    rules: text(k.rules),
    sources: k.sources!.map((s) => ({ title: text(s?.title), content: text(s?.content) })),
  };
  return buildSystemPrompt(p.name, knowledge);
}

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      "The digital twin isn't configured yet — set OPENROUTER_API_KEY to enable it.",
      { status: 500 },
    );
  }

  let messages: IncomingMessage[];
  let slug: unknown;
  let preview: unknown;
  try {
    const body = await req.json();
    slug = body.slug;
    preview = body.preview;
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided.", { status: 400 });
    }
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }
  messages = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (messages.length === 0) return new Response("No messages provided.", { status: 400 });

  const system = preview ? await previewPromptFor(req, preview, messages) : await promptFor(slug);
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
