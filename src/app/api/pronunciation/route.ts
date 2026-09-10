import { NextRequest, NextResponse } from "next/server";
import {
  transcribeAudio, transcribeGrassfields, evaluateSimilarity, generateFeedback,
} from "@/lib/server/voice";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 60;

/**
 * POST /api/pronunciation — evaluate_pronunciation (Master Prompt v2.0 §6.5)
 * body: { audioBase64 (WAV), target: string, lang?: 'en'|'fr'|'bkm'|'lns'|... }
 * Tonal Grassfields languages (bkm, lns) route to tone-aware scoring:
 * returns { transcription, target, language, accuracy, tone_accuracy, feedback }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body.audioBase64 || "";
    const target: string = (body.target || "").trim();
    const lang: string = body.lang || body.language || "en";
    if (!audio || !target) return NextResponse.json({ error: "audioBase64 and target required" }, { status: 400 });
    const clean = audio.includes(",") ? audio.split(",")[1] : audio;

    let transcription: string;
    let asrModel = "base";
    let humanInTheLoop = false;
    if (isGrassfields(lang)) {
      const g = await transcribeGrassfields(clean, lang);
      transcription = g.text;
      asrModel = g.model;
      humanInTheLoop = g.humanInTheLoop;
    } else {
      transcription = await transcribeAudio(clean);
    }

    const { accuracy, toneAccuracy, toneAware } = evaluateSimilarity(transcription, target, lang);
    const fb = generateFeedback(accuracy, transcription, target);
    return NextResponse.json({
      transcription, target, language: lang,
      accuracy,
      tone_accuracy: toneAccuracy,
      tone_aware: toneAware,
      asr_model: asrModel,
      human_in_the_loop: humanInTheLoop,
      verdict: fb.verdict, message: fb.message, messageFr: fb.messageFr,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Pronunciation evaluation failed";
    console.error("Pronunciation error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
