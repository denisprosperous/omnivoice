#!/usr/bin/env python3
"""Generate src/lib/data/scripture-matthew.json — normalized verse-aligned Kom/NIV Matthew."""
import json
import os

HERE = "/home/z/my-project/scripts/bibleis-raw"
OUT = "/home/z/my-project/src/lib/data/scripture-matthew.json"
audio_index = {a["chapter"]: a for a in json.load(open(os.path.join(HERE, "harvest/audio_index.json")))}
kom = json.load(open(os.path.join(HERE, "harvest/kom_matthew_text.json")))
niv = json.load(open(os.path.join(HERE, "harvest/niv_matthew_text.json")))

chapters = []
for c in sorted(kom.keys(), key=int):
    ci = int(c)
    kv = {v["verse"]: v["text"] for v in kom[c]["verses"]}
    nv = {v["verse"]: v["text"] for v in niv[c]["verses"]}
    verses = []
    for vn in sorted(set(kv) | set(nv)):
        verses.append({"v": vn, "kom": kv.get(vn), "niv": nv.get(vn)})
    chapters.append({
        "chapter": ci,
        "titleKom": kom[c]["book_name"],
        "verses": verses,
        "audioPath": audio_index[ci]["audio_path"],
        "durationS": audio_index[ci]["duration_s"],
        "verseCount": len(verses),
    })

data = {
    "id": "kom_matthew_1_28",
    "language": "bkm",
    "languageName": "Kom (Itaŋikom)",
    "book": "MAT",
    "bookKom": "Matìyo",
    "bookEn": "The Gospel according to Matthew",
    "komVersion": "Ŋwàʼlɨ̀ àkòyn aghɨ̀ Jisos Christ — Kom New Testament, © 2004 The Bible Society of Cameroon (via Bible.is BKMBSC)",
    "parallelVersion": "Holy Bible, New International Version®, NIV® — © 1973, 1978, 1984 by Biblica (via Bible.is ENGNIV)",
    "audio": "Audio ℗ 2007 Hosanna / Faith Comes By Hearing — Bible.is fileset BKMBSCN2DA (drama, NT, 64kbps mp3; re-encoded 24kbps mono for classroom streaming)",
    "source": "http://live.bible.is/bible/BKMBSC/MAT/1",
    "harvested": "2026-09-16",
    "note": "Verse-level audio timing not provided by the source; audio streams per chapter. Where Kom and NIV verse divisions differ, each language keeps its own numbering (see kom_training_corpus/12_conflicts).",
    "chapters": chapters,
}
json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote", OUT, f"({os.path.getsize(OUT)/1024:.0f} KB, {len(chapters)} chapters,",
      f"{sum(c['verseCount'] for c in chapters)} verse rows)")
