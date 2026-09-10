#!/usr/bin/env python3
"""Test Kokoro-82M synthesis on CPU (v4.0 §1.1 acceptance)."""
import time, sys
sys.path.insert(0, "/home/z/my-project/server/services")
t0 = time.perf_counter()
from kokoro import KPipeline
import soundfile as sf
import numpy as np
print(f"import: {time.perf_counter()-t0:.1f}s")

t0 = time.perf_counter()
pipeline = KPipeline(lang_code="a")  # American English
print(f"pipeline init: {time.perf_counter()-t0:.1f}s")

t0 = time.perf_counter()
gen = pipeline("Good morning, young one! Can you help me greet my friends?", voice="af_bella", speed=1.0)
chunks = []
for gs, ps, audio in gen:
    chunks.append(audio)
full = np.concatenate(chunks)
sf.write("/home/z/my-project/scripts/kokoro_test.wav", full, 24000, format="WAV")
print(f"synthesis: {time.perf_counter()-t0:.2f}s, samples={len(full)}, dur={len(full)/24000:.2f}s")

# French pipeline
t0 = time.perf_counter()
pf = KPipeline(lang_code="f")
gen = pf("Bonjour, jeune ami ! Peux-tu m'aider à saluer mes amis ?", voice="ff_siwis", speed=0.95)
chunks = [a for _, _, a in gen]
full = np.concatenate(chunks)
sf.write("/home/z/my-project/scripts/kokoro_test_fr.wav", full, 24000, format="WAV")
print(f"fr synthesis: {time.perf_counter()-t0:.2f}s, dur={len(full)/24000:.2f}s")
print("KOKORO_SYNTH_OK")
