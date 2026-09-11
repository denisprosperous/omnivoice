// Seed script — run with: bunx tsx scripts/seed.ts (or bun run scripts/seed.ts)
import { PrismaClient } from "@prisma/client";
import { ILTS, SUBJECTS, SCHEME_WEEKS, BADGES, SKILL_TREE, LEVELS, LEVEL3_ILTS } from "../src/lib/data/curriculum";
import { LESSONS } from "../src/lib/data/lessons";

const db = new PrismaClient();

async function main() {
  console.log("Seeding OmniVoice platform...");

  await db.earnedBadge.deleteMany();
  await db.skillProgress.deleteMany();
  await db.assessment.deleteMany();
  await db.projectNote.deleteMany();
  await db.project.deleteMany();
  await db.activityEvent.deleteMany();
  await db.lesson.deleteMany();
  await db.schemeWeek.deleteMany();
  await db.subject.deleteMany();
  await db.iLT.deleteMany();
  await db.badge.deleteMany();
  await db.learner.deleteMany();

  for (const ilt of [...ILTS, ...LEVEL3_ILTS]) {
    await db.iLT.create({
      data: {
        id: ilt.id, nameEn: ilt.nameEn, nameFr: ilt.nameFr, nameEw: ilt.nameEw,
        order: ilt.order, months: JSON.stringify(ilt.months), mood: ilt.mood,
        storyEn: ilt.storyEn, storyFr: ilt.storyFr, stageScope: ilt.stageScope,
      },
    });
  }
  console.log(`ILTs: ${[...ILTS, ...LEVEL3_ILTS].length}`);

  for (const s of SUBJECTS) {
    await db.subject.create({
      data: { id: s.id, nameEn: s.nameEn, nameFr: s.nameFr, domain: s.domain, weighting: s.weighting, color: s.color, icon: s.icon, order: s.order },
    });
  }
  console.log(`Subjects: ${SUBJECTS.length}`);

  for (const w of SCHEME_WEEKS) {
    await db.schemeWeek.create({
      data: {
        id: w.id, subjectId: w.subjectId, stage: w.stage, month: w.month, week: w.week, iltId: w.iltId,
        components: JSON.stringify(w.components), contents: JSON.stringify(w.contents),
        outcomes: JSON.stringify(w.outcomes), resources: JSON.stringify(w.resources),
      },
    });
  }
  console.log(`Scheme weeks: ${SCHEME_WEEKS.length}`);

  const subjectMap: Record<string, string> = {
    english: "English Language", mathematics: "Mathematics", science: "Science and Technology",
    francais: "Français", "social-studies": "Social Studies", arts: "Arts", pe: "Physical Education & Sports",
    ict: "Information and Communication Technologies", "national-languages": "National Languages and Cultures",
  };

  for (let i = 0; i < LESSONS.length; i++) {
    const L = LESSONS[i];
    await db.lesson.create({
      data: {
        id: L.lesson_id,
        subjectId: L.subject,
        stage: "class3",
        iltId: "the-home",
        subTheme: L.sub_theme,
        month: L.month,
        week: L.week,
        titleEn: L.voice_assets.learn_content.title,
        titleFr: L.voice_assets.learn_content.titleFr,
        cefr: L.cefr_alignment,
        ibProfile: JSON.stringify(L.ib_learner_profile),
        elo: JSON.stringify(L.expected_learning_outcomes),
        strategies: JSON.stringify(L.teaching_strategies),
        plan: JSON.stringify(L),
        xp: L.gamification.xp_points,
        badgeCode: L.gamification.badge_code,
        order: i,
      },
    });
  }
  console.log(`Lessons: ${LESSONS.length}`);

  for (const b of BADGES) {
    await db.badge.create({ data: { code: b.code, nameEn: b.nameEn, nameFr: b.nameFr, descEn: b.descEn, icon: b.icon, category: b.category, rarity: b.rarity } });
  }
  console.log(`Badges: ${BADGES.length}`);

  for (const s of SKILL_TREE) {
    await db.skillProgress.createMany({ data: [{ learnerId: "__template__", skillCode: s.code, mastery: 0 }] });
  }

  // Store levels as meta in ActivityEvent? No — keep levels in code (LEVELS constant exported to API)
  console.log("Levels ladder (in code):", LEVELS.length, "stages —", LEVELS.map(l => l.id).join(", "));
  console.log("Seed complete ✅");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
