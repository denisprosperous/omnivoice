# The Kom Training Corpus

`kom_training_corpus/` is the platform's structured knowledge base for Kom (Itaŋikom, `bkm`): a versioned, machine-readable collection designed to be browsable in-app (Content Library → 🗃️ **Kom Corpus (KB)**), consumable by AI training pipelines, and auditable by linguists.

**Manifest version:** 1.1.0 (`kom_training_corpus/manifest.json`) — sources, quality gates, schema scaffolds, and honest pending-data markers live there.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Collection Map](#collection-map)
3. [Populated Collections](#populated-collections)
4. [The Audio Bible Ingestion Pipeline](#the-audio-bible-ingestion-pipeline)
5. [Conflicts Log](#conflicts-log)
6. [Agent Skills & Expansion Protocol](#agent-skills--expansion-protocol)
7. [Accessing the Corpus](#accessing-the-corpus)

---

## Design Principles

1. **Provenance on every record.** Each data block cites its source (user ingestion package, SIL archive, Hyman, Bible.is). No orphan data.
2. **Honest emptiness.** Collections awaiting data exist as schema scaffolds with explicit `pending-data` markers — never filled with invented placeholders (the v4.3 purge rule).
3. **The Golden Rule for synthesis.** All AI-proposed material lands in `10_synthesis/pending_moderation.jsonl` with `status: "pending"` and becomes platform-visible only after native-speaker moderation.
4. **Directive 9 audio slots.** Phoneme and word-audio slots are reserved but empty until real native recordings arrive.
5. **Machine + human readable.** JSON/JSONL with stable keys; the Corpus Viewer renders them without transformation.

---

## Collection Map

```
kom_training_corpus/
├── manifest.json               # v1.1.0 — sources, quality gates, stats
├── 01_alphabet/                # (scaffold) GACL 1979 Kom inventory
├── 02_phonology/               # (scaffold) segmental inventory
├── 03_numbers/
│   ├── cardinal.json           # 11 cardinals 100–1000 (incl. Part-0 corrections)
│   └── usage_rules.json        # 3 numeral usage rules
├── 04_morphology/              # (scaffold) noun-class morphology
├── 05_syntax/                  # (scaffold) simple-sentence patterns
├── 06_tone/                    # (scaffold) HTS/LTS paradigms (numeric/descriptive/
│                               #   demonstrative/interrogative/possessive)
├── 07_lexicon/                 # (scaffold) attested lexicon expansion
├── 08_reader/                  # (scaffold) graded-reader passages
├── 09_pedagogy/
│   ├── course_registry.json    # course metadata
│   ├── curriculum.json         # 17-stage syllabus (0–16, per source numbering)
│   ├── lesson_engine.json      # mastery-gate lesson sequencing
│   └── assessment_engine.json  # assessment rules
├── 10_synthesis/
│   └── pending_moderation.jsonl    # 45 AI-proposed entries, status: pending
├── 11_audio/
│   ├── phoneme_map.json            # 29 grapheme→audio slots (PENDING_NATIVE_RECORDING)
│   ├── word_audio_index.jsonl      # 28 entries — real Matthew chapter narrations
│   └── speech_to_speech_config.json # S2S pipeline config
├── 12_conflicts/
│   └── unresolved.jsonl            # documented conflicts (see below)
└── 13_agent_skills/
    ├── expansion_protocol.json     # how agents may grow the corpus
    └── moderation_workflow.json    # DRAFT→IN_REVIEW→ACTIVE mapping
```

---

## Populated Collections

### `03_numbers` — numerals (from the ingestion package)
Cardinals 100–1000 including the corrected hundreds: **500 = *ighi i täyn***, **900 = *ighi i bulamö'*** (Part 0 corrections). The Corpus Viewer highlights corrected entries and the lexicon DB rows (`KOM-NUM-100…1000`) carry `audioStatus: PENDING_NATIVE_RECORDING` until native recordings are uploaded.

### `09_pedagogy` — course structure
A 16-stage mastery-gated Kom course (stages `0–16` — the source's own numbering, kept verbatim and annotated rather than silently renumbered). Each stage has a mastery gate (`lesson_engine.json`), e.g. *stage_8_possessives* requires the possessive-adjective lessons; the Corpus Viewer renders the full ladder with gate names.

### `10_synthesis` — the moderation queue
All 45 Part-5 AI synthesis proposals, status `pending` per the Golden Rule. The platform seeds these into the `ContentSubmission` review queue (type `synthesis`, `nativeSpeakerConfirmed: false`) so native speakers decide their fate in the Ingestion Portal.

### `11_audio` — the real-audio index
- `word_audio_index.jsonl` — 28 entries mapping each Matthew chapter to its narrated MP3 (`/audio/bkm/matthew/mat_NN_kom_24k.mp3`): the only Grassfields audio on the platform is this real narration set.
- `phoneme_map.json` — 29 grapheme slots awaiting native recordings (Directive 9).

### `13_agent_skills` — how the corpus grows
`expansion_protocol.json` defines what an AI agent may propose (never publish); `moderation_workflow.json` maps corpus statuses to platform states (corpus `pending` ⇄ platform `DRAFT`, corpus `approved` ⇄ `ACTIVE`).

---

## The Audio Bible Ingestion Pipeline

The flagship ingestion (v4.4) — from source URL to platform:

```
live.bible.is/bible/BKMBSC/MAT/1
   │  1. HARVEST — SSR __NEXT_DATA__ verse payload (BKMBSCN_ET, Kom text)
   │     + audio fileset API (BKMBSCN2DA → signed CloudFront MP3, drama, 64 kbps)
   │     + NIV parallel text (fileset ENGNIV)
   ▼
scripts/bibleis-raw/            # raw Kom text, NIV text, 28 chapter MP3s (90.1 MB),
   │                            #   copyright metadata, conflict notes
   │  2. NORMALIZE — ffmpeg → 24 kbps mono 22.05 kHz; verse pairing by
   │     verse number (Kom vs NIV divisions differ in 5 chapters — never force-merged);
   │     ffprobe durations recorded as authoritative
   ▼
public/audio/bkm/matthew/mat_NN_kom_24k.mp3   (36.2 MB, 186:20 total)
src/lib/data/scripture-matthew.json            (344 KB, server-side only)
   │  3. INGEST — GET /api/scripture (index + ?chapter=N) +
   │     ScripturePlayer UI (Content Library → 🎧 Audio Bible (Kom))
   ▼
LEARNER EXPERIENCE — chapter grid, native <audio> streaming,
Kom verses with NIV parallel toggle, voice selector pinned to
the real Kom NT Narrator.
```

**Copyright captured at the source** and displayed with every payload: Kom text © 2004 The Bible Society of Cameroon · NIV® © 1973, 1978, 1984, 2011 Biblica · Audio ℗ 2007 Hosanna / Faith Comes By Hearing. See [ATTRIBUTION.md](ATTRIBUTION.md).

---

## Conflicts Log

`12_conflicts/unresolved.jsonl` documents known divergences instead of hiding them, e.g.:

- Kom vs NIV **verse-division differences** in 5 chapters (paired by verse number; each language keeps its own numbering).
- **Duration metadata mismatches** for ~6 chapters (API durations unreliable) — ffprobe values are authoritative.
- 16-stage curriculum's `0–16` numbering vs the platform's 1-based stage display (kept verbatim, annotated).

---

## Agent Skills & Expansion Protocol

AI agents (including OmniVoice's own lesson generators) interact with the corpus under three hard rules:

1. **Propose, never publish.** New material → `10_synthesis/pending_moderation.jsonl` (or the ContentSubmission queue) with status `pending`.
2. **Cite or skip.** An agent may only *reuse* attested anchors (e.g. the closed Hyman attestation list) in learner-facing prompts; anything beyond that is a proposal awaiting a human.
3. **Respect Directive 9.** Agents may request audio slots; they may never fill them with synthesized Grassfields speech.

---

## Accessing the Corpus

| Channel | Path |
|---|---|
| In-app browser | Content Library → 🗃️ Kom Corpus (KB) |
| API | `GET /api/corpus` (manifest), `GET /api/corpus?file=03_numbers/cardinal.json` (whitelisted reads; traversal blocked) |
| Filesystem | `kom_training_corpus/` directly — plain JSON/JSONL |
| Platform mirror | `Vocabulary` rows (`KOM-NUM-*`), `ContentSubmission` queue (synthesis proposals) |
