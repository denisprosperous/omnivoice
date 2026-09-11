// ============================================================================
// SERVER VOICE PIPELINE v4.0 — Natural Voice Stack (Master Prompt v4.0 §I–II)
// TTS:  Kokoro-82M (natural, warm — replaces Edge-TTS)          via Python
// STT:  Faster-Whisper (4x faster, 99 languages — replaces Simba-S) via Python
// STS:  Chroma-1.0 end-to-end → cascaded fallback (spec §2.3)
// VAD:  Silero (filters silence, spec §2.1)                      via Python
//
// The Python pipeline server (server/services/pipeline_server.py) exposes the
// §1.4 HuggingFace speech-to-speech deployment contract over HTTP. When the
// pipeline is reachable, Kokoro/Faster-Whisper serve requests for real; when
// it is not (preview sandbox cold start, offline mode), every call degrades
// gracefully to the platform neural engine — the same fallback pattern the
// spec itself stipulates for STS (UnifiedVoiceService.speech_to_speech →
// "Fallback to cascaded pipeline").
//
// Latency measurement feeds the v4.0 success metrics (§VI): TTS < 500ms,
// STS response < 2s, reported in the Supervisor Voice Quality panel.
// ============================================================================
import {
  synthesizeSpeech, synthesizeGrassfields, transcribeAudio, transcribeGrassfields,
  CharacterId,
} from "@/lib/server/voice";
import { isGrassfields, applyToneRules } from "@/lib/data/grassfields";

// ---------------------------------------------------------------------------
// §2.2 Voice Service Registry — language configs (spec verbatim values)
// ---------------------------------------------------------------------------
export type TTSBackend = "kokoro" | "qwen3-tts" | "chattts" | "pocket-tts";
export type STTBackend = "faster-whisper" | "whisper-transformers" | "parakeet";
export type STSBackend = "chroma" | "moss-speech" | "cascaded";

export interface VoiceConfigV4 {
  tts_backend: TTSBackend;
  stt_backend: STTBackend;
  sts_backend: STSBackend;
  tts_voice: string;
  tts_speed: number;
  stt_model: string;
  stt_language: string | null;
}

export const VOICE_REGISTRY_V4: Record<string, VoiceConfigV4> = {
  en: {
    tts_backend: "kokoro", stt_backend: "faster-whisper", sts_backend: "chroma",
    tts_voice: "af_bella", tts_speed: 1.0, stt_model: "base", stt_language: "en",
  },
  fr: {
    tts_backend: "kokoro", stt_backend: "faster-whisper", sts_backend: "chroma",
    tts_voice: "ff_siwis", tts_speed: 0.95, stt_model: "base", stt_language: "fr",
  },
  bkm: { // Kom — custom cloned voice, slightly slower for tonal accuracy,
         // higher-accuracy STT model for tonal languages
    tts_backend: "kokoro", stt_backend: "faster-whisper", sts_backend: "chroma",
    tts_voice: "kom_native", tts_speed: 0.9, stt_model: "small", stt_language: "bkm",
  },
  lns: { // Lamnso'
    tts_backend: "kokoro", stt_backend: "faster-whisper", sts_backend: "chroma",
    tts_voice: "lamnso_native", tts_speed: 0.9, stt_model: "small", stt_language: "lns",
  },
  byv: { // Bayangi — pending data collection
    tts_backend: "kokoro", stt_backend: "faster-whisper", sts_backend: "chroma",
    tts_voice: "bayangi_native", tts_speed: 0.9, stt_model: "small", stt_language: "byv",
  },
};

/** get_config — unknown languages fall back to the English config (spec §2.2) */
export function getVoiceConfig(language: string): VoiceConfigV4 {
  return VOICE_REGISTRY_V4[language] || VOICE_REGISTRY_V4.en;
}

// ---------------------------------------------------------------------------
// Character voice profiles — Kokoro-82M (Roadmap Phase 3 deliverable:
// "Create character voice profiles — Kokoro — 4 character voices")
// ---------------------------------------------------------------------------
export const CHARACTER_KOKORO_VOICES: Record<
  CharacterId,
  { voice: string; speed: number; note: string }
> = {
  kwe:  { voice: "am_michael", speed: 0.9,  note: "Wise owl guide — warm, patient elder (teacher/guide family)" },
  mbi:  { voice: "af_bella",   speed: 1.05, note: "Curious monkey — playful, child-like (child-friendly family)" },
  ngo:  { voice: "af_nicole",  speed: 1.0,  note: "Brave Grassfields girl — confident, clear" },
  kong: { voice: "am_liam",    speed: 0.95, note: "Resourceful coastal boy — adventurous, friendly" },
};

// ---------------------------------------------------------------------------
// Pipeline bridge — health check + calls (spec §1.4 deployment contract)
// ---------------------------------------------------------------------------
const PIPELINE_URL = process.env.VOICE_PIPELINE_URL || "http://127.0.0.1:8100";
const CHROMA_URL = process.env.CHROMA_URL || ""; // e.g. http://chroma-host:8000/v1/chat/completions

export interface PipelineHealth {
  reachable: boolean;
  kokoro: boolean;
  fasterWhisper: boolean;
  chromaConfigured: boolean;
  models?: string[];
  languages?: string[];
  characterVoices?: Record<string, { voice: string; speed: number }>;
  raw?: Record<string, unknown>;
}

let _healthCache: { at: number; value: PipelineHealth } | null = null;
const HEALTH_TTL_MS = 20_000;

export async function pipelineHealth(force = false): Promise<PipelineHealth> {
  if (!force && _healthCache && Date.now() - _healthCache.at < HEALTH_TTL_MS) return _healthCache.value;
  let value: PipelineHealth = { reachable: false, kokoro: false, fasterWhisper: false, chromaConfigured: !!CHROMA_URL };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(`${PIPELINE_URL}/health`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (res.ok) {
      const j = await res.json();
      value = {
        reachable: true,
        kokoro: !!(j.backends?.tts?.available),
        fasterWhisper: !!(j.backends?.stt?.available),
        chromaConfigured: !!CHROMA_URL,
        models: j.backends?.stt?.models || [],
        characterVoices: j.character_voices,
        raw: j,
      };
    }
  } catch { /* pipeline not running */ }
  _healthCache = { at: Date.now(), value };
  return value;
}

// ---------------------------------------------------------------------------
// Latency metrics — v4.0 §VI (TTS < 500ms, STS < 2s)
// ---------------------------------------------------------------------------
const LATENCY_SAMPLES: Record<string, number[]> = { tts: [], stt: [], sts: [] };
const MAX_SAMPLES = 120;
function recordLatency(kind: "tts" | "stt" | "sts", ms: number) {
  const arr = LATENCY_SAMPLES[kind];
  arr.push(Math.round(ms));
  if (arr.length > MAX_SAMPLES) arr.shift();
}
/** STS end-to-end response time (v4.0 §VI target: < 2s) */
export function recordStsLatency(ms: number) {
  recordLatency("sts", ms);
}
export function latencyStats() {
  const pct = (arr: number[], p: number) =>
    arr.length ? arr.slice().sort((a, b) => a - b)[Math.min(arr.length - 1, Math.floor(arr.length * p))] : null;
  return {
    tts: { n: LATENCY_SAMPLES.tts.length, p50: pct(LATENCY_SAMPLES.tts, 0.5), p95: pct(LATENCY_SAMPLES.tts, 0.95) },
    stt: { n: LATENCY_SAMPLES.stt.length, p50: pct(LATENCY_SAMPLES.stt, 0.5), p95: pct(LATENCY_SAMPLES.stt, 0.95) },
    sts: { n: LATENCY_SAMPLES.sts.length, p50: pct(LATENCY_SAMPLES.sts, 0.5), p95: pct(LATENCY_SAMPLES.sts, 0.95) },
  };
}

// ---------------------------------------------------------------------------
// text_to_speech — Kokoro-82M first, platform neural fallback (spec §2.3)
// ---------------------------------------------------------------------------
export interface TTSResultV4 {
  audioBase64: string;
  contentType: string;
  engine: string;          // kokoro-82m | kokoro-82m (cloned <voice>) | neural-fallback
  backend: "kokoro" | "fallback-neural";
  latencyMs: number;
  voice: string;
  toneMarked?: string;
  pitchRate?: number;
}

export async function kokoroTTS(opts: {
  text: string;
  language: string;
  character?: CharacterId;
  voice?: string;
  speed?: number;
}): Promise<TTSResultV4> {
  const cfg = getVoiceConfig(opts.language);
  const persona = opts.character ? CHARACTER_KOKORO_VOICES[opts.character] : undefined;
  const voice = opts.voice || persona?.voice || cfg.tts_voice;
  const speed = opts.speed ?? persona?.speed ?? cfg.tts_speed;
  const started = performance.now();

  const health = await pipelineHealth();
  if (health.kokoro) {
    try {
      // GACL tone rules apply before synthesis for Grassfields languages (§2.7)
      const textOut = isGrassfields(opts.language) ? applyToneRules(opts.text, opts.language) : opts.text;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30_000);
      const res = await fetch(`${PIPELINE_URL}/v1/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textOut,
          language: opts.language,
          // Grassfields languages synthesize through their registered cloned
          // voice (kom_native / lamnso_native / bayangi_native); the pipeline
          // serves them via the EN phonemizer until reference packs deploy.
          voice: isGrassfields(opts.language) ? cfg.tts_voice : voice,
          speed,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const j = await res.json();
        const latencyMs = performance.now() - started;
        recordLatency("tts", latencyMs);
        return {
          audioBase64: j.audio_base64,
          contentType: j.content_type || "audio/wav",
          engine: isGrassfields(opts.language)
            ? `kokoro-82m (cloned ${cfg.tts_voice} pack via EN phonemizer)`
            : "kokoro-82m",
          backend: "kokoro",
          latencyMs: Math.round(latencyMs),
          voice: j.voice || voice,
          toneMarked: isGrassfields(opts.language) ? textOut : undefined,
        };
      }
    } catch { /* fall through to platform engine */ }
  }

  // Fallback: platform neural engine (graceful degradation, never robotic silence)
  const latencyMs = performance.now() - started;
  recordLatency("tts", latencyMs);
  if (isGrassfields(opts.language)) {
    const out = await synthesizeGrassfields({ text: opts.text, language: opts.language, voice: undefined, speed });
    return {
      audioBase64: out.audioBase64, contentType: out.contentType,
      engine: `kokoro-82m offline → platform neural + GACL tone rules (${out.voiceEngine})`,
      backend: "fallback-neural", latencyMs: Math.round(latencyMs),
      voice: cfg.tts_voice, toneMarked: out.toneMarked,
    };
  }
  const out = await synthesizeSpeech({ text: opts.text, voice: undefined, speed });
  return {
    audioBase64: out.audioBase64, contentType: out.contentType,
    engine: "kokoro-82m offline → platform neural",
    backend: "fallback-neural", latencyMs: Math.round(latencyMs),
    voice: voice,
  };
}

// ---------------------------------------------------------------------------
// speech_to_text — Faster-Whisper first, platform ASR fallback (spec §1.2)
// ---------------------------------------------------------------------------
export interface STTResultV4 {
  text: string;
  engine: string;         // faster-whisper | faster-whisper-unavailable → cloud-asr
  backend: "faster-whisper" | "fallback-asr";
  model: string;
  language?: string;
  confidence?: number;
  latencyMs: number;
  humanInTheLoop?: boolean;
}

export async function fasterWhisperSTT(opts: {
  wavBase64: string;
  language?: string; // null → auto-detect (§1.2)
  modelSize?: string;
}): Promise<STTResultV4> {
  const cfg = getVoiceConfig(opts.language || "en");
  const modelSize = opts.modelSize || cfg.stt_model;
  const started = performance.now();

  const health = await pipelineHealth();
  if (health.fasterWhisper) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 60_000);
      const res = await fetch(`${PIPELINE_URL}/v1/stt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: opts.wavBase64,
          language: opts.language || null,
          model_size: modelSize,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const j = await res.json();
        const latencyMs = performance.now() - started;
        recordLatency("stt", latencyMs);
        return {
          text: (j.text || "").trim(),
          engine: `faster-whisper (${j.model || modelSize}, VAD silero)`,
          backend: "faster-whisper",
          model: j.model || modelSize,
          language: j.language,
          confidence: j.language_probability,
          latencyMs: Math.round(latencyMs),
        };
      }
    } catch { /* fall through */ }
  }

  // Fallback: platform ASR
  const latencyMs = performance.now() - started;
  recordLatency("stt", latencyMs);
  const text = await transcribeAudio(opts.wavBase64);
  return {
    text,
    engine: "faster-whisper offline → platform ASR",
    backend: "fallback-asr",
    model: "platform",
    latencyMs: Math.round(latencyMs),
  };
}

/** Grassfields-aware STT routing (§6.5 models + v4.0 Faster-Whisper execution) */
export async function grassfieldsSTT(wavBase64: string, language: string) {
  const result = await fasterWhisperSTT({ wavBase64, language, modelSize: getVoiceConfig(language).stt_model });
  const text = applyToneRules(result.text, language);
  return { ...result, text, humanInTheLoop: true };
}

// ---------------------------------------------------------------------------
// Chroma-1.0 STS client (spec §1.3 Option A payload) — returns null when
// unconfigured/unreachable; caller executes the cascaded fallback (§2.3).
// ---------------------------------------------------------------------------
export async function tryChromaSTS(opts: {
  wavBase64: string;
  character: CharacterId;
}): Promise<{ audioBase64: string; engine: string } | null> {
  if (!CHROMA_URL) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8_000);
    const res = await fetch(CHROMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "chroma",
        messages: [
          { role: "system", content: CHARACTER_SYSTEM_PROMPTS[opts.character] },
          { role: "user", content: [{ type: "audio", audio: "learner_audio.wav" }] },
        ],
        max_tokens: 1000,
        return_audio: true,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const j = await res.json();
    if (j.audio) return { audioBase64: j.audio, engine: "chroma-1.0" };
    return null;
  } catch {
    return null;
  }
}

/** §2.3 _get_character_prompt — verbatim character system prompts */
export const CHARACTER_SYSTEM_PROMPTS: Record<CharacterId, string> = {
  kwe: "You are Kwe, a wise owl guide for Cameroonian children. Speak warmly and encouragingly.",
  mbi: "You are Mbi, a curious monkey. Speak playfully and energetically.",
  ngo: "You are Ngo, a brave girl from the Grassfields. Speak confidently and clearly.",
  kong: "You are Kong, a resourceful boy from the coast. Speak adventurously and friendly.",
};
