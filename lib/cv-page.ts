import "server-only";
import { cache } from "react";
import { getCv, liveProfile, type CvRecord } from "./cv-store";
import { isOwner } from "./owner-auth";
import { slugProblem } from "./slug";

// What /scene/<slug> and /scene/<slug>/cv should show for a request.
export type CvView =
  | { kind: "missing" }
  | { kind: "pending" }
  | { kind: "live"; cv: CvRecord; review: boolean }; // review: the site owner looking at a pending CV

// Loaded once per request, shared by generateMetadata and the page. The
// profile already carries the owner's twin setting.
const load = cache(async (slug: string) => {
  const cv = slugProblem(slug) ? null : await getCv(slug);
  return cv && { ...cv, profile: liveProfile(cv) };
});

export async function cvView(slug: string): Promise<CvView> {
  const cv = await load(slug);
  if (!cv) return { kind: "missing" };
  if (cv.status === "approved") return { kind: "live", cv, review: false };
  // The site owner, signed in at /owner, sees a pending CV in full before approving it.
  if (await isOwner()) return { kind: "live", cv, review: true };
  return { kind: "pending" };
}
