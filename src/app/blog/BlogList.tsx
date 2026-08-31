"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";

type SortOrder = "desc" | "asc";

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-white/10 p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-yellow/50 hover:shadow-xl hover:shadow-brand-yellow/10"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        {post.date}
      </p>
      <h3 className="mt-2 text-xl font-semibold group-hover:text-brand-yellow">
        {post.title}
      </h3>
      <p className="mt-2 text-zinc-400">{post.excerpt}</p>
    </Link>
  );
}

function PostSection({ title, posts }: { title: string; posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue-light">
        {title}
      </h2>
      <div className="mt-6 flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const [order, setOrder] = useState<SortOrder>("desc");

  const { general, kernel } = useMemo(() => {
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    const ordered = order === "desc" ? sorted : sorted.reverse();
    return {
      general: ordered.filter((p) => p.category !== "kernel"),
      kernel: ordered.filter((p) => p.category === "kernel"),
    };
  }, [posts, order]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <button
          type="button"
          onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-brand-blue-light hover:text-brand-blue-light"
        >
          {order === "desc" ? "Latest → Earliest" : "Earliest → Latest"}
        </button>
      </div>
      <PostSection title="General" posts={general} />
      <PostSection title="Kernels" posts={kernel} />
    </div>
  );
}
