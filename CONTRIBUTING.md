# Contributing to OmniVoice Academy

Thank you for helping build an education platform in Cameroon's own languages. Contributing is slightly unusual here: **language data has stricter rules than code**, because children will learn from what we publish. Both paths are below.

---

## Code Contributions

### Setup

```bash
git clone https://github.com/denisprosperous/omnivoice.git
cd omnivoice && npm install
cp .env.example .env
npm run db:push
npm run dev
```

### Before you open a PR

- [ ] `npm run lint` — zero errors
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Verified in the browser at **desktop (1440×900)** and **mobile (375×812)**
- [ ] **Zero console errors / zero page errors** in the browser during your flows (check with devtools or `agent-browser console`)
- [ ] Every interactive element actually works — no silent no-op handlers (this repo has a zero-tolerance button-audit policy)
- [ ] New UI strings added to **both** `en` and `fr` in `src/lib/i18n.ts`
- [ ] Any new API input validated with zod

### Conventions

- Keep the 3-commit-relevant rules of the house: components in `src/components/omnivoice/`, registries in `src/lib/data/`, routes under `src/app/api/`.
- Prefers zustand for session/registry state, TanStack Query for server state.
- Don't introduce page-level layout changes without checking 375 px.

### Adding a language to the registry

1. Open the app → Content Library → 🧩 **Language Registry Console** (runtime path — no code needed; drafts propagate to every picker).
2. For a permanent, code-level addition: edit `src/lib/data/grassfields.ts` with name, ISO 639-3, family, region, speaker estimate, and an **honest status** (`PLANNED` until real content exists).

### Adding a voice

Voices live in `src/lib/data/voices.ts`. Rules:

- `kind: "recorded"` voices must reference **real** recordings (`sampleAudioPath`).
- `kind: "persona" | "tts"` voices are interface-language only (EN/FR) and must never be selectable for national-language content — the grouping/disable logic in `voice-select.tsx` and the server-side gate in `/api/tts` both enforce this.
- Community recording slots: see [docs/INGESTION.md](docs/INGESTION.md).

---

## Language Data Contributions

**Read [docs/INGESTION.md](docs/INGESTION.md) first.** Summary:

1. **The Golden Rule** — *source or silence*: every phrase needs a verifiable citation (book, archive, or named native speaker + context). Uncited content is rejected.
2. **Preferred channel** — the in-app **Ingestion Portal** (Content Library → 📥 Content Ingestion). It handles the review workflow for you.
3. **Bulk datasets via PR** — add JSON/JSONL under `kom_training_corpus/` following existing schemas, with `source`, `attestation`, and `status: "pending_moderation"` on every record.
4. **Never** put invented phrases into learner-facing files (`grassfields.ts`, `lessons.ts`, `primers.ts`, …). Unattested slots must render as *"awaiting native-speaker documentation."*
5. **Directive 9** — no synthesized Grassfields-language audio, ever, anywhere. Native-speaker recordings only.

---

## Reporting Bugs

Open a GitHub issue with:

- What you clicked vs what happened
- Desktop or mobile, viewport width
- Console errors (copy the red text)
- If it's a language-content error: the correction via the Ingestion Portal (`type: correction`) is even better than an issue

---

## Code of Conduct

Be kind, credit native speakers, respect their authority over their own language. The platform's review workflow exists to keep that power with the community, not the developers.
