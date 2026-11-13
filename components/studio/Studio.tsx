"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { DigitalTwin } from "@/components/DigitalTwin";
import type { HotspotId } from "./hotspots";
import { Panel } from "./Panels";
import { useHotspots, useStudioData } from "./StudioData";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

// `extra` is page-specific chrome drawn over the room, like the design picker on /scene.
export function Studio({ extra }: { extra?: ReactNode } = {}) {
  const { profile, design, cvHref } = useStudioData();
  const hotspots = useHotspots();
  const [active, setActive] = useState<HotspotId | null>(null);
  const [hovered, setHovered] = useState<HotspotId | null>(null);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [calm, setCalm] = useState(false);
  const [explored, setExplored] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; render night until mounted to match SSR.
  const night = !mounted || resolvedTheme !== "light";

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCalm(mq.matches);
    const onChange = () => setCalm(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const select = useCallback((id: HotspotId) => {
    setActive(id);
    setHovered(null);
    setExplored(true);
  }, []);
  const close = useCallback(() => setActive(null), []);
  const toggleLights = useCallback(() => setTheme(night ? "light" : "dark"), [night, setTheme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "Escape") close();
      const n = Number(e.key);
      if (n >= 1 && n <= hotspots.length) select(hotspots[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, select, hotspots]);

  // The design's sky sits behind the diorama, by night or by day.
  const sky = design.sky[night ? "night" : "day"];
  const skyVars = { "--sky-1": sky[0], "--sky-2": sky[1], "--sky-3": sky[2] } as CSSProperties;

  return (
    <div
      className={`studio ${active ? "is-focused" : ""} ${active && active !== "twin" && active !== "motto" ? "has-panel" : ""} ${active === "motto" ? "is-motto" : ""}`}
      style={skyVars}
    >
      <h1 className="sr-only">
        {profile.name}, {profile.title}. Interactive 3D CV.
      </h1>

      <div className="studio-canvas" aria-hidden>
        {webgl && (
          <Scene
            active={active}
            hovered={hovered}
            setHovered={setHovered}
            onSelect={select}
            onToggleLights={toggleLights}
            night={night}
            calm={calm}
            onReady={() => setTimeout(() => setReady(true), 250)}
          />
        )}
      </div>

      {webgl === false && (
        <div className="no-webgl">
          <h2>This browser can&apos;t draw the 3D studio.</h2>
          <p>Everything in it is also on the text version of this CV.</p>
          <Link href={cvHref} className="btn-solid">
            Open the text CV
          </Link>
        </div>
      )}

      <header className="hud-top">
        <button className="brand" onClick={close} aria-label="Back to the room overview">
          <strong>{profile.name}</strong>
          <span>{profile.subtitle}</span>
        </button>
        <div className="hud-actions">
          <Link href={cvHref} className="hud-link">
            Text CV
          </Link>
          <a href={`mailto:${profile.email}`} className="hud-link hide-sm">
            Email me
          </a>
          <button className="lights" onClick={toggleLights} aria-label={night ? "Turn the lights on" : "Turn the lights off"}>
            <span className={`switch ${night ? "" : "on"}`} aria-hidden />
            Lights
          </button>
        </div>
      </header>

      <p className={`hud-hint ${ready && !explored ? "show" : ""}`} aria-hidden>
        <span className="hint-fine">Click anything in the room, or press 1–{hotspots.length}</span>
        <span className="hint-touch">Tap anything in the room</span>
      </p>

      <nav className="dock" aria-label="Studio sections">
        {hotspots.map((h, i) => (
          <button
            key={h.id}
            className={`${active === h.id ? "on" : ""} ${hovered === h.id ? "hover" : ""} ${h.id === "twin" ? "dock-twin" : ""}`}
            aria-pressed={active === h.id}
            onClick={() => (active === h.id ? close() : select(h.id))}
            onMouseEnter={() => setHovered(h.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <kbd>{i + 1}</kbd>
            {h.label}
          </button>
        ))}
      </nav>

      {active === "motto" && (
        <button className="hud-link motto-back" onClick={close}>
          Back to the room
        </button>
      )}

      <Panel active={active} onClose={close} onSelect={select} />

      <DigitalTwin
        open={active === "twin"}
        onOpenChange={(o) => (o ? select("twin") : close())}
        launcher={false}
      />

      {extra}

      <div className={`curtain ${ready || webgl === false ? "up" : ""}`} aria-hidden>
        <span>{profile.name}</span>
        <i />
      </div>
    </div>
  );
}
