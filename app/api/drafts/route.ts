import { signInRequired, userFrom } from "@/lib/auth-server";
import { updatePendingCv } from "@/lib/cv-store";
import { draftProblem } from "@/lib/cv-validate";
import { getDraft, saveDraft } from "@/lib/draft-store";
import { getDict } from "@/lib/i18n/server";
import type { CvContent } from "@/lib/profile";

export const runtime = "nodejs";

// The signed-in user's own draft. Both methods need `Authorization: Bearer <ID token>`.

// GET /api/drafts → { profile, knowledge, slug?, updatedAt }, or 404 before the first save
export async function GET(req: Request) {
  const user = await userFrom(req);
  if (!user) return signInRequired();
  const draft = await getDraft(user);
  if (!draft) return new Response("No saved CV yet.", { status: 404 });
  const { profile, knowledge, slug, updatedAt } = draft;
  return Response.json({ profile, knowledge, slug, updatedAt }, { headers: { "Cache-Control": "no-store" } });
}

// PUT /api/drafts { profile, knowledge } → { cv, slug }
// cv: "updated" when the user's CV is still pending and got the changes too,
// "live" when it's already approved (changes then need the site owner), or null.
export async function PUT(req: Request) {
  const user = await userFrom(req);
  if (!user) return signInRequired();
  const { errors: e } = await getDict();
  let body: Partial<CvContent>;
  try {
    body = await req.json();
  } catch {
    return new Response(e.badJson, { status: 400 });
  }
  const problem = draftProblem(body, e);
  if (problem) return new Response(problem, { status: 422 });
  const content = { profile: body.profile!, knowledge: body.knowledge! };
  const before = await getDraft(user);
  await saveDraft(user, content);
  const slug = before?.slug ?? null;
  const cv = slug ? ((await updatePendingCv(slug, content, user)) ? "updated" : "live") : null;
  return Response.json({ cv, slug });
}
