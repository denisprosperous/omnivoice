import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { levelFromXp } from "@/lib/server/gamify";

/**
 * GET /api/assessments?learnerId= — assessment records + analytics
 * Serves Parent view (progress tracking) and Supervisor view (monitoring/QA).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const learnerId = sp.get("learnerId");

  if (learnerId) {
    const [learner, assessments, badges, activity] = await Promise.all([
      db.learner.findUnique({ where: { id: learnerId } }),
      db.assessment.findMany({ where: { learnerId }, orderBy: { createdAt: "desc" }, take: 50 }),
      db.earnedBadge.findMany({ where: { learnerId } }),
      db.activityEvent.findMany({ where: { learnerId }, orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
    if (!learner) return NextResponse.json({ error: "not found" }, { status: 404 });

    const byType: Record<string, { count: number; avg: number }> = {};
    for (const a of assessments) {
      byType[a.type] = byType[a.type] || { count: 0, avg: 0 };
      byType[a.type].count++;
      byType[a.type].avg = Math.round(((byType[a.type].avg * (byType[a.type].count - 1) + a.score) / byType[a.type].count) * 10) / 10;
    }
    const voiceEvents = activity.filter((a) => a.type === "voice_practice").length;
    const lessonEvents = activity.filter((a) => a.type === "xp").length;

    return NextResponse.json({
      learner: { ...learner, ...levelFromXp(learner.xp) },
      assessments, badges, byType, voiceEvents, totalLearningEvents: lessonEvents,
    });
  }

  // Aggregate — supervisor quality-assurance view
  const [learners, allAssessments, allBadges, allEvents] = await Promise.all([
    db.learner.findMany(),
    db.assessment.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.earnedBadge.findMany(),
    db.activityEvent.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
  ]);

  const avgScore = allAssessments.length
    ? Math.round((allAssessments.reduce((s, a) => s + a.score, 0) / allAssessments.length) * 10) / 10
    : 0;
  const voiceShare = allEvents.length
    ? Math.round((allEvents.filter((e) => e.type === "voice_practice").length / allEvents.length) * 100)
    : 0;

  return NextResponse.json({
    totals: {
      learners: learners.length,
      assessments: allAssessments.length,
      badgesAwarded: allBadges.length,
      avgScore,
      voiceInteractionShare: voiceShare,
    },
    learners: learners.map((l) => ({
      id: l.id, name: l.name, stage: l.stage, xp: l.xp, streak: l.streak, role: l.role,
      ...levelFromXp(l.xp),
    })),
    recentAssessments: allAssessments.slice(0, 20),
  });
}

/** POST /api/assessments — record an assessment run */
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  const assessment = await db.assessment.create({
    data: {
      learnerId: body.learnerId,
      lessonId: body.lessonId || "unknown",
      type: body.type || "formative",
      score: body.score ?? 0,
      details: JSON.stringify(body.details || {}),
    },
  });
  return NextResponse.json({ assessment });
}
