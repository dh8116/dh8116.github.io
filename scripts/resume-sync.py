# Keeps the resume's forms in step:
#
#   public/resume.pdf     the download (normally a Google Docs export)
#   src/data/resume.json  the text /resume renders, in resume.ts's line format
#
# Nothing here commits. At build time the NEWER of resume.pdf / resume.json
# (by last commit) is the source and the other is regenerated in the build
# workspace only, so the deploy is always consistent and main never gains
# bot commits. A tie goes to the PDF: it is the export of the real document.
#
#   python scripts/resume-sync.py build      sync the workspace, crop preview
#   python scripts/resume-sync.py pdf|text   force a direction (local use)
#
import json
import os
import re
import shutil
import subprocess
import sys

import pymupdf

PDF = "public/resume.pdf"
TEXT = "src/data/resume.json"
PREVIEW = "public/resume-preview.png"
PUBLIC_TEXT = "public/resume.json"  # what /admin/home loads, already synced

ZW = "​"
NBSP = " "
# Ligatures, plus the look-alikes MuPDF emits for Arial's hyphen (soft hyphen)
# and semicolon (Greek question mark) glyphs.
LIGATURES = {
    "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl",
    "­": "-", ";": ";",
}
MARKERS = ("●", "•")  # ● and •


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
    text = "".join(out).replace(ZW, "").replace(NBSP, " ")
    for lig, plain in LIGATURES.items():
        text = text.replace(lig, plain)
    return text


def _is_wrap(prev, text, size, right):
    """A line continues the previous one when the previous line was full —
    i.e. this line's first word would not have fitted after it."""
    _, prev_x1, prev_size = prev
    if size != prev_size:
        return False
    # "Full-stack: ...", "Relevant coursework: ..." — a short label and a colon
    # opens a new line even when the line above happens to run long.
    if re.match(r"^[\w&/ -]{1,25}: ", text):
        return False
    first_word = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text).split(" ", 1)[0]
    need = pymupdf.get_text_length(" " + first_word, fontname="helv", fontsize=size)
    return prev_x1 + need > right


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
        raw = "".join(s["text"] for s in spans).replace(ZW, "").strip()
        if raw in MARKERS:
            bullet_next = True
            continue
        # A rendered bullet can carry its marker in the same line as the text.
        if raw[:1] in MARKERS:
            head = spans[0]["text"].lstrip("".join(MARKERS) + ZW + " " + NBSP)
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
        elif prev and prev[0] in ("para", "wrap") and _is_wrap(prev, text, size, right):
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


# --------------------------------------------------------------- text -> PDF

LINK = "#1155cc"  # Google Docs' link blue


def _inline(s):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        rf'<a href="\2" style="color:{LINK};text-decoration:underline">\1</a>',
        s,
    )


def text_to_html(text):
    html, contact = [], True
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("## "):
            contact = False
            html.append(f'<p class="h2">{_inline(line[3:])}</p>')
        elif line.startswith("# "):
            html.append(f'<p class="h1">{_inline(line[2:])}</p>')
        elif contact:
            html.append(f'<p class="contact">{_inline(line).replace("  ", "&nbsp; ")}</p>')
        elif line.startswith("### "):
            html.append(f'<p class="h3">{_inline(line[4:])}</p>')
        elif line.startswith("- "):
            html.append(
                f'<p class="li"><span class="dot">●</span>'
                f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{_inline(line[2:])}</p>"
            )
        else:
            html.append(f"<p>{_inline(line)}</p>")
    return "\n".join(html)


# The Doc's own face. macOS ships it; the CI runner gets it from the
# ttf-mscorefonts-installer package (see deploy.yml).
ARIAL_DIRS = ["/System/Library/Fonts/Supplemental", "/usr/share/fonts/truetype/msttcorefonts"]
ARIAL_NAMES = {
    "regular": ["Arial.ttf", "arial.ttf"],
    "bold": ["Arial Bold.ttf", "Arial_Bold.ttf", "arialbd.ttf"],
}


def _arial():
    found = {}
    for weight, names in ARIAL_NAMES.items():
        for d in ARIAL_DIRS:
            hit = next((n for n in names if os.path.exists(os.path.join(d, n))), None)
            if hit:
                found[weight] = (d, hit)
                break
    if len(found) != 2:
        print("resume-sync: WARNING Arial not found, rendering in Helvetica")
        return None
    return found


def _css(regular, bold):
    # Mirrors the Google Doc: Arial 9.5pt body, 10pt bold headings, 18pt name,
    # 9pt contact lines, Letter with 0.5/0.4/0.6in margins.
    return f"""
@font-face {{ font-family: DocArial; src: url("{regular}"); }}
@font-face {{ font-family: DocArial; src: url("{bold}"); font-weight: bold; }}
* {{ font-family: DocArial; }}
body {{ font-size: 9.5pt; line-height: 1.2; color: #000; }}
p {{ margin: 0; }}
.h1 {{ font-size: 18pt; font-weight: bold; line-height: 1.15; }}
.contact {{ font-size: 9pt; }}
.h2 {{ font-size: 10pt; font-weight: bold; margin-top: 7pt; }}
.h3 {{ font-weight: bold; }}
.h3 a {{ font-weight: normal; }}
.li {{ margin-left: 36pt; text-indent: -18pt; }}
"""


def text_to_pdf(text, path):
    fonts = _arial()
    if fonts:
        archive = pymupdf.Archive()
        for d in {d for d, _ in fonts.values()}:
            archive.add(d)
        css = _css(fonts["regular"][1], fonts["bold"][1])
    else:
        archive = None
        css = re.sub(r"@font-face[^\n]*\n", "", _css("", "")).replace("DocArial", "sans-serif")
    story = pymupdf.Story(html=text_to_html(text), user_css=css, archive=archive)
    page_rect = pymupdf.paper_rect("letter")
    content = pymupdf.Rect(43.2, 36, page_rect.width - 43.2, page_rect.height - 28.8)
    # write_with_links keeps <a href> as clickable link annotations.
    doc = story.write_with_links(lambda n, filled: (page_rect, content, None))
    doc.save(path, garbage=3, deflate=True)


# ------------------------------------------------------------------- driver


def keep_first_page(path):
    """A Docs export carries every page (page 2 is the Chinese version); the
    site's download is the English page alone."""
    doc = pymupdf.open(path)
    if doc.page_count <= 1:
        return False
    doc.select([0])
    doc.save(path + ".tmp", garbage=3, deflate=True)
    doc.close()
    os.replace(path + ".tmp", path)
    return True


def last_commit_time(path):
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", path],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
        return int(out or 0)
    except (subprocess.CalledProcessError, ValueError):
        return 0


def crop_preview():
    # Name, contact lines and the start of the profile; 1546x279, the size
    # HomePage.tsx declares for the image.
    page = pymupdf.open(PDF)[0]
    page.get_pixmap(dpi=200, clip=pymupdf.Rect(28, 30, 584, 130)).save(PREVIEW)


def read_text():
    with open(TEXT) as f:
        return json.load(f)["text"]


def write_text(text):
    with open(TEXT, "w") as f:
        f.write(json.dumps({"text": text}, ensure_ascii=False, indent=2) + "\n")


def effective_source():
    return "text" if last_commit_time(TEXT) > last_commit_time(PDF) else "pdf"


def build(mode=None):
    mode = mode or effective_source()
    print(f"resume-sync: source is the {mode}")
    if mode == "pdf":
        if keep_first_page(PDF):
            print("  trimmed the PDF to its first page")
        text = pdf_to_text(PDF)
        if text != read_text():
            write_text(text)
            print("  resume.json regenerated from the PDF (build workspace only)")
    else:
        text = read_text()
        text_to_pdf(text, PDF)
        print("  resume.pdf rendered from resume.json (build workspace only)")
    shutil.copy(TEXT, PUBLIC_TEXT)
    crop_preview()


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "build"
    if arg in ("pdf", "text"):
        build(arg)
    else:
        build()
