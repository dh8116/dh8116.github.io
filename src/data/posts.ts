export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
};

export const posts: Post[] = [
  {
    slug: "hello-world",
    title: "Hello, world",
    date: "2026-07-25",
    excerpt: "Starting this site as a place to put my projects and writing.",
    paragraphs: [
      "Hi, I'm Doria — this is a spot for me to put what I'm working on and write down thoughts as I go, instead of letting them stay scattered across notes and half-finished docs.",
      "Expect a mix of things here: math modelling, AI tools, whatever project I'm currently deep in, and probably some tangents too.",
    ],
  },
  {
    slug: "what-is-soulor-ai",
    title: "What Is Soulor AI",
    date: "2026-07-25",
    excerpt:
      "Soulor AI is a companion and social simulation platform — not just a chat buddy, but a space to build relationships and rehearse them.",
    paragraphs: [
      "Soulor AI is a companion and social simulation platform — not just a chat buddy, but a space to build relationships and rehearse them.",
      "The companion side remembers you: your name, your mood, running jokes, the people in your life — surfaced naturally, unprompted. Each companion has its own personality and avatar, and the relationship evolves through five stages, from Stranger to Soulmate, as affection, trust, and intimacy build over time.",
      "The simulation side is further useful: Simulate mode lets you roleplay with fully custom agents (name, personality, backstory), and Storytelling mode takes one real situation and runs it through 7 different AI perspectives simultaneously — useful for rehearsing a hard conversation or just seeing an angle you missed. Voice/video calls with a live animated face, a Support mode for emotional check-ins, and a wellness layer (journaling, habits, guided breathing) round it into something built for daily use, not a one-off gimmick.",
      "A working version is available at soulor-ai.vercel.app.",
    ],
  },
  {
    slug: "writing-my-first-gpu-kernel",
    title: "Writing My First GPU Kernel",
    date: "2026-07-26",
    excerpt:
      "Built my first Triton kernel today (vector add), following the official tutorial. Correctness confirmed, and it matches PyTorch's throughput almost exactly on a T4 GPU.",
    paragraphs: [
      "Built my first Triton kernel today (vector add), following the official tutorial. Correctness confirmed (max diff = 0.0 vs PyTorch), and it matches PyTorch's throughput almost exactly on a T4 GPU.",
      "Next: a kernel where there's actual room to beat the baseline (softmax).",
    ],
    image: "/blog/triton-vector-add-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and PyTorch throughput (GB/s) across vector sizes from 10^4 to 10^8 elements, showing the two lines closely overlapping and plateauing around 240 GB/s.",
  },
];
