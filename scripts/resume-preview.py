# Crops the top of public/resume.pdf (name, contact lines, start of the
# profile) into public/resume-preview.png, the clickable image in the homepage
# Resume section. Runs in the deploy workflow, so a PDF replaced from /admin
# gets a matching preview without anyone re-rendering it by hand.
# The clip and dpi fix the output at 1546x279, the size HomePage.tsx declares.
import pymupdf

page = pymupdf.open("public/resume.pdf")[0]
page.get_pixmap(dpi=200, clip=pymupdf.Rect(28, 30, 584, 130)).save(
    "public/resume-preview.png"
)
