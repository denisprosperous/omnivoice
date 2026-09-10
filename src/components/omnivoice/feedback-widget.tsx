"use client";
// ============================================================================
// PREVIEW FEEDBACK WIDGET (v3.0 §5.2) — floating action button + form.
// Overall Rating (1-5 slider) · Voice Quality · Language Accuracy · Comments
// → POST /api/feedback. Available on every screen of the public preview.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeedbackWidget() {
  const { lang } = useApp();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(4);
  const [voiceQuality, setVoiceQuality] = React.useState("good");
  const [languageAccuracy, setLanguageAccuracy] = React.useState("accurate");
  const [comments, setComments] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  function openWidget() {
    setOpen(true);
    trackEvent("feedback_open");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, voiceQuality, languageAccuracy, comments }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setComments(""); }, 2600);
    } catch {
      setError(lang === "fr" ? "Échec de l'envoi — réessayez." : "Could not submit — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const selClass = "h-10 w-full rounded-lg border-2 border-amber-300 bg-white px-2 text-sm font-semibold text-amber-900";

  return (
    <>
      {/* Floating feedback button — always available during preview */}
      {!open && (
        <button
          onClick={openWidget}
          aria-label={t("feedbackTitle", lang)}
          className="fixed bottom-4 right-4 z-50 flex h-12 items-center gap-1.5 rounded-full border-2 border-amber-600 bg-white px-4 text-sm font-extrabold text-amber-800 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-amber-50"
        >
          <span aria-hidden>💬</span>
          <span className="hidden sm:inline">{t("feedback", lang)}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={t("feedbackTitle", lang)}>
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-300 bg-white p-5 shadow-2xl">
            {done ? (
              <div className="py-8 text-center" role="status">
                <div className="text-5xl" aria-hidden>🎉</div>
                <p className="mt-3 text-base font-extrabold text-lime-800">{t("feedbackThanks", lang)}</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-base font-extrabold text-amber-900">💬 {t("feedbackTitle", lang)}</h2>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full px-2 text-xl font-bold text-amber-500 hover:bg-amber-50">✕</button>
                </div>

                <label htmlFor="fb-rating" className="mb-1 block text-xs font-bold text-amber-800">{t("feedbackRating", lang)}: <span className="text-amber-600">{rating}/5</span></label>
                <input
                  id="fb-rating" type="range" min={1} max={5} step={1} value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mb-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-200 accent-amber-600"
                />

                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fb-voice" className="mb-1 block text-xs font-bold text-amber-800">{t("feedbackVoiceQuality", lang)}</label>
                    <select id="fb-voice" value={voiceQuality} onChange={(e) => setVoiceQuality(e.target.value)} className={selClass}>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="needs_improvement">Needs Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fb-lang" className="mb-1 block text-xs font-bold text-amber-800">{t("feedbackLanguageAccuracy", lang)}</label>
                    <select id="fb-lang" value={languageAccuracy} onChange={(e) => setLanguageAccuracy(e.target.value)} className={selClass}>
                      <option value="accurate">Accurate</option>
                      <option value="mostly_accurate">Mostly Accurate</option>
                      <option value="needs_review">Needs Review</option>
                    </select>
                  </div>
                </div>

                <label htmlFor="fb-comments" className="mb-1 block text-xs font-bold text-amber-800">{t("feedbackComments", lang)}</label>
                <textarea
                  id="fb-comments" rows={3} value={comments} maxLength={2000}
                  onChange={(e) => setComments(e.target.value)}
                  className="mb-4 w-full rounded-lg border-2 border-amber-300 px-2 py-1.5 text-sm text-amber-900"
                  placeholder={lang === "fr" ? "Vos remarques sur les langues, la voix, les leçons…" : "Tell us about the languages, voices, lessons…"}
                />

                {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}

                <Button type="submit" disabled={busy} className={cn("h-12 w-full bg-amber-600 text-base font-extrabold hover:bg-amber-700")}>
                  {busy ? "…" : `📨 ${t("feedbackSubmit", lang)}`}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
