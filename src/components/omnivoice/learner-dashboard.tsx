"use client";
// Learner Dashboard — Curriculum Navigator: map-based quest board (Master 5.3)
// Voice-guided navigation + ILT serial story + quest nodes per subject.
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { XpBar, PatternBand } from "./shared";
import { speak } from "@/lib/voice-client";
import { playXp } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Calculator, FlaskConical, Languages, Landmark, Palette, Dumbbell, Drum, Monitor, type LucideIcon } from "lucide-react";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen, calculator: Calculator, "flask-conical": FlaskConical,
  languages: Languages, landmark: Landmark, palette: Palette, dumbbell: Dumbbell,
  drum: Drum, monitor: Monitor,
};

interface LessonCard {
  id: string; subjectId: string; subTheme: string; week: number; month: number;
  titleEn: string; titleFr: string; cefr: string; xp: number; badgeCode: string;
  mechanics: string[]; practiceCount: number;
}
interface Subject { id: string; nameEn: string; nameFr: string; domain: string; weighting: number; color: string; icon: string }
interface ILT { id: string; nameEn: string; nameFr: string; storyEn: string; storyFr: string; mood: string; order: number }

const SUBJECT_HUES: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: "#FFFBEB", border: "#F59E0B", text: "#92400E" },
  green: { bg: "#F0FDF4", border: "#16A34A", text: "#14532D" },
  lime: { bg: "#F7FEE7", border: "#65A30D", text: "#365314" },
  rose: { bg: "#FFF1F2", border: "#E11D48", text: "#881337" },
  orange: { bg: "#FFF7ED", border: "#EA580C", text: "#7C2D12" },
  purple: { bg: "#FAF5FF", border: "#9333EA", text: "#581C87" },
  red: { bg: "#FEF2F2", border: "#DC2626", text: "#7F1D1D" },
  yellow: { bg: "#FEFCE8", border: "#CA8A04", text: "#713F12" },
  teal: { bg: "#F0FDFA", border: "#0D9488", text: "#134E4A" },
};

export function LearnerDashboard() {
  const { learner, lang, openLesson, setView } = useApp();
  const [lessons, setLessons] = React.useState<LessonCard[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [ilts, setIlts] = React.useState<ILT[]>([]);
  const [activeIlt, setActiveIlt] = React.useState<string>("the-home");
  const [loading, setLoading] = React.useState(true);
  const [badgeCount, setBadgeCount] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      try {
        const [lRes, cRes] = await Promise.all([fetch("/api/lessons"), fetch("/api/curriculum")]);
        const lData = await lRes.json();
        const cData = await cRes.json();
        setLessons(lData.lessons || []);
        setSubjects(cData.subjects || []);
        setIlts(cData.ilts || []);
        if (learner?.id) {
          const pRes = await fetch(`/api/learner?id=${learner.id}`);
          const pData = await pRes.json();
          setBadgeCount(pData.badges?.length || 0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Voice greeting by name (Master 5.3 — Learner Profile)
  const greeted = React.useRef(false);
  React.useEffect(() => {
    if (!learner || greeted.current) return;
    greeted.current = true;
    const greeting = lang === "fr"
      ? `Bonjour ${learner.name} ! Prêt pour l'aventure du jour ?`
      : `Hello ${learner.name}! Ready for today's quest?`;
    setTimeout(() => void speak(greeting, "kwe", lang), 800);
  }, [learner, lang]);

  const activeIltData = ilts.find((i) => i.id === activeIlt) || ilts[0];
  const iltLessons = lessons.filter((l) => l.month === 1); // Month 1 complete (stipulated MVP scope)
  const grouped = React.useMemo(() => {
    const map: Record<string, LessonCard[]> = {};
    for (const l of iltLessons) (map[l.subjectId] = map[l.subjectId] || []).push(l);
    return map;
  }, [iltLessons]);

  if (!learner) return null;

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      {/* HUD stats */}
      <section className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-amber-300 bg-white p-3 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-2xl" aria-hidden>
            {learner.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-extrabold text-amber-900">
              {lang === "fr" ? "Bonjour" : "Hello"}, {learner.name}! 👋
            </div>
            <div className="text-xs font-medium text-amber-700">
              {lang === "fr" ? "Mois 1 — La Maison (La Maison des Quêtes)" : "Month 1 — The Home (Quest Board)"}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800" title={t("streak", lang)}>🔥 {learner.streak}</span>
            <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-800" title={t("badges", lang)}>🏅 {badgeCount}</span>
          </div>
          <div className="w-full sm:w-48">
            <XpBar xp={learner.xp} level={learner.level || 1} title={learner.title || "Curious Cub"} />
          </div>
        </div>
      </section>

      {/* ILT serial adventure story */}
      {activeIltData && (
        <section className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-orange-900">
                📖 {lang === "fr" ? activeIltData.nameFr : activeIltData.nameEn}
              </h2>
              <div className="flex flex-wrap gap-1">
                {ilts.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setActiveIlt(i.id)}
                    aria-pressed={activeIlt === i.id}
                    className={cn(
                      "min-h-[30px] rounded-full border px-2.5 text-[11px] font-bold transition-all",
                      activeIlt === i.id ? "border-orange-700 bg-orange-700 text-white" : "border-orange-300 bg-white text-orange-800 hover:bg-orange-100"
                    )}
                  >
                    {lang === "fr" ? i.nameFr : i.nameEn}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-orange-800/90">
              {lang === "fr" ? activeIltData.storyFr : activeIltData.storyEn}
            </p>
          </div>
        </section>
      )}

      {/* Curriculum Navigator — map of subject quest islands */}
      <section className="mx-auto max-w-6xl px-4 pt-4" aria-label={t("dashboard", lang)}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-amber-900">🗺️ {t("dashboard", lang)}</h2>
          <Button variant="outline" size="sm" className="border-amber-300 text-amber-800" onClick={() => setView("projects")}>
            🛠️ {t("projects", lang)}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-amber-100/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s, idx) => {
              const hues = SUBJECT_HUES[s.color] || SUBJECT_HUES.amber;
              const subjLessons = grouped[s.id] || [];
              const totalXp = subjLessons.reduce((a, l) => a + l.xp, 0);
              // staggered "map" offsets for the quest-board feel
              const offset = [0, 14, 6, 20, 10, 0, 16, 8, 4][idx % 9];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border-2 bg-white p-4 shadow-md transition-transform hover:-translate-y-1"
                  style={{ borderColor: hues.border, background: `linear-gradient(160deg, ${hues.bg} 0%, #ffffff 55%)`, marginTop: offset }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: hues.bg, border: `1.5px solid ${hues.border}66` }}
                      aria-hidden
                    >
                      {React.createElement(SUBJECT_ICONS[s.icon] || BookOpen, { size: 18, color: hues.border })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold" style={{ color: hues.text }}>
                        {lang === "fr" ? s.nameFr : s.nameEn}
                      </h3>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600/80">
                        {s.domain} · {s.weighting}%
                      </div>
                    </div>
                  </div>

                  {subjLessons.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                      {lang === "fr" ? "Généré par l'IA via le Générateur de Leçons (enseignant)." : "AI-generated via the Lesson Plan Generator (teacher)."}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {subjLessons.map((l) => (
                        <li key={l.id}>
                          <button
                            onClick={() => { playXp(); openLesson(l.id); }}
                            className="group flex w-full items-center gap-2 rounded-xl border bg-white/80 p-2 text-left transition-all hover:shadow-md active:scale-[0.99]"
                            style={{ borderColor: hues.border + "55" }}
                            aria-label={`Quest: ${lang === "fr" ? l.titleFr : l.titleEn}`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: hues.border }} aria-hidden>
                              {l.week}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold" style={{ color: hues.text }}>
                                {lang === "fr" ? l.titleFr : l.titleEn}
                              </span>
                              <span className="block truncate text-[10px] text-amber-600/80">
                                🎤 {l.practiceCount} · {l.cefr} · +{l.xp} XP
                              </span>
                            </span>
                            <span className="text-amber-500 transition-transform group-hover:translate-x-0.5" aria-hidden>▶</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {subjLessons.length > 0 && (
                    <div className="mt-2 text-right text-[10px] font-bold text-amber-500">
                      {totalXp} XP {lang === "fr" ? "disponibles" : "available"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
