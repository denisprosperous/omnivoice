# ============================================================================
# voice_registry.py — OMNIVOICE v4.0 Voice Service Registry (spec §2.2)
# Central registry for all voice services. Language-specific configurations
# select the Kokoro-82M TTS backend, the Faster-Whisper STT backend and the
# Chroma-1.0 STS backend for every stipulated language (en/fr/bkm/lns/byv).
# Unknown languages fall back to the English config (spec get_config()).
# ============================================================================
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class TTSBackend(Enum):
    KOKORO = "kokoro"
    QWEN3_TTS = "qwen3-tts"
    CHATTTS = "chattts"
    POCKET_TTS = "pocket-tts"


class STTBackend(Enum):
    FASTER_WHISPER = "faster-whisper"
    WHISPER_TRANSFORMERS = "whisper-transformers"
    PARAKEET = "parakeet"


class STSBackend(Enum):
    CHROMA = "chroma"
    MOSS_SPEECH = "moss-speech"
    CASCADED = "cascaded"


@dataclass
class VoiceConfig:
    tts_backend: TTSBackend
    stt_backend: STTBackend
    sts_backend: STSBackend
    tts_voice: str
    tts_speed: float
    stt_model: str
    stt_language: Optional[str]


class VoiceRegistry:
    """Central registry for all voice services."""

    # Language-specific configurations
    LANGUAGE_CONFIGS = {
        "en": VoiceConfig(
            tts_backend=TTSBackend.KOKORO,
            stt_backend=STTBackend.FASTER_WHISPER,
            sts_backend=STSBackend.CHROMA,
            tts_voice="af_bella",
            tts_speed=1.0,
            stt_model="base",
            stt_language="en",
        ),
        "fr": VoiceConfig(
            tts_backend=TTSBackend.KOKORO,
            stt_backend=STTBackend.FASTER_WHISPER,
            sts_backend=STSBackend.CHROMA,
            tts_voice="ff_siwis",
            tts_speed=0.95,
            stt_model="base",
            stt_language="fr",
        ),
        "bkm": VoiceConfig(  # Kom
            tts_backend=TTSBackend.KOKORO,  # With voice cloning
            stt_backend=STTBackend.FASTER_WHISPER,
            sts_backend=STSBackend.CHROMA,
            tts_voice="kom_native",  # Custom cloned voice
            tts_speed=0.9,  # Slightly slower for tonal accuracy
            stt_model="small",  # Higher accuracy for tonal
            stt_language="bkm",
        ),
        "lns": VoiceConfig(  # Lamnso'
            tts_backend=TTSBackend.KOKORO,
            stt_backend=STTBackend.FASTER_WHISPER,
            sts_backend=STSBackend.CHROMA,
            tts_voice="lamnso_native",
            tts_speed=0.9,
            stt_model="small",
            stt_language="lns",
        ),
        "byv": VoiceConfig(  # Bayangi
            tts_backend=TTSBackend.KOKORO,
            stt_backend=STTBackend.FASTER_WHISPER,
            sts_backend=STSBackend.CHROMA,
            tts_voice="bayangi_native",  # Pending data collection
            tts_speed=0.9,
            stt_model="small",
            stt_language="byv",
        ),
    }

    def get_config(self, language: str) -> VoiceConfig:
        """Get voice configuration for a language."""
        return self.LANGUAGE_CONFIGS.get(language, self.LANGUAGE_CONFIGS["en"])


# ---------------------------------------------------------------------------
# Character voice profiles (Roadmap Phase 3 — "Create character voice
# profiles — Kokoro — 4 character voices"). Kokoro-82M voice IDs mapped to
# the OmniVoice personas (spec §1.1 voice table + §2.3 character prompts):
#   Kwe  — wise owl guide (teacher/guide voice family)
#   Mbi  — playful monkey (child-friendly American female family)
#   Ngo  — brave Grassfields girl (clear American female)
#   Kong — resourceful coastal boy (friendly American male)
# ---------------------------------------------------------------------------
CHARACTER_VOICES = {
    "kwe": {"voice": "am_michael", "speed": 0.9, "note": "Wise owl guide — warm, patient elder"},
    "mbi": {"voice": "af_bella", "speed": 1.05, "note": "Curious monkey — playful, child-like energy"},
    "ngo": {"voice": "af_nicole", "speed": 1.0, "note": "Brave girl — confident, clear"},
    "kong": {"voice": "am_liam", "speed": 0.95, "note": "Resourceful boy — adventurous, friendly"},
}


def get_character_prompt(character: str) -> str:
    """Get system prompt for a character (spec §2.3 _get_character_prompt)."""
    prompts = {
        "kwe": "You are Kwe, a wise owl guide for Cameroonian children. Speak warmly and encouragingly.",
        "mbi": "You are Mbi, a curious monkey. Speak playfully and energetically.",
        "ngo": "You are Ngo, a brave girl from the Grassfields. Speak confidently and clearly.",
        "kong": "You are Kong, a resourceful boy from the coast. Speak adventurously and friendly.",
    }
    return prompts.get(character, prompts["kwe"])
