import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  GRASSFIELDS_LANGUAGES, VOICE_LANGUAGES, CONTENT_TARGETS,
} from "@/lib/data/grassfields";

/**
 * /api/languages — LANGUAGE REGISTRY (v3.0: "make provision for adding more
 * dialects/local languages").
 *
 * GET  — merged registry: static Grassfields languages (8, corrected matrix)
 *        + community-submitted drafts (DB) + per-language content coverage.
 * POST — register a NEW language/dialect as a DRAFT entry. It instantly merges
 *        into every registry-driven surface (landing picker, library wing,
 *        audit matrix) and enters the data-collection pipeline:
 *        DRAFT → IN_REVIEW (native-speaker documentation) → ACTIVE (ASR/TTS).
 */
export async function GET() {
  try {
    const drafts = await db.languageDraft.findMany({ orderBy: { createdAt: "desc" } });
    const coverage = GRASSFIELDS_LANGUAGES.map((l) => ({
      code: l.code,
      status: l.status,
      priority: l.priority,
      contentLibrary: l.contentLibrary,
      asrModel: l.asrModel,
      ttsVoice: l.ttsVoice,
    }));
    return NextResponse.json({
      version: "v3.0",
      languages: GRASSFIELDS_LANGUAGES,
      voiceLanguages: VOICE_LANGUAGES,
      drafts,
      coverage,
      contentTargets: CONTENT_TARGETS,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Registry fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    if (!/^[a-z]{3}$/.test(code)) {
      return NextResponse.json({ error: "code must be exactly 3 lowercase letters (ISO-style)" }, { status: 400 });
    }
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    if (GRASSFIELDS_LANGUAGES.some((l) => l.code === code)) {
      return NextResponse.json({ error: `code "${code}" is already in the Grassfields registry` }, { status: 409 });
    }
    const existing = await db.languageDraft.findUnique({ where: { code } });
    if (existing) return NextResponse.json({ error: `code "${code}" already registered` }, { status: 409 });

    const priority = ["HIGH", "MEDIUM", "LOW"].includes(body.priority) ? body.priority : "MEDIUM";
    const draft = await db.languageDraft.create({
      data: {
        code, name,
        nativeName: String(body.nativeName || "").slice(0, 80),
        iso: String(body.iso || code).slice(0, 8),
        region: String(body.region || "").slice(0, 120),
        division: String(body.division || "").slice(0, 120),
        speakers: String(body.speakers || "").slice(0, 60),
        tones: String(body.tones || "Tonal (to be documented)").slice(0, 160),
        priority,
        notes: String(body.notes || "").slice(0, 1000),
        status: "DRAFT",
      },
    });
    return NextResponse.json({ ok: true, draft }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Language registration failed";
    console.error("Language registry error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
