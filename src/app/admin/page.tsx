import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminChrome";

const TOOLS = [
  {
    href: "/admin/posts",
    name: "Blog posts",
    desc: "Write a new post or edit an existing one, in English and Chinese.",
  },
  {
    href: "/admin/home",
    name: "Home page text",
    desc: "Tagline, bio, projects, about cards, skills and what you're currently on.",
  },
  {
    href: "/",
    name: "View the site",
    desc: "Open dh8116.github.io as a reader sees it.",
  },
];

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <AdminHeader title="Admin" back="/" />
      <p className="mb-8 text-sm leading-relaxed text-foreground/60">
        Every save here commits to <span className="font-mono">main</span>, which
        starts the Pages deploy. You stay on the page until it reports back live.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-xl border border-white/10 bg-card p-5 transition hover:border-brand-blue/50"
          >
            <div className="font-mono text-base font-semibold">{t.name}</div>
            <div className="mt-2 text-sm leading-relaxed text-foreground/60">
              {t.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
