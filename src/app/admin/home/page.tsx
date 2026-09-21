"use client";

// Home page copy editor: site.json and site.zh.json, saved together.
//
// The two files are parallel — aboutCards/aboutCardsZh, skills/skillsZh and
// currentlyLearning/currentlyLearningZh are index-matched, and projectsZh is
// keyed by the English project's slug. So the English and Chinese of each
// entry are edited side by side here rather than on separate screens, which is
// what stops the two drifting out of alignment.

import { useEffect, useState } from "react";
import { AdminHeader, Field, PublishStatus } from "@/components/admin/AdminChrome";
import { useAdminSession } from "@/components/admin/AdminGate";
import { usePublish } from "@/components/admin/usePublish";
import { readJson } from "@/lib/github";

const SITE_PATH = "src/data/site.json";
const SITE_ZH_PATH = "src/data/site.zh.json";

type Card = { period: string; title: string; description: string };
type Item = { label: string; title: string; detail: string };
type Project = {
  slug: string;
  name: string;
  status?: string;
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
};

type SiteJson = {
  site: Record<string, string>;
  projects: Project[];
  aboutCards: Card[];
  skills: string[];
  currentlyLearning: Item[];
};

type SiteZhJson = {
  siteZh: Record<string, string>;
  projectStatusZh: Record<string, string>;
  projectsZh: Record<string, { description: string; tags: string[] }>;
  aboutCardsZh: Card[];
  skillsZh: string[];
  currentlyLearningZh: Item[];
};

const lines = (xs: string[]) => xs.join("\n");
const unlines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-white/10 pt-6">
      <h2 className="mb-5 font-mono text-sm uppercase tracking-wider text-foreground/50">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function HomeAdmin() {
  const { token } = useAdminSession();
  const { state, publish, reset } = usePublish();

  const [en, setEn] = useState<SiteJson | null>(null);
  const [zh, setZh] = useState<SiteZhJson | null>(null);
  const [loadError, setLoadError] = useState("");
  const [problem, setProblem] = useState("");

  // Same shape as the posts editor: the fetch lives in the effect, and retry
  // bumps a key instead of calling a loader the lint rule would read as a
  // synchronous state write.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [a, b] = await Promise.all([
          readJson<SiteJson>(token, SITE_PATH),
          readJson<SiteZhJson>(token, SITE_ZH_PATH),
        ]);
        if (cancelled) return;
        setEn(a);
        setZh(b);
        setLoadError("");
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load site copy.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  if (loadError)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <AdminHeader title="Home page text" />
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}{" "}
          <button onClick={() => setReloadKey((k) => k + 1)} className="underline">
            Retry
          </button>
        </p>
      </div>
    );

  if (!en || !zh)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <AdminHeader title="Home page text" />
        <p className="font-mono text-sm text-foreground/50">Loading copy from main…</p>
      </div>
    );

  const patchEn = (p: Partial<SiteJson>) => setEn({ ...en, ...p });
  const patchZh = (p: Partial<SiteZhJson>) => setZh({ ...zh, ...p });
  const busy = state.phase === "saving" || state.phase === "deploying";

  async function save() {
    if (!en || !zh) return;
    setProblem("");
    reset();

    if (!en.site.tagline?.trim()) return setProblem("Tagline is required.");
    if (!en.site.bio?.trim()) return setProblem("Bio is required.");
    if (en.skills.length !== zh.skillsZh.length)
      return setProblem(
        `Skills lists must line up: ${en.skills.length} English, ${zh.skillsZh.length} Chinese.`
      );

    await publish(
      [
        { path: SITE_PATH, json: en },
        { path: SITE_ZH_PATH, json: zh },
      ],
      "Update home page copy"
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <AdminHeader title="Home page text" />

      <Section title="Intro">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Tagline"
            rows={1}
            value={en.site.tagline ?? ""}
            onChange={(v) => patchEn({ site: { ...en.site, tagline: v } })}
          />
          <Field
            label="标语"
            rows={1}
            value={zh.siteZh.tagline ?? ""}
            onChange={(v) => patchZh({ siteZh: { ...zh.siteZh, tagline: v } })}
          />
          <Field
            label="Status"
            rows={1}
            value={en.site.status ?? ""}
            onChange={(v) => patchEn({ site: { ...en.site, status: v } })}
          />
          <Field
            label="状态"
            rows={1}
            value={zh.siteZh.status ?? ""}
            onChange={(v) => patchZh({ siteZh: { ...zh.siteZh, status: v } })}
          />
          <Field
            label="Location"
            rows={1}
            value={en.site.location ?? ""}
            onChange={(v) => patchEn({ site: { ...en.site, location: v } })}
          />
          <Field
            label="所在地"
            rows={1}
            value={zh.siteZh.location ?? ""}
            onChange={(v) => patchZh({ siteZh: { ...zh.siteZh, location: v } })}
          />
        </div>
        <Field
          label="Bio"
          rows={4}
          value={en.site.bio ?? ""}
          onChange={(v) => patchEn({ site: { ...en.site, bio: v } })}
        />
        <Field
          label="简介"
          rows={4}
          value={zh.siteZh.bio ?? ""}
          onChange={(v) => patchZh({ siteZh: { ...zh.siteZh, bio: v } })}
        />
      </Section>

      <Section title="Projects">
        {en.projects.map((project, i) => {
          const copy = zh.projectsZh[project.slug] ?? { description: "", tags: [] };
          const setProject = (p: Partial<Project>) =>
            patchEn({
              projects: en.projects.map((x, j) => (j === i ? { ...x, ...p } : x)),
            });
          const setCopy = (p: Partial<{ description: string; tags: string[] }>) =>
            patchZh({
              projectsZh: { ...zh.projectsZh, [project.slug]: { ...copy, ...p } },
            });
          return (
            <div key={project.slug} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Name"
                  rows={1}
                  value={project.name}
                  onChange={(v) => setProject({ name: v })}
                />
                <Field
                  label="URL"
                  mono
                  rows={1}
                  value={project.url ?? ""}
                  onChange={(v) => setProject({ url: v })}
                />
              </div>
              <div className="mt-4 space-y-4">
                <Field
                  label="Description"
                  rows={4}
                  value={project.description}
                  onChange={(v) => setProject({ description: v })}
                />
                <Field
                  label="描述"
                  rows={4}
                  value={copy.description}
                  onChange={(v) => setCopy({ description: v })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Tags"
                    hint="one per line"
                    rows={4}
                    value={lines(project.tags)}
                    onChange={(v) => setProject({ tags: unlines(v) })}
                  />
                  <Field
                    label="标签"
                    hint="one per line"
                    rows={4}
                    value={lines(copy.tags)}
                    onChange={(v) => setCopy({ tags: unlines(v) })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="About">
        {en.aboutCards.map((card, i) => {
          const zhCard = zh.aboutCardsZh[i] ?? { period: "", title: "", description: "" };
          const setCard = (p: Partial<Card>) =>
            patchEn({
              aboutCards: en.aboutCards.map((x, j) => (j === i ? { ...x, ...p } : x)),
            });
          const setZhCard = (p: Partial<Card>) =>
            patchZh({
              aboutCardsZh: zh.aboutCardsZh.map((x, j) =>
                j === i ? { ...x, ...p } : x
              ),
            });
          return (
            <div key={i} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Period" rows={1} value={card.period} onChange={(v) => setCard({ period: v })} />
                <Field label="时间" rows={1} value={zhCard.period} onChange={(v) => setZhCard({ period: v })} />
                <Field label="Title" rows={1} value={card.title} onChange={(v) => setCard({ title: v })} />
                <Field label="标题" rows={1} value={zhCard.title} onChange={(v) => setZhCard({ title: v })} />
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Description" rows={3} value={card.description} onChange={(v) => setCard({ description: v })} />
                <Field label="描述" rows={3} value={zhCard.description} onChange={(v) => setZhCard({ description: v })} />
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Currently">
        {en.currentlyLearning.map((item, i) => {
          const zhItem = zh.currentlyLearningZh[i] ?? { label: "", title: "", detail: "" };
          const setItem = (p: Partial<Item>) =>
            patchEn({
              currentlyLearning: en.currentlyLearning.map((x, j) =>
                j === i ? { ...x, ...p } : x
              ),
            });
          const setZhItem = (p: Partial<Item>) =>
            patchZh({
              currentlyLearningZh: zh.currentlyLearningZh.map((x, j) =>
                j === i ? { ...x, ...p } : x
              ),
            });
          return (
            <div key={i} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label" rows={1} value={item.label} onChange={(v) => setItem({ label: v })} />
                <Field label="标签" rows={1} value={zhItem.label} onChange={(v) => setZhItem({ label: v })} />
                <Field label="Title" rows={1} value={item.title} onChange={(v) => setItem({ title: v })} />
                <Field label="标题" rows={1} value={zhItem.title} onChange={(v) => setZhItem({ title: v })} />
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Detail" rows={4} value={item.detail} onChange={(v) => setItem({ detail: v })} />
                <Field label="详情" rows={4} value={zhItem.detail} onChange={(v) => setZhItem({ detail: v })} />
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Skills">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Skills"
            hint="one per line"
            rows={12}
            value={lines(en.skills)}
            onChange={(v) => patchEn({ skills: unlines(v) })}
          />
          <Field
            label="技能"
            hint="same order, one per line"
            rows={12}
            value={lines(zh.skillsZh)}
            onChange={(v) => patchZh({ skillsZh: unlines(v) })}
          />
        </div>
      </Section>

      {problem && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {problem}
        </p>
      )}

      <button
        onClick={() => void save()}
        disabled={busy}
        className="mt-8 w-full rounded-lg bg-brand-blue px-4 py-3 font-mono text-sm font-semibold text-background transition hover:bg-brand-blue-light disabled:opacity-40"
      >
        {busy ? "Publishing…" : "Save and publish"}
      </button>

      <PublishStatus state={state} />
    </div>
  );
}
