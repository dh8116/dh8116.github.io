// Chinese copy for every post in posts.ts, keyed by slug. Slug, date, category
// and image stay in posts.ts — the two languages share one set of URLs, so a
// post is the same post in both and the header toggle can swap between them.
//
// Links back to this site point at /zh/... so a Chinese reader following one
// stays in Chinese; the post renderer turns those into client-side routes.
//
// The copy itself lives in posts.zh.json, for the same reason posts.json
// exists: /admin writes it, and JSON is what a browser can safely rewrite.

import rawPostsZh from "./posts.zh.json";
import type { Post } from "./posts";

export type PostCopy = Pick<Post, "title" | "excerpt" | "paragraphs"> & {
  imageAlt?: string;
};

export const postsZh: Record<string, PostCopy> = rawPostsZh;
