# Keeps the resume's forms in step:
#
#   public/resume.pdf     the download (normally a Google Docs export)
#   src/data/resume.json  the text /resume renders, in resume.ts's line format
#   the Google Doc        page 1 of the "Resume (Sep 2026)" doc
#
# Nothing here commits. At build time the NEWER of resume.pdf / resume.json
# (by last commit) is the source and the other is regenerated in the build
# workspace only, so the deploy is always consistent and main never gains
# bot commits. A tie goes to the PDF: it is the export of the real document.
#
#   python scripts/resume-sync.py build      sync the workspace, crop preview,
#                                            and carry edited text into the Doc
#   python scripts/resume-sync.py doc-pull   export the Doc; if its text differs
#                                            from the site's, replace
#                                            public/resume.pdf with it (the
#                                            workflow commits that change)
#   python scripts/resume-sync.py pdf|text   force a direction (local use)
#
# Google access needs the GOOGLE_SERVICE_ACCOUNT env var: a service-account
# JSON key whose client_email has edit access to the Doc. Without it the Doc
# steps are skipped and everything else still runs.

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
DOC_ID = "14lUervmjnXTZGJJ4vjLKb4UquATYVB5p1eDMMvOBaog"

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


# ------------------------------------------------------------- Google Doc


def _google(scopes):
    info = os.environ.get("GOOGLE_SERVICE_ACCOUNT", "").strip()
    if not info:
        return None
    from google.oauth2 import service_account

    return service_account.Credentials.from_service_account_info(json.loads(info), scopes=scopes)


def doc_export_pdf(path):
    """Page 1 of the Doc as a PDF at `path`; False when there are no credentials."""
    creds = _google(["https://www.googleapis.com/auth/drive.readonly"])
    if not creds:
        return False
    from googleapiclient.discovery import build

    data = build("drive", "v3", credentials=creds).files().export(
        fileId=DOC_ID, mimeType="application/pdf"
    ).execute()
    with open(path, "wb") as f:
        f.write(data)
    keep_first_page(path)
    return True


def _u16(s):
    # Docs API indexes are UTF-16 code units.
    return len(s.encode("utf-16-le")) // 2


def _para_text(p):
    return "".join(e.get("textRun", {}).get("content", "") for e in p.get("elements", []))


def _has_cjk(s):
    return re.search(r"[㐀-鿿]", s) is not None


def _classify(lines):
    """Kind of each line of the line format, matching resume.ts."""
    kinds, seen_heading = [], False
    for i, l in enumerate(lines):
        if i == 0 and l.startswith("# "):
            kinds.append("name")
        elif l.startswith("## "):
            kinds.append("heading")
            seen_heading = True
        elif not seen_heading:
            kinds.append("contact")
        elif l.startswith("### "):
            kinds.append("title")
        elif l.startswith("- "):
            kinds.append("bullet")
        else:
            kinds.append("line")
    return kinds


PARA_FIELDS = ["lineSpacing", "spaceAbove", "spaceBelow", "alignment", "direction"]
TEXT_FIELDS = ["bold", "italic", "fontSize", "weightedFontFamily", "foregroundColor", "underline"]


def _sample_styles(english):
    """The Doc's current paragraph + text style for each kind of line, so a
    rewrite looks exactly like the Doc did — nothing is invented here."""
    style, link_style, kinds = {}, None, []
    for c in english:
        p = c["paragraph"]
        t = _para_text(p).strip()
        runs = [e["textRun"] for e in p.get("elements", []) if "textRun" in e]
        texty = [r for r in runs if r["content"].strip()]
        all_bold = bool(texty) and all(r.get("textStyle", {}).get("bold") for r in texty)
        first_bold = bool(texty) and texty[0].get("textStyle", {}).get("bold")
        if not kinds:
            kind = "name"
        elif all_bold and t == t.upper():
            kind = "heading"
        elif "heading" not in kinds:
            kind = "contact"
        elif "bullet" in p:
            kind = "bullet"
        elif first_bold:
            kind = "title"
        else:
            kind = "line"
        kinds.append(kind)
        if kind not in style and texty:
            plain = next((r for r in texty if not r.get("textStyle", {}).get("link")), texty[0])
            ts = dict(plain.get("textStyle", {}))
            if kind == "title":
                ts["bold"] = False  # the bold part is applied separately
            style[kind] = (p.get("paragraphStyle", {}), ts)
        for r in runs:
            if r.get("textStyle", {}).get("link") and link_style is None:
                link_style = r["textStyle"]
    fallback = style.get("line") or style.get("bullet") or ({}, {})
    for k in ("name", "contact", "heading", "title", "bullet", "line"):
        style.setdefault(k, fallback)
    return style, link_style


def doc_push(text):
    """Rewrite page 1 of the Doc (everything before the Chinese page) from the
    line format. Google keeps every prior version in the Doc's history."""
    creds = _google(["https://www.googleapis.com/auth/documents"])
    if not creds:
        return False
    from googleapiclient.discovery import build

    docs = build("docs", "v1", credentials=creds).documents()
    doc = docs.get(documentId=DOC_ID).execute()
    paras = [c for c in doc["body"]["content"] if "paragraph" in c]

    english, end = [], None
    for c in paras:
        t = _para_text(c["paragraph"])
        if _has_cjk(t):
            end = c["startIndex"]
            break
        if t.strip():
            english.append(c)
    if end is None:
        end = paras[-1]["endIndex"]
    style, link_style = _sample_styles(english)

    # New content, with [label](url) resolved to plain text + link ranges.
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    kinds = _classify(lines)
    plain_lines, links, bold_cut = [], [], {}
    for n, (line, kind) in enumerate(zip(lines, kinds)):
        body = re.sub(r"^(#{1,3} |- )", "", line)
        out, pos, first_link = "", 0, None
        for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", body):
            out += body[pos : m.start()]
            if first_link is None:
                first_link = _u16(out)
            links.append((n, _u16(out), _u16(m.group(1)), m.group(2)))
            out += m.group(1)
            pos = m.end()
        out += body[pos:]
        if kind == "title":
            # bold up to the first link, as in the Doc ("Soulor AI — " + link)
            bold_cut[n] = first_link if first_link is not None else _u16(out)
        plain_lines.append(out)

    new = "\n".join(plain_lines)
    starts, at = [], 1
    for l in plain_lines:
        starts.append(at)
        at += _u16(l) + 1

    # Delete the old English page but keep its last paragraph mark; the new
    # text is inserted in front of that mark, so it becomes the last line.
    reqs = []
    if end - 1 > 1:
        reqs.append({"deleteContentRange": {"range": {"startIndex": 1, "endIndex": end - 1}}})
    reqs.append({"insertText": {"location": {"index": 1}, "text": new}})
    whole = {"startIndex": 1, "endIndex": 1 + _u16(new) + 1}
    reqs.append({"deleteParagraphBullets": {"range": whole}})

    for n, (line, kind) in enumerate(zip(plain_lines, kinds)):
        pstyle, tstyle = style[kind]
        pf = [f for f in PARA_FIELDS if f in pstyle]
        reqs.append({"updateParagraphStyle": {
            "range": {"startIndex": starts[n], "endIndex": starts[n] + _u16(line) + 1},
            "paragraphStyle": {
                **{f: pstyle[f] for f in pf},
                "namedStyleType": "NORMAL_TEXT",
                "indentStart": {"magnitude": 0, "unit": "PT"},
                "indentFirstLine": {"magnitude": 0, "unit": "PT"},
            },
            "fields": ",".join(pf + ["namedStyleType", "indentStart", "indentFirstLine"]),
        }})
        if line:
            ts = {f: tstyle[f] for f in TEXT_FIELDS if f in tstyle}
            ts.setdefault("bold", False)
            ts.setdefault("underline", False)
            reqs.append({"updateTextStyle": {
                "range": {"startIndex": starts[n], "endIndex": starts[n] + _u16(line)},
                "textStyle": ts,
                "fields": ",".join(list(ts) + ["link"]),
            }})
    for n, cut in bold_cut.items():
        if cut:
            reqs.append({"updateTextStyle": {
                "range": {"startIndex": starts[n], "endIndex": starts[n] + cut},
                "textStyle": {"bold": True}, "fields": "bold"}})
    for n, off, length, url in links:
        ls = {"link": {"url": url}, "underline": True}
        if link_style and "foregroundColor" in link_style:
            ls["foregroundColor"] = link_style["foregroundColor"]
        reqs.append({"updateTextStyle": {
            "range": {"startIndex": starts[n] + off, "endIndex": starts[n] + off + length},
            "textStyle": ls, "fields": ",".join(ls)}})
    # Bullets last: createParagraphBullets applies the Doc's own list indents.
    n = 0
    while n < len(kinds):
        if kinds[n] != "bullet":
            n += 1
            continue
        m = n
        while m + 1 < len(kinds) and kinds[m + 1] == "bullet":
            m += 1
        reqs.append({"createParagraphBullets": {
            "range": {"startIndex": starts[n], "endIndex": starts[m] + _u16(plain_lines[m])},
            "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"}})
        n = m + 1

    docs.batchUpdate(documentId=DOC_ID, body={"requests": reqs}).execute()
    return True


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
        # The site's text is newer than the Doc: carry it into the Doc too,
        # unless the Doc already says the same thing.
        tmp = PDF + ".doc"
        try:
            if doc_export_pdf(tmp):
                if pdf_to_text(tmp) != text:
                    doc_push(text)
                    print("  Google Doc page 1 rewritten from resume.json")
                else:
                    print("  Google Doc already matches")
            else:
                print("  no GOOGLE_SERVICE_ACCOUNT, so the Doc was not updated")
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
    shutil.copy(TEXT, PUBLIC_TEXT)
    crop_preview()


def doc_pull():
    """Prints CHANGED when public/resume.pdf was replaced by the Doc's export."""
    tmp = PDF + ".doc"
    if not doc_export_pdf(tmp):
        print("resume-sync: no GOOGLE_SERVICE_ACCOUNT, skipping")
        return
    try:
        current = read_text() if effective_source() == "text" else pdf_to_text(PDF)
        if pdf_to_text(tmp) != current:
            os.replace(tmp, PDF)
            print("CHANGED")
        else:
            print("resume-sync: the Doc matches the site")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "build"
    if arg == "doc-pull":
        doc_pull()
    elif arg in ("pdf", "text"):
        build(arg)
    else:
        build()
