import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Blog — ${site.name}`,
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <div className="mt-10 flex flex-col gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-white/10 p-6 transition-colors hover:border-brand-yellow/50"
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
