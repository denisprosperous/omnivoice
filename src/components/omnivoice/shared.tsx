"use client";
// Shared UI atoms — African-inspired visual system (Ndebele/Bamileke/Bassa inspired)
import React from "react";
import { getCharacter } from "@/lib/characters";
import { speak } from "@/lib/voice-client";
import { cn } from "@/lib/utils";

/** Geometric African-pattern header band (Bamileke-inspired diamonds) */
export function PatternBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-2.5 w-full", className)}
      style={{
        background:
          "repeating-linear-gradient(45deg, #D97706 0 12px, #B45309 12px 24px, #9D174D 24px 36px, #065F46 36px 48px)",
      }}
    />
  );
}

export function CharacterBubble({
  characterId,
  text,
  textFr,
  lang,
  speakLang,
  onSpeakDone,
  autoSpeak = true,
  compact = false,
}: {
  characterId: string;
  text: string;
  textFr?: string;
  lang: string;
  speakLang?: string; // voice language for TTS (en/fr/bkm/lns/... — §7.3 multilingual hook)
  onSpeakDone?: () => void;
  autoSpeak?: boolean;
  compact?: boolean;
}) {
  const char = getCharacter(characterId);
  const shown = lang === "fr" && textFr ? textFr : text;
  const spoken = React.useRef<string>("");
  React.useEffect(() => {
    if (!autoSpeak) return;
    if (spoken.current === shown) return;
    spoken.current = shown;
    void speak(shown, char.id, speakLang || lang).then((r) => {
      // duration estimate — resolve after speaking
      const ms = Math.min(20000, Math.max(2200, shown.length * 75));
      setTimeout(() => onSpeakDone?.(), r.played === "server" ? ms : ms);
    });
  }, [shown, autoSpeak, speakLang]);

  return (
    <div className={cn("flex items-start gap-3", compact && "gap-2")}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2 shadow-md",
          compact ? "h-10 w-10 text-xl" : "h-14 w-14 text-3xl"
        )}
        style={{ borderColor: char.color, background: "#FFF7ED" }}
        role="img"
        aria-label={`${char.name} — ${lang === "fr" ? char.role.fr : char.role.en}`}
      >
        {char.emoji}
      </div>
      <div
        className="relative flex-1 rounded-2xl rounded-tl-sm border-2 bg-white p-3 text-sm shadow-sm sm:text-base"
        style={{ borderColor: char.color + "55" }}
      >
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide" style={{ color: char.color }}>
          {char.name}
        </span>
        <span>{shown}</span>
      </div>
    </div>
  );
}

export function XpBar({ xp, level, title }: { xp: number; level: number; title: string }) {
  const into = xp % 250;
  const pct = Math.round((into / 250) * 100);
  return (
    <div className="min-w-[140px] flex-1">
      <div className="mb-0.5 flex items-center justify-between text-[10px] font-bold text-amber-100">
        <span>
          Lv {level} · {title}
        </span>
        <span>{into}/250 XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-lime-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MicButton({
  recording,
  disabled,
  onDown,
  onUp,
  label,
}: {
  recording: boolean;
  disabled?: boolean;
  onDown: () => void;
  onUp: () => void;
  label: string;
}) {
  // v4.2 fix — keyboard-operable: Enter/Space press-and-hold mirrors the mouse
  // and touch behaviour, so the mic is reachable without a pointer.
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={recording}
      disabled={disabled}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={() => { if (recording) onUp(); }}
      onTouchStart={(e) => { e.preventDefault(); onDown(); }}
      onTouchEnd={(e) => { e.preventDefault(); onUp(); }}
      onKeyDown={(e) => {
        if (disabled) return;
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
          e.preventDefault();
          onDown();
        }
      }}
      onKeyUp={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUp();
        }
      }}
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full border-4 text-3xl shadow-lg transition-all active:scale-95 disabled:opacity-40",
        recording ? "animate-pulse border-red-300 bg-red-500 text-white" : "border-amber-300 bg-amber-500 text-white hover:bg-amber-600"
      )}
    >
      {recording ? "⏹" : "🎤"}
    </button>
  );
}

export function StatPill({ icon, label, value, color = "#B45309" }: { icon: string; label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold" style={{ borderColor: color + "66", background: color + "14", color }}>
      <span aria-hidden>{icon}</span>
      <span>{value}</span>
      <span className="hidden text-xs font-normal opacity-75 sm:inline">{label}</span>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-6 text-amber-700" role="status">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
