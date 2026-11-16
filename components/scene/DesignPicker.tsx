"use client";

import Image from "next/image";
import { useT } from "@/components/I18nProvider";
import { DESIGNS, type Design } from "@/lib/designs";
import { designIn, placeIn } from "@/lib/i18n";
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
  const t = useT();
  return (
    <nav className="place-rail" aria-label={t.scene.placesRail}>
      <p className="rail-title">{t.scene.place}</p>
      <div className="place-list">
        {PLACES.map((pl) => placeIn(t, pl)).map((p) => (
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
  const t = useT();
  return (
    <nav className="colour-rail" aria-label={t.scene.coloursRail}>
      <p className="rail-title">{t.scene.colours}</p>
      {DESIGNS.map((ds) => designIn(t, ds)).map((d) => (
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
