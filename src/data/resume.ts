// The resume as text, mirrored from public/resume.pdf (exported from the
// Google Doc — that is the source of truth). The text lives in resume.json so
// /admin/home can edit it; this file turns it into blocks for /resume.
//
// Format, one line per item:
//   # Name                      first line
//   any lines before the first ## are the contact lines under the name
//   ## HEADING                  section
//   ### Title                   bold sub-heading (a project name)
//   - text                      bullet
//   anything else               a plain line
// Inline links are [label](url).

import raw from "./resume.json";

export type ResumeBlock =
  | { kind: "line"; text: string }
  | { kind: "title"; text: string }
  | { kind: "bullets"; items: string[] };

export type ResumeSection = { heading: string; blocks: ResumeBlock[] };

export function parseResume(text: string) {
  let name = "";
  const contact: string[] = [];
  const sections: ResumeSection[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      sections.push({ heading: line.slice(3).trim(), blocks: [] });
      continue;
    }
    if (line.startsWith("# ") && !name) {
      name = line.slice(2).trim();
      continue;
    }

    const section = sections.at(-1);
    if (!section) {
      contact.push(line);
      continue;
    }

    const blocks = section.blocks;
    if (line.startsWith("### ")) {
      blocks.push({ kind: "title", text: line.slice(4).trim() });
    } else if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.kind === "bullets") last.items.push(line.slice(2).trim());
      else blocks.push({ kind: "bullets", items: [line.slice(2).trim()] });
    } else {
      blocks.push({ kind: "line", text: line });
    }
  }

  return { name, contact, sections };
}

export const resume = parseResume(raw.text);
