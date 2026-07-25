export const site = {
  name: "Doria Huang",
  tagline: "AI favourist",
  github: "https://github.com/dh8116/",
  linkedin: "https://www.linkedin.com/in/taoduoer-huang-581693413/",
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  url: string;
  repo: string;
};

export const projects: Project[] = [
  {
    slug: "soulor-ai",
    name: "Soulor AI",
    description:
      "An AI-powered project exploring how intelligent systems can be built and shipped end to end.",
    url: "https://soulor-ai.vercel.app/",
    repo: "https://github.com/dh8116/",
  },
];
