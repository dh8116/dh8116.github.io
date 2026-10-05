"use client";

// Anonymous discussion (/discuss) or visitor FAQ (/faq), one kind per page. Visitors post under any name they type (or none);
// the site owner is recognised by the GitHub token the /admin sign-in already
// stored in this browser, which the API checks against GitHub on every write.
// The owner gets a label on their posts, can answer FAQ questions (visitors
// can only ask them), and can hide or delete anything.

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/data/i18n";
import {
  COMMENTS_API,
  LIMITS,
  SEEN_KEY,
  discussUi,
  type Comment,
  type CommentKind,
} from "@/data/discuss";
import PostBox from "@/components/discuss/PostBox";
import {
  Byline,
  OWNER_NAME,
  OwnerLabelPicker,
  fieldClass,
  formatDate,
  headers,
  storedToken,
  threadOrder,
  useOwnerLabel,
} from "@/components/discuss/shared";

const MAX_DEPTH = 4; // deeper replies keep this indent rather than walking off-screen

export default function DiscussPage({ lang, kind }: { lang: Lang; kind: CommentKind }) {
  const t = discussUi[lang];
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [owner, setOwner] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
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
        if (!res.ok) {
          setError(data.error || "default");
          setComments([]);
          return;
        }
        setToken(tok);
        setOwner(Boolean(data.owner));
        setComments(data.comments);
        setError("");
        if (data.owner) {
          try {
            window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
          } catch {
            // storage blocked; the admin badge just stays up
          }
        }
      } catch {
        if (!cancelled) {
          setError("network");
          setComments([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  // Threads in the owner's order, newest first by default; replies under each in the order they were written.
  const { roots, children } = useMemo(() => {
    const byParent = new Map<number, Comment[]>();
    const top: Comment[] = [];
    for (const c of comments ?? []) {
      if (c.parentId === null) top.push(c);
      else byParent.set(c.parentId, [...(byParent.get(c.parentId) ?? []), c]);
    }
    return { roots: top.sort(threadOrder), children: byParent };
  }, [comments]);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t.heading[kind].eyebrow}
        {lang === "en" ? " " : ""}
        <span className="text-brand-blue-light">{t.heading[kind].title}</span>
      </h1>
      <div className="mt-3 h-1 w-12 rounded-full bg-brand-blue" />
      <p className="mt-6 text-lg leading-relaxed text-zinc-300">{t.intro[kind]}</p>


      <div className="mt-8">
        <PostBox lang={lang} kind={kind} owner={owner} token={token} onPosted={reload} />
      </div>

      {error && error !== "not_configured" && (
        <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {t.errors[error] ?? t.errors.default}
        </p>
      )}

      <div className="mt-10 flex flex-col gap-6">
        {comments === null ? (
          <p className="text-zinc-500">{t.loading}</p>
        ) : error === "not_configured" ? (
          <p className="text-zinc-500">{t.errors.not_configured}</p>
        ) : roots.length === 0 ? (
          <p className="text-zinc-500">{t.empty[kind]}</p>
        ) : (
          roots.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-card p-6 transition-all duration-200 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
            >
              <Thread
                lang={lang}
                comment={c}
                childMap={children}
                depth={0}
                owner={owner}
                token={token}
                onChange={reload}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Thread({
  lang,
  comment,
  childMap,
  depth,
  owner,
  token,
  onChange,
}: {
  lang: Lang;
  comment: Comment;
  childMap: Map<number, Comment[]>;
  depth: number;
  owner: boolean;
  token: string;
  onChange: () => void;
}) {
  const t = discussUi[lang];
  const [replying, setReplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const replies = childMap.get(comment.id) ?? [];
  const isFaq = comment.kind === "faq";
  // Visitors reply anywhere in a discussion; FAQ answers are the owner's.
  const canReply = owner || !isFaq;

  async function moderate(method: "PATCH" | "DELETE") {
    await fetch(`${COMMENTS_API}/${comment.id}`, {
      method,
      headers: headers(token),
      body: method === "PATCH" ? JSON.stringify({ hidden: !comment.hidden }) : undefined,
    });
    onChange();
  }

  return (
    <div className={comment.hidden ? "opacity-50" : ""}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Byline comment={comment} lang={lang} />
        {comment.hidden && (
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs text-zinc-400">
            {t.hidden}
          </span>
        )}
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {formatDate(comment.createdAt, lang)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-lg leading-relaxed text-zinc-300">
        {comment.body}
      </p>

      <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium">
        {canReply && !replying && (
          <button
            onClick={() => setReplying(true)}
            className="text-brand-blue-light hover:underline"
          >
            {isFaq ? t.answer : t.reply}
          </button>
        )}
        {owner && (
          <>
            <button
              onClick={() => void moderate("PATCH")}
              className="text-zinc-400 hover:text-zinc-200 hover:underline"
            >
              {comment.hidden ? t.unhide : t.hide}
            </button>
            {confirming ? (
              <span className="flex gap-3">
                <span className="text-red-300">{t.confirmRemove}</span>
                <button
                  onClick={() => void moderate("DELETE")}
                  className="text-red-300 underline"
                >
                  {t.remove}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-zinc-400 hover:underline"
                >
                  {t.cancel}
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-zinc-400 hover:text-red-300 hover:underline"
              >
                {t.remove}
              </button>
            )}
          </>
        )}
      </div>

      {isFaq && depth === 0 && replies.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">{t.unanswered}</p>
      )}

      {replying && (
        <Composer
          lang={lang}
          kind={comment.kind}
          parentId={comment.id}
          owner={owner}
          token={token}
          onPosted={() => {
            setReplying(false);
            onChange();
          }}
          onCancel={() => setReplying(false)}
        />
      )}

      {replies.length > 0 && (
        <div
          className={`mt-4 flex flex-col gap-4 ${
            depth < MAX_DEPTH ? "border-l border-white/10 pl-4 sm:pl-6" : ""
          }`}
        >
          {replies.map((r) => (
            <Thread
              key={r.id}
              lang={lang}
              comment={r}
              childMap={childMap}
              depth={depth + 1}
              owner={owner}
              token={token}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Composer({
  lang,
  kind,
  parentId,
  owner,
  token,
  onPosted,
  onCancel,
}: {
  lang: Lang;
  kind: CommentKind;
  parentId: number;
  owner: boolean;
  token: string;
  onPosted: () => void;
  onCancel: () => void;
}) {
  const t = discussUi[lang];
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [label, setLabel] = useOwnerLabel();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Visitors can only open FAQ threads, never reply inside one.
  if (kind === "faq" && !owner) return null;

  async function submit() {
    if (!body.trim()) return setError("empty");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(COMMENTS_API, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ kind, parentId, name, body, label }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "default");
        return;
      }
      setBody("");
      setName("");
      onPosted();
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3">
        {owner && <OwnerLabelPicker title={t.label} label={label} setLabel={setLabel} />}
        {owner ? (
          <p className="text-sm text-zinc-400">
            {t.postingAs} <span className="font-semibold text-brand-blue-light">{OWNER_NAME}</span>
          </p>
        ) : (
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, LIMITS.name))}
            placeholder={t.namePlaceholder}
            className={fieldClass}
          />
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, LIMITS.body))}
          rows={3}
          className={`${fieldClass} resize-y leading-relaxed`}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light disabled:opacity-50"
          >
            {busy ? t.posting : kind === "faq" ? t.answer : t.reply}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-zinc-400 hover:underline"
          >
            {t.cancel}
          </button>
          <span className="ml-auto text-xs text-zinc-500">
            {body.length}/{LIMITS.body}
          </span>
        </div>
        {error && <p className="text-sm text-red-300">{t.errors[error] ?? t.errors.default}</p>}
      </div>
    </div>
  );
}
