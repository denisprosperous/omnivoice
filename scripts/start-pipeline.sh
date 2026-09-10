#!/bin/bash
# Start the OmniVoice v4.0 voice pipeline server (Kokoro + Faster-Whisper)
# Constrained CPU preview host: skip the `small` STT model, restrict TTS
# languages to English (French loads lazily on first request).
export HF_HOME=/home/z/.cache/huggingface
export OMNIVOICE_PIPELINE_PORT=8100
export OMNIVOICE_STT_LOAD_SMALL=0
export OMNIVOICE_TTS_LANGS=en
exec /home/z/.venv/bin/python /home/z/my-project/server/services/pipeline_server.py
