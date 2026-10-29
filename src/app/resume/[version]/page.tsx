import type { Metadata } from "next";
import ResumePage from "@/components/pages/ResumePage";
import { site } from "@/data/site";
import { alternates } from "@/data/i18n";
import { resumeVersions } from "@/data/resume";

type Params = { params: Promise<{ version: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return resumeVersions.map((v) => ({ version: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { version } = await params;
  const v = resumeVersions.find((x) => x.slug === version);
  return {
    title: `Resume (${v?.label}) — ${site.name}`,
    alternates: alternates(`/resume/${version}`, "en"),
  };
}

export default async function ResumeVersion({ params }: Params) {
  const { version } = await params;
  return <ResumePage lang="en" version={version} />;
}
