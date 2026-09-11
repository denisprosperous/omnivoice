/**
 * v4.2 Task 4 — ingest the graded primer ladder into the ReadingPassage DB.
 * Idempotent (upsert by id). Run: bun run scripts/seed-primers.ts
 */
import { PrismaClient } from "@prisma/client";
import { PRIMER_PASSAGES } from "../src/lib/data/primers";

const db = new PrismaClient();

async function main() {
  let upserted = 0;
  for (const p of PRIMER_PASSAGES) {
    await db.readingPassage.upsert({
      where: { id: p.id },
      create: {
        id: p.id, stage: p.stage, stageName: p.stageName, titleKom: p.titleKom,
        titleEn: p.titleEn, source: p.source, textKom: p.textKom, textEn: p.textEn,
        activities: JSON.stringify(p.activities), audioStatus: p.audioStatus,
        reviewStatus: p.reviewStatus, classBand: p.classBand, ilt: p.ilt,
      },
      update: {
        stage: p.stage, stageName: p.stageName, titleKom: p.titleKom, titleEn: p.titleEn,
        source: p.source, textKom: p.textKom, textEn: p.textEn,
        activities: JSON.stringify(p.activities), audioStatus: p.audioStatus,
        reviewStatus: p.reviewStatus,
      },
    });
    upserted += 1;
  }
  console.log(`Ingested ${upserted} reading passages across 5 stages.`);
  const byStage = await db.readingPassage.groupBy({ by: ["stage"], _count: true, orderBy: { stage: "asc" } });
  console.log(byStage.map((s) => `stage ${s.stage}: ${s._count}`).join(" · "));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
