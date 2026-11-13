import Link from "next/link";
import { DigitalTwin } from "@/components/DigitalTwin";
import { archivedGroups, liveGroups, type Profile } from "@/lib/profile";

// The plain, printable version of a CV's studio: for recruiters, search
// engines, screen readers and browsers without WebGL. Render it inside a
// <StudioDataProvider> for the same CV, which the twin's chat needs.

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function TextCv({ profile, studioHref }: { profile: Profile; studioHref: string }) {
  return (
    <main className="doc">
      <div className="doc-top">
        <Link href={studioHref}>Back to the 3D studio</Link>
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

      <h2>Profile</h2>
      {profile.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      <h2>Experience</h2>
      {profile.experience.map((e) => (
        <div key={e.role}>
          <h3>{e.role}</h3>
          <p className="muted">
            {e.org}, {e.period}
          </p>
          <p>{e.summary}</p>
        </div>
      ))}

      <h2>Certificates</h2>
      <ul>
        {profile.certificates.map((c) => (
          <li key={c.title}>
            {c.title} — {c.issuer}, {c.instructor}, {formatDate(c.date)}
          </li>
        ))}
      </ul>

      <h2>Skills</h2>
      <dl className="doc-skills">
        {profile.skills.map((s) => (
          <div key={s.group}>
            <dt>{s.group}</dt>
            <dd>{s.items.join(", ")}</dd>
          </div>
        ))}
      </dl>

      <h2>Projects</h2>
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

      <DigitalTwin />
    </main>
  );
}
