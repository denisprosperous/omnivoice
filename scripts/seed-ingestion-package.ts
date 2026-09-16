/**
 * Ingest the user's Master Ingestion Package (upload 2026-09-16) into the DB:
 *   1. Corrected Kom numbers (hundreds 100–1000, Part 0) → Vocabulary rows
 *      (attested=attested, source = GS via user package; Directive-9-safe —
 *      these are text entries, no synthesized audio).
 *   2. Part 5 agent-synthesis proposals (45) → ContentSubmission rows in the
 *      Ingestion-portal review queue with status DRAFT — the spec's Golden
 *      Rule: proposals never go live without native-speaker moderation.
 * Idempotent: upsert by id. Run: bun run scripts/seed-ingestion-package.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";

const db = new PrismaClient();

const NUMBERS: Array<{ number: number; kom: string; ipa?: string; literal?: string }> = [
  { number: 100, kom: "ivi" },
  { number: 200, kom: "ighi i bö" },
  { number: 300, kom: "ighi i tal" },
  { number: 400, kom: "ighi i kä" },
  { number: 500, kom: "ighi i täyn", ipa: "/ìɣì ì tæjn/", literal: "hundreds of five" },
  { number: 600, kom: "ighi i ntufa" },
  { number: 700, kom: "ighi i nsombö" },
  { number: 800, kom: "ighi i nfama" },
  { number: 900, kom: "ighi i bulamö'", ipa: "/ìɣì ì bulamɔʔ/", literal: "hundreds of nine" },
  { number: 1000, kom: "nkam" },
];

const SYNTHESIS_PATH = path.join(__dirname, "..", "kom_training_corpus", "10_synthesis", "pending_moderation.jsonl");

async function main() {
  // 1. Numbers → Vocabulary (source-cited, verified per the user package)
  let numCount = 0;
  for (const n of NUMBERS) {
    const id = `KOM-NUM-${n.number}`;
    await db.vocabulary.upsert({
      where: { id },
      create: {
        id,
        lang: "bkm",
        word: n.kom,
        glossEn: `${n.number} (hundred/thousand term)${n.literal ? ` — lit. ${n.literal}` : ""}`,
        glossFr: `${n.number} (terme centaine/millier)${n.literal ? ` — litt. ${n.literal}` : ""}`,
        pos: "number",
        tonePattern: null,
        nounClass: null,
        example: null,
        exampleEn: null,
        culturalNote: n.ipa ? `IPA ${n.ipa}. Ingested from the user's Master Ingestion Package (Part 0 corrections), attested in Shultz 1997 [GS] Chart 12 and Jones 1997 [TONE] §4.2.` : "Ingested from the user's Master Ingestion Package (Part 0), source [GS] Shultz 1997.",
        phase: 1,
        classBand: "3-4",
        ilt: "numeracy",
        attestation: "attested",
        source: "GS — Shultz 1997 Kom Grammar Sketch (via user ingestion package 2026-09-16, Part 0)",
        audioStatus: "PENDING_NATIVE_RECORDING",
        reviewStatus: "VERIFIED_BY_SOURCE",
      },
      update: {
        word: n.kom,
        glossEn: `${n.number} (hundred/thousand term)${n.literal ? ` — lit. ${n.literal}` : ""}`,
        glossFr: `${n.number} (terme centaine/millier)${n.literal ? ` — litt. ${n.literal}` : ""}`,
        culturalNote: n.ipa ? `IPA ${n.ipa}. Ingested from the user's Master Ingestion Package (Part 0 corrections).` : undefined,
        source: "GS — Shultz 1997 Kom Grammar Sketch (via user ingestion package 2026-09-16, Part 0)",
        audioStatus: "PENDING_NATIVE_RECORDING",
        reviewStatus: "VERIFIED_BY_SOURCE",
      },
    });
    numCount += 1;
  }
  console.log(`Numbers ingested: ${numCount} rows (KOM-NUM-100…KOM-NUM-1000)`);

  // 2. Part 5 synthesis proposals → review queue (status DRAFT = pending)
  const raw = readFileSync(SYNTHESIS_PATH, "utf-8");
  const entries: Array<{
    id: string; type: string; content: string; basis: string[];
    confidence: string; synthesized_by: string; synthesized_date: string;
  }> = raw.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

  let synthCount = 0;
  for (const e of entries) {
    const id = `SYNTH-${e.id}`;
    await db.contentSubmission.upsert({
      where: { id },
      create: {
        id,
        contributorName: `${e.synthesized_by || "agent_v1"} (agent synthesis)`,
        contributorRole: "other",
        contact: "",
        lang: "bkm",
        contentType: "synthesis",
        nativeText: `[${e.type} · confidence: ${e.confidence}] ${e.content}`.slice(0, 500),
        translationEn: "",
        translationFr: "",
        source: `Master Ingestion Package Part 5 (synthesized ${e.synthesized_date}); basis: ${e.basis.join(" | ")}`.slice(0, 300),
        nativeSpeakerConfirmed: false,
        notes: "Golden Rule: agent proposal only — requires native_speaker_moderator + linguist_moderator approval before any lesson use. Types: phonological_rule/morphological_pattern/lexical_gap/grammatical_pattern/cultural_note/pedagogical_proposal.",
        status: "DRAFT",
        reviewerNote: "",
      },
      update: {
        nativeText: `[${e.type} · confidence: ${e.confidence}] ${e.content}`.slice(0, 500),
        source: `Master Ingestion Package Part 5 (synthesized ${e.synthesized_date}); basis: ${e.basis.join(" | ")}`.slice(0, 300),
      },
    });
    synthCount += 1;
  }
  console.log(`Synthesis proposals queued: ${synthCount} rows (status DRAFT — pending native-speaker moderation)`);

  const pending = await db.contentSubmission.count({ where: { status: "DRAFT", contentType: "synthesis" } });
  console.log(`Review queue now holds ${pending} synthesis proposal(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
