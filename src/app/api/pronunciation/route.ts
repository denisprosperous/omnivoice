import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, similarity, generateFeedback } from "@/lib/server/voice";

export const maxDuration = 60;

/**
 * POST /api/pronunciation — evaluate_pronunciation (Master Prompt 5.5)
 * body: { audioBase64 (WAV), target: string, lang?: 'en'|'fr' }
 * returns: { transcription, target, accuracy, verdict, message, messageFr }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body.audioBase64 || "";
    const target: string = (body.target || "").trim();
    if (!audio || !target) return NextResponse.json({ error: "audioBase64 and target required" }, { status: 400 });
    const clean = audio.includes(",") ? audio.split(",")[1] : audio;

    const transcription = await transcribeAudio(clean);
    const accuracy = similarity(transcription, target);
    const fb = generateFeedback(accuracy, transcription, target);
    return NextResponse.json({
      transcription, target, accuracy,
      verdict: fb.verdict, message: fb.message, messageFr: fb.messageFr,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Pronunciation evaluation failed";
    console.error("Pronunciation error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
