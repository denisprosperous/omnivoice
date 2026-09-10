"use client";
// ============================================================================
// LESSON PLAYER — 5-phase bite-sized voice-first lesson (Master Prompt v2.0 §5.3)
// Voice Hook (multilingual: en/fr/bkm/lns/byv) → Listen & Learn → Speak &
// Practice (tone-aware ASR eval for Grassfields languages) → Apply & Create
// (STS role-play, code-switching welcome) → Celebrate (badge + makossa).
// Gamification per phase. Grassfields language packs surfaced offline.
// v3.0: Bayangi (byv) wired end-to-end with Directive 9 placeholder states —
// undocumented content renders a data-collection notice, never fake audio.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, CharacterBubble, MicButton, Spinner, StatPill } from "./shared";
import { getCharacter } from "@/lib/characters";
import { VOICE_LANGUAGES, isGrassfields, isPlaceholderPhrase } from "@/lib/data/grassfields";
import { WavRecorder, speak, playWavBase64, transcribe, speakFallback } from "@/lib/voice-client";
import { trackEvent } from "@/lib/analytics";
import { playCorrect, playIncorrect, playBadge, playCelebration, playLevelUp, playXp, startAmbient, stopAmbient } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { DIYLessonCard } from "./diy-lesson-card";
import type { ExtendedLesson } from "@/lib/data/lessons";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

interface PracticePrompt { prompt: string; promptFr?: string; promptBkm?: string; promptLns?: string; promptByv?: string; target: string; targetBkm?: string; targetLns?: string; targetByv?: string; evaluation: string; kind?: string }
interface LessonPlanData {
  lesson_id: string; subject: string; level: string; isced_level: number;
  integrated_learning_theme: string; sub_theme: string; week: number; month: number;
  cefr_alignment: string; ib_learner_profile: string[]; supported_languages?: string[];
  expected_learning_outcomes: string[]; teaching_strategies: string[];
  didactic_materials: { physical: string[]; digital: string[] };
  voice_assets: {
    hook: { character: string; text: string; textFr: string; textBkm?: string; textLns?: string; textByv?: string; languages: string[] };
    instruction: { text: string; textFr: string; textBkm?: string; textLns?: string; textByv?: string };
    learn_content: { title: string; titleFr: string; lines: string[]; linesFr: string[]; visual: string };
    practice_prompts: PracticePrompt[];
    feedback: { correct: string; incorrect: string; encouragement: string };
    celebration: { character: string; text: string; textFr: string };
    background_music: string;
  };
  voice_interactions: Array<{ type: string; prompt: string; asr_target?: string; evaluation_criteria: string[] }>;
  sts_scenario?: { description: string; descriptionFr: string; character: string; opener: string };
  gamification: {
    mechanics: string[]; xp_points: number; badge_name: string; badge_code: string;
    voice_challenge: { description: string; descriptionFr: string; descriptionBkm?: string; descriptionLns?: string; descriptionByv?: string; evaluation: string };
  };
  activities: Array<{ phase: string; duration: string; description: string; descriptionFr: string }>;
  assessment: { criteria: string[]; methods: string[] };
  offline_capability: { downloadable: boolean; size_mb: number; components: string[]; grassfields_language_packs?: { bkm: string; lns: string; byv?: string } };
  differentiation: string[];
  cultural_notes: string; cultural_notesFr: string;
  native_speaker_review?: string;
}
const PHASES = ["hook", "listen", "speak", "apply", "celebrate"] as const;
type Phase = (typeof PHASES)[number];
// v4.0 §4.1 — every lesson has THREE components: Digital Lesson, DIY
// Practical, Voice Practice. The 5 phases run inside the Digital component;
// DIY and Voice Practice are extension stages.
const STAGES = ["digital", "diy", "voice_practice"] as const;
type Stage = (typeof STAGES)[number];

interface ExtendedLessonLite extends Omit<ExtendedLesson, "diy"> {
  diy?: ExtendedLesson["diy"];
}

export function LessonPlayer() {
  const { learner, lang, voiceLang, currentLessonId, setView } = useApp();
  const [plan, setPlan] = React.useState<LessonPlanData | null>(null);
  const [extended, setExtended] = React.useState<ExtendedLessonLite | null>(null);
  const [stage, setStage] = React.useState<Stage>("digital"); // v4.0 component stage
  const [loading, setLoading] = React.useState(true);
  const [phase, setPhase] = React.useState<Phase>("hook");
  const [hookDone, setHookDone] = React.useState(false);
  // Hook listening language (§7.3: learner may hear the hook in en/fr/bkm/lns/byv)
  const [hookLang, setHookLang] = React.useState<string>("en");

  // Practice state
  const [promptIdx, setPromptIdx] = React.useState(0);
  const [recording, setRecording] = React.useState(false);
  const [evaluating, setEvaluating] = React.useState(false);
  const [result, setResult] = React.useState<{ verdict: string; accuracy: number; message: string; transcription: string; toneAccuracy?: number | null; toneAware?: boolean } | null>(null);
  const [stars, setStars] = React.useState(0);
  const [scores, setScores] = React.useState<number[]>([]);
  const recorderRef = React.useRef<WavRecorder | null>(null);
  const recordStartRef = React.useRef<number>(0);

  // Apply (STS) state
  const [stsHistory, setStsHistory] = React.useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [stsBusy, setStsBusy] = React.useState(false);
  const [stsOpened, setStsOpened] = React.useState(false);

  // Celebrate state
  const [awarded, setAwarded] = React.useState<{ xp: number; badge: string | null; levelUp: { level: number; title: string } | null } | null>(null);
  // v4.0 — DIY + Voice Practice state
  const [diyAwarded, setDiyAwarded] = React.useState<{ xp: number; badge: string | null } | null>(null);
  const [vpScenario, setVpScenario] = React.useState(0);
  const [vpDone, setVpDone] = React.useState<number[]>([]);
  const [vpAwarded, setVpAwarded] = React.useState<{ xp: number; bonus: number; badges: string[] } | null>(null);

  React.useEffect(() => {
    if (!currentLessonId) return;
    setLoading(true);
    fetch(`/api/lessons?id=${currentLessonId}`)
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.lesson?.plan || null);
        setExtended(d.extended || null); // §4.2 extended_lesson (DIY + Voice Practice)
      })
      .finally(() => setLoading(false));
  }, [currentLessonId]);

  // Default the hook language to the learner's chosen voice language when available (§7.3)
  React.useEffect(() => {
    if (!plan) return;
    const h = plan.voice_assets.hook;
    const available = (h.languages || ["en", "fr"]).filter((l) =>
      l === "bkm" ? !!h.textBkm : l === "lns" ? !!h.textLns : l === "byv" ? !!h.textByv : true
    );
    setHookLang(available.includes(voiceLang) ? voiceLang : "en");
  }, [plan, voiceLang]);

  // Ambient background music per ILT mood (stipulated per-ILT BGM)
  React.useEffect(() => {
    startAmbient("home"); // Month 1 = The Home mood
    return () => stopAmbient();
  }, []);

  async function finishLesson() {
    if (!learner || !plan) return;
    const total = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 80;
    // v3.0 §5.1 — lesson completion rate (pedagogical effectiveness metric)
    trackEvent("lesson_completion", { lessonId: plan.lesson_id, voiceLang, avgScore: total });
    try {
      const res = await fetch("/api/learner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: learner.id,
          xp: plan.gamification.xp_points,
          reason: `Lesson: ${plan.lesson_id}`,
          badgeCode: plan.gamification.badge_code,
          skillCode: undefined,
          assessment: {
            lessonId: plan.lesson_id,
            type: "formative",
            score: total,
            details: { scores, stars },
          },
        }),
      });
      const data = await res.json();
      setAwarded({
        xp: plan.gamification.xp_points,
        badge: data.badge ? plan.gamification.badge_name : null,
        levelUp: data.levelUp ? { level: data.levelUp.level, title: data.levelUp.title } : null,
      });
    } catch {
      setAwarded({ xp: plan.gamification.xp_points, badge: null, levelUp: null });
    }
  }

  // ---- v4.0 component award engine (§4.2 gamification: digital 50 + DIY 30 +
  // voice practice 20 = total 100 XP, streak_bonus 20) ----
  async function awardComponent(opts: {
    xp: number; badgeCode: string | null; reason: string;
    assessment?: { lessonId: string; type: string; score: number; details: Record<string, unknown> };
  }): Promise<{ badge: boolean | null; badgeName: string | null }> {
    if (!learner) return { badge: null, badgeName: null };
    try {
      const res = await fetch("/api/learner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: learner.id,
          xp: opts.xp,
          reason: opts.reason,
          badgeCode: opts.badgeCode || undefined,
          ...(opts.assessment ? { assessment: opts.assessment } : {}),
        }),
      });
      const data = await res.json();
      return { badge: !!data.badge, badgeName: data.badge?.nameEn || null };
    } catch {
      return { badge: null, badgeName: null };
    }
  }

  async function completeDiy() {
    if (!extended?.diy || !plan) return;
    playBadge();
    trackEvent("diy_completion", { diyId: extended.diy.id, linkedLesson: plan.lesson_id, awarded: true });
    const r = await awardComponent({
      xp: extended.diy.gamification.xp_points,
      badgeCode: extended.diy.gamification.badge_code,
      reason: `DIY Practical: ${extended.diy.title}`,
      assessment: { lessonId: plan.lesson_id, type: "practical", score: 100, details: { diyId: extended.diy.id } },
    });
    setDiyAwarded({ xp: extended.diy.gamification.xp_points, badge: r.badgeName || extended.diy.gamification.badge_name });
    setStage("voice_practice");
  }

  function vpScenarioText(i: number): string {
    const vp = extended?.components.voice_practice;
    if (!vp) return "";
    return lang === "fr" ? vp.scenariosFr[i] || vp.scenarios[i] : vp.scenarios[i];
  }

  async function vpStart() {
    if (stsBusy) return;
    setStsBusy(true);
    try {
      recorderRef.current = new WavRecorder();
      await recorderRef.current.start();
      setRecording(true);
    } catch {
      setStsBusy(false);
    }
  }

  async function vpStop() {
    if (!recorderRef.current || stsBusy) return;
    setRecording(false);
    setStsBusy(true);
    const { wavBase64 } = recorderRef.current.stop();
    const vp = extended?.components.voice_practice;
    const scenario = vpScenarioText(vpScenario) || "Friendly conversation practice";
    const character = vp?.character || plan?.sts_scenario?.character || "kwe";
    trackEvent("voice_practice_turn", { lessonId: plan?.lesson_id, scenario: vpScenario + 1, character });
    try {
      const res = await fetch("/api/sts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: wavBase64,
          character,
          scenario: `${scenario} (voice practice, progressive difficulty)`,
          history: stsHistory,
          learnerName: learner?.name || "my friend",
          learnerLevel: plan?.level || "Class 3",
          lang: isGrassfields(voiceLang) ? voiceLang : lang === "fr" ? "fr" : "en",
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setStsHistory((h) => [
          ...h,
          { role: "user", content: data.transcript || "…" },
          { role: "assistant", content: data.reply },
        ]);
        if (data.audioBase64) playWavBase64(data.audioBase64, data.pitchRate || 1);
        else void speak(data.reply, character, lang);
        playXp();
        // scenario complete — advance (progressive difficulty per §4.2)
        const done = vpDone.includes(vpScenario) ? vpDone : [...vpDone, vpScenario];
        setVpDone(done);
        if (done.length >= (vp?.scenarios.length || 1) && !vpAwarded) {
          await completeVoicePractice(done);
        } else {
          const nextIdx = vp?.scenarios.findIndex((_, i) => !done.includes(i));
          if (typeof nextIdx === "number" && nextIdx >= 0) setVpScenario(nextIdx);
        }
      } else if (data.error === "no_speech") {
        const msg = lang === "fr" ? "Je ne t'ai pas entendu — essaie encore !" : "I did not hear you — try again!";
        setStsHistory((h) => [...h, { role: "assistant", content: msg }]);
        void speak(msg, character, lang);
      }
    } catch {
      const msg = lang === "fr" ? "Hmm, réessayons dans un instant." : "Hmm, let us try again in a moment.";
      setStsHistory((h) => [...h, { role: "assistant", content: msg }]);
    } finally {
      setStsBusy(false);
    }
  }

  async function completeVoicePractice(doneList: number[]) {
    if (!plan) return;
    playBadge();
    trackEvent("voice_practice_completion", { lessonId: plan.lesson_id, scenarios: doneList.length });
    // +20 XP (voice practice) + Voice Champion badge + streak_bonus 20 (§4.2)
    const r = await awardComponent({
      xp: 20,
      badgeCode: "voice-champion",
      reason: "Voice Practice complete",
      assessment: { lessonId: plan.lesson_id, type: "oral", score: 90, details: { mode: "speech_to_speech", scenarios: doneList.length } },
    });
    await awardComponent({ xp: 20, badgeCode: null, reason: "Extended lesson streak bonus" });
    trackEvent("extended_lesson_complete", { lessonId: plan.lesson_id, totalXp: 100 });
    const badgeNames = [
      plan.gamification.badge_name,
      extended?.diy?.gamification.badge_name,
      "Voice Champion",
    ].filter(Boolean) as string[];
    setVpAwarded({ xp: 20, bonus: 20, badges: badgeNames });
    playCelebration();
  }

  if (loading) return <div className="min-h-screen bg-[#FFFBEB]"><PatternBand /><Spinner label={lang === "fr" ? "Chargement de la quête..." : "Loading quest..."} /></div>;
  if (!plan) {
    return (
      <div className="min-h-screen bg-[#FFFBEB]">
        <PatternBand />
        <div className="p-8 text-center text-amber-800">{lang === "fr" ? "Leçon introuvable." : "Lesson not found."}</div>
      </div>
    );
  }

  const va = plan.voice_assets;
  const shown = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const prompts = va.practice_prompts;
  // §7.3 — resolve the practice prompt in the learner's voice language
  const promptForVoice = (pp: PracticePrompt): { prompt: string; target: string; isGf: boolean } => {
    if (voiceLang === "bkm" && pp.promptBkm) return { prompt: pp.promptBkm, target: pp.targetBkm || pp.target, isGf: true };
    if (voiceLang === "lns" && pp.promptLns) return { prompt: pp.promptLns, target: pp.targetLns || pp.target, isGf: true };
    if (voiceLang === "byv" && pp.promptByv) return { prompt: pp.promptByv, target: pp.targetByv || pp.target, isGf: true };
    return { prompt: lang === "fr" ? pp.promptFr || pp.prompt : pp.prompt, target: pp.target, isGf: false };
  };
  const currentPrompt = prompts[promptIdx];
  const activePrompt = currentPrompt ? promptForVoice(currentPrompt) : null;
  const char = getCharacter(va.hook.character);
  // §7.3 multilingual hook — hook text in the selected listening language
  const hookText =
    hookLang === "fr" ? va.hook.textFr
    : hookLang === "bkm" ? (va.hook.textBkm || va.hook.text)
    : hookLang === "lns" ? (va.hook.textLns || va.hook.text)
    : hookLang === "byv" ? (va.hook.textByv || va.hook.text)
    : va.hook.text;
  const hookIsPlaceholder = isPlaceholderPhrase(hookText);
  const hookLanguages = (va.hook.languages || ["en", "fr"]).filter((l) =>
    l === "bkm" ? !!va.hook.textBkm : l === "lns" ? !!va.hook.textLns : l === "byv" ? !!va.hook.textByv : l === "ewo" ? true : true
  );

  // ---------- Practice handlers ----------
  async function startRecording() {
    setResult(null);
    recordStartRef.current = Date.now();
    try {
      recorderRef.current = new WavRecorder();
      await recorderRef.current.start();
      setRecording(true);
    } catch {
      playIncorrect();
      setResult({
        verdict: "retry", accuracy: 0,
        message: lang === "fr"
          ? "Je ne peux pas accéder au micro. Demande à un adulte d'autoriser le microphone, puis réessaie !"
          : "I cannot reach the microphone. Ask a grown-up to allow the microphone, then try again!",
        transcription: "—",
      });
    }
  }

  async function stopRecording() {
    if (!recorderRef.current || !activePrompt) return;
    setRecording(false);
    const heldMs = Date.now() - (recordStartRef.current || 0);
    // v3.0 fix — ASR providers reject clips below their minimum duration;
    // a too-short tap must produce supportive feedback, never a NaN score.
    if (heldMs < 700) {
      recorderRef.current.stop();
      playIncorrect();
      setResult({
        verdict: "retry", accuracy: 0,
        message: lang === "fr"
          ? "Trop court ! Maintiens le bouton et dis toute la phrase. 🎤"
          : "Too short! Hold the button and say the whole phrase. 🎤",
        transcription: "—",
      });
      return;
    }
    setEvaluating(true);
    const { wavBase64 } = recorderRef.current.stop();
    // v3.0 §5.1 — ASR attempts (voice interaction tracking)
    trackEvent("asr_attempt", { lessonId: plan?.lesson_id, lang: activePrompt?.isGf ? voiceLang : lang === "fr" ? "fr" : "en" });
    try {
      const res = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: wavBase64, target: activePrompt.target, lang: activePrompt.isGf ? voiceLang : lang === "fr" ? "fr" : "en" }),
      });
      if (!res.ok) throw new Error("evaluation unavailable");
      const data = await res.json();
      const accuracy = typeof data.accuracy === "number" && Number.isFinite(data.accuracy) ? data.accuracy : 0;
      const r = {
        verdict: data.verdict as string,
        accuracy,
        message: lang === "fr" ? data.messageFr : data.message,
        transcription: data.transcription || "",
        toneAccuracy: (data.tone_accuracy ?? null) as number | null,
        toneAware: !!data.tone_aware,
      };
      setResult(r);
      setScores((s) => [...s, r.accuracy]);
      if (r.verdict === "correct") { playCorrect(); setStars((v) => v + 3); }
      else if (r.verdict === "close") { playXp(); setStars((v) => v + 2); }
      else playIncorrect();
    } catch {
      // Offline / API failure → gentle supportive feedback (never punitive)
      setResult({
        verdict: "close", accuracy: 60,
        message: lang === "fr" ? "Je n'ai pas pu évaluer maintenant. Essaie encore !" : "I could not evaluate just now. Try again!",
        transcription: "",
      });
      playIncorrect();
    } finally {
      setEvaluating(false);
    }
  }

  async function nextPrompt() {
    if (promptIdx < prompts.length - 1) {
      setPromptIdx((i) => i + 1);
      setResult(null);
    } else {
      setPhase("apply");
    }
  }

  // ---------- STS handlers ----------
  async function openSts() {
    if (!plan?.sts_scenario || stsOpened) return;
    setStsOpened(true);
    setStsBusy(true);
    const opener = plan.sts_scenario.opener;
    setStsHistory([{ role: "assistant", content: opener }]);
    void speak(opener, plan.sts_scenario.character, lang);
    setTimeout(() => setStsBusy(false), 2500);
  }

  async function stsTurn() {
    if (!plan?.sts_scenario || stsBusy) return;
    setStsBusy(true);
    try {
      recorderRef.current = new WavRecorder();
      await recorderRef.current.start();
      setRecording(true);
    } catch {
      setStsBusy(false);
    }
  }

  async function stsStop() {
    if (!recorderRef.current || !plan?.sts_scenario) return;
    setRecording(false);
    setStsBusy(true);
    const { wavBase64 } = recorderRef.current.stop();
    try {
      const res = await fetch("/api/sts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: wavBase64,
          character: plan.sts_scenario.character,
          scenario: plan.sts_scenario.description,
          history: stsHistory,
          learnerName: learner?.name || "my friend",
          learnerLevel: plan.level,
          lang: isGrassfields(voiceLang) ? voiceLang : lang === "fr" ? "fr" : "en",
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setStsHistory((h) => [
          ...h,
          { role: "user", content: data.transcript || "…" },
          { role: "assistant", content: data.reply },
        ]);
        if (data.audioBase64) playWavBase64(data.audioBase64, data.pitchRate || 1);
        else void speak(data.reply, plan.sts_scenario.character, lang);
        playXp();
      } else if (data.error === "no_speech") {
        const msg = lang === "fr" ? "Je ne t'ai pas entendu — essaie encore !" : "I did not hear you — try again!";
        setStsHistory((h) => [...h, { role: "assistant", content: msg }]);
        void speak(msg, plan.sts_scenario.character, lang);
      }
    } catch {
      const msg = lang === "fr" ? "Hmm, réessayons dans un instant." : "Hmm, let us try again in a moment.";
      setStsHistory((h) => [...h, { role: "assistant", content: msg }]);
    } finally {
      setStsBusy(false);
    }
  }

  const phaseMeta: Record<Phase, { label: string; icon: string }> = {
    hook: { label: t("hook", lang), icon: "🎣" },
    listen: { label: t("listen", lang), icon: "👂🏾" },
    speak: { label: t("speak", lang), icon: "🎤" },
    apply: { label: t("apply", lang), icon: "✨" },
    celebrate: { label: t("celebrate", lang), icon: "🎉" },
  };

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-28">
      <PatternBand />
      {/* Progress header — v4.0: three components (§4.1) each carrying the digital 5 phases */}
      <div className="sticky top-[52px] z-30 border-b border-amber-200 bg-[#FFFBEB]/95 backdrop-blur">
        {stage === "digital" ? (
          <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-3 py-2">
            {PHASES.map((p, i) => (
              <React.Fragment key={p}>
                <button
                  onClick={() => { if (PHASES.indexOf(phase) > i) setPhase(p); }}
                  className={cn(
                    "flex min-h-[34px] items-center gap-1 rounded-full border-2 px-2.5 text-[11px] font-bold transition-all sm:text-xs",
                    phase === p ? "border-amber-600 bg-amber-600 text-white shadow" : "border-amber-200 bg-white text-amber-700"
                  )}
                  aria-current={phase === p ? "step" : undefined}
                >
                  <span aria-hidden>{phaseMeta[p].icon}</span>
                  <span className="hidden sm:inline">{phaseMeta[p].label}</span>
                </button>
                {i < PHASES.length - 1 && <span className="h-0.5 flex-1 bg-amber-200" aria-hidden />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-3 py-2">
            {STAGES.map((s, i) => {
              const done = (s === "digital" && !!awarded) || (s === "diy" && !!diyAwarded) || (s === "voice_practice" && !!vpAwarded);
              const meta = s === "digital" ? { icon: "💻", label: t("digitalLesson", lang) } : s === "diy" ? { icon: "🔨", label: t("diyPractical", lang) } : { icon: "🎙️", label: t("voicePractice", lang) };
              return (
                <React.Fragment key={s}>
                  <button
                    onClick={() => { if (STAGES.indexOf(stage) > i) { setStage(s); if (s === "digital") setPhase("celebrate"); } }}
                    className={cn(
                      "flex min-h-[34px] items-center gap-1 rounded-full border-2 px-2.5 text-[11px] font-bold transition-all sm:text-xs",
                      stage === s ? "border-orange-600 bg-orange-600 text-white shadow" : "border-orange-200 bg-white text-orange-700"
                    )}
                    aria-current={stage === s ? "step" : undefined}
                  >
                    <span aria-hidden>{done ? "✓" : meta.icon}</span>
                    <span className="hidden sm:inline">{meta.label}</span>
                  </button>
                  {i < STAGES.length - 1 && <span className="h-0.5 flex-1 bg-orange-200" aria-hidden />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-4">
        {/* Lesson meta */}
        <div className="flex flex-wrap items-center gap-2">
          <StatPill icon="📚" label={plan.subject} value={plan.level} />
          <StatPill icon="🌍" label="CEFR" value={plan.cefr_alignment} color="#065F46" />
          <StatPill icon="🎯" label="XP" value={`+${plan.gamification.xp_points}`} color="#9D174D" />
          {plan.gamification.mechanics.map((m) => (
            <StatPill key={m} icon="🎮" label="mechanic" value={m} color="#7C2D12" />
          ))}
        </div>

        {/* PHASE 1 — Voice Hook (multilingual per §7.3) — Digital component */}
        {stage === "digital" && phase === "hook" && (
          <section aria-label={phaseMeta.hook.label} className="space-y-4">
            <h1 className="text-xl font-extrabold text-amber-900 sm:text-2xl">
              {shown(va.learn_content.title, va.learn_content.titleFr)}
            </h1>
            {/* Hook language switcher — listen in en/fr/bkm/lns (§7.3 voice hook) */}
            {hookLanguages.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-lime-200 bg-lime-50/60 p-2">
                <span className="px-1 text-[11px] font-bold uppercase tracking-wide text-lime-800">🪶 {t("hookLanguage", lang)}:</span>
                {hookLanguages.map((l) => {
                  const vl = VOICE_LANGUAGES.find((v) => v.id === l);
                  return (
                    <button
                      key={l}
                      onClick={() => setHookLang(l)}
                      aria-pressed={hookLang === l}
                      className={cn(
                        "min-h-[32px] rounded-full border-2 px-2.5 text-[11px] font-bold transition-all",
                        hookLang === l ? "border-lime-700 bg-lime-700 text-white" : "border-lime-300 bg-white text-lime-800 hover:border-lime-500"
                      )}
                    >
                      {vl ? vl.label : l}
                    </button>
                  );
                })}
              </div>
            )}
            {hookIsPlaceholder ? (
              // v3.0 Directive 9 gate — Bayangi placeholder: documented-by-natives notice,
              // never synthesized placeholder audio.
              <div className="rounded-2xl border-2 border-dashed border-lime-400 bg-lime-50/80 p-4" role="status">
                <p className="text-sm font-extrabold text-lime-900">🪶 Bayangi (Banyangi) — {t("pendingDocumentation", lang)}</p>
                <p className="mt-1 text-xs leading-relaxed text-lime-800">{hookText}</p>
                <p className="mt-2 text-[11px] font-semibold text-lime-700">
                  ⏳ {t("dataCollection", lang)}: 500h · SIL Cameroon / Local Community · Q2 2025
                </p>
              </div>
            ) : (
              <CharacterBubble
                characterId={va.hook.character}
                text={hookText}
                textFr={hookText}
                lang={hookLang === "fr" ? "fr" : "en"}
                speakLang={hookLang}
                onSpeakDone={() => setHookDone(true)}
              />
            )}
            {isGrassfields(hookLang) && (
              <p className="rounded-xl bg-lime-50 px-3 py-2 text-[11px] font-semibold text-lime-900">
                🪶 GACL tone-marked {VOICE_LANGUAGES.find((v) => v.id === hookLang)?.label || hookLang} · {t("codeSwitch", lang)}
                {hookIsPlaceholder && <span className="ml-1">· ⏳ {t("pendingDocumentation", lang)}</span>}
                {!hookIsPlaceholder && plan.native_speaker_review === "validated" && <span className="ml-1">· ✅ {t("nativeReview", lang)}</span>}
              </p>
            )}
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-4">
              <h3 className="mb-1 text-sm font-bold text-amber-900">📖 {lang === "fr" ? "Histoire du thème" : "Theme story"}</h3>
              <p className="text-sm leading-relaxed text-amber-800">
                {shown(plan.cultural_notes, plan.cultural_notesFr)}
              </p>
            </div>
            <Button
              onClick={() => { playXp(); setPhase("listen"); }}
              className="h-14 w-full bg-amber-600 text-lg font-extrabold hover:bg-amber-700"
              size="lg"
            >
              {shown("Begin the quest →", "Commencer la quête →")}
            </Button>
          </section>
        )}

        {/* PHASE 2 — Listen & Learn */}
        {stage === "digital" && phase === "listen" && (
          <section aria-label={phaseMeta.listen.label} className="space-y-4">
            <CharacterBubble
              characterId={va.hook.character}
              text={va.instruction.text}
              textFr={va.instruction.textFr}
              lang={lang === "ewo" ? "en" : lang}
              autoSpeak={false}
              compact
            />
            <div className="rounded-2xl border-2 border-lime-200 bg-gradient-to-br from-lime-50 to-white p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-extrabold text-lime-900">
                {shown(va.learn_content.title, va.learn_content.titleFr)}
              </h3>
              <ul className="space-y-2.5">
                {va.learn_content.lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm">
                    <button
                      onClick={() => void speak(lang === "fr" ? va.learn_content.linesFr[i] || line : line, va.hook.character, lang === "fr" ? "fr" : "en")}
                      className="mt-0.5 shrink-0 rounded-full bg-lime-100 p-1.5 text-lime-700 hover:bg-lime-200"
                      aria-label="Listen to this line"
                    >
                      🔊
                    </button>
                    <span className="text-sm leading-relaxed text-amber-900">
                      {lang === "fr" ? va.learn_content.linesFr[i] || line : line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 text-xs text-amber-700">
              🖼️ <b>{lang === "fr" ? "Visuel" : "Visual"}</b>: {va.learn_content.visual} · 🎵 <b>BGM</b>: {va.background_music}
            </div>
            <Button onClick={() => { playXp(); setPhase("speak"); }} className="h-14 w-full bg-lime-700 text-lg font-extrabold hover:bg-lime-800" size="lg">
              {shown("I am ready to speak →", "Je suis prêt à parler →")}
            </Button>
          </section>
        )}

        {/* PHASE 3 — Speak & Practice (tone-aware ASR per §6.5) */}
        {stage === "digital" && phase === "speak" && activePrompt && (
          <section aria-label={phaseMeta.speak.label} className="space-y-4">
            <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 text-center shadow-sm">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-500">
                {lang === "fr" ? `Invite ${promptIdx + 1} / ${prompts.length}` : `Prompt ${promptIdx + 1} / ${prompts.length}`}
                {activePrompt.isGf && <span className="ml-1 rounded-full bg-lime-100 px-2 py-0.5 text-[10px] text-lime-800">🪶 {VOICE_LANGUAGES.find((v) => v.id === voiceLang)?.label || voiceLang}</span>}
              </div>
              <p className="mb-1 text-xl font-extrabold text-rose-900">
                {activePrompt.prompt}
              </p>
              <p className="text-sm font-semibold text-rose-600/80">
                {lang === "fr" ? "Objectif" : "Target"}: “{activePrompt.target}”
              </p>

              {isPlaceholderPhrase(activePrompt.prompt) ? (
                // v3.0 Directive 9 gate — Bayangi practice placeholder: no synthetic
                // evaluation of undocumented phrases; learner is routed to an attested language.
                <div className="my-5 rounded-xl border-2 border-dashed border-lime-400 bg-lime-50/80 p-4 text-left" role="status">
                  <p className="text-sm font-bold text-lime-900">⏳ {t("pendingDocumentation", lang)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-lime-800">{activePrompt.prompt}</p>
                  <p className="mt-2 text-[11px] font-semibold text-lime-700">
                    📋 {t("dataCollection", lang)}: 500h · SIL Cameroon / Local Community · Q2 2025
                  </p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" className="h-9 bg-lime-700 text-white hover:bg-lime-800" onClick={nextPrompt}>
                      {promptIdx < prompts.length - 1 ? `${t("next", lang)} →` : `${t("apply", lang)} →`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="my-5 flex flex-col items-center gap-2">
                  <MicButton
                    recording={recording}
                    disabled={evaluating}
                    onDown={startRecording}
                    onUp={stopRecording}
                    label={recording ? t("stop", lang) : t("holdToTalk", lang)}
                  />
                  <span className="text-xs font-semibold text-rose-500">
                    {recording ? t("speakNow", lang) : evaluating ? t("listening", lang) : t("holdToTalk", lang)}
                  </span>
                </div>
              )}

              {result && (
                <div
                  className={cn(
                    "mx-auto max-w-md rounded-xl border-2 p-3 text-left text-sm",
                    result.verdict === "correct" ? "border-lime-300 bg-lime-50 text-lime-900" : "border-amber-300 bg-amber-50 text-amber-900"
                  )}
                  role="status"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <b>{result.verdict === "correct" ? `✨ ${t("correct", lang)}` : result.verdict === "close" ? `👍 ${t("wellDone", lang)}` : `🥁 ${t("tryAgain", lang)}`}</b>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold">{result.accuracy}%</span>
                  </div>
                  <p>{result.message}</p>
                  {result.toneAware && typeof result.toneAccuracy === "number" && (
                    <p className="mt-1 text-xs font-bold text-lime-800">
                      🪶 {t("toneAccuracy", lang)}: {result.toneAccuracy}%
                    </p>
                  )}
                  <p className="mt-1 text-xs opacity-70">
                    ASR: “{result.transcription || "—"}” → {lang === "fr" ? "cible" : "target"}: “{activePrompt.target}”
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-9 border-rose-300 text-rose-700" onClick={() => setResult(null)}>
                      🔄 {t("tryAgain", lang)}
                    </Button>
                    <Button size="sm" className="h-9 bg-lime-700 text-white hover:bg-lime-800" onClick={nextPrompt}>
                      {promptIdx < prompts.length - 1 ? `${t("next", lang)} →` : `${t("apply", lang)} →`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center text-2xl" aria-hidden aria-label={`${stars} stars`}>
              {"⭐".repeat(Math.min(stars, 12)) || "🎤"}
            </div>
          </section>
        )}

        {/* PHASE 4 — Apply & Create (STS role-play) */}
        {stage === "digital" && phase === "apply" && (
          <section aria-label={phaseMeta.apply.label} className="space-y-4">
            {plan.sts_scenario ? (
              <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
                <h3 className="mb-1 text-lg font-extrabold text-purple-900">
                  🎭 {t("speakingQuest", lang)}
                </h3>
                <p className="mb-3 text-sm text-purple-800">
                  {shown(plan.sts_scenario.description, plan.sts_scenario.descriptionFr)}
                </p>
                {!stsOpened ? (
                  <Button onClick={openSts} className="h-13 w-full bg-purple-700 text-base font-extrabold hover:bg-purple-800" size="lg">
                    ▶ {t("greetKwe", lang)} {getCharacter(plan.sts_scenario.character).name} {getCharacter(plan.sts_scenario.character).emoji}
                  </Button>
                ) : (
                  <>
                    <div className="mb-3 max-h-64 space-y-2 overflow-y-auto rounded-xl bg-white p-3" role="log" aria-live="polite">
                      {stsHistory.map((h, i) => (
                        <div key={i} className={cn("flex", h.role === "user" ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                              h.role === "user" ? "bg-purple-600 text-white" : "bg-amber-100 text-amber-900"
                            )}
                          >
                            {h.content}
                          </div>
                        </div>
                      ))}
                      {stsBusy && <Spinner label={t("listening", lang)} />}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <MicButton
                        recording={recording}
                        disabled={stsBusy}
                        onDown={stsTurn}
                        onUp={stsStop}
                        label={recording ? t("stop", lang) : t("holdToTalk", lang)}
                      />
                      <span className="text-xs font-semibold text-purple-500">
                        {recording ? t("speakNow", lang) : stsBusy ? t("listening", lang) : t("holdToTalk", lang)}
                      </span>
                    </div>
                    <Button variant="outline" className="mt-3 w-full border-purple-300 text-purple-800" onClick={() => { playXp(); setPhase("celebrate"); }}>
                      {t("complete", lang)} → 🎉
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-purple-200 bg-white p-5 text-center">
                {voiceLang === "byv" && plan.gamification.voice_challenge.descriptionByv && isPlaceholderPhrase(plan.gamification.voice_challenge.descriptionByv) ? (
                  // v3.0 Directive 9 gate — Bayangi voice challenge pending documentation
                  <div role="status">
                    <p className="mb-3 text-sm font-extrabold text-purple-900">⏳ {t("pendingDocumentation", lang)}</p>
                    <p className="mb-3 text-sm leading-relaxed text-purple-800">{plan.gamification.voice_challenge.descriptionByv}</p>
                    <p className="mb-4 text-[11px] font-semibold text-purple-600">
                      📋 {t("dataCollection", lang)}: 500h · SIL Cameroon / Local Community · Q2 2025
                    </p>
                    <Button onClick={() => { playXp(); setPhase("celebrate"); }} className="h-12 w-full bg-purple-700 text-base font-extrabold hover:bg-purple-800">
                      {t("complete", lang)} →
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-purple-800">
                      {lang === "fr"
                        ? "Défi vocal : enregistre-toi en appliquant ce que tu as appris !"
                        : plan.gamification.voice_challenge.description}
                    </p>
                    <p className="mb-4 text-lg font-extrabold text-purple-900">
                      🎙️ {shown(plan.gamification.voice_challenge.description, plan.gamification.voice_challenge.descriptionFr)}
                    </p>
                    <VoiceChallengeRecorder onDone={() => { playXp(); setPhase("celebrate"); }} lang={lang} />
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {/* PHASE 5 — Celebrate */}
        {stage === "digital" && phase === "celebrate" && !awarded && (
          <section aria-label={phaseMeta.celebrate.label} className="space-y-4 text-center">
            <div className="text-6xl" aria-hidden>🎉</div>
            <CharacterBubble
              characterId={va.celebration.character}
              text={va.celebration.text}
              textFr={va.celebration.textFr}
              lang={lang === "ewo" ? "en" : lang}
              autoSpeak={false}
            />
            <Button
              onClick={async () => { playCelebration(); await finishLesson(); }}
              className="h-16 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-xl font-extrabold hover:from-amber-700 hover:to-orange-700"
              size="lg"
            >
              🏅 {lang === "fr" ? "Réclamer ma récompense" : "Claim my reward"}
            </Button>
          </section>
        )}

        {stage === "digital" && phase === "celebrate" && awarded && (
          <section className="space-y-4 text-center" aria-live="polite">
            <div className="animate-bounce text-7xl" aria-hidden>{awarded.badge ? "🏅" : "⭐"}</div>
            <h2 className="text-2xl font-extrabold text-amber-900">
              +{awarded.xp} XP {awarded.badge && `· ${lang === "fr" ? "Badge débloqué" : "Badge unlocked"}: ${awarded.badge}`}
            </h2>
            {awarded.levelUp && (
              <p className="text-lg font-bold text-orange-700">
                🚀 {lang === "fr" ? "Niveau" : "Level"} {awarded.levelUp.level} — {awarded.levelUp.title}!
              </p>
            )}
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 text-left">
              <h3 className="mb-2 text-sm font-bold text-amber-900">📊 {lang === "fr" ? "Évaluation" : "Assessment"}</h3>
              <ul className="space-y-1 text-xs text-amber-800">
                {plan.assessment.criteria.map((c) => <li key={c}>✓ {c}</li>)}
                <li className="pt-1 font-bold">
                  {lang === "fr" ? "Score ASR moyen" : "Average ASR score"}: {(() => { const ok = scores.filter(Number.isFinite); return ok.length ? Math.round(ok.reduce((a, b) => a + b, 0) / ok.length) : "—"; })()}%
                </li>
              </ul>
              <p className="mt-2 text-[11px] text-amber-600">
                💾 {lang === "fr" ? "Téléchargeable hors ligne" : "Offline downloadable"} · ~{plan.offline_capability.size_mb} MB · {plan.offline_capability.components.join(", ")}
              </p>
              {plan.offline_capability.grassfields_language_packs && (
                <p className="mt-1 text-[11px] font-semibold text-lime-800">
                  🪶 {t("languagePacks", lang)}: {plan.offline_capability.grassfields_language_packs.bkm} · {plan.offline_capability.grassfields_language_packs.lns}
                  {plan.offline_capability.grassfields_language_packs.byv && <> · {plan.offline_capability.grassfields_language_packs.byv}</>}
                </p>
              )}
            </div>
            {/* v4.0 §4.1 — continue to the DIY Practical component */}
            {extended?.diy && (
              <Button
                onClick={() => { playXp(); trackEvent("page_view", { view: "lesson_diy", lessonId: plan.lesson_id }); setStage("diy"); }}
                className="h-14 w-full bg-orange-600 text-lg font-extrabold hover:bg-orange-700"
                size="lg"
              >
                🔨 {t("startDiy", lang)} → +{extended.diy.gamification.xp_points} XP
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="h-12 flex-1 border-amber-300 text-amber-800" onClick={() => { setPhase("hook"); setHookDone(false); setPromptIdx(0); setResult(null); setStsHistory([]); setStsOpened(false); setAwarded(null); setStars(0); setScores([]); setStage("digital"); setDiyAwarded(null); setVpDone([]); setVpScenario(0); setVpAwarded(null); }}>
                🔄 {lang === "fr" ? "Rejouer" : "Replay"}
              </Button>
              <Button className="h-12 flex-1 bg-amber-600 font-extrabold hover:bg-amber-700" onClick={() => { playLevelUp(); setView("learner"); }}>
                🗺️ {t("dashboard", lang)}
              </Button>
            </div>
          </section>
        )}

        {/* ---- v4.0 COMPONENT 2 — DIY Practical (§III / §3.5 DIYLessonCard) ---- */}
        {stage === "diy" && extended?.diy && (
          <section aria-label={t("diyPractical", lang)} className="space-y-4">
            <p className="rounded-2xl border-2 border-orange-200 bg-orange-50/70 p-3 text-center text-sm font-bold text-orange-900">
              🔨 {t("diyIntro", lang)}
            </p>
            {diyAwarded && (
              <div className="rounded-2xl border-2 border-lime-300 bg-lime-50/80 p-3 text-center" role="status">
                <p className="text-sm font-extrabold text-lime-900">
                  +{diyAwarded.xp} XP {diyAwarded.badge && `· ${lang === "fr" ? "Badge débloqué" : "Badge unlocked"}: ${diyAwarded.badge}`}
                </p>
              </div>
            )}
            <DIYLessonCard lesson={extended.diy} lang={lang} onComplete={completeDiy} />
          </section>
        )}

        {/* ---- v4.0 COMPONENT 3 — Voice Practice (§4.2 speech_to_speech) ---- */}
        {stage === "voice_practice" && (
          <section aria-label={t("voicePractice", lang)} className="space-y-4">
            <div className="rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm">
              <h3 className="mb-1 text-lg font-extrabold text-teal-900">🎙️ {t("voicePractice", lang)}</h3>
              <p className="mb-3 text-xs font-semibold text-teal-700">
                {lang === "fr"
                  ? "Conversation speech-to-speech avec ton personnage — prononciation, précision tonale et fluidité évaluées."
                  : "Speech-to-speech conversation with your character — pronunciation, tone accuracy and fluency evaluated."}
              </p>
              {/* §4.2 evaluation block */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["pronunciation", "tone_accuracy", "fluency"].map((k) => (
                  <span key={k} className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    ✓ {k.replace("_", " ")} {t("evaluationOn", lang).toLowerCase()}
                  </span>
                ))}
              </div>
              {/* §4.2 scenarios — progressive difficulty */}
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-600">{t("practiceScenarios", lang)}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(extended?.components.voice_practice.scenarios || [plan.sts_scenario?.description || "Talk with your character"]).map((s, i) => {
                  const done = vpDone.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => { if (!stsBusy) { setVpScenario(i); setStsHistory([]); } }}
                      aria-pressed={vpScenario === i}
                      className={cn(
                        "min-h-[32px] rounded-full border-2 px-2.5 text-[11px] font-bold transition-all",
                        done
                          ? "border-lime-500 bg-lime-600 text-white"
                          : vpScenario === i
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-teal-200 bg-white text-teal-800 hover:border-teal-400"
                      )}
                    >
                      {done ? "✓ " : `${i + 1}. `}{lang === "fr" ? extended?.components.voice_practice.scenariosFr[i] || s : s}
                    </button>
                  );
                })}
              </div>

              {vpAwarded ? (
                // §4.2 gamification — total 100 XP, badges trio, streak bonus 20
                <div className="space-y-3 text-center" aria-live="polite">
                  <div className="animate-bounce text-6xl" aria-hidden>🏆</div>
                  <h4 className="text-xl font-extrabold text-teal-900">🏆 {t("extendedComplete", lang)}</h4>
                  <div className="rounded-2xl border-2 border-lime-300 bg-lime-50/80 p-4 text-left">
                    <p className="mb-2 text-sm font-extrabold text-lime-900">
                      {t("totalXp", lang)}: 100 · {t("streakBonus", lang)}: +{vpAwarded.bonus} XP
                    </p>
                    <p className="mb-1 text-xs font-bold text-lime-800">{lang === "fr" ? "Badges" : "Badges"}:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vpAwarded.badges.map((b) => (
                        <span key={b} className="rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-extrabold text-amber-900">🏅 {b}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-12 flex-1 border-amber-300 text-amber-800" onClick={() => { setPhase("hook"); setHookDone(false); setPromptIdx(0); setResult(null); setStsHistory([]); setStsOpened(false); setAwarded(null); setStars(0); setScores([]); setStage("digital"); setDiyAwarded(null); setVpDone([]); setVpScenario(0); setVpAwarded(null); }}>
                      🔄 {lang === "fr" ? "Rejouer" : "Replay"}
                    </Button>
                    <Button className="h-12 flex-1 bg-amber-600 font-extrabold hover:bg-amber-700" onClick={() => { playLevelUp(); setView("learner"); }}>
                      🗺️ {t("dashboard", lang)}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-xl bg-white p-3" role="log" aria-live="polite">
                    {stsHistory.length === 0 && (
                      <p className="text-center text-xs font-semibold text-teal-600">
                        🎯 {vpScenarioText(vpScenario)}
                      </p>
                    )}
                    {stsHistory.map((h, i) => (
                      <div key={i} className={cn("flex", h.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", h.role === "user" ? "bg-teal-600 text-white" : "bg-amber-100 text-amber-900")}>
                          {h.content}
                        </div>
                      </div>
                    ))}
                    {stsBusy && <Spinner label={t("listening", lang)} />}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <MicButton recording={recording} disabled={stsBusy} onDown={vpStart} onUp={vpStop} label={recording ? t("stop", lang) : t("holdToTalk", lang)} />
                    <span className="text-xs font-semibold text-teal-600">
                      {recording ? t("speakNow", lang) : stsBusy ? t("listening", lang) : t("holdToTalk", lang)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/** Standalone voice challenge recorder (for lessons without STS scenario) */
function VoiceChallengeRecorder({ onDone, lang }: { onDone: () => void; lang: Lang }) {
  const [recording, setRecording] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const recRef = React.useRef<WavRecorder | null>(null);

  async function down() {
    recRef.current = new WavRecorder();
    try {
      await recRef.current.start();
      setRecording(true);
    } catch { /* mic unavailable */ }
  }
  function up() {
    if (!recRef.current) return;
    setRecording(false);
    recRef.current.stop(); // demo capture — human-in-the-loop portfolio piece
    setSaved(true);
    playBadge();
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <MicButton recording={recording} onDown={down} onUp={up} label={t("record", lang)} />
      {saved && (
        <Button className="h-12 bg-lime-700 px-8 font-extrabold hover:bg-lime-800" onClick={onDone}>
          ✓ {t("complete", lang)}
        </Button>
      )}
    </div>
  );
}
