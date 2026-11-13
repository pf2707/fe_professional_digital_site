"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /scene/admin/publish — choose the CV's address, reserve it, then contact the
//  owner to pay. Payment happens outside the website: the reservation stores
//  the CV as pending, and the owner approves it in Firebase once paid.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/AuthProvider";
import { DesignSwatch } from "@/components/scene/DesignPicker";
import { CONTACT } from "@/lib/business";
import { designById } from "@/lib/designs";
import { loadDraft, loadFromCloud } from "@/lib/draft";
import type { CvContent } from "@/lib/profile";
import { cvPath, SLUG_MAX, slugProblem, toSlug } from "@/lib/slug";

type Check = { state: "idle" | "checking" | "ok" | "bad"; reason?: string };
type Reserved = { slug: string; name: string; email: string };

export function PublishFlow() {
  const user = useUser();
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
    loadFromCloud(user)
      .then((saved) => {
        if (saved?.slug) setReserved({ slug: saved.slug, name: saved.profile.name, email: saved.profile.email });
      })
      .catch((e) => setError(e.message))
      .finally(() => setDraft(d));
  }, [user]);

  // Check the address as it's typed: its shape right away, then the database.
  useEffect(() => {
    if (!slug) return setCheck({ state: "idle" });
    const problem = slugProblem(slug);
    if (problem) return setCheck({ state: "bad", reason: problem });
    setCheck({ state: "checking" });
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/publish?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal });
        const { available, reason } = await res.json();
        setCheck(available ? { state: "ok" } : { state: "bad", reason });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setCheck({ state: "bad", reason: "Couldn't check this address. Try again." });
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [slug]);

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
      else setError(text || "Couldn't reserve this address. Try again.");
      return;
    }
    setReserved({ slug, name: draft.profile.name, email: draft.profile.email });
  };

  if (draft === undefined) return <div className="admin-empty">Loading…</div>;

  return (
    <main className="publish">
      <Link href="/scene/admin" className="publish-back">
        ← Back to the editor
      </Link>
      <h1>Publish your CV</h1>

      {reserved ? (
        <Reserved reserved={reserved} origin={origin} />
      ) : !draft ? (
        <p className="publish-lede">
          You haven&apos;t started a CV yet. <Link href="/scene/admin">Fill one in</Link> first.
        </p>
      ) : (
        <>
          <Summary draft={draft} />

          <section className="publish-step">
            <h2>Choose your address</h2>
            <p className="publish-lede">This is the link you&apos;ll share. It can&apos;t be changed after it&apos;s reserved.</p>
            <label className="slug-field">
              <span className="slug-origin">{origin.replace(/^https?:\/\//, "")}{cvPath("")}</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                maxLength={SLUG_MAX}
                spellCheck={false}
                autoCapitalize="none"
                aria-label="Your CV's address"
                aria-describedby="slug-status"
              />
            </label>
            <p id="slug-status" className={`slug-status ${check.state}`} role="status">
              {check.state === "checking"
                ? "Checking…"
                : check.state === "ok"
                  ? `${origin}${cvPath(slug)} is available`
                  : check.state === "bad"
                    ? check.reason
                    : "Lowercase letters, numbers and dashes, like thai-tran."}
            </p>
          </section>

          <section className="publish-step">
            <h2>Contact us to publish</h2>
            <p className="publish-lede">
              Payment is handled outside the website. Reserve your address and contact us; once payment is confirmed we approve your
              CV and it goes live at your address.
            </p>
            <button type="button" className="publish-cta" disabled={check.state !== "ok" || sending} onClick={reserve}>
              {sending ? "Reserving…" : "Contact us to publish"}
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
  const design = designById(p.studio.design);
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
          <DesignSwatch design={design} /> {design.name} · digital twin {p.twin.enabled === false ? "off" : "on"}
        </span>
      </div>
    </div>
  );
}

function Reserved({ reserved, origin }: { reserved: Reserved; origin: string }) {
  const url = `${origin}${cvPath(reserved.slug)}`;
  const message = `Hi, I'd like to publish my 3D CV at ${url}. Name: ${reserved.name}. Email: ${reserved.email}.`;
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
        <h2>{url.replace(/^https?:\/\//, "")} is reserved for you</h2>
        <p className="publish-lede">
          Your CV is waiting for approval. Contact us to arrange payment; once it&apos;s approved, your CV goes live at{" "}
          <a href={url}>{url}</a>.
        </p>
      </section>

      <section className="publish-step">
        <h2>Contact us</h2>
        <div className="contact-options">
          <a
            className="publish-cta"
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Publish my CV: ${cvPath(reserved.slug)}`)}&body=${encodeURIComponent(message)}`}
          >
            Email {CONTACT.email}
          </a>
        </div>
        <p className="publish-lede">The email starts with this message, so we know which CV is yours. If you write from another app, copy it:</p>
        <blockquote className="contact-message">{message}</blockquote>
        <button type="button" className="ghost" onClick={copy}>
          {copied ? "Copied" : "Copy message"}
        </button>
      </section>

      <p className="publish-note">
        You can keep editing: until your CV is approved, every Save in the <Link href="/scene/admin">editor</Link> updates it here
        too. After it&apos;s live, contact us to publish changes.
      </p>
    </>
  );
}
