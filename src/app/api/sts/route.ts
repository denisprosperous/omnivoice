import { NextRequest, NextResponse } from "next/server";
import {
  transcribeAudio, transcribeGrassfields, synthesizeSpeech, synthesizeGrassfields,
  CHARACTER_VOICES, STS_SYSTEM, CharacterId, getZAI,
} from "@/lib/server/voice";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 90;

/**
 * POST /api/sts — full Speech-to-Speech pipeline (Master Prompt v2.0 §4.1.3/§6.5)
 * Learner Speech → ASR (per-language, Grassfields-aware) → LLM understanding
 * (code-switching tolerated) → Response → TTS (tone-aware) → audio out
 * body: { audioBase64 (WAV), character, scenario, history?, learnerName?, learnerLevel?, lang? }
 * returns: { transcript, reply, audioBase64, pitchRate }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body.audioBase64 || "";
    const character = (body.character || "kwe") as CharacterId;
    const scenario: string = body.scenario || "Friendly greeting conversation";
    const lang: string = body.lang || "en";
    const learnerName: string = body.learnerName || "my friend";
    const learnerLevel: string = body.learnerLevel || "Class 3";
    if (!audio) return NextResponse.json({ error: "audioBase64 required" }, { status: 400 });
    const clean = audio.includes(",") ? audio.split(",")[1] : audio;

    // Step 1: ASR — Grassfields languages route through per-language models (§6.5)
    let transcript: string;
    if (isGrassfields(lang)) {
      const g = await transcribeGrassfields(clean, lang);
      transcript = g.text;
    } else {
      transcript = await transcribeAudio(clean);
    }
    if (!transcript) {
      return NextResponse.json({ transcript: "", reply: "", audioBase64: "", error: "no_speech" });
    }

    // Step 2: LLM response generation (with short history for turn-taking)
    const zai = await getZAI();
    const history: Array<{ role: string; content: string }> = Array.isArray(body.history)
      ? body.history.slice(-6).map((h: { role: string; content: string }) => ({ role: h.role, content: h.content }))
      : [];
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: STS_SYSTEM(character, lang, scenario, learnerName, learnerLevel) },
        ...history,
        { role: "user", content: transcript },
      ],
      thinking: { type: "disabled" },
    });
    const reply: string = (completion?.choices?.[0]?.message?.content || "I am listening, tell me more!").trim();

    // Step 3: TTS with character persona — Grassfields route is tone-aware (§6.5)
    const persona = CHARACTER_VOICES[character] || CHARACTER_VOICES.kwe;
    let audioBase64: string;
    if (isGrassfields(lang)) {
      const out = await synthesizeGrassfields({ text: reply, language: lang, voice: persona.voice, speed: persona.speed });
      audioBase64 = out.audioBase64;
    } else {
      ({ audioBase64 } = await synthesizeSpeech({ text: reply, voice: persona.voice, speed: persona.speed }));
    }

    return NextResponse.json({ transcript, reply, audioBase64, pitchRate: persona.pitchRate, language: lang });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "STS failed";
    console.error("STS error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
