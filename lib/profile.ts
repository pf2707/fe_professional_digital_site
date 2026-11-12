// ─────────────────────────────────────────────────────────────────────────────
//  Website content. The data itself lives in data/profile.json and is edited
//  from /admin (run `npm run dev`). The AI digital twin's private knowledge is
//  separate: data/twin-knowledge.json, read on the server only (lib/twin.ts).
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
  avatar: string; // path in public/, or "" for initials
  title: string;
  subtitle: string; // under the name in the studio header
  tagline: string;
  available: boolean;
  location: string;
  email: string;
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
    neon: string; // the neon sign above the certificates
    terminal: string[]; // lines typed on the monitor
    drawers: string[]; // filing cabinet drawer labels, top to bottom
    sections: Record<SectionId, SectionCopy>;
  };
  twin: {
    greeting: string;
    suggestions: string[];
  };
};

export const profile = data as Profile;

export const liveGroups = () => profile.projectGroups.filter((g) => !g.archived);
export const archivedGroups = () => profile.projectGroups.filter((g) => g.archived);
