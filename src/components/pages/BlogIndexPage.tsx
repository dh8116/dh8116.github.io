import BlogList from "@/app/blog/BlogList";
import { getPosts } from "@/data/content";
import type { Lang } from "@/data/i18n";

export default function BlogIndexPage({ lang }: { lang: Lang }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <BlogList posts={getPosts(lang)} lang={lang} />
    </div>
  );
}
