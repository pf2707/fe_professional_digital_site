"use client";

import Link from "next/link";
import { DigitalTwin } from "@/components/DigitalTwin";
import { useT } from "@/components/I18nProvider";
import { PdfButton } from "./PdfButton";
import { longDate } from "@/lib/i18n";
import { archivedGroups, liveGroups, type Profile } from "@/lib/profile";

// The plain, printable version of a CV's studio: for recruiters, search
// engines, screen readers and browsers without WebGL. Render it inside a
// <StudioDataProvider> for the same CV, which the twin's chat needs.
// `twin={false}` leaves out the chat button (the editor's preview).

export function TextCv({ profile, studioHref, twin = true }: { profile: Profile; studioHref: string; twin?: boolean }) {
  const t = useT();
  return (
    <main className="doc">
      <div className="doc-top">
        <Link href={studioHref}>{t.textCv.back}</Link>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </div>

      <h1>{profile.name}</h1>
      <p className="doc-role">{profile.title}</p>
      <p className="doc-meta">
        {profile.location} · {profile.languages}
        {profile.phone && (
          <>
            {" · "}
            <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}>{profile.phone}</a>
          </>
        )}
        {" · "}
        {profile.socials
          .filter((s) => s.title !== "Email")
          .map((s, i) => (
            <span key={s.title}>
              {i > 0 && ", "}
              <a href={s.href}>{s.title}</a>
            </span>
          ))}
      </p>
      <PdfButton profile={profile} />

      <h2>{t.textCv.profile}</h2>
      {profile.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      <h2>{t.textCv.experience}</h2>
      {profile.experience.map((e) => (
        <div key={e.role}>
          <h3>{e.role}</h3>
          <p className="muted">
            {e.org}, {e.period}
          </p>
          <p>{e.summary}</p>
        </div>
      ))}

      {profile.certificates.length > 0 && (
        <>
          <h2>{t.textCv.certificates}</h2>
          <ul>
            {profile.certificates.map((c) => (
              <li key={c.title}>
                {[c.title, c.issuer, c.instructor].filter(Boolean).join(" — ")}
                {c.date && `, ${longDate(t, new Date(c.date))}`}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>{t.textCv.skills}</h2>
      <dl className="doc-skills">
        {profile.skills.map((s) => (
          <div key={s.group}>
            <dt>{s.group}</dt>
            <dd>{s.items.join(", ")}</dd>
          </div>
        ))}
      </dl>

      <h2>{t.textCv.projects}</h2>
      {[...liveGroups(profile), ...archivedGroups(profile)].map((g) => (
        <div key={g.key}>
          <h3>{g.label}</h3>
          <ul>
            {profile.projects
              .filter((p) => p.category === g.key)
              .map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong>: {p.description}
                </li>
              ))}
          </ul>
        </div>
      ))}

      {twin && <DigitalTwin />}
    </main>
  );
}
