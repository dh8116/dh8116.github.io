export const site = {
  name: "Doria H",
  firstName: "Doria",
  lastName: "H",
  tagline: "Building AI that remembers",
  status: "Year 11 Student",
  location: "Auckland, New Zealand",
  bio: "Year 11 student building AI companion and simulation projects, with a background in mathematical modelling competitions and AI-assisted development.",
  github: "https://github.com/dh8116/",
  x: "https://x.com/RicaV42",
  avatar: "/avatar.jpeg",
};

export type Project = {
  slug: string;
  name: string;
  status?: "Live" | "In development";
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    slug: "soulor-ai",
    name: "Soulor AI",
    description:
      "An AI companion and social simulation application. Exploring LLM orchestration, fallback routing, and real-time narrative response design, with features like likeability scoring, coach analysis, and persistent chat history.",
    tags: ["Node.js", "Express", "LLM Orchestration", "Claude Code"],
    url: "https://soulor-ai.vercel.app/",
  },
  {
    slug: "vnportal",
    name: "VNportal",
    status: "In development",
    description:
      "A full-stack vinyl music web portal with real-time audio via the Web Audio API, Spotify SDK, and Jamendo — multi-deck mixing, beat sequencing, and multitrack DAW export, backed by Supabase auth and hardened with CSP, XSS escaping, and rate limiting.",
    tags: ["Web Audio API", "Supabase", "Spotify SDK", "Playwright"],
    url: "https://vnportal.vercel.app/",
  },
];

export type AboutCard = {
  period: string;
  title: string;
  description: string;
};

export const aboutCards: AboutCard[] = [
  {
    period: "2026 – 2028 · Auckland",
    title: "Year 11 Student",
    description:
      "Studying while building AI products on the side, regularly producing structured mathematical and analytical reports for coursework.",
  },
  {
    period: "Competition",
    title: "Mathematical Modelling",
    description:
      "Co-authored mathematical modelling papers analyzing real-world problems under competition deadlines — research, assumptions, models, and written findings, refined with a team.",
  },
  {
    period: "Ongoing",
    title: "Building with AI tools",
    description:
      "Using Claude Code, ChatGPT, and GitHub Copilot to prototype ideas, solve problems, and ship projects like Soulor AI and VNportal.",
  },
  {
    period: "Volunteer",
    title: "Math Competition Community",
    description:
      "Accepted as a volunteer in Technology, Design, and Problem Writing, contributing technical skills, creative thinking, and mathematical problem-solving experience.",
  },
];

export const skills: string[] = [
  "Strong Written Communication",
  "Technical Report Writing",
  "Detail-Oriented Review & Testing",
  "Problem Solving & Research",
  "QA Mindset",
  "Technical Documentation",
  "Product Thinking",
  "AI-Assisted Development",
];
