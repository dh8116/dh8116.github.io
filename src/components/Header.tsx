import Link from "next/link";
import { site } from "@/data/site";

export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="text-brand-blue-light">{site.firstName}</span>
          {site.lastName}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium lg:hidden">
          <Link
            href="/blog"
            className="rounded-full border border-white/10 bg-card px-4 py-1.5 text-zinc-300 transition-colors hover:text-brand-blue-light"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
