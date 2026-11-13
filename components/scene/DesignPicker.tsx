"use client";

import { DESIGNS, type Design } from "@/lib/designs";

// A swatch of the room's main surfaces and its two lights.
export function DesignSwatch({ design }: { design: Design }) {
  const { wall, floor, wood, teal, amber } = design.palette;
  return (
    <span className="swatch" aria-hidden>
      <i style={{ background: wall }} />
      <i style={{ background: floor }} />
      <i style={{ background: wood }} />
      <i style={{ background: teal }} />
      <i style={{ background: amber }} />
    </span>
  );
}

// The rail of room designs beside the studio on /scene.
export function DesignPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <nav className="design-rail" aria-label="Room designs">
      <p className="design-rail-title">Room design</p>
      {DESIGNS.map((d) => (
        <button
          key={d.id}
          type="button"
          className={d.id === value ? "on" : ""}
          aria-pressed={d.id === value}
          onClick={() => onChange(d.id)}
        >
          <DesignSwatch design={d} />
          <span className="design-name">{d.name}</span>
          <span className="design-blurb">{d.blurb}</span>
        </button>
      ))}
    </nav>
  );
}
