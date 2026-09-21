// Site identity, projects, about cards, skills and the "currently" list.
//
// The values live in site.json so /admin can rewrite them through the GitHub
// API; this file keeps the types and the exported shape, which is what every
// component and content.ts actually imports.

import raw from "./site.json";

export const site = raw.site;

export type Project = {
  slug: string;
  name: string;
  status?: "Live" | "In development";
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
};

// Same normalisation as posts.ts: JSON widens `status` to `string`, and an
// unrecognised status degrades to no status rather than being asserted into
// one of the two the UI knows how to label.
type RawProject = Omit<Project, "status"> & { status?: string };

const isStatus = (s?: string): s is NonNullable<Project["status"]> =>
  s === "Live" || s === "In development";

export const projects: Project[] = (raw.projects as RawProject[]).map(
  ({ status, ...project }) => ({
    ...project,
    ...(isStatus(status) ? { status } : {}),
  })
);

export type AboutCard = {
  period: string;
  title: string;
  description: string;
};

export const aboutCards: AboutCard[] = raw.aboutCards;

export const skills: string[] = raw.skills;

export type CurrentlyItem = {
  label: string;
  title: string;
  detail: string;
};

export const currentlyLearning: CurrentlyItem[] = raw.currentlyLearning;
