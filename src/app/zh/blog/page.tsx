import type { Metadata } from "next";
import BlogIndexPage from "@/components/pages/BlogIndexPage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `博客 — ${site.name}`,
  alternates: alternates("/blog", "zh"),
};

export default function BlogIndexZh() {
  return <BlogIndexPage lang="zh" />;
}
