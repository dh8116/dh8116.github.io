import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";
import { localePath } from "@/data/i18n";

const ORIGIN = "https://dh8116.github.io";

// Required for a route handler under output: "export".
export const dynamic = "force-static";

// robots.txt has always pointed at /sitemap.xml. Now that every page exists in
// two languages, listing both with their alternates is what tells crawlers they
// are translations of each other rather than duplicates.
function entry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${ORIGIN}${localePath(path, "en")}`,
    lastModified,
    alternates: {
      languages: {
        en: `${ORIGIN}${localePath(path, "en")}`,
        "zh-Hans": `${ORIGIN}${localePath(path, "zh")}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const newest = posts[0]?.date;

  return [
    entry("/", newest),
    entry("/blog", newest),
    ...posts.map((post) => entry(`/blog/${post.slug}`, post.date)),
  ];
}
