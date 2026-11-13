// ─────────────────────────────────────────────────────────────────────────────
//  The shape of one CV. Published CVs live in the database (lib/cv-store.ts);
//  the sample shown on /scene is data/profile.json. Each CV's digital twin
//  knowledge is separate and only ever read on the server (lib/twin.ts).
// ─────────────────────────────────────────────────────────────────────────────

import data from "@/data/profile.json";

export type Stat = { value: string; label: string };
export type Experience = { period: string; role: string; org: string; summary: string };
export type SkillGroup = {
  group: string;
  items: string[];
  archived?: boolean; // filed in the cabinet instead of the rack
};
export type Certificate = {
  title: string;
  issuer: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  note?: string;
  badge?: string; // short text on the certificate's seal
};
export type ProjectGroup = {
  key: string;
  label: string;
  archived?: boolean; // shown in the cabinet instead of on the monitor
};
export type Project = { category: string; icon: string; name: string; description: string };
export type Social = { label: string; title: string; href: string };

export type SectionId = "work" | "stack" | "certs" | "career" | "archive" | "about" | "twin";
export type SectionCopy = {
  label: string; // dock button
  hint: string; // hover label on the 3D object
  title: string; // panel heading
  lede: string; // panel intro
};

export type Profile = {
  name: string;
  initials: string;
  avatar: string; // a path in public/ or a data: URL, or "" for initials
  title: string;
  subtitle: string; // under the name in the studio header
  tagline: string;
  available: boolean;
  location: string;
  email: string;
  phone: string; // the telephone on the cabinet dials this; "" hides it
  languages: string;
  stats: Stat[];
  about: string[];
  experience: Experience[];
  skills: SkillGroup[];
  certificates: Certificate[];
  projectGroups: ProjectGroup[];
  projects: Project[];
  socials: Social[];
  studio: {
    design?: string; // a room design id from lib/designs.ts
    neon: string; // the neon sign above the certificates; one line per row
    terminal: string[]; // lines typed on the monitor
    drawers: string[]; // filing cabinet drawer labels, top to bottom
    sections: Record<SectionId, SectionCopy>;
  };
  twin: {
    enabled?: boolean; // false hides the hologram and the chat
    greeting: string;
    suggestions: string[];
  };
};

// Edited in /scene/scene/admin → Digital twin. `sources` are free-form documents (CV,
// LinkedIn export, project lists…); `rules` are extra person-specific instructions.
export type TwinKnowledge = {
  currentGoal: string;
  summary: string;
  sources: { title: string; content: string }[];
  rules: string;
};

// Everything a CV is made of: the public profile + the twin's private knowledge.
export type CvContent = { profile: Profile; knowledge: TwinKnowledge };

// The sample CV on /scene and /cv.
export const sampleProfile = data as Profile;

export const liveGroups = (p: Profile) => p.projectGroups.filter((g) => !g.archived);
export const archivedGroups = (p: Profile) => p.projectGroups.filter((g) => g.archived);
export const twinEnabled = (p: Profile) => p.twin.enabled !== false;
