"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextCv } from "@/components/cv/TextCv";
import { Studio } from "@/components/studio/Studio";
import { StudioDataProvider, type TwinPreview } from "@/components/studio/StudioData";
import { useUser } from "@/components/auth/AuthProvider";
import { BackButton } from "@/components/BackButton";
import { useT } from "@/components/I18nProvider";
import { validateCv } from "@/lib/cv-validate";
import { cleanCv, draftKey, loadDraft } from "@/lib/draft";
import type { CvContent } from "@/lib/profile";

// /scene/admin/preview — the draft in this browser, redrawn whenever the editor
// saves it (the `storage` event fires in every other tab and frame).
// With `flow` (opened by Save in the phone editor), a bar on top switches
// between the two views and publishes.
export function DraftPreview({ view, flow = false }: { view: "studio" | "cv"; flow?: boolean }) {
  const user = useUser();
  const { uid } = user;
  const all = useT();
  const t = all.editor;
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [draft, setDraft] = useState<CvContent | null | undefined>(undefined);

  useEffect(() => {
    setDraft(loadDraft(uid));
    const onStorage = (e: StorageEvent) => e.key === draftKey(uid) && setDraft(loadDraft(uid));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [uid]);

  // The twin answers a couple of questions from the CV being edited (the
  // working copy, saved or not): its profile, plus the knowledge below.
  const knowledge = useMemo(() => (draft ? cleanCv(draft).knowledge : undefined), [draft]);
  const preview = useMemo<TwinPreview | undefined>(
    () => (knowledge ? { knowledge, token: () => user.getIdToken() } : undefined),
    [knowledge, user],
  );

  if (draft === undefined) return null;
  if (draft === null)
    return (
      <main className="notice">
        <h1>{t.nothingTitle}</h1>
        <p>{t.nothingText}</p>
      </main>
    );

  const href = (v: "studio" | "cv") => `/scene/admin/preview?view=${v}${flow ? "&flow=1" : ""}`;
  const publish = () => {
    const error = validateCv(cleanCv(draft), all.errors);
    if (error) return setProblem(error);
    router.push("/scene/admin/publish");
  };

  return (
    <StudioDataProvider profile={draft.profile} cvHref={href("cv")} draft preview={preview}>
      {flow && (
        <div className="flow-bar" role="region" aria-label={t.flowAria}>
          <BackButton fallback="/scene/admin" className="flow-back" label={t.backToEdit}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </BackButton>
          <nav className="flow-tabs">
            <Link href={href("cv")} replace aria-current={view === "cv" ? "page" : undefined}>
              {t.tabCv}
            </Link>
            <Link href={href("studio")} replace aria-current={view === "studio" ? "page" : undefined}>
              {t.tabStudio}
            </Link>
          </nav>
          <button type="button" className="flow-publish" onClick={publish}>
            {t.publish}
          </button>
          {problem && (
            <p className="flow-problem" role="alert">
              {problem}
            </p>
          )}
        </div>
      )}
      {view === "cv" ? <TextCv profile={draft.profile} studioHref={href("studio")} twin={false} /> : <Studio />}
    </StudioDataProvider>
  );
}
