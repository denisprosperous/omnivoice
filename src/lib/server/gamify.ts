// ============================================================================
// GAMIFICATION ENGINE — XP, badges, streaks, levels, skill progress
// (Master Prompt 4.1: every phase gives XP; badges unlock; streaks tracked)
// ============================================================================
import { db } from "@/lib/db";

export const XP_PER_LEVEL = 250;
export const LEVEL_TITLES = ["Curious Cub", "Bright Explorer", "Word Hunter", "Number Ranger", "Wisdom Seeker", "Knowledge Keeper", "Community Star", "Master Learner", "Sage in Training", "Grand Legend"];

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return { level, intoLevel, needed: XP_PER_LEVEL, title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function awardXp(learnerId: string, amount: number, reason: string) {
  const learner = await db.learner.findUnique({ where: { id: learnerId } });
  if (!learner) throw new Error("Learner not found");

  // Streak logic — daily activity
  const today = todayStr();
  let streak = learner.streak;
  if (learner.lastActiveDate !== today) {
    streak = learner.lastActiveDate === yesterdayStr() ? streak + 1 : 1;
  }
  const before = levelFromXp(learner.xp).level;
  const newXp = learner.xp + amount;
  const after = levelFromXp(newXp);

  await db.learner.update({
    where: { id: learnerId },
    data: { xp: newXp, streak, lastActiveDate: today },
  });

  const events: Array<{ type: string; payload: Record<string, unknown> }> = [
    { type: "xp", payload: { amount, reason } },
  ];
  if (streak >= 7) events.push({ type: "badge", payload: { badge: "streak-7" } });
  if (after.level > before) {
    events.push({ type: "level_up", payload: { level: after.level, title: after.title } });
    if (after.level >= 5) events.push({ type: "badge", payload: { badge: "level-5" } });
  }

  for (const ev of events) {
    await db.activityEvent.create({
      data: { learnerId, type: ev.type, payload: JSON.stringify(ev.payload) },
    });
  }

  return {
    xp: newXp, streak, levelUp: after.level > before ? after : null,
    ...levelFromXp(newXp),
  };
}

export async function awardBadge(learnerId: string, badgeCode: string) {
  const existing = await db.earnedBadge.findFirst({ where: { learnerId, badgeCode } });
  if (existing) return null;
  const badge = await db.badge.findUnique({ where: { code: badgeCode } });
  if (!badge) return null;
  await db.earnedBadge.create({ data: { learnerId, badgeCode } });
  await db.activityEvent.create({
    data: { learnerId, type: "badge_earned", payload: JSON.stringify({ badge: badgeCode }) },
  });
  return badge;
}

export async function bumpSkill(learnerId: string, skillCode: string, masteryDelta: number) {
  const existing = await db.skillProgress.findFirst({ where: { learnerId, skillCode } });
  if (existing) {
    const mastery = Math.min(100, existing.mastery + masteryDelta);
    await db.skillProgress.update({ where: { id: existing.id }, data: { mastery } });
    return mastery;
  }
  await db.skillProgress.create({ data: { learnerId, skillCode, mastery: Math.min(100, masteryDelta) } });
  return masteryDelta;
}

// Skill mapping per lesson subject → skill tree nodes
export const LESSON_SKILLS: Record<string, string[]> = {
  english: ["speaking", "reading", "writing", "grammar"],
  mathematics: ["numbers", "sets", "measurement", "geometry", "statistics"],
  science: ["health-ed", "tech-eng", "env-ed"],
  francais: ["ceo-fr", "ce-fr"],
  "social-studies": ["history", "geography", "civics"],
  arts: ["visual-arts", "performing-arts"],
  pe: ["movement", "team-sports"],
  ict: ["ict-tools"],
  "national-languages": ["nat-lang"],
};
