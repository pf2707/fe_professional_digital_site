"use client";

import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/I18nProvider";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider, type TwinPreview } from "@/components/studio/StudioData";
import { designById } from "@/lib/designs";
import { cleanCv, loadDraft, loadFromCloud, saveDraft } from "@/lib/draft";
import { placeById } from "@/lib/places";
import type { CvContent, Profile } from "@/lib/profile";
import { ColourPicker, PlacePicker } from "./DesignPicker";

// /scene: the sample CV, with rails for trying each place (left) and colours (right).
// A signed-in user with a saved CV sees theirs instead. `place` / `design` pick
// the starting look; otherwise the CV's own. `mine` (the landing page's "Make
// your own" when signed in) opens the editor if they have no CV yet. Checking
// for a saved CV never holds the page up for long, and a saved CV that can't
// be shown falls back to the sample.
// Longer than this, and the sample opens instead of waiting on the saved CV.
const CHECK_MS = 8000;

export function SceneShowcase({ profile, mine, ...start }: { profile: Profile; mine?: boolean; place?: string; design?: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  // undefined until we know: null for the sample, or the user's saved CV.
  const [own, setOwn] = useState<CvContent | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;
    if (!user) return setOwn(null);
    let live = true;
    const timer = setTimeout(() => live && setOwn((o) => (o === undefined ? null : o)), CHECK_MS);
    loadFromCloud(user)
      .then((cv) => {
        if (!live) return;
        const copy = cv ? { profile: cv.profile, knowledge: cv.knowledge } : null;
        // The text CV link opens the editor's preview, which reads this browser's working copy.
        if (copy && !loadDraft(user.uid)) saveDraft(user.uid, copy);
        setOwn((o) => (o === undefined ? copy : o));
      })
      .catch(() => live && setOwn(null));
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [user, loading]);

  const t = useT();
  const noCvYet = mine && user && own === null;
  useEffect(() => {
    if (noCvYet) router.replace("/scene/admin");
  }, [noCvYet, router]);

  // Their own CV's twin answers a few questions, as in the editor's preview.
  const preview = useMemo<TwinPreview | undefined>(() => {
    if (!own || !user) return undefined;
    try {
      return { knowledge: cleanCv(own).knowledge, token: () => user.getIdToken() };
    } catch {
      return undefined; // an incomplete saved CV: no twin trial
    }
  }, [own, user]);

  if (own === undefined || noCvYet)
    return (
      <div className="studio">
        <div className="curtain" role="status">
          <span className="curtain-note">{t.scene.opening}</span>
          <i />
        </div>
      </div>
    );
  const sample = <Showcase profile={profile} start={start} sample cvHref="/cv" />;
  return own ? (
    <Fallback to={sample}>
      <Showcase profile={own.profile} start={start} draft preview={preview} cvHref="/scene/admin/preview?view=cv" />
    </Fallback>
  ) : (
    sample
  );
}

// Shows `to` if its children fail to render.
class Fallback extends Component<{ to: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.to : this.props.children;
  }
}

function Showcase({
  profile,
  start,
  cvHref,
  draft,
  preview,
  sample,
}: {
  profile: Profile;
  start: { place?: string; design?: string };
  cvHref: string;
  draft?: boolean;
  preview?: TwinPreview;
  sample?: boolean;
}) {
  const [place, setPlace] = useState<string>(placeById(start.place ?? profile.studio.place).id);
  const [design, setDesign] = useState(designById(start.design ?? profile.studio.design).id);
  const t = useT();
  return (
    <StudioDataProvider profile={profile} place={place} design={design} cvHref={cvHref} draft={draft} preview={preview} sample={sample}>
      <Studio
        back
        actions={
          <Link href="/scene/admin" className="hud-link">
            {t.scene.edit}
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
