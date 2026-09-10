# ============================================================================
# unified_voice.py — OMNIVOICE v4.0 Unified Voice Service (spec §2.3)
# Complete voice pipeline: STT (Faster-Whisper) → LLM → TTS (Kokoro-82M)
# with the Chroma-1.0 end-to-end STS option and cascaded fallback (spec:
# "Fallback to cascaded pipeline" in speech_to_speech).
# ============================================================================
import base64
import logging
import os
import tempfile
from typing import Optional

from voice_registry import (
    VoiceRegistry, get_character_prompt, TTSBackend, STTBackend, STSBackend,
)

log = logging.getLogger("omnivoice.unified")

try:
    import requests  # type: ignore
except Exception:  # pragma: no cover
    requests = None  # type: ignore[assignment]

try:
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover
    np = None  # type: ignore[assignment]


class UnifiedVoiceService:
    """Complete voice pipeline: STT → LLM → TTS with STS option (spec §2.3)."""

    def __init__(self):
        self.registry = VoiceRegistry()

        # Initialize STT (Faster-Whisper per §1.2)
        try:
            from faster_whisper_stt import FasterWhisperSTTService
            self.stt = FasterWhisperSTTService()
        except Exception as e:
            log.error("STT init failed: %s", e)
            self.stt = None

        # Initialize TTS (Kokoro-82M per §1.1)
        try:
            from kokoro_tts import KokoroTTSService
            self.tts = KokoroTTSService()
        except Exception as e:
            log.error("TTS init failed: %s", e)
            self.tts = None

        # Initialize STS (Chroma per §1.3 Option A)
        self.chroma_url = os.environ.get("CHROMA_URL", "http://localhost:8000/v1/chat/completions")

    # ------------------------------------------------------------------
    # speech_to_text (spec §2.3)
    # ------------------------------------------------------------------
    async def speech_to_text(
        self,
        audio_bytes: bytes,
        language: Optional[str] = None,
        model_size: str = "base",
    ) -> dict:
        """Convert speech to text."""
        if self.stt is None or not self.stt.ready:
            raise RuntimeError("Faster-Whisper STT unavailable on this host")
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, lambda: _run_stt(self.stt, audio_bytes, language, model_size)
        )

    # ------------------------------------------------------------------
    # text_to_speech (spec §2.3)
    # ------------------------------------------------------------------
    async def text_to_speech(
        self,
        text: str,
        language: str = "en",
        voice: Optional[str] = None,
        speed: float = 1.0,
    ) -> bytes:
        """Convert text to natural speech."""
        if self.tts is None or not self.tts.ready:
            raise RuntimeError("Kokoro TTS unavailable on this host")
        cfg = self.registry.get_config(language)
        default_voices = {"en": "af_bella", "fr": "ff_siwis"}
        voice = voice or default_voices.get(language, "af_bella")
        speed = speed if speed else cfg.tts_speed

        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, lambda: _run_tts(self.tts, text, language, voice, speed)
        )

    # ------------------------------------------------------------------
    # speech_to_speech (spec §2.3) — Chroma first, cascaded fallback
    # ------------------------------------------------------------------
    async def speech_to_speech(
        self,
        audio_bytes: bytes,
        language: str = "en",
        character: str = "kwe",
        generate_response=None,
    ) -> dict:
        """Complete speech-to-speech pipeline.

        Tries the Chroma-1.0 end-to-end STS backend first (spec §1.3 Option A
        payload) and falls back to the cascaded pipeline
        (Faster-Whisper → LLM → Kokoro) exactly as stipulated.
        `generate_response(text) -> str` supplies the LLM step of the
        cascaded path (HuggingFace speech-to-speech / OpenAI-compatible API
        per §1.4 config: llm.backend).
        """
        sts_backend = self.registry.get_config(language).sts_backend

        if sts_backend == STSBackend.CHROMA and requests is not None:
            try:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(audio_bytes)
                    audio_path = f.name
                payload = {
                    "model": "chroma",
                    "messages": [
                        {"role": "system", "content": get_character_prompt(character)},
                        {"role": "user", "content": [{"type": "audio", "audio": audio_path}]},
                    ],
                    "max_tokens": 500,
                    "return_audio": True,
                }
                response = requests.post(self.chroma_url, json=payload, timeout=8)
                result = response.json()
                if result.get("audio"):
                    return {
                        "audio": base64.b64decode(result["audio"]),
                        "engine": "chroma-1.0",
                        "backend": "chroma",
                    }
            except Exception as e:
                log.info("Chroma STS unavailable (%s) — cascaded fallback", e)
            finally:
                try:
                    os.unlink(audio_path)
                except (OSError, UnboundLocalError):
                    pass

        # Fallback to cascaded pipeline (spec §2.3)
        stt_result = await self.speech_to_text(audio_bytes, language)
        response_text = await _generate_response(generate_response, stt_result["text"], character)
        audio = await self.text_to_speech(response_text, language)
        return {
            "audio": audio,
            "transcript": stt_result["text"],
            "reply": response_text,
            "engine": "cascaded (faster-whisper → llm → kokoro)",
            "backend": "cascaded",
        }


# ---------------------------------------------------------------------------
# executor helpers (CPU-bound model inference off the event loop)
# ---------------------------------------------------------------------------
def _run_stt(stt_service, audio_bytes: bytes, language, model_size):
    import asyncio
    coro = stt_service.transcribe(audio_bytes, language, model_size)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                return ex.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


def _run_tts(tts_service, text, language, voice, speed):
    import asyncio
    coro = tts_service.synthesize(text, language, voice, speed)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                return ex.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


async def _generate_response(generate_response, text: str, character: str) -> str:
    """LLM step of the cascaded path. Delegates to the injected generator
    (HuggingFace speech-to-speech pipeline / OpenAI-compatible API per §1.4);
    without one, an in-character echo prompt keeps the turn alive."""
    if generate_response is not None:
        return await generate_response(text) if _is_awaitable(generate_response) else generate_response(text)
    return f"I am listening, tell me more about that! ({character})"


def _is_awaitable(fn) -> bool:
    import inspect
    return inspect.iscoroutinefunction(fn)
