"use client";

// The gate every /admin page sits behind.
//
// Signing in is the real GitHub OAuth flow: the button hands the browser to
// GitHub's consent screen by way of a small proxy (dh8116-auth) that holds the
// client secret, and the proxy will only hand a token back for ALLOWED_LOGIN —
// anyone else's is revoked and never reaches this page. That check lives on the
// server because a check here could be edited out; this copy only exists so the
// UI can explain the refusal.
//
// The token comes back in the URL fragment, which is not sent to servers and
// does not appear in logs or a Referer. It is read once and the fragment is
// wiped from the address bar immediately.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ALLOWED_LOGIN,
  AUTH_ORIGIN,
  TOKEN_KEY,
  verifyIdentity,
  type Identity,
} from "@/lib/github";

type Session = { token: string; identity: Identity; signOut: () => void };

const SessionContext = createContext<Session | null>(null);

export function useAdminSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAdminSession used outside AdminGate");
  return session;
}

const STATE_KEY = "admin:oauth-state";

function readStored(key: string, session = false): string | null {
  try {
    return (session ? window.sessionStorage : window.localStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string, session = false) {
  try {
    (session ? window.sessionStorage : window.localStorage).setItem(key, value);
  } catch {
    /* private mode; the flow still works for this page load */
  }
}

// What the proxy can send back instead of a token, in words rather than codes.
function explain(error: string, login?: string | null): string {
  switch (error) {
    case "not_allowed":
      return `Signed in as ${login || "someone else"} — this admin is only for ${ALLOWED_LOGIN}.`;
    // The right account, but GitHub is not granting write access to the repo.
    // Worth its own message because the cause is nearly always the app: a
    // GitHub App grants repo access by *installation*, not by the `scope` it
    // was asked for, so an uninstalled one signs in fine and can write nothing.
    case "no_repo_access":
      return `Signed in as ${login || ALLOWED_LOGIN}, but GitHub is not granting write access to the site's repo. If this is a GitHub App, install it on dh8116/dh8116.github.io with Contents: read and write — an OAuth app instead needs the repo scope.`;
    case "denied":
      return "Sign-in was cancelled.";
    case "not_configured":
      return "Sign-in is not finished being set up — the proxy has no GitHub credentials yet.";
    case "stale_state":
      return "That sign-in link was stale. Try again.";
    case "exchange_failed":
      return "GitHub would not complete the sign-in. Try again.";
    case "whoami_failed":
      return "Signed in, but GitHub would not say who you are. Try again.";
    case "github_unreachable":
      return "Could not reach GitHub. Check your connection and try again.";
    default:
      return "Sign-in failed. Try again.";
  }
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* the in-memory sign-out below is what matters */
    }
    setSession(null);
  }, []);

  const signIn = useCallback(() => {
    // A random state, kept in sessionStorage, is what ties the response that
    // comes back to the request this tab actually made.
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const state = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    writeStored(STATE_KEY, state, true);
    window.location.href = `${AUTH_ORIGIN}/api/start?state=${encodeURIComponent(state)}`;
  }, []);

  // One effect for both ways in: a fragment handed back by the proxy, or a
  // token already stored from last time. Everything below runs after an await
  // so nothing writes state synchronously on mount.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hash = window.location.hash.startsWith("#")
        ? new URLSearchParams(window.location.hash.slice(1))
        : null;
      const returned = hash?.get("token") || hash?.get("error");

      if (returned) {
        // Wipe the fragment before anything else, so a reload or a shared URL
        // cannot replay it and the token stops sitting in the address bar.
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }

      let token: string | null = null;
      let failure = "";

      if (returned) {
        const expected = readStored(STATE_KEY, true);
        if (!expected || hash?.get("state") !== expected) {
          failure = "stale_state";
        } else if (hash?.get("error")) {
          failure = hash.get("error") as string;
        } else {
          token = hash?.get("token") ?? null;
        }
        try {
          window.sessionStorage.removeItem(STATE_KEY);
        } catch {
          /* nothing to clean up */
        }
      }

      if (!token && !failure) token = readStored(TOKEN_KEY);

      const identity = await (token
        ? verifyIdentity(token).catch(() => null)
        : Promise.resolve(null));

      if (cancelled) return;

      if (token && identity?.canPush && identity.login.toLowerCase() === ALLOWED_LOGIN) {
        writeStored(TOKEN_KEY, token);
        setSession({ token, identity, signOut });
      } else {
        if (token) {
          // A stored token that has expired, been revoked, or lost access.
          try {
            window.localStorage.removeItem(TOKEN_KEY);
          } catch {
            /* nothing to clean up */
          }
          if (!failure && identity) {
            // Separate "wrong person" from "right person, no access" — they
            // need completely different fixes.
            failure =
              identity.login.toLowerCase() === ALLOWED_LOGIN
                ? "no_repo_access"
                : "not_allowed";
          }
        }
        if (failure) {
          setError(
            explain(failure, hash?.get("login") ?? identity?.login ?? null)
          );
        }
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
          Sign in with GitHub to write posts and edit the site. Only{" "}
          <span className="font-mono text-brand-blue-light">{ALLOWED_LOGIN}</span>{" "}
          can get in, and every edit is committed as you.
        </p>

        <button
          onClick={signIn}
          className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg bg-brand-blue px-4 py-3 font-mono text-sm font-semibold text-background transition hover:bg-brand-blue-light"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-current">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Sign in with GitHub
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs leading-relaxed text-foreground/40">
          GitHub will ask for access to your repositories — that is what lets
          this page commit a post. Nothing is stored anywhere but your own
          browser.
        </p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}
