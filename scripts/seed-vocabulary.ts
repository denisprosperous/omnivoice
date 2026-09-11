/**
 * v4.2 Task 3 — ingest the 500-entry Phase 1 Kom lexicon into the Vocabulary DB.
 * Idempotent: upsert by entry id. Run: bun run scripts/seed-vocabulary.ts
 */
import { PrismaClient } from "@prisma/client";
import { buildKomLexicon, lexiconStats } from "../src/lib/data/lexicon";

const db = new PrismaClient();

async function main() {
  const entries = buildKomLexicon();
  let upserted = 0;
  for (const e of entries) {
    await db.vocabulary.upsert({
      where: { id: e.id },
      create: {
        id: e.id, lang: e.lang, word: e.word, glossEn: e.glossEn, glossFr: e.glossFr,
        pos: e.pos, tonePattern: e.tonePattern, nounClass: e.nounClass,
        example: e.example, exampleEn: e.exampleEn, culturalNote: e.culturalNote,
        phase: e.phase, classBand: e.classBand, ilt: e.ilt,
        attestation: e.attestation, source: e.source,
        audioStatus: e.audioStatus, reviewStatus: e.reviewStatus,
      },
      update: {
        word: e.word, glossEn: e.glossEn, glossFr: e.glossFr, pos: e.pos,
        tonePattern: e.tonePattern, nounClass: e.nounClass, example: e.example,
        exampleEn: e.exampleEn, culturalNote: e.culturalNote, attestation: e.attestation,
        source: e.source, audioStatus: e.audioStatus, reviewStatus: e.reviewStatus,
      },
    });
    upserted += 1;
  }
  const stats = lexiconStats(entries);
  console.log(`Ingested ${upserted}/500 vocabulary rows.`);
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
