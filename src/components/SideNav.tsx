"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { langFromPath, localePath, stripLang, ui } from "@/data/i18n";

const links = [
  { path: "/#about", id: "about" },
  { path: "/#skills", id: "skills" },
  { path: "/#projects", id: "projects" },
  { path: "/blog", id: "blog" },
] as const;

export default function SideNav() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const route = stripLang(pathname);
  const labels = ui[lang].nav;
  const [visibleSection, setVisibleSection] = useState<string | null>(null);

  // Off the homepage the route decides; on it, the section in view does.
  const active =
    route === "/"
      ? visibleSection
      : route.startsWith("/blog")
        ? "blog"
        : null;

  useEffect(() => {
    if (route !== "/") return;

    const sections = ["about", "skills", "projects"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setVisibleSection(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [route]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 right-8 z-20 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      {links.map((link) => {
        const isActive = active === link.id;
        return (
          <Link
            key={link.id}
            href={localePath(link.path, lang)}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-3 text-xs font-medium tracking-widest uppercase"
          >
            <span
              className={`transition-colors duration-300 ${
                isActive
                  ? "text-brand-blue-light"
                  : "text-zinc-500 group-hover:text-zinc-200"
              }`}
            >
              {labels[link.id]}
            </span>
            <span
              className={`h-px transition-all duration-300 ${
                isActive
                  ? "w-8 bg-brand-blue-light"
                  : "w-4 bg-white/25 group-hover:w-6 group-hover:bg-white/60"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
