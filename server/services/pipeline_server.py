# ============================================================================
# pipeline_server.py — OMNIVOICE v4.0 local speech pipeline server.
# Mirrors the HuggingFace speech-to-speech deployment contract (spec §1.4:
# `speech-to-speech serve --stt whisper --llm transformers --tts kokoro`) as a
# minimal HTTP surface the Next.js routes call:
#   GET  /health                 → backend availability + config summary
#   POST /v1/tts                 → Kokoro-82M synthesis (WAV 24 kHz)
#   POST /v1/stt                 → Faster-Whisper transcription (+Silero VAD)
#   POST /v1/sts                 → Chroma-1.0 STS → cascaded fallback
# Run: python server/services/pipeline_server.py  (uvicorn, port 8100)
# ============================================================================
import base64
import io
import logging
import os
import sys
import time
import uuid

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("omnivoice.pipeline")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from voice_registry import VoiceRegistry, CHARACTER_VOICES, get_character_prompt  # noqa: E402

try:
    import yaml  # type: ignore
except Exception:
    yaml = None  # type: ignore[assignment]

try:
    from fastapi import FastAPI, HTTPException  # type: ignore
    from pydantic import BaseModel  # type: ignore
    import uvicorn  # type: ignore
except Exception as e:  # pragma: no cover
    print(f"fastapi/uvicorn/pydantic required: {e}", file=sys.stderr)
    raise

from kokoro_tts import KokoroTTSService, KOKORO_AVAILABLE  # noqa: E402
from faster_whisper_stt import FasterWhisperSTTService, FASTER_WHISPER_AVAILABLE  # noqa: E402
from unified_voice import UnifiedVoiceService  # noqa: E402

CONFIG_PATH = os.environ.get(
    "OMNIVOICE_PIPELINE_CONFIG",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "config.yaml"),
)


def load_config() -> dict:
    """Load the §1.4 pipeline configuration (vad/stt/llm/tts)."""
    if yaml and os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            log.warning("config.yaml unreadable: %s", e)
    return {
        "vad": {"model": "silero-vad", "threshold": 0.5},
        "stt": {"backend": "faster-whisper", "model": "base", "language": "auto"},
        "llm": {"backend": "transformers", "model": "meta-llama/Llama-3.2-3B-Instruct", "max_tokens": 256},
        "tts": {"backend": "kokoro", "voice": "af_bella", "speed": 1.0},
    }


CONFIG = load_config()
REGISTRY = VoiceRegistry()
TTS_SERVICE = KokoroTTSService()
STT_SERVICE = FasterWhisperSTTService()
UNIFIED = UnifiedVoiceService()

app = FastAPI(title="OmniVoice v4.0 Voice Pipeline", version="4.0.0")


class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice: str = None
    speed: float = None
    character: str = None


class STTRequest(BaseModel):
    audio_base64: str
    language: str = None
    model_size: str = None


class STSRequest(BaseModel):
    audio_base64: str
    language: str = "en"
    character: str = "kwe"


@app.get("/health")
def health():
    cfg = REGISTRY.LANGUAGE_CONFIGS
    return {
        "service": "omnivoice-voice-pipeline",
        "version": "4.0.0",
        "backends": {
            "tts": {"stipulated": "kokoro-82m", "available": TTS_SERVICE.ready,
                    "pipelines": sorted(TTS_SERVICE.pipelines.keys()),
                    "cloned_voices": TTS_SERVICE.cloned_voices},
            "stt": {"stipulated": "faster-whisper", "available": STT_SERVICE.ready,
                    "models": sorted(STT_SERVICE.models.keys()),
                    "vad": CONFIG.get("vad", {}).get("model", "silero-vad")},
            "sts": {"stipulated": "chroma-1.0", "cascaded_fallback": True,
                    "chroma_url": UNIFIED.chroma_url},
        },
        "language_configs": {k: {"tts_voice": v.tts_voice, "tts_speed": v.tts_speed,
                                 "stt_model": v.stt_model, "stt_language": v.stt_language}
                             for k, v in cfg.items()},
        "character_voices": CHARACTER_VOICES,
        "config": CONFIG,
    }


@app.post("/v1/tts")
def tts(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    cfg = REGISTRY.get_config(req.language)
    # Cloned native voice packs (kom_native/lamnso_native/bayangi_native) are
    # served by the EN phonemizer pipeline until reference-audio packs deploy.
    pipeline_lang = req.language if req.language in TTS_SERVICE.pipelines else "en"
    # v4.2: resolve character aliases (kwe/mbi/ngo/kong) through the registry
    char_profile = CHARACTER_VOICES.get(req.character) if req.character else None
    requested_voice = (
        (char_profile.get("voice") if isinstance(char_profile, dict) else char_profile)
        or req.voice
        or cfg.tts_voice
    )
    if requested_voice in ("kom_native", "lamnso_native", "bayangi_native"):
        # Custom cloned voice requested but pack not deployed → default voice
        voice = TTS_SERVICE.default_voices.get(pipeline_lang, "af_bella")
        voice_note = f"{requested_voice} pending native reference audio — serving {voice}"
    elif pipeline_lang == req.language:
        voice = requested_voice
        voice_note = None
    else:
        voice = TTS_SERVICE.default_voices.get(pipeline_lang, "af_bella")
        voice_note = f"{cfg.tts_voice} served via {pipeline_lang} phonemizer on CPU host"
    speed = req.speed if req.speed is not None else cfg.tts_speed
    started = time.perf_counter()
    try:
        audio = _run_sync(TTS_SERVICE.synthesize(req.text, pipeline_lang, voice, speed))
    except Exception as e:
        log.error("TTS failed: %s", e)
        raise HTTPException(status_code=503, detail=f"kokoro unavailable: {e}")
    latency_ms = round((time.perf_counter() - started) * 1000, 1)
    return {
        "audio_base64": base64.b64encode(audio).decode("ascii"),
        "content_type": "audio/wav",
        "sample_rate": 24000,
        "voice": voice,
        "voice_note": voice_note,
        "language": req.language,
        "engine": "kokoro-82m",
        "latency_ms": latency_ms,
        "request_id": str(uuid.uuid4()),
    }


@app.post("/v1/stt")
def stt(req: STTRequest):
    if not req.audio_base64:
        raise HTTPException(status_code=400, detail="audio_base64 is required")
    cfg = REGISTRY.get_config(req.language or "en")
    model_size = req.model_size or cfg.stt_model
    try:
        audio = base64.b64decode(req.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid base64 audio")
    started = time.perf_counter()
    try:
        result = _run_sync(STT_SERVICE.transcribe(audio, cfg.stt_language if req.language else None, model_size))
    except Exception as e:
        log.error("STT failed: %s", e)
        raise HTTPException(status_code=503, detail=f"faster-whisper unavailable: {e}")
    latency_ms = round((time.perf_counter() - started) * 1000, 1)
    result.update({
        "engine": "faster-whisper",
        "model": model_size,
        "requested_language": req.language,
        "vad": CONFIG.get("vad", {}).get("model", "silero-vad"),
        "latency_ms": latency_ms,
        "request_id": str(uuid.uuid4()),
    })
    return result


@app.post("/v1/sts")
def sts(req: STSRequest):
    try:
        audio = base64.b64decode(req.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid base64 audio")
    started = time.perf_counter()
    result = _run_sync(UNIFIED.speech_to_speech(audio, req.language, req.character))
    # v4.2 fix: audio bytes are not JSON-serializable — wrap as base64
    if isinstance(result.get("audio"), (bytes, bytearray)):
        result["audio_base64"] = base64.b64encode(result["audio"]).decode("ascii")
        result["content_type"] = "audio/wav"
        result["audio"] = None
    result["latency_ms"] = round((time.perf_counter() - started) * 1000, 1)
    result["character"] = req.character
    result["character_prompt"] = get_character_prompt(req.character)
    result["request_id"] = str(uuid.uuid4())
    return result


def _run_sync(coro):
    import asyncio
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
        return ex.submit(asyncio.run, coro).result()


if __name__ == "__main__":
    port = int(os.environ.get("OMNIVOICE_PIPELINE_PORT", "8100"))
    log.info("OmniVoice v4.0 pipeline on :%s (kokoro=%s faster-whisper=%s)",
             port, KOKORO_AVAILABLE, FASTER_WHISPER_AVAILABLE)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
