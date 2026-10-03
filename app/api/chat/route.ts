import OpenAI from "openai";
import {
  TWIN_MODEL,
  OPENROUTER_BASE_URL,
  TWIN_SYSTEM_PROMPT,
} from "@/lib/twin";

export const runtime = "nodejs";
export const maxDuration = 30;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      "The digital twin isn't configured yet — set OPENROUTER_API_KEY to enable it.",
      { status: 500 },
    );
  }

  let messages: IncomingMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided.", { status: 400 });
    }
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

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
            { role: "system", content: TWIN_SYSTEM_PROMPT },
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
