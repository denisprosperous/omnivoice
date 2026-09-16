#!/usr/bin/env python3
"""
OMNIVOICE — Kom Audio Bible scraper (Bible.is / Faith Comes By Hearing).

Scrapes the Gospel of Matthew (BKMBSC = Kom Itaŋikom NT, 2004 Bible Society of
Cameroon) paired with the New International Version (ENGNIV):
  - verse-aligned text for both languages (SSR __NEXT_DATA__)
  - signed chapter audio URLs (fileset API) + chapter mp3 download (Kom)

Everything is saved to scripts/bibleis-raw/harvest/ as raw evidence before
normalization. Copyright: Text (c) 2004 The Bible Society of Cameroon,
Audio (p) 2007 Hosanna / Faith Comes By Hearing.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

BASE = "https://live.bible.is"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
BOOK = "MAT"
CHAPTERS = list(range(1, 29))  # Matthew has 28 chapters
KOM_ID = "BKMBSC"
NIV_ID = "ENGNIV"
AUDIO_FILESET = "BKMBSCN2DA"  # audio_drama, NT, 64kbps mp3

RAW = os.path.dirname(os.path.abspath(__file__))
HARVEST = os.path.join(RAW, "harvest")
AUDIO_RAW = os.path.join(HARVEST, "audio_raw")
for d in (HARVEST, AUDIO_RAW):
    os.makedirs(d, exist_ok=True)


def fetch(url, dest=None, retries=3):
    """GET with retries; returns text or writes binary to dest."""
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                if dest:
                    with open(dest, "wb") as f:
                        f.write(r.read())
                    return None
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            print(f"  ! attempt {attempt} failed: {e}", flush=True)
            time.sleep(3 * attempt)
    raise RuntimeError(f"FAILED after {retries}: {url}")


def next_data(text_lang, chapter):
    """Fetch a chapter page and extract __NEXT_DATA__ verse text."""
    html = fetch(f"{BASE}/bible/{text_lang}/{BOOK}/{chapter}")
    m = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html, re.S,
    )
    if not m:
        raise RuntimeError(f"no NEXT_DATA for {text_lang} MAT {chapter}")
    d = json.loads(m.group(1))
    p = d["props"]["pageProps"]
    return p


def scrape_text(text_lang, chapters):
    out = {}
    for c in chapters:
        p = next_data(text_lang, c)
        verses = [
            {
                "verse": int(v["verse_start"]),
                "text": v["verse_text"].strip(),
            }
            for v in p.get("chapterText", [])
            if v.get("verse_text")
        ]
        out[c] = {
            "book_name": p.get("activeBookName", ""),
            "book_name_alt": verses and None,
            "chapter": c,
            "verses": verses,
        }
        # capture native book name from first verse block if present
        ct = p.get("chapterText", [])
        if ct and ct[0].get("book_name"):
            out[c]["book_name"] = ct[0]["book_name"]
        print(f"  {text_lang} MAT {c}: {len(verses)} verses", flush=True)
        time.sleep(1.2)
    return out


def scrape_audio_urls(chapters):
    out = {}
    for c in chapters:
        url = (
            f"{BASE}/api/bibles/filesets/{AUDIO_FILESET}"
            f"?book_id={BOOK}&chapter_id={c}&type=audio_drama"
        )
        d = json.loads(fetch(url))
        items = d.get("data", [])
        if not items:
            print(f"  audio MAT {c}: NO DATA", flush=True)
            continue
        it = items[0]
        out[c] = {
            "path": it["path"],
            "duration_s": it.get("duration"),
            "filesize": it.get("filesize_in_bytes"),
            "fileset": AUDIO_FILESET,
        }
        print(f"  audio MAT {c}: {it.get('duration')}s {it.get('filesize_in_bytes')}B", flush=True)
        time.sleep(1.0)
    return out


def download_audio(audio_urls):
    files = {}
    for c, meta in audio_urls.items():
        dest = os.path.join(AUDIO_RAW, f"mat_{c:02d}_kom_64k.mp3")
        if os.path.exists(dest) and os.path.getsize(dest) > 100_000:
            print(f"  cached MAT {c}", flush=True)
        else:
            fetch(meta["path"], dest=dest)
            time.sleep(1.0)
        size = os.path.getsize(dest)
        ok = size > 100_000
        print(f"  {'OK ' if ok else 'BAD'} MAT {c}: {size}B", flush=True)
        files[c] = {"file": dest, "bytes": size}
    return files


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    print("== TEXT (Kom BKMBSC) ==", flush=True)
    kom = scrape_text(KOM_ID, CHAPTERS)
    json.dump(kom, open(os.path.join(HARVEST, "kom_matthew_text.json"), "w"), ensure_ascii=False, indent=1)

    print("== TEXT (NIV ENGNIV) ==", flush=True)
    niv = scrape_text(NIV_ID, CHAPTERS)
    json.dump(niv, open(os.path.join(HARVEST, "niv_matthew_text.json"), "w"), ensure_ascii=False, indent=1)

    print("== AUDIO URLS (fileset API) ==", flush=True)
    audio_urls = scrape_audio_urls(CHAPTERS)
    json.dump(audio_urls, open(os.path.join(HARVEST, "audio_urls.json"), "w"), ensure_ascii=False, indent=1)

    if mode == "all":
        print("== AUDIO DOWNLOAD ==", flush=True)
        files = download_audio(audio_urls)
        total = sum(f["bytes"] for f in files.values())
        print(f"total raw audio: {total/1e6:.1f} MB across {len(files)} chapters", flush=True)

    print("HARVEST COMPLETE", flush=True)


if __name__ == "__main__":
    main()
