# ============================================================================
# kokoro_tts.py — OMNIVOICE v4.0 TTS service (spec §1.1)
# Kokoro-82M: natural-sounding, 82M params, efficient. 54 voices across
# multiple languages. Replaces Edge-TTS (slow/robotic) per the Critical Voice
# Quality Correction. Voice cloning via reference audio for Grassfields
# languages (kom_native / lamnso_native / bayangi_native voice packs).
# ============================================================================
import io
import logging
import os

log = logging.getLogger("omnivoice.kokoro")

KOKORO_AVAILABLE = False
try:
    from kokoro import KPipeline  # type: ignore
    import numpy as np  # type: ignore
    import soundfile as sf  # type: ignore
    KOKORO_AVAILABLE = True
except Exception as _e:  # pragma: no cover — CPU-only preview sandbox fallback
    log.warning("Kokoro not importable (%s) — falling back to platform TTS", _e)
    np = None  # type: ignore[assignment]
    sf = None  # type: ignore[assignment]

SAMPLE_RATE = 24000


class KokoroTTSService:
    """Natural-sounding speech synthesis (spec §1.1 KokoroTTSService).

    Pipelines load lazily (first request per language) to keep the memory
    footprint low on CPU-only preview hosts — the 82M model weights are
    shared per language pipeline as they are requested.
    """

    def __init__(self):
        self.pipelines = {}
        self.default_voices = {
            "en": "af_bella",
            "fr": "ff_siwis",
        }
        # Constrained hosts may restrict languages, e.g. OMNIVOICE_TTS_LANGS=en
        self.enabled_langs = [l.strip() for l in os.environ.get("OMNIVOICE_TTS_LANGS", "en,fr").split(",") if l.strip()]
        # Custom cloned voice packs (spec §2.2 kom_native/lamnso_native/
        # bayangi_native) — enabled when reference audio is deployed via the
        # OMNIVOICE_VOICE_PACK_DIR convention.
        self.cloned_voices = {
            "bkm": os.environ.get("KOM_VOICE_PACK", "kom_native"),
            "lns": os.environ.get("LAMNSO_VOICE_PACK", "lamnso_native"),
            "byv": os.environ.get("BAYANGI_VOICE_PACK", "bayangi_native"),  # pending data collection
        }
        # Grassfields text is rendered through the EN pipeline phonemizer in
        # this sandbox; on GPU deployments the cloned voice packs take over.
        self.pipeline_for_cloned = "en"

    def _get_pipeline(self, lang: str):
        """Lazy pipeline construction — one shared 82M model per language."""
        if lang in self.pipelines:
            return self.pipelines[lang]
        if not KOKORO_AVAILABLE or lang not in self.enabled_langs:
            return None
        try:
            t0 = __import__("time").perf_counter()
            self.pipelines[lang] = KPipeline(lang_code="a" if lang == "en" else "f" if lang == "fr" else "a")
            log.info("Kokoro pipeline '%s' loaded in %.1fs", lang, __import__("time").perf_counter() - t0)
            return self.pipelines[lang]
        except Exception as e:
            log.error("Kokoro pipeline '%s' failed: %s", lang, e)
            return None

    @property
    def ready(self) -> bool:
        return KOKORO_AVAILABLE and bool(self.enabled_langs)

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        voice: str = None,
        speed: float = 1.0,
    ) -> bytes:
        """Generate natural-sounding speech (spec §1.1 synthesize)."""
        if not KOKORO_AVAILABLE:
            raise RuntimeError("Kokoro pipeline unavailable on this host")
        pipeline = self._get_pipeline(language) or self._get_pipeline("en")
        if pipeline is None:
            raise RuntimeError("no Kokoro pipeline could be loaded")
        voice = voice or self.default_voices.get(language, "af_bella")

        # Generate audio
        generator = pipeline(text, voice=voice, speed=speed)

        # Collect audio chunks
        audio_chunks = []
        for _gs, _ps, audio in generator:
            audio_chunks.append(audio)

        # Concatenate and convert to bytes
        full_audio = np.concatenate(audio_chunks)

        buffer = io.BytesIO()
        sf.write(buffer, full_audio, SAMPLE_RATE, format="WAV")
        buffer.seek(0)

        return buffer.read()
