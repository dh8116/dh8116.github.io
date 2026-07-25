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
    excerpt:
      "Kicking off this blog — a placeholder post to get the layout in place.",
    paragraphs: [
      "This is a placeholder first post. Replace the content in src/data/posts.ts with your own writing.",
      "Each post is just an entry in that file — a slug, a title, a date, and a list of paragraphs. No CMS, no database, just data you edit directly.",
    ],
  },
  {
    slug: "building-soulor-ai",
    title: "Building Soulor AI",
    date: "2026-07-25",
    excerpt: "Notes on building an AI product from idea to deployment.",
    paragraphs: [
      "This is a placeholder second post. Swap this in for real notes on building Soulor AI, lessons learned, and what's next.",
    ],
  },
];
