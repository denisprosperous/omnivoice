import { NextRequest, NextResponse } from "next/server";
import {
  evaluateSimilarity, generateFeedback,
} from "@/lib/server/voice";
import { grassfieldsSTT, fasterWhisperSTT, getVoiceConfig } from "@/lib/server/voice-v4";
import { isGrassfields } from "@/lib/data/grassfields";
import { komToneEngine } from "@/lib/kom-tone-engine";

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

    // §6.1 KomToneEngine — Hyman HTS/LTS/M-tone rules for Kom (bkm) evaluations.
    // overall_accuracy = 40% segmental + 60% tonal (stipulated 40/60 split).
    const komTone = lang === "bkm" ? komToneEngine.evaluate(transcription, target) : null;
    const finalAccuracy = komTone ? komTone.overall_accuracy : accuracy;
    const finalToneAccuracy = komTone ? komTone.tone_accuracy : toneAccuracy;
    const komFeedback = komTone ? komTone.tone_feedback.slice(0, 4).join(" ") : null;

    return NextResponse.json({
      transcription, target, language: lang,
      accuracy: finalAccuracy,
      tone_accuracy: finalToneAccuracy,
      tone_aware: toneAware || Boolean(komTone),
      // §6.1 stipulated KomToneEngine fields
      ...(komTone ? {
        segmental_accuracy: komTone.segmental_accuracy,
        overall_accuracy: komTone.overall_accuracy,
        tone_feedback: komTone.tone_feedback,
        tone_rules_applied: komTone.tone_rules_applied,
        tone_errors: komTone.tone_errors,
        tone_total: komTone.tone_total,
      } : {}),
      asr_model: asrModel,
      asr_backend: isGrassfields(lang) ? "faster-whisper/grassfields" : "faster-whisper",
      registry: getVoiceConfig(lang),
      human_in_the_loop: humanInTheLoop,
      verdict: fb.verdict, message: komFeedback ?? fb.message, messageFr: fb.messageFr,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Pronunciation evaluation failed";
    console.error("Pronunciation error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
