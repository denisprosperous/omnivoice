import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEVELS } from "@/lib/data/curriculum";
import {
  CURRICULUM_STRUCTURE, DOMAINS, CORE_SKILLS, COMPETENCES,
  ILT_LEVELS_1_2, ILT_LEVEL_3, PEDAGOGY,
  LEVEL1_OUTCOMES, LEVEL2_MONTHS, LEVEL3_EXPECTATIONS,
  TIME_ALLOCATION_LEVEL1, TIME_ALLOCATION_TOTAL, TEN_SUBJECTS,
  CLASS_LEVEL_MAP, curriculumCoverage,
} from "@/lib/data/curriculum-v42";

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
    // v4.2 §3 — full curriculum framework
    framework: {
      structure: CURRICULUM_STRUCTURE, // §3.1
      domains: DOMAINS, // §3.2
      coreSkills: CORE_SKILLS, // §3.3
      competences: COMPETENCES, // §3.4
      ilts: { level12: ILT_LEVELS_1_2, level3: ILT_LEVEL_3 }, // §3.5
      pedagogy: PEDAGOGY, // §3.6
      level1Outcomes: LEVEL1_OUTCOMES, // §3.7
      level2Months: LEVEL2_MONTHS, // §3.8
      level3Expectations: LEVEL3_EXPECTATIONS, // §3.9
      timeAllocation: { rows: TIME_ALLOCATION_LEVEL1, total: TIME_ALLOCATION_TOTAL }, // §3.10
      tenSubjects: TEN_SUBJECTS,
      classLevelMap: CLASS_LEVEL_MAP,
      coverage: curriculumCoverage(),
    },
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
