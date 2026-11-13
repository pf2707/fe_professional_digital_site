"use client";

import { useState } from "react";
import Link from "next/link";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider } from "@/components/studio/StudioData";
import { designById } from "@/lib/designs";
import { placeById } from "@/lib/places";
import type { Profile } from "@/lib/profile";
import { ColourPicker, PlacePicker } from "./DesignPicker";

// /scene: the sample CV, with rails for trying each place (left) and colours (right).
// `place` / `design` pick the starting look; otherwise the CV's own.
export function SceneShowcase({ profile, ...start }: { profile: Profile; place?: string; design?: string }) {
  const [place, setPlace] = useState<string>(placeById(start.place ?? profile.studio.place).id);
  const [design, setDesign] = useState(designById(start.design ?? profile.studio.design).id);
  return (
    <StudioDataProvider profile={profile} place={place} design={design} cvHref="/cv">
      <Studio
        back
        actions={
          <Link href="/scene/admin" className="hud-link">
            Edit
          </Link>
        }
        extra={
          <>
            <PlacePicker value={place} onChange={setPlace} />
            <ColourPicker value={design} onChange={setDesign} />
          </>
        }
      />
    </StudioDataProvider>
  );
}
