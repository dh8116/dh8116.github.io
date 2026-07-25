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
      "This is the first post on this site. I built it as a home base for what I'm working on — mainly Soulor AI right now — and a place to write down thoughts as I go, instead of letting them stay scattered.",
      "More to come as there's more to say.",
    ],
  },
  {
    slug: "what-is-soulor-ai",
    title: "What is Soulor AI",
    date: "2026-07-25",
    excerpt:
      "Soulor AI is an AI companion and simulation project — a quick look at what that means.",
    paragraphs: [
      "Soulor AI is a project I'm building around AI companionship and simulation: giving people an AI presence they can interact with over time, rather than a one-off chat that resets every session.",
      "Companion and simulation are two different problems that end up tangled together. A companion has to feel consistent and responsive in the moment. A simulation has to hold state, continuity, and some notion of a world the companion exists in. Getting both right at once is the hard part, and it's the part I'm spending most of my time on.",
      "You can try the live version at soulor-ai.vercel.app — I'll write more here as the project moves forward.",
    ],
  },
];
