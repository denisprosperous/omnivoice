import { NextRequest, NextResponse } from "next/server";
import scripture from "@/lib/data/scripture-matthew.json";

/**
 * GET /api/scripture — Kom Audio Bible (Bible.is harvest, 2026-09-16).
 *
 * Ingested under Kom from http://live.bible.is/bible/BKMBSC/MAT/1 :
 *   - verse-aligned text: Kom NT (© 2004 The Bible Society of Cameroon) with
 *     the New International Version as parallel
 *   - real chapter audio (28 mp3 files hosted in /audio/bkm/matthew/)
 *
 * GET ?chapter=1..28 → one chapter (verses + audio path)
 * GET                → chapter index (no verse bodies)
 */
export async function GET(req: NextRequest) {
  const chParam = req.nextUrl.searchParams.get("chapter");
  const chapters = scripture.chapters as Array<{
    chapter: number;
    titleKom: string;
    verses: Array<{ v: number; kom: string | null; niv: string | null }>;
    audioPath: string;
    durationS: number;
    verseCount: number;
  }>;

  if (chParam) {
    const c = Number(chParam);
    const found = chapters.find((x) => x.chapter === c);
    if (!found) return NextResponse.json({ error: `chapter ${chParam} not found` }, { status: 404 });
    return NextResponse.json({ ...scripture, chapter: found });
  }

  return NextResponse.json({
    id: scripture.id,
    language: scripture.language,
    languageName: scripture.languageName,
    book: scripture.book,
    bookKom: scripture.bookKom,
    bookEn: scripture.bookEn,
    komVersion: scripture.komVersion,
    parallelVersion: scripture.parallelVersion,
    audio: scripture.audio,
    source: scripture.source,
    note: scripture.note,
    totalChapters: chapters.length,
    totalVerses: chapters.reduce((s, c) => s + c.verseCount, 0),
    totalDurationS: chapters.reduce((s, c) => s + c.durationS, 0),
    chapters: chapters.map(({ chapter, titleKom, verseCount, durationS, audioPath }) => ({
      chapter, titleKom, verseCount, durationS, audioPath,
    })),
  });
}
