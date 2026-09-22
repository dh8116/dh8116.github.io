// Browser-side GitHub client for /admin.
//
// The admin pages are public — a static export cannot hide a route — but every
// one of them is inert until GitHub says who you are. Sign-in is the real OAuth
// flow, brokered by a small proxy that holds the client secret and refuses to
// return a token for any account but ALLOWED_LOGIN. A password check here would
// be theatre, because it would ship inside the public bundle.
//
// Writes go through the Git Data API rather than the simpler Contents API so
// that one save is one commit even when it touches several files. A bilingual
// post is English copy plus Chinese copy, and publishing those as two commits
// would deploy the site once with the post half-translated.

const OWNER = "dh8116";
const REPO = "dh8116.github.io";
const BRANCH = "main";
const API = "https://api.github.com";

// The server half of "Sign in with GitHub", deployed separately because this
// site is a static export with nowhere to keep an OAuth client secret and
// nowhere to run the code-for-token exchange. GitHub's device flow would avoid
// the secret but sends no CORS headers, so a browser cannot finish that either.
// Source: ~/Desktop/DFI/dh8116-auth.
export const AUTH_ORIGIN = "https://dh8116-auth.vercel.app";

// The only account this admin is for. The proxy enforces this before it ever
// hands a token back — this copy is so the UI can say why, not the gate.
export const ALLOWED_LOGIN = OWNER;

export const TOKEN_KEY = "admin:gh-token";

export type Identity = { login: string; canPush: boolean };

export type DeployRun = {
  status: string;
  conclusion: string | null;
  url: string;
  sha: string;
};

async function gh<T>(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    // GitHub's error bodies are JSON with a `message`, except when they aren't
    // (rate limiting can return HTML), so fall back to the status line.
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      /* keep the status line */
    }
    if (res.status === 401) throw new Error("Token rejected — it may have expired.");
    if (res.status === 403) throw new Error(`Token lacks permission: ${detail}`);
    if (res.status === 409)
      throw new Error("The repo moved on since you loaded this. Reload and redo the edit.");
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// Two questions, because they fail differently: a token can be valid (so /user
// answers) and still have no write access to this particular repo, and telling
// those apart is the difference between "log in again" and "fix your scopes".
export async function verifyIdentity(token: string): Promise<Identity> {
  const user = await gh<{ login: string }>(token, "/user");
  let canPush = false;
  try {
    const repo = await gh<{ permissions?: { push?: boolean } }>(
      token,
      `/repos/${OWNER}/${REPO}`
    );
    canPush = Boolean(repo.permissions?.push);
  } catch {
    canPush = false;
  }
  return { login: user.login, canPush };
}

// Read straight from the branch rather than from the bundle this page was
// built with: the build can be minutes stale, and editing a stale copy is how
// you silently revert someone else's change — or your own, made from a phone.
export async function readJson<T>(token: string, path: string): Promise<T> {
  const file = await gh<{ content: string; encoding: string }>(
    token,
    `/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}&t=${Date.now()}`
  );
  const binary = atob(file.content.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

export type FileWrite = { path: string; json: unknown };

// One commit for all the files in `writes`. Pushing to main is what triggers
// .github/workflows/deploy.yml, so this call is the whole publish: commit,
// push and redeploy are the same action.
export async function commitJson(
  token: string,
  writes: FileWrite[],
  message: string
): Promise<string> {
  const repoPath = `/repos/${OWNER}/${REPO}`;

  const ref = await gh<{ object: { sha: string } }>(
    token,
    `${repoPath}/git/ref/heads/${BRANCH}`
  );
  const headSha = ref.object.sha;

  const head = await gh<{ tree: { sha: string } }>(
    token,
    `${repoPath}/git/commits/${headSha}`
  );

  const blobs = await Promise.all(
    writes.map(async (w) => {
      const blob = await gh<{ sha: string }>(token, `${repoPath}/git/blobs`, {
        method: "POST",
        // Trailing newline so the committed file matches what a local editor
        // and `npm run build` would write, and diffs stay one-line-per-change.
        body: { content: JSON.stringify(w.json, null, 2) + "\n", encoding: "utf-8" },
      });
      return { path: w.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    })
  );

  const tree = await gh<{ sha: string }>(token, `${repoPath}/git/trees`, {
    method: "POST",
    body: { base_tree: head.tree.sha, tree: blobs },
  });

  const commit = await gh<{ sha: string }>(token, `${repoPath}/git/commits`, {
    method: "POST",
    body: { message, tree: tree.sha, parents: [headSha] },
  });

  // No `force`: if main moved while the form was open, this 422s rather than
  // overwriting whatever landed in the meantime.
  await gh(token, `${repoPath}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: { sha: commit.sha },
  });

  return commit.sha;
}

// The deploy half of the round trip. Polled after a commit so a save can say
// "live" rather than "sent", which is the difference between believing the
// site updated and knowing it did.
export async function latestDeploy(token: string): Promise<DeployRun | null> {
  const runs = await gh<{
    workflow_runs: {
      status: string;
      conclusion: string | null;
      html_url: string;
      head_sha: string;
    }[];
  }>(
    token,
    `/repos/${OWNER}/${REPO}/actions/runs?branch=${BRANCH}&per_page=1&t=${Date.now()}`
  );
  const run = runs.workflow_runs[0];
  return run
    ? { status: run.status, conclusion: run.conclusion, url: run.html_url, sha: run.head_sha }
    : null;
}
