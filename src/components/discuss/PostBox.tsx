"use client";

// The "Post" button and the box it opens. The box stays closed until the
// button is pressed, and closes again only on Submit (after the post lands,
// with a confirmation from the site) or Cancel. Both overlays are portalled to
// <body>: FadeInSection's transform would otherwise pin `fixed` to the section.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/data/i18n";
import {
  COMMENTS_API,
  LIMITS,
  discussUi,
  type CommentKind,
} from "@/data/discuss";
import { OWNER_NAME, OwnerLabelPicker, fieldClass, headers, useOwnerLabel } from "./shared";

export default function PostBox({
  lang,
  kind,
  owner,
  token,
  onPosted,
}: {
  lang: Lang;
  kind: CommentKind;
  owner: boolean;
  token: string;
  onPosted: () => void;
}) {
  const t = discussUi[lang];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [label, setLabel] = useOwnerLabel();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(false), 3500);
    return () => window.clearTimeout(id);
  }, [notice]);

  function close() {
    setOpen(false);
    setName("");
    setBody("");
    setError("");
  }

  async function submit() {
    if (!body.trim()) return setError("empty");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(COMMENTS_API, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ kind, parentId: null, name, body, label }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "default");
        return;
      }
      close();
      setNotice(true);
      onPosted();
    } catch {
      setError("network");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light"
      >
        {t.form.open[kind]}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`postbox-${kind}`}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-card p-6"
            >
              <h3 id={`postbox-${kind}`} className="text-lg font-semibold">
                {t.form.legend[kind]}
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {owner && (
                  <OwnerLabelPicker
                    title={t.label}
                    label={label}
                    setLabel={setLabel}
                  />
                )}
                {owner ? (
                  <p className="text-sm text-zinc-400">
                    {t.postingAs}{" "}
                    <span className="font-semibold text-brand-blue-light">{OWNER_NAME}</span>
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
                  autoFocus
                  value={body}
                  onChange={(e) =>
                    setBody(e.target.value.slice(0, LIMITS.body))
                  }
                  placeholder={t.bodyPlaceholder[kind]}
                  rows={6}
                  className={`${fieldClass} resize-y leading-relaxed`}
                />
                {error && (
                  <p className="text-sm text-red-300">
                    {t.errors[error] ?? t.errors.default}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    {body.length}/{LIMITS.body}
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    className="ml-auto rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-brand-blue-light hover:text-brand-blue-light"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={busy}
                    className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light disabled:opacity-50"
                  >
                    {busy ? t.posting : t.form.submit}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {notice &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-brand-blue/20"
          >
            {t.form.posted}
          </div>,
          document.body,
        )}
    </>
  );
}
