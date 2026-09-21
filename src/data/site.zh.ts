// Chinese copy for everything in site.ts. Shapes mirror the English source so
// content.ts can merge the two without either side knowing about the other;
// slugs, links, dates and images stay language-neutral and live only in site.ts.
//
// The copy itself lives in site.zh.json — see site.ts for why.

import raw from "./site.zh.json";
import type { AboutCard, CurrentlyItem, Project } from "./site";

export const siteZh = raw.siteZh;

export const projectStatusZh: Record<NonNullable<Project["status"]>, string> =
  raw.projectStatusZh;

type ProjectCopy = { description: string; tags: string[] };

export const projectsZh: Record<string, ProjectCopy> = raw.projectsZh;

export const aboutCardsZh: AboutCard[] = raw.aboutCardsZh;

export const skillsZh: string[] = raw.skillsZh;

export const currentlyLearningZh: CurrentlyItem[] = raw.currentlyLearningZh;
