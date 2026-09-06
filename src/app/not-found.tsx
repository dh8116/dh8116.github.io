import Link from "next/link";
import { posts } from "@/data/posts";

// Root not-found also catches every unmatched URL in the static export, which
// is how GitHub Pages' 404.html gets its content.
export default function NotFound() {
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-20">
      <p className="font-mono text-sm font-medium uppercase tracking-widest text-brand-blue-light">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Index out of bounds
        <span className="ml-1 inline-block h-7 w-[0.6ch] translate-y-0.5 animate-pulse bg-brand-yellow align-baseline motion-reduce:animate-none sm:h-9" />
      </h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-card p-6">
        <pre className="font-mono text-sm leading-relaxed text-zinc-300">
          <code>
            {"offsets = tl.arange(0, BLOCK)\n"}
            {"mask    = offsets < n_pages"}
            <span className="text-zinc-500">
              {"        # this URL is not in range"}
            </span>
            {"\n"}
            {"page    = tl.load(site + offsets, mask=mask, other="}
            <span className="text-brand-yellow">404</span>
            {")"}
          </code>
        </pre>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-zinc-400">
        You asked for a page past the end of the buffer. In a kernel this is
        where the mask kicks in and hands back whatever you set{" "}
        <code className="font-mono text-zinc-300">other</code> to, instead of
        reading memory that was never yours. Here,{" "}
        <code className="font-mono text-zinc-300">other</code> is this page.
      </p>
      <p className="mt-4 text-lg leading-relaxed text-zinc-400">
        Nothing crashed. The link is just wrong, or it used to point at
        something I have since renamed.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light"
        >
          Back in range
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black"
        >
          Read the blog
        </Link>
      </div>

      <h2 className="mt-16 text-xs font-medium uppercase tracking-widest text-zinc-500">
        Or try one of these
      </h2>
      <div className="mt-5 flex flex-col gap-4">
        {latestPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-white/10 p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-yellow/50 hover:shadow-xl hover:shadow-brand-yellow/10"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {post.date}
            </p>
            <h3 className="mt-2 font-semibold group-hover:text-brand-yellow">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
