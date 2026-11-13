// ─────────────────────────────────────────────────────────────────────────────
//  Every clickable object in the studio, in dock order. The number key that
//  focuses a hotspot is its index + 1. Labels and hover hints come from the
//  CV being shown; camera positions belong to the place's 3D scene.
//  `camera` / `target` are where the camera flies to when the hotspot opens.
// ─────────────────────────────────────────────────────────────────────────────

import { hintIn, type Place, type PlaceId } from "@/lib/places";
import type { Profile, SectionId } from "@/lib/profile";

// "motto" is the neon sign: clickable for a close-up, but not a CV section.
export type HotspotId = SectionId | "motto";

export type Vec3 = [number, number, number];

export type Hotspot = {
  id: SectionId;
  label: string; // dock + hover label (from the CV)
  hint: string; // what the object is, shown on hover (from the CV and the place)
  camera: Vec3;
  target: Vec3;
};

type View = Omit<Hotspot, "label" | "hint">;

export type Layout = {
  views: View[]; // in dock order
  home: { camera: Vec3; target: Vec3 }; // the establishing shot of the whole place
  intro: { camera: Vec3; target: Vec3 }; // where the intro fly-in starts
  // The neon sign on the left wall. Clicking it flies in to read it; it has no
  // panel and isn't in the dock. The camera frames `size` metres of wall.
  motto: { center: Vec3; size: [number, number] };
};

const HOME = { camera: [10.5, 8.2, 10.5] as Vec3, target: [0, 1.4, 0] as Vec3 };
const INTRO = { camera: [22, 15, 26] as Vec3, target: [0, 1.4, 0] as Vec3 };

export const LAYOUTS: Record<PlaceId, Layout> = {
  room: {
    views: [
      { id: "work", camera: [1.9, 2.75, 0.9], target: [0.9, 2.05, -3.3] },
      { id: "stack", camera: [3.0, 2.6, 0.6], target: [3.25, 1.8, -3.3] },
      { id: "certs", camera: [0.6, 2.55, -0.2], target: [-3.9, 2.35, -0.6] },
      { id: "career", camera: [0.9, 3.4, 0.3], target: [0.9, 3.3, -3.9] },
      { id: "archive", camera: [-0.9, 2.1, -0.4], target: [-3.2, 1.0, -3.2] },
      { id: "about", camera: [5.6, 2.6, 4.4], target: [2.4, 0.8, 1.2] },
      { id: "twin", camera: [1.2, 2.2, 4.6], target: [-1.6, 1.5, 1.0] },
    ],
    home: HOME,
    intro: INTRO,
    motto: { center: [-3.96, 3.62, -0.65], size: [4.2, 1.1] },
  },
  cafe: {
    views: [
      { id: "work", camera: [0.1, 3.0, 0.4], target: [-0.6, 2.9, -3.9] },
      { id: "stack", camera: [3.0, 2.7, 0.2], target: [2.75, 2.45, -3.8] },
      { id: "certs", camera: [0.4, 2.5, -1.6], target: [-3.9, 2.3, -2.25] },
      { id: "career", camera: [-1.8, 2.8, 0.4], target: [-2.75, 2.4, -3.9] },
      { id: "archive", camera: [2.4, 2.3, 0.1], target: [2.6, 1.25, -2.15] },
      { id: "about", camera: [5.6, 2.6, 4.6], target: [2.5, 0.8, 1.5] },
      { id: "twin", camera: [1.3, 2.5, 1.0], target: [0.75, 2.1, -3.15] },
    ],
    home: HOME,
    intro: INTRO,
    motto: { center: [-3.96, 3.7, 1.0], size: [4.0, 1.05] },
  },
  park: {
    views: [
      { id: "work", camera: [0.4, 3.0, -0.6], target: [0.4, 1.95, -3.55] },
      { id: "stack", camera: [3.1, 2.4, -0.3], target: [2.7, 0.8, -3.35] },
      { id: "certs", camera: [-1.2, 1.7, 0.2], target: [-3.9, 1.2, -1.2] },
      { id: "career", camera: [-0.7, 2.3, 0.6], target: [-1.5, 2.05, -3.1] },
      { id: "archive", camera: [-2.6, 1.9, 0.8], target: [-3.0, 0.9, -3.0] },
      { id: "about", camera: [5.4, 2.4, 4.6], target: [2.5, 0.7, 1.3] },
      { id: "twin", camera: [2.3, 2.4, 2.6], target: [0.5, 1.8, -0.6] },
    ],
    home: HOME,
    intro: INTRO,
    motto: { center: [-3.85, 3.0, 1.45], size: [2.8, 0.85] },
  },
  shop: {
    views: [
      { id: "work", camera: [0.1, 2.3, 1.3], target: [-3.9, 1.95, 1.3] },
      { id: "stack", camera: [2.2, 2.3, 0.2], target: [2.0, 1.75, -3.8] },
      { id: "certs", camera: [0.4, 2.5, -1.6], target: [-3.9, 2.3, -2.4] },
      { id: "career", camera: [-0.6, 2.8, 0.6], target: [-0.9, 2.5, -3.9] },
      { id: "archive", camera: [1.5, 2.0, -0.2], target: [3.3, 0.6, -3.1] },
      { id: "about", camera: [0.7, 2.4, 0.4], target: [-2.55, 1.0, -2.0] },
      { id: "twin", camera: [3.0, 2.3, 2.3], target: [0.7, 1.5, -1.3] },
    ],
    home: HOME,
    intro: INTRO,
    motto: { center: [-3.96, 3.6, 1.3], size: [3.4, 0.9] },
  },
};

export const MOTTO_HINT = "The sign — click to read it";

// The dock for one CV in one place. Without a twin there's no hologram to visit.
export function hotspotsFor(profile: Profile, withTwin: boolean, place: Place): Hotspot[] {
  return LAYOUTS[place.id].views
    .filter((v) => withTwin || v.id !== "twin")
    .map((v) => ({
      ...v,
      label: profile.studio.sections[v.id].label,
      hint: hintIn(place, v.id, profile.studio.sections[v.id].hint),
    }));
}
