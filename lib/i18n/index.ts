// ─────────────────────────────────────────────────────────────────────────────
//  English and Vietnamese. The language is a cookie (LOCALE_COOKIE), so links
//  stay the same in both: a published CV at /scene/<slug> works for everyone.
//  Server code reads it with lib/i18n/server.ts; client code with useT().
// ─────────────────────────────────────────────────────────────────────────────

import type { Design } from "@/lib/designs";
import type { Place } from "@/lib/places";
import { en, type Dict } from "./en";
import { vi } from "./vi";

export type { Dict };
export type Locale = "en" | "vi";

export const LOCALES: Locale[] = ["en", "vi"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

const DICTS: Record<Locale, Dict> = { en, vi };

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "vi";
export const dictFor = (locale: Locale) => DICTS[locale];

// From an Accept-Language header: the first language we have, else English.
export function localeFromHeader(header: string | null | undefined): Locale {
  for (const part of (header ?? "").split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

// A place or colour design with its words in this language.
export const placeIn = (t: Dict, place: Place): Place => ({ ...place, ...t.places[place.id] });
export const designIn = (t: Dict, design: Design): Design => ({
  ...design,
  ...t.designs[design.id as keyof Dict["designs"]],
});

// "Sakura coffee shop" / "Quán cà phê Sakura", from a place and design already in this language.
export const lookNameIn = (t: Dict, place: Place, design: Design) => t.lookName(place.noun, design.name);

// "14 November 2026" / "14 tháng 11, 2026"
export const longDate = (t: Dict, date: Date) =>
  date.toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" });
