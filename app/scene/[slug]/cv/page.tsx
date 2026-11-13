import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingCv } from "@/components/cv/PendingCv";
import { TextCv } from "@/components/cv/TextCv";
import { ReviewBar } from "@/components/owner/ReviewBar";
import { StudioDataProvider } from "@/components/studio/StudioData";
import { cvView } from "@/lib/cv-page";
import { twinEnabled } from "@/lib/profile";
import { cvPath } from "@/lib/slug";

// localhost:3000/scene/<slug>/cv — the text version of one person's CV.

export async function generateMetadata(props: PageProps<"/scene/[slug]/cv">): Promise<Metadata> {
  const { slug } = await props.params;
  const view = await cvView(slug);
  if (view.kind !== "live") return { title: "CV not published", robots: { index: false } };
  const p = view.cv.profile;
  return {
    title: `${p.name} — CV`,
    description: `${p.title}. ${p.tagline}`,
    robots: view.review ? { index: false } : undefined,
  };
}

export default async function CvTextPage(props: PageProps<"/scene/[slug]/cv">) {
  const { slug } = await props.params;
  const view = await cvView(slug);
  if (view.kind === "missing") notFound();
  if (view.kind === "pending") return <PendingCv />;

  return (
    <StudioDataProvider profile={view.cv.profile} slug={slug} cvHref={`${cvPath(slug)}/cv`}>
      <TextCv profile={view.cv.profile} studioHref={cvPath(slug)} />
      {view.review && <ReviewBar slug={slug} owner={view.cv.ownerEmail} twin={twinEnabled(view.cv.profile)} />}
    </StudioDataProvider>
  );
}
