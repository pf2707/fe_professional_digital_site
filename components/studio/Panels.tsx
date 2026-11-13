"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { archivedGroups, liveGroups, type ProjectGroup, type SectionId } from "@/lib/profile";
import type { HotspotId } from "./hotspots";
import { useHotspots, useStudioData } from "./StudioData";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function Intro({ id }: { id: SectionId }) {
  const { title, lede } = useStudioData().profile.studio.sections[id];
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
  const { profile } = useStudioData();
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
  const { profile } = useStudioData();
  return (
    <>
      <Intro id="work" />
      <Groups groups={liveGroups(profile)} />
    </>
  );
}

function Stack() {
  const { profile } = useStudioData();
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
  const { profile } = useStudioData();
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
  const { profile } = useStudioData();
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
  const { profile } = useStudioData();
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
      <Groups groups={archivedGroups(profile)} />
    </>
  );
}

function About() {
  const { profile } = useStudioData();
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
        {profile.phone && (
          <a className="btn-ghost" href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}>
            Call {profile.phone}
          </a>
        )}
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

type PanelId = Exclude<HotspotId, "twin" | "motto">;

const CONTENT: Record<PanelId, () => React.JSX.Element> = {
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
  passive = false,
}: {
  active: HotspotId | null;
  onClose: () => void;
  onSelect: (id: HotspotId) => void;
  // Display only (the landing page's tour): no focus, no close or next buttons.
  passive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const open = active !== null && active !== "twin" && active !== "motto";

  useEffect(() => {
    if (!open || passive) return;
    ref.current?.scrollTo({ top: 0 });
    const heading = ref.current?.querySelector<HTMLElement>("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [active, open, passive]);

  const hotspots = useHotspots();
  const index = hotspots.findIndex((h) => h.id === active);
  const prev = hotspots[(index - 1 + hotspots.length) % hotspots.length];
  const next = hotspots[(index + 1) % hotspots.length];
  const Body = open ? CONTENT[active as PanelId] : null;

  return (
    <aside
      className={`panel ${open ? "open" : ""}`}
      aria-hidden={!open || passive}
      inert={passive}
      aria-label="Section details"
    >
      <div className="panel-scroll" ref={ref}>
        {!passive && (
          <button className="panel-close" onClick={onClose} aria-label="Back to the room">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {Body && (
          <div className="panel-body" key={active}>
            <Body />
          </div>
        )}
        {open && !passive && (
          <div className="panel-nav">
            <button onClick={() => onSelect(prev.id)}>← {prev.label}</button>
            <button onClick={() => onSelect(next.id)}>{next.label} →</button>
          </div>
        )}
      </div>
    </aside>
  );
}
