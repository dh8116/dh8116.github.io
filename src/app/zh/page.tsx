import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { getSite } from "@/data/content";
import { alternates } from "@/data/i18n";

const site = getSite("zh");

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: `${site.name}（dh8116）是新西兰奥克兰的一名 11 年级学生，用 Triton 写 GPU kernel，微调并部署语言模型，并做了两个 AI 产品：Soulor 和 VNportal。`,
  alternates: alternates("/", "zh"),
};

export default function HomeZh() {
  return <HomePage lang="zh" />;
}
