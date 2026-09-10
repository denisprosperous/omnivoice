"use client";
// Landing — role gate, name entry, ISCED 0-3 level ladder, language, characters
import React from "react";
import { useApp, type Role } from "@/lib/store";
import { t, type Lang } from "@/lib/i18n";
import { CHARACTERS } from "@/lib/characters";
import { LEVELS } from "@/lib/data/curriculum";
import { PatternBand, Spinner } from "./shared";
import { playBadge } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AVATARS = ["🦁", "🐘", "🦅", "🐆", "🦒", "🦏", "🐒", "🦉", "🐊", "🦋"];

export function Landing() {
  const { setView, setLearner, lang, setLang } = useApp();
  const [role, setRole] = React.useState<Role>("learner");
  const [name, setName] = React.useState("");
  const [stage, setStage] = React.useState("class3");
  const [avatar, setAvatar] = React.useState("🦁");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function start() {
    setBusy(true);
    setError("");
    try {
      const level = LEVELS.find((l) => l.id === stage);
      const res = await fetch("/api/learner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || (lang === "fr" ? "Ami" : "Friend"),
          role,
          avatar,
          stage,
          iscedLevel: level?.isced ?? 1,
          language: lang === "ewo" ? "en" : lang, // UI language; ewo used for phrases
        }),
      });
      if (!res.ok) throw new Error("Could not create profile");
      const data = await res.json();
      playBadge(); // welcome flourish
      setLearner({ ...data.learner, avatar });
      setView(role === "learner" ? "learner" : role === "teacher" ? "teacher" : role === "parent" ? "parent" : "supervisor");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const iscedGroups: Array<{ isced: number; label: string; labelFr: string }> = [
    { isced: 0, label: "Pre-Primary (ISCED 0)", labelFr: "Pré-primaire (CITE 0)" },
    { isced: 1, label: "Primary (ISCED 1)", labelFr: "Primaire (CITE 1)" },
    { isced: 2, label: "Lower Secondary (ISCED 2)", labelFr: "1er cycle Secondaire (CITE 2)" },
    { isced: 3, label: "Upper Secondary (ISCED 3)", labelFr: "2nd cycle Secondaire (CITE 3)" },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      <PatternBand />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="mb-2 text-6xl" aria-hidden>🦉</div>
          <h1 className="text-3xl font-extrabold text-amber-900 sm:text-4xl">{t("appName", lang)}</h1>
          <p className="mt-2 text-base font-medium text-amber-700">{t("tagline", lang)}</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-amber-800/80">
            {lang === "fr"
              ? "Plateforme éducative IA pour le Cameroun — de la maternelle au lycée. Alignée sur le programme de la MINEDUB, IB, Cambridge et le CECRL."
              : "AI-powered learning for Cameroon — Kindergarten to High School. Aligned to the MINEDUB curriculum, IB, Cambridge and CEFR."}
          </p>
        </header>

        {/* Characters */}
        <section aria-label="Meet the characters" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHARACTERS.map((c) => (
            <div key={c.id} className="rounded-2xl border-2 border-amber-200 bg-white p-3 text-center shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="text-4xl" aria-hidden>{c.emoji}</div>
              <div className="mt-1 font-extrabold" style={{ color: c.color }}>{c.name}</div>
              <div className="text-[11px] leading-tight text-amber-800/80">{lang === "fr" ? c.role.fr : c.role.en}</div>
            </div>
          ))}
        </section>

        <div className="rounded-3xl border-2 border-amber-300 bg-white p-5 shadow-lg sm:p-7">
          {/* Role */}
          <h2 className="mb-3 text-lg font-bold text-amber-900">{t("chooseRole", lang)}</h2>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={t("chooseRole", lang)}>
            {([
              { id: "learner", icon: "🎒", label: t("learner", lang) },
              { id: "teacher", icon: "🧑🏾‍🏫", label: t("teacher", lang) },
              { id: "parent", icon: "👨🏾‍👩🏾‍👧🏾", label: t("parent", lang) },
              { id: "supervisor", icon: "🏫", label: t("supervisor", lang) },
            ] as Array<{ id: Role; icon: string; label: string }>).map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                role="radio"
                aria-checked={role === r.id}
                className={cn(
                  "flex min-h-[44px] flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-bold transition-all",
                  role === r.id ? "border-amber-600 bg-amber-50 text-amber-900 shadow" : "border-amber-200 bg-white text-amber-700 hover:border-amber-400"
                )}
              >
                <span className="text-2xl" aria-hidden>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* Name + avatar */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-amber-900">{t("yourName", lang)}</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "fr" ? "ex : Ngo" : "e.g. Ngo"} className="h-11 border-amber-300" maxLength={40} />
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-bold text-amber-900">{lang === "fr" ? "Avatar" : "Avatar"}</span>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    aria-pressed={avatar === a}
                    aria-label={`Avatar ${a}`}
                    className={cn("h-10 w-10 rounded-full border-2 text-xl transition-all", avatar === a ? "border-amber-600 bg-amber-100 scale-110" : "border-amber-200 hover:border-amber-400")}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Level ladder */}
          {role === "learner" && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-bold text-amber-900">{t("chooseLevel", lang)}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {iscedGroups.map((g) => (
                  <div key={g.isced}>
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">{lang === "fr" ? g.labelFr : g.label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {LEVELS.filter((l) => l.isced === g.isced).map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setStage(l.id)}
                          aria-pressed={stage === l.id}
                          title={lang === "fr" ? l.focus : l.focus}
                          className={cn(
                            "min-h-[38px] rounded-lg border-2 px-2.5 text-xs font-bold transition-all",
                            stage === l.id ? "border-amber-600 bg-amber-600 text-white shadow" : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400"
                          )}
                        >
                          {lang === "fr" ? l.nameFr : l.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-bold text-amber-900">{t("chooseLanguage", lang)}</h3>
            <div className="flex gap-2" role="radiogroup" aria-label={t("chooseLanguage", lang)}>
              {([
                { id: "en", label: "English", flag: "🇬🇧" },
                { id: "fr", label: "Français", flag: "🇫🇷" },
                { id: "ewo", label: "Ewondo (National)", flag: "🇨🇲" },
              ] as Array<{ id: Lang; label: string; flag: string }>).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  role="radio"
                  aria-checked={lang === l.id}
                  className={cn(
                    "min-h-[44px] flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all",
                    lang === l.id ? "border-amber-600 bg-amber-50 text-amber-900" : "border-amber-200 text-amber-700 hover:border-amber-400"
                  )}
                >
                  <span className="mr-1" aria-hidden>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}

          <Button onClick={start} disabled={busy} className="h-14 w-full bg-amber-600 text-lg font-extrabold text-white hover:bg-amber-700" size="lg">
            {busy ? <Spinner /> : <span aria-hidden>🚀 {t("start", lang)}</span>}
          </Button>
        </div>

        <footer className="mt-6 text-center text-xs text-amber-700/70">
          {lang === "fr"
            ? "Aligné sur le Curriculum du Cameroun 2018 • Approche par les compétences • Apprendre par projet"
            : "Aligned to the Cameroon 2018 Curriculum • Competence-Based Approach • Project-Based Learning"}
        </footer>
      </div>
    </main>
  );
}
