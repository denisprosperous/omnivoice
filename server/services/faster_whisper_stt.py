# ============================================================================
# faster_whisper_stt.py — OMNIVOICE v4.0 STT service (spec §1.2)
# Faster-Whisper: CTranslate2 reimplementation of Whisper — up to 4x faster,
# lower memory, 99 languages, 100% local (no data leaves the server).
# Replaces Simba-S per the v4.0 voice stack correction. Silero VAD (spec
# §2.1) filters silence before transcription via vad_filter=True.
# ============================================================================
import logging
import os
import tempfile

log = logging.getLogger("omnivoice.faster_whisper")

FASTER_WHISPER_AVAILABLE = False
try:
    from faster_whisper import WhisperModel  # type: ignore
    FASTER_WHISPER_AVAILABLE = True
except Exception as _e:  # pragma: no cover
    log.warning("faster-whisper not importable (%s) — falling back to platform ASR", _e)

# CPU device for the preview sandbox; auto→cuda when GPU hardware is present.
DEVICE = os.environ.get("OMNIVOICE_STT_DEVICE", "cpu")
COMPUTE_TYPE = os.environ.get("OMNIVOICE_STT_COMPUTE", "int8")


class FasterWhisperSTTService:
    """Speech-to-text with language detection (spec §1.2)."""

    def __init__(self):
        self.models = {}
        if FASTER_WHISPER_AVAILABLE:
            # Load models for different languages (spec: base + small).
            # `small` is the higher-accuracy model used for tonal Grassfields
            # languages (bkm/lns/byv) per the VoiceRegistry §2.2.
            # Constrained hosts may skip `small` (OMNIVOICE_STT_LOAD_SMALL=0) —
            # base still serves all requests with graceful degradation.
            try:
                self.models["base"] = WhisperModel("base", device=DEVICE, compute_type=COMPUTE_TYPE)
            except Exception as e:
                log.error("Faster-Whisper base failed to load: %s", e)
            if os.environ.get("OMNIVOICE_STT_LOAD_SMALL", "1") not in ("0", "false", "no"):
                try:
                    self.models["small"] = WhisperModel("small", device=DEVICE, compute_type=COMPUTE_TYPE)
                except Exception as e:
                    log.warning("Faster-Whisper small unavailable (%s) — base serves all requests", e)

    @property
    def ready(self) -> bool:
        return bool(self.models)

    async def transcribe(
        self,
        audio_bytes: bytes,
        language: str = None,
        model_size: str = "base",
    ) -> dict:
        """Transcribe audio to text with language detection (spec §1.2)."""
        if not FASTER_WHISPER_AVAILABLE or not self.models:
            raise RuntimeError("Faster-Whisper unavailable on this host")

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            audio_path = f.name

        try:
            # Transcribe (Silero VAD filters silence per spec §2.1 pipeline)
            model = self.models.get(model_size, self.models["base"])
            segments, info = model.transcribe(
                audio_path,
                language=language if language not in (None, "", "auto") else None,
                beam_size=5,
                word_timestamps=True,
                vad_filter=True,
            )

            # Collect results
            transcription = " ".join(segment.text for segment in segments)

            return {
                "text": transcription.strip(),
                "language": info.language,
                "language_probability": round(float(info.language_probability), 4),
                "duration": round(float(info.duration), 3),
            }
        finally:
            try:
                os.unlink(audio_path)
            except OSError:
                pass
