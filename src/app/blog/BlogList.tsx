"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";

type SortOrder = "desc" | "asc";
type Tab = "general" | "kernel";

const TABS: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "kernel", label: "Kernel" },
];

export default function BlogList({ posts }: { posts: Post[] }) {
  const [order, setOrder] = useState<SortOrder>("desc");
  const [tab, setTab] = useState<Tab>("general");

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) =>
      tab === "kernel" ? post.category === "kernel" : post.category !== "kernel"
    );
    const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date));
    return order === "desc" ? sorted : sorted.reverse();
  }, [posts, order, tab]);

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

      <div className="mt-8 grid grid-cols-2 border-b border-white/10">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`-mb-px border-b-2 py-3 text-center text-sm font-semibold transition-colors ${
              tab === id
                ? "border-brand-blue-light text-brand-blue-light"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {visiblePosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-white/10 p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-yellow/50 hover:shadow-xl hover:shadow-brand-yellow/10"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {post.date}
            </p>
            <h2 className="mt-2 text-xl font-semibold group-hover:text-brand-yellow">
              {post.title}
            </h2>
            <p className="mt-2 text-zinc-400">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
