"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { archivedGroups, liveGroups, profile, type ProjectGroup } from "@/lib/profile";
import { HOTSPOTS, type HotspotId } from "./hotspots";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const copy = (id: keyof typeof profile.studio.sections) => profile.studio.sections[id];

function Intro({ id }: { id: keyof typeof profile.studio.sections }) {
  const { title, lede } = copy(id);
  return (
    <>
      <h2>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </>
  );
}

function Groups({ groups }: { groups: ProjectGroup[] }) {
  return groups.map((g) => (
    <div key={g.key}>
      <h3>{g.label}</h3>
      <ProjectList category={g.key} />
    </div>
  ));
}

function ProjectList({ category }: { category: string }) {
  return (
    <ul className="p-list">
      {profile.projects
        .filter((p) => p.category === category)
        .map((p) => (
          <li key={p.name}>
            <span className="p-icon" aria-hidden>
              {p.icon}
            </span>
            <div>
              <h4>{p.name}</h4>
              <p>{p.description}</p>
            </div>
          </li>
        ))}
    </ul>
  );
}

function Work() {
  return (
    <>
      <Intro id="work" />
      <Groups groups={liveGroups()} />
    </>
  );
}

function Stack() {
  const groups = profile.skills.filter((g) => !g.archived);
  return (
    <>
      <Intro id="stack" />
      {groups.map((g) => (
        <section key={g.group} className="rack-unit">
          <h3>{g.group}</h3>
          <div className="chips">
            {g.items.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function Certs() {
  return (
    <>
      <Intro id="certs" />
      <ol className="certs">
        {profile.certificates.map((c) => (
          <li key={c.title}>
            <time dateTime={c.date}>{formatDate(c.date)}</time>
            <h4>{c.title}</h4>
            <p>
              {c.issuer}, taught by {c.instructor}
            </p>
            {c.note && <p className="cert-note">{c.note}</p>}
          </li>
        ))}
      </ol>
    </>
  );
}

function Career() {
  return (
    <>
      <Intro id="career" />
      <ol className="timeline-list">
        {profile.experience.map((e) => (
          <li key={e.role}>
            <span className="tl-period">{e.period}</span>
            <h4>{e.role}</h4>
            <p className="tl-org">{e.org}</p>
            <p>{e.summary}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Archive() {
  const skills = profile.skills.filter((g) => g.archived).flatMap((g) => g.items);
  return (
    <>
      <Intro id="archive" />
      {skills.length > 0 && (
        <div className="chips chips-paper">
          {skills.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}
      <Groups groups={archivedGroups()} />
    </>
  );
}

function About() {
  return (
    <>
      <div className="about-head">
        {profile.avatar && (
          <Image src={profile.avatar} alt="" width={72} height={72} className="about-photo" />
        )}
        <div>
          <h2>{profile.name}</h2>
          <p className="about-role">{profile.title}</p>
        </div>
      </div>
      {profile.about.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <dl className="facts">
        {[
          { label: "Based in", value: profile.location },
          { label: "Languages", value: profile.languages },
          ...profile.stats,
          { label: "Status", value: profile.available ? "Open to new roles and projects" : "Not looking right now" },
        ].map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="panel-cta">
        <a className="btn-solid" href={`mailto:${profile.email}`}>
          Email {profile.email}
        </a>
        <div className="socials-row">
          {profile.socials
            .filter((s) => s.title !== "Email")
            .map((s) => (
              <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            ))}
        </div>
      </div>
    </>
  );
}

const CONTENT: Record<Exclude<HotspotId, "twin">, () => React.JSX.Element> = {
  work: Work,
  stack: Stack,
  certs: Certs,
  career: Career,
  archive: Archive,
  about: About,
};

export function Panel({
  active,
  onClose,
  onSelect,
}: {
  active: HotspotId | null;
  onClose: () => void;
  onSelect: (id: HotspotId) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const open = active !== null && active !== "twin";

  useEffect(() => {
    if (!open) return;
    ref.current?.scrollTo({ top: 0 });
    const heading = ref.current?.querySelector<HTMLElement>("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [active, open]);

  const index = HOTSPOTS.findIndex((h) => h.id === active);
  const prev = HOTSPOTS[(index - 1 + HOTSPOTS.length) % HOTSPOTS.length];
  const next = HOTSPOTS[(index + 1) % HOTSPOTS.length];
  const Body = open ? CONTENT[active as Exclude<HotspotId, "twin">] : null;

  return (
    <aside className={`panel ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Section details">
      <div className="panel-scroll" ref={ref}>
        <button className="panel-close" onClick={onClose} aria-label="Back to the room">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {Body && (
          <div className="panel-body" key={active}>
            <Body />
          </div>
        )}
        {open && (
          <div className="panel-nav">
            <button onClick={() => onSelect(prev.id)}>← {prev.label}</button>
            <button onClick={() => onSelect(next.id)}>{next.label} →</button>
          </div>
        )}
      </div>
    </aside>
  );
}
