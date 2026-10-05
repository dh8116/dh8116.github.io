"use client";

// Discussion + FAQ moderation: put threads in the order the site shows them,
// hide them, or delete them (a thread's replies go with it). Order is saved
// on every move — there is no draft, so nothing to lose by leaving.

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminChrome";
import { useAdminSession } from "@/components/admin/AdminGate";
import { COMMENTS_API, SEEN_KEY, type Comment, type CommentKind } from "@/data/discuss";
import { formatDate, headers, threadOrder } from "@/components/discuss/shared";

const KINDS: { kind: CommentKind; name: string; page: string }[] = [
  { kind: "discussion", name: "Discussion", page: "/discuss" },
  { kind: "faq", name: "FAQ", page: "/faq" },
];

export default function CommentsAdmin() {
  const { token } = useAdminSession();
  const [kind, setKind] = useState<CommentKind>("discussion");
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${COMMENTS_API}?kind=${kind}`, {
          headers: headers(token),
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || res.status);
        setComments(data.comments);
        setError("");
        try {
          window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
        } catch {
          // the hub badge just stays up
        }
      } catch (e) {
        if (!cancelled) {
          setComments([]);
          setError(`Couldn't load comments (${(e as Error).message}).`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, token, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const all = comments ?? [];
  const roots = all.filter((c) => c.parentId === null).sort(threadOrder);
  const repliesOf = (id: number) => all.filter((c) => c.parentId === id);

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: headers(token) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(`That didn't save (${data.error || res.status}).`);
    }
    reload();
  }

  function move(index: number, by: -1 | 1) {
    const order = roots.map((c) => c.id);
    const to = index + by;
    if (to < 0 || to >= order.length) return;
    [order[index], order[to]] = [order[to], order[index]];
    // Show the move straight away; the reload after the save confirms it.
    const key = new Map(order.map((id, i) => [id, order.length - i]));
    setComments(all.map((c) => (key.has(c.id) ? { ...c, sortKey: key.get(c.id)! } : c)));
    void call(COMMENTS_API, { method: "PUT", body: JSON.stringify({ kind, order }) });
  }

  const remove = (id: number) => {
    setConfirming(null);
    void call(`${COMMENTS_API}/${id}`, { method: "DELETE" });
  };
  const toggleHidden = (c: Comment) =>
    void call(`${COMMENTS_API}/${c.id}`, {
      method: "PATCH",
      body: JSON.stringify({ hidden: !c.hidden }),
    });

  const page = KINDS.find((k) => k.kind === kind)!.page;
  const btn =
    "rounded-lg border border-white/15 px-2.5 py-1 text-xs text-foreground/70 transition hover:border-brand-blue/50 hover:text-foreground disabled:opacity-30";

  function Actions({ c }: { c: Comment }) {
    return confirming === c.id ? (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-red-300">
          Delete{c.parentId === null ? " this and its replies" : ""}?
        </span>
        <button onClick={() => remove(c.id)} className="text-red-300 underline">
          Delete
        </button>
        <button onClick={() => setConfirming(null)} className="text-foreground/60 underline">
          Cancel
        </button>
      </span>
    ) : (
      <span className="flex gap-2">
        <button onClick={() => toggleHidden(c)} className={btn}>
          {c.hidden ? "Unhide" : "Hide"}
        </button>
        <button onClick={() => setConfirming(c.id)} className={`${btn} hover:text-red-300`}>
          Delete
        </button>
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <AdminHeader title="Discussion & FAQ" />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => {
              setKind(k.kind);
              setComments(null);
              setConfirming(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              kind === k.kind
                ? "bg-brand-blue text-white"
                : "border border-white/20 text-foreground/70 hover:text-foreground"
            }`}
          >
            {k.name}
          </button>
        ))}
        <Link href={page} className="ml-auto text-sm text-brand-blue-light hover:underline">
          Open {page} to reply →
        </Link>
      </div>

      <p className="mb-6 text-sm text-foreground/50">
        Top of the list is top of the page (and the homepage preview shows the first two). New
        posts arrive on top.
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {comments === null ? (
        <p className="text-foreground/50">Loading…</p>
      ) : roots.length === 0 ? (
        <p className="text-foreground/50">Nothing here yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {roots.map((c, i) => {
            const replies = repliesOf(c.id);
            return (
              <li
                key={c.id}
                className={`rounded-xl border border-white/10 bg-card p-4 ${c.hidden ? "opacity-60" : ""}`}
              >
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className={btn}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === roots.length - 1}
                      aria-label="Move down"
                      className={btn}
                    >
                      ↓
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span
                        className={`font-semibold ${c.isAuthor ? "text-brand-blue-light" : ""}`}
                      >
                        {c.isAuthor ? "dh8116" : c.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-foreground/40">
                        {formatDate(c.createdAt, "en")}
                      </span>
                      {c.hidden && (
                        <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-foreground/50">
                          Hidden
                        </span>
                      )}
                      <span className="ml-auto">
                        <Actions c={c} />
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-foreground/80">
                      {c.body}
                    </p>
                    {replies.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-brand-blue-light">
                          {replies.length} {replies.length === 1 ? "reply" : "replies"}
                        </summary>
                        <ul className="mt-2 flex flex-col gap-2 border-l border-white/10 pl-4">
                          {replies.map((r) => (
                            <li key={r.id} className={r.hidden ? "opacity-60" : ""}>
                              <div className="flex flex-wrap items-center gap-x-3 text-xs">
                                <span
                                  className={`font-semibold ${r.isAuthor ? "text-brand-blue-light" : ""}`}
                                >
                                  {r.isAuthor ? "dh8116" : r.name || "Anonymous"}
                                </span>
                                {r.hidden && <span className="text-foreground/50">Hidden</span>}
                                <span className="ml-auto">
                                  <Actions c={r} />
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-sm text-foreground/70">
                                {r.body}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
