# Attribution & Sources

OmniVoice Academy stands on the shoulders of Cameroonian linguists, SIL field teams, Bible translators and native speakers. This page lists every trusted source, the third-party copyrighted works the repository hosts, and the licensing posture.

---

## 1. Third-Party Copyrighted Works Hosted Here

The repository hosts the complete Gospel of Matthew in Kom with NIV parallel text and native audio, obtained from Bible.is. **OmniVoice claims no ownership of these works.** They are hosted locally to guarantee offline classroom access in low-bandwidth environments, and are attributed with every API payload and in the player UI.

| Work | Rights holder | Copyright line | Source |
|---|---|---|---|
| **Kom New Testament text** — Ŋwàʼlɨ̀ àkòyn ghɨ Jisos Christ (Matthew) | **The Bible Society of Cameroon** | © 2004 The Bible Society of Cameroon | Bible.is `BKMBSC` (bible.is/bible/BKMBSC/MAT/1) |
| **NIV parallel text** — Holy Bible, New International Version® | **Biblica** | NIV® © 1973, 1978, 1984, 2011 by Biblica, Inc.® | Bible.is `ENGNIV` |
| **Kom audio narration** — 28 chapter recordings (drama fileset) | **Hosanna / Faith Comes By Hearing** | ℗ 2007 Hosanna / Faith Comes By Hearing | Bible.is fileset `BKMBSCN2DA` |

**Use posture.** Scripture text and audio are used for non-commercial educational access consistent with the distributors' mission of making Scripture available to every people group. If you are a rights holder and object to any hosted file, open an issue and the files will be removed promptly.

**Audio processing.** Chapters were re-encoded from the source 64 kbps MP3s to 24 kbps mono 22.05 kHz (bandwidth conservation for classroom streaming) — a transformation that does not alter copyright.

---

## 2. Linguistic Sources (Trusted-Source Whitelist)

Only content attested in these sources may appear on the platform as national-language material. The whitelist is enforced in code (`grassfields.ts`, lesson data, AI prompts) and by the ingestion portal's citation requirement.

### 2.1 Hyman — Kom phonology & tone (UC Berkeley)
Larry M. Hyman's Kom studies are the platform's authority on **tone**: tone-bearing units, the High/Low/Falling system, **HTS** (High Tone Spreading) and **LTS** (L Tone Spreading) rules, floating tones, the M-tone, noun classes, and the attested lexicon used by the `KomToneEngine` and its unit tests. The canonical attestation list derived from this work is the closed anchor set used in AI prompts (the model may reuse but never extend it).

### 2.2 SIL Cameroon publications (SIL International)
Harvested from the SIL Cameroon archive catalogue (www.silcam.org) and archived catalogues:

| Reference | Role |
|---|---|
| *Ghesɨ̀nà yeʼi itaŋikom 1* (SIL, 1996, 64 pp.; earlier edition 1984, 59 pp.) | Kom primer — graded reading content & orthography exemplars |
| *Yêm Woyn Kom 1* (SIL, 2010, 49 pp.) | Kom primer |
| *Ŋwàʼlɨ̀ àkòyn* (arithmetic, SIL, 1993, 80 pp.) | Numeracy in Kom |
| *Kiti woyn Kom 2.1* (SIL, 2009) | Continuation primer; notes adaptations into **Bafut** and **Oku** (evidence for those PLANNED tracks) |
| *Kom rev. shell* (SIL, 2007, 168 pp. — Cloudflare-gated at fetch time; exact URL recorded in the worklog) | Reference material |

*(Cloudflare/Turnstile-gated resources are recorded with their exact URLs and never approximated — if the fetch fails, the platform records the gap instead of fabricating content.)*

### 2.3 Kom New Testament (2004)
The Bible Society of Cameroon's Kom New Testament — via find.bible and Bible.is — is both a listening-station source (Matthew, see §1) and a prose reference for attested orthography in context.

### 2.4 Archives (OLAC / Wayback Machine)
Kom language resource catalogues archived by OLAC and the Internet Archive's Wayback Machine (accessed via reader proxy where direct routes fail) — used for bibliographic verification and resource discovery.

### 2.5 The general alphabet
**General Alphabet of Cameroonian Languages — GACL (1979)**: the orthographic basis for all national-language content, including the tone-marking conventions the platform teaches (mark tone on the syllable center; High unmarked, Low grave `à`, Falling circumflex `â`; 2 lexical tones marked, 3 marked on double vowels).

---

## 3. Community Sources

Content contributed through the **Ingestion Portal** by tutors, parents, educational authorities and native speakers carries its own citation (mandatory field) and contributor credit. See [INGESTION.md](INGESTION.md) for the quality gates. The 45 AI synthesis proposals in `kom_training_corpus/10_synthesis/` are **not** sources — they are candidates awaiting native-speaker moderation.

---

## 4. Software & Assets

| Component | License |
|---|---|
| Next.js, React, TypeScript, Prisma, Tailwind CSS, Radix/shadcn-ui, zustand, TanStack, framer-motion, recharts, sonner, lucide | MIT (their respective repositories) |
| Kokoro-82M (TTS) | Apache-2.0 |
| Faster-Whisper (STT) | MIT (CTranslate2 runtime); Whisper models per OpenAI license |
| ffmpeg | LGPL/GPL (system binary; not distributed in this repo) |
| z-ai-web-dev-sdk | Per SDK terms (runtime service dependency) |
| Screenshots in `docs/images/` | Part of this repository (see LICENSE) |

---

## 5. Platform License

The platform code is proprietary — © 2026 the OmniVoice project. See [LICENSE](../LICENSE). Future relicensing decisions (e.g. MIT for NGO adoption) belong to the project owner; the third-party copyrights in §1 are unaffected by any such change.
