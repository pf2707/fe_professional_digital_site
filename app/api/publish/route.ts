import { createCv, isSlugTaken } from "@/lib/cv-store";
import { validateCv } from "@/lib/cv-validate";
import { signInRequired, userFrom } from "@/lib/auth-server";
import { getDraft, linkDraftToCv, saveDraft } from "@/lib/draft-store";
import type { CvContent } from "@/lib/profile";
import { slugProblem } from "@/lib/slug";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

// GET /api/publish?slug=thai-tran → { available, reason? }
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const problem = slugProblem(slug);
  if (problem) return Response.json({ available: false, reason: problem }, { headers: noStore });
  const taken = await isSlugTaken(slug);
  return Response.json(
    taken ? { available: false, reason: "Someone already has this path. Try another." } : { available: true },
    { headers: noStore },
  );
}

// POST /api/publish { slug, profile, knowledge } → reserves the path and stores
// the CV as pending, owned by the signed-in user. It goes live at /<slug> once
// the site owner approves it. One CV per account.
export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user) return signInRequired();
  let body: { slug?: unknown } & Partial<CvContent>;
  try {
    body = await req.json();
  } catch {
    return new Response("The request body isn't valid JSON.", { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  const problem = slugProblem(slug) ?? validateCv(body);
  if (problem) return new Response(problem, { status: 422 });

  const draft = await getDraft(user);
  if (draft?.slug) return new Response(`Your CV already has an address: /${draft.slug}.`, { status: 409 });

  const content = { profile: body.profile!, knowledge: body.knowledge! };
  if (!(await createCv(slug, content, user))) return new Response("Someone already has this path. Try another.", { status: 409 });
  await saveDraft(user, content);
  await linkDraftToCv(user, slug);
  return Response.json({ slug, status: "pending" }, { status: 201 });
}
