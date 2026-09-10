import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/feedback — v3.0 §5.2 embedded feedback widget.
 * body: { rating: 1-5, voiceQuality, languageAccuracy, comments }
 * GET  /api/feedback — aggregated feedback summary for the Supervisor audit view.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
    if (!rating) return NextResponse.json({ error: "rating (1-5) required" }, { status: 400 });
    const voiceQuality = ["excellent", "good", "needs_improvement"].includes(body.voiceQuality)
      ? body.voiceQuality : "good";
    const languageAccuracy = ["accurate", "mostly_accurate", "needs_review"].includes(body.languageAccuracy)
      ? body.languageAccuracy : "mostly_accurate";
    const comments = String(body.comments || "").slice(0, 2000);

    const submission = await db.feedbackSubmission.create({
      data: { rating, voiceQuality, languageAccuracy, comments },
    });
    return NextResponse.json({ ok: true, feedback: submission });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Feedback submission failed";
    console.error("Feedback error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const submissions = await db.feedbackSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    const count = submissions.length;
    const avgRating = count ? submissions.reduce((a, s) => a + s.rating, 0) / count : 0;
    const dist = (field: "voiceQuality" | "languageAccuracy") =>
      submissions.reduce<Record<string, number>>((acc, s) => {
        acc[s[field]] = (acc[s[field]] || 0) + 1;
        return acc;
      }, {});
    return NextResponse.json({
      count,
      avgRating: Math.round(avgRating * 10) / 10,
      voiceQuality: dist("voiceQuality"),
      languageAccuracy: dist("languageAccuracy"),
      recent: submissions.slice(0, 10),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Feedback fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
