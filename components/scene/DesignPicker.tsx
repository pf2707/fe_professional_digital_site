"use client";

import Image from "next/image";
import { DESIGNS, type Design } from "@/lib/designs";
import { PLACES } from "@/lib/places";

// A round swatch: the walls, the wood and the design's two lights.
export function DesignSwatch({ design }: { design: Design }) {
  const { wall, wood, teal, amber } = design.palette;
  return (
    <span
      className="swatch"
      aria-hidden
      style={{ background: `conic-gradient(from -45deg, ${wall} 0 25%, ${wood} 0 50%, ${teal} 0 75%, ${amber} 0)` }}
    />
  );
}

// Left of the scene on /scene: one picture card per place. It scrolls, so more
// places can be added. Each place's picture is public/places/<id>.webp.
export function PlacePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <nav className="place-rail" aria-label="Places">
      <p className="rail-title">Place</p>
      <div className="place-list">
        {PLACES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === value ? "on" : ""}
            aria-pressed={p.id === value}
            title={p.blurb}
            onClick={() => onChange(p.id)}
          >
            <Image src={`/places/${p.id}.webp`} alt="" width={360} height={240} sizes="180px" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Right of the scene on /scene: the colours, which work in every place.
export function ColourPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <nav className="colour-rail" aria-label="Colours">
      <p className="rail-title">Colours</p>
      {DESIGNS.map((d) => (
        <button
          key={d.id}
          type="button"
          className={d.id === value ? "on" : ""}
          aria-pressed={d.id === value}
          aria-label={`${d.name}: ${d.blurb}`}
          title={d.blurb}
          onClick={() => onChange(d.id)}
        >
          <DesignSwatch design={d} />
          <span>{d.name}</span>
        </button>
      ))}
    </nav>
  );
}
