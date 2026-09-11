/**
 * OMNIVOICE v4.2 — voice pipeline mini-service supervisor.
 *
 * Spawns the Python pipeline (Kokoro-82M TTS + Faster-Whisper STT +
 * Chroma-1.0 STS client with cascaded fallback) on port 8100 and respawns
 * it if it ever exits (OOM / crash), so the unified voice service stays
 * available to the Next.js bridge for the whole session.
 *
 * Port: 8100 (Next.js reaches it via XTransformPort=8100).
 */
import { spawn, type ChildProcess } from "node:child_process";
import { openSync } from "node:fs";

const PY = "/home/z/.venv/bin/python";
const SCRIPT = "/home/z/my-project/server/services/pipeline_server.py";
const LOG = "/home/z/my-project/scripts/pipeline.log";

let child: ChildProcess | null = null;
let restarting = false;

function start() {
  const out = openSync(LOG, "a");
  child = spawn(PY, ["-u", SCRIPT], {
    env: {
      ...process.env,
      HF_HOME: "/home/z/.cache/huggingface",
      HF_HUB_DISABLE_XET: "1",
      OMNIVOICE_PIPELINE_PORT: "8100",
      OMNIVOICE_STT_LOAD_SMALL: "0",
      OMNIVOICE_TTS_LANGS: "en",
      // constrained-host memory mitigations (4GB sandbox shared with Next.js)
      OMP_NUM_THREADS: "1",
      MKL_NUM_THREADS: "1",
      MALLOC_ARENA_MAX: "2",
    },
    stdio: ["ignore", out, out],
  });
  console.log(`[voice-pipeline] started pid=${child.pid}`);
  child.on("exit", (code, sig) => {
    console.log(`[voice-pipeline] exited code=${code} sig=${sig}`);
    child = null;
    if (!restarting) {
      restarting = true;
      setTimeout(() => {
        restarting = false;
        console.log("[voice-pipeline] respawning…");
        start();
      }, 3000);
    }
  });
}

start();
// keep the event loop alive
setInterval(() => {}, 1 << 30);
