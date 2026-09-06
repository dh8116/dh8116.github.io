import Link from "next/link";
import { posts } from "@/data/posts";

// Root not-found also catches every unmatched URL in the static export, which
// is how GitHub Pages' 404.html gets its content.

// Each row is [path, status]; a "200" row renders dim, a "404" row renders hot.
const scanRows: [string, "200" | "404"][] = [
  ["/", "200"],
  ["/blog", "200"],
  ["/admin", "404"],
  ["/.env", "404"],
  ["/wp-login.php", "404"],
  ["/whatever-you-just-tried", "404"],
];

export default function NotFound() {
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="font-mono text-sm font-medium uppercase tracking-widest text-term">
        HTTP/1.1 404 Not Found
      </p>

      <h1
        aria-label="404"
        className="glitch crt-glow mt-4 select-none font-mono text-[5.5rem] font-bold leading-none tracking-tighter text-term sm:text-[8rem] md:text-[10rem]"
        data-text="404"
      >
        <span aria-hidden="true">404</span>
      </h1>

      <p className="mt-4 font-mono text-2xl font-bold tracking-tight text-term-dim sm:text-3xl">
        Nice try.
      </p>

      <div className="scanlines relative mt-8 overflow-hidden rounded-2xl border border-term/25 bg-card p-6 shadow-xl shadow-term/5">
        <div className="overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed text-term">
            <code>
              <span className="term-line block">
                <span className="text-term-dim">{"$ "}</span>
                {"ffuf -u https://dh8116.github.io/FUZZ -w common.txt"}
              </span>
              <span className="block h-4" />
              {scanRows.map(([path, status], i) => (
                <span
                  key={path}
                  className="term-line block"
                  style={{ animationDelay: `${0.25 + i * 0.12}s` }}
                >
                  <span className="text-term/50">{"  "}</span>
                  <span className="inline-block w-[26ch] text-term/70">
                    {path}
                  </span>
                  <span
                    className={
                      status === "404" ? "text-term crt-glow" : "text-term/40"
                    }
                  >
                    {`[Status: ${status}]`}
                  </span>
                </span>
              ))}
              <span className="block h-4" />
              <span
                className="term-line block text-term/60"
                style={{ animationDelay: "1.1s" }}
              >
                {":: 0 findings :: nothing exposed here ::"}
                <span className="ml-1 inline-block h-4 w-[0.6ch] translate-y-0.5 animate-pulse bg-term motion-reduce:animate-none" />
              </span>
            </code>
          </pre>
        </div>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-term/70">
        That path is not on this site. If you were fuzzing for it, the wordlist
        is not the problem — there is no admin panel, no{" "}
        <code className="font-mono text-term">.env</code>, and no login to brute
        force. This is a static site: no server, no database, no session to
        steal. Everything behind it is a folder of HTML files, and all of it is
        already public on GitHub.
      </p>
      <p className="mt-4 text-lg leading-relaxed text-term/70">
        If you just clicked a broken link instead — sorry. Same page, less
        interesting reason.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-full bg-term px-5 py-2.5 font-mono text-sm font-semibold text-black transition-colors hover:bg-term-dim"
        >
          cd /
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-term px-5 py-2.5 font-mono text-sm font-semibold text-term transition-colors hover:bg-term hover:text-black"
        >
          ls /blog
        </Link>
      </div>

      <h2 className="mt-16 font-mono text-xs font-medium uppercase tracking-widest text-term/50">
        Endpoints that do exist
      </h2>
      <div className="mt-5 flex flex-col gap-4">
        {latestPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-term/20 p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-term/60 hover:shadow-xl hover:shadow-term/10"
          >
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-term/50">
              {post.date}
            </p>
            <h3 className="mt-2 font-semibold text-term/80 group-hover:text-term">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
