"use client";

// Shared furniture for the editor pages: who you are signed in as, the fields,
// and the save bar that follows you down the page.

import Link from "next/link";
import { useAdminSession } from "./AdminGate";
import type { PublishState } from "./usePublish";

export function AdminHeader({ title, back }: { title: string; back?: string }) {
  const { identity, signOut } = useAdminSession();
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-mono text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-xs text-foreground/50">
          Signed in as {identity.login}
          <button onClick={signOut} className="ml-2 text-brand-blue-light underline">
            sign out
          </button>
        </p>
      </div>
      <Link
        href={back ?? "/admin"}
        className="font-mono text-sm text-brand-blue-light hover:underline"
      >
        ← {back === "/" ? "Back to site" : "Back to admin"}
      </Link>
    </div>
  );
}

// One place decides how a publish reads, so the sticky bar and any banner can
// never describe the same state differently.
function publishLine(state: PublishState): { text: string; tone: string } | null {
  switch (state.phase) {
    case "idle":
      return null;
    case "saving":
      return { text: "Committing to main…", tone: "text-brand-blue-light" };
    case "deploying":
      return {
        text: `Committed ${state.sha.slice(0, 7)} — rebuilding, about a minute.`,
        tone: "text-brand-blue-light",
      };
    case "live":
      return { text: `Live — ${state.sha.slice(0, 7)} is deployed.`, tone: "text-term" };
    case "failed":
      return { text: state.message, tone: "text-red-300" };
  }
}

// Pinned to the bottom of the viewport. The home editor is five sections long
// and the post editor has two full language halves, so a save button at the
// end of the document meant scrolling past everything to use it — and the
// publish status scrolled off while you waited for it.
export function SaveBar({
  label,
  busy,
  onSave,
  state,
  problem,
  dirty,
}: {
  label: string;
  busy: boolean;
  onSave: () => void;
  state: PublishState;
  problem?: string;
  dirty?: boolean;
}) {
  const line = publishLine(state);
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-10 border-t border-white/10 bg-background/95 px-6 py-4 backdrop-blur">
      {problem && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {problem}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          onClick={onSave}
          disabled={busy}
          className="rounded-lg bg-brand-blue px-5 py-2.5 font-mono text-sm font-semibold text-background transition hover:bg-brand-blue-light disabled:opacity-40"
        >
          {busy ? "Publishing…" : label}
        </button>
        {line ? (
          <p className={`text-sm ${line.tone}`} role="status">
            {line.text}
            {state.phase === "failed" && state.url && (
              <>
                {" "}
                <a href={state.url} target="_blank" rel="noreferrer" className="underline">
                  Open the run
                </a>
              </>
            )}
          </p>
        ) : (
          dirty && (
            <p className="text-sm text-foreground/40">Unsaved changes</p>
          )
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  rows = 3,
  mono = false,
  placeholder,
  hint,
  // Shown as "n/limit" and turns amber past the limit. The excerpt is the one
  // that matters — it sets the height of every card on /blog — so a length
  // that will wrap badly is worth seeing while typing, not after deploying.
  limit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
  hint?: string;
  limit?: number;
}) {
  const cls = `mt-2 w-full rounded-lg border border-white/10 bg-card px-3 py-2 text-sm outline-none focus:border-brand-blue ${mono ? "font-mono" : ""}`;
  const over = limit !== undefined && value.length > limit;
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
        {label}
      </span>
      {hint && <span className="ml-2 text-xs text-foreground/30">{hint}</span>}
      {limit !== undefined && (
        <span
          className={`ml-2 font-mono text-xs ${over ? "text-brand-yellow" : "text-foreground/30"}`}
        >
          {value.length}/{limit}
        </span>
      )}
      {rows === 1 ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${cls} resize-y leading-relaxed`}
        />
      )}
    </label>
  );
}
