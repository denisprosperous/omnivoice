"use client";
// Content Library — two wings + registry console:
// 1. Official Schemes (units/contents, ELOs, resources + national core skills + domains)
// 2. Grassfields Languages Expansion Pack (v3.0 §2): 8 language profiles (Kom &
//    Lamnso' separate; Bayangi added), GACL orthography, tone-marked sample
//    vocabulary (playable), CEFR progression (§2.9), content library targets
//    (§2.8), ASR fine-tuning plan + model registries (§4.1), offline language
//    packs (§4.4), voice model status (§2.7), Bayangi data collection plan.
// 3. Language Registry Console (v3.0): add new dialects/local languages.
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner } from "./shared";
import { speak } from "@/lib/voice-client";
import { playXp } from "@/lib/sound-engine";
import {
  GRASSFIELDS_LANGUAGES, GACL, KOM_TONES, LAMNSO_GRAPHEMES, CORE_PHRASES,
  CONTENT_TARGETS, CONTENT_SOURCES, CEFR_PROGRESSION, ASR_MODELS, TTS_MODELS,
  FINE_TUNING_PLAN, LANGUAGE_PACKS, VOICE_MODEL_STATUS, LANGUAGE_CLASSIFICATION, LANGUAGE_RESOURCES,
  BAYANGI_DATA_COLLECTION_PLAN,
} from "@/lib/data/grassfields";
import { RegistryConsole, statusLabel } from "./registry-console";
import { cn } from "@/lib/utils";
import { BookOpen, Calculator, FlaskConical, Languages, Landmark, Palette, Dumbbell, Drum, Monitor, type LucideIcon } from "lucide-react";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen, calculator: Calculator, "flask-conical": FlaskConical,
  languages: Languages, landmark: Landmark, palette: Palette, dumbbell: Dumbbell,
  drum: Drum, monitor: Monitor,
};

interface SchemeWeek { id: string; subjectId: string; month: number; week: number; components: string[]; contents: string[]; outcomes: string[]; resources: string[] }
interface Subject { id: string; nameEn: string; nameFr: string; domain: string; weighting: number; color: string; icon: string }

export function LibraryView() {
  const { lang } = useApp();
  const [wing, setWing] = React.useState<"schemes" | "grassfields" | "registry">("schemes");
  const [weeks, setWeeks] = React.useState<SchemeWeek[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [domains, setDomains] = React.useState<Array<{ name: string; weighting: number }>>([]);
  const [coreSkills, setCoreSkills] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState("english");
  const [loading, setLoading] = React.useState(true);
  const [selLang, setSelLang] = React.useState<string>("bkm");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        setWeeks(data.schemeWeeks || []);
        setSubjects(data.subjects || []);
        setDomains(data.domains || []);
        setCoreSkills(data.nationalCoreSkills || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = weeks.filter((w) => w.subjectId === filter);
  const fr = lang === "fr";
  const sel = GRASSFIELDS_LANGUAGES.find((l) => l.code === selLang);

  return (
    <main className="min-h-screen bg-[#FFFBEB] pb-24">
      <PatternBand />
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <header>
          <h1 className="text-2xl font-extrabold text-amber-900">📚 {t("library", lang)}</h1>
          <p className="text-sm text-amber-700">
            {fr
              ? "Programme officiel (Class 3, Mois 1 — La Maison) + Pack d'extension langues des Grassfields (v3.0, 8 langues) + Registre des langues."
              : "Official schemes (Class 3, Month 1 — The Home) + Grassfields Expansion Pack (v3.0, 8 languages) + Language Registry."}
          </p>
        </header>

        {/* Wing switcher */}
        <div className="flex gap-2" role="tablist" aria-label="Library wings">
          <button
            role="tab" aria-selected={wing === "schemes"} onClick={() => setWing("schemes")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-4 text-sm font-bold transition-all",
              wing === "schemes" ? "border-amber-700 bg-amber-700 text-white shadow" : "border-amber-200 bg-white text-amber-800 hover:border-amber-400"
            )}
          >
            📖 {fr ? "Programme officiel" : "Official Schemes"}
          </button>
          <button
            role="tab" aria-selected={wing === "grassfields"} onClick={() => setWing("grassfields")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-4 text-sm font-bold transition-all",
              wing === "grassfields" ? "border-lime-700 bg-lime-700 text-white shadow" : "border-lime-200 bg-white text-lime-800 hover:border-lime-500"
            )}
          >
            🪶 {t("expansionPack", lang)}
          </button>
          <button
            role="tab" aria-selected={wing === "registry"} onClick={() => setWing("registry")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-4 text-sm font-bold transition-all",
              wing === "registry" ? "border-sky-700 bg-sky-700 text-white shadow" : "border-sky-200 bg-white text-sky-800 hover:border-sky-500"
            )}
          >
            🧩 {t("registryConsole", lang)}
          </button>
        </div>

        {wing === "registry" ? (
          <RegistryConsole />
        ) : wing === "grassfields" ? (
          <GrassfieldsExpansion fr={fr} selLang={selLang} setSelLang={setSelLang} sel={sel} />
        ) : (
          <>
            {/* Domain weightings */}
            <section className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm" aria-label={t("domains", lang)}>
              <h2 className="mb-3 text-sm font-extrabold text-amber-900">{t("domains", lang)}</h2>
              <div className="space-y-2">
                {domains.map((d) => (
                  <div key={d.name}>
                    <div className="mb-0.5 flex justify-between text-xs font-bold text-amber-800">
                      <span>{d.name}</span><span>{d.weighting}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-amber-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-600" style={{ width: `${d.weighting * 1.5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Subject filter */}
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("subjects", lang)}>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={filter === s.id}
                  onClick={() => setFilter(s.id)}
                  className={cn(
                    "min-h-[36px] rounded-full border-2 px-3 text-xs font-bold transition-all",
                    filter === s.id ? "border-amber-700 bg-amber-700 text-white shadow" : "border-amber-200 bg-white text-amber-800 hover:border-amber-400"
                  )}
                >
                  <span className="mr-1 inline-flex align-middle" aria-hidden>
                    {React.createElement(SUBJECT_ICONS[s.icon] || BookOpen, { size: 13 })}
                  </span>
                  {lang === "fr" ? s.nameFr : s.nameEn}
                </button>
              ))}
            </div>

            {loading ? <Spinner /> : (
              <div className="grid gap-3 md:grid-cols-2">
                {shown.map((w) => (
                  <article key={w.id} className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-1 text-sm font-extrabold text-lime-900">
                      {fr ? "Semaine" : "Week"} {w.week} — {fr ? "Mois" : "Month"} {w.month}
                    </h3>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {w.components.map((c) => (
                        <span key={c} className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-800">{c}</span>
                      ))}
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{fr ? "Unités / Contenus" : "Units / Contents"}</h4>
                    <ul className="mb-2 space-y-0.5 text-xs text-amber-900">
                      {w.contents.map((c) => <li key={c}>• {c}</li>)}
                    </ul>
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-orange-600">{fr ? "Résultats attendus" : "Expected Learning Outcomes"}</h4>
                    <ul className="mb-2 space-y-0.5 text-xs text-orange-900">
                      {w.outcomes.map((o) => <li key={o}>✓ {o}</li>)}
                    </ul>
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{fr ? "Ressources" : "Resources"}</h4>
                    <p className="text-xs text-amber-700">{w.resources.join(" · ")}</p>
                  </article>
                ))}
              </div>
            )}

            {/* National Core Skills */}
            <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-extrabold text-orange-900">
                🇨🇲 {fr ? "Compétences de Base Nationales" : "National Core Skills"}
              </h2>
              <ol className="space-y-1 text-xs text-orange-900">
                {coreSkills.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
              </ol>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// GRASSFIELDS EXPANSION PACK WING (v2.0 §2)
// ============================================================================
function GrassfieldsExpansion({
  fr, selLang, setSelLang, sel,
}: {
  fr: boolean;
  selLang: string;
  setSelLang: (l: string) => void;
  sel?: (typeof GRASSFIELDS_LANGUAGES)[number];
}) {
  return (
    <div className="space-y-4" role="tabpanel" aria-label={t("expansionPack", fr ? "fr" : "en")}>
      <section className="rounded-2xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-4 shadow-sm">
        <h2 className="text-base font-extrabold text-lime-900">🪶 {t("expansionPack", fr ? "fr" : "en")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-lime-900/80">{t("expansionIntro", fr ? "fr" : "en")}</p>
        <p className="mt-2 text-[11px] text-lime-800">
          {GACL.fullName} ({GACL.established}) · {fr ? "Langues tonales" : "Tonal languages"}: Kom 3 tones · Lamnso&apos; vowel length · Bayangi {fr ? "à documenter" : "to be documented"}
        </p>
        <p className="mt-1 text-[11px] font-bold text-lime-900">
          {fr ? "Matrice corrigée : 8 langues — kom et lamnso' distincts · bayangi ajouté (Nouveau)." : "Corrected matrix: 8 languages — Kom and Lamnso' distinct · Bayangi added (New)."}
        </p>
      </section>

      {/* §2.2 Language profiles */}
      <section aria-label={t("languageProfile", fr ? "fr" : "en")} className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold text-lime-900">🌍 {t("languageProfile", fr ? "fr" : "en")}</h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {GRASSFIELDS_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelLang(l.code)}
              aria-pressed={selLang === l.code}
              className={cn(
                "min-h-[44px] rounded-xl border-2 p-3 text-left transition-all",
                selLang === l.code ? "border-lime-700 bg-lime-50 shadow-sm" : "border-lime-100 bg-white hover:border-lime-400"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-lime-900">{l.flag} {l.name}</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase",
                  l.status === "ACTIVE" ? "bg-lime-600 text-white" : l.status === "ACTIVE_PLACEHOLDER" ? "bg-orange-500 text-white" : "bg-stone-200 text-stone-600"
                )}>{statusLabel(l.status, fr)}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-amber-700">ISO {l.iso} · {l.nativeName}</p>
              <p className="text-[10px] text-amber-700">{l.region} — {l.division}</p>
              <p className="text-[10px] text-amber-700">🗣️ {l.speakers}</p>
              <p className="mt-1 text-[10px] leading-snug text-lime-800">{l.tones}</p>
              <p className="mt-1 text-[9px] font-bold uppercase text-stone-500">
                {statusLabel(l.status, fr) === "Draft" ? "" : `${fr ? "Phase" : "Phase"}: `}{VOICE_MODEL_STATUS[l.code]?.phase}
              </p>
              <p className="mt-1 text-[9px] font-semibold text-amber-600">
                {t("contentCoverage", fr ? "fr" : "en")}: {l.contentLibrary.vocabulary} {fr ? "mots" : "words"} · {l.contentLibrary.dialogues} {fr ? "dialogues" : "dialogues"} · {l.contentLibrary.songs} {fr ? "chants" : "songs"} · {l.contentLibrary.stories} {fr ? "histoires" : "stories"}
              </p>
            </button>
          ))}
        </div>

        {sel && (
          <div className="mt-3 grid gap-3 rounded-xl bg-lime-50/70 p-3 text-xs md:grid-cols-2">
            <div>
              <h4 className="mb-1 font-extrabold text-lime-900">{sel.name} — {fr ? "détails" : "details"}</h4>
              <p className="text-amber-900"><b>{fr ? "Noms alternatifs" : "Alternate names"}:</b> {sel.alternateNames.join(", ")}</p>
              <p className="text-amber-900"><b>{fr ? "Classification" : "Classification"}:</b> {LANGUAGE_CLASSIFICATION[sel.code] || "Narrow Grassfields"}</p>
              <p className="text-amber-900"><b>{fr ? "Notation tonale" : "Tone notation"}:</b> {sel.toneNotation.system} — {sel.toneNotation.detail}</p>
              <p className="text-amber-900"><b>{fr ? "Données d'entraînement" : "Training data"}:</b> {sel.trainingHours}</p>
              <p className="text-amber-900"><b>{fr ? "Modèle ASR" : "ASR model"}:</b> {sel.asrModel || (fr ? "en attente de données" : "pending data collection")}</p>
              <p className="text-amber-900"><b>{fr ? "Voix TTS" : "TTS voice"}:</b> {sel.ttsVoice || (fr ? "en attente de données" : "pending data collection")}</p>
              <p className="text-amber-900"><b>{fr ? "ASR" : "ASR"}:</b> {VOICE_MODEL_STATUS[sel.code]?.asr}</p>
              <p className="text-amber-900"><b>{fr ? "TTS" : "TTS"}:</b> {VOICE_MODEL_STATUS[sel.code]?.tts}</p>
              {sel.culturalContext && (
                <p className="text-amber-900"><b>{fr ? "Contexte culturel" : "Cultural context"}:</b> {sel.culturalContext}</p>
              )}
            </div>
            <div>
              <h4 className="mb-1 font-extrabold text-lime-900">{fr ? "Ressources d'apprentissage" : "Learning resources"}</h4>
              <ul className="space-y-0.5 text-amber-900">
                {(LANGUAGE_RESOURCES[sel.code] || []).map((r) => <li key={r}>• {r}</li>)}
              </ul>
              {sel.code === "byv" && (
                <div className="mt-2 rounded-xl border-2 border-dashed border-orange-400 bg-orange-50/70 p-2.5">
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wide text-orange-700">⏳ {t("dataCollection", fr ? "fr" : "en")} — Bayangi (v3.0)</h5>
                  <p className="mt-1 text-[11px] text-orange-900"><b>{fr ? "Cible" : "Target"}:</b> {BAYANGI_DATA_COLLECTION_PLAN.targetHours}h · <b>{fr ? "Partenaire" : "Partner"}:</b> {BAYANGI_DATA_COLLECTION_PLAN.partner} · <b>{fr ? "Échéance" : "Timeline"}:</b> {BAYANGI_DATA_COLLECTION_PLAN.timeline}</p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-orange-900">
                    {BAYANGI_DATA_COLLECTION_PLAN.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* §2.6 GACL Orthography */}
      <section aria-label={t("orthography", fr ? "fr" : "en")} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-amber-900">✍️ {t("orthography", fr ? "fr" : "en")} ({GACL.established})</h3>
        <div className="grid gap-3 text-xs md:grid-cols-3">
          <div className="rounded-xl bg-amber-50 p-3">
            <h4 className="mb-1 font-bold text-amber-900">{fr ? "Caractères spéciaux" : "Special characters"}</h4>
            <p className="text-lg tracking-widest text-amber-900">{GACL.specialCharacters.join("  ")}</p>
            <h4 className="mb-1 mt-2 font-bold text-amber-900">{fr ? "Digrammes" : "Digraphs"}</h4>
            <p className="text-amber-900">{GACL.digraphs.join(" · ")}</p>
            <h4 className="mb-1 mt-2 font-bold text-amber-900">{fr ? "Prénasalisées" : "Prenasalized"}</h4>
            <p className="text-amber-900">{GACL.prenasalized.join(" · ")}</p>
            <h4 className="mb-1 mt-2 font-bold text-amber-900">{fr ? "Labialisées / Palatalisées" : "Labialized / Palatalized"}</h4>
            <p className="text-amber-900">{[...GACL.labialized, ...GACL.palatalized].join(" · ")}</p>
          </div>
          <div className="rounded-xl bg-lime-50 p-3">
            <h4 className="mb-1 font-bold text-lime-900">{fr ? "Les 3 tons du kom" : "Kom's 3 tones"}</h4>
            <ul className="space-y-1 text-lime-900">
              {KOM_TONES.map((k) => (
                <li key={k.tone}><b>{k.tone}</b> — {k.mark}</li>
              ))}
            </ul>
            <h4 className="mb-1 mt-2 font-bold text-lime-900">{fr ? "Graphèmes du lamnso'" : "Lamnso' graphemes"}</h4>
            <ul className="space-y-0.5 text-lime-900">
              {LAMNSO_GRAPHEMES.map((g) => <li key={g.phon}>{g.phon} = “{g.graph}”</li>)}
            </ul>
          </div>
          <div className="rounded-xl bg-orange-50 p-3">
            <h4 className="mb-1 font-bold text-orange-900">{fr ? "Principes fondamentaux" : "Core principles"}</h4>
            <ul className="list-disc space-y-1 pl-3 text-orange-900">
              {GACL.corePrinciples.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* §2.3/§2.4 Sample vocabulary — playable */}
      <section aria-label={t("sampleVocabulary", fr ? "fr" : "en")} className="rounded-2xl border-2 border-lime-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-extrabold text-lime-900">🔊 {t("sampleVocabulary", fr ? "fr" : "en")}</h3>
        <p className="mb-3 text-[11px] text-amber-700">
          {fr ? "Touchez une phrase pour écouter la voix du personnage (Kwe). Les tons sont marqués selon le GACL." : "Tap a phrase to hear the character voice (Kwe). Tones are marked per the GACL."}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_PHRASES.map((p) => (
            <div key={p.en} className="rounded-xl border-2 border-lime-100 bg-lime-50/50 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{p.en} {p.note && <span className="font-normal">· {p.note}</span>}</div>
              {p.bkm && (
                <button
                  onClick={() => { playXp(); void speak(p.bkm!, "kwe", "bkm"); }}
                  className="mt-1 flex min-h-[36px] w-full items-center justify-between rounded-lg bg-white px-2 py-1 text-left hover:bg-lime-100"
                  aria-label={`Listen: ${p.bkm} (Kom)`}
                >
                  <span className="text-sm font-extrabold text-lime-900">🪶 {p.bkm}</span>
                  <span className="text-[9px] font-bold uppercase text-lime-700">Kom ▸</span>
                </button>
              )}
              {p.lns && (
                <button
                  onClick={() => { playXp(); void speak(p.lns!, "kwe", "lns"); }}
                  className="mt-1 flex min-h-[36px] w-full items-center justify-between rounded-lg bg-white px-2 py-1 text-left hover:bg-lime-100"
                  aria-label={`Listen: ${p.lns} (Lamnso')`}
                >
                  <span className="text-sm font-extrabold text-lime-900">🪶 {p.lns}</span>
                  <span className="text-[9px] font-bold uppercase text-lime-700">Lamnso&apos; ▸</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* §2.9 CEFR progression */}
      <section aria-label={t("cefrPath", fr ? "fr" : "en")} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-amber-900">🪜 {t("cefrPath", fr ? "fr" : "en")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-600">
                <th className="py-1.5 pr-2">{fr ? "Niveau" : "Level"}</th>
                <th className="py-1.5 pr-2">{fr ? "Compétence en langue des Grassfields" : "Grassfields language competency"}</th>
                <th className="py-1.5">CEFR</th>
              </tr>
            </thead>
            <tbody>
              {CEFR_PROGRESSION.map((r) => (
                <tr key={r.level} className="border-b border-amber-50">
                  <td className="py-1.5 pr-2 font-bold text-amber-900">{r.level}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{r.competency}</td>
                  <td className="py-1.5 font-extrabold text-lime-700">{r.cefr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* §2.8 Content library targets + sources */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-extrabold text-lime-900">🗂️ {fr ? "Types de contenu requis" : "Required content types"}</h3>
          <table className="w-full text-left text-xs">
            <tbody>
              {CONTENT_TARGETS.map((c) => (
                <tr key={c.type} className="border-b border-lime-50">
                  <td className="py-1.5 pr-2 font-bold text-lime-900">{c.type}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{c.quantity}</td>
                  <td className="py-1.5 text-amber-600">{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-extrabold text-lime-900">📥 {fr ? "Sources de contenu" : "Content sources"}</h3>
          <ul className="space-y-1 text-xs text-amber-900">
            {CONTENT_SOURCES.map((s) => <li key={s}>• {s}</li>)}
          </ul>
          <h3 className="mb-2 mt-3 text-sm font-extrabold text-lime-900">💾 {t("languagePacks", fr ? "fr" : "en")}</h3>
          <ul className="space-y-1 text-xs text-amber-900">
            {GRASSFIELDS_LANGUAGES.map((l) => (
              <li key={l.code} className="flex items-center justify-between gap-2 rounded-lg bg-lime-50 px-2 py-1.5">
                <span className="font-bold">{l.flag} {l.name}</span>
                <span className="text-[10px] text-amber-700">{LANGUAGE_PACKS[l.code]?.file} · ~{LANGUAGE_PACKS[l.code]?.sizeMb}MB</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* §4.1 Model registries + fine-tuning plan */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-extrabold text-amber-900">🎙️ ASR — {fr ? "modèles africains" : "African language models"}</h3>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {ASR_MODELS.map((m) => (
              <li key={m.model} className="rounded-lg bg-amber-50 p-2">
                <b>{m.model}</b> <span className="text-amber-600">({m.architecture})</span> — {m.use}
                <br /><span className="text-[10px] text-amber-700">{m.languages} · Grassfields: {m.grassfields}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-extrabold text-amber-900">🔈 TTS — {fr ? "solutions de synthèse" : "synthesis solutions"}</h3>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {TTS_MODELS.map((m) => (
              <li key={m.solution} className="rounded-lg bg-amber-50 p-2">
                <b>{m.solution}</b> <span className="text-amber-600">({m.type})</span>
                <br /><span className="text-[10px] text-amber-700">{m.languages} · Grassfields: {m.grassfields} · {m.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-lime-300 bg-lime-50/60 p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-lime-900">🛠️ {t("fineTuning", fr ? "fr" : "en")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr className="border-b border-lime-200 text-[10px] uppercase text-lime-700">
                <th className="py-1.5 pr-2">{fr ? "Langue" : "Language"}</th>
                <th className="py-1.5 pr-2">{fr ? "Modèle de base" : "Base model"}</th>
                <th className="py-1.5 pr-2">{fr ? "Données requises" : "Data needed"}</th>
                <th className="py-1.5">Priorité</th>
              </tr>
            </thead>
            <tbody>
              {FINE_TUNING_PLAN.map((f) => (
                <tr key={f.language} className="border-b border-lime-100/60">
                  <td className="py-1.5 pr-2 font-bold text-lime-900">{f.language}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{f.baseModel}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{f.data}</td>
                  <td className={cn(
                    "py-1.5 font-extrabold",
                    f.priority === "HIGH" ? "text-red-600" : f.priority === "MEDIUM" ? "text-amber-600" : "text-stone-500"
                  )}>{f.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-lime-900">
          {fr
            ? "Minimum 500h de parole transcrite par langue (optimal 1000h+) · Vérification humaine dans la boucle pour les évaluations critiques."
            : "Minimum 500h of transcribed speech per language (optimal 1,000h+) · Human-in-the-loop verification for critical assessments."}
        </p>
      </section>
    </div>
  );
}
