"use client";
// ============================================================================
// DIYLessonCard — OMNIVOICE v4.0 §3.5 Practical DIY Learning component.
// Hands-on activities with locally available materials: materials checklist,
// step-by-step voice-guided building (Kokoro natural voice), dialogue script
// playback, assessment criteria, extension, gamification (+30 XP, craft
// badge, photo challenge). Interface matches the spec's DIYLesson/DIYStep.
// ============================================================================
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playXp, playCorrect } from "@/lib/sound-engine";
import { speak } from "@/lib/voice-client";
import { trackEvent } from "@/lib/analytics";
import type { DIYLesson } from "@/lib/data/diy";

// spec §3.5 — DIYStep carries audioUrl; in the v4.0 runtime the voice guide
// is synthesized on demand through the Kokoro pipeline (audioUrl reserved for
// pre-rendered packs used offline).
export interface DIYStepUI {
  step: number;
  instruction: string;
  instructionFr: string;
  voice_guide: string;
  voice_guideFr: string;
  audioUrl?: string;
  duration: string;
}

export function DIYLessonCard({
  lesson,
  lang,
  onComplete,
  completeLabel,
  compact,
}: {
  lesson: DIYLesson;
  lang: string;
  onComplete?: () => void;
  /** label for the completion CTA (defaults to "Voice Practice →" in lesson flow) */
  completeLabel?: string;
  compact?: boolean;
}) {
  const fr = lang === "fr";
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [speakingStep, setSpeakingStep] = React.useState<number | null>(null);
  const allDone = completedSteps.length === lesson.steps.length;

  const text = (en: string, f: string) => (fr ? f : en);

  function playGuide(i: number) {
    const s = lesson.steps[i];
    setSpeakingStep(i);
    void speak(text(s.voice_guide, s.voice_guideFr), "kwe", fr ? "fr" : "en")
      .catch(() => {})
      .finally(() => setSpeakingStep((cur) => (cur === i ? null : cur)));
  }

  function markComplete(i: number) {
    if (completedSteps.includes(i)) return;
    const next = [...completedSteps, i];
    setCompletedSteps(next);
    playXp();
    trackEvent("diy_step_complete", { diyId: lesson.id, step: i + 1 });
    if (i < lesson.steps.length - 1) setCurrentStep(i + 1);
    if (next.length === lesson.steps.length) {
      playCorrect();
      trackEvent("diy_completion", { diyId: lesson.id, linkedLesson: lesson.linkedLessonId });
    }
  }

  function playDialogueLine(who: "child" | "adult", line?: string, lineFr?: string) {
    if (!line && !lineFr) return;
    void speak(text(line || "", lineFr || ""), who === "child" ? "mbi" : "kwe", fr ? "fr" : "en");
  }

  return (
    <div className="space-y-4" aria-label={lesson.title}>
      {/* diy-header (§3.5) */}
      <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">🔨 DIY Practical</span>
          <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-[10px] font-bold text-lime-800">⏱ {text("15-30 min", "15-30 min")}</span>
        </div>
        <h3 className="text-lg font-extrabold text-orange-900">{fr ? lesson.titleFr : lesson.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-orange-800">
          🎯 {fr ? lesson.learning_objectiveFr : lesson.learning_objective}
        </p>
      </div>

      {/* materials-section (§3.5) */}
      <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
        <h4 className="mb-2 text-sm font-extrabold text-amber-900">🧺 {fr ? "Matériel nécessaire" : "Materials Needed"}</h4>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {(fr ? lesson.materials.requiredFr : lesson.materials.required).map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 rounded-lg bg-amber-50/70 px-2.5 py-1.5 text-xs font-semibold text-amber-900">
              <span aria-hidden>✓</span> {item}
            </li>
          ))}
        </ul>
        {(fr ? lesson.materials.optionalFr : lesson.materials.optional).length > 0 && (
          <p className="mt-2 text-[11px] text-amber-600">
            ✨ {fr ? "Optionnel" : "Optional"}: {(fr ? lesson.materials.optionalFr : lesson.materials.optional).join(" · ")}
          </p>
        )}
      </div>

      {/* steps-section (§3.5) */}
      <div className="space-y-2.5" role="list" aria-label={fr ? "Étapes" : "Steps"}>
        {lesson.steps.map((s, i) => {
          const done = completedSteps.includes(i);
          const active = i === currentStep && !done;
          return (
            <div
              key={i}
              role="listitem"
              className={cn(
                "rounded-2xl border-2 p-3 transition-all",
                done ? "border-lime-300 bg-lime-50/70" : active ? "border-orange-400 bg-white shadow-sm" : "border-amber-100 bg-white/60 opacity-80"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                  done ? "bg-lime-600 text-white" : active ? "bg-orange-600 text-white" : "bg-amber-200 text-amber-800"
                )}>
                  {done ? "✓" : s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-bold leading-snug", done ? "text-lime-900" : "text-amber-900")}>
                    {fr ? s.instructionFr : s.instruction}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => playGuide(i)}
                      className="min-h-[30px] rounded-full bg-orange-100 px-3 text-[11px] font-extrabold text-orange-800 hover:bg-orange-200"
                      aria-label={fr ? "Écouter le guide" : "Listen to voice guide"}
                    >
                      {speakingStep === i ? "⏸ …" : "🔊"} {fr ? "Écouter" : "Listen"}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-500">⏱ {s.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => markComplete(i)}
                  className={cn(
                    "min-h-[34px] shrink-0 rounded-full border-2 px-3 text-[11px] font-extrabold transition-all",
                    done ? "border-lime-500 bg-lime-600 text-white" : "border-orange-300 bg-white text-orange-700 hover:border-orange-500"
                  )}
                  aria-pressed={done}
                >
                  {done ? "✓" : fr ? "Fait" : "Done"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* dialogue_script — role-play lines playable with character voices */}
      {lesson.dialogue_script && Object.keys(lesson.dialogue_script).length > 0 && (
        <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-4">
          <h4 className="mb-2 text-sm font-extrabold text-purple-900">🎭 {fr ? "Scénario de jeu de rôle" : "Role-play dialogue"}</h4>
          <div className="space-y-2">
            {Object.entries(lesson.dialogue_script).map(([key, d]) => (
              <div key={key} className="rounded-xl bg-white p-2.5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-purple-500">{key}</p>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => playDialogueLine("child", d.child, d.childFr)} className="flex items-start gap-2 rounded-lg bg-purple-600 px-2.5 py-1.5 text-left text-xs font-semibold text-white hover:bg-purple-700">
                    <span aria-hidden>🧒🏾</span> {fr ? d.childFr || d.child : d.child || d.childFr}
                  </button>
                  <button onClick={() => playDialogueLine("adult", d.adult, d.adultFr)} className="flex items-start gap-2 rounded-lg bg-amber-100 px-2.5 py-1.5 text-left text-xs font-semibold text-amber-900 hover:bg-amber-200">
                    <span aria-hidden>🧑🏾</span> {fr ? d.adultFr || d.adult : d.adult || d.adultFr}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* assessment + extension */}
      {!compact && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
            <h4 className="mb-1.5 text-xs font-extrabold text-sky-900">📋 {fr ? "Évaluation" : "Assessment"}</h4>
            <ul className="space-y-1 text-xs text-sky-900">
              {(fr ? lesson.assessment.criteriaFr : lesson.assessment.criteria).map((c, i) => <li key={i}>✓ {c}</li>)}
            </ul>
            <p className="mt-1.5 text-[10px] font-semibold text-sky-600">{lesson.assessment.method}</p>
          </div>
          <div className="rounded-2xl border-2 border-lime-200 bg-lime-50/60 p-4">
            <h4 className="mb-1.5 text-xs font-extrabold text-lime-900">🚀 {fr ? "Pour aller plus loin" : "Extension"}</h4>
            <p className="text-xs text-lime-900">{fr ? lesson.extensionFr : lesson.extension}</p>
            <p className="mt-2 text-[11px] font-bold text-lime-800">📸 {fr ? lesson.gamification.photo_challengeFr : lesson.gamification.photo_challenge}</p>
          </div>
        </div>
      )}

      {/* diy-reward (§3.5) */}
      <div className={cn(
        "rounded-2xl border-2 p-4 text-center transition-all",
        allDone ? "border-lime-400 bg-gradient-to-br from-lime-50 to-white shadow" : "border-dashed border-amber-300 bg-amber-50/50"
      )}>
        {allDone ? (
          <>
            <p className="text-2xl" aria-hidden>🎉</p>
            <p className="text-sm font-bold text-lime-900">{fr ? "Toutes les étapes terminées !" : "All steps complete!"}</p>
            {onComplete && (
              <Button
                onClick={onComplete}
                className="mt-2 h-12 bg-lime-700 px-6 text-base font-extrabold hover:bg-lime-800"
              >
                🎙️ {completeLabel || (fr ? "Pratique vocale →" : "Voice Practice →")}
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-amber-700">{fr ? "Termine toutes les étapes pour gagner :" : "Complete all steps to earn:"}</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900">🏅 {lesson.gamification.badge_name}</span>
              <span className="rounded-full bg-lime-200 px-3 py-1 text-xs font-extrabold text-lime-900">+{lesson.gamification.xp_points} XP</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
