// ============================================================================
// OMNIVOICE SOUND ENGINE (Master Prompt 3.2) — Web Audio synthesis of
// authentic African musical elements, no external audio files needed (offline-
// capable). Implements the stipulated sound design specifications:
//   - Correct Answer: cheerful balafon riff (2-3 ascending notes)
//   - Incorrect Answer: gentle talking drum pattern (supportive, not punitive)
//   - Level Up: triumphant makossa beat
//   - Project Completion: ensemble (flutes, drums, rattles)
//   - Background music per ILT mood: kalimba/balafon/drums ambient loops
// ============================================================================

let ctx: AudioContext | null = null;
let ambientNodes: { stop: () => void } | null = null;

function ac(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(muted: boolean) {
  mutedFlag = muted;
  if (muted) stopAmbient();
}
let mutedFlag = false;
export function isMuted() { return mutedFlag; }

// ---------- Instrument voices ----------

/** Balafon: bright wooden-bar tone — triangle wave + quick decay + slight detune shimmer */
function balafonNote(freq: number, when: number, dur = 0.35, gain = 0.28) {
  const c = ac();
  const osc = c.createOscillator();
  const osc2 = c.createOscillator();
  const g = c.createGain();
  const bp = c.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = freq * 2; bp.Q.value = 1.2;
  osc.type = "triangle"; osc.frequency.value = freq;
  osc2.type = "sine"; osc2.frequency.value = freq * 2.01; // shimmer overtone
  const g2 = c.createGain(); g2.gain.value = 0.25;
  osc.connect(bp); osc2.connect(g2); g2.connect(bp); bp.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.start(when); osc2.start(when);
  osc.stop(when + dur); osc2.stop(when + dur);
}

/** Djembe / talking drum: pitched membrane — sine drop + filtered noise slap */
function drumNote(freq: number, when: number, dur = 0.22, gain = 0.5, slap = false) {
  const c = ac();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * (slap ? 1.6 : 1.35), when);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, when + dur * 0.8);
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(when); osc.stop(when + dur + 0.05);
  if (slap) {
    const buf = c.createBuffer(1, c.sampleRate * 0.06, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = c.createBufferSource(); src.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    const ng = c.createGain(); ng.gain.setValueAtTime(gain * 0.5, when);
    ng.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
    src.connect(hp); hp.connect(ng); ng.connect(c.destination);
    src.start(when);
  }
}

/** Kalimba: soft metallic pluck */
function kalimbaNote(freq: number, when: number, dur = 0.8, gain = 0.14) {
  const c = ac();
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = "sine"; osc.frequency.value = freq;
  const osc2 = c.createOscillator(); const g2 = c.createGain();
  osc2.type = "sine"; osc2.frequency.value = freq * 3; g2.gain.value = 0.12;
  osc.connect(g); g.connect(c.destination);
  osc2.connect(g2); g2.connect(g);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0005, when + dur);
  osc.start(when); osc2.start(when);
  osc.stop(when + dur); osc2.stop(when + dur);
}

/** Flute: breathy tone for celebration ensemble */
function fluteNote(freq: number, when: number, dur = 0.5, gain = 0.1) {
  const c = ac();
  const osc = c.createOscillator(); const g = c.createGain();
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
  osc.type = "sawtooth"; osc.frequency.value = freq;
  osc.connect(lp); lp.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.08);
  g.gain.setValueAtTime(gain, when + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.start(when); osc.stop(when + dur);
}

// ---------- Feedback Sounds (3.2.2) ----------

/** Correct: cheerful balafon riff — 3 ascending notes */
export function playCorrect() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  const scale = [523.25, 659.25, 783.99]; // C5 E5 G5
  scale.forEach((f, i) => balafonNote(f, t0 + i * 0.09, 0.3, 0.24));
}

/** Incorrect: gentle talking drum pattern — supportive, not punitive */
export function playIncorrect() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  drumNote(160, t0, 0.18, 0.3);
  drumNote(140, t0 + 0.18, 0.2, 0.26);
  drumNote(120, t0 + 0.4, 0.28, 0.22); // descending = "try again softly"
}

/** Level Up: triumphant makossa beat (≈3.5s) */
export function playLevelUp() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  // makossa bassline groove
  const bass = [98, 98, 130.8, 98, 116.5, 98, 130.8, 146.8];
  bass.forEach((f, i) => {
    drumNote(f / 2, t0 + i * 0.22, 0.2, 0.5);
    if (i % 2 === 0) drumNote(200, t0 + i * 0.22 + 0.11, 0.1, 0.2, true); // snare slap
  });
  // balafon melody on top
  const melody = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5];
  melody.forEach((f, i) => balafonNote(f, t0 + 0.44 + i * 0.16, 0.3, 0.2));
}

/** Celebration: ensemble — flutes, drums, rattles + kalimba (project completion) */
export function playCelebration() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  const notes = [392, 440, 523.25, 587.33, 659.25];
  notes.forEach((f, i) => {
    fluteNote(f, t0 + i * 0.12, 0.5, 0.09);
    balafonNote(f * 2, t0 + i * 0.12 + 0.06, 0.3, 0.18);
    kalimbaNote(f * 2, t0 + i * 0.12 + 0.12, 0.7, 0.1);
  });
  // rattles + groove
  for (let i = 0; i < 16; i++) {
    drumNote(i % 4 === 0 ? 110 : 90, t0 + i * 0.15, 0.12, i % 4 === 0 ? 0.4 : 0.25, i % 2 === 1);
  }
}

/** Simple XP ding */
export function playXp() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  balafonNote(880, t0, 0.2, 0.2);
  balafonNote(1174.7, t0 + 0.08, 0.25, 0.18);
}

/** Badge unlock: balafon flourish */
export function playBadge() {
  if (mutedFlag) return;
  const t0 = ac().currentTime;
  [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => balafonNote(f, t0 + i * 0.1, 0.4, 0.22));
}

// ---------- Per-ILT Ambient Background Music (3.2.2 table) ----------

const MOOD_SCALES: Record<string, { root: number; notes: number[]; drumPattern: number[]; tempo: number }> = {
  home:          { root: 261.63, notes: [1, 1.5, 1.8, 2.4, 3],  drumPattern: [1, 0, 0, 0], tempo: 1.1 }, // soft kalimba, warm
  village:       { root: 293.66, notes: [1, 1.335, 1.5, 2, 2.67], drumPattern: [1, 0, 1, 0], tempo: 0.9 }, // balafon, busy
  school:        { root: 349.23, notes: [1, 1.25, 1.5, 2],      drumPattern: [1, 0, 0.5, 0], tempo: 1.0 }, // light percussion
  work:          { root: 220,    notes: [1, 1.2, 1.5, 1.8, 2.4], drumPattern: [1, 0.5, 1, 0.5], tempo: 0.8 }, // rhythmic work songs
  travel:        { root: 246.94, notes: [1, 1.335, 1.78, 2, 2.67], drumPattern: [1, 0, 1, 0.5], tempo: 0.85 }, // moving rhythms
  health:        { root: 329.63, notes: [1, 1.5, 2, 2.4],       drumPattern: [0.6, 0, 0.6, 0], tempo: 1.3 }, // calm, gentle
  games:         { root: 261.63, notes: [1, 1.25, 1.5, 2, 2.5], drumPattern: [1, 0.5, 1, 1], tempo: 0.7 },  // upbeat bikutsi
  communication: { root: 311.13, notes: [1, 1.335, 1.5, 2],     drumPattern: [1, 0, 0.5, 0.5], tempo: 0.95 },
};

/** Start a gentle ambient loop matching the ILT mood. Returns stopper. */
export function startAmbient(mood: string) {
  if (mutedFlag) return () => {};
  stopAmbient();
  const cfg = MOOD_SCALES[mood] || MOOD_SCALES.home;
  let alive = true;
  const beat = (cfg.tempo * 0.6);
  let step = 0;

  const loop = () => {
    if (!alive) return;
    const t0 = ac().currentTime + 0.05;
    const idx = step % cfg.notes.length;
    const freq = cfg.root * cfg.notes[idx];
    if (mood === "health" || mood === "home") kalimbaNote(freq, t0, 1.4, 0.05);
    else balafonNote(freq, t0, 0.5, 0.06);
    const dp = cfg.drumPattern[step % cfg.drumPattern.length];
    if (dp > 0) drumNote(75, t0, 0.16, 0.1 * dp, dp > 0.8);
    step++;
    timer = window.setTimeout(loop, beat * 1000);
  };
  let timer = window.setTimeout(loop, 100);

  ambientNodes = {
    stop: () => {
      alive = false;
      window.clearTimeout(timer);
    },
  };
}

export function stopAmbient() {
  if (ambientNodes) {
    ambientNodes.stop();
    ambientNodes = null;
  }
}
