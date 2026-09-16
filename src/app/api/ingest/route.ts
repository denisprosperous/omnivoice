import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * /api/ingest — TRUSTED CONTENT INGESTION (user directive).
 *
 * Tutors, parents and educational authorities submit national-language content
 * (words, phrases, greetings, dialogues, songs, stories, corrections) WITH a
 * source citation. Native-speaker confirmation is required for Grassfields /
 * Ewondo content (Directive 9 — nothing synthetic enters the pipeline).
 *
 * GET            — list submissions. `?status=` and `?lang=` filters.
 * POST           — create a submission (status: DRAFT).
 * PATCH (admin)  — supervisor/pedagogic review: DRAFT → IN_REVIEW → ACTIVE|REJECTED.
 *                  Only ACTIVE content is ever shown to learners.
 */

const VALID_TYPES = ["greeting", "word", "phrase", "dialogue", "song", "story", "correction", "synthesis"];
const VALID_ROLES = ["tutor", "parent", "authority", "other"];
const VALID_STATUS = ["DRAFT", "IN_REVIEW", "ACTIVE", "REJECTED"];

const VALID_BUILTIN_LANGS = ["bkm", "lns", "byv", "ewo", "bfd", "oku", "bbk", "mgo", "ngi"];

async function langExists(code: string): Promise<boolean> {
  if (VALID_BUILTIN_LANGS.includes(code)) return true;
  const draft = await db.languageDraft.findUnique({ where: { code } });
  return !!draft;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const lang = sp.get("lang");
    const submissions = await db.contentSubmission.findMany({
      where: {
        ...(status && VALID_STATUS.includes(status) ? { status } : {}),
        ...(lang ? { lang } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ submissions });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Ingestion fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contributorName = String(body.contributorName || "").trim().slice(0, 60);
    const nativeText = String(body.nativeText || "").trim().slice(0, 500);
    const source = String(body.source || "").trim().slice(0, 300);
    const lang = String(body.lang || "").trim().toLowerCase().slice(0, 3);

    if (!contributorName) return NextResponse.json({ error: "contributorName required" }, { status: 400 });
    if (!nativeText) return NextResponse.json({ error: "nativeText required" }, { status: 400 });
    if (!source) return NextResponse.json({ error: "source required — cite who/where this content comes from" }, { status: 400 });
    if (!lang || !(await langExists(lang))) {
      return NextResponse.json({ error: `unknown language code "${lang}"` }, { status: 400 });
    }

    const contributorRole = VALID_ROLES.includes(body.contributorRole) ? body.contributorRole : "other";
    const contentType = VALID_TYPES.includes(body.contentType) ? body.contentType : "phrase";

    // TRUSTED-SOURCES POLICY: for national-language content the contributor must
    // confirm the text comes from a native speaker (self or documented source).
    const nativeSpeakerConfirmed = !!body.nativeSpeakerConfirmed;
    const isNationalLang = lang !== "en" && lang !== "fr";
    if (isNationalLang && !nativeSpeakerConfirmed) {
      return NextResponse.json(
        { error: "nativeSpeakerConfirmed required — national-language content must be confirmed against a native speaker (Directive 9)" },
        { status: 400 }
      );
    }

    const submission = await db.contentSubmission.create({
      data: {
        contributorName,
        contributorRole,
        contact: String(body.contact || "").slice(0, 120),
        lang,
        contentType,
        nativeText,
        translationEn: String(body.translationEn || "").slice(0, 500),
        translationFr: String(body.translationFr || "").slice(0, 500),
        source,
        nativeSpeakerConfirmed,
        notes: String(body.notes || "").slice(0, 1000),
        status: "DRAFT",
      },
    });
    return NextResponse.json({ ok: true, submission }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Ingestion submission failed";
    console.error("Content ingestion error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: `status must be one of ${VALID_STATUS.join(", ")}` }, { status: 400 });
    }
    const submission = await db.contentSubmission.update({
      where: { id },
      data: {
        status,
        reviewerNote: String(body.reviewerNote || "").slice(0, 500),
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, submission });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Review update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
