"use client";

// Pieces /discuss and the homepage preview both need: the owner's stored
// GitHub token, request headers, dates, and the owner's label picker.

import { useState } from "react";
import { TOKEN_KEY } from "@/lib/github";
import type { Lang } from "@/data/i18n";
import { OWNER_LABELS, discussUi, type Comment } from "@/data/discuss";

const LABEL_KEY = "discuss:owner-label";

// The site owner's name on every post they make; the API enforces it too.
export const OWNER_NAME = "dh8116";

// Threads in the order the owner set in /admin/comments (new ones on top).
export function threadOrder(a: Comment, b: Comment) {
  return b.sortKey - a.sortKey;
}

// Name + label. The owner shows as dh8116 in blue so their replies stand out.
export function Byline({ comment, lang }: { comment: Comment; lang: Lang }) {
  if (comment.isAuthor) {
    return (
      <>
        <span className="font-semibold text-brand-blue-light">{OWNER_NAME}</span>
        <span className="rounded-full border border-brand-blue/50 bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue-light">
          {comment.label || "Author"}
        </span>
      </>
    );
  }
  return (
    <span className="font-semibold text-foreground">
      {comment.name || discussUi[lang].anonymous}
    </span>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-zinc-200 outline-none transition-colors placeholder:text-zinc-500 focus:border-brand-blue";

export function storedToken(): string {
  try {
    return (
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY) ||
      ""
    );
  } catch {
    return "";
  }
}

export function headers(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(lang === "zh" ? "zh-CN" : "en-NZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rememberLabel(l: string) {
  try {
    window.localStorage.setItem(LABEL_KEY, l);
  } catch {
    // fine, it just won't be remembered
  }
}

export function useOwnerLabel() {
  return useState(() => {
    if (typeof window === "undefined") return "Author";
    try {
      return window.localStorage.getItem(LABEL_KEY) || "Author";
    } catch {
      return "Author";
    }
  });
}

export function OwnerLabelPicker({
  title,
  label,
  setLabel,
}: {
  title?: string;
  label: string;
  setLabel: (l: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
      {title && <span>{title}</span>}
      {OWNER_LABELS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            setLabel(l);
            rememberLabel(l);
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            label === l
              ? "border border-brand-yellow/60 text-brand-yellow"
              : "border border-white/15 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {l}
        </button>
      ))}
      <input
        value={OWNER_LABELS.includes(label) ? "" : label}
        onChange={(e) => {
          const v = e.target.value.slice(0, 20) || "Author";
          setLabel(v);
          rememberLabel(v);
        }}
        placeholder="…"
        className="w-28 rounded-full border border-white/15 bg-transparent px-3 py-1 text-xs text-zinc-200 outline-none focus:border-brand-yellow/60"
      />
    </div>
  );
}
