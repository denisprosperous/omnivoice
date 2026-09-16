#!/usr/bin/env python3
"""Normalize the Bible.is harvest: verify alignment, re-encode audio, emit final corpus files."""
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
HARVEST = os.path.join(HERE, "harvest")
PUB = "/home/z/my-project/public/audio/bkm/matthew"
os.makedirs(PUB, exist_ok=True)

kom = json.load(open(os.path.join(HARVEST, "kom_matthew_text.json")))
niv = json.load(open(os.path.join(HARVEST, "niv_matthew_text.json")))
audio_urls = json.load(open(os.path.join(HARVEST, "audio_urls.json")))

report = {"chapters": [], "issues": []}
total_verses = 0
audio_index = []

for c in sorted(kom.keys(), key=int):
    ci = int(c)
    kv, nv = kom[c]["verses"], niv[c]["verses"]
    entry = {
        "chapter": ci,
        "kom_verses": len(kv),
        "niv_verses": len(nv),
        "aligned": len(kv) == len(nv),
    }
    total_verses += len(kv)
    if len(kv) != len(nv):
        report["issues"].append(f"MAT {ci}: kom {len(kv)} vs niv {len(nv)} verses")
    # audio: re-encode 64k -> 24k mono 22.05kHz for web/git
    src = os.path.join(HARVEST, "audio_raw", f"mat_{ci:02d}_kom_64k.mp3")
    dst = os.path.join(PUB, f"mat_{ci:02d}_kom_24k.mp3")
    dur_api = audio_urls[c]["duration_s"]
    if not (os.path.exists(dst) and os.path.getsize(dst) > 50_000):
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
             "-ac", "1", "-ar", "22050", "-b:a", "24k", dst],
            check=True,
        )
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", dst],
        capture_output=True, text=True, check=True,
    )
    dur = round(float(probe.stdout.strip()), 1)
    entry["audio_duration_s"] = dur
    entry["audio_api_duration_s"] = dur_api
    entry["audio_bytes"] = os.path.getsize(dst)
    if abs(dur - dur_api) > 6:
        report["issues"].append(f"MAT {ci}: duration mismatch ffmpeg {dur} vs api {dur_api}")
    audio_index.append({
        "id": f"bkm_mat_{ci:02d}",
        "language": "bkm",
        "book": "MAT",
        "book_kom": kom[c]["book_name"],
        "chapter": ci,
        "audio_path": f"/audio/bkm/matthew/mat_{ci:02d}_kom_24k.mp3",
        "audio_format": "mp3",
        "duration_s": dur,
        "speaker_id": "bkm_nt_narrator",
        "speaker_gender": "male",
        "recording_quality": "medium",
        "source": "bible",
        "verses": len(kv),
        "moderation_status": "verified",
    })
    report["chapters"].append(entry)

report["total_verses"] = total_verses
report["total_audio_mb"] = round(sum(a["audio_bytes"] for a in audio_index) / 1e6, 1)

json.dump(audio_index, open(os.path.join(HARVEST, "audio_index.json"), "w"), ensure_ascii=False, indent=1)
json.dump(report, open(os.path.join(HARVEST, "alignment_report.json"), "w"), ensure_ascii=False, indent=1)
print(json.dumps(report, indent=1)[:2500])
