"use client";
// Content Library — browse the official schemes (units/contents, ELOs,
// resources) + national core skills + domain weightings (Master 5.3)
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner } from "./shared";
import { cn } from "@/lib/utils";
import { BookOpen, Calculator, FlaskConical, Languages, Landmark, Palette, Dumbbell, Drum, Monitor, type LucideIcon } from "lucide-react";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen, calculator: Calculator, "flask-conical": FlaskConical,
  languages: Languages, landmark: Landmark, palette: Palette, dumbbell: Dumbbell,
  drum: Drum, monitor: Monitor,
};

interface SchemeWeek { id: string; subjectId: string; month: number; week: number; components: string[]; contents: string[]; outcomes: string[]; resources: string[] }
interface Subject { id: string; nameEn: string; nameFr: string; domain: string; weighting: number; color: string; icon: string }

export function LibraryView() {
  const { lang } = useApp();
  const [weeks, setWeeks] = React.useState<SchemeWeek[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [domains, setDomains] = React.useState<Array<{ name: string; weighting: number }>>([]);
  const [coreSkills, setCoreSkills] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState("english");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        setWeeks(data.schemeWeeks || []);
        setSubjects(data.subjects || []);
        setDomains(data.domains || []);
        setCoreSkills(data.nationalCoreSkills || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = weeks.filter((w) => w.subjectId === filter);

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">📚 {t("library", lang)}</h1>
          <p className="text-sm text-amber-700">
            {lang === "fr"
              ? "Programme officiel — Class 3, Mois 1 (La Maison) : unités/contenus, résultats attendus, ressources. Source : Plan Mensuel Régional Intégré (Littoral)."
              : "Official schemes — Class 3, Month 1 (The Home): units/contents, expected learning outcomes, resources. Source: Regional Monthly Integrated Learning Plan (Littoral)."}
          </p>
        </header>

        {/* Domain weightings */}
        <section className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm" aria-label={t("domains", lang)}>
          <h2 className="mb-3 text-sm font-extrabold text-amber-900">{t("domains", lang)}</h2>
          <div className="space-y-2">
            {domains.map((d) => (
              <div key={d.name}>
                <div className="mb-0.5 flex justify-between text-xs font-bold text-amber-800">
                  <span>{d.name}</span><span>{d.weighting}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-amber-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-600" style={{ width: `${d.weighting * 1.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subject filter */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("subjects", lang)}>
          {subjects.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={filter === s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "min-h-[36px] rounded-full border-2 px-3 text-xs font-bold transition-all",
                filter === s.id ? "border-amber-700 bg-amber-700 text-white shadow" : "border-amber-200 bg-white text-amber-800 hover:border-amber-400"
              )}
            >
              <span className="mr-1 inline-flex align-middle" aria-hidden>
                {React.createElement(SUBJECT_ICONS[s.icon] || BookOpen, { size: 13 })}
              </span>
              {lang === "fr" ? s.nameFr : s.nameEn}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {shown.map((w) => (
              <article key={w.id} className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
                <h3 className="mb-1 text-sm font-extrabold text-lime-900">
                  {lang === "fr" ? "Semaine" : "Week"} {w.week} — {lang === "fr" ? "Mois" : "Month"} {w.month}
                </h3>
                <div className="mb-2 flex flex-wrap gap-1">
                  {w.components.map((c) => (
                    <span key={c} className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-800">{c}</span>
                  ))}
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{lang === "fr" ? "Unités / Contenus" : "Units / Contents"}</h4>
                <ul className="mb-2 space-y-0.5 text-xs text-amber-900">
                  {w.contents.map((c) => <li key={c}>• {c}</li>)}
                </ul>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-orange-600">{lang === "fr" ? "Résultats attendus" : "Expected Learning Outcomes"}</h4>
                <ul className="mb-2 space-y-0.5 text-xs text-orange-900">
                  {w.outcomes.map((o) => <li key={o}>✓ {o}</li>)}
                </ul>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{lang === "fr" ? "Ressources" : "Resources"}</h4>
                <p className="text-xs text-amber-700">{w.resources.join(" · ")}</p>
              </article>
            ))}
          </div>
        )}

        {/* National Core Skills */}
        <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-extrabold text-orange-900">
            🇨🇲 {lang === "fr" ? "Compétences de Base Nationales" : "National Core Skills"}
          </h2>
          <ol className="space-y-1 text-xs text-orange-900">
            {coreSkills.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
          </ol>
        </section>
      </div>
    </main>
  );
}
