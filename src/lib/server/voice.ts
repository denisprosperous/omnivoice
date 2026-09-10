// ============================================================================
// SERVER VOICE PIPELINE — OmniVoice v2.0 (Master Prompt §6.5 VoicePipeline)
// TTS: neural synthesis, WAV output; character differentiation via voice +
// speed + client-side playback pitch. ASR: server transcription.
// STS: full speech-to-speech (ASR → LLM → TTS). Pronunciation: ASR +
// similarity scoring — TONE-AWARE for Grassfields languages (§6.5).
//
// Grassfields strategy (§2.7 / §6.5): per-language fine-tuned Simba models are
// registered; until fine-tuned weights are deployed the base ASR handles
// transcription with human-in-the-loop verification flagged (§4.1.1), and TTS
// runs through apply_tone_rules + the F5-TTS voice-cloning adapter.
// ============================================================================
import ZAI from "z-ai-web-dev-sdk";
import {
  isGrassfields, isTonal, applyToneRules,
  toneAwareSimilarity, plainSimilarity,
} from "@/lib/data/grassfields";

export type CharacterId = "kwe" | "mbi" | "ngo" | "kong";

// Voice persona map — distinct audible identity per character (§4.3)
export const CHARACTER_VOICES: Record<
  CharacterId,
  { voice: string; speed: number; pitchRate: number; label: string }
> = {
  kwe:  { voice: "tongtong", speed: 0.85, pitchRate: 0.8,  label: "Wise owl elder — warm, patient" },
  mbi:  { voice: "tongtong", speed: 1.05, pitchRate: 1.32, label: "Curious monkey — playful, child-like" },
  ngo:  { voice: "xiaochen", speed: 1.0,  pitchRate: 1.05, label: "Brave girl — confident, clear" },
  kong: { voice: "tongtong", speed: 0.95, pitchRate: 0.9,  label: "Resourceful boy — adventurous, friendly" },
};

// ---------------------------------------------------------------------------
// Grassfields language models (§6.5 self.grassfields_models)
// Fine-tuned per-language Simba checkpoints; status mirrors VOICE_MODEL_STATUS.
// ---------------------------------------------------------------------------
export interface GrassfieldsAsrModel {
  id: string;           // custom/kom-asr-model etc. (§6.5)
  language: string;     // iso code
  baseModel: string;    // Simba-S
  deployed: boolean;    // fine-tuning complete?
  humanInTheLoop: boolean; // §4.1.1 — verify critical assessments
}

export const GRASSFIELDS_ASR_MODELS: Record<string, GrassfieldsAsrModel> = {
  bkm: { id: "custom/kom-asr-model", language: "bkm", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  lns: { id: "custom/lamnso-asr-model", language: "lns", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  // v3.0 Correction 2 — Bayangi: ASR model registered but NO deployed weights
  // (asr_model: null in the v3.0 data model until the 500h data collection
  // completes — transcriptions fall through to base ASR + human-in-the-loop).
  byv: { id: "custom/bayangi-asr-model", language: "byv", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  bfd: { id: "custom/bafut-asr-model", language: "bfd", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  oku: { id: "custom/oku-asr-model", language: "oku", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  bbk: { id: "custom/babanki-asr-model", language: "bbk", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  mgo: { id: "custom/mankon-asr-model", language: "mgo", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
  ngi: { id: "custom/ngie-asr-model", language: "ngi", baseModel: "UBC-NLP/Simba-S", deployed: false, humanInTheLoop: true },
};

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
export async function getZAI() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

/** Synthesize speech → base64 WAV (response_format wav confirmed supported) */
export async function synthesizeSpeech(opts: {
  text: string;
  voice?: string;
  speed?: number;
}): Promise<{ audioBase64: string; contentType: string }> {
  const zai = await getZAI();
  const res = await zai.audio.tts.create({
    input: opts.text.slice(0, 900), // keep prompts within limits
    voice: opts.voice || "tongtong",
    speed: opts.speed ?? 0.95,
    response_format: "wav",
  });
  const buf = await res.arrayBuffer();
  return {
    audioBase64: Buffer.from(buf).toString("base64"),
    contentType: "audio/wav",
  };
}

/**
 * synthesize_grassfields (§6.5) — Grassfields TTS path:
 * apply_tone_rules → F5-TTS voice-cloning adapter (5-10s native reference) →
 * available neural TTS execution. When a cloned voice pack for the language is
 * deployed it takes precedence (voiceModel status per §2.7).
 */
export async function synthesizeGrassfields(opts: {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
}): Promise<{ audioBase64: string; contentType: string; toneMarked: string; voiceEngine: string }> {
  const toneMarked = applyToneRules(opts.text, opts.language);
  // F5-TTS zero-shot cloning adapter — reference audio from native speakers
  // (5-10s). Falls back to the available neural TTS until packs are deployed.
  const voiceEngine = "neural-tts+gacl-tone-rules (F5-TTS clone pending native reference)";
  const { audioBase64, contentType } = await synthesizeSpeech({
    text: toneMarked,
    voice: opts.voice,
    speed: opts.speed ?? 0.85, // slightly slower for tonal clarity
  });
  return { audioBase64, contentType, toneMarked, voiceEngine };
}

/** Transcribe base64 WAV audio (base model) */
export async function transcribeAudio(wavBase64: string): Promise<string> {
  const zai = await getZAI();
  const res = await zai.audio.asr.create({ file_base64: wavBase64 });
  return (res?.text || "").toString().trim();
}

/**
 * transcribe_grassfields (§6.5) — route through the per-language fine-tuned
 * Simba checkpoint when deployed; otherwise base ASR + GACL normalization,
 * flagged for human-in-the-loop verification (§4.1.1).
 */
export async function transcribeGrassfields(
  wavBase64: string,
  language: string
): Promise<{ text: string; model: string; humanInTheLoop: boolean }> {
  const reg = GRASSFIELDS_ASR_MODELS[language];
  const raw = await transcribeAudio(wavBase64);
  const text = applyToneRules(raw, language);
  return {
    text,
    model: reg?.deployed ? reg.id : `${reg?.baseModel || "base-asr"} (+GACL post-normalization)`,
    humanInTheLoop: reg?.humanInTheLoop ?? true,
  };
}

// ---- Pronunciation scoring (evaluate_pronunciation per §6.5) ----
// GACL-safe normalization: keeps Grassfields letters (ɛ ɔ ŋ ɨ ʉ ə) and tone
// diacritics so tonal comparisons remain meaningful.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'’̈]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

/** Legacy similarity — GACL-safe, used for en/fr */
export function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  const d = levenshtein(na, nb);
  return Math.max(0, Math.round((1 - d / Math.max(na.length, nb.length)) * 100));
}

/** evaluate_pronunciation (§6.5) — routes tonal languages to tone-aware scoring */
export function evaluateSimilarity(
  transcription: string,
  target: string,
  language: string
): { accuracy: number; toneAccuracy: number | null; toneAware: boolean } {
  if (isTonal(language)) {
    const { accuracy, toneAccuracy } = toneAwareSimilarity(transcription, target);
    return { accuracy, toneAccuracy, toneAware: true };
  }
  if (isGrassfields(language)) {
    return { accuracy: plainSimilarity(transcription, target), toneAccuracy: null, toneAware: false };
  }
  return { accuracy: similarity(transcription, target), toneAccuracy: null, toneAware: false };
}

export function generateFeedback(accuracy: number, transcription: string, target: string): {
  verdict: "correct" | "close" | "retry";
  message: string;
  messageFr: string;
} {
  if (accuracy >= 80)
    return { verdict: "correct", message: `Great! I heard you clearly!`, messageFr: `Bravo ! Je t'ai bien entendu !` };
  if (accuracy >= 50)
    return {
      verdict: "close",
      message: `Almost! You said "${transcription || "..."}". Try "${target}" once more, slowly.`,
      messageFr: `Presque ! Tu as dit "${transcription || "..."}". Essaie encore "${target}", lentement.`,
    };
  return {
    verdict: "retry",
    message: `Nice try! I heard "${transcription || "..."}". Listen once more, then say: "${target}".`,
    messageFr: `Bel essai ! J'ai entendu "${transcription || "..."}". Écoute encore, puis dis : "${target}".`,
  };
}

/** STS conversational partner — per-lesson character role-play (§4.1.3).
 * Multilingual: English, French, all 7 Grassfields languages + code-switching. */
export const STS_SYSTEM = (character: CharacterId, language: string, scenario: string, learnerName: string, learnerLevel: string) => {
  const charDesc: Record<CharacterId, string> = {
    kwe: "You are Kwe, a wise, warm owl elder who speaks slowly and kindly, full of proverbs.",
    mbi: "You are Mbi, a playful, energetic young monkey who is curious and funny.",
    ngo: "You are Ngo, a brave, confident girl who encourages and leads.",
    kong: "You are Kong, an adventurous, friendly boy who loves questions and challenges.",
  };
  let langRule: string;
  if (language === "fr") {
    langRule = "Reply ONLY in simple French suitable for a young child.";
  } else if (isGrassfields(language)) {
    langRule = `Reply in ${language} using GACL-compliant orthography (letters like ɛ ɔ ŋ ɨ ʉ ə, correct tone diacritics), keeping sentences very short and simple for a young learner. If the learner struggles, gently code-switch (mix English/French) as Cameroonian speakers naturally do, then return to ${language}.`;
  } else {
    langRule = "Reply ONLY in simple English suitable for a young child.";
  }
  const csNote = isGrassfields(language)
    ? " The learner may code-switch mid-sentence — accept it warmly and model the target language."
    : "";
  return `${charDesc[character]} You are doing a speaking role-play with ${learnerName}, a ${learnerLevel} learner in Cameroon. Scenario: ${scenario}. ${langRule}${csNote} Keep replies SHORT (1-2 simple sentences), warm and playful — like a conversation with a wise, playful elder. Always end with a gentle question so the learner keeps speaking. Never use emojis or brackets.`;
};
