// ─────────────────────────────────────────────────────────────────────────────
//  Every clickable object in the studio, in dock order. The number key that
//  focuses a hotspot is its index + 1. Labels and hover hints are content
//  (data/profile.json); camera positions belong to the 3D room.
//  `camera` / `target` are where the camera flies to when the hotspot opens.
// ─────────────────────────────────────────────────────────────────────────────

import { profile, type SectionId } from "@/lib/profile";

export type HotspotId = SectionId;

export type Vec3 = [number, number, number];

export type Hotspot = {
  id: HotspotId;
  label: string; // dock + hover label (from data/profile.json)
  hint: string; // what the object is, shown on hover (from data/profile.json)
  camera: Vec3;
  target: Vec3;
};

const VIEWS: Omit<Hotspot, "label" | "hint">[] = [
  {
    id: "work",
    camera: [1.9, 2.75, 0.9],
    target: [0.9, 2.05, -3.3],
  },
  {
    id: "stack",
    camera: [3.0, 2.6, 0.6],
    target: [3.25, 1.8, -3.3],
  },
  {
    id: "certs",
    camera: [0.6, 2.55, -0.2],
    target: [-3.9, 2.35, -0.6],
  },
  {
    id: "career",
    camera: [0.9, 3.4, 0.3],
    target: [0.9, 3.3, -3.9],
  },
  {
    id: "archive",
    camera: [-0.9, 2.1, -0.4],
    target: [-3.2, 1.0, -3.2],
  },
  {
    id: "about",
    camera: [5.6, 2.6, 4.4],
    target: [2.4, 0.8, 1.2],
  },
  {
    id: "twin",
    camera: [1.2, 2.2, 4.6],
    target: [-1.6, 1.5, 1.0],
  },
];

export const HOTSPOTS: Hotspot[] = VIEWS.map((v) => ({
  ...v,
  label: profile.studio.sections[v.id].label,
  hint: profile.studio.sections[v.id].hint,
}));

// Overview: the isometric-ish establishing shot of the whole room.
export const HOME_VIEW = {
  camera: [10.5, 8.2, 10.5] as Vec3,
  target: [0, 1.4, 0] as Vec3,
};

// Where the intro fly-in starts.
export const INTRO_VIEW = {
  camera: [22, 15, 26] as Vec3,
  target: [0, 1.4, 0] as Vec3,
};
