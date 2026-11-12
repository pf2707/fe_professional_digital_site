"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { profile } from "@/lib/profile";
import { HOTSPOTS, type HotspotId } from "./hotspots";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function ProjectList({ category }: { category: "fde" | "ai" | "mobile" }) {
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
      <h2>AI work that ships</h2>
      <p className="lede">{profile.tagline} Client deployments first, then the agents and automations behind them.</p>
      <h3>With clients</h3>
      <ProjectList category="fde" />
      <h3>Agents and automations</h3>
      <ProjectList category="ai" />
    </>
  );
}

function Stack() {
  const groups = profile.skills.filter((g) => g.group !== "Mobile Development");
  return (
    <>
      <h2>The agent stack</h2>
      <p className="lede">What runs in the rack: the tools and practices I use to design, build and deploy AI systems.</p>
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
      <h2>Certificates on the wall</h2>
      <p className="lede">Three courses completed in 2026, covering forward deployed engineering, agent building and coding agents.</p>
      <ol className="certs">
        {profile.certificates.map((c) => (
          <li key={c.title}>
            <time dateTime={c.date}>{formatDate(c.date)}</time>
            <h4>{c.title}</h4>
            <p>
              {c.issuer}, taught by {c.instructor}
            </p>
            {"note" in c && c.note && <p className="cert-note">{c.note}</p>}
          </li>
        ))}
      </ol>
    </>
  );
}

function Career() {
  return (
    <>
      <h2>Career</h2>
      <p className="lede">Thirteen years of shipping software, and a deliberate turn toward AI.</p>
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
  const mobile = profile.skills.find((g) => g.group === "Mobile Development");
  return (
    <>
      <h2>The mobile archive</h2>
      <p className="lede">
        Ten years of iOS, Android and Flutter, filed away while I focus on AI. Everything here is still a skill
        I use: ask the twin about Swift or Flutter any time.
      </p>
      {mobile && (
        <div className="chips chips-paper">
          {mobile.items.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}
      <h3>Filed projects</h3>
      <ProjectList category="mobile" />
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
}: {
  active: HotspotId | null;
  onClose: () => void;
  onSelect: (id: HotspotId) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const open = active !== null && active !== "twin" && active !== "motto";

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
  const Body = open ? CONTENT[active as PanelId] : null;

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
