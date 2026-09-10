"use client";
// ============================================================================
// PROJECTS — PBL Engine (Master Prompt 4.1.1): gamified monthly projects with
// 3 phases (Beginning → Progression → Culminating Event), team roles, Project
// Book with voice notes, Project Master badge, cyclical process scheduler.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner, MicButton } from "./shared";
import { WavRecorder, playWavBase64, speakFallback } from "@/lib/voice-client";
import { playBadge, playXp, playCelebration } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProjectNote { id: string; phase: number; kind: string; text: string; audio: string | null; createdAt: string }
interface Project { id: string; title: string; role: string; phase: number; iltId: string; notes: ProjectNote[]; createdAt: string }

const ROLES = [
  { id: "leader", emoji: "🧭", en: "Team Leader", fr: "Chef d'équipe" },
  { id: "recorder", emoji: "✍🏾", en: "Recorder", fr: "Secrétaire" },
  { id: "timekeeper", emoji: "⏰", en: "Timekeeper", fr: "Gardien du temps" },
  { id: "presenter", emoji: "🗣️", en: "Presenter", fr: "Présentateur" },
  { id: "materials", emoji: "🎨", en: "Materials Manager", fr: "Gestionnaire du matériel" },
];

const PHASES = [
  {
    n: 1, en: "Beginning — identify the problem", fr: "Début — identifier le problème", xp: 15,
    guide: {
      en: "Talk with your team: what will you create about The Home? Record your plan as a voice note in the Project Book!",
      fr: "Parle avec ton équipe : que vas-tu créer sur La Maison ? Enregistre ton plan en note vocale !",
    },
  },
  {
    n: 2, en: "Progression — execute the plan", fr: "Progression — réaliser le plan", xp: 25,
    guide: {
      en: "Gather materials, practise, draw, build. Record your progress and questions in the Project Book.",
      fr: "Rassemble le matériel, entraîne-toi, dessine, construis. Note tes progrès et tes questions dans le Cahier.",
    },
  },
  {
    n: 3, en: "Culminating Event — present & evaluate", fr: "Événement culminant — présenter & évaluer", xp: 30,
    guide: {
      en: "Present to the class (last Thursday/Friday of the month!). Record your oral presentation — ASR will help assess it.",
      fr: "Présente à la classe (dernier jeudi/vendredi du mois !). Enregistre ta présentation orale — l'ASR aidera à l'évaluer.",
    },
  },
];

export function ProjectsView() {
  const { learner, lang } = useApp();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState("");
  const [newRole, setNewRole] = React.useState("leader");
  const [recording, setRecording] = React.useState(false);
  const [recFor, setRecFor] = React.useState<string | null>(null);
  const recRef = React.useRef<WavRecorder | null>(null);

  const load = React.useCallback(async () => {
    if (!learner) return;
    setLoading(true);
    const res = await fetch(`/api/projects?learnerId=${learner.id}`);
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, [learner]);

  React.useEffect(() => { void load(); }, [load]);

  async function createProject() {
    if (!learner) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId: learner.id,
        iltId: "the-home",
        title: newTitle.trim() || (lang === "fr" ? "Ma Maison, Ma Fierté" : "My Home, My Pride"),
        role: newRole,
      }),
    });
    playXp();
    setNewTitle("");
    void load();
  }

  async function advancePhase(p: Project) {
    if (!learner) return;
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, phase: p.phase + 1 }),
    });
    const data = await res.json();
    if (data.project?.phase === 3) { playCelebration(); } else { playBadge(); }
    void load();
  }

  async function startNote(projectId: string) {
    recRef.current = new WavRecorder();
    try {
      await recRef.current.start();
      setRecording(true);
      setRecFor(projectId);
    } catch {
      speakFallback(lang === "fr" ? "Micro indisponible." : "Microphone unavailable.", lang === "fr" ? "fr-FR" : "en-US");
    }
  }

  async function stopNote() {
    if (!recRef.current || !learner) return;
    setRecording(false);
    const { wavBase64 } = recRef.current.stop();
    setRecFor(null);
    // transcribe for the Project Book (AI transcription & summarization per 4.1.1)
    let text = "";
    try {
      const res = await fetch("/api/stt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: wavBase64 }),
      });
      const data = await res.json();
      text = data.text || "";
    } catch { /* offline — audio-only note */ }
    await fetch("/api/projects/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: recFor || "",
        learnerId: learner.id,
        phase: projects.find((p) => p.id === recFor)?.phase ?? 1,
        kind: "voice",
        text: text || (lang === "fr" ? "(note vocale)" : "(voice note)"),
        audio: `data:audio/wav;base64,${wavBase64.slice(0, 400000)}`,
      }),
    });
    playXp();
    void load();
  }

  async function addTextNote(projectId: string, text: string) {
    if (!learner || !text.trim()) return;
    await fetch("/api/projects/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, learnerId: learner.id, kind: "text", text: text.trim(), phase: projects.find((p) => p.id === projectId)?.phase ?? 1 }),
    });
    playXp();
    void load();
  }

  if (!learner) return null;
  const active = projects.find((p) => p.phase < 3);

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">🛠️ {t("projects", lang)}</h1>
          <p className="text-sm text-amber-700">
            {lang === "fr"
              ? "Projet mensuel du thème « La Maison » — approche par les compétences (CBA) et apprentissage par projet (PBL)."
              : "Monthly project for The Home — Competence-Based Approach (CBA) + Project-Based Learning (PBL)."}
          </p>
          <p className="mt-1 text-xs font-semibold text-orange-700">
            📅 {lang === "fr"
              ? "Événement culminant : dernier jeudi/vendredi du mois"
              : "Culmination event: last Thursday/Friday of the month"}
          </p>
        </header>

        {/* Create project */}
        {!active && (
          <section className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-amber-900">
              {lang === "fr" ? "➕ Commencer le projet du mois" : "➕ Start this month's project"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ptitle" className="mb-1 block text-xs font-bold text-amber-800">{lang === "fr" ? "Titre du projet" : "Project title"}</label>
                <Input id="ptitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={lang === "fr" ? "Ma Maison, Ma Fierté" : "My Home, My Pride"} className="h-11 border-amber-300" />
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold text-amber-800">{lang === "fr" ? "Choisis ton rôle" : "Choose your role"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setNewRole(r.id)}
                      aria-pressed={newRole === r.id}
                      className={cn(
                        "min-h-[38px] rounded-lg border-2 px-2 py-1 text-xs font-bold transition-all",
                        newRole === r.id ? "border-amber-600 bg-amber-600 text-white" : "border-amber-200 text-amber-800 hover:border-amber-400"
                      )}
                    >
                      {r.emoji} {lang === "fr" ? r.fr : r.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={createProject} className="mt-3 h-12 w-full bg-amber-600 font-extrabold hover:bg-amber-700">
              🚀 {lang === "fr" ? "Lancer la phase « Début » (+15 XP)" : "Launch Beginning phase (+15 XP)"}
            </Button>
          </section>
        )}

        {loading && <Spinner label={lang === "fr" ? "Chargement..." : "Loading..."} />}

        {/* Project cards */}
        {projects.map((p) => (
          <section key={p.id} className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white p-4 shadow-md">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-orange-900">🗂️ {p.title}</h2>
              <span className="rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-900">
                {ROLES.find((r) => r.id === p.role)?.emoji} {lang === "fr" ? ROLES.find((r) => r.id === p.role)?.fr : ROLES.find((r) => r.id === p.role)?.en}
              </span>
            </div>

            {/* Phase tracker */}
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              {PHASES.map((ph) => (
                <div
                  key={ph.n}
                  className={cn(
                    "rounded-xl border-2 p-2.5 text-xs",
                    p.phase >= ph.n ? "border-lime-500 bg-lime-50 text-lime-900" : "border-amber-200 bg-white text-amber-700"
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1 font-extrabold">
                    {p.phase >= ph.n ? "✅" : ph.n}{" "}
                    {lang === "fr" ? ph.fr : ph.en}
                  </div>
                  <div className="text-[10px] opacity-80">+{ph.xp} XP</div>
                </div>
              ))}
            </div>

            {p.phase < 3 && (
              <div className="mb-3 rounded-xl bg-orange-100/70 p-3 text-sm text-orange-900">
                💡 {lang === "fr" ? PHASES[p.phase - 1].guide.fr : PHASES[p.phase - 1].guide.en}
                <Button onClick={() => advancePhase(p)} className="mt-2 h-10 w-full bg-orange-600 font-bold hover:bg-orange-700" size="sm">
                  {p.phase === 2
                    ? lang === "fr" ? "Terminer — Événement culminant 🎉 (+30 XP)" : "Complete — Culminating Event 🎉 (+30 XP)"
                    : lang === "fr" ? "Passer à la phase suivante (+25 XP)" : "Advance to next phase (+25 XP)"}
                </Button>
              </div>
            )}
            {p.phase >= 3 && (
              <div className="mb-3 rounded-xl bg-lime-100 p-3 text-center text-sm font-extrabold text-lime-900">
                🏆 {lang === "fr" ? "Projet terminé — badge Maître du Projet !" : "Project complete — Project Master badge earned!"}
              </div>
            )}

            {/* Project Book */}
            <h3 className="mb-2 text-sm font-extrabold text-orange-900">📓 {t("voiceNotes", lang)}</h3>
            <div className="mb-2 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-white p-2">
              {p.notes.length === 0 && (
                <p className="p-2 text-xs text-amber-600">
                  {lang === "fr" ? "Aucune note — enregistre la première !" : "No notes yet — record the first one!"}
                </p>
              )}
              {p.notes.map((n) => (
                <div key={n.id} className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2">
                  <span aria-hidden>{n.kind === "voice" ? "🎙️" : "📝"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-amber-900">{n.text}</p>
                    <p className="text-[10px] text-amber-500">
                      {lang === "fr" ? "Phase" : "Phase"} {n.phase} · {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {n.audio && (
                    <button
                      onClick={() => {
                        const b64 = n.audio!.split(",")[1];
                        playWavBase64(b64, 1);
                      }}
                      className="rounded-full bg-amber-600 px-2 py-1 text-[10px] font-bold text-white"
                      aria-label="Play voice note"
                    >
                      ▶
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <MicButton
                recording={recording && recFor === p.id}
                onDown={() => startNote(p.id)}
                onUp={stopNote}
                label={t("record", lang)}
              />
              <TextNote onAdd={(txt) => addTextNote(p.id, txt)} lang={lang} />
            </div>
            <p className="mt-1 text-center text-[11px] text-amber-600">
              {recording && recFor === p.id ? t("speakNow", lang) : t("holdToTalk", lang)}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}

function TextNote({ onAdd, lang }: { onAdd: (t: string) => void; lang: string }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState("");
  if (!open) {
    return (
      <Button variant="outline" className="h-14 border-amber-300 text-amber-800" onClick={() => setOpen(true)}>
        📝 {lang === "fr" ? "Écrire" : "Type"}
      </Button>
    );
  }
  return (
    <div className="flex flex-1 gap-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={lang === "fr" ? "Écris une note..." : "Type a note..."} className="h-12 border-amber-300"
        onKeyDown={(e) => { if (e.key === "Enter") { onAdd(val); setVal(""); setOpen(false); } }}
      />
      <Button className="h-12 bg-amber-600 font-bold hover:bg-amber-700" onClick={() => { onAdd(val); setVal(""); setOpen(false); }}>
        {t("save", lang)}
      </Button>
    </div>
  );
}
