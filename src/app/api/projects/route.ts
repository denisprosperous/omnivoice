import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { awardXp, awardBadge } from "@/lib/server/gamify";

/** GET /api/projects?learnerId= — PBL projects + Project Book notes */
export async function GET(req: NextRequest) {
  const learnerId = req.nextUrl.searchParams.get("learnerId");
  if (!learnerId) return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  const projects = await db.project.findMany({
    where: { learnerId }, orderBy: { createdAt: "desc" },
    include: { notes: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({ projects });
}

/** POST /api/projects — start a monthly PBL project (Beginning phase) */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await db.project.create({
    data: {
      learnerId: body.learnerId,
      iltId: body.iltId || "the-home",
      title: body.title || "My Home, My Pride",
      role: body.role || "leader",
      phase: 1,
    },
  });
  await db.activityEvent.create({
    data: { learnerId: body.learnerId, type: "project_phase", payload: JSON.stringify({ phase: 1, projectId: project.id }) },
  });
  await awardXp(body.learnerId, 15, "Project phase: Beginning");
  return NextResponse.json({ project });
}

/** PATCH /api/projects — advance phase / change role */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  const newPhase = Math.min(3, body.phase ?? project.phase);
  const updated = await db.project.update({
    where: { id },
    data: { phase: newPhase, role: body.role || project.role, title: body.title || project.title },
    include: { notes: true },
  });

  // Phase XP: Beginning=15, Progression=20, Culminating=25 → Project Master badge at completion
  if (newPhase > project.phase) {
    await awardXp(project.learnerId, 10 * newPhase + 5, `Project phase ${newPhase}`);
    await db.activityEvent.create({
      data: { learnerId: project.learnerId, type: "project_phase", payload: JSON.stringify({ phase: newPhase, projectId: project.id }) },
    });
    if (newPhase === 3) {
      await awardBadge(project.learnerId, "project-master");
    }
  }
  return NextResponse.json({ project: updated });
}
