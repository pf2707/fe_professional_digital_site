// ─────────────────────────────────────────────────────────────────────────────
//  The places a CV can be: each is its own 3D scene, with every CV section on
//  an object that fits it. A place is picked separately from its colours
//  (lib/designs.ts): every colour design works in every place.
// ─────────────────────────────────────────────────────────────────────────────

import type { Design } from "./designs";
import type { SectionId } from "./profile";

export type PlaceId = "room" | "cafe" | "park" | "shop";

export type Place = {
  id: PlaceId;
  name: string; // "Coffee shop"
  noun: string; // after the colour name: "Sakura coffee shop"
  blurb: string;
  drawer: string; // what holds each archive label: "Cabinet drawer", "Recipe card"
  // The object each section lives on, as the hover label names it.
  objects: Record<SectionId, string>;
};

export const PLACES: Place[] = [
  {
    id: "room",
    name: "Studio",
    noun: "studio",
    blurb: "A home office: desk, server rack, corkboard and a reading corner.",
    drawer: "Cabinet drawer",
    objects: {
      work: "The monitor",
      stack: "The agent rack",
      certs: "The frames",
      career: "The corkboard",
      archive: "The cabinet",
      about: "The reading corner",
      twin: "The hologram",
    },
  },
  {
    id: "cafe",
    name: "Coffee shop",
    noun: "coffee shop",
    blurb: "A corner café: chalkboard menu, jars on the shelves, an armchair by the counter.",
    drawer: "Recipe card",
    objects: {
      work: "The chalkboard menu",
      stack: "The jar shelves",
      certs: "The award frames",
      career: "The photo wall",
      archive: "The recipe box",
      about: "The armchair corner",
      twin: "The hologram barista",
    },
  },
  {
    id: "park",
    name: "Park",
    noun: "park",
    blurb: "A pocket park: notice board, flower beds, a garden shed and a bench under the lamp.",
    drawer: "Shed box",
    objects: {
      work: "The notice board",
      stack: "The flower beds",
      certs: "The plaques",
      career: "The signpost",
      archive: "The garden shed",
      about: "The bench",
      twin: "The fountain hologram",
    },
  },
  {
    id: "shop",
    name: "Shop",
    noun: "shop",
    blurb: "A corner shop: a poster in the window, stocked shelves, the till and the stockroom.",
    drawer: "Stockroom box",
    objects: {
      work: "The shop window",
      stack: "The product shelves",
      certs: "The licences",
      career: "The clock and calendar",
      archive: "The stockroom boxes",
      about: "The owner's counter",
      twin: "The hologram assistant",
    },
  },
];

export const DEFAULT_PLACE = PLACES[0];

export const placeById = (id: string | undefined) => PLACES.find((p) => p.id === id) ?? DEFAULT_PLACE;

// "Sakura coffee shop", "Night studio".
export const lookName = (place: Place, design: Design) => `${design.name} ${place.noun}`;

// A section's hover label in this place. CVs write hints for the studio, like
// "The monitor — AI projects"; elsewhere the object's name replaces the part
// before the dash.
export function hintIn(place: Place, id: SectionId, hint: string) {
  if (place.id === "room") return hint;
  const what = hint.split(/\s+[—–-]\s+/).pop()?.trim();
  return what && what !== hint.trim() ? `${place.objects[id]} — ${what}` : place.objects[id];
}
