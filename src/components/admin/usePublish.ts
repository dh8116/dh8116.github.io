"use client";

// Commit, push and redeploy as one action, with the deploy watched to the end.
//
// The commit is the push (there is no local clone here), and pushing to main
// is what starts .github/workflows/deploy.yml. So the only thing left to make
// this a real publish button is waiting for that run: "sent" and "live" are
// about ninety seconds apart, and a save that stops at "sent" leaves you
// refreshing the site wondering whether it worked.

import { useCallback, useEffect, useRef, useState } from "react";
import { commitJson, latestDeploy, type FileWrite } from "@/lib/github";
import { useAdminSession } from "./AdminGate";

export type PublishState =
  | { phase: "idle" }
  | { phase: "saving" }
  | { phase: "deploying"; sha: string }
  | { phase: "live"; sha: string }
  | { phase: "failed"; message: string; url?: string };

const POLL_MS = 5000;
// GitHub Pages builds this site in well under two minutes; ten is the point at
// which something is wrong rather than slow, and saying so beats spinning.
const GIVE_UP_MS = 10 * 60 * 1000;

export function usePublish() {
  const { token } = useAdminSession();
  const [state, setState] = useState<PublishState>({ phase: "idle" });
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const publish = useCallback(
    async (writes: FileWrite[], message: string) => {
      setState({ phase: "saving" });
      let sha: string;
      try {
        sha = await commitJson(token, writes, message);
      } catch (err) {
        setState({
          phase: "failed",
          message: err instanceof Error ? err.message : "Commit failed.",
        });
        return false;
      }

      setState({ phase: "deploying", sha });
      const started = Date.now();

      while (alive.current && Date.now() - started < GIVE_UP_MS) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (!alive.current) return true;

        let run;
        try {
          run = await latestDeploy(token);
        } catch {
          continue; // a blip in the polling is not a failed deploy
        }

        // Ignore a run still describing the previous commit: Actions takes a
        // few seconds to register ours, and reading the old run's "success"
        // would report live before anything was built.
        if (!run || run.sha !== sha) continue;

        if (run.status !== "completed") continue;
        if (run.conclusion === "success") {
          setState({ phase: "live", sha });
          return true;
        }
        setState({
          phase: "failed",
          message: `Committed, but the deploy ${run.conclusion ?? "did not finish"}. The change is on main; the site is still on the previous build.`,
          url: run.url,
        });
        return false;
      }

      if (alive.current) {
        setState({
          phase: "failed",
          message:
            "Committed, but the deploy is still running after 10 minutes. Check Actions.",
        });
      }
      return false;
    },
    [token]
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, publish, reset };
}
