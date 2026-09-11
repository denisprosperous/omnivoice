import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/vocab — Phase 1 Kom lexicon (v4.2 §6.2).
 * Query: ?q=<search>&ilt=<theme>&attestation=attested|awaiting&band=1-2|3&limit=&offset=
 * Returns { stats, total, entries }.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim() || "";
    const ilt = sp.get("ilt") || "";
    const attestation = sp.get("attestation") || "";
    const band = sp.get("band") || "";
    const limit = Math.min(parseInt(sp.get("limit") || "60", 10) || 60, 500);
    const offset = parseInt(sp.get("offset") || "0", 10) || 0;

    const where = {
      ...(ilt ? { ilt } : {}),
      ...(attestation ? { attestation } : {}),
      ...(band ? { classBand: band } : {}),
      ...(q
        ? {
            OR: [
              { glossEn: { contains: q } },
              { glossFr: { contains: q } },
              { word: { contains: q } },
            ],
          }
        : {}),
    };

    const [total, attested, awaiting, entries] = await Promise.all([
      db.vocabulary.count(),
      db.vocabulary.count({ where: { attestation: "attested" } }),
      db.vocabulary.count({ where: { attestation: "awaiting" } }),
      db.vocabulary.findMany({ where, orderBy: { id: "asc" }, take: limit, skip: offset }),
    ]);

    return NextResponse.json({
      stats: { total, attested, awaiting, phase: 1, phaseName: "High-frequency (Classes 1–3)" },
      total: entries.length,
      entries,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Vocabulary query failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
