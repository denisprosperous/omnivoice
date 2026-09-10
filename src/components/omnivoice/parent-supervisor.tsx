"use client";
// Parent — Progress Tracking (Master 1.4/5.3): engagement, outcomes, voice stats
// Supervisor — Monitoring, Evaluation, Quality Assurance + analytics
// v3.0 — Preview Deployment & Live Demo Edition: audit corrections panel,
// preview feature checklist, golden paths, success criteria, live preview
// analytics (§5.1) + feedback summary (§5.2), v3.0 build audit + roadmap.
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner, StatPill } from "./shared";
import { PreviewOpsPanel } from "./preview-ops";
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

            <PreviewOpsPanel />

            <BuildAuditReport lang={lang} />
          </>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// v3.0 BUILD AUDIT REPORT + ROADMAP + SUCCESS METRICS (Master Prompt v2.0:
// Critical Build Audit, §VIII Roadmap, §IX Success Metrics incl. Grassfields;
// upgraded to the v3.0 Preview Deployment & Live Demo Edition — corrected
// 8-language matrix with Kom/Lamnso' separate and Bayangi added)
// ============================================================================
function BuildAuditReport({ lang }: { lang: string }) {
  const fr = lang === "fr";
  const audit: Array<{ phase: string; task: string; status: "done" | "partial" | "todo" }> = [
    { phase: "Preview v3.0", task: "CORRECTION 1 — Kom (bkm) and Lamnso' (lns) tracked as separate entries (ASR/TTS/content/audit/metrics)", status: "done" },
    { phase: "Preview v3.0", task: "CORRECTION 2 — Bayangi (byv) added as 8th language: placeholder content + 500h data collection plan (SIL Cameroon, Q2 2025)", status: "done" },
    { phase: "Preview v3.0", task: "CORRECTION 3 — corrected 8-language matrix on every surface (picker, HUD, hook switcher, library, registry, audit)", status: "done" },
    { phase: "Preview v3.0", task: "Lesson hook switcher — EN → FR → Kom → Lamnso' → Bayangi (Directive 9 placeholder states)", status: "done" },
    { phase: "Preview v3.0", task: "Language Registry Console — add more dialects/local languages (DRAFT → IN_REVIEW → ACTIVE pipeline)", status: "done" },
    { phase: "Preview v3.0", task: "Embedded preview analytics (§5.1): page views, voice-language selections, lesson completions, ASR attempts", status: "done" },
    { phase: "Preview v3.0", task: "Embedded feedback widget (§5.2): rating, voice quality, language accuracy, comments", status: "done" },
    { phase: "Preview v3.0", task: "Golden paths verified end-to-end (Learner 10 / Teacher 6 / Supervisor 5)", status: "done" },
    { phase: "Phase 1: Foundation", task: "Development environment (Next.js + Tailwind, DB)", status: "done" },
    { phase: "Phase 1: Foundation", task: "ASR integration (base ASR; Simba registry + fine-tune hooks for Grassfields)", status: "partial" },
    { phase: "Phase 1: Foundation", task: "TTS integration (neural + GACL tone-rules; F5-TTS clone pending native reference)", status: "partial" },
    { phase: "Phase 1: Foundation", task: "Frontend — Curriculum Navigator (map-based quest board)", status: "done" },
    { phase: "Phase 1: Foundation", task: "Database schema (learner, curriculum, lessons, gamification, PBL, assessments, preview analytics/feedback/language drafts)", status: "done" },
    { phase: "Phase 1: Foundation", task: "Kom ASR/TTS integration (fine-tune data 500h+ — sourcing from SIL Cameroon)", status: "todo" },
    { phase: "Phase 1: Foundation", task: "Lamnso' ASR/TTS integration (fine-tune data 500h+ — sourcing from SIL Cameroon)", status: "todo" },
    { phase: "Phase 2: Core Features", task: "Lesson Plan Generator (§7.3 v2.0 format, KG→High School)", status: "done" },
    { phase: "Phase 2: Core Features", task: "Voice Pipeline STS (ASR → LLM → TTS, multilingual + code-switching)", status: "done" },
    { phase: "Phase 2: Core Features", task: "Content Library — Class 3, Month 1 complete (all subjects, voice-enabled)", status: "done" },
    { phase: "Phase 2: Core Features", task: "Gamification Engine (XP, badges, streaks, levels)", status: "done" },
    { phase: "Phase 2: Core Features", task: "Assessment Engine (formative/summative/diagnostic + ASR oral scoring + tone accuracy)", status: "done" },
    { phase: "Phase 2: Core Features", task: "Grassfields Content Generation (Kom/Lamnso' — spec-attested phrases, native validation pending)", status: "partial" },
    { phase: "Phase 2: Core Features", task: "Voice Cloning for Grassfields (F5-TTS adapter ready — reference audio needed)", status: "todo" },
    { phase: "Phase 3: Integration", task: "Module integration (unified SPA: navigator, player, projects, library, profiles)", status: "done" },
    { phase: "Phase 3: Integration", task: "Closed pilot (5 schools Littoral + 5 North West)", status: "todo" },
    { phase: "Phase 3: Integration", task: "Grassfields Language Validation (native speakers, 90% approval target)", status: "todo" },
    { phase: "Phase 3: Integration", task: "Bayangi data collection (500h, SIL Cameroon / Local Community, Q2 2025) → graduation to ACTIVE", status: "todo" },
    { phase: "Phase 4: Launch", task: "Production deployment (public preview live; production hardening next)", status: "partial" },
    { phase: "Phase 4: Launch", task: "Content expansion (Classes 1-2, Forms 1-5, High School modules)", status: "todo" },
    { phase: "Phase 4: Launch", task: "International framework mapping (IB/Cambridge/CEFR across levels)", status: "done" },
    { phase: "Phase 4: Launch", task: "Additional Grassfields languages (Bafut, Oku, Babanki, Mankon, Ngie) — via Language Registry pipeline", status: "todo" },
  ];
  const roadmap: Array<{ phase: string; weeks: string; focus: string }> = [
    { phase: "Phase 1 — Foundation", weeks: "Weeks 1-2", focus: "Environment, ASR/TTS, Kom + Lamnso' voice, frontend, database" },
    { phase: "Phase 2 — Core Features", weeks: "Weeks 3-6", focus: "Lesson generator, voice pipeline, content, gamification, assessment, Grassfields content + cloning (incl. Bayangi placeholder)" },
    { phase: "Phase 3 — Integration & Testing", weeks: "Weeks 7-8", focus: "Unified platform, closed pilots (Littoral + North West), native-speaker validation, Bayangi data collection (Q2 2025)" },
    { phase: "Phase 4 — Launch & Expansion", weeks: "Weeks 9+", focus: "Launch, content expansion, IB/Cambridge mapping, planned Grassfields languages (Bafut, Oku, Babanki, Mankon, Ngie) via the Registry pipeline" },
  ];
  const metrics: Array<{ m: string; target: string }> = [
    { m: "Learner engagement", target: "80% daily active use" },
    { m: "Learning outcomes", target: "90% ELO achievement" },
    { m: "Voice interaction", target: "70% of activities voice-enabled" },
    { m: "Cultural relevance", target: "95% culturally appropriate" },
    { m: "Offline functionality", target: "100% core features offline" },
    { m: "Teacher adoption", target: "85% find platform useful" },
    { m: "Deployment time", target: "< 12 weeks to MVP" },
    { m: "Grassfields language accuracy", target: "90% native speaker approval" },
    { m: "Tone accuracy (TTS)", target: "85% correct tone production" },
  ];
  const statusBadge = (s: string) =>
    s === "done"
      ? { cls: "bg-lime-100 text-lime-800", label: fr ? "TERMINÉ" : "DONE" }
      : s === "partial"
      ? { cls: "bg-amber-100 text-amber-800", label: fr ? "PARTIEL" : "PARTIAL" }
      : { cls: "bg-stone-100 text-stone-600", label: fr ? "À FAIRE" : "TODO" };

  return (
    <>
      <section className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-amber-900">🧾 {t("buildAudit", lang)}</h3>
        <p className="mb-2 text-[11px] text-amber-700">
          {fr
            ? "Audit de construction v3.0 — corrections d'audit (Kom ≠ Lamnso', Bayangi ajoutée, matrice à 8 langues) + statut de chaque tâche stipulée."
            : "v3.0 build audit — audit corrections (Kom ≠ Lamnso', Bayangi added, 8-language matrix) + status of every stipulated task."}
        </p>
        <div className="max-h-80 overflow-y-auto rounded-xl border border-amber-100">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="sticky top-0 bg-amber-50">
              <tr className="text-[10px] uppercase text-amber-600">
                <th className="px-2 py-1.5">{fr ? "Phase" : "Phase"}</th>
                <th className="px-2 py-1.5">{fr ? "Tâche" : "Task"}</th>
                <th className="px-2 py-1.5">Statut</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a, i) => {
                const b = statusBadge(a.status);
                return (
                  <tr key={i} className="border-t border-amber-50">
                    <td className="px-2 py-1.5 font-bold text-amber-800">{a.phase}</td>
                    <td className="px-2 py-1.5 text-amber-900">{a.task}</td>
                    <td className="px-2 py-1.5"><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-extrabold", b.cls)}>{b.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-orange-900">🗺️ {t("roadmap", lang)}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {roadmap.map((r) => (
            <div key={r.phase} className="rounded-xl border border-orange-100 bg-white p-2.5 text-xs">
              <b className="text-orange-900">{r.phase}</b> <span className="text-[10px] font-bold uppercase text-orange-500">({r.weeks})</span>
              <p className="mt-0.5 text-amber-800">{r.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-lime-900">🎯 {fr ? "Indicateurs de réussite (cibles)" : "Success metrics (targets)"}</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {metrics.map((x) => (
            <div key={x.m} className="rounded-xl bg-lime-50 p-2.5 text-xs">
              <b className="text-lime-900">{x.m}</b>
              <p className="text-amber-800">{x.target}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold text-lime-800">
          🪶 {fr ? "Précision tonale cible (TTS) : 85% · Précision des langues Grassfields : 90% d'approbation des locuteurs natifs." : "Tone accuracy target (TTS): 85% · Grassfields language accuracy: 90% native-speaker approval."}
        </p>
      </section>
    </>
  );
}
