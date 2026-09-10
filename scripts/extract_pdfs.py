"""Extract text from the two curriculum PDFs into text files for analysis."""
import fitz
import os

UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/scripts/pdf_text"
os.makedirs(OUT, exist_ok=True)

files = {
    "CURRICULUM LEVEL 1.pdf": "curriculum_level1.txt",
    "SCHEMES LEVEL two CLASS three .pdf": "schemes_level2_class3.txt",
}

for src, dst in files.items():
    doc = fitz.open(os.path.join(UPLOAD, src))
    parts = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        parts.append(f"\n===== PAGE {i+1} =====\n{text}")
    out_path = os.path.join(OUT, dst)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("".join(parts))
    print(f"{src}: {len(doc)} pages -> {out_path} ({os.path.getsize(out_path)} bytes)")
