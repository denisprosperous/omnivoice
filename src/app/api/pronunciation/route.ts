import { NextRequest, NextResponse } from "next/server";
import {
  evaluateSimilarity, generateFeedback,
} from "@/lib/server/voice";
import { grassfieldsSTT, fasterWhisperSTT, getVoiceConfig } from "@/lib/server/voice-v4";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 60;

/**
 * POST /api/pronunciation — evaluate_pronunciation (Master Prompt v2.0 §6.5
 * on the v4.0 Faster-Whisper stack §1.2). Tonal Grassfields languages route
 * to tone-aware scoring; STT executes via Faster-Whisper + Silero VAD with
 * platform-ASR graceful degradation.
 * body: { audioBase64 (WAV), target: string, lang?: 'en'|'fr'|'bkm'|'lns'|... }
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
      const g = await grassfieldsSTT(clean, lang);
      transcription = g.text;
      asrModel = `${g.engine} · custom/${lang}-asr-v1 (fine-tune pending)`;
      humanInTheLoop = g.humanInTheLoop;
    } else {
      const r = await fasterWhisperSTT({ wavBase64: clean, language: lang === "fr" ? "fr" : "en" });
      transcription = r.text;
      asrModel = r.engine;
    }

    const { accuracy, toneAccuracy, toneAware } = evaluateSimilarity(transcription, target, lang);
    const fb = generateFeedback(accuracy, transcription, target);
    return NextResponse.json({
      transcription, target, language: lang,
      accuracy,
      tone_accuracy: toneAccuracy,
      tone_aware: toneAware,
      asr_model: asrModel,
      asr_backend: isGrassfields(lang) ? "faster-whisper/grassfields" : "faster-whisper",
      registry: getVoiceConfig(lang),
      human_in_the_loop: humanInTheLoop,
      verdict: fb.verdict, message: fb.message, messageFr: fb.messageFr,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Pronunciation evaluation failed";
    console.error("Pronunciation error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
