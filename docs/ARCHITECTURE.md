# Architecture

This document describes how OmniVoice Academy is structured: the layer map, the data model, the state-management strategy, and the request flows that make the platform voice-first.

---

## Table of Contents

1. [Layer Map](#layer-map)
2. [Data Model — 18 Prisma Models](#data-model--18-prisma-models)
3. [State Management](#state-management)
4. [Key Request Flows](#key-request-flows)
5. [The KomToneEngine](#thekomtoneengine)
6. [The Speech Stack](#the-speech-stack)
7. [Content Delivery & Offline Strategy](#content-delivery--offline-strategy)
8. [Data Integrity Safeguards](#data-integrity-safeguards)

---

## Layer Map

The platform is a single Next.js 16 application (App Router) with the UI, API, and data layers colocated but strictly separated:

```
┌──────────────────────────────────────────────────────────────────┐
│ UI LAYER — src/app/page.tsx + src/components/omnivoice/*         │
│  landing → HUD shell → wing views (navigator/library/projects/   │
│  profile/teacher/parent) with zustand-driven language & voice    │
└──────────────┬───────────────────────────────────────────────────┘
               │ fetch (TanStack Query) / native <audio>
┌──────────────▼───────────────────────────────────────────────────┐
│ API LAYER — src/app/api/*/route.ts (23 handlers)                 │
│  zod-validated request bodies, Directive-9 gates, provenance     │
└──────────────┬───────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────────┐
│ DATA LAYER                                                       │
│  Prisma 6 + SQLite (db/custom.db) — 18 models                    │
│  src/lib/data/* — typed static registries (languages, voices,    │
│  lessons, curriculum, primers, stations, scripture-matthew.json) │
│  kom_training_corpus/ — versioned JSON/JSONL knowledge base      │
│  public/audio/bkm/matthew/ — 28 chapter MP3s + preview clip      │
└──────────────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────────┐
│ AI/SPEECH — z-ai-web-dev-sdk → LLM · Kokoro TTS (EN/FR) ·        │
│  Faster-Whisper STT (speed 0.9) · Chroma STS                     │
└──────────────────────────────────────────────────────────────────┘
```

**Why SQLite?** The platform targets single-server deployments in low-connectivity environments. SQLite keeps operations simple (no database server to run), and the entire classroom state fits in one file that can be backed up by copying. Prisma keeps the door open to Postgres when multi-school aggregation arrives.

---

## Data Model — 18 Prisma Models

Defined in `prisma/schema.prisma`:

| Model | Role |
|---|---|
| `Learner` | The child profile: name, stage (KG→Upper Sixth), interface language, national language, selected voice, XP, streak, level |
| `ILT` | Integrated Learning Theme — the curriculum's weekly organising unit, per level |
| `Subject` | The nine official subjects + domain weighting (Basic Knowledge 60 %, Cultural Identity 5 %, Vocational & Life Skills 20 %, Digital Literacy 10 %…) |
| `SchemeWeek` | Verbatim Class-3 Month-1 scheme rows: unit, contents, terminal outcomes, resources per subject/week |
| `Lesson` | Full voice-enabled lesson plan in the stipulated 6.3 JSON format: `voiceAssets`, `voiceInteractions`, `stsScenarios`, gamification mechanics, 5-phase activities, assessment criteria, differentiation, offline capability, bilingual cultural notes |
| `Badge` / `EarnedBadge` | 31 achievement badges + per-learner awards with timestamps |
| `Project` / `ProjectNote` | Three-phase project-based learning (brief → build → present) with phase XP and notes |
| `Assessment` | CBA-aligned assessments: per-learner results + platform analytics |
| `SkillProgress` | Skill-tree node mastery per learner |
| `ActivityEvent` | Append-only activity stream powering analytics and streaks |
| `FeedbackSubmission` | Preview feedback widget payloads |
| `PreviewEvent` | Anonymous preview telemetry |
| `LanguageDraft` | Languages registered live in the Registry Console before activation |
| `Vocabulary` | Lexicon entries with `source` citation, tone markup, `audioStatus` (Directive 9: `PENDING_NATIVE_RECORDING` until a real recording is attached) |
| `ReadingPassage` | Graded reading passages with level + provenance |
| `ContentSubmission` | Community ingestion: `contributorRole` (tutor/parent/authority/other), `contentType` (greeting/word/phrase/dialogue/song/story/correction/synthesis), **mandatory `source`**, `nativeSpeakerConfirmed` gate, `status` DRAFT→IN_REVIEW→ACTIVE\|REJECTED |

Relationships are conventional: a `Learner` earns badges, accumulates `SkillProgress`, generates `ActivityEvent`s, and is assessed via `Assessment`; curriculum tables (`ILT`, `Subject`, `SchemeWeek`, `Lesson`) are normalized so the quest board can filter by ILT theme and subject. The DB ships pre-seeded (see `scripts/seed*.ts`); stale Prisma clients missing newer models are detected and surfaced by `src/lib/db.ts`.

---

## State Management

Three complementary stores (`src/lib/store.ts`, `src/lib/use-language-registry.ts`):

1. **Session store (zustand, persisted)** — learner identity, stage, interface language (`en | fr`), national language code, selected voice. The HUD and every picker read from this store, so switching language or voice re-renders the whole academy instantly.
2. **Language registry store (zustand)** — merges the static language matrix (`src/lib/data/grassfields.ts`) with `GET /api/languages` drafts (`LanguageDraft` rows). Registering a language in the Console mutates this store, and every dropdown (HUD, landing, profile, teacher) updates in real time — no refresh, no prop-drilling.
3. **Server state (TanStack Query)** — learner progress, quest board, library content, submissions queue. Mutations invalidate precisely (e.g. publishing a submission re-fetches the published wall).

**Client-side audio** uses the native Web Audio API: a shared `playWavBase64` helper (idempotent teardown — see "Data Integrity Safeguards"), a hold-to-talk `MicButton` (keyboard operable: Enter/Space hold), and a `VoiceChallengeRecorder` that keeps the recording for playback instead of discarding it.

---

## Key Request Flows

### 1. Pronunciation practice (tone-aware)

```
MicButton (hold) ── audio blob ──▶ POST /api/pronunciation
                                     │  1. STT (Faster-Whisper, speed 0.9)
                                     │  2. KomToneEngine.analyzeKomTones(target)
                                     │  3. tone similarity (40 %) + segmental
                                     │     similarity (60 %) via edit distance
                                     ◀─ { transcript, toneAnalysis, score,
                                         rulesApplied[], coaching hints }
HUD toast + lesson feedback ◀─────────┘
```

### 2. Speech-to-speech conversation (in-character)

```
POST /api/sts { learnerId, persona, lessonId, audio | text }
  → STT transcript
  → LLM reply constrained to persona + language policy
      (Grassfields languages → recorded-audio replies only;
       interface languages → Kokoro TTS)
  → { replyText, audioPayload (base64 | recorded path), persona }
```

### 3. Audio Bible chapter delivery

```
GET /api/scripture            → index: 28 chapters (verses count, duration)
GET /api/scripture?chapter=5  → { chapter, verses: [{ n, kom, niv }],
                                  audioPath: "/audio/bkm/matthew/mat_05_kom_24k.mp3",
                                  copyright, narrator }
```

`src/lib/data/scripture-matthew.json` (344 KB) is **server-side only** — it never ships to the browser except as the requested chapter payload, keeping the client bundle lean.

### 4. Community ingestion

```
POST /api/ingest   (tutor/parent/authority form)
  → zod validation: contentType, text, SOURCE CITATION REQUIRED,
    nativeSpeakerConfirmed === true (Directive 9 gate)
  → ContentSubmission { status: DRAFT }
PATCH /api/ingest  (moderator) → IN_REVIEW → ACTIVE | REJECTED
  → ACTIVE content joins the published wall with contributor credit
    and becomes available to the lesson/lexicon pipelines
```

---

## The KomToneEngine

`src/lib/kom-tone-engine.ts` implements a practical subset of Hyman's Kom tone analysis:

- **Tone-bearing units (TBUs)** — syllable centers carrying High (unmarked), Low (grave `à`), or Falling (circumflex `â`) melody, per GACL tone-marking principles (mark on the syllable center; 2 lexical tones marked, 3 marked on double vowels).
- **HTS — High Tone Spreading** — a prefix H spreads onto a following L stem, surfacing as a falling contour on TBU 2 (e.g. the 1SG paradigm).
- **LTS — L Tone Spreading** — a preceding low-toned function word (`nè` 'with', `nɛ̀` 'and') delinks the next word's prefixal H.
- **Floating tones & M-tone** — retained in analysis output as `rulesApplied` annotations rather than silently dropped.
- **Scoring** — `KomToneEvaluation` blends tone accuracy (40 %) and segmental accuracy (60 %), returning per-TBU diagnostics the UI renders as actionable coaching ("the prefix should be high, your voice fell on the second syllable").

Unit tests with Hyman's canonical comparison classes live in `scripts/test_kom_tone_engine.ts`.

---

## The Speech Stack

| Capability | Engine | Policy |
|---|---|---|
| TTS (interface) | Kokoro-82M | English/French only; four personas + French narrator |
| TTS (national languages) | — | **Forbidden** (Directive 9). `POST /api/tts` returns `recordedOnly` for recorded voices and Grassfields text |
| STT | Faster-Whisper small, speed 0.9 | Used for pronunciation scoring and STS input |
| STS | Chroma + LLM pipeline | Persona-constrained; national-language responses use recordings |
| Voice registry | `src/lib/data/voices.ts` | Single source of truth; `GET /api/voices`; UI grouping + disabling |

`POST /api/tts` resolves platform voice IDs (e.g. `voice_kwe` → engine persona mapping) and applies the Directive-9 gate **server-side**, so the guarantee holds regardless of what the client requests.

---

## Content Delivery & Offline Strategy

- **Audio**: chapter MP3s are served as static assets (`public/audio/bkm/matthew/`) at 24 kbps mono — a full chapter is ~1.3 MB, a class session of Matthew ≈ 36 MB total, cacheable by the browser/service worker for offline replay.
- **Lesson cards (DIY)**: every digital activity (5–10 min) is paired with a hands-on DIY activity (15–30 min, no device needed) and a voice-practice block (5–10 min) — a classroom can run the offline half when connectivity fails.
- **Static registries**: language matrix, voices, curriculum structures and lesson JSON are compiled into `src/lib/data/*`, so the quest board renders even with the API unavailable (stale-learner fallbacks clear dead profiles gracefully).
- **Corpus**: the JSON knowledge base is readable from disk (`GET /api/corpus` whitelists paths; traversal blocked), so downstream tooling can consume it without the web app running.

---

## Data Integrity Safeguards

- **No invented content**: every user-visible Kom form cites a source; unattested slots render "awaiting native-speaker documentation" (see [docs/INGESTION.md](INGESTION.md)).
- **Verse pairing honesty**: Kom and NIV verse divisions differ in 5 chapters; pairs are matched by verse number and divergences are recorded in `kom_training_corpus/12_conflicts/unresolved.jsonl` rather than force-merged.
- **Authoritative durations**: ffprobe-measured audio durations are used by the API; unreliable source-metadata fields are ignored and documented.
- **Path traversal protection**: the corpus reader API whitelists files under `kom_training_corpus/`.
- **Idempotent audio teardown**: `playWavBase64` closes each `AudioContext` exactly once (guarded), preventing `InvalidStateError` on component unmount.
- **Stale-client detection**: `src/lib/db.ts` detects a Prisma client missing newer models (hot-reload artifact) and instructs regeneration instead of failing cryptically.
