# Curriculum Engine

How OmniVoice Academy digitises the Cameroon national primary curriculum and turns it into voice-enabled, gamified lessons.

---

## Table of Contents

1. [Official Alignment](#official-alignment)
2. [The Stage Ladder](#the-stage-ladder)
3. [Levels, ILTs and Domain Weighting](#levels-ilts-and-domain-weighting)
4. [The Lesson Plan Format (6.3)](#the-lesson-plan-format-63)
5. [The Five-Phase Lesson Flow](#the-five-phase-lesson-flow)
6. [Gamification: XP, Badges, Skill Tree](#gamification-xp-badges-skill-tree)
7. [The DIY Lesson Model](#the-diy-lesson-model)
8. [Project-Based Learning](#project-based-learning)
9. [Assessment (CBA)](#assessment-cba)
10. [National Languages & Culture Subject](#national-languages--culture-subject)

---

## Official Alignment

The engine's source documents are the actual national instruments, keyed verbatim where possible:

| Document | Scope |
|---|---|
| **National Curriculum Level I** (MINEDUB, 2018) | Class 1–2 terminal outcomes per subject (§3.7, verbatim) |
| **Regional Monthly Integrated Learning Plan — Level II, Littoral Region** | Class 3 monthly ILTs, envisaged projects (§3.8); the Class 3 Month 1 weekly schemes for **all nine subjects** (34 weeks, verbatim units/contents/ELOs/resources) |
| **Level III curriculum** | Class 5–6 expectations per subject (§3.9, summary) |
| **ISCED 2011 mapping** | Stages 0–3 (KG → primary → lower secondary → upper secondary) |
| **General Alphabet of Cameroonian Languages (GACL, 1979)** | Orthography and tone-marking rules for national-language content |
| **CEFR** | The language-progression ladder in the Language Profiles UI |

The pedagogy is the national **Competency-Based Approach (CBA)**: competencies, not recall; performance criteria; learner-centred activities; continuous assessment.

---

## The Stage Ladder

Learners join at any of 14 stages (ISCED 0–3):

```
Kindergarten → Class 1 → Class 2 → Class 3 → Class 4 → Class 5 → Class 6
→ Form 1 … Form 5 → Lower Sixth → Upper Sixth
```

| Level | Classes | Ages | Source document |
|---|---|---|---|
| **I** | 1–2 | 5–7 | National Curriculum Level I (2018) |
| **II** | 3–4 | 7–9 | Regional Monthly ILP Level II — Littoral |
| **III** | 5–6 | 9–11 | Level III Curriculum |

The onboarding landing page exposes the full ladder; XP thresholds and lesson difficulty scale with stage.

---

## Levels, ILTs and Domain Weighting

The Class 3 Month 1 scheme is organised around **Integrated Learning Themes (ILTs)** — e.g. *The Home* — each theme aggregating weekly units across all subjects. The quest board's ILT chips filter lessons by theme, with an honest fallback note when a theme has no built lessons yet.

Subjects carry their official **domain weightings**:

| Domain | Weight | Subjects |
|---|---|---|
| Basic Knowledge | 60 % | English, Mathematics, Science & Technology, Français (and Social Studies per scheme) |
| Communal Life | 5 % | Social Studies |
| Vocational & Life Skills | 20 % | Vocational Studies, Physical Education & Sports, Arts |
| Digital Literacy | 10 % | Information & Communication Technology |
| Cultural Identity | 5 % | **National Languages and Cultures** |

These weights appear on the curriculum navigator cards and drive the XP distribution.

---

## The Lesson Plan Format (6.3)

Every lesson — hand-authored or AI-generated via `POST /api/lesson-plan` — conforms to the stipulated 6.3 JSON structure:

```jsonc
{
  "title": "Saluer au salon / Greetings at home",
  "stage": "Class 3", "subject": "English", "ilt": "The Home",
  "voiceAssets":   { "characters": [...], "narrations": [...] },
  "voiceInteractions": [ { "phase": "hook", "type": "listen-repeat", "target": "…" } ],
  "stsScenarios":  [ { "persona": "kwe", "goal": "…", "successCriteria": [...] } ],
  "gamification":  { "mechanics": ["xp", "badge-challenge"], "xp": 50 },
  "activities":    { /* 5 phases, see below */ },
  "assessment":    { "criteria": [...] },
  "differentiation": { "support": "…", "extension": "…" },
  "offlineCapability": { "diyCard": "…", "voicePractice": "…" },
  "culturalNotes": { "en": "…", "fr": "…" },
  "languagePolicy": { "nationalLanguageContent": "attested-only" }
}
```

The AI generator (`/api/lesson-plan`) is prompt-constrained to this format **and** to the closed attestation list for national-language anchors — it can compose freely in EN/FR but may only reuse Hyman-attested Kom/Lamnso' forms, never invent.

---

## The Five-Phase Lesson Flow

The Lesson Player walks the child through five phases; forward-phase chips lock until the current phase completes (with a 🔒 tooltip — no silent dead-ends):

1. **Voice Hook** — the in-character narrator opens with a listen-in line (interface language or recorded national-language audio).
2. **Listen & Learn** — narration + vocabulary with per-word audio.
3. **Speak & Practice** — hold-to-talk mic exercises scored by `/api/pronunciation` (tone 40 % / segmental 60 % for Kom).
4. **Apply & Create** — STS scenario or interactive task.
5. **Celebrate** — confetti, XP award, badge ceremony (attested-only celebration strings).

---

## Gamification: XP, Badges, Skill Tree

- **XP** — awarded per activity, phase and DIY completion; level titles scale (e.g. *Curious Cub* at Lv 1, 250 XP ceiling visible in the HUD).
- **Badges** — 31 achievements (`Badge` model), e.g. *Culture Keeper* (national-language activities), *Puppet Master* (DIY workshop completion).
- **Skill tree** — 23 nodes (`SkillProgress`), including tone-ear nodes fed by pronunciation scores.
- **Streaks** — daily-activity streaks via the `ActivityEvent` stream.
- **Projects** — see below; completing phases awards phase XP and the *Project Master* badge.

---

## The DIY Lesson Model

Every Class 3 lesson card in the DIY Workshop is a **low-tech-first bundle** designed for real infrastructure:

| Component | Duration | What it is |
|---|---|---|
| **Digital** | 5–10 min | The voice-enabled lesson (needs a device) |
| **DIY** | 15–30 min | Hands-on activity — flashcards, word-family posters, counting sticks, role-play puppets (needs no electricity) |
| **Voice Practice** | 5–10 min | Pronunciation drill loop (works offline from cached audio) |

The DIY Workshop lets learners **claim** DIY cards; completion awards real XP + badges via `PUT /api/learner` (with a success banner — the award engine is server-side, not cosmetic).

---

## Project-Based Learning

`Project`/`ProjectNote` implement the national PBL cycle in three phases — **brief → build → present** — each phase awarding XP, with notes and the *Project Master* badge on completion. Projects tie ILT themes to community-relevant outputs (a family tree poster, a market-scene role-play, a numbers scavenger hunt).

---

## Assessment (CBA)

`Assessment` records are CBA-aligned: criteria-based scoring (not percentages-only), per-learner and cohort views, and platform analytics (`GET /api/assessments`) for supervisors — subject mastery averages, XP distribution, engagement.

---

## National Languages & Culture Subject

The platform's signature subject (Cultural Identity domain, 5 %) teaches the **national language itself**: attested vocabulary with tone coaching, listening stations (Audio Bible), graded primers, and STS practice. Its content is subject to the strictest pipeline rules — attested-only text, recorded-only audio — as detailed in [INGESTION.md](INGESTION.md) and [CORPUS.md](CORPUS.md).
