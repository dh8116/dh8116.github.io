"use client";

// Shared furniture for the editor pages: who you are signed in as, and what
// the last save is doing.

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

export function PublishStatus({ state }: { state: PublishState }) {
  if (state.phase === "idle") return null;

  const tone =
    state.phase === "live"
      ? "border-term/30 bg-term/10 text-term"
      : state.phase === "failed"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-brand-blue/30 bg-brand-blue/10 text-brand-blue-light";

  const text =
    state.phase === "saving"
      ? "Committing to main…"
      : state.phase === "deploying"
        ? `Committed ${state.sha.slice(0, 7)} — GitHub Pages is rebuilding, which usually takes about a minute.`
        : state.phase === "live"
          ? `Live. Commit ${state.sha.slice(0, 7)} is deployed to dh8116.github.io.`
          : state.message;

  return (
    <div className={`mt-6 rounded-lg border px-4 py-3 text-sm ${tone}`} role="status">
      {text}
      {state.phase === "failed" && state.url && (
        <>
          {" "}
          <a href={state.url} target="_blank" rel="noreferrer" className="underline">
            Open the run
          </a>
        </>
      )}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const cls = `mt-2 w-full rounded-lg border border-white/10 bg-card px-3 py-2 text-sm outline-none focus:border-brand-blue ${mono ? "font-mono" : ""}`;
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
        {label}
      </span>
      {hint && <span className="ml-2 text-xs text-foreground/30">{hint}</span>}
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
