"use client";
// ============================================================================
// TEACHER — Lesson Plan Generator (Core MVP Feature, Master 5.3): AI generates
// complete Voice-Enabled Gamified Lesson Plans (6.3 JSON) for ANY level
// KG→High School, mapped to the Cameroon curriculum + CEFR/IB. Audio preview.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner } from "./shared";
import { speak } from "@/lib/voice-client";
import { playBadge } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEVELS } from "@/lib/data/curriculum";

interface GeneratedPlan {
  lesson_plan?: {
    subject?: string; level?: string; cefr_alignment?: string; sub_theme?: string;
    ib_learner_profile?: string[]; expected_learning_outcomes?: string[];
    voice_assets?: { hook?: { text?: string }; practice_prompts?: Array<{ prompt: string }>; celebration?: { text?: string } };
    gamification?: { mechanics?: string[]; xp_points?: number; badge_name?: string };
    activities?: Array<{ phase: string; duration: string; description: string }>;
    assessment?: { criteria: string[] };
    differentiation?: string[];
    cultural_notes?: string;
  };
}

export function TeacherView() {
  const { learner, lang } = useApp();
  const [subject, setSubject] = React.useState("english");
  const [stage, setStage] = React.useState("class3");
  const [week, setWeek] = React.useState(1);
  const [busy, setBusy] = React.useState(false);
  const [plan, setPlan] = React.useState<GeneratedPlan | null>(null);
  const [error, setError] = React.useState("");

  const SUBJECT_OPTIONS = [
    { id: "english", en: "English Language", fr: "Langue Anglaise" },
    { id: "mathematics", en: "Mathematics", fr: "Mathématiques" },
    { id: "science", en: "Science and Technology", fr: "Sciences et Technologie" },
    { id: "francais", en: "Français", fr: "Français" },
    { id: "social-studies", en: "Social Studies", fr: "Études Sociales" },
    { id: "national-languages", en: "National Languages & Cultures", fr: "Langues Nationales et Cultures" },
    { id: "arts", en: "Arts", fr: "Arts" },
    { id: "pe", en: "Physical Education", fr: "Éducation Physique" },
    { id: "ict", en: "ICT", fr: "TIC" },
  ];

  async function generate() {
    setBusy(true); setError(""); setPlan(null);
    try {
      const res = await fetch("/api/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, stage, week, language: lang === "fr" ? "fr" : "en" }),
      });
      if (!res.ok) throw new Error(`Generation failed (${res.status})`);
      const data = await res.json();
      setPlan(data);
      playBadge();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  const lp = plan?.lesson_plan;

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">📝 {t("lessonPlans", lang)}</h1>
          <p className="text-sm text-amber-700">
            {lang === "fr"
              ? "Génère des plans de leçon complets, vocaux et gamifiés (JSON 6.3) pour tous les niveaux — Maternelle au Lycée — alignés MINEDUB + CECRL + IB."
              : "Generate complete Voice-Enabled Gamified Lesson Plans (6.3 JSON) for any level — KG to High School — aligned to MINEDUB + CEFR + IB."}
          </p>
          {learner && <p className="mt-1 text-xs font-bold text-orange-700">🧑🏾‍🏫 {learner.name}</p>}
        </header>

        <section className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="subj" className="mb-1 block text-xs font-bold text-amber-800">{t("subjects", lang)}</label>
              <select id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full rounded-lg border-2 border-amber-300 bg-white px-2 text-sm font-semibold text-amber-900">
                {SUBJECT_OPTIONS.map((s) => <option key={s.id} value={s.id}>{lang === "fr" ? s.fr : s.en}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="stg" className="mb-1 block text-xs font-bold text-amber-800">{lang === "fr" ? "Niveau (CITE 0-3)" : "Level (ISCED 0-3)"}</label>
              <select id="stg" value={stage} onChange={(e) => setStage(e.target.value)} className="h-11 w-full rounded-lg border-2 border-amber-300 bg-white px-2 text-sm font-semibold text-amber-900">
                {[0, 1, 2, 3].map((isced) => (
                  <optgroup key={isced} label={`ISCED ${isced}`}>
                    {LEVELS.filter((l) => l.isced === isced).map((l) => (
                      <option key={l.id} value={l.id}>{lang === "fr" ? l.nameFr : l.nameEn}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="wk" className="mb-1 block text-xs font-bold text-amber-800">{lang === "fr" ? "Semaine" : "Week"}</label>
              <select id="wk" value={week} onChange={(e) => setWeek(Number(e.target.value))} className="h-11 w-full rounded-lg border-2 border-amber-300 bg-white px-2 text-sm font-semibold text-amber-900">
                {[1, 2, 3, 4].map((w) => <option key={w} value={w}>{lang === "fr" ? `Semaine ${w}` : `Week ${w}`}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={generate} disabled={busy} className="mt-3 h-13 w-full bg-amber-600 text-base font-extrabold hover:bg-amber-700" size="lg">
            {busy ? <Spinner /> : "✨ " + t("generate", lang)}
          </Button>
          {error && <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}
        </section>

        {lp && (
          <section className="space-y-3" aria-live="polite">
            <div className="rounded-2xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-5 shadow-md">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="flex-1 text-xl font-extrabold text-lime-900">{lp.subject} — {lp.level}</h2>
                <span className="rounded-full bg-lime-200 px-3 py-1 text-xs font-bold text-lime-900">CEFR {lp.cefr_alignment}</span>
                {lp.gamification?.xp_points && (
                  <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-900">+{lp.gamification.xp_points} XP</span>
                )}
              </div>
              {lp.voice_assets?.hook?.text && (
                <div className="mb-3 flex items-start gap-2 rounded-xl bg-white p-3">
                  <button
                    onClick={() => void speak(lp.voice_assets!.hook!.text!, "kwe", lang === "fr" ? "fr" : "en")}
                    className="shrink-0 rounded-full bg-lime-100 p-2 text-lime-700 hover:bg-lime-200"
                    aria-label="Play hook audio preview"
                  >🔊</button>
                  <p className="text-sm text-lime-900"><b>{lang === "fr" ? "Accroche" : "Hook"}:</b> {lp.voice_assets.hook.text}</p>
                </div>
              )}
              {lp.expected_learning_outcomes && (
                <div className="mb-3">
                  <h3 className="mb-1 text-sm font-bold text-lime-900">{lang === "fr" ? "Résultats attendus" : "Expected Learning Outcomes"}</h3>
                  <ul className="space-y-1 text-sm text-lime-800">
                    {lp.expected_learning_outcomes.map((o, i) => <li key={i}>✓ {o}</li>)}
                  </ul>
                </div>
              )}
              {lp.activities && (
                <div className="mb-3">
                  <h3 className="mb-1 text-sm font-bold text-lime-900">{lang === "fr" ? "Déroulé (5 phases vocales)" : "Flow (5 voice phases)"}</h3>
                  <ol className="space-y-1.5 text-sm text-lime-800">
                    {lp.activities.map((a, i) => (
                      <li key={i} className="rounded-lg bg-white p-2">
                        <b>{a.phase}</b> <span className="text-xs opacity-70">({a.duration})</span> — {a.description}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {lp.voice_assets?.practice_prompts && (
                <div className="mb-3">
                  <h3 className="mb-1 text-sm font-bold text-lime-900">🎤 {lang === "fr" ? "Invites ASR" : "ASR practice prompts"}</h3>
                  <ul className="space-y-1 text-sm text-lime-800">
                    {lp.voice_assets.practice_prompts.map((p, i) => (
                      <li key={i} className="rounded-lg bg-white p-2">“{p.prompt}”</li>
                    ))}
                  </ul>
                </div>
              )}
              {lp.assessment?.criteria && (
                <div className="mb-3">
                  <h3 className="mb-1 text-sm font-bold text-lime-900">{lang === "fr" ? "Critères d'évaluation" : "Assessment criteria"}</h3>
                  <p className="text-sm text-lime-800">{lp.assessment.criteria.join(" · ")}</p>
                </div>
              )}
              {lp.differentiation && lp.differentiation.length > 0 && (
                <div>
                  <h3 className="mb-1 text-sm font-bold text-lime-900">♿ {lang === "fr" ? "Différenciation & inclusion" : "Differentiation & inclusivity"}</h3>
                  <ul className="space-y-1 text-sm text-lime-800">
                    {lp.differentiation.map((d, i) => <li key={i}>• {d}</li>)}
                  </ul>
                </div>
              )}
              {lp.cultural_notes && (
                <p className="mt-3 rounded-xl bg-amber-100 p-3 text-xs italic text-amber-900">🌍 {lp.cultural_notes}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
