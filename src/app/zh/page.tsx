import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { getSite } from "@/data/content";
import { alternates } from "@/data/i18n";

const site = getSite("zh");

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: `${site.name} 的个人网站：项目与写作。`,
  alternates: alternates("/", "zh"),
};

export default function HomeZh() {
  return <HomePage lang="zh" />;
}
