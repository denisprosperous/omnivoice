// ============================================================================
// VOICE CLIENT — recording (WAV encoder), TTS playback with persona pitch,
// Web Speech API fallback (offline capability, Master Prompt 3.4).
// ============================================================================
"use client";

export interface PersonaVoice {
  audioBase64?: string;
  pitchRate?: number;
  character?: string;
}

/** Record microphone audio → WAV base64 (16kHz mono for reliable ASR) */
export class WavRecorder {
  private stream: MediaStream | null = null;
  private ac: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private chunks: Float32Array[] = [];
  private sampleRate = 16000;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ac = new AC();
    this.source = this.ac.createMediaStreamSource(this.stream);
    this.processor = this.ac.createScriptProcessor(4096, 1, 1);
    this.chunks = [];
    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      // downsample to target rate via simple decimation
      const ratio = Math.max(1, Math.round(this.ac!.sampleRate / this.sampleRate));
      const out = new Float32Array(Math.ceil(input.length / ratio));
      for (let i = 0; i < out.length; i++) out[i] = input[i * ratio];
      this.chunks.push(out);
    };
    this.source.connect(this.processor);
    this.processor.connect(this.ac.destination);
  }

  stop(): { wavBase64: string; durationSec: number } {
    if (this.processor) this.processor.disconnect();
    if (this.source) this.source.disconnect();
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    const total = this.chunks.reduce((s, c) => s + c.length, 0);
    const duration = total / this.sampleRate;
    const merged = new Float32Array(total);
    let offset = 0;
    for (const c of this.chunks) { merged.set(c, offset); offset += c.length; }
    if (this.ac) void this.ac.close();
    this.ac = null; this.stream = null; this.processor = null; this.source = null;
    const wavBase64 = encodeWav(merged, this.sampleRate);
    return { wavBase64, durationSec: duration };
  }
}

/** Float32 PCM → 16-bit WAV → base64 */
export function encodeWav(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Play base64 WAV with an optional persona pitch rate (Web Audio). Returns stop fn. */
export function playWavBase64(b64: string, pitchRate = 1, onEnded?: () => void): () => void {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC();
  void ac.decodeAudioData(bytes.buffer.slice(0)).then((buf) => {
    const src = ac.createAudioBufferSourceNode ? ac.createAudioBufferSourceNode() : ac.createBufferSource();
    // createBufferSource is standard
    const source: AudioBufferSourceNode = ac.createBufferSource();
    source.buffer = buf;
    source.playbackRate.value = pitchRate;
    source.connect(ac.destination);
    source.onended = () => { void ac.close(); onEnded?.(); };
    source.start();
  }).catch(() => { void ac.close(); onEnded?.(); });
  return () => { void ac.close(); onEnded?.(); };
}

/** Web Speech API TTS — offline-capable fallback with per-character pitch */
export function speakFallback(text: string, lang = "en-US", pitch = 1, rate = 1, onEnded?: () => void) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) { onEnded?.(); return () => {}; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang.startsWith("fr") ? "fr-FR" : "en-US";
    u.pitch = pitch; u.rate = rate;
    u.onend = () => onEnded?.();
    synth.speak(u);
    return () => synth.cancel();
  } catch {
    onEnded?.();
    return () => {};
  }
}

/** Fetch TTS audio from server; fall back to Web Speech when unavailable (offline).
 * lang routes Grassfields languages through the tone-aware synthesis path (§6.5). */
export async function speak(text: string, character: string, lang = "en"): Promise<{ played: "server" | "fallback" | "none" }> {
  const personaPitch: Record<string, number> = { kwe: 0.8, mbi: 1.3, ngo: 1.05, kong: 0.9 };
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, character, lang }),
    });
    if (!res.ok) throw new Error("tts unavailable");
    const data = await res.json();
    if (!data.audioBase64) throw new Error("no audio");
    playWavBase64(data.audioBase64, data.pitchRate || personaPitch[character] || 1);
    return { played: "server" };
  } catch {
    const pitchMap: Record<string, number> = { kwe: 0.6, mbi: 1.5, ngo: 1.2, kong: 0.9 };
    // Web Speech fallback has no Grassfields voices — speak the text as-is
    speakFallback(text, lang.startsWith("fr") ? "fr-FR" : "en-US", pitchMap[character] || 1, 0.95);
    return { played: "fallback" };
  }
}

/** Transcribe recorded audio → text via /api/stt, with live Web Speech as offline fallback */
export async function transcribe(wavBase64: string): Promise<string> {
  try {
    const res = await fetch("/api/stt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64: wavBase64 }),
    });
    if (!res.ok) throw new Error("stt unavailable");
    const data = await res.json();
    return data.text || "";
  } catch {
    return "";
  }
}
