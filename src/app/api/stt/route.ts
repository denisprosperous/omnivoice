import { NextRequest, NextResponse } from "next/server";
import { fasterWhisperSTT, grassfieldsSTT, getVoiceConfig, VOICE_REGISTRY_V4, CHARACTER_KOKORO_VOICES } from "@/lib/server/voice-v4";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 90;

/**
 * POST /api/stt — Speech-to-Text (v4.0 §1.2 — Faster-Whisper stack)
 * body: { audioBase64: string (WAV), lang?: string, model?: string }
 * Routes through the v4.0 Voice Service Registry (§2.2): tonal Grassfields
 * languages use the higher-accuracy `small` model; Faster-Whisper executes
 * locally with Silero VAD (§2.1). Falls back to the platform ASR when the
 * pipeline is offline (graceful degradation, spec fallback pattern).
 * returns: { text, engine, backend, model, language?, confidence?, latencyMs }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body.audioBase64 || "";
    if (!audio) return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    const clean = audio.includes(",") ? audio.split(",")[1] : audio;
    const lang: string | undefined = body.lang || body.language || undefined;

    const out = isGrassfields(lang || "")
      ? await grassfieldsSTT(clean, lang as string)
      : await fasterWhisperSTT({ wavBase64: clean, language: lang, modelSize: body.model });

    return NextResponse.json({
      text: out.text,
      engine: out.engine,
      backend: out.backend,
      model: out.model,
      language: out.language ?? lang ?? null,
      confidence: out.confidence ?? null,
      latencyMs: out.latencyMs,
      humanInTheLoop: out.humanInTheLoop ?? false,
      registry: getVoiceConfig(lang || "en"),
      voiceRegistryVersion: "4.0",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "STT failed";
    console.error("STT error:", msg);
    return NextResponse.json({ error: msg, text: "" }, { status: 502 });
  }
}

/** GET /api/stt — v4.0 voice service registry snapshot (§2.2) */
export async function GET() {
  return NextResponse.json({
    registry_version: "4.0",
    language_configs: VOICE_REGISTRY_V4,
    character_kokoro_voices: CHARACTER_KOKORO_VOICES,
  });
}
