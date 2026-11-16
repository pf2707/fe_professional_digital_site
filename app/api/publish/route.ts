import { createCv, isSlugTaken } from "@/lib/cv-store";
import { validateCv } from "@/lib/cv-validate";
import { signInRequired, userFrom } from "@/lib/auth-server";
import { getDraft, linkDraftToCv, saveDraft } from "@/lib/draft-store";
import { getDict } from "@/lib/i18n/server";
import type { CvContent } from "@/lib/profile";
import { slugProblem } from "@/lib/slug";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

// GET /api/publish?slug=thai-tran → { available, reason? }
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const { errors: e } = await getDict();
  const problem = slugProblem(slug, e);
  if (problem) return Response.json({ available: false, reason: problem }, { headers: noStore });
  const taken = await isSlugTaken(slug);
  return Response.json(
    taken ? { available: false, reason: e.slugTaken } : { available: true },
    { headers: noStore },
  );
}

// POST /api/publish { slug, profile, knowledge } → reserves the path and stores
// the CV as pending, owned by the signed-in user. It goes live at /<slug> once
// the site owner approves it. One CV per account.
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user) return signInRequired();
  const { errors: e } = await getDict();
  let body: { slug?: unknown } & Partial<CvContent>;
  try {
    body = await req.json();
  } catch {
    return new Response(e.badJson, { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  const problem = slugProblem(slug, e) ?? validateCv(body, e);
  if (problem) return new Response(problem, { status: 422 });

  const draft = await getDraft(user);
  if (draft?.slug) return new Response(e.hasAddress(draft.slug), { status: 409 });

  const content = { profile: body.profile!, knowledge: body.knowledge! };
  if (!(await createCv(slug, content, user))) return new Response(e.slugTaken, { status: 409 });
  await saveDraft(user, content);
  await linkDraftToCv(user, slug);
  return Response.json({ slug, status: "pending" }, { status: 201 });
}
