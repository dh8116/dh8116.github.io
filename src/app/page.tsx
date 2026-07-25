import Link from "next/link";
import { site, projects } from "@/data/site";
import { posts } from "@/data/posts";

export default function Home() {
  const latestPosts = posts.slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-6">
      <section className="flex flex-col gap-6 py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-blue-light">
          {site.tagline}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
          Building AI products and writing about the process.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="#projects"
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-light"
          >
            View projects
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black"
          >
            GitHub
          </a>
        </div>
      </section>

      <section id="projects" className="scroll-mt-24 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <div className="mt-8 grid gap-6">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="rounded-2xl border border-white/10 p-6 transition-colors hover:border-brand-blue/50"
            >
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <p className="mt-2 text-zinc-400">{project.description}</p>
              <div className="mt-4 flex gap-4 text-sm font-medium">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue-light hover:underline"
                >
                  Visit site &rarr;
                </a>
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-yellow hover:underline"
                >
                  Source &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Latest writing
          </h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-brand-blue-light hover:underline"
          >
            All posts &rarr;
          </Link>
        </div>
        <div className="mt-8 flex flex-col gap-6">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-white/10 p-6 transition-colors hover:border-brand-yellow/50"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {post.date}
              </p>
              <h3 className="mt-2 text-lg font-semibold group-hover:text-brand-yellow">
                {post.title}
              </h3>
              <p className="mt-2 text-zinc-400">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
