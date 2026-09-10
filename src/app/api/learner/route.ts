import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { awardXp, awardBadge, bumpSkill, LESSON_SKILLS, levelFromXp } from "@/lib/server/gamify";

/** GET /api/learner?id=... — profile + badges + skills + recent activity */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const learner = await db.learner.findUnique({ where: { id } });
  if (!learner) return NextResponse.json({ error: "not found" }, { status: 404 });
  const badges = await db.earnedBadge.findMany({ where: { learnerId: id }, orderBy: { earnedAt: "asc" } });
  const skills = await db.skillProgress.findMany({ where: { learnerId: id } });
  const activity = await db.activityEvent.findMany({
    where: { learnerId: id }, orderBy: { createdAt: "desc" }, take: 20,
  });
  const assessments = await db.assessment.findMany({
    where: { learnerId: id }, orderBy: { createdAt: "desc" }, take: 30,
  });
  return NextResponse.json({
    learner: { ...learner, ...levelFromXp(learner.xp) },
    badges, skills, activity, assessments,
  });
}

/** POST /api/learner — create profile (role gate: learner/teacher/parent/supervisor) */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const learner = await db.learner.create({
    data: {
      name: (body.name || "Friend").slice(0, 40),
      role: body.role || "learner",
      avatar: body.avatar || "lion",
      stage: body.stage || "class3",
      iscedLevel: body.iscedLevel ?? 1,
      language: body.language || "en",
    },
  });
  // Copy template skill tree to the learner
  const template = await db.skillProgress.findMany({ where: { learnerId: "__template__" } });
  for (const t of template) {
    await db.skillProgress.create({ data: { learnerId: learner.id, skillCode: t.skillCode, mastery: 0 } });
  }
  return NextResponse.json({ learner: { ...learner, ...levelFromXp(learner.xp) } });
}

/** PATCH /api/learner — update profile (language, avatar, stage) */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const allowed: Record<string, unknown> = {};
  if (data.language) allowed.language = data.language;
  if (data.avatar) allowed.avatar = data.avatar;
  if (data.stage) allowed.stage = data.stage;
  if (data.name) allowed.name = data.name;
  const learner = await db.learner.update({ where: { id }, data: allowed });
  return NextResponse.json({ learner: { ...learner, ...levelFromXp(learner.xp) } });
}

/**
 * PUT /api/learner — award engine: XP + badge + skills after a lesson
 * body: { learnerId, xp, reason, badgeCode?, skillCode?, masteryDelta?, assessment? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { learnerId } = body;
    if (!learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });

    const xp = typeof body.xp === "number" ? body.xp : 10;
    const reason = body.reason || "learning";
    const result = await awardXp(learnerId, xp, reason);

    let badge = null;
    if (body.badgeCode) badge = await awardBadge(learnerId, body.badgeCode);

    if (body.skillCode) await bumpSkill(learnerId, body.skillCode, body.masteryDelta ?? 10);

    if (body.assessment) {
      await db.assessment.create({
        data: {
          learnerId,
          lessonId: body.assessment.lessonId || "unknown",
          type: body.assessment.type || "formative",
          score: body.assessment.score ?? 0,
          details: JSON.stringify(body.assessment.details || {}),
        },
      });
    }

    return NextResponse.json({ ...result, badge });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Award failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
