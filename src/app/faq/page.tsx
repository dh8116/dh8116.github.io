import type { Metadata } from "next";
import DiscussPage from "@/components/pages/DiscussPage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `FAQ — ${site.name}`,
  alternates: alternates("/faq", "en"),
};

export default function Faq() {
  return <DiscussPage lang="en" kind="faq" />;
}
