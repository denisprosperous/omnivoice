// Zustand app store — SPA view routing, learner state, settings
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

export type Role = "learner" | "teacher" | "parent" | "supervisor";
export type View = "landing" | "learner" | "lesson" | "projects" | "profile" | "teacher" | "parent" | "supervisor" | "library";

export interface LearnerState {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  stage: string;
  iscedLevel: number;
  language: Lang;
  voiceLang: string; // voice/lesson language: en | fr | bkm | lns | bfd | oku | bbk | mgo | ngi
  xp: number;
  streak: number;
  level?: number;
  title?: string;
}

interface AppState {
  view: View;
  currentLessonId: string | null;
  learner: LearnerState | null;
  lang: Lang;
  voiceLang: string;
  /** selected voice/speaker id from the platform voice registry (voices.ts) */
  voiceId: string;
  soundOn: boolean;
  online: boolean;
  setView: (v: View) => void;
  openLesson: (id: string) => void;
  setLearner: (l: LearnerState | null) => void;
  setLang: (l: Lang) => void;
  setVoiceLang: (l: string) => void;
  setVoiceId: (id: string) => void;
  toggleSound: () => void;
  setOnline: (o: boolean) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      view: "landing",
      currentLessonId: null,
      learner: null,
      lang: "en",
      voiceLang: "en",
      voiceId: "voice_kwe",
      soundOn: true,
      online: true,
      setView: (view) => set({ view }),
      openLesson: (id) => set({ view: "lesson", currentLessonId: id }),
      setLearner: (learner) => set({ learner, lang: (learner?.language as Lang) || "en", voiceLang: learner?.voiceLang || "en" }),
      setLang: (lang) => set((s) => {
        if (s.learner) {
          const updated = { ...s.learner, language: lang };
          void fetch("/api/learner", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: s.learner.id, language: lang }),
          }).catch(() => {});
          return { lang, learner: updated };
        }
        return { lang };
      }),
      setVoiceLang: (voiceLang) => set((s) => {
        // v3.0 §5.1 — track voice language preference (preview analytics)
        trackEvent("voice_language_selection", { from: s.voiceLang, to: voiceLang });
        if (s.learner) {
          const updated = { ...s.learner, voiceLang };
          void fetch("/api/learner", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: s.learner.id, voiceLang }),
          }).catch(() => {});
          return { voiceLang, learner: updated };
        }
        return { voiceLang };
      }),
      setVoiceId: (voiceId) => set((s) => {
        if (s.voiceId !== voiceId) trackEvent("voice_selection", { from: s.voiceId, to: voiceId });
        return { voiceId };
      }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setOnline: (online) => set({ online }),
    }),
    {
      name: "omnivoice-app",
      partialize: (s) => ({ learner: s.learner, lang: s.lang, voiceLang: s.voiceLang, voiceId: s.voiceId, soundOn: s.soundOn }),
    }
  )
);

