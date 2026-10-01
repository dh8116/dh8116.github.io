// The resume as text, transcribed from public/resume.pdf — that PDF (exported
// from the Google Doc) is the source of truth, so change it first and mirror it
// here. Inline links use [label](url).

export type ResumeLine = { label?: string; text: string };

export type ResumeSection = {
  heading: string;
  intro?: string;
  lines?: ResumeLine[];
  bullets?: string[];
  groups?: { title: string; bullets: string[] }[];
};

export const resume: {
  name: string;
  contact: string[];
  links: string[];
  sections: ResumeSection[];
} = {
  name: "Richael",
  contact: [
    "Auckland, New Zealand",
    "[huangd6666@gmail.com](mailto:huangd6666@gmail.com)",
  ],
  links: [
    "[dh8116.github.io](https://dh8116.github.io)",
    "[github.com/dh8116](https://github.com/dh8116)",
    "[x.com/RicaV42](https://x.com/RicaV42)",
  ],
  sections: [
    {
      heading: "Profile",
      intro:
        "A student building GPU kernels, fine-tuned language models, and full-stack applications with real users. Nine Triton kernels benchmarked against PyTorch over nine consecutive weeks, each published with its numbers; a fine-tuned Qwen3-14B serving in production behind vLLM, leading the provider chain and answering faster than the model it replaced.",
    },
    {
      heading: "Education",
      lines: [
        { text: "Year 11, Auckland, New Zealand. Expected graduation 2028" },
        {
          label: "Relevant coursework",
          text: "IB Math AA HL, NCEA level 1 (planning for AP calculus & cs exams next year)",
        },
      ],
    },
    {
      heading: "Technical Skills",
      lines: [
        {
          label: "GPU & ML",
          text: "Triton, PyTorch, Python, GPU benchmarking and profiling, LoRA fine-tuning, vLLM, Modal, eval harnesses",
        },
        {
          label: "Full-stack",
          text: "TypeScript, Node.js, Express, Next.js, React, Supabase/Postgres, Web Audio API, Stripe",
        },
        {
          label: "Practice",
          text: "Git, GitHub Actions, Playwright end-to-end testing, web security hardening (CSP, XSS)",
        },
      ],
    },
    {
      heading: "GPU Systems & Optimization",
      intro: "One Triton kernel per week, benchmarked against PyTorch.",
      bullets: [
        "Cut fused cross-entropy to 15.90 ms against PyTorch's 24.03 ms at vocab 131,072 (1.51x), at 1.67x less peak memory, by collapsing five live copies of the logits tensor to three.",
        "Raised fused softmax from ~55 GB/s to ~230 GB/s, and established T4's ~240 GB/s practical ceiling by measurement.",
      ],
    },
    {
      heading: "Distributed AI Infrastructure & Dispatch",
      bullets: [
        "Fine-tuned Qwen3-14B with LoRA on a 1,526-row corpus spanning five generation paths in six languages; achieving full performance for $1.30 of compute.",
        "Deployed optimized cold-start vLLM architecture, leading the production chain at 2.3–4.1s against the original 5.7s model.",
        "Built warm-gate routing: the gateway probes for a warm container and the probe doubles as the warm-up, so a 108 s cold start never reaches a user.",
        "Fine-tuned MusicGen-small for bar-locked stems, built the eval harness scoring clips as production.",
      ],
    },
    {
      heading: "Projects",
      groups: [
        {
          title: "Soulor AI — [soulor-ai.vercel.app](https://soulor-ai.vercel.app/)",
          bullets: [
            "A regional-variant companion and multi-perspective simulation app with cross-session memories and full relationship stages. Also serving as a great tool for daily reminders and wellness enhancement.",
            "Cross-Mode Engine | Relationship Staging | Bias Adaptation | Stateful Sampling",
          ],
        },
        {
          title: "VNportal — [vnportal.vercel.app](https://vnportal.vercel.app/)",
          bullets: [
            "A vinyl and music community platform for creation, recreation, and discussion, promoting innovative music creation with AI-assistance.",
            "Controllable Audio Synthesis | Onset Charting | Source Cascade | Stem Synthesis",
          ],
        },
        {
          title: "Personal website — [dh8116.github.io](https://dh8116.github.io)",
          bullets: [
            "A central hub sharing my skills, projects, current development stages, and blog writings.",
            "Next.js static export | Hreflang Sitemap | Postbuild CSP.",
          ],
        },
      ],
    },
    {
      heading: "Research & Writing",
      bullets: [
        "Leading a five-person-team paper on RLVR verifier persistence: when a persistently wrong verifier harms GRPO training. Targeting COLM/TMLR.",
        "Publishing general and kernel writeups at [dh8116.github.io/blog](https://dh8116.github.io/blog); co-authored several modelling papers for HiMCM and IMMC.",
      ],
    },
    {
      heading: "Awards & Volunteering",
      bullets: [
        "Score 10/15, AIME (American Invitational Mathematics Examination) | Honor Roll (Top 5%), AMC 12 (The American Mathematics Competition 12) | High Distinction, AUSAMC (Australian Mathematics Competition)",
        "Honorable Mention, HiMCM (High School Mathematical Contest in Modeling)",
        "Honorable Mention, IMMC regional (International Mathematical Modeling Challenge Regional Round)",
        "Volunteer, Mustang Math Community — Technology and Curriculum Development",
      ],
    },
  ],
};
