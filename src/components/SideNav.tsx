import Link from "next/link";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export default function SideNav() {
  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 right-6 z-20 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-white/10 bg-card/80 p-2 backdrop-blur-sm lg:flex"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-brand-blue-light"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
