import { NextRequest, NextResponse } from "next/server";
import {
  transcribeGrassfields, STS_SYSTEM, CharacterId, getZAI,
} from "@/lib/server/voice";
import {
  getVoiceConfig, tryChromaSTS, fasterWhisperSTT, grassfieldsSTT,
  kokoroTTS, latencyStats, recordStsLatency,
} from "@/lib/server/voice-v4";
import { isGrassfields } from "@/lib/data/grassfields";

export const maxDuration = 90;

/**
 * POST /api/sts — Speech-to-Speech (v4.0 §1.3/§2.3)
 * Chroma-1.0 end-to-end STS first (Option A payload); on absence the
 * stipulated cascaded pipeline runs: Faster-Whisper STT (Silero VAD) →
 * LLM in-character (code-switching tolerated) → Kokoro-82M TTS (tone-aware
 * for Grassfields). body: { audioBase64, character, scenario, history?,
 * learnerName?, learnerLevel?, lang? }
 * returns: { transcript, reply, audioBase64, pitchRate, stsEngine, latencyMs }
 */
export async function POST(req: NextRequest) {
  const started = Date.now();
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

    // ---- Chroma-1.0 end-to-end attempt (spec §1.3 Option A) ----
    const chroma = await tryChromaSTS({ wavBase64: clean, character });
    if (chroma) {
      const latencyMs = Date.now() - started;
      recordStsLatency(latencyMs);
      return NextResponse.json({
        transcript: "", reply: "", audioBase64: chroma.audioBase64,
        stsEngine: chroma.engine, backend: "chroma", latencyMs, language: lang,
      });
    }

    // ---- Cascaded fallback (spec §2.3): STT → LLM → TTS ----
    // Step 1: ASR — Faster-Whisper (v4.0) with Grassfields per-language routing
    const asr = isGrassfields(lang)
      ? await grassfieldsSTT(clean, lang)
      : await fasterWhisperSTT({ wavBase64: clean, language: lang });
    const transcript = asr.text;
    if (!transcript) {
      return NextResponse.json({ transcript: "", reply: "", audioBase64: "", error: "no_speech" });
    }

    // Step 2: LLM response generation (with short history for turn-taking)
    const zai = await getZAI();
    const history: Array<{ role: "user" | "assistant" | "system"; content: string }> = Array.isArray(body.history)
      ? body.history.slice(-6).map((h: { role: string; content: string }) => ({
          role: (h.role === "user" ? "user" : h.role === "system" ? "system" : "assistant") as "user" | "assistant" | "system",
          content: h.content,
        }))
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

    // Step 3: TTS — Kokoro-82M with character voice profile (v4.0 §1.1)
    const tts = await kokoroTTS({ text: reply, language: lang, character });

    const latencyMs = Date.now() - started;
    recordStsLatency(latencyMs);
    return NextResponse.json({
      transcript,
      reply,
      audioBase64: tts.audioBase64,
      pitchRate: characterPitch(character),
      stsEngine: `${asr.engine} → llm → ${tts.engine}`,
      asrBackend: asr.backend,
      ttsBackend: tts.backend,
      registry: getVoiceConfig(lang),
      latencyMs,
      language: lang,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "STS failed";
    console.error("STS error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function characterPitch(character: string): number {
  const pitch: Record<string, number> = { kwe: 0.8, mbi: 1.32, ngo: 1.05, kong: 0.9 };
  return pitch[character] ?? 1;
}
