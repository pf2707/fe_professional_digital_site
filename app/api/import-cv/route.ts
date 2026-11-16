import OpenAI from "openai";
import { signInRequired, userFrom } from "@/lib/auth-server";
import { IMPORT_PROMPT, importedCv } from "@/lib/cv-import";
import { getDict } from "@/lib/i18n/server";
import { MAX_CV_CHARS } from "@/lib/pdf-text";
import { OPENROUTER_BASE_URL, TWIN_MODEL } from "@/lib/twin";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/import-cv { text } (the text of a CV PDF, read in the browser) →
// the CV's fields (lib/cv-import.ts). Needs `Authorization: Bearer <ID token>`.
// Neither the text nor the answer is stored.
export async function POST(req: Request) {
  if (!(await userFrom(req))) return signInRequired();
  const t = await getDict();
  const e = t.editor.import;
  if (!process.env.OPENROUTER_API_KEY) return new Response(t.errors.twinNotConfigured, { status: 500 });

  let text: unknown;
  try {
    text = (await req.json()).text;
  } catch {
    return new Response(t.errors.badBody, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim()) return new Response(e.nothing, { status: 422 });
  const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: OPENROUTER_BASE_URL });
  try {
    const completion = await client.chat.completions.create({
      model: TWIN_MODEL,
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: IMPORT_PROMPT },
        { role: "user", content: `Here is the text of the CV:\n\n${text.slice(0, MAX_CV_CHARS)}` },
      ],
    });
    const answer = completion.choices[0]?.message?.content ?? "";
    // Some models still wrap JSON in a code fence.
    const json = answer.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
    return Response.json(importedCv(JSON.parse(json)), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(e.failed, { status: 502 });
  }
}
