// ─────────────────────────────────────────────────────────────────────────────
//  Colour designs. Each is a palette for any place (lib/places.ts): walls,
//  floor, wood, metal, the two accent lights (lamps + screens/hologram) and
//  the sky behind the diorama. A CV picks a place and a colour design in
//  /scene/admin (profile.studio.place, .design); /scene lets visitors try them.
// ─────────────────────────────────────────────────────────────────────────────

export type Palette = {
  wall: string;
  wallNight: string;
  floor: string;
  base: string; // the plinth under the room
  wood: string;
  woodDark: string;
  metal: string;
  amber: string; // warm accent: lamps, phone rings, rack LEDs
  teal: string; // cool accent: monitor glow, neon sign, hologram
  velvet: string; // armchair
  rug: string;
};

export type Design = {
  id: string;
  name: string;
  blurb: string;
  palette: Palette;
  // Page background behind the room: [top, middle, bottom].
  sky: { night: [string, string, string]; day: [string, string, string] };
};

export const DESIGNS: Design[] = [
  {
    id: "studio",
    name: "Night",
    blurb: "Warm wood, teal screens, amber lamps.",
    palette: {
      wall: "#d6cbbb",
      wallNight: "#b7ab9b",
      floor: "#6e4a33",
      base: "#1d2a44",
      wood: "#7a4e35",
      woodDark: "#4a2f20",
      metal: "#2a3245",
      amber: "#f5a945",
      teal: "#38d1c0",
      velvet: "#355c4a",
      rug: "#2c4a5c",
    },
    sky: { night: ["#0f1b33", "#241f45", "#46304f"], day: ["#bcd3e6", "#dce6ec", "#efe2cf"] },
  },
  {
    id: "sakura",
    name: "Sakura",
    blurb: "Blush walls, pale oak, pink neon.",
    palette: {
      wall: "#f0dcdc",
      wallNight: "#c9adb3",
      floor: "#b48a66",
      base: "#3a2838",
      wood: "#b0825a",
      woodDark: "#6e4c37",
      metal: "#3d3743",
      amber: "#ffb08a",
      teal: "#ff7eb0",
      velvet: "#8ea487",
      rug: "#a9566a",
    },
    sky: { night: ["#2a1830", "#4a2742", "#7a3d55"], day: ["#f6d9df", "#fbe9ea", "#f3e3cf"] },
  },
  {
    id: "cyber",
    name: "Cyber",
    blurb: "Midnight walls, cyan and magenta light.",
    palette: {
      wall: "#3a3f63",
      wallNight: "#2a2d4a",
      floor: "#20223a",
      base: "#0c0d1c",
      wood: "#3b4064",
      woodDark: "#262a45",
      metal: "#4b5276",
      amber: "#ff5fd2",
      teal: "#3cf2ff",
      velvet: "#5b3fa3",
      rug: "#1f2550",
    },
    sky: { night: ["#06071a", "#140f3a", "#2c0f45"], day: ["#8f9fd6", "#b8c0e8", "#d9c6ec"] },
  },
  {
    id: "forest",
    name: "Forest",
    blurb: "Pine, moss-green light, a warm glow.",
    palette: {
      wall: "#cdb894",
      wallNight: "#a8946f",
      floor: "#5a3a22",
      base: "#1f2a1c",
      wood: "#8c5b33",
      woodDark: "#4e311b",
      metal: "#2f3a2c",
      amber: "#ffb347",
      teal: "#8ee07a",
      velvet: "#7a3a2c",
      rug: "#3e5a3a",
    },
    sky: { night: ["#0e1a14", "#1d2d22", "#3a3a2a"], day: ["#c4dbc7", "#e2eadb", "#efe3c8"] },
  },
];

export const DEFAULT_DESIGN = DESIGNS[0];

export const designById = (id: string | undefined) => DESIGNS.find((d) => d.id === id) ?? DEFAULT_DESIGN;
