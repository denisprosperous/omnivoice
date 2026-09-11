import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/primers — graded Kom reading library (v4.2 §6.3).
 * Query: ?stage=1..5&q=<search>
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const stage = sp.get("stage");
    const q = sp.get("q")?.trim() || "";
    const where = {
      ...(stage ? { stage: parseInt(stage, 10) } : {}),
      ...(q
        ? {
            OR: [
              { titleKom: { contains: q } },
              { titleEn: { contains: q } },
              { textKom: { contains: q } },
              { textEn: { contains: q } },
            ],
          }
        : {}),
    };
    const [total, passages] = await Promise.all([
      db.readingPassage.count(),
      db.readingPassage.findMany({ where, orderBy: [{ stage: "asc" }, { id: "asc" }] }),
    ]);
    return NextResponse.json({
      ladder: [
        { stage: 1, book: "Ghesɨ̀nà Yeʼi Itaŋikom 1", focus: "Alphabet", sil: "90620 / 33384" },
        { stage: 2, book: "Ghesɨ̀nà Yeʼi Itaŋikom 2", focus: "Dialogues", sil: "33002" },
        { stage: 3, book: "Yêm Woyn Kom 1", focus: "Folk tales", sil: "99662" },
        { stage: 4, book: "Ŋwàʼlɨ̀ àkòyn 1", focus: "Proverbs & numeracy", sil: "33013" },
        { stage: 5, book: "Kom New Testament", focus: "Narratives", sil: "BKMBSC (find.bible)" },
      ],
      total,
      passages: passages.map((p) => ({ ...p, activities: JSON.parse(p.activities) })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Primers query failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
