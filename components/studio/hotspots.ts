// ─────────────────────────────────────────────────────────────────────────────
//  Every clickable object in the studio, in dock order. The number key that
//  focuses a hotspot is its index + 1.
//  `camera` / `target` are where the camera flies to when the hotspot opens.
// ─────────────────────────────────────────────────────────────────────────────

export type HotspotId =
  | "work"
  | "stack"
  | "certs"
  | "career"
  | "archive"
  | "about"
  | "twin"
  | "motto";

export type Vec3 = [number, number, number];

export type Hotspot = {
  id: HotspotId;
  label: string; // dock + hover label
  hint: string; // what the object is, shown on hover
  camera: Vec3;
  target: Vec3;
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: "work",
    label: "Work",
    hint: "The monitor — AI projects",
    camera: [1.9, 2.75, 0.9],
    target: [0.9, 2.05, -3.3],
  },
  {
    id: "stack",
    label: "Stack",
    hint: "The agent rack — skills",
    camera: [3.0, 2.6, 0.6],
    target: [3.25, 1.8, -3.3],
  },
  {
    id: "certs",
    label: "Certificates",
    hint: "The frames — AI certificates",
    camera: [0.6, 2.55, -0.2],
    target: [-3.9, 2.35, -0.6],
  },
  {
    id: "career",
    label: "Career",
    hint: "The corkboard — timeline",
    camera: [0.9, 3.4, 0.3],
    target: [0.9, 3.3, -3.9],
  },
  {
    id: "archive",
    label: "Mobile archive",
    hint: "The cabinet — 10+ years of iOS & Flutter",
    camera: [-0.9, 2.1, -0.4],
    target: [-3.2, 1.0, -3.2],
  },
  {
    id: "about",
    label: "About",
    hint: "The reading corner — about me",
    camera: [5.6, 2.6, 4.4],
    target: [2.4, 0.8, 1.2],
  },
  {
    id: "twin",
    label: "Digital twin",
    hint: "The hologram — ask me anything",
    camera: [1.2, 2.2, 4.6],
    target: [-1.6, 1.5, 1.0],
  },
];

// The neon sign over the certificates. Clicking it flies in to read it; it has
// no panel and isn't in the dock. The camera frames `width` metres of wall.
export const MOTTO = {
  hint: "The sign — click to read it",
  center: [-3.96, 3.62, -0.65] as Vec3,
  size: [4.2, 1.1] as [number, number],
};

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
