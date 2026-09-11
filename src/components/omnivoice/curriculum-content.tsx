/**
 * OMNIVOICE v4.2 — Curriculum & Content wing (Library 5th tab).
 *
 * Panels:
 *  1. Curriculum Framework (§3.1–§3.10): structure, domains, 7 core skills,
 *     4 competences, ILTs, pedagogy, Level I outcomes, Level II monthly ILPs,
 *     Level III expectations, weekly time allocation — Classes 1–6 / 3 levels.
 *  2. Kom Lexicon (§6.2): 500-entry Phase 1 vocabulary DB with attestation
 *     badges + playable tone-marked forms (TTS; native reference pending).
 *  3. Reading Ladder (§6.3): the 5-stage primer library with activities.
 *  4. Listening Stations (§6.4): Kom NT audio via bible.is / DBL access
 *     points + comprehension / vocab extraction / retelling.
 */
"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { speak } from "@/lib/voice-client";
import { playXp } from "@/lib/sound-engine";
import { cn } from "@/lib/utils";
import { Spinner } from "./shared";

type Tab = "framework" | "lexicon" | "reading" | "listening";

interface Framework {
  structure: Array<{ level: string; classes: number[]; ages: string; document: string }>;
  domains: Array<{ domain: string; weight: number; subjects: readonly string[] }>;
  coreSkills: Array<{ n: number; skill: string; detail: string }>;
  competences: Array<{ name: string; nameFr: string; detail: string }>;
  ilts: { level12: readonly string[]; level3: readonly string[] };
  pedagogy: { approach: string; vehicles: string[]; assessment: string[]; forms: string[] };
  level1Outcomes: Array<{ subject: string; outcomes: string[] }>;
  level2Months: Array<{ month: number; ilt: string; project: string }>;
  level3Expectations: Array<{ subject: string; expectations: string[] }>;
  timeAllocation: { rows: Array<{ subject: string; hours: number }>; total: string };
  tenSubjects: readonly string[];
  coverage: { levels: number; classes: string[]; subjectsPerLevel: number };
}

interface VocabEntry {
  id: string; word: string | null; glossEn: string; glossFr: string; pos: string;
  tonePattern: string | null; nounClass: string | null; attestation: string;
  ilt: string; classBand: string; reviewStatus: string;
}

interface Primer {
  id: string; stage: number; stageName: string; titleKom: string; titleEn: string;
  textKom: string | null; textEn: string | null; activities: Array<{ type: string; prompt: string; promptFr: string }>;
  reviewStatus: string; audioStatus: string;
}

interface Station {
  id: string; titleKom: string; titleEn: string; passage: string; duration: string;
  audioSources: Array<{ label: string; url: string }>; licenceNote: string;
  comprehension: Array<{ q: string; qFr: string }>;
  vocabExtraction: { instruction: string; instructionFr: string };
  retelling: { prompt: string; promptFr: string };
}

export function CurriculumContentView() {
  const { lang } = useApp();
  const fr = lang === "fr";
  const [tab, setTab] = React.useState<Tab>("framework");

  const tabs: Array<{ id: Tab; label: string; cls: string }> = [
    { id: "framework", label: fr ? "Cadre du programme" : "Curriculum Framework", cls: "border-emerald-700 bg-emerald-700 text-white" },
    { id: "lexicon", label: fr ? "Lexique (500)" : "Lexicon (500)", cls: "border-teal-700 bg-teal-700 text-white" },
    { id: "reading", label: fr ? "Échelle de lecture" : "Reading Ladder", cls: "border-cyan-700 bg-cyan-700 text-white" },
    { id: "listening", label: fr ? "Écoute (NT)" : "Listening (NT)", cls: "border-sky-700 bg-sky-700 text-white" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="v4.2 content tabs">
        {tabs.map((tb) => (
          <button
            key={tb.id} role="tab" aria-selected={tab === tb.id} onClick={() => setTab(tb.id)}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              tab === tb.id ? tb.cls + " shadow" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>
      {tab === "framework" && <FrameworkPanel fr={fr} />}
      {tab === "lexicon" && <LexiconPanel fr={fr} />}
      {tab === "reading" && <ReadingPanel fr={fr} />}
      {tab === "listening" && <ListeningPanel fr={fr} />}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-extrabold text-emerald-900">{title}</h3>
      {children}
    </section>
  );
}

function FrameworkPanel({ fr }: { fr: boolean }) {
  const [fw, setFw] = React.useState<Framework | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        setFw(data.framework || null);
      } catch { /* graceful */ }
    })();
  }, []);
  if (!fw) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <p className="text-xs font-bold text-emerald-900">
          {fr ? "Couverture : " : "Coverage: "}
          {fw.coverage.levels}/{fw.coverage.levels} {fr ? "niveaux" : "levels"} ·
          {" "}{fw.coverage.classes.length}/{fw.coverage.classes.length} {fr ? "classes (1–6)" : "classes (1–6)"} ·
          {" "}{fw.coverage.subjectsPerLevel} {fr ? "matières par niveau" : "subjects per level"}
        </p>
      </div>

      <Card title={fr ? "3.1 Structure du programme" : "3.1 Curriculum structure"}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-emerald-800"><th className="py-1 pr-2">{fr ? "Niveau" : "Level"}</th><th className="py-1 pr-2">{fr ? "Classes" : "Classes"}</th><th className="py-1 pr-2">{fr ? "Âges" : "Ages"}</th><th className="py-1">{fr ? "Document de référence" : "Reference document"}</th></tr></thead>
            <tbody>
              {fw.structure.map((s) => (
                <tr key={s.level} className="border-t border-emerald-100">
                  <td className="py-1.5 pr-2 font-extrabold">{s.level}</td>
                  <td className="py-1.5 pr-2">{s.classes.join(" & ")}</td>
                  <td className="py-1.5 pr-2">{s.ages}</td>
                  <td className="py-1.5">{s.document}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={fr ? "3.2 Domaines et pondération" : "3.2 Domains & weighting"}>
        <div className="space-y-1.5">
          {fw.domains.map((d) => (
            <div key={d.domain} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="w-8 rounded bg-emerald-700 px-1.5 py-0.5 text-center font-extrabold text-white">{d.weight}%</span>
              <span className="font-bold text-emerald-900">{d.domain}:</span>
              <span className="text-neutral-600">{d.subjects.join(", ")}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={fr ? "3.3 Sept compétences nationales" : "3.3 Seven national core skills"}>
          <ol className="list-decimal space-y-1 pl-4 text-xs">
            {fw.coreSkills.map((s) => (
              <li key={s.n}><b className="text-emerald-900">{s.skill}</b> — <span className="text-neutral-600">{s.detail}</span></li>
            ))}
          </ol>
        </Card>
        <Card title={fr ? "3.4 Quatre compétences transversales" : "3.4 Four broad-based competences"}>
          <ul className="space-y-1 text-xs">
            {fw.competences.map((c) => (
              <li key={c.name}><b className="text-emerald-900">{fr ? c.nameFr : c.name}</b> — <span className="text-neutral-600">{c.detail}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={fr ? "3.5 Thèmes intégrateurs — Niveaux I–II" : "3.5 ILTs — Levels I–II"}>
          <p className="text-xs font-bold text-emerald-900">{fw.ilts.level12.join(" · ")}</p>
        </Card>
        <Card title={fr ? "3.5 Thèmes intégrateurs — Niveau III" : "3.5 ILTs — Level III"}>
          <p className="text-xs font-bold text-emerald-900">{fw.ilts.level3.join(" · ")}</p>
        </Card>
      </div>

      <Card title={fr ? "3.6 Pédagogie et évaluation" : "3.6 Pedagogy & assessment"}>
        <p className="text-xs"><b>{fw.pedagogy.approach}</b> {fr ? "via" : "via"} {fw.pedagogy.vehicles.join(" · ")}. {fr ? "Évaluation" : "Assessment"}: {fw.pedagogy.assessment.join(", ")} ({fw.pedagogy.forms.join(", ")}).</p>
      </Card>

      <Card title={fr ? "3.7 Niveau I (Classes 1–2) — résultats terminaux" : "3.7 Level I (Cl. 1–2) — key terminal outcomes"}>
        <div className="space-y-2">
          {fw.level1Outcomes.map((o) => (
            <div key={o.subject} className="text-xs">
              <b className="text-emerald-900">{o.subject}:</b> <span className="text-neutral-700">{o.outcomes.join("; ")}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={fr ? "3.8 Niveau II (Classe 3) — thèmes et projets mensuels" : "3.8 Level II (Cl. 3) — monthly themes & projects"}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-emerald-800"><th className="py-1 pr-2">{fr ? "Mois" : "Month"}</th><th className="py-1 pr-2">ILT</th><th className="py-1">{fr ? "Projet envisagé" : "Envisaged project"}</th></tr></thead>
            <tbody>
              {fw.level2Months.map((m) => (
                <tr key={m.month} className="border-t border-emerald-100">
                  <td className="py-1.5 pr-2 font-extrabold">{m.month}</td>
                  <td className="py-1.5 pr-2">{m.ilt}</td>
                  <td className="py-1.5">{m.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          {fr ? "Chaque mois : 4 semaines ; semaine 4 = intégration/évaluation/remédiation. Classe 3 Mois 1 entièrement semé (toutes matières) ; Classe 4 poursuit la même trame." : "Each month: 4 weeks; Week 4 = integration/assessment/remediation. Class 3 Month 1 fully seeded (all subjects); Class 4 continues the same frame."}
        </p>
      </Card>

      <Card title={fr ? "3.9 Niveau III (Classes 5–6) — attentes" : "3.9 Level III (Cl. 5–6) — expectations"}>
        <div className="space-y-2">
          {fw.level3Expectations.map((o) => (
            <div key={o.subject} className="text-xs">
              <b className="text-emerald-900">{o.subject}:</b> <span className="text-neutral-700">{o.expectations.join("; ")}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={fr ? "3.10 Dotation horaire hebdomadaire — Niveau I (simple vacation)" : "3.10 Weekly time allocation — Level I (single shift)"}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {fw.timeAllocation.rows.map((r) => (
                <tr key={r.subject} className="border-t border-emerald-100">
                  <td className="py-1.5 pr-2 font-bold text-emerald-900">{r.subject}</td>
                  <td className="py-1.5">{r.hours}h</td>
                </tr>
              ))}
              <tr className="border-t-2 border-emerald-300 bg-emerald-50">
                <td className="py-1.5 pr-2 font-extrabold">{fr ? "Total" : "Total"}</td>
                <td className="py-1.5 font-extrabold">{fw.timeAllocation.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function LexiconPanel({ fr }: { fr: boolean }) {
  const [data, setData] = React.useState<{ stats: { total: number; attested: number; awaiting: number }; entries: VocabEntry[] } | null>(null);
  const [q, setQ] = React.useState("");
  const [att, setAtt] = React.useState("");
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/vocab?limit=120");
        setData(await res.json());
      } catch { /* graceful */ }
    })();
  }, []);
  React.useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams({ limit: "120" });
      if (q) params.set("q", q);
      if (att) params.set("attestation", att);
      fetch(`/api/vocab?${params}`).then((r) => r.json()).then(setData).catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [q, att]);
  if (!data) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-3 text-xs font-bold text-teal-900">
        {fr ? "Phase 1 — " : "Phase 1 — "}
        {data.stats.total} {fr ? "entrées" : "entries"} · {data.stats.attested} {fr ? "attestées" : "attested"} · {data.stats.awaiting} {fr ? "en attente (glose native)" : "awaiting native gloss"}
        <span className="block font-normal text-teal-700">
          {fr ? "Les mots kom n'apparaissent que s'ils sont attestés (Hyman/UC Berkeley, Wiktionary, spécifications). Le lexique Jones 2001 (225 pp) est bloqué par Cloudflare — URL documentée dans le rapport." : "Kom forms appear ONLY where attested (Hyman/UC Berkeley, Wiktionary, spec). The Jones 2001 lexicon (225 pp) is Cloudflare-gated — URL documented in the report."}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? "Rechercher…" : "Search…"} className="min-h-[40px] flex-1 rounded-xl border-2 border-teal-200 px-3 text-sm" aria-label={fr ? "Recherche lexicale" : "Lexicon search"} />
        <select value={att} onChange={(e) => setAtt(e.target.value)} className="min-h-[40px] rounded-xl border-2 border-teal-200 px-2 text-sm" aria-label="Attestation filter">
          <option value="">{fr ? "Tous" : "All"}</option>
          <option value="attested">{fr ? "Attestés" : "Attested"}</option>
          <option value="awaiting">{fr ? "En attente" : "Awaiting"}</option>
        </select>
      </div>
      <div className="max-h-[420px] space-y-1.5 overflow-y-auto rounded-xl border border-teal-100 p-2">
        {data.entries.map((e) => (
          <div key={e.id} className="flex items-center gap-2 rounded-lg border border-teal-100 bg-white px-2.5 py-1.5 text-xs">
            <span className="w-16 shrink-0 font-mono text-[10px] text-neutral-400">{e.id}</span>
            {e.word ? (
              <button
                onClick={() => { playXp(); void speak(e.word!, "kwe", "bkm"); }}
                className="min-h-[32px] rounded-md bg-teal-700 px-2 font-bold text-white"
                aria-label={fr ? `Écouter ${e.word}` : `Listen: ${e.word}`}
              >🔊 {e.word}</button>
            ) : (
              <span className="rounded-md bg-neutral-100 px-2 py-1 italic text-neutral-400">{fr ? "glose attendue" : "gloss awaited"}</span>
            )}
            <span className="flex-1 font-bold text-neutral-800">{e.glossEn}<span className="font-normal text-neutral-500"> · {e.glossFr}</span></span>
            {e.tonePattern && <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-800">{e.tonePattern}</span>}
            {e.nounClass && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">cl. {e.nounClass}</span>}
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", e.attestation === "attested" ? "bg-lime-200 text-lime-900" : "bg-orange-100 text-orange-800")}>
              {e.attestation === "attested" ? (fr ? "attesté" : "attested") : fr ? "à valider" : "pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadingPanel({ fr }: { fr: boolean }) {
  const [data, setData] = React.useState<{ ladder: Array<{ stage: number; book: string; focus: string; sil: string }>; passages: Primer[] } | null>(null);
  React.useEffect(() => {
    fetch("/api/primers").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-5">
        {data.ladder.map((l) => (
          <div key={l.stage} className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-2.5 text-center">
            <div className="text-[10px] font-bold uppercase text-cyan-700">{fr ? "Étage" : "Stage"} {l.stage}</div>
            <div className="text-xs font-extrabold text-cyan-900">{l.book}</div>
            <div className="text-[10px] text-cyan-700">{l.focus}</div>
            <div className="text-[10px] text-neutral-400">SIL {l.sil}</div>
          </div>
        ))}
      </div>
      <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
        {data.passages.map((p) => (
          <div key={p.id} className="rounded-xl border border-cyan-100 bg-white p-3 text-xs shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <b className="text-cyan-900">{p.titleKom}</b>
              <span className="text-neutral-500">{p.titleEn}</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", p.reviewStatus === "VALIDATED" ? "bg-lime-200 text-lime-900" : "bg-orange-100 text-orange-800")}>{p.reviewStatus}</span>
            </div>
            {p.textKom && (
              <div className="mt-1.5 space-y-1">
                <p className="whitespace-pre-line rounded-lg bg-amber-50 p-2 font-semibold text-amber-900" style={{ fontSize: "0.95rem" }}>{p.textKom}</p>
                {p.textEn && <p className="text-neutral-600">{p.textEn}</p>}
                <button onClick={() => { playXp(); void speak(p.textKom!.split("\n")[0], "kwe", "bkm"); }} className="min-h-[32px] rounded-md bg-cyan-700 px-2 font-bold text-white">
                  🔊 {fr ? "Écouter" : "Listen"}
                </button>
              </div>
            )}
            <ul className="mt-1.5 space-y-0.5 text-neutral-700">
              {p.activities.map((a, i) => (
                <li key={i}>• <b className="uppercase text-[10px] text-cyan-700">{a.type}</b> {fr ? a.promptFr : a.prompt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListeningPanel({ fr }: { fr: boolean }) {
  const [data, setData] = React.useState<{ stations: Station[]; licenceNote: string } | null>(null);
  React.useEffect(() => {
    fetch("/api/stations").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-[11px] text-sky-900">⚖️ {data.licenceNote}</div>
      {data.stations.map((s) => (
        <div key={s.id} className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-xs shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <b className="text-sm text-sky-900">{s.titleKom}</b>
            <span className="text-neutral-500">{s.titleEn}</span>
            <span className="rounded bg-sky-700 px-2 py-0.5 font-bold text-white">⏱ {s.duration}</span>
          </div>
          <p className="mt-0.5 font-bold text-sky-800">{s.passage}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {s.audioSources.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="min-h-[36px] rounded-lg bg-sky-700 px-2.5 py-2 font-bold text-white hover:bg-sky-800">🎧 {a.label}</a>
            ))}
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <div className="rounded-lg bg-sky-50 p-2">
              <b className="text-sky-900">{fr ? "Compréhension" : "Comprehension"}</b>
              <ul className="mt-1 space-y-1">{s.comprehension.map((c, i) => <li key={i}>• {fr ? c.qFr : c.q}</li>)}</ul>
            </div>
            <div className="rounded-lg bg-sky-50 p-2">
              <b className="text-sky-900">{fr ? "Extraction lexicale" : "Vocabulary extraction"}</b>
              <p className="mt-1">{fr ? s.vocabExtraction.instructionFr : s.vocabExtraction.instruction}</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-2">
              <b className="text-sky-900">{fr ? "Reformulation" : "Retelling"}</b>
              <p className="mt-1">{fr ? s.retelling.promptFr : s.retelling.prompt}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
