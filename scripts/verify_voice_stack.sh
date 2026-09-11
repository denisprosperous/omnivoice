#!/bin/bash
# OMNIVOICE v4.2 — Tasks 8/9/10 LIVE checks in ONE session (sandbox reaps
# background processes between tool calls, so the pipeline is started,
# exercised, and reported within this single call).
# Usage: bash scripts/verify_voice_stack.sh
set -u
cd /home/z/my-project

echo "== [1] starting pipeline =="
pkill -f pipeline_server.py 2>/dev/null; sleep 1
setsid env HF_HUB_DISABLE_XET=1 OMNIVOICE_STT_LOAD_SMALL=0 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 MALLOC_ARENA_MAX=2 nohup /home/z/.venv/bin/python -u server/services/pipeline_server.py > scripts/pipeline.log 2>&1 < /dev/null &
PY_PID=$!

# poll health up to 90s
ok=""
for i in $(seq 1 30); do
  sleep 3
  h=$(curl -s -m 3 http://127.0.0.1:8100/health 2>/dev/null)
  if echo "$h" | rg -q '"service"'; then ok=1; echo "health OK after ~$((i*3))s"; break; fi
done
[ -z "$ok" ] && { echo "PIPELINE FAILED TO START"; tail -5 scripts/pipeline.log; exit 1; }

curl -s http://127.0.0.1:8100/health | python3 -c "
import json,sys
b=json.load(sys.stdin)['backends']
print('TASK 8 health: TTS kokoro available =', b['tts']['available'])
print('TASK 9 health: STT faster-whisper available =', b['stt']['available'], b['stt']['models'])
print('TASK 10 config: chroma fallback =', b['sts']['cascaded_fallback'])
"

echo "== [2] TASK 8: Kokoro TTS synthesis =="
t0=$(date +%s)
code=$(curl -s -m 300 -X POST http://127.0.0.1:8100/v1/tts -H "Content-Type: application/json" \
  -d '{"text":"Good morning, young learners! Welcome to Omnivoice Academy.","language":"en","character":"kwe"}' \
  -o scripts/kokoro_v42.wav -w "%{http_code}")
t1=$(date +%s)
echo "TTS HTTP $code in $((t1-t0))s"
python3 - << 'PYEOF'
import json, base64
d = json.load(open('scripts/kokoro_v42.wav'))
open('scripts/kokoro_v42.wav','wb').write(base64.b64decode(d['audio_base64']))
print('decoded kokoro wav:', d['engine'], 'voice', d['voice'], 'latency', d['latency_ms'], 'ms')
PYEOF
file -b scripts/kokoro_v42.wav 2>/dev/null | cut -c1-60

echo "== [3] TASK 9: Faster-Whisper STT round-trip =="
python3 - << 'EOF'
import base64, json
wav = base64.b64encode(open('scripts/kokoro_v42.wav','rb').read()).decode()
json.dump({"audio_base64": wav, "language": "en"}, open('/tmp/stt_req.json','w'))
EOF
t0=$(date +%s)
code=$(curl -s -m 120 -X POST http://127.0.0.1:8100/v1/stt -H "Content-Type: application/json" -d @/tmp/stt_req.json -o /tmp/stt_resp.json -w "%{http_code}")
t1=$(date +%s)
echo "STT HTTP $code in $((t1-t0))s"
python3 -c "import json; d=json.load(open('/tmp/stt_resp.json')); print('transcription:', d.get('text',''))" 2>/dev/null

echo "== [4] TASK 10: STS (Chroma attempt → cascaded fallback) =="
python3 - << 'PYEOF'
import base64, json
wav = base64.b64encode(open('scripts/kokoro_v42.wav','rb').read()).decode()
json.dump({"audio_base64": wav, "language": "en", "character": "kwe"}, open('/tmp/sts_req.json','w'))
PYEOF
t0=$(date +%s)
code=$(curl -s -m 240 -X POST http://127.0.0.1:8100/v1/sts -H "Content-Type: application/json" \
  --data-binary @/tmp/sts_req.json \
  -o /tmp/sts_resp.json -w "%{http_code}")
t1=$(date +%s)
echo "STS HTTP $code in $((t1-t0))s"
python3 -c "
import json
d=json.load(open('/tmp/sts_resp.json'))
print('sts engine:', d.get('engine') or d.get('stsEngine'))
print('reply text:', (d.get('reply_text') or d.get('replyText') or d.get('text') or '')[:90])
print('audio bytes:', len(d.get('audio_base64') or d.get('audioBase64') or ''))
" 2>/dev/null || head -c 300 /tmp/sts_resp.json

echo "== [5] pipeline log tail =="
tail -3 scripts/pipeline.log
