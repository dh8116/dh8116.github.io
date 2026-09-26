"use client";

// Post editor. Reads posts.json and posts.zh.json live from main, edits one
// post, and saves both files in a single commit.
//
// Both languages are on one screen on purpose: the site is bilingual, every
// post needs a Chinese entry, and an editor that let you save the English half
// alone would quietly produce posts that render in English under /zh.

import { useEffect, useMemo, useState } from "react";
import { AdminHeader, Field, SaveBar } from "@/components/admin/AdminChrome";
import { useAdminSession } from "@/components/admin/AdminGate";
import { usePublish } from "@/components/admin/usePublish";
import { readJson } from "@/lib/github";
import type { Post } from "@/data/posts";
import type { PostCopy } from "@/data/posts.zh";

const POSTS_PATH = "src/data/posts.json";
const ZH_PATH = "src/data/posts.zh.json";

// Paragraphs are an array in the file and a blank-line-separated block in the
// textarea, which is how the prose is actually written.
const toBody = (paras: string[]) => paras.join("\n\n");
const fromBody = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

type Draft = {
  editing: string | null; // slug as it exists on main; null for a new post
  slug: string;
  date: string;
  kernel: boolean;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  imageAlt: string;
  zhTitle: string;
  zhExcerpt: string;
  zhBody: string;
  zhImageAlt: string;
};

const blankDraft = (): Draft => ({
  editing: null,
  slug: "",
  date: new Date().toISOString().slice(0, 10),
  kernel: false,
  title: "",
  excerpt: "",
  body: "",
  image: "",
  imageAlt: "",
  zhTitle: "",
  zhExcerpt: "",
  zhBody: "",
  zhImageAlt: "",
});

const draftFrom = (post: Post, zh?: PostCopy): Draft => ({
  editing: post.slug,
  slug: post.slug,
  date: post.date,
  kernel: post.category === "kernel",
  title: post.title,
  excerpt: post.excerpt,
  body: toBody(post.paragraphs),
  image: post.image ?? "",
  imageAlt: post.imageAlt ?? "",
  zhTitle: zh?.title ?? "",
  zhExcerpt: zh?.excerpt ?? "",
  zhBody: zh ? toBody(zh.paragraphs) : "",
  zhImageAlt: zh?.imageAlt ?? "",
});

export default function PostsAdmin() {
  const { token } = useAdminSession();
  const { state, publish, reset } = usePublish();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [zh, setZh] = useState<Record<string, PostCopy>>({});
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [problem, setProblem] = useState("");
  const [query, setQuery] = useState("");

  // A draft counts as dirty when it differs from whatever it was opened with.
  // Picking another post used to replace an in-progress draft without a word,
  // which is the sort of thing you only find out you did afterwards.
  const [baseline, setBaseline] = useState("");
  const [pending, setPending] = useState<{ run: () => void } | null>(null);

  const dirty = draft !== null && JSON.stringify(draft) !== baseline;

  // The fetch lives in the effect rather than in a callback the effect calls:
  // the lint rule reads a setState-containing function called from an effect
  // as a synchronous state write, regardless of the awaits inside it. Retry
  // therefore bumps a key rather than re-invoking a loader.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [p, z] = await Promise.all([
          readJson<Post[]>(token, POSTS_PATH),
          readJson<Record<string, PostCopy>>(token, ZH_PATH),
        ]);
        if (cancelled) return;
        setPosts(p);
        setZh(z);
        setLoadError("");
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load posts.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  // The browser's own guard for closing the tab or hitting back. Crude, but it
  // is the only thing that catches a navigation this component never sees.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Newest first for picking, while posts.json keeps its write order — that
  // order is the tie-break for two posts sharing a date, so it must not be
  // reordered by anything the UI does.
  const listed = useMemo(
    () =>
      posts
        ? posts
            .map((post, i) => ({ post, i }))
            .sort(
              (a, b) =>
                b.post.date.localeCompare(a.post.date) || b.i - a.i
            )
        : [],
    [posts]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listed;
    return listed.filter(
      ({ post }) =>
        post.title.toLowerCase().includes(q) || post.slug.includes(q)
    );
  }, [listed, query]);

  const set = (patch: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  function openDraft(next: Draft) {
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setProblem("");
    setPending(null);
    reset();
  }

  // Anything that would throw the current draft away goes through here.
  const guarded = (run: () => void) => (dirty ? setPending({ run }) : run());

  async function save() {
    if (!draft || !posts) return;
    setProblem("");
    reset();

    const slug = draft.slug.trim();
    const paragraphs = fromBody(draft.body);
    const zhParagraphs = fromBody(draft.zhBody);

    if (!slug) return setProblem("Slug is required — it is the post's URL.");
    if (!/^[a-z0-9-]+$/.test(slug))
      return setProblem("Slug can only use lowercase letters, numbers and hyphens.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date))
      return setProblem("Date must look like 2026-09-21.");
    if (!draft.title.trim()) return setProblem("Title is required.");
    if (!draft.excerpt.trim()) return setProblem("Excerpt is required — it shows on /blog.");
    if (paragraphs.length === 0) return setProblem("The post has no body text.");
    if (slug !== draft.editing && posts.some((p) => p.slug === slug))
      return setProblem(`A post with the slug "${slug}" already exists.`);
    if (!draft.zhTitle.trim() || zhParagraphs.length === 0)
      return setProblem(
        "Chinese title and body are required — without them this post renders in English under /zh."
      );

    const next: Post = {
      slug,
      ...(draft.kernel ? { category: "kernel" as const } : {}),
      title: draft.title.trim(),
      date: draft.date,
      excerpt: draft.excerpt.trim(),
      paragraphs,
      ...(draft.image.trim() ? { image: draft.image.trim() } : {}),
      ...(draft.imageAlt.trim() ? { imageAlt: draft.imageAlt.trim() } : {}),
    };

    const nextPosts = draft.editing
      ? posts.map((p) => (p.slug === draft.editing ? next : p))
      : [...posts, next];

    const nextZh = { ...zh };
    if (draft.editing && draft.editing !== slug) delete nextZh[draft.editing];
    nextZh[slug] = {
      title: draft.zhTitle.trim(),
      excerpt: draft.zhExcerpt.trim() || draft.excerpt.trim(),
      paragraphs: zhParagraphs,
      ...(draft.zhImageAlt.trim() ? { imageAlt: draft.zhImageAlt.trim() } : {}),
    };

    const ok = await publish(
      [
        { path: POSTS_PATH, json: nextPosts },
        { path: ZH_PATH, json: nextZh },
      ],
      `${draft.editing ? "Edit" : "Add"} post: ${next.title}`
    );

    if (ok) {
      setPosts(nextPosts);
      setZh(nextZh);
      const saved = { ...draft, editing: slug };
      setDraft(saved);
      setBaseline(JSON.stringify(saved));
    }
  }

  const busy = state.phase === "saving" || state.phase === "deploying";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <AdminHeader title="Blog posts" />

      {loadError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}{" "}
          <button onClick={() => setReloadKey((k) => k + 1)} className="underline">
            Retry
          </button>
        </p>
      )}

      {!posts && !loadError && (
        <p className="font-mono text-sm text-foreground/50">Loading posts from main…</p>
      )}

      {posts && (
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <aside>
            <button
              onClick={() => guarded(() => openDraft(blankDraft()))}
              className="mb-4 w-full rounded-lg bg-brand-blue px-3 py-2 font-mono text-sm font-semibold text-background hover:bg-brand-blue-light"
            >
              + New post
            </button>

            {pending && (
              <div className="mb-4 rounded-lg border border-brand-yellow/40 bg-brand-yellow/10 p-3">
                <p className="text-sm text-brand-yellow">
                  This draft has unsaved changes.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const { run } = pending;
                      setPending(null);
                      run();
                    }}
                    className="rounded-md bg-brand-yellow/20 px-2.5 py-1 text-xs font-semibold text-brand-yellow"
                  >
                    Discard it
                  </button>
                  <button
                    onClick={() => setPending(null)}
                    className="rounded-md px-2.5 py-1 text-xs text-foreground/60 hover:text-foreground"
                  >
                    Keep editing
                  </button>
                </div>
              </div>
            )}

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter posts…"
              className="mb-3 w-full rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm outline-none focus:border-brand-blue"
            />

            <ul className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {shown.length === 0 && (
                <li className="px-2 py-3 text-sm text-foreground/40">
                  Nothing matches “{query}”.
                </li>
              )}
              {shown.map(({ post }) => (
                <li key={post.slug}>
                  <button
                    onClick={() =>
                      guarded(() => openDraft(draftFrom(post, zh[post.slug])))
                    }
                    className={`w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-white/5 ${
                      draft?.editing === post.slug ? "bg-white/10" : ""
                    }`}
                  >
                    <span className="block truncate">{post.title}</span>
                    <span className="font-mono text-xs text-foreground/40">
                      {post.date}
                      {post.category === "kernel" && " · kernel"}
                      {!zh[post.slug] && " · no zh"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section>
            {!draft ? (
              <p className="text-sm text-foreground/50">
                Pick a post to edit, or start a new one.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Slug"
                    hint="the URL"
                    mono
                    rows={1}
                    value={draft.slug}
                    onChange={(slug) => set({ slug })}
                    placeholder="fused-swiglu-mlp"
                  />
                  <Field
                    label="Date"
                    hint="YYYY-MM-DD"
                    mono
                    rows={1}
                    value={draft.date}
                    onChange={(date) => set({ date })}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground/70">
                  <input
                    type="checkbox"
                    checked={draft.kernel}
                    onChange={(e) => set({ kernel: e.target.checked })}
                    className="accent-brand-blue"
                  />
                  Kernel post — grouped separately on /blog
                </label>

                <Field
                  label="Title"
                  rows={1}
                  value={draft.title}
                  onChange={(title) => set({ title })}
                />
                <Field
                  label="Excerpt"
                  hint="shown on /blog"
                  limit={200}
                  rows={2}
                  value={draft.excerpt}
                  onChange={(excerpt) => set({ excerpt })}
                />
                <Field
                  label="Body"
                  hint="blank line between paragraphs"
                  rows={12}
                  value={draft.body}
                  onChange={(body) => set({ body })}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Image"
                    hint="optional"
                    mono
                    rows={1}
                    value={draft.image}
                    onChange={(image) => set({ image })}
                    placeholder="/blog/chart.png"
                  />
                  <Field
                    label="Image alt"
                    rows={1}
                    value={draft.imageAlt}
                    onChange={(imageAlt) => set({ imageAlt })}
                  />
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-foreground/50">
                    中文 — required
                  </h2>
                  <div className="space-y-5">
                    <Field
                      label="标题"
                      rows={1}
                      value={draft.zhTitle}
                      onChange={(zhTitle) => set({ zhTitle })}
                    />
                    <Field
                      label="摘要"
                      rows={2}
                      value={draft.zhExcerpt}
                      onChange={(zhExcerpt) => set({ zhExcerpt })}
                    />
                    <Field
                      label="正文"
                      hint="blank line between paragraphs"
                      rows={12}
                      value={draft.zhBody}
                      onChange={(zhBody) => set({ zhBody })}
                    />
                    {draft.image && (
                      <Field
                        label="图片描述"
                        rows={1}
                        value={draft.zhImageAlt}
                        onChange={(zhImageAlt) => set({ zhImageAlt })}
                      />
                    )}
                  </div>
                </div>

                <SaveBar
                  label={draft.editing ? "Save and publish" : "Publish new post"}
                  busy={busy}
                  dirty={dirty}
                  onSave={() => void save()}
                  state={state}
                  problem={problem}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
