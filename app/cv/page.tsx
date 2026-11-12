import type { Metadata } from "next";
import Link from "next/link";
import { DigitalTwin } from "@/components/DigitalTwin";
import { profile } from "@/lib/profile";

// The plain, printable version of the studio: for recruiters, search
// engines, screen readers and browsers without WebGL.

export const metadata: Metadata = {
  title: `${profile.name} — CV`,
  description: `${profile.title}. ${profile.tagline}`,
};

const GROUPS = [
  { key: "fde", label: "Forward deployed engineering" },
  { key: "ai", label: "AI agents and automation" },
  { key: "mobile", label: "Mobile development (archive)" },
] as const;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function CV() {
  return (
    <main className="doc">
      <div className="doc-top">
        <Link href="/">Back to the 3D studio</Link>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </div>

      <h1>{profile.name}</h1>
      <p className="doc-role">{profile.title}</p>
      <p className="doc-meta">
        {profile.location} · {profile.languages} ·{" "}
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
      {GROUPS.map((g) => (
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
