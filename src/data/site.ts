export const site = {
  name: "Richael",
  firstName: "Richael",
  lastName: "",
  tagline: "Building AI that remembers",
  status: "AI & GPU Systems",
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
      "Soulor is a companion app that remembers you. Each companion carries its own personality and voice, and the relationship moves through five stages from stranger to soulmate as affection, trust and intimacy build — that state reaches generation itself, so a companion's way of speaking shifts as it comes to know you. The same engine runs simulation modes, where one real situation can be walked through from several perspectives at once, which makes it a place to rehearse a hard conversation before having it for real.",
    tags: [
      "Memory Drives Sampling",
      "Five-Stage Relationship Arc",
      "Bias Learned From Edits",
      "One Engine, Every Mode",
    ],
    url: "https://soulor-ai.vercel.app/",
  },
  {
    slug: "vnportal",
    name: "VNportal",
    description:
      "VNportal is a vinyl and music platform built on real-time audio. Find a record, play what sits behind it, then mix it across two decks, chop it into a DAW, or drop into a rhythm game charted from the track's own detected beats — everything downstream is made out of the audio that actually loaded. It writes sound of its own too: ask for one instrument at a tempo and key you set, and what comes back is bar-locked and loops cleanly, a part you place rather than a finished song.",
    tags: [
      "Charts From Detected Beats",
      "One Audio Source, Every Mode",
      "One Instrument at a Time",
      "Tempo as Token Budget",
    ],
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
