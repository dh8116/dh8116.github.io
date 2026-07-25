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
    title: "Introduction",
    date: "2026-07-25",
    excerpt:
      "An opening note on the purpose of this site and the writing that will appear here.",
    paragraphs: [
      "This site serves as a record of ongoing work, chiefly the development of Soulor AI, and as a venue for writing that documents design decisions, open problems, and findings as they arise, rather than leaving them undocumented.",
      "Future entries will follow this same aim: to state a problem clearly, describe the reasoning applied to it, and report what was learned.",
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
