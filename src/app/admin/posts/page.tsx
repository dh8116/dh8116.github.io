"use client";

// Post editor. Reads posts.json and posts.zh.json live from main, edits one
// post, and saves both files in a single commit.
//
// Both languages are on one screen on purpose: the site is bilingual, every
// post needs a Chinese entry, and an editor that let you save the English half
// alone would quietly produce posts that render in English under /zh.

import { useEffect, useMemo, useState } from "react";
import { AdminHeader, Field, PublishStatus } from "@/components/admin/AdminChrome";
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

  const set = (patch: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

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
      setDraft({ ...draft, editing: slug });
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
              onClick={() => {
                setDraft(blankDraft());
                setProblem("");
                reset();
              }}
              className="mb-4 w-full rounded-lg bg-brand-blue px-3 py-2 font-mono text-sm font-semibold text-background hover:bg-brand-blue-light"
            >
              + New post
            </button>
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {listed.map(({ post }) => (
                <li key={post.slug}>
                  <button
                    onClick={() => {
                      setDraft(draftFrom(post, zh[post.slug]));
                      setProblem("");
                      reset();
                    }}
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

                {problem && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {problem}
                  </p>
                )}

                <button
                  onClick={() => void save()}
                  disabled={busy}
                  className="w-full rounded-lg bg-brand-blue px-4 py-3 font-mono text-sm font-semibold text-background transition hover:bg-brand-blue-light disabled:opacity-40"
                >
                  {busy
                    ? "Publishing…"
                    : draft.editing
                      ? "Save and publish"
                      : "Publish new post"}
                </button>

                <PublishStatus state={state} />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
