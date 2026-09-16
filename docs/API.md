# API Reference

All endpoints live under `src/app/api/` and return JSON. Unless stated otherwise, request bodies are JSON with zod-validated fields, and errors return `{ error: string }` with an appropriate HTTP status.

**Base URL (dev):** `http://localhost:3000`

---

## Table of Contents

- [Learner & Progress](#learner--progress)
  - [`GET /api/learner`](#get-apilearner)
  - [`POST /api/learner`](#post-apilearner)
  - [`PATCH /api/learner`](#patch-apilearner)
  - [`PUT /api/learner`](#put-apilearner)
  - [`GET /api/curriculum`](#get-apicurriculum)
  - [`GET /api/lessons`](#get-apilessons)
  - [`GET /api/projects`](#get-apiprojects) · `POST /api/projects` · `PATCH /api/projects`
  - [`GET/POST /api/assessments`](#getpost-apiassessments)
  - [`POST/GET /api/analytics`](#postget-apianalytics)
- [Speech & Voice](#speech--voice)
  - [`POST /api/tts`](#post-apitts) · `GET /api/tts`
  - [`POST /api/stt`](#post-apistt)
  - [`POST /api/sts`](#post-apists)
  - [`POST /api/pronunciation`](#post-apipronunciation)
  - [`GET /api/voices`](#get-apivoices)
  - [`GET /api/voice-health`](#get-apivoice-health)
- [Content & Registry](#content--registry)
  - [`GET /api/scripture`](#get-apiscripture)
  - [`GET /api/corpus`](#get-apicorpus)
  - [`GET /api/languages`](#get-apilanguages) · `POST /api/languages`
  - [`GET /api/primers`](#get-apiprimers)
  - [`GET /api/vocab`](#get-apivocab)
  - [`GET /api/stations`](#get-apistations)
  - [`GET/POST/PATCH /api/ingest`](#ingestion)
- [AI & Feedback](#ai--feedback)
  - [`POST /api/lesson-plan`](#post-apilesson-plan)
  - [`POST /api/chat`](#post-apichat)
  - [`POST/GET /api/feedback`](#postget-apifeedback)

---

## Learner & Progress

### `GET /api/learner`

List learners (id, name, stage, XP, streak, level, languages, voice).

**Response `200`**
```json
{ "learners": [ { "id": "…", "name": "Denis", "stage": "Class 3", "xp": 90, "level": "Curious Cub" } ] }
```

### `POST /api/learner`

Create a learner and seed default progression.

| Field | Type | Notes |
|---|---|---|
| `name` | string | required, 1–60 chars |
| `stage` | string | KG…Upper Sixth (ISCED 0–3 ladder) |
| `interfaceLanguage` | `"en" \| "fr"` | optional, default `en` |
| `nationalLanguage` | string | ISO code from the registry, optional |

### `PATCH /api/learner`

Partial update (languages, voice, stage). Unknown ids return `404` — the UI uses this to clear dead profiles.

### `PUT /api/learner`

**Award engine** — applies XP/badge/skill deltas from lesson and DIY events:

```json
{ "id": "…", "xpAward": 30, "badgeId": "puppet-master", "skillId": "tone-ear-1" }
```

The server recomputes level thresholds and streaks; the response includes the updated learner and any newly earned badges.

### `GET /api/curriculum`

The full quest board payload: levels (I–III), ILTs, subjects with domain weightings, scheme weeks (Class 3 Month 1, all subjects), and per-lesson XP.

### `GET /api/lessons`

Lessons with the complete 6.3 voice-enabled plan (voice assets, interactions, STS scenarios, gamification, 5-phase activities, assessment criteria, offline capability, differentiation, cultural notes EN+FR).

**Query params:** `?ilt=` (theme filter), `?subject=`, `?stage=`.

### `GET /api/projects` · `POST /api/projects` · `PATCH /api/projects`

Project-based learning: three-phase engine (brief → build → present) with phase XP and notes (`/api/projects/notes`).

### `GET/POST /api/assessments`

`GET` returns per-learner results and platform-wide analytics (subject mastery averages, XP distribution); `POST` records an assessment event (CBA criteria included).

### `POST/GET /api/analytics`

`POST` appends an `ActivityEvent` (lesson started/finished, phase completed, voice challenge…); `GET` returns aggregated counters used by the HUD streak/XP displays.

---

## Speech & Voice

### `POST /api/tts`

Synthesize interface-language speech. **Directive 9 gate enforced here.**

| Field | Type | Notes |
|---|---|---|
| `text` | string | required |
| `voiceId` | string | platform voice id (`voice_kwe`, `voice_ff_siwis`, …) or raw engine voice |
| `voiceLanguage` | `"en" \| "fr"` | must match the voice's coverage |

**Responses**

- `200` — `{ audio: "<base64 wav>", voice: "…", engine: "kokoro" }`
- `422` — `{ recordedOnly: true, error: "This voice is a real recording and cannot be synthesized." }` when targeting a recorded voice or Grassfields text.

`GET /api/tts` returns engine health + persona mapping (used by diagnostics).

### `POST /api/stt`

Multipart/form-data `audio` field → `{ transcript, confidence, language }`. Engine: Faster-Whisper small at speed 0.9.

### `POST /api/sts`

Speech-to-speech conversation with an in-character tutor.

| Field | Type |
|---|---|
| `learnerId` | string |
| `personaId` | string (e.g. `kwe`) |
| `lessonId` | string (optional context) |
| `audio` | blob (multipart) **or** `text` |

**Response:** `{ replyText, audio (base64) | recordedAudioPath, persona }` — for national languages the reply is a **recorded** clip (Directive 9), never synthesis.

### `POST /api/pronunciation`

Tone-aware pronunciation evaluation.

| Field | Type |
|---|---|
| `audio` | blob (multipart) |
| `target` | string — the attested target word/phrase |
| `language` | string — ISO code (`bkm`, `lns`, …) |

**Response:** `{ transcript, toneAnalysis: { units[], rulesApplied[] }, score, breakdown: { tone, segmental }, hints[] }` — 40 % tone / 60 % segmental blend from `KomToneEngine`.

### `GET /api/voices`

The voice registry, grouped for Directive-9 UI rendering:

```json
{
  "voices": [
    { "id": "bkm_nt_narrator", "name": "Kom NT Narrator", "kind": "recorded",
      "language": "bkm", "sampleAudioPath": "/audio/bkm/matthew/mat_01_sample_10s.mp3",
      "status": "ACTIVE" },
    { "id": "bkm_community_recordings", "kind": "recorded", "status": "AWAITING_UPLOAD" },
    { "id": "voice_kwe", "kind": "persona", "language": "en", "status": "ACTIVE" }
  ]
}
```

### `GET /api/voice-health`

Engine diagnostics: TTS/STT/STS availability, model versions, last smoke-test results.

---

## Content & Registry

### `GET /api/scripture`

The Kom Audio Bible (Matthew).

- `GET /api/scripture` → chapter index: 28 entries `{ chapter, verseCount, duration }`, full copyright block, narrator credit.
- `GET /api/scripture?chapter=1..28` → `{ chapter, title: "Matìyo 1", verses: [{ n, kom, niv }], audioPath, duration }`.

Copyright string returned with every payload:
> Kom text © 2004 The Bible Society of Cameroon (via Bible.is BKMBSC) · NIV® © 1973, 1978, 1984, 2011 Biblica (via Bible.is ENGNIV) · Audio ℗ 2007 Hosanna / Faith Comes By Hearing.

### `GET /api/corpus`

Browse `kom_training_corpus/`. `GET /api/corpus` returns the manifest; `?file=03_numbers/cardinal.json` whitelisted-reads a collection (path traversal blocked).

### `GET /api/languages` · `POST /api/languages`

`GET` merges the static 9-language matrix with `LanguageDraft` community registrations. `POST` registers a draft language (name, nativeName, iso, region, phase, notes) — it immediately appears in every national-language dropdown (registry store refreshes on next read).

### `GET /api/primers`

Graded reading primers (stages with special-letter drills; unattested dialogues honestly marked `AWAITING_CONTENT` citing the SIL source).

### `GET /api/vocab`

Lexicon entries with source citations and `audioStatus`. Query params: `?language=bkm&status=ACTIVE`.

### `GET /api/stations`

Listening stations metadata (NT stations; Matthew is marked ingested-locally with a pointer to `/api/scripture`).

### Ingestion

`GET /api/ingest` — list submissions (moderator view includes DRAFT/IN_REVIEW; public wall shows ACTIVE with contributor credit).

`POST /api/ingest`

| Field | Type | Notes |
|---|---|---|
| `contributorRole` | `tutor \| parent \| authority \| other` | required |
| `contentType` | `greeting \| word \| phrase \| dialogue \| song \| story \| correction \| synthesis` | required |
| `text` | string | required |
| `source` | string | **mandatory citation** (book/archive/recording) |
| `nativeSpeakerConfirmed` | boolean | must be `true` (Directive 9 gate) |
| `language` | string | ISO code |
| `contributorName` | string | optional credit |

`PATCH /api/ingest` — moderator workflow: `{ id, action: "review" | "activate" | "reject" }` moving status `DRAFT → IN_REVIEW → ACTIVE | REJECTED`.

---

## AI & Feedback

### `POST /api/lesson-plan`

AI lesson-plan generator producing plans in the stipulated 6.3 format for any stage KG→Upper Sixth. The prompt is constrained to the closed attestation list (Hyman-attested Kom anchors) with strict never-invent rules for national-language content.

| Field | Type |
|---|---|
| `stage` | string |
| `subject` | string |
| `ilt` | string (theme) |
| `voiceLanguage` | string (ISO code) |
| `durationMinutes` | number |

### `POST /api/chat`

Persona tutor chat: `{ learnerId, personaId, messages[] }` → `{ reply, persona }`. Language policy identical to STS (interface languages full chat; national languages restricted to attested anchors + recorded audio).

### `POST/GET /api/feedback`

Preview feedback widget: `POST` stores a `FeedbackSubmission`; `GET` lists them (supervisor view).
