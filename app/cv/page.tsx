import type { Metadata } from "next";
import { TextCv } from "@/components/cv/TextCv";
import { StudioDataProvider } from "@/components/studio/StudioData";
import { sampleProfile } from "@/lib/profile";

// The text version of the sample CV on /scene.

export const metadata: Metadata = {
  title: `${sampleProfile.name} — CV`,
  description: `${sampleProfile.title}. ${sampleProfile.tagline}`,
};

export default function SampleCv() {
  return (
    <StudioDataProvider profile={sampleProfile} cvHref="/cv">
      <TextCv profile={sampleProfile} studioHref="/scene" />
    </StudioDataProvider>
  );
}
