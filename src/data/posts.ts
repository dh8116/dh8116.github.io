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
      "Soulor AI is a companion platform built around one idea: an AI that actually remembers you.",
    paragraphs: [
      "Soulor AI is a companion platform built around one idea: an AI that actually remembers you — your name, your mood, the running jokes, the people in your life — and brings it up naturally, unprompted.",
      "Each companion you create has its own personality, vibe, and avatar, and the relationship evolves over time — affection, trust, and intimacy scores move you through five stages, from Stranger to Soulmate. Facts from your conversations get extracted automatically and woven back into future chats, so continuity is the default, not something you have to re-explain.",
      "Beyond text, it supports live voice/video calls with an animated companion face, a Simulate mode for custom-character roleplay, a Storytelling mode that reacts to one situation from 7 AI perspectives at once, and a Support mode tuned for emotional check-ins. A lighter wellness layer — journaling, habit streaks, guided breathing — rounds it out as something meant for daily use, not a one-off novelty.",
      "A working version is available at soulor-ai.vercel.app.",
    ],
  },
];
