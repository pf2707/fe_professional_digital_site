import type { Metadata } from "next";
import { SceneShowcase } from "@/components/scene/SceneShowcase";
import { sampleProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: `${sampleProfile.name} — Sample 3D CV`,
  description: `A sample interactive 3D CV: ${sampleProfile.title}.`,
};

export default function ScenePage() {
  return <SceneShowcase profile={sampleProfile} />;
}
