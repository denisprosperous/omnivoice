"use client";
// ============================================================================
// DIY WORKSHOP — Library third wing (v4.0 §III Practical DIY Learning).
// §3.2 DIY Learning Framework table · 12 built DIY lessons (Class 3 Month 1,
// interactive with Kokoro voice guides) · §3.4 DIY Content Library per ILT.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { DIY_FRAMEWORK, DIY_LESSONS, DIY_LIBRARY } from "@/lib/data/diy";
import { DIYLessonCard } from "./diy-lesson-card";
import { cn } from "@/lib/utils";

export function DiyWorkshop() {
  const { lang } = useApp();
  const fr = lang === "fr";
  const [selDiy, setSelDiy] = React.useState(DIY_LESSONS[0].id);

  const current = DIY_LESSONS.find((d) => d.id === selDiy) || DIY_LESSONS[0];

  return (
    <div className="space-y-5">
      <p className="rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-3 text-sm text-orange-900">
        🔨 {t("diyLibraryIntro", lang)}
      </p>

      {/* §3.2 DIY Learning Framework */}
      <section className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm" aria-label="DIY Learning Framework">
        <h2 className="mb-2 text-sm font-extrabold text-amber-900">🧭 {fr ? "Cadre d'Apprentissage DIY (§3.2)" : "DIY Learning Framework (§3.2)"}</h2>
        <div className="overflow-x-auto rounded-xl border border-amber-100">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-amber-50">
              <tr className="text-[10px] uppercase text-amber-600">
                <th className="px-2 py-1.5">{fr ? "Type de leçon" : "Lesson Type"}</th>
                <th className="px-2 py-1.5">{fr ? "Composante DIY" : "DIY Component"}</th>
                <th className="px-2 py-1.5">{fr ? "Matériaux" : "Materials"}</th>
                <th className="px-2 py-1.5">{fr ? "Durée" : "Duration"}</th>
              </tr>
            </thead>
            <tbody>
              {DIY_FRAMEWORK.map((row) => (
                <tr key={row.lessonType} className="border-t border-amber-50">
                  <td className="px-2 py-1.5 font-bold text-amber-800">{row.lessonType}</td>
                  <td className="px-2 py-1.5 text-amber-900">{row.diyComponent}</td>
                  <td className="px-2 py-1.5 text-amber-700">{row.materials}</td>
                  <td className="px-2 py-1.5 font-semibold text-lime-700">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 12 built DIY lessons — interactive */}
      <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/60 to-white p-4 shadow-sm" aria-label={t("builtDiyLessons", lang)}>
        <h2 className="mb-2 text-sm font-extrabold text-orange-900">🔨 {t("builtDiyLessons", lang)} ({DIY_LESSONS.length})</h2>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {DIY_LESSONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelDiy(d.id)}
              aria-pressed={selDiy === d.id}
              className={cn(
                "min-h-[32px] rounded-full border-2 px-2.5 text-[11px] font-bold transition-all",
                selDiy === d.id ? "border-orange-600 bg-orange-600 text-white shadow" : "border-orange-200 bg-white text-orange-800 hover:border-orange-400"
              )}
            >
              {d.title.length > 30 ? `${d.title.slice(0, 28)}…` : d.title}
            </button>
          ))}
        </div>
        <DIYLessonCard lesson={current} lang={lang} compact />
      </section>

      {/* §3.4 DIY Content Library per ILT */}
      <section className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm" aria-label="DIY Content Library per ILT">
        <h2 className="mb-2 text-sm font-extrabold text-lime-900">📚 {fr ? "Bibliothèque DIY par ILT (§3.4)" : "DIY Content Library per ILT (§3.4)"}</h2>
        <div className="space-y-4">
          {DIY_LIBRARY.map((section) => (
            <div key={section.ilt} className="rounded-xl border border-lime-100 overflow-hidden">
              <h3 className="bg-lime-50 px-3 py-2 text-xs font-extrabold text-lime-900">{section.ilt}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-white">
                    <tr className="text-[10px] uppercase text-lime-600">
                      <th className="px-2 py-1.5">{fr ? "Matière" : "Subject"}</th>
                      <th className="px-2 py-1.5">{fr ? "Activité DIY" : "DIY Activity"}</th>
                      <th className="px-2 py-1.5">{fr ? "Matériaux" : "Materials"}</th>
                      <th className="px-2 py-1.5">{fr ? "Objectif" : "Learning Objective"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r) => (
                      <tr key={`${section.ilt}-${r.subject}`} className="border-t border-lime-50">
                        <td className="px-2 py-1.5 font-bold text-amber-800">{fr ? r.subjectFr : r.subject}</td>
                        <td className="px-2 py-1.5 text-amber-900">{fr ? r.activityFr : r.activity}</td>
                        <td className="px-2 py-1.5 text-amber-700">{fr ? r.materialsFr : r.materials}</td>
                        <td className="px-2 py-1.5 text-lime-800">{fr ? r.objectiveFr : r.objective}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
