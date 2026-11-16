"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /scene/admin/publish — choose the CV's address, reserve it, then contact the
//  owner to pay. Payment happens outside the website: the reservation stores
//  the CV as pending, and the owner approves it in Firebase once paid.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/AuthProvider";
import { useT } from "@/components/I18nProvider";
import { DesignSwatch } from "@/components/scene/DesignPicker";
import { CONTACT } from "@/lib/business";
import { designById } from "@/lib/designs";
import { loadDraft, loadFromCloud } from "@/lib/draft";
import { designIn, lookNameIn, placeIn } from "@/lib/i18n";
import { placeById } from "@/lib/places";
import type { CvContent } from "@/lib/profile";
import { cvPath, SLUG_MAX, slugProblem, toSlug } from "@/lib/slug";

type Check = { state: "idle" | "checking" | "ok" | "bad"; reason?: string };
type Reserved = { slug: string; name: string; email: string };

export function PublishFlow() {
  const user = useUser();
  const all = useT();
  const t = all.publish;
  const [draft, setDraft] = useState<CvContent | null | undefined>(undefined);
  const [origin, setOrigin] = useState("");
  const [slug, setSlug] = useState("");
  const [check, setCheck] = useState<Check>({ state: "idle" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reserved, setReserved] = useState<Reserved | null>(null);

  // The editor's working copy, and whether this account already has an address.
  useEffect(() => {
    const d = loadDraft(user.uid);
    setOrigin(window.location.origin);
    if (d) setSlug(toSlug(d.profile.name));
    loadFromCloud(user, all.errors)
      .then((saved) => {
        if (saved?.slug) setReserved({ slug: saved.slug, name: saved.profile.name, email: saved.profile.email });
      })
      .catch((e) => setError(e.message))
      .finally(() => setDraft(d));
  }, [user]);

  // Check the address as it's typed: its shape right away, then the database.
  useEffect(() => {
    if (!slug) return setCheck({ state: "idle" });
    const problem = slugProblem(slug, all.errors);
    if (problem) return setCheck({ state: "bad", reason: problem });
    setCheck({ state: "checking" });
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/publish?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal });
        const { available, reason } = await res.json();
        setCheck(available ? { state: "ok" } : { state: "bad", reason });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setCheck({ state: "bad", reason: t.checkFailed });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [slug, all.errors, t.checkFailed]);

  const reserve = async () => {
    if (!draft || check.state !== "ok") return;
    setSending(true);
    setError("");
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
      body: JSON.stringify({ slug, ...draft }),
    });
    setSending(false);
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 409) setCheck({ state: "bad", reason: text });
      else setError(text || t.reserveFailed);
      return;
    }
    setReserved({ slug, name: draft.profile.name, email: draft.profile.email });
  };

  if (draft === undefined) return <div className="admin-empty">{all.editor.loading}</div>;

  return (
    <main className="publish">
      <Link href="/scene/admin" className="publish-back">
        {t.back}
      </Link>
      <h1>{t.title}</h1>

      {reserved ? (
        <Reserved reserved={reserved} origin={origin} />
      ) : !draft ? (
        <p className="publish-lede">
          {t.noDraft} <Link href="/scene/admin">{t.fillOne}</Link>
          {t.first}
        </p>
      ) : (
        <>
          <Summary draft={draft} />

          <section className="publish-step">
            <h2>{t.chooseTitle}</h2>
            <p className="publish-lede">{t.chooseLede}</p>
            <label className="slug-field">
              <span className="slug-origin">{origin.replace(/^https?:\/\//, "")}{cvPath("")}</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                maxLength={SLUG_MAX}
                spellCheck={false}
                autoCapitalize="none"
                aria-label={t.addressAria}
                aria-describedby="slug-status"
              />
            </label>
            <p id="slug-status" className={`slug-status ${check.state}`} role="status">
              {check.state === "checking"
                ? t.checking
                : check.state === "ok"
                  ? t.available(`${origin}${cvPath(slug)}`)
                  : check.state === "bad"
                    ? check.reason
                    : t.shape}
            </p>
          </section>

          <section className="publish-step">
            <h2>{t.contactTitle}</h2>
            <p className="publish-lede">{t.contactLede}</p>
            <button type="button" className="publish-cta" disabled={check.state !== "ok" || sending} onClick={reserve}>
              {sending ? t.reserving : t.reserve}
            </button>
            {error && <p className="f-error">{error}</p>}
          </section>
        </>
      )}
    </main>
  );
}

function Summary({ draft }: { draft: CvContent }) {
  const p = draft.profile;
  const all = useT();
  const design = designIn(all, designById(p.studio.design));
  return (
    <div className="publish-summary">
      {p.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar} alt="" className="avatar-img" />
      ) : (
        <span className="avatar-img avatar-initials">{p.initials}</span>
      )}
      <div>
        <strong>{p.name}</strong>
        <span>{p.title}</span>
        <span className="publish-design">
          <DesignSwatch design={design} /> {lookNameIn(all, placeIn(all, placeById(p.studio.place)), design)} ·{" "}
          {p.twin.enabled === false ? all.publish.twinOff : all.publish.twinOn}
        </span>
      </div>
    </div>
  );
}

function Reserved({ reserved, origin }: { reserved: Reserved; origin: string }) {
  const t = useT().publish;
  const url = `${origin}${cvPath(reserved.slug)}`;
  const message = t.message(url, reserved.name, reserved.email);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <section className="publish-step reserved">
        <h2>{t.reservedTitle(url.replace(/^https?:\/\//, ""))}</h2>
        <p className="publish-lede">
          {t.reservedLede}
          <a href={url}>{url}</a>.
        </p>
      </section>

      <section className="publish-step">
        <h2>{t.contact}</h2>
        <div className="contact-options">
          <a
            className="publish-cta"
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(t.subject(cvPath(reserved.slug)))}&body=${encodeURIComponent(message)}`}
          >
            {t.emailUs(CONTACT.email)}
          </a>
        </div>
        <p className="publish-lede">{t.messageLede}</p>
        <blockquote className="contact-message">{message}</blockquote>
        <button type="button" className="ghost" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
      </section>

      <p className="publish-note">
        {t.noteBefore}
        <Link href="/scene/admin">{t.noteEditor}</Link>
        {t.noteAfter}
      </p>
    </>
  );
}
