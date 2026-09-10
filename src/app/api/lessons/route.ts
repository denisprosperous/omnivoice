import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/lessons?subjectId=&week=&stage= — voice-enabled lesson catalog */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const subjectId = sp.get("subjectId");
  const stage = sp.get("stage") || "class3";
  const week = sp.get("week");
  const id = sp.get("id");

  if (id) {
    const lesson = await db.lesson.findUnique({ where: { id } });
    if (!lesson) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ lesson: { ...lesson, plan: JSON.parse(lesson.plan) } });
  }

  const lessons = await db.lesson.findMany({
    where: {
      ...(subjectId ? { subjectId } : {}),
      stage,
      ...(week ? { week: Number(week) } : {}),
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({
    lessons: lessons.map((l) => {
      const plan = JSON.parse(l.plan);
      return {
        id: l.id, subjectId: l.subjectId, stage: l.stage, iltId: l.iltId,
        subTheme: l.subTheme, month: l.month, week: l.week,
        titleEn: l.titleEn, titleFr: l.titleFr, cefr: l.cefr,
        ibProfile: JSON.parse(l.ibProfile || "[]"),
        elo: JSON.parse(l.elo || "[]"),
        xp: l.xp, badgeCode: l.badgeCode,
        subject: plan.subject, phases: plan.activities?.length || 5,
        mechanics: plan.gamification?.mechanics || [],
        practiceCount: plan.voice_assets?.practice_prompts?.length || 0,
        offline: plan.offline_capability,
      };
    }),
  });
}
