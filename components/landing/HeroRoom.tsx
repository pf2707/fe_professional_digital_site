"use client";

// The landing page's headline image: the sample CV, live. It gives itself a
// tour: the overview of the studio (drifting slowly; halfway through it
// changes colours),
// then a close-up of one object with its panel (wide screens only), back out,
// the next object, and so on.
// Nothing in it is clickable; the page's button leads into the real,
// interactive room at /scene.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { DesignSwatch } from "@/components/scene/DesignPicker";
import { StudioDataProvider } from "@/components/studio/StudioData";
import type { HotspotId } from "@/components/studio/hotspots";
import { Panel } from "@/components/studio/Panels";
import { DESIGNS } from "@/lib/designs";
import { lookName, placeById } from "@/lib/places";
import type { Profile } from "@/lib/profile";

const Scene = dynamic(() => import("@/components/studio/Scene"), { ssr: false });

// The filing cabinet, the computer, the corkboard, the server rack.
const TOUR: HotspotId[] = ["archive", "work", "career", "stack"];
const OVERVIEW_SECONDS = 5; // the colours change halfway through
// The hero is always the studio; the other places have their own section below.
const STUDIO = placeById("room");
const LOOKS = DESIGNS.map((design) => ({ place: STUDIO, design }));
const CLOSE_UP_SECONDS = 6; // long enough to glance at the panel
const noop = () => {};

export function HeroRoom({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [stop, setStop] = useState(-1); // position in TOUR; -1 before the first close-up
  const [active, setActive] = useState<HotspotId | null>(null);
  const [webgl, setWebgl] = useState(false);
  const [calm, setCalm] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {}
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Stop drawing once the hero has scrolled out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One step of the tour at a time; it waits while the hero is out of view.
  useEffect(() => {
    if (calm || !visible || !ready) return;
    if (active) {
      const t = setTimeout(() => setActive(null), CLOSE_UP_SECONDS * 1000);
      return () => clearTimeout(t);
    }
    const half = (OVERVIEW_SECONDS / 2) * 1000;
    const swap = setTimeout(() => setIndex((i) => (i + 1) % LOOKS.length), half);
    const next = setTimeout(() => {
      const s = (stop + 1) % TOUR.length;
      setStop(s);
      setActive(TOUR[s]);
    }, half * 2);
    return () => {
      clearTimeout(swap);
      clearTimeout(next);
    };
  }, [calm, visible, ready, active, stop]);

  const { place, design } = LOOKS[index];
  const [s1, s2, s3] = design.sky.night;
  const sky = { "--hero-sky-1": s1, "--hero-sky-2": s2, "--hero-sky-3": s3 } as CSSProperties;

  return (
    <div ref={ref} className={`hero-room ${ready ? "is-ready" : ""} ${active ? "is-close" : ""}`} style={sky} aria-hidden>
      {webgl && (
        <StudioDataProvider profile={profile} place={place.id} design={design.id} cvHref="/cv">
          <div className="hero-canvas">
            <Scene
              showcase
              paused={!visible}
              active={active}
              hovered={null}
              setHovered={noop}
              onSelect={noop}
              onToggleLights={noop}
              night
              calm={calm}
              onReady={() => setTimeout(() => setReady(true), 250)}
            />
          </div>
          <Panel active={active} onClose={noop} onSelect={noop} passive />
        </StudioDataProvider>
      )}
      <p className="hero-design">
        <DesignSwatch design={design} />
        {lookName(place, design)}
      </p>
    </div>
  );
}
