"use client";

// The gate every /admin page sits behind.
//
// There is no server here to hold a session, so "signed in" means: a GitHub
// token is in this browser's localStorage, and GitHub confirmed it belongs to
// an account that can push to this repo. Both halves matter — a valid token
// for an account with no write access gets turned away, because everything
// these pages do is a commit.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TOKEN_KEY, verifyIdentity, type Identity } from "@/lib/github";

type Session = { token: string; identity: Identity; signOut: () => void };

const SessionContext = createContext<Session | null>(null);

export function useAdminSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAdminSession used outside AdminGate");
  return session;
}

const TOKEN_HELP =
  "https://github.com/settings/personal-access-tokens/new";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* private mode — the in-memory sign-out below is what matters */
    }
    setSession(null);
  }, []);

  const signIn = useCallback(
    async (token: string, remember: boolean) => {
      setBusy(true);
      setError("");
      try {
        const identity = await verifyIdentity(token);
        if (!identity.canPush) {
          setError(
            `Signed in as ${identity.login}, but that account cannot push to this repo.`
          );
          return;
        }
        if (remember) {
          try {
            window.localStorage.setItem(TOKEN_KEY, token);
          } catch {
            /* the session still works for this tab */
          }
        }
        setSession({ token, identity, signOut });
        setInput("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach GitHub.");
      } finally {
        setBusy(false);
      }
    },
    [signOut]
  );

  // Revalidate a stored token on load instead of trusting it: tokens expire,
  // and finding that out at save time means losing whatever was just typed.
  //
  // The verify is awaited even when there is no stored token (resolving to
  // null) so that every state update below happens off the synchronous effect
  // body — a cascade of renders on mount is what the alternative buys.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = (() => {
        try {
          return window.localStorage.getItem(TOKEN_KEY);
        } catch {
          return null;
        }
      })();

      const identity = await (stored
        ? verifyIdentity(stored).catch(() => null)
        : Promise.resolve(null));

      if (cancelled) return;
      if (stored && identity?.canPush) {
        setSession({ token: stored, identity, signOut });
      } else if (stored) {
        signOut();
      }
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [signOut]);

  if (checking) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-24 font-mono text-sm text-foreground/50">
        Checking your GitHub session…
      </p>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-mono text-2xl font-bold">Admin</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          This page is public, but it can only do anything with a GitHub token
          that can push to{" "}
          <span className="font-mono text-brand-blue-light">dh8116.github.io</span>.
          Every edit you make here is committed as you.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const remember = (
              e.currentTarget.elements.namedItem("remember") as HTMLInputElement
            )?.checked;
            if (input.trim()) void signIn(input.trim(), remember);
          }}
        >
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
              GitHub token
            </span>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="github_pat_…"
              className="mt-2 w-full rounded-lg border border-white/10 bg-card px-3 py-2 font-mono text-sm outline-none focus:border-brand-blue"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="accent-brand-blue"
            />
            Stay signed in on this device
          </label>

          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="w-full rounded-lg bg-brand-blue px-4 py-2.5 font-mono text-sm font-semibold text-background transition hover:bg-brand-blue-light disabled:opacity-40"
          >
            {busy ? "Checking with GitHub…" : "Sign in with GitHub"}
          </button>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </form>

        <p className="mt-8 text-xs leading-relaxed text-foreground/40">
          Need one?{" "}
          <a
            href={TOKEN_HELP}
            target="_blank"
            rel="noreferrer"
            className="text-brand-blue-light underline"
          >
            Create a fine-grained token
          </a>{" "}
          scoped to this repository with <strong>Contents: read and write</strong>.
          Give it an expiry date — if you lose the device, the token dies on its
          own.
        </p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}
