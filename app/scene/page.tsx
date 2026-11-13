import type { Metadata } from "next";
import { SceneShowcase } from "@/components/scene/SceneShowcase";
import { sampleProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: `${sampleProfile.name} — Sample 3D CV`,
  description: `A sample interactive 3D CV: ${sampleProfile.title}.`,
};

// /scene?place=park&design=forest opens on that look (the landing page links here).
export default async function ScenePage(props: PageProps<"/scene">) {
  const { place, design } = await props.searchParams;
  return (
    <SceneShowcase
      profile={sampleProfile}
      place={typeof place === "string" ? place : undefined}
      design={typeof design === "string" ? design : undefined}
    />
  );
}
