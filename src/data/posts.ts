// Post structure and ordering. The posts themselves live in posts.json.
//
// They used to be written inline here as a typed array. They moved out so
// /admin can rewrite them through the GitHub API: a browser can safely
// round-trip JSON, and cannot safely round-trip TypeScript source. This file
// still owns the type and the sort, so nothing downstream changed.

import rawPosts from "./posts.json";

export type Post = {
  slug: string;
  title: string;
  date: string;
  // "kernel" posts are grouped separately on /blog; anything else is general.
  category?: "kernel";
  excerpt: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
};

// JSON widens every string to `string`, so `category` arrives too wide to be a
// Post. Normalising it here — rather than asserting — means a hand-edited or
// admin-written category that isn't "kernel" degrades to an ordinary post
// instead of type-lying about itself.
type RawPost = Omit<Post, "category"> & { category?: string };

const unsortedPosts: Post[] = (rawPosts as RawPost[]).map(
  ({ category, ...post }) => ({
    ...post,
    ...(category === "kernel" ? { category } : {}),
  })
);

// posts.json is in the order each post was written, so on a same-date tie the
// later-written post (further down the file) should still sort as more recent.
export const posts: Post[] = unsortedPosts
  .map((post, writeOrder) => ({ post, writeOrder }))
  .sort(
    (a, b) =>
      b.post.date.localeCompare(a.post.date) || b.writeOrder - a.writeOrder
  )
  .map(({ post }) => post);
