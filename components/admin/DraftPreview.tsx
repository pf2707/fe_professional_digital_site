"use client";

import { useEffect, useMemo, useState } from "react";
import { TextCv } from "@/components/cv/TextCv";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider, type TwinPreview } from "@/components/studio/StudioData";
import { useUser } from "@/components/auth/AuthProvider";
import { draftKey, loadDraft } from "@/lib/draft";
import type { CvContent } from "@/lib/profile";

// /scene/admin/preview — the draft in this browser, redrawn whenever the editor
// saves it (the `storage` event fires in every other tab and frame).
export function DraftPreview({ view }: { view: "studio" | "cv" }) {
  const user = useUser();
  const { uid } = user;
  const [draft, setDraft] = useState<CvContent | null | undefined>(undefined);

  useEffect(() => {
    setDraft(loadDraft(uid));
    const onStorage = (e: StorageEvent) => e.key === draftKey(uid) && setDraft(loadDraft(uid));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [uid]);

  // The twin answers a couple of questions from the knowledge being edited.
  const knowledge = draft?.knowledge;
  const preview = useMemo<TwinPreview | undefined>(
    () => (knowledge ? { knowledge, token: () => user.getIdToken() } : undefined),
    [knowledge, user],
  );

  if (draft === undefined) return null;
  if (draft === null)
    return (
      <main className="notice">
        <h1>Nothing to preview yet</h1>
        <p>Fill in your CV in the editor and it shows up here.</p>
      </main>
    );

  return (
    <StudioDataProvider profile={draft.profile} cvHref="/scene/admin/preview?view=cv" draft preview={preview}>
      {view === "cv" ? <TextCv profile={draft.profile} studioHref="/scene/admin/preview?view=studio" /> : <Studio />}
    </StudioDataProvider>
  );
}
