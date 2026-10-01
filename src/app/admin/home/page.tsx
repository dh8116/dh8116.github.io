"use client";

// Home page copy editor: site.json and site.zh.json, saved together.
//
// The two files are parallel — aboutCards/aboutCardsZh, skills/skillsZh and
// currentlyLearning/currentlyLearningZh are index-matched, and projectsZh is
// keyed by the English project's slug. So the English and Chinese of each
// entry are edited side by side here rather than on separate screens, which is
// what stops the two drifting out of alignment.
//
// The last section is the resume: resume.json (the text /resume renders) and,
// optionally, a replacement public/resume.pdf. They go in the same commit as
// the rest, and the deploy re-crops the homepage preview from whichever PDF
// is committed. The deploy keeps the two in step (scripts/resume-sync.py):
// whichever of PDF and text was saved last is the source.

import { useEffect, useState } from "react";
import { AdminHeader, Field, SaveBar } from "@/components/admin/AdminChrome";
import { useAdminSession } from "@/components/admin/AdminGate";
import { usePublish } from "@/components/admin/usePublish";
import { readJson } from "@/lib/github";

const SITE_PATH = "src/data/site.json";
const SITE_ZH_PATH = "src/data/site.zh.json";
const RESUME_PATH = "src/data/resume.json";
const RESUME_PDF_PATH = "public/resume.pdf";

type ResumeJson = { text: string };

// The text the live site was built with, which the deploy has already synced
// with the PDF; main's resume.json can be older when the PDF is the newer of
// the two. Falls back to main when the site has not published it yet.
async function loadResume(token: string): Promise<ResumeJson> {
  try {
    const res = await fetch(`/resume.json?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) return (await res.json()) as ResumeJson;
  } catch {
    // fall through to main
  }
  return readJson<ResumeJson>(token, RESUME_PATH);
}

// FileReader gives "data:application/pdf;base64,<payload>"; the Git blob API
// wants the payload alone.
const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",", 2)[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

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
      <h2 className="mb-5 text-sm uppercase tracking-wider text-foreground/50">
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
  const [resume, setResume] = useState<ResumeJson | null>(null);
  // What main held when this page loaded. resume.json is only written when it
  // differs, so an untouched editor never pushes stale text over a version the
  // deploy has just re-extracted from a new PDF.
  const [resumeLoaded, setResumeLoaded] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
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
        const [a, b, c] = await Promise.all([
          readJson<SiteJson>(token, SITE_PATH),
          readJson<SiteZhJson>(token, SITE_ZH_PATH),
          loadResume(token),
        ]);
        if (cancelled) return;
        setEn(a);
        setZh(b);
        setResume(c);
        setResumeLoaded(c.text);
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

  if (!en || !zh || !resume)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <AdminHeader title="Home page text" />
        <p className="text-sm text-foreground/50">Loading copy from main…</p>
      </div>
    );

  const patchEn = (p: Partial<SiteJson>) => setEn({ ...en, ...p });
  const patchZh = (p: Partial<SiteZhJson>) => setZh({ ...zh, ...p });
  const busy = state.phase === "saving" || state.phase === "deploying";

  async function save() {
    if (!en || !zh || !resume) return;
    setProblem("");
    reset();

    if (!en.site.tagline?.trim()) return setProblem("Tagline is required.");
    if (!en.site.bio?.trim()) return setProblem("Bio is required.");
    if (en.skills.length !== zh.skillsZh.length)
      return setProblem(
        `Skills lists must line up: ${en.skills.length} English, ${zh.skillsZh.length} Chinese.`
      );

    if (!resume.text.trim().startsWith("# "))
      return setProblem("Resume text must start with the name line, e.g. \"# Richael\".");

    let pdfBase64 = "";
    if (pdf) {
      pdfBase64 = await readBase64(pdf);
      // "%PDF" — catches picking the wrong file before it replaces the download.
      if (!pdfBase64.startsWith("JVBERi"))
        return setProblem(`${pdf.name} is not a PDF.`);
    }

    const ok = await publish(
      [
        { path: SITE_PATH, json: en },
        { path: SITE_ZH_PATH, json: zh },
        ...(resume.text !== resumeLoaded ? [{ path: RESUME_PATH, json: resume }] : []),
        ...(pdfBase64 ? [{ path: RESUME_PDF_PATH, base64: pdfBase64 }] : []),
      ],
      pdf ? "Update home page copy and resume PDF" : "Update home page copy"
    );
    if (ok) {
      setPdf(null);
      // The deploy may have rewritten resume.json or resume.pdf; pick that up.
      setReloadKey((k) => k + 1);
    }
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

      <Section title="Resume">
        <Field
          label="Resume text"
          hint="# name · ## heading · ### project · - bullet · [label](url) — saving edited text re-renders the PDF"
          rows={30}
          value={resume.text}
          onChange={(v) => setResume({ text: v })}
        />
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-foreground/50">
            Resume PDF
          </span>
          <span className="ml-2 text-xs text-foreground/30">
            optional — the text above is re-read from it on deploy (it wins over text edits in the same save)
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-foreground/70 file:mr-4 file:rounded-lg file:border-0 file:bg-card file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-white/10"
          />
        </label>
      </Section>

      <SaveBar
        label="Save and publish"
        busy={busy}
        onSave={() => void save()}
        state={state}
        problem={problem}
      />
    </div>
  );
}
