"use client";
// ============================================================================
// VoiceSelect — the platform VOICE PICKER (user directive: "expose the option
// to select a voice in the platform from a list of available voices/speakers").
// Groups Recorded native voices / Story characters / Synthetic TTS, with honest
// Directive-9 status: Grassfields languages play REAL recordings only; the
// pending community slots point tutors/parents to the Content Ingestion portal.
// ============================================================================
import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORM_VOICES, type PlatformVoice } from "@/lib/data/voices";
import { cn } from "@/lib/utils";

export function kindBadge(v: PlatformVoice): { label: string; cls: string } | null {
  if (v.kind === "recorded") return v.available
    ? { label: "Native recording", cls: "bg-lime-600 text-white" }
    : { label: "Awaiting upload", cls: "bg-stone-200 text-stone-600" };
  if (v.kind === "persona") return { label: "Character", cls: "bg-purple-100 text-purple-800" };
  return { label: "Synthetic TTS", cls: "bg-sky-100 text-sky-800" };
}

export function VoiceSelect({
  value,
  onChange,
  lang = "en",
  id,
  className,
  compact = false,
  langs,
}: {
  value: string;
  onChange: (voiceId: string) => void;
  lang?: string;
  id?: string;
  className?: string;
  compact?: boolean;
  /** only list voices that can speak these language codes (e.g. ["bkm"]) */
  langs?: string[];
}) {
  const fr = lang === "fr";
  const pool = langs ? PLATFORM_VOICES.filter((v) => langs.some((l) => v.langs.includes(l))) : PLATFORM_VOICES;
  const recorded = pool.filter((v) => v.kind === "recorded");
  const personas = pool.filter((v) => v.kind === "persona");
  const tts = pool.filter((v) => v.kind === "tts");

  const renderItem = (v: PlatformVoice) => {
    const chip = kindBadge(v);
    return (
      <SelectItem key={v.id} value={v.id} disabled={!v.available} className="py-2">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden>{v.kind === "recorded" ? "🎙️" : v.kind === "persona" ? "🦉" : "🔊"}</span>
          <span className="truncate font-semibold">{fr ? v.nameFr : v.name}</span>
          <span className="ml-auto shrink-0 text-[10px] font-bold text-stone-500">{v.langLabel}</span>
          {chip && (
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase", chip.cls)}>
              {chip.label}
            </span>
          )}
        </span>
      </SelectItem>
    );
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className={cn(
          "w-full rounded-xl border-2 border-amber-300 bg-white font-bold text-amber-950 hover:border-amber-500",
          compact ? "h-9 min-h-[36px] text-xs" : "h-12 min-h-[44px] text-sm",
          className
        )}
        aria-label={fr ? "Choisis une voix" : "Choose a voice"}
      >
        <SelectValue placeholder={fr ? "Choisis une voix…" : "Choose a voice…"} />
      </SelectTrigger>
      <SelectContent className="max-h-80 w-[min(24rem,85vw)] border-2 border-amber-300 bg-white">
        <SelectGroup>
          <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-lime-700">
            🎙️ {fr ? "Voix natives enregistrées (Directive 9)" : "Recorded native voices (Directive 9)"}
          </SelectLabel>
          {recorded.map(renderItem)}
        </SelectGroup>
        {personas.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-purple-700">
              🦉 {fr ? "Personnages des histoires (EN)" : "Story characters (EN)"}
            </SelectLabel>
            {personas.map(renderItem)}
          </SelectGroup>
        )}
        {tts.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-sky-700">
              🔊 {fr ? "Voix synthétiques (interface)" : "Synthetic voices (interface)"}
            </SelectLabel>
            {tts.map(renderItem)}
          </SelectGroup>
        )}
        <p className="border-t border-amber-100 px-3 py-2 text-[10px] leading-snug text-stone-500">
          {fr
            ? "Les langues du Grassfields (dont le kom) ne sont JAMAIS synthétisées : seuls de vrais enregistrements y sont lus. Ajoutez une voix via le portail d'ingestion."
            : "Grassfields languages (incl. Kom) are NEVER synthesized — only real recordings play for them. Add a speaker via the Content Ingestion portal."}
        </p>
      </SelectContent>
    </Select>
  );
}

/** Small 🔊 preview button. Recorded voices play a REAL audio clip; synthetic
 * voices synthesize the sample line through the TTS route. */
export function VoicePreviewButton({ voice, lang = "en" }: { voice: PlatformVoice; lang?: string }) {
  const [busy, setBusy] = React.useState(false);
  const stopRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => stopRef.current?.(), []);
  const fr = lang === "fr";
  if (!voice.available || !voice.sampleText) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        setBusy(true);
        try {
          if (voice.engine === "native-recording" && voice.sampleAudioPath) {
            // REAL recording — play the ingested clip, never synthesize (Directive 9)
            const audio = new Audio(voice.sampleAudioPath);
            stopRef.current = () => audio.pause();
            audio.onended = () => setBusy(false);
            await audio.play();
            return;
          }
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: voice.sampleText,
              lang: voice.sampleLang,
              voice: voice.kokoroVoice,
              speed: voice.speed ?? 1,
              character: voice.kind === "persona" ? voice.id.replace("voice_", "") : undefined,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audioBase64) {
              const { playWavBase64 } = await import("@/lib/voice-client");
              stopRef.current = playWavBase64(data.audioBase64, data.pitchRate || 1, () => setBusy(false));
              return;
            }
          }
        } catch { /* preview optional */ } finally {
          setTimeout(() => setBusy(false), 800);
        }
      }}
      disabled={busy}
      className="min-h-[36px] shrink-0 rounded-lg border-2 border-amber-300 bg-amber-50 px-2.5 text-xs font-extrabold text-amber-800 hover:border-amber-500 disabled:opacity-50"
      aria-label={fr ? `Écouter ${voice.nameFr}` : `Preview ${voice.name}`}
    >
      {busy ? "◼" : "🔊 " + (fr ? "Essayer" : "Preview")}
    </button>
  );
}
