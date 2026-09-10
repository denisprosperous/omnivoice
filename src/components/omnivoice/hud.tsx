"use client";
// HUD — top navigation bar with gamification state + language switcher + offline indicator
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { XpBar } from "./shared";
import { setMuted } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV: Array<{ view: Parameters<ReturnType<typeof useApp.getState>["setView"]>[0]; key: string; icon: string }> = [
  { view: "learner", key: "dashboard", icon: "🗺️" },
  { view: "projects", key: "projects", icon: "🛠️" },
  { view: "library", key: "library", icon: "📚" },
  { view: "profile", key: "profile", icon: "🦁" },
];

export function Hud() {
  const { learner, lang, setLang, view, setView, soundOn, toggleSound, online } = useApp();
  if (!learner) return null;
  const isAdult = learner.role !== "learner";
  const nav = isAdult
    ? [
        { view: (learner.role === "teacher" ? "teacher" : learner.role === "parent" ? "parent" : "supervisor") as Parameters<typeof setView>[0], key: learner.role === "teacher" ? "lessonPlans" : learner.role === "parent" ? "progressReport" : "monitor", icon: learner.role === "teacher" ? "📝" : learner.role === "parent" ? "📈" : "🏫" },
        { view: "library" as const, key: "library", icon: "📚" },
      ]
    : NAV;

  return (
    <header className="sticky top-0 z-40 shadow-md" style={{ background: "#7C2D12" }}>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3">
        <button onClick={() => setView(learner.role === "learner" ? "learner" : nav[0].view)} className="flex items-center gap-2" aria-label="OmniVoice Academy home">
          <span className="text-2xl" aria-hidden>🦉</span>
          <span className="hidden text-sm font-extrabold tracking-wide text-amber-50 md:block">{t("appName", lang)}</span>
        </button>

        <nav className="flex flex-1 items-center gap-1" aria-label="Main">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.view)}
              aria-current={view === n.view ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-bold transition-colors sm:text-sm",
                view === n.view ? "bg-amber-500 text-white shadow" : "text-amber-100 hover:bg-white/10"
              )}
            >
              <span aria-hidden>{n.icon}</span>
              <span className="hidden sm:inline">{t(n.key, lang)}</span>
            </button>
          ))}
        </nav>

        {learner.role === "learner" && (
          <div className="hidden w-40 md:block">
            <XpBar xp={learner.xp} level={learner.level || 1} title={learner.title || "Curious Cub"} />
          </div>
        )}

        <div className="flex items-center gap-1" role="group" aria-label="Language">
          {(["en", "fr", "ewo"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={cn(
                "h-8 rounded-full px-2 text-xs font-bold transition-colors",
                lang === l ? "bg-white text-amber-900" : "bg-white/10 text-amber-100 hover:bg-white/20"
              )}
            >
              {l === "en" ? "EN" : l === "fr" ? "FR" : "EW"}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-100 hover:bg-white/10 hover:text-white"
          onClick={() => { toggleSound(); setMuted(soundOn); }}
          aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
        >
          {soundOn ? "🔊" : "🔇"}
        </Button>

        <span
          className={cn("flex h-8 items-center gap-1 rounded-full px-2 text-[10px] font-bold", online ? "bg-lime-600/30 text-lime-100" : "bg-red-600/40 text-red-100")}
          title={online ? "Online" : t("offline", lang)}
        >
          <span aria-hidden>{online ? "🟢" : "📴"}</span>
          <span className="hidden lg:inline">{online ? t("online", lang) : t("offline", lang)}</span>
        </span>
      </div>
    </header>
  );
}
