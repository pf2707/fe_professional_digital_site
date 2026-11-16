import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SceneShowcase } from "@/components/scene/SceneShowcase";
import { getDict } from "@/lib/i18n/server";
import { sampleProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.scene.sampleTitle(sampleProfile.name), description: t.scene.sampleDescription(sampleProfile.title) };
}

// /scene?place=park&design=forest opens on that look (the landing page links here).
// Signed in with a saved CV, it shows theirs; ?mine=1 sends them to the editor if not.
export default async function ScenePage(props: PageProps<"/scene">) {
  const { place, design, mine } = await props.searchParams;
  return (
    <AuthProvider>
      <SceneShowcase
        profile={sampleProfile}
        mine={mine === "1"}
        place={typeof place === "string" ? place : undefined}
        design={typeof design === "string" ? design : undefined}
      />
    </AuthProvider>
  );
}
