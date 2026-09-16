import { NextRequest, NextResponse } from "next/server";
import { kokoroTTS, getVoiceConfig, VOICE_REGISTRY_V4, CHARACTER_KOKORO_VOICES } from "@/lib/server/voice-v4";
import { CharacterId } from "@/lib/server/voice";
import { isGrassfields } from "@/lib/data/grassfields";
import { PLATFORM_VOICES } from "@/lib/data/voices";

export const maxDuration = 60;

/**
 * POST /api/tts — Text-to-Speech (v4.0 §1.1 — Kokoro-82M natural voice stack)
 * body: { text, character?: 'kwe'|'mbi'|'ngo'|'kong', voice?, speed?, lang? }
 * Routes through the v4.0 Voice Service Registry (§2.2): Kokoro-82M synthesis
 * via the Python pipeline server; Grassfields languages carry GACL tone rules
 * (apply_tone_rules) and their registered cloned voices (kom_native /
 * lamnso_native / bayangi_native). Falls back to the platform neural engine
 * when the pipeline is offline — never robotic silence.
 * returns: { audioBase64 (WAV), pitchRate?, engine, backend, latencyMs, toneMarked? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = (body.text || "").trim();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });
    const lang: string = body.lang || body.language || "en";
    const character = (body.character || "kwe") as CharacterId;

    // Resolve a platform voice id (voices.ts registry) to its synthesis voice.
    // Recorded native voices (Directive 9) NEVER synthesize — the route
    // reports recordedOnly so clients can play real files instead.
    let voice = body.voice as string | undefined;
    let recordedOnly = false;
    const pv = voice ? PLATFORM_VOICES.find((v) => v.id === voice) : undefined;
    if (pv) {
      if (pv.engine === "native-recording") {
        recordedOnly = true;
        voice = undefined;
      } else {
        voice = pv.kokoroVoice;
      }
    }
    if (recordedOnly) {
      return NextResponse.json(
        {
          recordedOnly: true,
          voiceId: body.voice,
          note: "This voice is a REAL native recording (Directive 9) — no synthetic audio is generated for it. Play the recorded files via /api/scripture or the Audio Bible station.",
        },
        { status: 200 }
      );
    }

    const out = await kokoroTTS({
      text: text.slice(0, 900),
      language: lang,
      character,
      voice,
      speed: typeof body.speed === "number" ? body.speed : undefined,
    });

    const personaPitch = characterPitch(character);
    return NextResponse.json({
      audioBase64: out.audioBase64,
      contentType: out.contentType,
      pitchRate: personaPitch,
      character,
      engine: out.engine,
      backend: out.backend,
      latencyMs: out.latencyMs,
      voice: out.voice,
      toneMarked: out.toneMarked,
      language: lang,
      registry: getVoiceConfig(lang),
      voiceRegistryVersion: "4.0",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    console.error("TTS error:", msg);
    return NextResponse.json({ error: msg, fallback: "webspeech" }, { status: 502 });
  }
}

/** GET /api/tts — v4.0 TTS registry + character Kokoro voice profiles */
export async function GET() {
  return NextResponse.json({
    registry_version: "4.0",
    tts_backend_stipulated: "kokoro-82m",
    language_configs: VOICE_REGISTRY_V4,
    character_voices: CHARACTER_KOKORO_VOICES,
  });
}

function characterPitch(character: string): number {
  const pitch: Record<string, number> = { kwe: 0.8, mbi: 1.32, ngo: 1.05, kong: 0.9 };
  return pitch[character] ?? 1;
}
