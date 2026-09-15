"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HTML_LANG,
  LANGS,
  LANG_LABEL,
  langFromPath,
  switchPath,
  ui,
} from "@/data/i18n";

/**
 * Segmented EN / 中文 control in the header. Each side is a real link to the
 * same page in the other language, so the choice is bookmarkable, shareable and
 * survives a reload — no client-side text swapping, no flash of the wrong
 * language on the way in.
 */
export default function LanguageToggle() {
  const pathname = usePathname();
  const current = langFromPath(pathname);

  return (
    <div
      role="group"
      aria-label={ui[current].toggleLabel}
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-card p-0.5 text-xs font-semibold"
    >
      {LANGS.map((lang) => {
        const isActive = lang === current;
        return (
          <Link
            key={lang}
            href={switchPath(pathname, lang)}
            hrefLang={HTML_LANG[lang]}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-3 py-1 transition-colors ${
              isActive
                ? "bg-brand-blue text-white"
                : "text-zinc-400 hover:text-brand-blue-light"
            }`}
          >
            {LANG_LABEL[lang]}
          </Link>
        );
      })}
    </div>
  );
}
