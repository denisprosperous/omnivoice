"use client";
// v3.0 §5.1 — embedded preview analytics client. Fire-and-forget custom
// events: page views, voice language selections, lesson completions,
// ASR attempts. Never blocks the UI; silently no-ops offline.

export type PreviewEventType =
  | "page_view"
  | "voice_language_selection"
  | "voice_selection"
  | "lesson_completion"
  | "asr_attempt"
  | "feedback_open"
  | "profile_creation"
  | "language_registered"
  // v4.0 — DIY Practical + Voice Practice + extended lesson adoption (§VI metrics)
  | "diy_step_complete"
  | "diy_completion"
  | "voice_practice_turn"
  | "voice_practice_completion"
  | "extended_lesson_complete";

export function trackEvent(type: PreviewEventType, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (navigator.onLine === false) return; // offline: skip (cached preview)
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, props }),
    keepalive: true,
  }).catch(() => {});
}
