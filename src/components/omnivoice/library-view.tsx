"use client";
// Content Library — wings + registry console + ingestion portal:
// 1. Official Schemes (units/contents, ELOs, resources + national core skills + domains)
// 2. Grassfields Languages Expansion Pack (v3.0 §2): registry-driven language
//    profiles (incl. Ewondo + community drafts), GACL orthography, attested
//    tone-marked vocabulary (playable), CEFR progression (§2.9), content
//    targets (§2.8), ASR/TTS registries (§4.1), offline packs (§4.4).
// 3. Language Registry Console (v3.0): add new dialects/local languages.
// 4. TRUSTED CONTENT INGESTION (user directive): tutors/parents/authorities
//    submit words, greetings, stories with source citations → review → publish.
// 5. Kom Attested Literature & Resources (v4.1 resource harvest): SIL Cameroon
//    primer series + linguistic descriptions + lexicon + Kom NT audio access
//    points + Hyman-attested tone-marked vocabulary — see lib/data/kom-resources.ts.
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { PatternBand, Spinner } from "./shared";
import { speak } from "@/lib/voice-client";
import { playXp } from "@/lib/sound-engine";
import { useLanguageRegistry } from "@/lib/use-language-registry";
import {
  GRASSFIELDS_LANGUAGES, GACL, KOM_TONES, LAMNSO_GRAPHEMES, CORE_PHRASES,
  CONTENT_TARGETS, CONTENT_SOURCES, CEFR_PROGRESSION, ASR_MODELS, TTS_MODELS,
  FINE_TUNING_PLAN, LANGUAGE_PACKS, VOICE_MODEL_STATUS, LANGUAGE_CLASSIFICATION, LANGUAGE_RESOURCES,
  BAYANGI_DATA_COLLECTION_PLAN,
} from "@/lib/data/grassfields";
import { RegistryConsole, statusLabel } from "./registry-console";
import { IngestionPortal } from "./ingestion-portal";
import { CurriculumContentView } from "./curriculum-content";
import { DiyWorkshop } from "./diy-workshop";
import { ScripturePlayer } from "./scripture-player";
import { CorpusViewer } from "./corpus-viewer";
import {
  KOM_LITERATURE, KOM_LANGUAGE_DESCRIPTIONS, KOM_LEXICAL_RESOURCES, KOM_SCRIPTURE,
  KOM_ATTESTED_VOCAB, KOM_ATTESTED_VOCAB_SOURCE, KOM_TONE_ANALYSIS,
  KOM_RESOURCE_HARVEST, KOM_OLAC_ALTERNATE_NAMES, type ResourceStatus,
} from "@/lib/data/kom-resources";
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
  const [wing, setWing] = React.useState<"schemes" | "grassfields" | "registry" | "ingest" | "diy" | "v42" | "scripture" | "corpus">("schemes");
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
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Library wings">
          <button
            role="tab" aria-selected={wing === "schemes"} onClick={() => setWing("schemes")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "schemes" ? "border-amber-700 bg-amber-700 text-white shadow" : "border-amber-200 bg-white text-amber-800 hover:border-amber-400"
            )}
          >
            📖 {fr ? "Programme officiel" : "Official Schemes"}
          </button>
          <button
            role="tab" aria-selected={wing === "grassfields"} onClick={() => setWing("grassfields")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "grassfields" ? "border-lime-700 bg-lime-700 text-white shadow" : "border-lime-200 bg-white text-lime-800 hover:border-lime-500"
            )}
          >
            🪶 {t("expansionPack", lang)}
          </button>
          <button
            role="tab" aria-selected={wing === "registry"} onClick={() => setWing("registry")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "registry" ? "border-sky-700 bg-sky-700 text-white shadow" : "border-sky-200 bg-white text-sky-800 hover:border-sky-500"
            )}
          >
            🧩 {t("registryConsole", lang)}
          </button>
          <button
            role="tab" aria-selected={wing === "ingest"} onClick={() => setWing("ingest")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "ingest" ? "border-indigo-700 bg-indigo-700 text-white shadow" : "border-indigo-200 bg-white text-indigo-800 hover:border-indigo-500"
            )}
          >
            📥 {fr ? "Ingestion de contenu" : "Content Ingestion"}
          </button>
          <button
            role="tab" aria-selected={wing === "diy"} onClick={() => setWing("diy")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "diy" ? "border-orange-600 bg-orange-600 text-white shadow" : "border-orange-200 bg-white text-orange-800 hover:border-orange-400"
            )}
          >
            🔨 {t("diyWorkshop", lang)}
          </button>
          <button
            role="tab" aria-selected={wing === "scripture"} onClick={() => setWing("scripture")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "scripture" ? "border-emerald-700 bg-emerald-700 text-white shadow" : "border-emerald-200 bg-white text-emerald-800 hover:border-emerald-500"
            )}
          >
            🎧 {fr ? "Bible audio (Kom)" : "Audio Bible (Kom)"}
          </button>
          <button
            role="tab" aria-selected={wing === "corpus"} onClick={() => setWing("corpus")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "corpus" ? "border-cyan-700 bg-cyan-700 text-white shadow" : "border-cyan-200 bg-white text-cyan-800 hover:border-cyan-500"
            )}
          >
            🗃️ {fr ? "Corpus kom (KB)" : "Kom Corpus (KB)"}
          </button>
          <button
            role="tab" aria-selected={wing === "v42"} onClick={() => setWing("v42")}
            className={cn(
              "min-h-[40px] rounded-full border-2 px-3.5 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              wing === "v42" ? "border-emerald-700 bg-emerald-700 text-white shadow" : "border-emerald-200 bg-white text-emerald-800 hover:border-emerald-400"
            )}
          >
            🎓 {fr ? "Programme & contenus v4.2" : "Curriculum & Content v4.2"}
          </button>
        </div>

        {wing === "registry" ? (
          <RegistryConsole />
        ) : wing === "ingest" ? (
          <IngestionPortal />
        ) : wing === "scripture" ? (
          <ScripturePlayer />
        ) : wing === "corpus" ? (
          <CorpusViewer />
        ) : wing === "diy" ? (
          <DiyWorkshop />
        ) : wing === "v42" ? (
          <CurriculumContentView />
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
// GRASSFIELDS EXPANSION PACK WING (v2.0 §2) — registry-driven (v4.2):
// static matrix + Ewondo + community drafts via useLanguageRegistry.
// ============================================================================
function GrassfieldsExpansion({
  fr, selLang, setSelLang, sel,
}: {
  fr: boolean;
  selLang: string;
  setSelLang: (l: string) => void;
  sel?: (typeof GRASSFIELDS_LANGUAGES)[number];
}) {
  const { languages } = useLanguageRegistry();
  React.useEffect(() => { /* registry loaded lazily by the hook consumers */ }, []);
  const selRegistry = languages.find((l) => l.code === selLang);
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

      {/* §2.2 Language profiles — registry-driven (static matrix + Ewondo + community drafts) */}
      <section aria-label={t("languageProfile", fr ? "fr" : "en")} className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold text-lime-900">🌍 {t("languageProfile", fr ? "fr" : "en")} ({languages.length})</h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((l) => (
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
                  l.status === "ACTIVE" ? "bg-lime-600 text-white" : l.status === "ACTIVE_PLACEHOLDER" ? "bg-orange-500 text-white" : l.status === "DRAFT" ? "bg-sky-600 text-white" : l.status === "IN_REVIEW" ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-600"
                )}>{statusLabel(l.status, fr)}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-amber-700">ISO {l.iso} · {l.nativeName}</p>
              {l.region && <p className="text-[10px] text-amber-700">{l.region}{l.division ? ` — ${l.division}` : ""}</p>}
              {l.speakers && <p className="text-[10px] text-amber-700">🗣️ {l.speakers}</p>}
              <p className="mt-1 text-[10px] leading-snug text-lime-800">{l.tones}</p>
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
              {sel.code === "bkm" && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[10px] leading-snug text-amber-800">
                  🔊 {fr ? "Seules les formes attestées (Hyman, SIL) sont listées ci-contre ; les salutations et dialogues arrivent via 📥 Ingestion de contenu." : "Only attested forms (Hyman, SIL) are listed beside; greetings and dialogues arrive via 📥 Content Ingestion."}
                </p>
              )}
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
        {selRegistry?.isDraft && (
          <div className="mt-3 grid gap-3 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/70 p-3 text-xs">
            <h4 className="font-extrabold text-sky-900">🪶 {selRegistry.name} ({selRegistry.code}) — {fr ? "langue communautaire" : "community-registered language"}</h4>
            <p className="text-amber-900">{selRegistry.tones} · {selRegistry.speakers || (fr ? "locuteurs à documenter" : "speakers to be documented")}</p>
            <p className="text-[11px] leading-relaxed text-sky-900">
              {fr
                ? "Cette langue a été ajoutée via la Console du Registre. Son contenu (mots, salutations, histoires) arrive via l'onglet 📥 Ingestion de contenu — il sera publié après vérification par un encadreur."
                : "This language was added through the Registry Console. Its content (words, greetings, stories) arrives via the 📥 Content Ingestion tab — it will be published after supervisor review."}
            </p>
          </div>
        )}
      </section>
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

      {/* Sample vocabulary — ATTESTED words only (trusted-sources policy) */}
      <section aria-label={t("sampleVocabulary", fr ? "fr" : "en")} className="rounded-2xl border-2 border-lime-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-extrabold text-lime-900">🔊 {t("sampleVocabulary", fr ? "fr" : "en")}</h3>
        <p className="mb-3 text-[11px] text-amber-700">
          {fr ? "Touchez un mot pour écouter la voix du personnage (Kwe)." : "Tap a word to hear the character voice (Kwe)."}
        </p>
        <div className="mb-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-3">
          <p className="text-xs font-extrabold text-amber-900">⏳ {t("pendingDocumentation", fr ? "fr" : "en")} — {fr ? "salutations et dialogues" : "greetings & dialogues"}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
            {fr
              ? "Aucune salutation Kom/Lamnso'/Ewondo n'est encore attestée dans nos sources de confiance — la plateforme n'invente jamais de contenu. Les salutations proviendront des locuteurs natifs via l'onglet 📥 Ingestion de contenu."
              : "No Kom/Lamnso'/Ewondo greeting is attested in our trusted sources yet — the platform never invents content. Greetings arrive from native speakers through the 📥 Content Ingestion tab."}
          </p>
        </div>
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

      {/* v4.1 — Kom Attested Literature & Resources (online harvest) */}
      <KomResourcePanel fr={fr} />

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
          <PackList fr={fr} />
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

// ============================================================================
// KOM ATTESTED LITERATURE & RESOURCES (v4.1 resource harvest)
// Grounds Kom content in the stipulated SIL Cameroon archive records, the OLAC
// catalogue, the Kom New Testament access points, and Hyman's attested
// tone-marked vocabulary. Data: src/lib/data/kom-resources.ts
// ============================================================================

const RESOURCE_BADGE: Record<ResourceStatus, { label: string; labelFr: string; cls: string }> = {
  ONLINE_PDF: { label: "PDF", labelFr: "PDF", cls: "bg-lime-600 text-white" },
  NOT_ONLINE: { label: "PRINT", labelFr: "IMPRIMÉ", cls: "bg-stone-200 text-stone-600" },
  ONLINE_AUDIO: { label: "AUDIO", labelFr: "AUDIO", cls: "bg-sky-600 text-white" },
  ONLINE_APP: { label: "APP", labelFr: "APP", cls: "bg-indigo-600 text-white" },
  ONLINE_DB: { label: "DATA", labelFr: "DONNÉES", cls: "bg-purple-600 text-white" },
  ACCESS_GATED: { label: "PDF · gated", labelFr: "PDF · bloqué", cls: "bg-orange-500 text-white" },
};

function KomResourcePanel({ fr }: { fr: boolean }) {
  return (
    <div className="space-y-4">
      {/* Harvest summary */}
      <section aria-label={fr ? "Littérature kom attestée" : "Kom attested literature"} className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-emerald-900">📚 {fr ? "Littérature kom attestée — moisson SIL/OLAC (v4.1)" : "Kom Attested Literature & Resources — SIL/OLAC Harvest (v4.1)"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">
          {fr
            ? `Contenu kom ancré dans les archives SIL Cameroon et la linguistique publiée : ${KOM_RESOURCE_HARVEST.stipulatedResolved}/${KOM_RESOURCE_HARVEST.stipulatedRecords} registres stipulés traités · ${KOM_LITERATURE.length} titres de la série d'alphabétisation · ${KOM_LANGUAGE_DESCRIPTIONS.length} descriptions linguistiques · ${KOM_LEXICAL_RESOURCES.length} ressources lexicales · ${KOM_ATTESTED_VOCAB.length} mots attestés (Hyman, UC Berkeley) · ${KOM_SCRIPTURE.accessPoints.length} points d'accès au Nouveau Testament.`
            : `Kom content grounded in the SIL Cameroon archives and published linguistics: ${KOM_RESOURCE_HARVEST.stipulatedResolved}/${KOM_RESOURCE_HARVEST.stipulatedRecords} stipulated records processed · ${KOM_LITERATURE.length} literacy titles · ${KOM_LANGUAGE_DESCRIPTIONS.length} language descriptions · ${KOM_LEXICAL_RESOURCES.length} lexical resources · ${KOM_ATTESTED_VOCAB.length} attested words (Hyman, UC Berkeley) · ${KOM_SCRIPTURE.accessPoints.length} New Testament access points.`}
        </p>
        <p className="mt-1.5 break-words text-[10px] leading-snug text-emerald-800">
          {KOM_RESOURCE_HARVEST.sources.join(" · ")}
        </p>
      </section>

      {/* Literacy primer series */}
      <section className="rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm">
        <h4 className="mb-1 text-sm font-extrabold text-emerald-900">📖 {fr ? "Série d'alphabétisation (éditions SIL)" : "Literacy Primer & Book Series (SIL editions)"}</h4>
        <p className="mb-3 text-[11px] text-amber-700">
          {fr
            ? "La chaine complète d'apprentissage de la lecture en kom — du pré-primer à l'arithmétique et aux matières scientifiques (MLE)."
            : "The complete Kom literacy ladder — pre-primer through arithmetic and science/citizenship subjects (MLE)."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 text-[10px] uppercase text-emerald-700">
                <th className="py-1.5 pr-2">{fr ? "Titre (kom)" : "Title (Kom)"}</th>
                <th className="py-1.5 pr-2">{fr ? "Titre anglais" : "English title"}</th>
                <th className="py-1.5 pr-2">{fr ? "Année" : "Year"}</th>
                <th className="py-1.5 pr-2">{fr ? "Pages" : "Pages"}</th>
                <th className="py-1.5 pr-2">SIL</th>
                <th className="py-1.5">{fr ? "Disponibilité" : "Availability"}</th>
              </tr>
            </thead>
            <tbody>
              {KOM_LITERATURE.map((b) => {
                const badge = RESOURCE_BADGE[b.status];
                return (
                  <tr key={b.id} className="border-b border-emerald-50 align-top">
                    <td className="py-1.5 pr-2 font-extrabold text-emerald-900">
                      {b.title}
                      <span className="block text-[10px] font-normal text-amber-600">{[...(b.authors || []), ...(b.translators || []).map((x) => `${x} (tr.)`)].join(" · ")}{b.sponsoredBy ? ` — ${b.sponsoredBy}` : ""}</span>
                    </td>
                    <td className="py-1.5 pr-2 text-amber-800">{b.altTitle}</td>
                    <td className="py-1.5 pr-2 font-bold text-amber-900">{b.year}</td>
                    <td className="py-1.5 pr-2 text-amber-800">{b.pages || "—"}</td>
                    <td className="py-1.5 pr-2 font-mono text-[10px] text-amber-600">{b.silEntry}</td>
                    <td className="py-1.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-extrabold", badge.cls)}>{fr ? badge.labelFr : badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-emerald-800">
          {fr
            ? "Astuce : Kɨtɨ̂ Woyn Kom 2.1 a déjà été adapté en bafut et en oku — deux de nos langues planifiées — ce qui en fait le modèle direct de ces extensions. Les PDF à accès restreint (sil.org) sont documentés dans kom-resources.ts pour récupération hors bac à sable."
            : "Note: Kɨtɨ̂ Woyn Kom 2.1 has already been adapted into Bafut and Oku — two of our PLANNED languages — making the Kom edition the direct template for those expansions. Access-gated sil.org PDF URLs are documented in kom-resources.ts for retrieval from an unrestricted network."}
        </p>
      </section>

      {/* Linguistic descriptions + lexical resources */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-extrabold text-amber-900">🔬 {fr ? "Descriptions linguistiques (SIL)" : "Language Descriptions (SIL)"}</h4>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {KOM_LANGUAGE_DESCRIPTIONS.map((d) => (
              <li key={d.silEntry} className="rounded-lg bg-amber-50 p-2">
                <b>{d.title}</b> <span className="text-amber-600">({d.author}, {d.year}{d.pages ? `, ${d.pages} pp.` : ""})</span>
                <br /><span className="text-[10px] text-amber-700">{d.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-extrabold text-sky-900">🗝️ {fr ? "Lexiques & dictionnaires" : "Lexicons & Dictionaries"}</h4>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {KOM_LEXICAL_RESOURCES.map((x) => (
              <li key={x.silEntry} className="rounded-lg bg-sky-50 p-2">
                <b>{x.title}</b> <span className="text-amber-600">({x.compiler}, {x.year}{x.pages ? `, ${x.pages} pp.` : ""})</span>
                <br /><span className="text-[10px] text-amber-700">{x.role}</span>
              </li>
            ))}
          </ul>
          <h4 className="mb-2 mt-3 text-sm font-extrabold text-sky-900">✝️ {fr ? "Nouveau Testament en kom (2004)" : "The New Testament in Kom (2004)"}</h4>
          <p className="text-[11px] text-amber-700">{KOM_SCRIPTURE.edition} · {KOM_SCRIPTURE.script} · {KOM_SCRIPTURE.curator}</p>
          <ul className="mt-1.5 space-y-1 text-xs">
            {KOM_SCRIPTURE.accessPoints.map((a) => (
              <li key={a.url}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[28px] items-center gap-1.5 rounded-lg bg-sky-50 px-2 py-1 font-bold text-sky-800 hover:bg-sky-100">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold", RESOURCE_BADGE[a.kind].cls)}>{fr ? RESOURCE_BADGE[a.kind].labelFr : RESOURCE_BADGE[a.kind].label}</span>
                  {a.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10px] leading-snug text-amber-600">{KOM_SCRIPTURE.role}</p>
        </div>
      </section>

      {/* Attested vocabulary — playable */}
      <section className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-sm">
        <h4 className="mb-1 text-sm font-extrabold text-emerald-900">🔊 {fr ? "Vocabulaire kom attesté — Hyman (UC Berkeley)" : "Attested Kom Vocabulary — Hyman (UC Berkeley)"}</h4>
        <p className="mb-3 text-[11px] text-amber-700">
          {fr
            ? "Mots tirés des tableaux 1–9 du papier de Hyman (terrain Bamenda 1974/1977, orthographe Chia 1984). Touchez pour écouter — classes nominales et patrons tonaux indiqués."
            : "Words from Tables 1–9 of Hyman's Kom paper (fieldwork Bamenda 1974/1977, Chia 1984 orthography). Tap to listen — noun class and tone pattern shown."}
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {KOM_ATTESTED_VOCAB.map((w) => (
            <button
              key={w.kom + w.en}
              onClick={() => { playXp(); void speak(w.kom, "kwe", "bkm"); }}
              className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 px-2.5 py-1.5 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50"
              aria-label={`Listen: ${w.kom} — ${w.en}`}
            >
              <span>
                <span className="block text-sm font-extrabold text-emerald-900">{w.kom}</span>
                <span className="block text-[10px] text-amber-700">{w.en}{w.nounClass ? ` · cl. ${w.nounClass}` : ""}{w.tonePattern ? ` · ${w.tonePattern}` : ""}</span>
              </span>
              <span className="text-[9px] font-bold uppercase text-emerald-700">Kom ▸</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-snug text-emerald-800">{KOM_ATTESTED_VOCAB_SOURCE}</p>
      </section>

      {/* Tone analysis — engine validation */}
      <section className="rounded-2xl border-2 border-lime-300 bg-lime-50/60 p-4 shadow-sm">
        <h4 className="mb-1 text-sm font-extrabold text-lime-900">🎚️ {fr ? "Analyse tonale attestée — validation du moteur" : "Attested Tone Analysis — Engine Validation"}</h4>
        <p className="text-[11px] text-lime-900/80">{KOM_TONE_ANALYSIS.source}</p>
        <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
          <div className="rounded-xl bg-white p-2.5">
            <b className="text-lime-900">{fr ? "Tones sous-jacents" : "Underlying tones"}</b>
            <p className="mt-0.5 text-amber-800">{KOM_TONE_ANALYSIS.underlyingTones}</p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-amber-700">
              {KOM_TONE_ANALYSIS.surfaceMid.map((m) => <li key={m}>• {m}</li>)}
            </ul>
            <p className="mt-1 text-[11px] text-amber-800"><b>{fr ? "Contours" : "Contours"}:</b> {KOM_TONE_ANALYSIS.contours}</p>
          </div>
          <div className="rounded-xl bg-white p-2.5">
            <b className="text-lime-900">{fr ? "Règles tonales" : "Tone rules"}</b>
            <ul className="mt-0.5 space-y-1 text-[11px] text-amber-800">
              {KOM_TONE_ANALYSIS.rules.map((r) => <li key={r.name}><b>{r.name}</b> — {r.detail}</li>)}
            </ul>
            <p className="mt-1 text-[11px] text-amber-800"><b>{fr ? "Patrons" : "Patterns"}:</b> {KOM_TONE_ANALYSIS.patterns}</p>
          </div>
        </div>
        <p className="mt-2 rounded-xl bg-lime-100/70 p-2 text-[11px] font-semibold leading-snug text-lime-900">✅ {KOM_TONE_ANALYSIS.platformFit}</p>
      </section>

      {/* OLAC alternate names + access notes */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm">
        <h4 className="mb-1 text-sm font-extrabold text-stone-800">🏷️ {fr ? "Noms alternatifs (catalogue OLAC)" : "Alternate Names (OLAC catalogue)"}</h4>
        <p className="text-xs text-amber-800">{KOM_OLAC_ALTERNATE_NAMES.join(" · ")}</p>
        <h4 className="mb-1 mt-2 text-sm font-extrabold text-stone-800">🗒️ {fr ? "Notes d'accès aux sources" : "Source Access Notes"}</h4>
        <ul className="space-y-0.5 break-words text-[10px] leading-snug text-amber-700">
          {KOM_RESOURCE_HARVEST.accessNotes.map((n) => <li key={n}>• {n}</li>)}
        </ul>
      </section>
    </div>
  );
}

// ============================================================================
// PACK LIST (§4.4 offline language packs) — honest download buttons: the pack
// bundles AFTER native-speaker audio is documented (Directive 9). Clicking
// shows exactly what the pack will contain instead of a fake download.
// ============================================================================
function PackList({ fr }: { fr: boolean }) {
  const [openPack, setOpenPack] = React.useState<string | null>(null);
  return (
    <ul className="space-y-1 text-xs text-amber-900">
      {GRASSFIELDS_LANGUAGES.map((l) => (
        <li key={l.code} className="rounded-lg bg-lime-50 px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold">{l.flag} {l.name}</span>
            <span className="flex items-center gap-2">
              <span className="text-[10px] text-amber-700">~{LANGUAGE_PACKS[l.code]?.sizeMb}MB</span>
              <button
                onClick={() => setOpenPack(openPack === l.code ? null : l.code)}
                aria-expanded={openPack === l.code}
                className="min-h-[28px] rounded-full border-2 border-lime-300 bg-white px-2.5 text-[10px] font-extrabold text-lime-800 hover:border-lime-500"
              >
                📦 {t("downloadPack", fr ? "fr" : "en")}
              </button>
            </span>
          </div>
          {openPack === l.code && (
            <p className="mt-1.5 rounded-md bg-white p-2 text-[10px] leading-snug text-amber-800" role="status">
              ⏳ {fr
                ? "Le pack se constitue dès que l'audio des locuteurs natifs est documenté (Directive 9 — pas de voix synthétisée sans référence native). Contenu prévu : "
                : "The pack bundles as soon as native-speaker audio is documented (Directive 9 — no synthesized voice without native reference). Planned contents: "}
              {(LANGUAGE_PACKS[l.code]?.components || []).join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
