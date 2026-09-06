import Link from "next/link";
import { posts } from "@/data/posts";

// Root not-found also catches every unmatched URL in the static export, which
// is how GitHub Pages' 404.html gets its content.

// A fake recon session. Green is scoped to this block; the rest of the page
// stays on the site palette.
type TermLine =
  | { kind: "cmd"; text: string }
  | { kind: "hit"; path: string; status: "200" | "404" }
  | { kind: "out"; text: string }
  | { kind: "gap" };

const session: TermLine[] = [
  { kind: "cmd", text: "nmap -sV -Pn dh8116.github.io" },
  { kind: "out", text: "  443/tcp  open  ssl/https   GitHub Pages (static)" },
  { kind: "out", text: "  Service detection: no backend, no framework banner" },
  { kind: "gap" },
  { kind: "cmd", text: "ffuf -u https://dh8116.github.io/FUZZ -w common.txt" },
  { kind: "hit", path: "/", status: "200" },
  { kind: "hit", path: "/blog", status: "200" },
  { kind: "hit", path: "/admin", status: "404" },
  { kind: "hit", path: "/.env", status: "404" },
  { kind: "hit", path: "/.git/config", status: "404" },
  { kind: "hit", path: "/wp-login.php", status: "404" },
  { kind: "hit", path: "/api/v1/users", status: "404" },
  { kind: "gap" },
  { kind: "cmd", text: 'sqlmap -u "https://dh8116.github.io/?id=1" --dbs' },
  { kind: "out", text: "  [CRITICAL] no parameter reaches a database" },
  { kind: "gap" },
  { kind: "out", text: ":: 0 findings :: target is a folder of html ::" },
];

export default function NotFound() {
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-blue-light">
        HTTP/1.1 404 Not Found
      </p>
      <h1 className="mt-4 font-hacker text-[6rem] leading-none tracking-tight sm:text-[8.5rem] md:text-[10.5rem]">
        404
      </h1>
      <p className="mt-4 text-2xl font-medium text-brand-yellow sm:text-3xl">
        Nice try.
      </p>

      <div className="scanlines relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-card p-6">
        <div className="overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed text-term">
            <code>
              {session.map((line, i) => {
                const delay = { animationDelay: `${i * 0.09}s` };

                if (line.kind === "gap") {
                  return <span key={i} className="block h-4" />;
                }

                if (line.kind === "cmd") {
                  return (
                    <span key={i} className="term-line block" style={delay}>
                      <span className="text-term-dim">{"$ "}</span>
                      {line.text}
                    </span>
                  );
                }

                if (line.kind === "out") {
                  return (
                    <span
                      key={i}
                      className="term-line block text-term/60"
                      style={delay}
                    >
                      {line.text}
                    </span>
                  );
                }

                return (
                  <span key={i} className="term-line block" style={delay}>
                    <span className="inline-block w-[28ch] text-term/70">
                      {`  ${line.path}`}
                    </span>
                    <span
                      className={
                        line.status === "404"
                          ? "text-term crt-glow"
                          : "text-term/40"
                      }
                    >
                      {`[Status: ${line.status}]`}
                    </span>
                  </span>
                );
              })}
              <span
                className="term-line block"
                style={{ animationDelay: `${session.length * 0.09}s` }}
              >
                <span className="text-term-dim">{"$ "}</span>
                <span className="inline-block h-4 w-[0.6ch] translate-y-0.5 animate-pulse bg-term motion-reduce:animate-none" />
              </span>
            </code>
          </pre>
        </div>
      </div>

      <p className="mt-8 text-lg leading-relaxed">
        <a
          href="https://github.com/dh8116/dh8116.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-mono text-brand-blue-light underline underline-offset-4 hover:no-underline"
        >
          https://github.com/dh8116/dh8116.github.io
        </a>
      </p>
      <p className="mt-4 text-lg leading-relaxed text-zinc-400">
        If you got here by clicking a broken link rather than by fuzzing —
        sorry, no exploit either way. Just a wrong path.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-full bg-brand-blue px-5 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light"
        >
          cd /
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-brand-yellow px-5 py-2.5 font-mono text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black"
        >
          ls /blog
        </Link>
      </div>

      <h2 className="mt-16 text-xs font-medium uppercase tracking-widest text-zinc-500">
        Endpoints that do exist
      </h2>
      <div className="mt-5 flex flex-col gap-6">
        {latestPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-white/10 p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-yellow/50 hover:shadow-xl hover:shadow-brand-yellow/10"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {post.date}
            </p>
            <h3 className="mt-2 text-xl font-semibold group-hover:text-brand-yellow">
              {post.title}
            </h3>
            <p className="mt-2 text-zinc-400">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
