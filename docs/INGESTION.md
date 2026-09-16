# Content Ingestion Guide

**For tutors, parents, educational authorities and moderators.**

OmniVoice Academy grows its national-language library the same way language itself grows: from native speakers. The Ingestion Portal (Content Library → 📥 **Content Ingestion**) is the single door through which community-verified language data enters the platform. Nothing bypasses it — not even the development team — because every phrase a child hears must be traceable to a real source and a real speaker.

This document explains the workflow, the rules, and the quality gates.

---

## Table of Contents

1. [Who Can Contribute](#who-can-contribute)
2. [What You Can Contribute](#what-you-can-contribute)
3. [The Golden Rule: Source or Silence](#the-golden-rule-source-or-silence)
4. [Step-by-Step Submission](#step-by-step-submission)
5. [The Review Workflow](#the-review-workflow)
6. [Quality Gates](#quality-gates)
7. [Directive 9 and Voice Recordings](#directive-9-and-voice-recordings)
8. [Contributing via Pull Request](#contributing-via-pull-request)
9. [Moderator Handbook](#moderator-handbook)

---

## Who Can Contribute

| Role | Typical contributions |
|---|---|
| **Tutors** | Classroom-verified words, dialogues, number forms, corrections to existing entries |
| **Parents / Guardians** | Home greetings, songs, lullabies, story openings — how the language is really spoken at home |
| **Educational authorities** | Curriculum-aligned content, orthography decisions, approval of pedagogical material |
| **Linguists / documenters** | Tone-marked attestations with bibliographic precision |
| **Native speakers (any role)** | Voice recordings — the most valuable contribution of all |

Contributors self-identify their role on submission; the role is displayed as credit on published content.

---

## What You Can Contribute

| Content type | Example | Notes |
|---|---|---|
| `word` | *wáyn* 'person/human being' (Hyman) | Single lexical items, tone-marked |
| `greeting` | A documented morning-greeting formula | Only if attested — see the Golden Rule |
| `phrase` | Verb phrases, noun-class pairs | Tone-marking appreciated (GACL rules) |
| `dialogue` | A short two-turn exchange | Ideal for primers and listening stations |
| `song` | Children's song with lyrics + provenance | Copyright must be yours or cleared |
| `story` | Short narrative for graded readers | Include the telling context |
| `correction` | "Entry KOM-NUM-500 should read *ighi i täyn*" | The most precious type — fixes errors |
| `synthesis` | AI-proposed material queued for human moderation | Created by the platform's own agents; humans decide |

---

## The Golden Rule: Source or Silence

> **If it cannot cite a source, it does not go on the platform.**

Every submission requires a **source citation**. Valid sources include:

- A published work (author, title, year, page): e.g. *Hyman, Kom tone notebook, 1979–80 field notes*
- A SIL Cameroon publication: e.g. *Ghesɨ̀nà yeʼi itaŋikom 1 (SIL, 1996), p. 12*
- A community reference: *as spoken by [speaker's name], [village], [date]*
- A recording you made yourself (you will be asked to confirm the speaker is a native speaker)

If you cannot name where a phrase comes from, leave the field blank and keep the phrase in your heart, not on the platform. This rule exists because **a wrong greeting taught to 200 children is worse than no greeting** — the platform previously showed invented material, it was wrong, and it was purged (v4.3).

---

## Step-by-Step Submission

1. Open **Content Library → 📥 Content Ingestion**.
2. Choose your **contributor role** (tutor / parent / authority / other).
3. Choose the **content type** (word, greeting, phrase, dialogue, song, story, correction).
4. Select the **language** (Kom, Lamnso', Bayangi, or any registered language).
5. Type the content — **tone-marked if you can** (GACL: mark tone on the syllable center; High unmarked, Low `à`, Falling `â`).
6. Fill in the **source** (see the Golden Rule).
7. Tick **"I confirm this is native-speaker-attested content"** — this is the Directive 9 gate; you cannot submit without it.
8. Submit. Your entry appears as **DRAFT** in the review queue with your credit.

Contributions via the API are identical: `POST /api/ingest` (see [API.md](API.md#ingestion)).

---

## The Review Workflow

```
DRAFT ──▶ IN_REVIEW ──▶ ACTIVE
              │
              └──▶ REJECTED (with reason)
```

- **DRAFT** — stored, visible only in the moderation queue.
- **IN_REVIEW** — a moderator (teacher/supervisor account) checks source, orthography, tone-marking.
- **ACTIVE** — published: shown on the public wall with contributor credit, joined into the lexicon/lesson pipelines, eligible for recordings.
- **REJECTED** — returned with a reason; the contributor can resubmit with better provenance.

The workflow is intentionally *transparent*: published items display who contributed them and the cited source, and rejected items remain visible to the contributor.

---

## Quality Gates

A submission becomes ACTIVE only when all gates pass:

1. **Source gate** — non-empty, verifiable citation.
2. **Native-speaker gate** — `nativeSpeakerConfirmed` true (Directive 9).
3. **Orthography gate** — GACL-1979 orthography; tone marks on syllable centers (2 lexical tones marked; 3 marked on double vowels).
4. **Duplication gate** — moderator checks it doesn't contradict or duplicate an existing entry; corrections are preferential (they win over the entry they correct, and the conflict is logged).
5. **Tone gate (Kom)** — where possible, checked against the KomToneEngine's HTS/LTS expectations (e.g. a 1SG prefix H + L stem should surface falling on TBU 2).

---

## Directive 9 and Voice Recordings

**No Grassfields-language speech is ever synthesized.** National-language audio must be recorded by a human native speaker. Concretely:

- The `bkm_community_recordings` voice is a **reserved bank of slots** for community uploads — it is disabled ("awaiting upload") until real recordings arrive.
- Every uploaded recording is attached to a lexicon entry (`audioStatus: PENDING_NATIVE_RECORDING → RECORDED`).
- The TTS API refuses synthesis requests for recorded voices **server-side**; a UI toggle cannot bypass this.
- Uploads of *you* speaking your own language are welcome and celebrated — they become the platform's most authentic teaching material.

---

## Contributing via Pull Request

For bulk or code-adjacent contributions (datasets, corpus collections):

1. Fork the repo, create a branch.
2. Add data under `kom_training_corpus/` following the collection schemas (see [CORPUS.md](CORPUS.md)) — include `source`, `attestation`, and `status` metadata on every record.
3. Set `status: "pending_moderation"` on everything — the Golden Rule applies to PRs too.
4. Open a PR describing provenance. Reviewers apply the same quality gates as the portal.

---

## Moderator Handbook

- Review queue: Content Library → Content Ingestion → moderator section (or `GET /api/ingest`).
- Actions via `PATCH /api/ingest`: `review` → `activate` → `reject`.
- When in doubt about a source: **reject with a kind, specific reason** and invite resubmission. The platform's integrity is worth more than any single entry.
- Watch for tone-marking inconsistencies in Kom and Lamnso'; consult the Hyman attestations and the SIL primers listed in [ATTRIBUTION.md](ATTRIBUTION.md).
- Corrections ("type: correction") should reference the exact entry ID or text they fix.
