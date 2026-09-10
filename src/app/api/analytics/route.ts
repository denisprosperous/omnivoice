import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * /api/analytics — v3.0 §5.1 embedded preview analytics (custom events).
 * POST body: { type, props? } — page_view | voice_language_selection |
 * lesson_completion | asr_attempt | feedback_open | profile_creation
 * GET — aggregated engagement dashboard for the Supervisor audit view.
 */
const EVENT_TYPES = [
  "page_view", "voice_language_selection", "lesson_completion",
  "asr_attempt", "feedback_open", "profile_creation", "language_registered",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = String(body.type || "");
    if (!EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])) {
      return NextResponse.json({ error: "unknown event type" }, { status: 400 });
    }
    const props = JSON.stringify(body.props && typeof body.props === "object" ? body.props : {});
    await db.previewEvent.create({ data: { type, props } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // Analytics must never break the UX — swallow with a 200-level log
    console.error("Analytics error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false });
  }
}

export async function GET() {
  try {
    const events = await db.previewEvent.findMany({ orderBy: { createdAt: "desc" }, take: 2000 });
    const byType = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
    // Voice language preference distribution (§5.1: track language preferences)
    const languageSelections: Record<string, number> = {};
    for (const e of events) {
      if (e.type !== "voice_language_selection") continue;
      try {
        const props = JSON.parse(e.props || "{}");
        const code = String(props.to || props.language || "unknown");
        languageSelections[code] = (languageSelections[code] || 0) + 1;
      } catch { /* skip malformed */ }
    }
    return NextResponse.json({
      total: events.length,
      byType,
      languageSelections,
      lastEventAt: events[0]?.createdAt || null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Analytics fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
