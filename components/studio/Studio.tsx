"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BackButton } from "@/components/BackButton";
import { DigitalTwin } from "@/components/DigitalTwin";
import { useT } from "@/components/I18nProvider";
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
// `actions` go first in the top bar (e.g. Edit). `back` adds a Back button; the
// editor's preview pane leaves it out.
export function Studio({ extra, actions, back = false }: { extra?: ReactNode; actions?: ReactNode; back?: boolean } = {}) {
  const { profile, design, cvHref, sample } = useStudioData();
  const t = useT().scene;
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

  // A bright design stays in daylight: the room, the sky and the HUD's light
  // colours, whatever the Lights switch says.
  const dark = night && !design.bright;
  // The design's sky sits behind the diorama, by night or by day.
  const sky = design.sky[dark ? "night" : "day"];
  const skyVars = { "--sky-1": sky[0], "--sky-2": sky[1], "--sky-3": sky[2] } as CSSProperties;

  return (
    <div
      className={`studio ${active ? "is-focused" : ""} ${active && active !== "twin" && active !== "motto" ? "has-panel" : ""} ${active === "motto" ? "is-motto" : ""} ${dark ? "" : "light"}`}
      style={skyVars}
    >
      <h1 className="sr-only">
        {t.srTitle(profile.name, profile.title)}
      </h1>

      <div className="studio-canvas" aria-hidden>
        {webgl && (
          <Scene
            active={active}
            hovered={hovered}
            setHovered={setHovered}
            onSelect={select}
            onToggleLights={toggleLights}
            fixedLight={!!design.bright}
            night={dark}
            calm={calm}
            onReady={() => setTimeout(() => setReady(true), 250)}
          />
        )}
      </div>

      {webgl === false && (
        <div className="no-webgl">
          <h2>{t.noWebglTitle}</h2>
          <p>{t.noWebglText}</p>
          <Link href={cvHref} className="btn-solid">
            {t.noWebglCta}
          </Link>
        </div>
      )}

      <header className="hud-top">
        <div className="hud-left">
          {back && (
            <BackButton fallback="/" className="hud-link hud-back" label={t.backAria}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hide-sm">{t.back}</span>
            </BackButton>
          )}
          <button className="brand" onClick={close} aria-label={t.overviewAria}>
            {sample && <em className="sample-tag">{t.sampleTag}</em>}
            <strong>{profile.name}</strong>
            <span>{profile.subtitle}</span>
          </button>
        </div>
        <div className="hud-actions">
          {actions}
          <Link href={cvHref} className="hud-link">
            {t.textCv}
          </Link>
          <a href={`mailto:${profile.email}`} className="hud-link hide-sm">
            {t.emailMe}
          </a>
          {!design.bright && (
            <button className="lights" onClick={toggleLights} aria-label={night ? t.lightsOn : t.lightsOff}>
              <span className={`switch ${night ? "" : "on"}`} aria-hidden />
              {t.lights}
            </button>
          )}
        </div>
      </header>

      <p className={`hud-hint ${ready && !explored ? "show" : ""}`} aria-hidden>
        <span className="hint-fine">{t.hintFine(hotspots.length)}</span>
        <span className="hint-touch">{t.hintTouch}</span>
      </p>

      <nav className="dock" aria-label={t.dockAria}>
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
          {t.backToRoom}
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
        {sample && <em className="sample-tag">{t.sampleTag}</em>}
        <span>{profile.name}</span>
        <i />
      </div>
    </div>
  );
}
