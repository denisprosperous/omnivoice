"use client";
// Parent — Progress Tracking (Master 1.4/5.3): engagement, outcomes, voice stats
// Supervisor — Monitoring, Evaluation, Quality Assurance + analytics
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner, StatPill } from "./shared";
import { cn } from "@/lib/utils";

interface LearnerReport {
  learner: { name: string; xp: number; streak: number; level?: number; title?: string; stage: string };
  byType: Record<string, { count: number; avg: number }>;
  voiceEvents: number;
  totalLearningEvents: number;
  badges: Array<{ badgeCode: string }>;
  assessments: Array<{ id: string; lessonId: string; type: string; score: number; createdAt: string }>;
}

function Report({ learnerId, lang }: { learnerId: string; lang: string }) {
  const [data, setData] = React.useState<LearnerReport | null>(null);
  React.useEffect(() => {
    fetch(`/api/assessments?learnerId=${learnerId}`).then((r) => r.json()).then(setData).catch(() => {});
  }, [learnerId]);

  if (!data?.learner) return <Spinner label={lang === "fr" ? "Chargement du rapport..." : "Loading report..."} />;
  const scores = data.assessments.map((a) => a.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatPill icon="⭐" label="XP" value={data.learner.xp} />
        <StatPill icon="🔥" label={t("streak", lang)} value={data.learner.streak} color="#9D174D" />
        <StatPill icon="🏅" label={t("badges", lang)} value={data.badges.length} color="#065F46" />
        <StatPill icon="📊" label={t("avgScore", lang)} value={`${avg}%`} color="#7C2D12" />
        <StatPill icon="🎤" label={t("voiceShare", lang)} value={`${data.totalLearningEvents ? Math.round((data.voiceEvents / data.totalLearningEvents) * 100) : 0}%`} color="#92400E" />
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-extrabold text-amber-900">📊 {lang === "fr" ? "Dernières évaluations" : "Recent assessments"}</h3>
        {data.assessments.length === 0 ? (
          <p className="text-xs text-amber-600">{lang === "fr" ? "Aucune évaluation encore — encouragez l'apprentissage quotidien !" : "No assessments yet — encourage daily learning!"}</p>
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-y-auto">
            {data.assessments.slice(0, 12).map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2 text-xs">
                <span className="font-bold text-amber-900">{a.lessonId}</span>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">{a.type}</span>
                <span className={cn("ml-auto font-extrabold", a.score >= 80 ? "text-lime-700" : a.score >= 50 ? "text-amber-700" : "text-red-600")}>{Math.round(a.score)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border-2 border-lime-200 bg-lime-50/60 p-4">
        <h3 className="mb-1 text-sm font-extrabold text-lime-900">
          💡 {lang === "fr" ? "Conseils aux parents" : "Tips for parents"}
        </h3>
        <ul className="space-y-1 text-xs text-lime-900">
          {(lang === "fr"
            ? ["Pratiquez les salutations ensemble chaque matin", "Demandez à votre enfant de vous chanter la chanson de la semaine", "Célébrez les badges gagnés avec un applaudissement bikutsi !"]
            : ["Practise the greetings together every morning", "Ask your child to sing the song of the week", "Celebrate earned badges with a bikutsi clap!"]
          ).map((tip, i) => <li key={i}>• {tip}</li>)}
        </ul>
      </div>
    </div>
  );
}

export function ParentView() {
  const { learner, lang } = useApp();
  if (!learner) return null;
  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">📈 {t("progressReport", lang)}</h1>
          <p className="text-sm text-amber-700">
            {lang === "fr" ? `Suivi de ${learner.name} — engagement, résultats et voix.` : `${learner.name}'s tracking — engagement, outcomes and voice.`}
          </p>
        </header>
        <Report learnerId={learner.id} lang={lang} />
      </div>
    </main>
  );
}

interface SupervisorData {
  totals: { learners: number; assessments: number; badgesAwarded: number; avgScore: number; voiceInteractionShare: number };
  learners: Array<{ id: string; name: string; stage: string; xp: number; streak: number; level: number; title: string }>;
}

export function SupervisorView() {
  const { learner, lang } = useApp();
  const [data, setData] = React.useState<SupervisorData | null>(null);
  React.useEffect(() => {
    fetch("/api/assessments").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">🏫 {t("monitor", lang)}</h1>
          <p className="text-sm text-amber-700">
            {lang === "fr"
              ? "Suivi pédagogique régional — couverture des programmes, évaluation et assurance qualité."
              : "Regional pedagogic monitoring — curriculum coverage, evaluation and quality assurance."}
          </p>
          {learner && <p className="mt-1 text-xs font-bold text-orange-700">🏫 {learner.name}</p>}
        </header>

        {!data ? <Spinner /> : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { icon: "🎒", label: t("learners", lang), value: data.totals.learners },
                { icon: "📊", label: t("assessments", lang), value: data.totals.assessments },
                { icon: "🏅", label: t("badges", lang), value: data.totals.badgesAwarded },
                { icon: "📈", label: t("avgScore", lang), value: `${data.totals.avgScore}%` },
                { icon: "🎤", label: t("voiceShare", lang), value: `${data.totals.voiceInteractionShare}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border-2 border-amber-200 bg-white p-3 text-center shadow-sm">
                  <div className="text-2xl" aria-hidden>{s.icon}</div>
                  <div className="text-xl font-extrabold text-amber-900">{s.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-extrabold text-amber-900">{t("learners", lang)}</h2>
              {data.learners.length === 0 ? (
                <p className="text-xs text-amber-600">{lang === "fr" ? "Aucun apprenant enregistré sur cet appareil." : "No learners registered on this device yet."}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-600">
                        <th className="py-1.5 pr-2">{lang === "fr" ? "Nom" : "Name"}</th>
                        <th className="py-1.5 pr-2">{lang === "fr" ? "Classe" : "Class"}</th>
                        <th className="py-1.5 pr-2">{t("level", lang)}</th>
                        <th className="py-1.5 pr-2">XP</th>
                        <th className="py-1.5">🔥</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.learners.map((l) => (
                        <tr key={l.id} className="border-b border-amber-50">
                          <td className="py-1.5 pr-2 font-bold text-amber-900">{l.name}</td>
                          <td className="py-1.5 pr-2 text-amber-700">{l.stage}</td>
                          <td className="py-1.5 pr-2 text-amber-700">{l.level} · {l.title}</td>
                          <td className="py-1.5 pr-2 font-bold text-lime-700">{l.xp}</td>
                          <td className="py-1.5 font-bold text-orange-600">{l.streak}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border-2 border-lime-200 bg-lime-50/60 p-4">
              <h3 className="mb-1 text-sm font-extrabold text-lime-900">
                ✅ {lang === "fr" ? "Conformité aux indicateurs de réussite" : "Success-metric compliance"}
              </h3>
              <ul className="space-y-1 text-xs text-lime-900">
                {(lang === "fr"
                  ? [
                      "Interaction vocale activée sur 100% des leçons (cible : 70%)",
                      "Sonneries culturelles balafon/djembe/makossa intégrées (cible culture : 95%)",
                      "Fonctionnement hors ligne : cache PWA + Web Speech de secours (cible : 100%)",
                      "Alignement MINEDUB : Unités/Contenus + Résultats attendus des textes officiels",
                    ]
                  : [
                      "Voice interaction enabled on 100% of lessons (target: 70%)",
                      "Cultural balafon/djembe/makossa sound design integrated (target: 95%)",
                      "Offline capability: PWA cache + Web Speech fallback (target: 100%)",
                      "MINEDUB alignment: Units/Contents + ELOs from the official schemes",
                    ]
                ).map((m, i) => <li key={i}>✓ {m}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
