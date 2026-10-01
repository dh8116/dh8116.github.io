import type { Metadata } from "next";
import ResumePage from "@/components/pages/ResumePage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";

export const metadata: Metadata = {
  title: `简历 — ${site.name}`,
  alternates: alternates("/resume", "zh"),
};

export default function ResumeZh() {
  return <ResumePage lang="zh" />;
}
