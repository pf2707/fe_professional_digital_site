import { canEdit, readContent, validate, writeContent, type Content } from "@/lib/admin-store";

export const runtime = "nodejs";

// GET /api/admin            → current content
// GET /api/admin?template=1 → the blank starter template
export async function GET(req: Request) {
  const template = new URL(req.url).searchParams.has("template");
  const content = await readContent(template ? "template" : "current");
  return Response.json({ ...content, editable: canEdit() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  if (!canEdit()) {
    return new Response("Editing is only available when running `npm run dev` locally.", { status: 403 });
  }
  let content: Content;
  try {
    content = await req.json();
  } catch {
    return new Response("The request body isn't valid JSON.", { status: 400 });
  }
  const problem = validate(content);
  if (problem) return new Response(problem, { status: 422 });
  await writeContent(content);
  return Response.json({ ok: true });
}
