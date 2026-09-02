"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/#about", id: "about", label: "About" },
  { href: "/#skills", id: "skills", label: "Skills" },
  { href: "/#projects", id: "projects", label: "Projects" },
  { href: "/blog", id: "blog", label: "Blog" },
];

export default function SideNav() {
  const pathname = usePathname();
  const [visibleSection, setVisibleSection] = useState<string | null>(null);

  // Off the homepage the route decides; on it, the section in view does.
  const active =
    pathname === "/"
      ? visibleSection
      : pathname.startsWith("/blog")
        ? "blog"
        : null;

  useEffect(() => {
    if (pathname !== "/") return;

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
  }, [pathname]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 right-8 z-20 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      {links.map((link) => {
        const isActive = active === link.id;
        return (
          <Link
            key={link.href}
            href={link.href}
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
              {link.label}
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
