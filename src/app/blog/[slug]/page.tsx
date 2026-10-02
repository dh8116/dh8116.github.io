import type { Metadata } from "next";
import BlogPostPage from "@/components/pages/BlogPostPage";
import { getPost } from "@/data/content";
import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost("en", slug);
  return {
    title: post ? `${post.title} — ${site.name}` : site.name,
    description: post?.excerpt,
    openGraph: post
      ? {
          type: "article",
          title: post.title,
          description: post.excerpt,
          publishedTime: post.date,
          ...(post.image ? { images: [post.image] } : {}),
        }
      : undefined,
    alternates: alternates(`/blog/${slug}`, "en"),
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage lang="en" slug={slug} />;
}
