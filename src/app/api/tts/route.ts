import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, CHARACTER_VOICES, CharacterId } from "@/lib/server/voice";

export const maxDuration = 60;

/**
 * POST /api/tts — Text-to-Speech (Master Prompt 3.1.2)
 * body: { text, character?: 'kwe'|'mbi'|'ngo'|'kong', voice?, speed?, lang? }
 * returns: { audioBase64 (WAV), pitchRate (client playback rate per persona) }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = (body.text || "").trim();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    const character = (body.character || "kwe") as CharacterId;
    const persona = CHARACTER_VOICES[character] || CHARACTER_VOICES.kwe;
    const voice = body.voice || persona.voice;
    const speed = typeof body.speed === "number" ? body.speed : persona.speed;

    const { audioBase64 } = await synthesizeSpeech({ text, voice, speed });
    return NextResponse.json({ audioBase64, contentType: "audio/wav", pitchRate: persona.pitchRate, character });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    console.error("TTS error:", msg);
    return NextResponse.json({ error: msg, fallback: "webspeech" }, { status: 502 });
  }
}
