import type { Metadata } from "next";
import DiscussPage from "@/components/pages/DiscussPage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `讨论 — ${site.name}`,
  alternates: alternates("/discuss", "zh"),
};

export default function DiscussZh() {
  return <DiscussPage lang="zh" />;
}
