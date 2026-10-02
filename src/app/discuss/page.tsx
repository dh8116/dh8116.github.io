import type { Metadata } from "next";
import DiscussPage from "@/components/pages/DiscussPage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `Discussion — ${site.name}`,
  alternates: alternates("/discuss", "en"),
};

export default function Discuss() {
  return <DiscussPage lang="en" />;
}
