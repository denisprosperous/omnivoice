"use client";
// ============================================================================
// CorpusViewer — kom_training_corpus Knowledge-Base browser (spec Part 1 +
// §2.4). Shows the corpus manifest ingested from the user's Master Ingestion
// Package: numbers paradigm, 16-stage course, agent synthesis queue (45
// proposals pending native-speaker moderation), real native audio index and
// conflicts. Read-only: per the spec's Golden Rule nothing here reaches
// learners until a moderator approves it in the Ingestion portal.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { Spinner } from "./shared";
import { cn } from "@/lib/utils";

interface Manifest {
  corpus_id: string;
  corpus_name: string;
  version: string;
  language: { name: string; autonym: string; iso_code: string; family: string; location: string; speakers_estimate: string; dialects: string[] };
  sources: Array<{ id: string; citation: string; status?: string }>;
  file_index: Record<string, { records: number | string; schema: string; note?: string }>;
  schema_scaffold_pending_data: Record<string, string>;
  quality_gates: string[];
  ingestion_order: string[];
}

interface Course {
  course_id: string;
  display_name: string;
  total_stages: number;
  total_lessons: number;
  estimated_hours: number;
  status: string;
  stages: Array<{ stage: number; name: string; lessons: number; mastery_gate: string | null; content_source: string }>;
}

interface NumberRow {
  number: number;
  kom: string;
  ipa: string | null;
  literal: string | null;
  source: string;
  moderation_status: string;
}

const FILES = [
  { path: "03_numbers/cardinal.json", label: "Numbers (100–1000)" },
  { path: "10_synthesis/pending_moderation.jsonl", label: "Synthesis queue (45)" },
  { path: "11_audio/word_audio_index.jsonl", label: "Native audio index" },
  { path: "13_agent_skills/expansion_protocol.json", label: "Expansion protocol" },
];

export function CorpusViewer() {
  const { lang } = useApp();
  const fr = lang === "fr";
  const [manifest, setManifest] = React.useState<Manifest | null>(null);
  const [course, setCourse] = React.useState<Course | null>(null);
  const [numbers, setNumbers] = React.useState<NumberRow[]>([]);
  const [tab, setTab] = React.useState<"course" | "numbers" | "queue" | "audio">("course");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes, nRes] = await Promise.all([
          fetch("/api/corpus"),
          fetch("/api/corpus?file=09_pedagogy/curriculum.json"),
          fetch("/api/corpus?file=03_numbers/cardinal.json"),
        ]);
        const m = await mRes.json();
        setManifest(m.manifest);
        const c = await cRes.json();
        setCourse(c.data);
        const n = await nRes.json();
        setNumbers(n.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!manifest) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">
        {fr ? "Corpus introuvable." : "Corpus not found."}
      </div>
    );
  }

  const stageCount = course?.stages.length ?? 0;
  const lessonTotal = course?.stages.reduce((s, st) => s + st.lessons, 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* manifest header */}
      <section className="rounded-2xl border-2 border-sky-300 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-extrabold text-sky-900">
          🗃️ {fr ? "Corpus de formation kom" : "Kom training corpus"} <span className="text-xs font-bold text-stone-500">v{manifest.version} · {manifest.corpus_id}</span>
        </h3>
        <p className="mt-1 text-xs font-semibold text-sky-700">
          {manifest.language.name} ({manifest.language.autonym}) · {manifest.language.iso_code} · {manifest.language.family}
        </p>
        <p className="text-xs text-stone-600">{manifest.language.location} · {manifest.language.speakers_estimate} {fr ? "locuteurs" : "speakers"}</p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={fr ? "Vues du corpus" : "Corpus views"}>
          {([
            ["course", `📚 ${fr ? "Cours 16 étapes" : "16-stage course"}`],
            ["numbers", `🔢 ${fr ? "Nombres" : "Numbers"} (${numbers.length})`],
            ["queue", `⏳ ${fr ? "File de synthèse" : "Synthesis queue"} (45)`],
            ["audio", `🎙️ ${fr ? "Audio natif" : "Native audio"} (28)`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "min-h-[36px] rounded-lg border-2 px-2.5 text-xs font-extrabold transition-all",
                tab === key ? "border-sky-600 bg-sky-600 text-white shadow" : "border-sky-200 bg-white text-sky-800 hover:border-sky-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* course tab */}
      {tab === "course" && course && (
        <section className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-sm" aria-label={course.display_name}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-base font-extrabold text-sky-900">📚 {course.display_name}</h4>
            <p className="text-xs font-bold text-stone-600">
              {stageCount} {fr ? "étapes" : "stages"} · {lessonTotal} {fr ? "leçons" : "lessons"} · ~{course.estimated_hours}h · {course.status}
            </p>
          </div>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {course.stages.map((st) => (
              <li key={st.stage} className="rounded-xl border border-sky-100 bg-sky-50/40 p-2">
                <p className="text-xs font-extrabold text-sky-950">
                  {st.stage}. {st.name}{" "}
                  <span className="font-bold text-stone-500">· {st.lessons} {fr ? "leç." : "less."} · {st.content_source}</span>
                </p>
                {st.mastery_gate && (
                  <p className="text-[10px] font-semibold text-amber-700">
                    🔒 {fr ? "Porte de maîtrise" : "Mastery gate"}: {st.mastery_gate}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* numbers tab */}
      {tab === "numbers" && (
        <section className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-sm" aria-label={fr ? "Nombres kom" : "Kom numbers"}>
          <h4 className="text-base font-extrabold text-sky-900">
            🔢 {fr ? "Paradigme des centaines (ingéré du paquet utilisateur)" : "Hundreds paradigm (ingested from the user package)"}
          </h4>
          <p className="mb-2 text-[11px] text-stone-600">
            {fr ? "Corrections de la Partie 0 : « ighi i täyn » (500, tréma) et « ighi i bulamö' » (900, forme complète)." : "Part 0 corrections: “ighi i täyn” (500, diaeresis) and “ighi i bulamö'” (900, untruncated)."}
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {numbers.map((n) => (
              <li key={n.number} className="flex items-baseline gap-2 rounded-xl border border-sky-100 bg-sky-50/40 p-2">
                <span className="w-10 shrink-0 text-right text-sm font-extrabold text-sky-900">{n.number}</span>
                <span className="text-sm font-bold text-sky-950">{n.kom}</span>
                {n.ipa && <span className="text-[10px] text-stone-500">{n.ipa}</span>}
                {n.literal && <span className="text-[10px] italic text-stone-500">({n.literal})</span>}
                <span className="ml-auto rounded-full bg-lime-100 px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-lime-800">{n.moderation_status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* synthesis queue tab */}
      {tab === "queue" && (
        <section className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-4 shadow-sm" aria-label={fr ? "File de synthèse" : "Synthesis queue"}>
          <h4 className="text-base font-extrabold text-amber-900">
            ⏳ {fr ? "Propositions de synthèse de l'agent — EN ATTENTE DE MODÉRATION" : "Agent synthesis proposals — PENDING MODERATION"}
          </h4>
          <p className="mt-1 text-[11px] leading-snug text-amber-800">
            {fr
              ? "Règle d'or du protocole : l'agent propose, un locuteur natif dispose. Ces 45 propositions (Partie 5 du paquet) n'apparaissent jamais dans les leçons avant approbation — elles transitent par le portail d'ingestion."
              : "Protocol golden rule: the agent proposes, a native speaker disposes. These 45 proposals (package Part 5) never appear in lessons before approval — they route through the Ingestion portal."}
          </p>
          <p className="mt-2 text-xs font-extrabold text-amber-900">
            → {fr ? "File de revue :" : "Review queue:"} {fr ? "Bibliothèque → onglet 📥 Ingestion de contenu" : "Library → 📥 Content Ingestion tab"}
          </p>
        </section>
      )}

      {/* audio tab */}
      {tab === "audio" && (
        <section className="rounded-2xl border-2 border-lime-300 bg-white p-4 shadow-sm" aria-label={fr ? "Audio natif" : "Native audio"}>
          <h4 className="text-base font-extrabold text-lime-900">🎙️ {fr ? "Index audio natif réel" : "Real native audio index"}</h4>
          <p className="mt-1 text-[11px] leading-snug text-stone-600">
            {fr
              ? "28 chapitres de Matìyo narrés par le narrateur du NT kom (Bible.is BKMBSCN2DA, ℗ 2007 Hosanna / FCBH) — hébergés localement et joués dans l'onglet 📖 Audio Bible."
              : "28 chapters of Matìyo narrated by the Kom NT narrator (Bible.is BKMBSCN2DA, ℗ 2007 Hosanna / FCBH) — hosted locally and played in the 📖 Audio Bible tab."}
          </p>
          <p className="mt-2 text-xs font-extrabold text-lime-900">
            → {fr ? "Lecteur :" : "Player:"} {fr ? "Bibliothèque → onglet 📖 Audio Bible (Kom)" : "Library → 📖 Audio Bible (Kom) tab"}
          </p>
        </section>
      )}

      {/* manifest details */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-extrabold text-stone-800">{fr ? "Collections du manifeste" : "Manifest collections"}</h4>
        <ul className="mt-2 space-y-1">
          {Object.entries(manifest.file_index).map(([file, meta]) => (
            <li key={file} className="rounded-lg border border-stone-100 bg-stone-50/60 px-2.5 py-1.5 text-xs">
              <b className="font-mono text-stone-800">{file}</b>
              <span className="ml-2 font-bold text-sky-700">{String(meta.records)} × {meta.schema}</span>
              {meta.note && <span className="block text-[10px] leading-snug text-stone-500">{meta.note}</span>}
            </li>
          ))}
        </ul>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-extrabold text-stone-600">
            {fr ? "Échafaudages de schéma en attente de données" : "Schema scaffolds awaiting data"}
          </summary>
          <ul className="mt-1.5 space-y-1">
            {Object.entries(manifest.schema_scaffold_pending_data).map(([file, note]) => (
              <li key={file} className="rounded-lg border border-dashed border-stone-200 px-2.5 py-1.5 text-[11px]">
                <b className="font-mono text-stone-700">{file}</b>
                <span className="block text-stone-500">{note}</span>
              </li>
            ))}
          </ul>
        </details>
        <h4 className="mt-3 text-sm font-extrabold text-stone-800">{fr ? "Portes qualité" : "Quality gates"}</h4>
        <ul className="mt-1 flex flex-wrap gap-1">
          {manifest.quality_gates.map((g) => (
            <li key={g} className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-900">✓ {g}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
