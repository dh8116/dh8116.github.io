import Link from "next/link";
import { site } from "@/data/site";

export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/#projects" className="transition-colors hover:text-brand-blue-light">
            Projects
          </Link>
          <Link href="/blog" className="transition-colors hover:text-brand-blue-light">
            Blog
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-yellow"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
