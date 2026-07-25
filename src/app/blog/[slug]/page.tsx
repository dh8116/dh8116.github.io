import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return {
    title: post ? `${post.title} — ${site.name}` : site.name,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/blog"
        className="text-sm font-medium text-brand-blue-light hover:underline"
      >
        &larr; Back to blog
      </Link>
      <p className="mt-8 text-xs font-medium uppercase tracking-widest text-zinc-500">
        {post.date}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {post.title}
      </h1>
      <div className="mt-8 flex flex-col gap-4 text-lg leading-relaxed text-zinc-300">
        {post.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
