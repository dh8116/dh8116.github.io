"use client";

// The admin index. It used to be three fixed tiles, which meant the one screen
// you always land on carried no information — you had to open the post editor
// to find out whether anything needed doing. It now reads the same two files
// the editors do and says what state the site is actually in.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminChrome";
import { useAdminSession } from "@/components/admin/AdminGate";
import { readJson } from "@/lib/github";
import type { Post } from "@/data/posts";
import type { PostCopy } from "@/data/posts.zh";

export default function AdminHome() {
  const { token } = useAdminSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [zh, setZh] = useState<Record<string, PostCopy> | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [p, z] = await Promise.all([
          readJson<Post[]>(token, "src/data/posts.json"),
          readJson<Record<string, PostCopy>>(token, "src/data/posts.zh.json"),
        ]);
        if (cancelled) return;
        setPosts(p);
        setZh(z);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not read the repo.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    if (!posts || !zh) return null;
    const untranslated = posts.filter((p) => !zh[p.slug]);
    const newest = posts.reduce(
      (latest, p) => (p.date > latest ? p.date : latest),
      ""
    );
    return { count: posts.length, untranslated, newest };
  }, [posts, zh]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <AdminHeader title="Admin" back="/" />

      <p className="mb-8 text-sm leading-relaxed text-foreground/60">
        Every save here commits to <span className="font-mono">main</span>, which
        starts the Pages deploy. You stay on the page until it reports back live.
      </p>

      {/* A post with no Chinese copy still renders — in English, under /zh — and
          only warns at build time, so nothing ever fails loudly enough to
          notice. This is the place that notices. */}
      {stats && stats.untranslated.length > 0 && (
        <div className="mb-6 rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 p-4">
          <p className="text-sm font-semibold text-brand-yellow">
            {stats.untranslated.length} post
            {stats.untranslated.length === 1 ? "" : "s"} without Chinese copy
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            {stats.untranslated.map((p) => p.title).join(", ")} — these render in
            English under /zh.
          </p>
          <Link
            href="/admin/posts"
            className="mt-2 inline-block text-sm text-brand-yellow underline"
          >
            Fix in the post editor
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat
          label="Posts"
          value={stats ? String(stats.count) : loadError ? "—" : "…"}
        />
        <Stat
          label="Translated"
          value={
            stats
              ? `${stats.count - stats.untranslated.length}/${stats.count}`
              : loadError
                ? "—"
                : "…"
          }
        />
        <Stat
          label="Latest post"
          value={stats?.newest || (loadError ? "—" : "…")}
        />
      </div>

      {loadError && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Tool
          href="/admin/posts"
          name="Blog posts"
          desc="Write a new post or edit an existing one, in English and Chinese."
        />
        <Tool
          href="/admin/home"
          name="Home page text"
          desc="Tagline, bio, projects, about cards, skills and what you're currently on."
        />
        <Tool
          href="/"
          name="View the site"
          desc="Open dh8116.github.io as a reader sees it."
        />
        <Tool
          href="https://github.com/dh8116/dh8116.github.io/actions"
          name="Deploy history"
          desc="Every build, including any that failed after a save."
          external
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card px-4 py-3">
      <div className="font-mono text-xs uppercase tracking-wider text-foreground/40">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}

function Tool({
  href,
  name,
  desc,
  external,
}: {
  href: string;
  name: string;
  desc: string;
  external?: boolean;
}) {
  const body = (
    <>
      <div className="font-mono text-base font-semibold">
        {name}
        {external && <span className="ml-1 text-foreground/30">↗</span>}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-foreground/60">{desc}</div>
    </>
  );
  const cls =
    "rounded-xl border border-white/10 bg-card p-5 transition hover:border-brand-blue/50";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
