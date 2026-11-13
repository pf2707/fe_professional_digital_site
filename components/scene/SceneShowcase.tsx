"use client";

import { useState } from "react";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider } from "@/components/studio/StudioData";
import { designById } from "@/lib/designs";
import type { Profile } from "@/lib/profile";
import { DesignPicker } from "./DesignPicker";

// /scene: the sample CV, with a rail for trying the room designs.
export function SceneShowcase({ profile }: { profile: Profile }) {
  const [design, setDesign] = useState(designById(profile.studio.design).id);
  return (
    <StudioDataProvider profile={profile} design={design} cvHref="/cv">
      <Studio extra={<DesignPicker value={design} onChange={setDesign} />} />
    </StudioDataProvider>
  );
}
