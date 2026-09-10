"use client";
// ============================================================================
// OMNIVOICE ACADEMY — Cameroon Primary Education AI Platform (MVP)
// Single-page application: role gate → Curriculum Navigator → voice-first
// Lesson Player → PBL Projects → Profile / Teacher / Parent / Supervisor.
// PWA service-worker registration for offline capability (Master Prompt 3.4).
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { Hud } from "@/components/omnivoice/hud";
import { Landing } from "@/components/omnivoice/landing";
import { LearnerDashboard } from "@/components/omnivoice/learner-dashboard";
import { LessonPlayer } from "@/components/omnivoice/lesson-player";
import { ProjectsView } from "@/components/omnivoice/projects-view";
import { ProfileView } from "@/components/omnivoice/profile-view";
import { TeacherView } from "@/components/omnivoice/teacher-view";
import { ParentView, SupervisorView } from "@/components/omnivoice/parent-supervisor";
import { LibraryView } from "@/components/omnivoice/library-view";
import { FeedbackWidget } from "@/components/omnivoice/feedback-widget";
import { useLearnerSync } from "@/components/omnivoice/use-learner-sync";
import { stopAmbient, setMuted } from "@/lib/sound-engine";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const { view, learner, soundOn, setOnline } = useApp();
  useLearnerSync();

  // Register service worker for offline caching (PWA per Master 5.1)
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, [setOnline]);

  // Mute engine sync
  React.useEffect(() => { setMuted(!soundOn); }, [soundOn]);

  // Stop ambient loops when leaving lesson contexts
  React.useEffect(() => {
    if (view !== "lesson") stopAmbient();
  }, [view]);

  // v3.0 §5.1 — embedded preview analytics: page views per SPA screen
  React.useEffect(() => {
    trackEvent("page_view", { view });
  }, [view]);

  // Default landing to role home when profile already exists
  React.useEffect(() => {
    if (learner && view === "landing") {
      useApp.getState().setView(
        learner.role === "learner" ? "learner"
        : learner.role === "teacher" ? "teacher"
        : learner.role === "parent" ? "parent"
        : "supervisor"
      );
    }
  }, [learner, view]);

  function renderView() {
    switch (view) {
      case "learner":
        return learner ? <LearnerDashboard /> : <Landing />;
      case "lesson":
        return <LessonPlayer />;
      case "projects":
        return learner ? <ProjectsView /> : <Landing />;
      case "profile":
        return learner ? <ProfileView /> : <Landing />;
      case "teacher":
        return <TeacherView />;
      case "parent":
        return <ParentView />;
      case "supervisor":
        return <SupervisorView />;
      case "library":
        return <LibraryView />;
      default:
        return <Landing />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {learner && <Hud />}
      <div className="flex-1">{renderView()}</div>
      <FeedbackWidget />
      {learner && (
        <footer className="mt-auto border-t-2 border-amber-200 bg-white py-3 text-center text-[11px] text-amber-700/80">
          🦉 OmniVoice Academy — {learner.role === "learner" ? "Every lesson is a quest. Every voice is heard." : "Teacher • Parent • Supervisor tools"} · MINEDUB CBA · ISCED 0-3 · CEFR · IB
        </footer>
      )}
    </div>
  );
}
