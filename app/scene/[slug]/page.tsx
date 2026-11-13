import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PendingCv } from "@/components/cv/PendingCv";
import { ReviewBar } from "@/components/owner/ReviewBar";
import { OwnerEditLink } from "@/components/studio/OwnerEditLink";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider } from "@/components/studio/StudioData";
import { cvView } from "@/lib/cv-page";
import { twinEnabled } from "@/lib/profile";
import { cvPath } from "@/lib/slug";

// localhost:3000/scene/<slug> — one person's published 3D CV.

export async function generateMetadata(props: PageProps<"/scene/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const view = await cvView(slug);
  if (view.kind !== "live") return { title: "CV not published", robots: { index: false } };
  const p = view.cv.profile;
  return {
    title: `${p.name} — 3D CV`,
    description: `${p.title}. ${p.tagline}`,
    robots: view.review ? { index: false } : undefined,
  };
}

export default async function CvPage(props: PageProps<"/scene/[slug]">) {
  const { slug } = await props.params;
  const view = await cvView(slug);
  if (view.kind === "missing") notFound();
  if (view.kind === "pending") return <PendingCv />;

  return (
    <StudioDataProvider profile={view.cv.profile} slug={slug} cvHref={`${cvPath(slug)}/cv`}>
      <AuthProvider>
        {/* The owner reviewing it already has their own bar. */}
        <Studio back actions={view.review ? null : <OwnerEditLink ownerUid={view.cv.ownerUid} />} />
      </AuthProvider>
      {view.review && <ReviewBar slug={slug} owner={view.cv.ownerEmail} twin={twinEnabled(view.cv.profile)} />}
    </StudioDataProvider>
  );
}
