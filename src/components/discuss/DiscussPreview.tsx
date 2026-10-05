"use client";

// Homepage Discuss and FAQ sections: the two newest threads of one kind, a
// Post / Ask button, and a link through to the full list on /discuss or /faq.

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Lang, localePath } from "@/data/i18n";
import { COMMENTS_API, discussUi, type Comment, type CommentKind } from "@/data/discuss";
import PostBox from "./PostBox";
import { Byline, formatDate, headers, storedToken, threadOrder } from "./shared";

const SHOWN = 2;

export default function DiscussPreview({ lang, kind }: { lang: Lang; kind: CommentKind }) {
  const t = discussUi[lang];
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [owner, setOwner] = useState(false);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const tok = storedToken();
      try {
        const res = await fetch(`${COMMENTS_API}?kind=${kind}`, {
          headers: headers(tok),
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);
        setToken(tok);
        setOwner(Boolean(data.owner));
        setComments(data.comments);
        setFailed(false);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setComments([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, reloadKey]);

  const href = localePath(kind === "faq" ? "/faq" : "/discuss", lang);
  const all = comments ?? [];
  const roots = all.filter((c) => c.parentId === null).sort(threadOrder);
  const replyCount = (id: number) => all.filter((c) => c.parentId === id).length;

  return (
    <>
      <div className="mt-8 flex flex-col gap-6">
        {comments === null ? (
          <p className="text-zinc-500">{t.loading}</p>
        ) : failed ? (
          <p className="text-zinc-500">{t.errors.network}</p>
        ) : roots.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-6 text-zinc-400">
            {t.preview.empty[kind]}
          </p>
        ) : (
          roots.slice(0, SHOWN).map((c) => (
            <Link
              key={c.id}
              href={href}
              className="group block rounded-2xl border border-white/10 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Byline comment={c} lang={lang} />
                <span className="text-xs uppercase tracking-widest text-zinc-500">
                  {formatDate(c.createdAt, lang)}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-zinc-400">
                {c.body}
              </p>
              <p className="mt-3 text-sm font-medium text-brand-blue-light">
                {kind === "faq"
                  ? replyCount(c.id) > 0
                    ? t.preview.answered
                    : t.unanswered
                  : t.preview.replies(replyCount(c.id))}{" "}
                &rarr;
              </p>
            </Link>
          ))
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <PostBox
          lang={lang}
          kind={kind}
          owner={owner}
          token={token}
          onPosted={() => setReloadKey((k) => k + 1)}
        />
        {roots.length > 0 && (
          <Link
            href={href}
            className="text-sm font-medium text-brand-blue-light hover:underline"
          >
            {t.preview.viewAll[kind]} &rarr;
          </Link>
        )}
      </div>
    </>
  );
}
