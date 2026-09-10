import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** POST /api/projects/notes — add voice note / text entry to the Project Book */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const projectId = body.projectId;
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  const note = await db.projectNote.create({
    data: {
      projectId,
      phase: body.phase ?? 1,
      kind: body.kind || "voice",
      text: (body.text || "").slice(0, 2000),
      audio: body.audio || null,
    },
  });
  if (body.learnerId) {
    await db.activityEvent.create({
      data: { learnerId: body.learnerId, type: "voice_practice", payload: JSON.stringify({ projectId, noteId: note.id }) },
    });
  }
  return NextResponse.json({ note });
}

/** DELETE /api/projects/notes?id= */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.projectNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
