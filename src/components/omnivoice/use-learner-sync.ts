"use client";
// Learner state sync — keeps zustand XP/streak/level in step with the server.
// v4.0: re-syncs on every SPA view change so XP earned in any lesson component
// (digital + DIY + voice practice) shows immediately in the HUD/profile.
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export function useLearnerSync() {
  const learner = useApp((s) => s.learner);
  const view = useApp((s) => s.view);
  useEffect(() => {
    if (!learner?.id) return;
    let cancelled = false;
    fetch(`/api/learner?id=${learner.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.learner) return;
        const current = useApp.getState().learner;
        if (!current || current.xp !== d.learner.xp || current.streak !== d.learner.streak) {
          useApp.getState().setLearner({
            ...current,
            ...d.learner,
          });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };

  }, [learner?.id, view]);
}
