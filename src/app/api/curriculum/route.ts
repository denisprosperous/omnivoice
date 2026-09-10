import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEVELS } from "@/lib/data/curriculum";

/** GET /api/curriculum — full curriculum metadata (levels ladder, subjects, ILTs, scheme weeks) */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const subjectId = sp.get("subjectId");
  const month = sp.get("month");

  const [ilts, subjects, schemeWeeks, badges] = await Promise.all([
    db.iLT.findMany({ orderBy: { order: "asc" } }),
    db.subject.findMany({ orderBy: { order: "asc" } }),
    db.schemeWeek.findMany({
      where: {
        ...(subjectId ? { subjectId } : {}),
        ...(month ? { month: Number(month) } : {}),
      },
      orderBy: [{ subjectId: "asc" }, { week: "asc" }],
    }),
    db.badge.findMany(),
  ]);

  return NextResponse.json({
    levels: LEVELS,
    badges,
    domains: [
      { name: "Basic Knowledge", weighting: 60 },
      { name: "Communal Life and National Integration", weighting: 5 },
      { name: "Vocational and Life Skills", weighting: 20 },
      { name: "Cultural Identity", weighting: 5 },
      { name: "Digital Literacy", weighting: 10 },
    ],
    nationalCoreSkills: [
      "Communication in English, French, and at least one National Language",
      "Use of basic notions in Mathematics, Science, and Technology",
      "Practice of Social and Citizenship Values",
      "Demonstration of the Spirit of Autonomy, Initiative, Creativity, and Entrepreneurship",
      "Use of Basic ICT Concepts and Tools",
      "Practice of Lifelong Learning",
      "Practice of Physical, Sports, and Artistic Activities",
    ],
    ilts: ilts.map((i) => ({ ...i, months: JSON.parse(i.months || "[]") })),
    subjects,
    schemeWeeks: schemeWeeks.map((w) => ({
      ...w,
      components: JSON.parse(w.components || "[]"),
      contents: JSON.parse(w.contents || "[]"),
      outcomes: JSON.parse(w.outcomes || "[]"),
      resources: JSON.parse(w.resources || "[]"),
    })),
  });
}
