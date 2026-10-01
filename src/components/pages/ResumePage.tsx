import Image from "next/image";
import { type Lang, ui } from "@/data/i18n";

// The PDF is the source of truth; resume.png is its single page rendered at
// 200 dpi. Embedding the PDF itself would need frame-src/object-src, which the
// export CSP keeps at 'none' — re-render the PNG whenever the PDF changes.
export const RESUME_PDF = "/resume.pdf";
export const RESUME_FILENAME = "Richael-Resume.pdf";

export default function ResumePage({ lang }: { lang: Lang }) {
  const t = ui[lang];

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.home.resume.eyebrow}
            {lang === "en" ? " " : ""}
            <span className="text-brand-blue-light">{t.home.resume.title}</span>
          </h1>
          <div className="mt-3 h-1 w-12 rounded-full bg-brand-blue" />
        </div>
        <a
          href={RESUME_PDF}
          download={RESUME_FILENAME}
          className="rounded-full border border-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black"
        >
          {t.resume.download}
        </a>
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-card p-2 transition-all duration-200 hover:border-brand-blue/50 hover:shadow-xl hover:shadow-brand-blue/10 sm:p-3">
        <Image
          src="/resume.png"
          alt="Richael — resume"
          width={1700}
          height={2200}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full rounded-xl"
          priority
        />
      </div>
    </div>
  );
}
