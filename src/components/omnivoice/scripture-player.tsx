"use client";
// ============================================================================
// ScripturePlayer — KOM AUDIO BIBLE (ingested 2026-09-16 from
// http://live.bible.is/bible/BKMBSC/MAT/1).
//
//   text  : Kom NT (© 2004 The Bible Society of Cameroon) verse-aligned with
//           the New International Version (parallel)
//   audio : REAL native Kom recordings — 28 chapters of Matthew (Bible.is
//           fileset BKMBSCN2DA, ℗ 2007 Hosanna / Faith Comes By Hearing),
//           re-encoded 24kbps mono and hosted in /audio/bkm/matthew/.
//
// Directive 9: this is REAL recorded speech — nothing on this page is
// synthesized. Verse-level timing is not provided by the source, so audio
// streams per chapter while the learner follows the verse list.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Spinner } from "./shared";
import { VoiceSelect } from "./voice-select";
import { PLATFORM_VOICES, voicesForLang } from "@/lib/data/voices";
import { cn } from "@/lib/utils";

interface ChapterMeta {
  chapter: number;
  titleKom: string;
  verseCount: number;
  durationS: number;
  audioPath: string;
}
interface VerseRow {
  v: number;
  kom: string | null;
  niv: string | null;
}
interface ScriptureIndex {
  id: string;
  languageName: string;
  bookKom: string;
  bookEn: string;
  komVersion: string;
  parallelVersion: string;
  audio: string;
  source: string;
  note: string;
  totalChapters: number;
  totalVerses: number;
  totalDurationS: number;
  chapters: ChapterMeta[];
}

function fmtDur(s: number): string {
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}

export function ScripturePlayer() {
  const { lang } = useApp();
  const fr = lang === "fr";
  const [idx, setIdx] = React.useState<ScriptureIndex | null>(null);
  const [chapter, setChapter] = React.useState<ChapterMeta | null>(null);
  const [verses, setVerses] = React.useState<VerseRow[]>([]);
  const [loadingChapter, setLoadingChapter] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showNiv, setShowNiv] = React.useState(true);
  const [voiceId, setVoiceId] = React.useState<string>("bkm_nt_narrator");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scripture");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setIdx(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load scripture index");
      }
    })();
  }, []);

  const loadChapter = React.useCallback(async (c: number) => {
    setLoadingChapter(true);
    setError(null);
    try {
      const res = await fetch(`/api/scripture?chapter=${c}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChapter({
        chapter: data.chapter.chapter,
        titleKom: data.chapter.titleKom,
        verseCount: data.chapter.verses.length,
        durationS: data.chapter.durationS,
        audioPath: data.chapter.audioPath,
      });
      setVerses(data.chapter.verses);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load chapter");
    } finally {
      setLoadingChapter(false);
    }
  }, []);

  const narrator = PLATFORM_VOICES.find((v) => v.id === voiceId);
  const komVoices = voicesForLang("bkm");

  if (error && !idx) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">
        {error}
      </div>
    );
  }
  if (!idx) return <Spinner />;

  return (
    <div className="space-y-4">
      {/* header */}
      <section className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-sm" aria-label={fr ? "Bible audio en kom" : "Kom Audio Bible"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-emerald-900">
              📖 {fr ? "Bible audio en kom" : "Kom Audio Bible"} — {idx.bookKom} ({idx.bookEn.split(" ").slice(-1)})
            </h3>
            <p className="text-xs font-semibold text-emerald-700">
              {idx.totalChapters} {fr ? "chapitres" : "chapters"} · {idx.totalVerses} {fr ? "versets" : "verses"} ·{" "}
              {fmtDur(idx.totalDurationS)} {fr ? "d'audio natif réel" : "of real native audio"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* NIV parallel toggle */}
            <button
              type="button"
              onClick={() => setShowNiv(!showNiv)}
              aria-pressed={showNiv}
              className={cn(
                "min-h-[36px] rounded-lg border-2 px-2.5 text-xs font-extrabold transition-all",
                showNiv ? "border-sky-500 bg-sky-100 text-sky-900" : "border-sky-200 bg-white text-sky-700 hover:border-sky-400"
              )}
            >
              {fr ? "🇬🇧 Parallèle NIV" : "🇬🇧 NIV parallel"}: {showNiv ? (fr ? "activé" : "on") : fr ? "désactivé" : "off"}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-stone-600">
          <b>{fr ? "Texte kom :" : "Kom text:"}</b> {idx.komVersion} · <b>{fr ? "Parallèle :" : "Parallel:"}</b> {idx.parallelVersion} ·{" "}
          <b>{fr ? "Audio :" : "Audio:"}</b> {idx.audio}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-stone-600">
          🎙️ {fr ? "Voix enregistrée (jamais synthétisée — Directive 9)" : "Recorded voice (never synthesized — Directive 9)"} ·{" "}
          <a className="font-bold text-emerald-700 underline" href={idx.source} target="_blank" rel="noreferrer">{idx.source}</a>
        </p>
        {idx.note && <p className="mt-1 text-[10px] italic leading-snug text-stone-500">{idx.note}</p>}
      </section>

      {/* voice picker */}
      <section className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm" aria-label={fr ? "Voix du narrateur" : "Narrator voice"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h4 className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-600">
              {fr ? "Voix / locuteur" : "Voice / speaker"}
            </h4>
            <VoiceSelect value={voiceId} onChange={setVoiceId} lang={lang} compact langs={["bkm"]} />
          </div>
          <div className="min-w-0">
            <h4 className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-600">
              {fr ? "À propos de cette voix" : "About this voice"}
            </h4>
            {narrator ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-2.5">
                <p className="text-xs font-bold text-amber-900">{fr ? narrator.nameFr : narrator.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-stone-600">{fr ? narrator.noteFr : narrator.note}</p>
                <p className="mt-1 text-[10px] leading-snug text-stone-500">{narrator.source}</p>
              </div>
            ) : null}
            {komVoices.filter((v) => !v.available).length > 0 && (
              <p className="mt-1.5 text-[10px] font-semibold text-stone-500">
                + {komVoices.filter((v) => !v.available).length} {fr ? "emplacement(s) communautaire(s) en attente d'upload" : "community slot(s) awaiting upload"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* chapter picker */}
      <section aria-label={fr ? "Choisis un chapitre" : "Choose a chapter"} className="rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm">
        <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
          {fr ? "Chapitres — Matìyo" : "Chapters — Matìyo"}
        </h4>
        <div className="flex flex-wrap gap-1.5" role="group">
          {idx.chapters.map((c) => (
            <button
              key={c.chapter}
              type="button"
              onClick={() => void loadChapter(c.chapter)}
              aria-pressed={chapter?.chapter === c.chapter}
              title={`${c.titleKom} ${c.chapter} · ${c.verseCount} ${fr ? "versets" : "verses"} · ${fmtDur(c.durationS)}`}
              className={cn(
                "min-h-[36px] min-w-[36px] rounded-lg border-2 px-2 text-xs font-extrabold transition-all",
                chapter?.chapter === c.chapter
                  ? "border-emerald-600 bg-emerald-600 text-white shadow"
                  : "border-emerald-200 bg-white text-emerald-800 hover:border-emerald-400"
              )}
            >
              {c.chapter}
            </button>
          ))}
        </div>
      </section>

      {/* player + verses */}
      {chapter && (
        <section className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-md" aria-label={fr ? "Lecteur de chapitre" : "Chapter player"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-extrabold text-emerald-900">
              {chapter.titleKom} {chapter.chapter}{" "}
              <span className="text-xs font-bold text-stone-500">
                · {chapter.verseCount} {fr ? "versets" : "verses"} · {fmtDur(chapter.durationS)}
              </span>
            </h4>
            {loadingChapter && <Spinner />}
          </div>

          {/* REAL audio — recorded Kom narration */}
          <audio
            key={chapter.audioPath}
            controls
            preload="metadata"
            className="w-full"
            aria-label={fr ? `Audio de ${chapter.titleKom} ${chapter.chapter} — voix kom enregistrée` : `${chapter.titleKom} ${chapter.chapter} audio — recorded Kom voice`}
          >
            <source src={chapter.audioPath} type="audio/mpeg" />
            {fr ? "Votre navigateur ne supporte pas l'audio." : "Your browser does not support audio playback."}
          </audio>

          <ol className="max-h-[26rem] space-y-2.5 overflow-y-auto pr-1" aria-label={fr ? "Versets" : "Verses"}>
            {verses.map((row) => (
              <li key={row.v} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5">
                <div className="flex gap-2">
                  <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white" aria-label={`Verse ${row.v}`}>
                    {row.v}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-snug text-emerald-950">{row.kom ?? <i className="text-stone-400">—</i>}</p>
                    {showNiv && row.niv && (
                      <p className="mt-1 border-t border-dashed border-emerald-200 pt-1 text-xs leading-snug text-stone-600">{row.niv}</p>
                    )}
                    {!row.niv && (
                      <p className="mt-1 text-[10px] italic text-stone-400">
                        {fr ? "verset non présent dans la division NIV" : "no matching verse in the NIV division"}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!chapter && !loadingChapter && (
        <p className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center text-sm font-bold text-emerald-800">
          {fr ? "Choisis un chapitre ci-dessus pour écouter la vraie voix kom et suivre le texte." : "Pick a chapter above to hear the real Kom voice and follow the text."}
        </p>
      )}
    </div>
  );
}
