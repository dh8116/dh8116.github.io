import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

// Paragraphs are plain strings, so bare URLs in post text are turned into real
// links here. Links back to this site become client-side routes.
const SITE_ORIGIN = "https://dh8116.github.io";
const URL_PATTERN = /(https?:\/\/[^\s<>()]*[^\s<>().,;:!?])/g;

function ParagraphText({ text }: { text: string }) {
  // String.split with a capture group puts the matched URLs at odd indices.
  const chunks = text.split(URL_PATTERN);

  return (
    <>
      {chunks.map((chunk, i) => {
        if (i % 2 === 0) {
          return chunk;
        }

        const internalPath = chunk.startsWith(SITE_ORIGIN)
          ? chunk.slice(SITE_ORIGIN.length) || "/"
          : null;
        const className =
          "text-brand-blue-light underline underline-offset-4 hover:no-underline";

        return internalPath ? (
          <Link key={i} href={internalPath} className={className}>
            {chunk}
          </Link>
        ) : (
          <a
            key={i}
            href={chunk}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {chunk}
          </a>
        );
      })}
    </>
  );
}

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
          <p key={i}>
            <ParagraphText text={paragraph} />
          </p>
        ))}
      </div>
      {post.image && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-card">
          <Image
            src={post.image}
            alt={post.imageAlt ?? ""}
            width={1200}
            height={900}
            className="h-auto w-full"
          />
        </div>
      )}
    </div>
  );
}
