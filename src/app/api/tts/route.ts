import { NextRequest, NextResponse } from "next/server";
import {
  synthesizeSpeech, synthesizeGrassfields, CHARACTER_VOICES, CharacterId,
} from "@/lib/server/voice";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 60;

/**
 * POST /api/tts — Text-to-Speech (Master Prompt v2.0 §4.1.2)
 * body: { text, character?: 'kwe'|'mbi'|'ngo'|'kong', voice?, speed?, lang? }
 * Grassfields languages route through synthesize_grassfields (§6.5):
 * apply_tone_rules → F5-TTS cloning adapter → neural synthesis.
 * returns: { audioBase64 (WAV), pitchRate, toneMarked?, voiceEngine? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = (body.text || "").trim();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });
    const lang: string = body.lang || body.language || "en";

    const character = (body.character || "kwe") as CharacterId;
    const persona = CHARACTER_VOICES[character] || CHARACTER_VOICES.kwe;
    const voice = body.voice || persona.voice;
    const speed = typeof body.speed === "number" ? body.speed : persona.speed;

    if (isGrassfields(lang)) {
      const out = await synthesizeGrassfields({ text, language: lang, voice, speed });
      return NextResponse.json({
        audioBase64: out.audioBase64, contentType: out.contentType,
        pitchRate: persona.pitchRate, character,
        toneMarked: out.toneMarked, voiceEngine: out.voiceEngine, language: lang,
      });
    }

    const { audioBase64 } = await synthesizeSpeech({ text, voice, speed });
    return NextResponse.json({ audioBase64, contentType: "audio/wav", pitchRate: persona.pitchRate, character });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    console.error("TTS error:", msg);
    return NextResponse.json({ error: msg, fallback: "webspeech" }, { status: 502 });
  }
}
