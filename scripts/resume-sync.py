# Keeps the resume's two forms in step, then crops the homepage preview.
#
#   public/resume.pdf     the download (normally a Google Docs export)
#   src/data/resume.json  the text /resume renders, in resume.ts's line format
#
# Runs in the deploy workflow before the build. It looks at what the commit
# being deployed changed:
#   - the PDF changed       -> the text is re-extracted from the PDF
#   - only the text changed -> the PDF is re-rendered from the text
# The PDF wins when both changed: it is the export of the real document.
# The workflow then commits whatever this rewrote back to main, so the repo,
# /admin and the live site all agree.
#
#   python scripts/resume-sync.py            decide from the last commit
#   python scripts/resume-sync.py pdf|text   force a direction (local use)

import json
import re
import subprocess
import sys

import pymupdf

PDF = "public/resume.pdf"
TEXT = "src/data/resume.json"
PREVIEW = "public/resume-preview.png"

LINK = "#1155cc"  # Google Docs' link blue


# --------------------------------------------------------------- PDF -> text


def _link_at(links, bbox):
    cx, cy = (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2
    for link in links:
        r = link["from"]
        if r.x0 <= cx <= r.x1 and r.y0 <= cy <= r.y1:
            return link.get("uri")
    return None


def _https(uri):
    return re.sub(r"^http://", "https://", uri)


def _line_text(spans, links):
    """Span text with linked runs written as [label](url)."""
    out, run, run_uri = [], "", None
    for s in spans:
        uri = _link_at(links, s["bbox"])
        if uri != run_uri and run:
            out.append(f"[{run.strip()}]({_https(run_uri)})" if run_uri else run)
            # keep the space that sat inside the link run outside the brackets
            if run_uri and run != run.rstrip():
                out.append(" ")
            run = ""
        run_uri = uri
        run += s["text"]
    if run:
        out.append(f"[{run.strip()}]({_https(run_uri)})" if run_uri else run)
    text = "".join(out).replace("\u200b", "").replace("\u00a0", " ")
    for lig, plain in (("\ufb01", "fi"), ("\ufb02", "fl"), ("\ufb00", "ff"), ("\ufb03", "ffi"), ("\ufb04", "ffl")):
        text = text.replace(lig, plain)
    return text


def pdf_to_text(path):
    page = pymupdf.open(path)[0]
    links = [l for l in page.get_links() if l.get("uri")]
    right = page.rect.width - 43.2  # Docs export: text block ends at the right margin

    rows = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = [s for s in line["spans"] if s["text"].strip()]
            if spans:
                rows.append(spans)

    out = []
    bullet_next = False
    prev = None  # (kind, right edge, font size) of the previous text line
    for spans in rows:
        raw = "".join(s["text"] for s in spans).replace("\u200b", "").strip()
        if raw in ("●", "•"):
            bullet_next = True
            continue
        # A rendered bullet can carry its marker in the same line as the text.
        if raw[:1] in ("●", "•"):
            head = spans[0]["text"].lstrip("●•\u200b \u00a0")
            spans = ([dict(spans[0], text=head)] if head.strip() else []) + spans[1:]
            raw = raw[1:].strip()
            bullet_next = True

        first = spans[0]
        size = first["size"]
        bold = all("Bold" in s["font"] for s in spans)
        text = _line_text(spans, links).strip()
        x0, x1 = first["bbox"][0], spans[-1]["bbox"][2]

        if size >= 14 and bold:
            out.append("# " + text)
            kind = "name"
        elif bold and size >= 9.9 and raw == raw.upper():
            out.append("")
            out.append("## " + text)
            kind = "heading"
        elif bullet_next:
            out.append("- " + text)
            kind = "bullet"
        elif prev and prev[0] == "bullet" and x0 > 60:
            # bullet text wraps to the bullet's indent, not to the margin
            out[-1] = out[-1].rstrip() + " " + text
            kind = "bullet"
        elif prev and prev[0] in ("para", "wrap") and _is_wrap(prev, text, size, right, x0):
            out[-1] = out[-1].rstrip() + " " + text
            kind = "wrap"
        elif "Bold" in first["font"] and out and not out[-1].startswith("# "):
            out.append("### " + text)
            kind = "title"
        else:
            out.append(text)
            kind = "para"

        bullet_next = False
        prev = (kind, x1, size)

    # Docs pads a few separators with double spaces; keep them only in the
    # contact lines under the name, where "  |  " is the intended spacing.
    body_from = next((i for i, l in enumerate(out) if l.startswith("## ")), len(out))
    out = out[:body_from] + [re.sub(r"(?<=\S) {2,}(?=\S)", " ", l) for l in out[body_from:]]
    return "\n".join(out).strip() + "\n"


def _is_wrap(prev, text, size, right, x0):
    """A line continues the previous one when the previous line was full —
    i.e. this line's first word would not have fitted after it."""
    kind, prev_x1, prev_size = prev
    if size != prev_size:
        return False
    # "Full-stack: ...", "Relevant coursework: ..." — a short label and a colon
    # opens a new line even when the line above happens to run long.
    if kind != "bullet" and re.match(r"^[\w&/ -]{1,25}: ", text):
        return False
    first_word = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text).split(" ", 1)[0]
    need = pymupdf.get_text_length(" " + first_word, fontname="helv", fontsize=size)
    return prev_x1 + need > right


# --------------------------------------------------------------- text -> PDF


def _inline(s):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        rf'<a href="\2" style="color:{LINK};text-decoration:underline">\1</a>',
        s,
    )


def text_to_html(text):
    html, contact, in_list = [], True, False

    def close():
        nonlocal in_list
        if in_list:
            html.append("</ul>")
            in_list = False

    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("## "):
            close()
            contact = False
            html.append(f'<p class="h2">{_inline(line[3:])}</p>')
        elif line.startswith("# "):
            html.append(f'<p class="h1">{_inline(line[2:])}</p>')
        elif contact:
            html.append(f'<p class="contact">{_inline(line).replace("  ", "&nbsp; ")}</p>')
        elif line.startswith("### "):
            close()
            html.append(f'<p class="h3">{_inline(line[4:])}</p>')
        elif line.startswith("- "):
            close()
            html.append(f'<p class="li"><span class="dot">●</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{_inline(line[2:])}</p>')
        else:
            close()
            html.append(f"<p>{_inline(line)}</p>")
    close()
    return "\n".join(html)


# Mirrors the Google Doc: Arial-metric sans (Helvetica here), 9.5pt body,
# 10pt bold headings, 18pt name, Letter with 0.5/0.4/0.6in margins.
CSS = """
* { font-family: sans-serif; }
body { font-size: 9.5pt; line-height: 1.2; color: #000; }
p { margin: 0; }
.h1 { font-size: 18pt; font-weight: bold; line-height: 1.15; }
.contact { font-size: 9pt; }
.h2 { font-size: 10pt; font-weight: bold; margin-top: 7pt; }
.h3 { font-weight: bold; }
.h3 a { font-weight: normal; }
.dot { font-size: 6pt; }
.li { margin-left: 36pt; text-indent: -18pt; }
"""


def text_to_pdf(text, path):
    story = pymupdf.Story(html=text_to_html(text), user_css=CSS)
    page_rect = pymupdf.paper_rect("letter")
    content = pymupdf.Rect(43.2, 36, page_rect.width - 43.2, page_rect.height - 28.8)
    # write_with_links keeps <a href> as clickable link annotations.
    doc = story.write_with_links(lambda n, filled: (page_rect, content, None))
    doc.save(path, garbage=3, deflate=True)


# ------------------------------------------------------------------- driver


def changed_in_last_commit():
    try:
        out = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            check=True, capture_output=True, text=True,
        ).stdout.split()
    except subprocess.CalledProcessError:
        return set()
    return set(out)


def keep_first_page(path):
    """A Docs export carries every page (page 2 is the Chinese version); the
    site's download is the English page alone."""
    doc = pymupdf.open(path)
    if doc.page_count > 1:
        doc.select([0])
        doc.save(path + ".tmp", garbage=3, deflate=True)
        doc.close()
        import os
        os.replace(path + ".tmp", path)
        return True
    return False


def crop_preview():
    # Name, contact lines and the start of the profile; 1546x279, the size
    # HomePage.tsx declares for the image.
    page = pymupdf.open(PDF)[0]
    page.get_pixmap(dpi=200, clip=pymupdf.Rect(28, 30, 584, 130)).save(PREVIEW)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else None
    if mode is None:
        changed = changed_in_last_commit()
        mode = "pdf" if PDF in changed else "text" if TEXT in changed else "none"
    print(f"resume-sync: {mode}")

    if mode == "pdf":
        if keep_first_page(PDF):
            print("  trimmed the PDF to its first page")
        current = json.load(open(TEXT))["text"]
        text = pdf_to_text(PDF)
        if text != current:
            json.dump({"text": text}, open(TEXT, "w"), ensure_ascii=False, indent=2)
            open(TEXT, "a").write("\n")
            print("  rewrote resume.json from the PDF")
    elif mode == "text":
        text_to_pdf(json.load(open(TEXT))["text"], PDF)
        print("  rendered resume.pdf from resume.json")

    crop_preview()


if __name__ == "__main__":
    main()
