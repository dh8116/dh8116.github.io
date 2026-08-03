import Image from "next/image";
import Link from "next/link";
import { site, projects, aboutCards, skills } from "@/data/site";
import { posts } from "@/data/posts";
import PersonalDetailsCard from "@/components/PersonalDetailsCard";
import FadeInSection from "@/components/FadeInSection";

export default function Home() {
  const latestPosts = posts.slice(0, 2);

  return (
    <div className="mx-auto max-w-5xl px-6 lg:pr-40">
      <section className="grid grid-cols-1 items-center gap-12 py-24 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-card p-8 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-blue-light">
            Hello, I&apos;m
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-brand-blue-light">{site.firstName}</span>{" "}
            <span>{site.lastName}</span>
          </h1>
          <p className="text-lg font-medium text-brand-yellow">
            {site.tagline}
          </p>
          <p className="max-w-xl leading-relaxed text-zinc-400">{site.bio}</p>
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
            <a
              href={site.x}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-brand-blue-light hover:text-brand-blue-light"
            >
              X
            </a>
          </div>
        </div>
        <div className="group relative h-56 w-56 overflow-hidden rounded-3xl border border-white/10 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10 sm:h-64 sm:w-64">
          <Image
            src={site.avatar}
            alt={site.name}
            fill
            sizes="256px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            priority
          />
        </div>
      </section>

      <FadeInSection>
        <section id="about" className="scroll-mt-24 py-16">
          <SectionHeading eyebrow="My" title="About" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-6 sm:grid-cols-2">
              {aboutCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-card p-6"
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-brand-blue-light">
                    {card.period}
                  </p>
                  <h3 className="mt-2 font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
            <PersonalDetailsCard />
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="skills" className="scroll-mt-24 py-16">
          <SectionHeading eyebrow="My" title="Skills" />
          <div className="mt-8 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-card px-4 py-2 text-sm text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="projects" className="scroll-mt-24 py-16">
          <SectionHeading eyebrow="My" title="Projects" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.slug}
                className="flex flex-col rounded-2xl border border-white/10 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                  {project.status && (
                    <span className="rounded-full border border-brand-yellow/40 px-2.5 py-1 text-xs font-medium text-brand-yellow">
                      {project.status}
                    </span>
                  )}
                </div>
                <p className="mt-3 flex-1 text-sm text-zinc-400">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs text-brand-blue-light"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-4 text-sm font-medium">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue-light hover:underline"
                    >
                      Visit site &rarr;
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-yellow hover:underline"
                    >
                      Source &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="py-16">
          <div className="flex items-baseline justify-between">
            <SectionHeading eyebrow="Latest" title="Writing" />
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
                className="group block rounded-2xl border border-white/10 bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-yellow/50 hover:shadow-xl hover:shadow-brand-yellow/10"
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
      </FadeInSection>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        {eyebrow} <span className="text-brand-blue-light">{title}</span>
      </h2>
      <div className="mt-3 h-1 w-12 rounded-full bg-brand-blue" />
    </div>
  );
}

