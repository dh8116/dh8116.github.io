export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
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
      "An overview of Soulor AI as an AI companion and simulation system, and the design tension at its core.",
    paragraphs: [
      "Soulor AI is a project concerned with AI companionship and simulation: providing an AI presence that persists and develops across repeated interactions, in contrast to a stateless conversational session that resets each time.",
      "The two components — companion and simulation — pose distinct requirements that must nonetheless be satisfied jointly. The companion component requires local consistency: responses must be coherent and appropriately responsive within a given exchange. The simulation component requires global continuity: the system must maintain state and an underlying model of the world the companion is understood to inhabit. Satisfying both requirements simultaneously is the central design problem, and is the current focus of development.",
      "A working version is available at soulor-ai.vercel.app. Subsequent posts will report on specific aspects of this problem as the project progresses.",
    ],
  },
];
