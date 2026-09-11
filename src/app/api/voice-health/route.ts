import { NextResponse } from "next/server";
import { pipelineHealth, latencyStats, VOICE_REGISTRY_V4, CHARACTER_KOKORO_VOICES } from "@/lib/server/voice-v4";

export const dynamic = "force-dynamic";

/**
 * GET /api/voice-health — v4.0 Voice Quality Report (Roadmap Phase 1
 * deliverable "Test natural voice quality → Voice quality report") and the
 * live data source for the §VI success metrics: Voice Naturalness (feedback
 * ratings, client-side), TTS Latency < 500ms, STS Response < 2s.
 */
export async function GET() {
  const health = await pipelineHealth(true);
  return NextResponse.json({
    stack: {
      tts: { stipulated: "kokoro-82m", replaced: "edge-tts", live: health.kokoro, fallback: "platform neural engine" },
      stt: { stipulated: "faster-whisper", replaced: "simba-s", live: health.fasterWhisper, fallback: "platform ASR", vad: "silero" },
      sts: { stipulated: "chroma-1.0 | moss-speech", replaced: "cascaded-only", live: health.chromaConfigured, fallback: "cascaded (faster-whisper → llm → kokoro)" },
      pipeline: { stipulated: "huggingface speech-to-speech", contract: "config.yaml (vad/stt/llm/tts)", reachable: health.reachable },
    },
    registry_version: "4.0",
    language_configs: VOICE_REGISTRY_V4,
    character_voices: CHARACTER_KOKORO_VOICES,
    latency: latencyStats(),
    targets: { tts_latency_ms: 500, sts_response_ms: 2000, stt_accuracy: 90, voice_naturalness: 4.5 },
  });
}
