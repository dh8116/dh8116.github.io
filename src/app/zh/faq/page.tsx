import type { Metadata } from "next";
import DiscussPage from "@/components/pages/DiscussPage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `问答 — ${site.name}`,
  alternates: alternates("/faq", "zh"),
};

export default function FaqZh() {
  return <DiscussPage lang="zh" kind="faq" />;
}
