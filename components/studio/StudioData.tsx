"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The CV the studio is showing. The studio is the same for every CV; this
//  context tells it whose it is: the sample on /scene, a draft in the /scene/admin
//  preview, or a published CV at /scene/<slug>.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { designById, type Design } from "@/lib/designs";
import { twinEnabled, type Profile, type TwinKnowledge } from "@/lib/profile";
import { hotspotsFor } from "./hotspots";

// live: the chat works · preview: a draft in the editor, so the chat answers a
// couple of questions as a trial · off: the CV turned its twin off, so there's
// no hologram or chat
export type TwinMode = "live" | "preview" | "off";

// What the editor's preview chat sends: the knowledge being edited, signed by
// the signed-in user.
export type TwinPreview = { knowledge: TwinKnowledge; token: () => Promise<string> };

type StudioData = {
  profile: Profile;
  design: Design;
  slug?: string; // published CVs only; the twin answers for this CV
  cvHref: string; // the text version of this CV
  twin: TwinMode;
  preview?: TwinPreview;
};

const Ctx = createContext<StudioData | null>(null);

export function StudioDataProvider({
  profile,
  design,
  slug,
  cvHref,
  draft = false,
  preview,
  children,
}: {
  profile: Profile;
  design?: string; // overrides the CV's own design (the /scene picker)
  slug?: string;
  cvHref: string;
  draft?: boolean;
  preview?: TwinPreview; // with `draft`: lets the preview chat try the twin
  children: ReactNode;
}) {
  const value = useMemo<StudioData>(
    () => ({
      profile,
      design: designById(design ?? profile.studio.design),
      slug,
      cvHref,
      twin: !twinEnabled(profile) ? "off" : draft ? "preview" : "live",
      preview,
    }),
    [profile, design, slug, cvHref, draft, preview],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudioData() {
  const data = useContext(Ctx);
  if (!data) throw new Error("useStudioData must be used inside <StudioDataProvider>.");
  return data;
}

export function useHotspots() {
  const { profile, twin } = useStudioData();
  return useMemo(() => hotspotsFor(profile, twin !== "off"), [profile, twin]);
}
