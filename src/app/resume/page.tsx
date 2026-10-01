import type { Metadata } from "next";
import ResumePage from "@/components/pages/ResumePage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `Resume — ${site.name}`,
  alternates: alternates("/resume", "en"),
};

export default function Resume() {
  return <ResumePage lang="en" />;
}
