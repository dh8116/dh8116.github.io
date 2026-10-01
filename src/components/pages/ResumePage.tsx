import { Fragment, type ReactNode } from "react";
import { resume } from "@/data/resume";
import { type Lang, ui } from "@/data/i18n";

export const RESUME_PDF = "/resume.pdf";
export const RESUME_FILENAME = "Richael-Resume.pdf";

// Turns "[label](url)" runs into links; everything else stays plain text.
function linkify(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return <Fragment key={i}>{part}</Fragment>;
    const external = m[2].startsWith("http");
    return (
      <a
        key={i}
        href={m[2]}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-brand-blue-light hover:underline"
      >
        {m[1]}
      </a>
    );
  });
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex list-disc flex-col gap-2 pl-6">
      {items.map((item) => (
        <li key={item}>{linkify(item)}</li>
      ))}
    </ul>
  );
}

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

      <article lang="en" className="mt-10 text-lg leading-relaxed text-zinc-300">
        <header>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {resume.name}
          </h2>
          {resume.contact.map((line, i) => (
            <p key={i} className={`whitespace-pre-wrap ${i === 0 ? "mt-2" : ""}`}>
              {linkify(line)}
            </p>
          ))}
        </header>

        {resume.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h3 className="font-bold uppercase text-foreground">
              {section.heading}
            </h3>
            {section.blocks.map((block, i) =>
              block.kind === "bullets" ? (
                <Bullets key={i} items={block.items} />
              ) : block.kind === "title" ? (
                <h4 key={i} className="mt-3 font-bold text-foreground">
                  {linkify(block.text)}
                </h4>
              ) : (
                <p key={i} className="mt-1 first-of-type:mt-2">
                  {linkify(block.text)}
                </p>
              )
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
