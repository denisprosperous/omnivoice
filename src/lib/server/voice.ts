// ============================================================================
// SERVER VOICE PIPELINE — OmniVoice (per Master Prompt 5.5 VoicePipeline)
// TTS: neural synthesis, WAV output; character differentiation via voice +
// speed + client-side playback pitch. ASR: server transcription. STS: full
// speech-to-speech (ASR → LLM → TTS). Pronunciation: ASR + similarity scoring.
// ============================================================================
import ZAI from "z-ai-web-dev-sdk";

export type CharacterId = "kwe" | "mbi" | "ngo" | "kong";

// Voice persona map — distinct audible identity per character (3.3)
export const CHARACTER_VOICES: Record<
  CharacterId,
  { voice: string; speed: number; pitchRate: number; label: string }
> = {
  kwe:  { voice: "tongtong", speed: 0.85, pitchRate: 0.8,  label: "Wise owl elder — warm, patient" },
  mbi:  { voice: "tongtong", speed: 1.05, pitchRate: 1.32, label: "Curious monkey — playful, child-like" },
  ngo:  { voice: "xiaochen", speed: 1.0,  pitchRate: 1.05, label: "Brave girl — confident, clear" },
  kong: { voice: "tongtong", speed: 0.95, pitchRate: 0.9,  label: "Resourceful boy — adventurous, friendly" },
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

/** Transcribe base64 WAV audio */
export async function transcribeAudio(wavBase64: string): Promise<string> {
  const zai = await getZAI();
  const res = await zai.audio.asr.create({ file_base64: wavBase64 });
  return (res?.text || "").toString().trim();
}

// ---- Pronunciation scoring (evaluate_pronunciation per 5.5) ----
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëîïôöùûüçñ\s]/gi, "")
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
export function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  const d = levenshtein(na, nb);
  const score = Math.max(0, Math.round((1 - d / Math.max(na.length, nb.length)) * 100));
  return score;
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

/** STS conversational partner — per-lesson character role-play */
export const STS_SYSTEM = (character: CharacterId, language: string, scenario: string, learnerName: string, learnerLevel: string) => {
  const charDesc: Record<CharacterId, string> = {
    kwe: "You are Kwe, a wise, warm owl elder who speaks slowly and kindly, full of proverbs.",
    mbi: "You are Mbi, a playful, energetic young monkey who is curious and funny.",
    ngo: "You are Ngo, a brave, confident girl who encourages and leads.",
    kong: "You are Kong, an adventurous, friendly boy who loves questions and challenges.",
  };
  const langRule = language === "fr" ? "Reply ONLY in simple French suitable for a Class 3 child." : "Reply ONLY in simple English suitable for a Class 3 child.";
  return `${charDesc[character]} You are doing a speaking role-play with ${learnerName}, a ${learnerLevel} learner in Cameroon. Scenario: ${scenario}. ${langRule} Keep replies SHORT (1-2 simple sentences), warm and playful — like a conversation with a wise, playful elder. Always end with a gentle question so the learner keeps speaking. Never use emojis or brackets.`;
};
