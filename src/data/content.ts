// One place to ask for content in a language. The English files stay the
// source of truth for structure (slugs, dates, links, images); the .zh files
// only carry copy, and this merges them. A post with no Chinese copy yet falls
// back to English rather than disappearing, and says so at build time.

import type { Lang } from "./i18n";
import {
  site,
  projects,
  aboutCards,
  skills,
  currentlyLearning,
  type AboutCard,
  type CurrentlyItem,
  type Project,
} from "./site";
import {
  siteZh,
  projectsZh,
  projectStatusZh,
  aboutCardsZh,
  skillsZh,
  currentlyLearningZh,
} from "./site.zh";
import { posts, type Post } from "./posts";
import { postsZh } from "./posts.zh";

const untranslated = posts
  .filter((post) => !postsZh[post.slug])
  .map((post) => post.slug);

if (untranslated.length > 0) {
  console.warn(
    `[i18n] no Chinese copy for: ${untranslated.join(", ")} — ` +
      "those posts render in English under /zh."
  );
}

export function getSite(lang: Lang) {
  return lang === "zh" ? { ...site, ...siteZh } : site;
}

export function getProjects(lang: Lang): Project[] {
  if (lang === "en") return projects;
  return projects.map((project) => {
    const copy = projectsZh[project.slug];
    return copy ? { ...project, ...copy } : project;
  });
}

export function getStatusLabel(
  lang: Lang,
  status: NonNullable<Project["status"]>
): string {
  return lang === "zh" ? projectStatusZh[status] : status;
}

export function getAboutCards(lang: Lang): AboutCard[] {
  return lang === "zh" ? aboutCardsZh : aboutCards;
}

export function getSkills(lang: Lang): string[] {
  return lang === "zh" ? skillsZh : skills;
}

export function getCurrentlyLearning(lang: Lang): CurrentlyItem[] {
  return lang === "zh" ? currentlyLearningZh : currentlyLearning;
}

export function getPosts(lang: Lang): Post[] {
  if (lang === "en") return posts;
  return posts.map((post) => {
    const copy = postsZh[post.slug];
    return copy ? { ...post, ...copy } : post;
  });
}

export function getPost(lang: Lang, slug: string): Post | undefined {
  return getPosts(lang).find((post) => post.slug === slug);
}
