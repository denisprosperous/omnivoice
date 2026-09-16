#!/usr/bin/env python3
"""Extract __NEXT_DATA__ JSON from a Bible.is chapter page."""
import json
import re
import sys

page_path = sys.argv[1] if len(sys.argv) > 1 else "mat1_page.html"
out_path = sys.argv[2] if len(sys.argv) > 2 else "mat1_next_data.json"

raw = open(page_path, encoding="utf-8").read()
m = re.search(
    r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', raw, re.S
)
if not m:
    print("NO_NEXT_DATA")
    sys.exit(1)

data = json.loads(m.group(1))
json.dump(data, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

props = data.get("props", {}).get("pageProps", {})
ct = props.get("chapterText", [])
print("keys in pageProps:", sorted(props.keys()))
print("verses:", len(ct))
for v in ct[:3]:
    print(v.get("verse_start"), "->", v.get("verse_text", "")[:80])
print("...")
for v in ct[-2:]:
    print(v.get("verse_start"), "->", v.get("verse_text", "")[:80])
