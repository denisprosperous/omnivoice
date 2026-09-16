"use client";
// Profile — Learner Profile (avatar, skill tree, progress tracking, badges)
// Content Library — texts, visuals, audio, assessments (Master 5.3)
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner, XpBar } from "./shared";
import { AVATARS_LIST } from "./avatars";
import { NationalLanguageSelect } from "./national-language-select";
import { VoiceSelect, VoicePreviewButton, kindBadge } from "./voice-select";
import { PLATFORM_VOICES } from "@/lib/data/voices";
import { playBadge } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BadgeDef { code: string; nameEn: string; nameFr: string; descEn: string; icon: string; category: string; rarity: string }
interface Skill { skillCode: string; mastery: number }
interface AssessmentRow { id: string; lessonId: string; type: string; score: number; createdAt: string }

export function ProfileView() {
  const { learner, lang, setLang, voiceLang, setVoiceLang, setLearner, voiceId, setVoiceId } = useApp();
  const [badges, setBadges] = React.useState<BadgeDef[]>([]);
  const [earned, setEarned] = React.useState<string[]>([]);
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [assessments, setAssessments] = React.useState<AssessmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!learner) return;
    (async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch(`/api/learner?id=${learner.id}`),
          fetch("/api/curriculum"),
        ]);
        const pData = await pRes.json();
        const bData = await bRes.json();
        setBadges(bData.badges || []);
        setEarned((pData.badges || []).map((b: { badgeCode: string }) => b.badgeCode));
        setSkills(pData.skills || []);
        setAssessments(pData.assessments || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [learner]);

  async function changeAvatar(a: string) {
    if (!learner) return;
    setSaving(true);
    try {
      const res = await fetch("/api/learner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: learner.id, avatar: a }),
      });
      const data = await res.json();
      setLearner(data.learner);
      playBadge();
    } finally {
      setSaving(false);
    }
  }

  if (!learner) return null;
  const fr = lang === "fr";
  const avg = assessments.length ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / assessments.length) : null;

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        {/* Identity card */}
        <section className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50 text-5xl shadow-inner" aria-hidden>
            {learner.avatar}
          </div>
          <div className="min-w-[200px] flex-1">
            <h1 className="text-2xl font-extrabold text-amber-900">{learner.name}</h1>
            <p className="text-sm font-semibold text-amber-700">
              {lang === "fr" ? "Niveau" : "Level"} {learner.level} · {learner.title} · 🔥 {learner.streak} {t("streak", lang)}
            </p>
            <div className="mt-2 max-w-sm">
              <XpBar xp={learner.xp} level={learner.level || 1} title={learner.title || "Curious Cub"} />
            </div>
            {avg !== null && (
              <p className="mt-2 text-xs font-bold text-lime-700">
                📊 {t("avgScore", lang)}: {avg}% · {assessments.length} {t("assessments", lang).toLowerCase()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose avatar">
            {AVATARS_LIST.map((a) => (
              <button
                key={a}
                onClick={() => changeAvatar(a)}
                disabled={saving}
                aria-pressed={learner.avatar === a}
                aria-label={`Avatar ${a}`}
                className={cn(
                  "h-9 w-9 rounded-full border-2 text-lg transition-all disabled:opacity-50",
                  learner.avatar === a ? "border-amber-600 bg-amber-100 scale-110" : "border-amber-200 hover:border-amber-400"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        {/* Language settings — interface language + national-language dropdown */}
        <section className="rounded-2xl border-2 border-lime-300 bg-white p-5 shadow-sm" aria-label="Language settings">
          <h2 className="mb-1 text-lg font-extrabold text-lime-900">🌍 {fr ? "Langues" : "Languages"}</h2>
          <p className="mb-3 text-xs text-amber-700">
            {fr
              ? "Langue d'interface (EN/FR) et langue nationale d'apprentissage — le contenu n'affiche que des formes attestées ou validées par des locuteurs natifs."
              : "Interface language (EN/FR) and national learning language — content lists only attested or native-speaker-validated forms."}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">{fr ? "Langue d'interface" : "Interface language"}</h3>
              <div className="flex gap-2" role="group" aria-label={fr ? "Langue d'interface" : "Interface language"}>
                {(["en", "fr"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={cn(
                      "min-h-[44px] flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all",
                      lang === l ? "border-amber-600 bg-amber-50 text-amber-900" : "border-amber-200 text-amber-700 hover:border-amber-400"
                    )}
                  >
                    {l === "en" ? "🇬🇧 English" : "🇫🇷 Français"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-lime-700">🇨🇲 {fr ? "Langue nationale (leçons et voix)" : "National language (lessons & voice)"}</h3>
              <NationalLanguageSelect value={voiceLang} onChange={(code) => setVoiceLang(code)} lang={lang} />
            </div>
          </div>
        </section>

        {/* Voice settings — the platform voice picker (recorded native speakers + TTS) */}
        <section className="rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm" aria-label="Voice settings">
          <h2 className="mb-1 text-lg font-extrabold text-amber-900">🎙️ {fr ? "Voix" : "Voice"}</h2>
          <p className="mb-3 text-xs text-amber-700">
            {fr
              ? "Choisis la voix de la plateforme : vrais enregistrements natifs pour les langues nationales (jamais synthétisés — Directive 9), voix synthétiques pour l'interface EN/FR."
              : "Pick the platform voice: real native recordings for national languages (never synthesized — Directive 9), synthetic voices for the EN/FR interface."}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">{fr ? "Voix sélectionnée" : "Selected voice"}</h3>
              <VoiceSelect value={voiceId} onChange={setVoiceId} lang={lang} />
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">{fr ? "Voix disponibles" : "Available voices"}</h3>
              <ul className="space-y-1.5">
                {PLATFORM_VOICES.map((v) => {
                  const chip = kindBadge(v);
                  const selected = v.id === voiceId;
                  return (
                    <li key={v.id} className={cn("flex items-center gap-2 rounded-xl border p-2", selected ? "border-amber-500 bg-amber-50" : "border-amber-100 bg-white")}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-amber-950">{fr ? v.nameFr : v.name}</p>
                        <p className="text-[10px] font-bold text-stone-500">{v.langLabel} · {fr ? v.noteFr : v.note}</p>
                      </div>
                      {chip && (
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase", chip.cls)}>{chip.label}</span>
                      )}
                      {v.id === voiceId ? (
                        <VoicePreviewButton voice={v} lang={lang} />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* Skill tree */}
        <section className="rounded-2xl border-2 border-lime-300 bg-white p-5 shadow-sm" aria-label={t("skillTree", lang)}>
          <h2 className="mb-3 text-lg font-extrabold text-lime-900">🌳 {t("skillTree", lang)}</h2>
          {loading ? <Spinner /> : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => (
                <div key={s.skillCode} className="rounded-xl border border-lime-200 bg-lime-50/50 p-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-lime-900">
                    <span className="truncate">{s.skillCode}</span>
                    <span>{Math.round(s.mastery)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-lime-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-lime-500 to-green-600" style={{ width: `${s.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Badge collection */}
        <section className="rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm" aria-label={t("badges", lang)}>
          <h2 className="mb-3 text-lg font-extrabold text-amber-900">🏅 {t("badges", lang)} ({earned.length}/{badges.length})</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => {
              const has = earned.includes(b.code);
              return (
                <div
                  key={b.code}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all",
                    has
                      ? "border-amber-400 bg-gradient-to-b from-amber-50 to-white shadow-sm"
                      : "border-amber-100 bg-white opacity-50 grayscale"
                  )}
                  title={b.descEn}
                >
                  <div className={cn("text-3xl", has && "animate-bounce-slow")} aria-hidden>{b.icon}</div>
                  <div className="mt-1 text-xs font-extrabold text-amber-900">{lang === "fr" ? b.nameFr : b.nameEn}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-amber-700/80">{b.descEn}</div>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                      b.rarity === "epic" ? "bg-purple-100 text-purple-800" : b.rarity === "rare" ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {b.rarity}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
