export const site = {
  name: "Richael",
  firstName: "Richael",
  lastName: "",
  tagline: "Building AI that remembers",
  status: "Year 11 Student",
  location: "Auckland, New Zealand",
  bio: "Year 11 student building AI companion apps, full-stack web platforms, and GPU kernels, with a background in mathematical modelling competitions and AI-assisted development.",
  email: "huangd6666@gmail.com",
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
    tags: ["Node.js", "Express", "LLM Orchestration", "Supabase"],
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
    title: "AI Research & Development",
    description:
      "Using tools like Claude, VS Code, and Google Colab to read frontier model papers, build GPU kernels, solve real-world problems, and ship web apps.",
  },
  {
    period: "Volunteer",
    title: "Worldwide Math Community",
    description:
      "Volunteering in Mustang Math Community in Technology and Curriculum Development, contributing technical skills, creative thinking, and mathematical problem-solving experience.",
  },
];

export const skills: string[] = [
  "Triton GPU Kernels",
  "PyTorch",
  "GPU Benchmarking & Profiling",
  "LLM Fine-Tuning (LoRA)",
  "Model Serving (vLLM, Modal)",
  "LLM Orchestration & Fallback Routing",
  "Full-Stack TypeScript (Next.js, Express)",
  "Supabase & Postgres",
  "Real-Time Web Audio",
  "Mathematical Modelling",
  "Technical Writing",
  "AI-Assisted Development",
];

export type CurrentlyItem = {
  label: string;
  title: string;
  detail: string;
};

export const currentlyLearning: CurrentlyItem[] = [
  {
    label: "Reading",
    title: "Kimi K3 technical report",
    detail:
      "At Part 10 of a part-by-part read — through KDA and attention residuals, Stable LatentMoE, and into post-training. Part 11 is on building trustworthy rewards, which runs straight into the research below.",
  },
  {
    label: "Building",
    title: "Triton GPU kernels",
    detail:
      "Week 7 done: cross-entropy with forward and backward fused into one kernel — 1.51x faster and 1.67x less peak memory at vocab 131072, and the first genuinely fair baseline of the track. Week 8 folds the linear layer in to stop materialising the logits at all.",
  },
  {
    label: "Next up",
    title: "RLVR verifier research",
    detail:
      "A paper on when a persistently wrong verifier actually harms GRPO training — holding error rate and asymmetry fixed, sweeping persistence, and mapping the ground between two published results that disagree.",
  },
];
