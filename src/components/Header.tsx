"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { langFromPath, localePath, ui } from "@/data/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  // The header sits in the root layout, so the route is what tells it which
  // language the page around it is in.
  const pathname = usePathname();
  const lang = langFromPath(pathname);

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href={localePath("/", lang)}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="text-brand-blue-light">{site.firstName}</span>
          {site.lastName}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href={localePath("/blog", lang)}
            className="rounded-full border border-white/10 bg-card px-4 py-1.5 text-zinc-300 transition-colors hover:text-brand-blue-light lg:hidden"
          >
            {ui[lang].nav.blog}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
