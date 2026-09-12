"use client";
// ============================================================================
// INGESTION PORTAL — TRUSTED CONTENT INGESTION (user directive: "We should
// have the option to ingest trusted data from tutors, parents and educational
// authorities and adding to the platform").
//
// WHO      — tutors, parents/guardians, educational authorities (delegates),
//            and any native speaker working with them.
// WHAT     — words, phrases, greetings, dialogues, songs, stories, corrections
//            for any registry language (Kom, Ewondo, Lamnso', Bayangi, …).
// RULES    — every entry carries a SOURCE citation; national-language entries
//            require a native-speaker confirmation (Directive 9). Nothing is
//            published until it passes the review pipeline:
//            DRAFT → IN_REVIEW → ACTIVE (published) | REJECTED.
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useLanguageRegistry } from "@/lib/use-language-registry";
import { NationalLanguageSelect, statusChip } from "./national-language-select";
import { speak } from "@/lib/voice-client";
import { playBadge } from "@/lib/sound-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  contributorName: string;
  contributorRole: string;
  lang: string;
  contentType: string;
  nativeText: string;
  translationEn: string;
  translationFr: string;
  source: string;
  nativeSpeakerConfirmed: boolean;
  notes: string;
  status: string;
  reviewerNote: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { id: "tutor", en: "Tutor", fr: "Tuteur / Répétiteur" },
  { id: "parent", en: "Parent / Guardian", fr: "Parent / Tuteur légal" },
  { id: "authority", en: "Educational authority / Delegate", fr: "Autorité éducative / Délégué" },
  { id: "other", en: "Native speaker (other)", fr: "Locuteur natif (autre)" },
];

const TYPE_OPTIONS = [
  { id: "greeting", en: "Greeting", fr: "Salutation" },
  { id: "word", en: "Word", fr: "Mot" },
  { id: "phrase", en: "Phrase", fr: "Phrase" },
  { id: "dialogue", en: "Dialogue", fr: "Dialogue" },
  { id: "song", en: "Song / Rhyme", fr: "Chanson / Comptine" },
  { id: "story", en: "Story / Folktale", fr: "Histoire / Conte" },
  { id: "correction", en: "Correction of existing content", fr: "Correction d'un contenu existant" },
];

const SUBMISSION_STATUS: Record<string, { cls: string }> = {
  DRAFT: { cls: "bg-sky-600 text-white" },
  IN_REVIEW: { cls: "bg-amber-500 text-white" },
  ACTIVE: { cls: "bg-lime-600 text-white" },
  REJECTED: { cls: "bg-stone-400 text-white" },
};

const emptyForm = {
  contributorRole: "tutor",
  contributorName: "",
  contact: "",
  lang: "bkm",
  contentType: "greeting",
  nativeText: "",
  translationEn: "",
  translationFr: "",
  source: "",
  notes: "",
  nativeSpeakerConfirmed: false,
};

export function IngestionPortal() {
  const { lang, learner } = useApp();
  const fr = lang === "fr";
  const { languages, reload: reloadRegistry } = useLanguageRegistry();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState(emptyForm);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmSubmit, setConfirmSubmit] = React.useState(false);

  const isReviewer = learner?.role === "supervisor" || learner?.role === "teacher";

  const load = React.useCallback(() => {
    fetch("/api/ingest")
      .then((r) => r.json())
      .then((d) => setSubmissions(d.submissions || []))
      .catch(() => setMsg({ kind: "err", text: fr ? "Impossible de charger les soumissions." : "Could not load submissions." }))
      .finally(() => setLoading(false));
  }, [fr]);

  React.useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      playBadge();
      setMsg({
        kind: "ok",
        text: fr
          ? "Soumission enregistrée (DRAFT). Un encadreur la vérifiera avant publication — merci de faire vivre notre patrimoine !"
          : "Submission recorded (DRAFT). A supervisor will review it before publishing — thank you for growing our heritage!",
      });
      setForm(emptyForm);
      setConfirmSubmit(false);
      load();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setBusy(false);
    }
  }

  async function review(id: string, status: string) {
    await fetch("/api/ingest", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewerNote: learner?.name || "" }),
    });
    trackReview(status);
    load();
    if (status === "ACTIVE") void reloadRegistry();
  }

  function trackReview(_status: string) {
    // analytics hook (kept minimal)
  }

  const langName = (code: string) => languages.find((l) => l.code === code)?.name || code.toUpperCase();
  const pending = submissions.filter((s) => s.status === "DRAFT" || s.status === "IN_REVIEW");
  const published = submissions.filter((s) => s.status === "ACTIVE");

  const inputCls = "h-11 w-full rounded-lg border-2 border-sky-200 bg-white px-2 text-sm font-semibold text-sky-950";
  const lbl = (s: string) => <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-sky-700">{s}</span>;

  return (
    <div className="space-y-4" role="tabpanel" aria-label={fr ? "Ingestion de contenu" : "Content Ingestion"}>
      {/* Intro */}
      <section className="rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
        <h2 className="text-base font-extrabold text-sky-900">📥 {fr ? "Ingestion de Contenu de Confiance" : "Trusted Content Ingestion"}</h2>
        <p className="mt-1 text-xs leading-relaxed text-sky-900/80">
          {fr
            ? "Enseignants, parents, tuteurs et autorités éducatives : ajoutez vos langues nationales directement sur la plateforme. Chaque entrée cite sa source et n'est publiée qu'après vérification — le contenu non sourcé n'apparaît jamais."
            : "Tutors, parents and educational authorities: add your national languages directly to the platform. Every entry cites its source and is published only after review — unsourced content never appears."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-white">1. DRAFT — {fr ? "soumission" : "submitted"}</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-amber-500 px-3 py-1 text-white">2. IN_REVIEW — {fr ? "vérification" : "checked"}</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-lime-600 px-3 py-1 text-white">3. ACTIVE — {fr ? "publié" : "published"}</span>
        </div>
      </section>

      {/* Submission form */}
      <section className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold text-sky-900">➕ {fr ? "Proposer un contenu" : "Submit content"}</h3>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ing-role">{lbl(fr ? "Je suis…" : "I am a…")}</label>
            <select id="ing-role" value={form.contributorRole} onChange={(e) => setForm({ ...form, contributorRole: e.target.value })} className={inputCls}>
              {ROLE_OPTIONS.map((r) => <option key={r.id} value={r.id}>{fr ? r.fr : r.en}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ing-name">{lbl(fr ? "Votre nom" : "Your name")}</label>
            <Input id="ing-name" value={form.contributorName} onChange={(e) => setForm({ ...form, contributorName: e.target.value })} maxLength={60} required className="h-11 border-sky-200" />
          </div>
          <div>
            <label htmlFor="ing-contact">{lbl(fr ? "Contact (optionnel — téléphone/email)" : "Contact (optional — phone/email)")}</label>
            <Input id="ing-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} maxLength={120} className="h-11 border-sky-200" />
          </div>
          <div>
            <label htmlFor="ing-type">{lbl(fr ? "Type de contenu" : "Content type")}</label>
            <select id="ing-type" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} className={inputCls}>
              {TYPE_OPTIONS.map((tp) => <option key={tp.id} value={tp.id}>{fr ? tp.fr : tp.en}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            {lbl(fr ? "Langue nationale" : "National language")}
            <NationalLanguageSelect
              value={form.lang}
              onChange={(code) => setForm({ ...form, lang: code })}
              lang={lang}
              compact
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ing-native">{lbl(fr ? "Texte dans la langue nationale (ton marqué si possible — GACL)" : "Text in the national language (tone-marked if possible — GACL)")}</label>
            <textarea id="ing-native" rows={2} value={form.nativeText} onChange={(e) => setForm({ ...form, nativeText: e.target.value })} maxLength={500} required className="w-full rounded-lg border-2 border-sky-200 px-2 py-1.5 text-sm font-semibold text-sky-950" />
          </div>
          <div>
            <label htmlFor="ing-en">{lbl(fr ? "Traduction anglaise" : "English translation")}</label>
            <Input id="ing-en" value={form.translationEn} onChange={(e) => setForm({ ...form, translationEn: e.target.value })} maxLength={500} className="h-11 border-sky-200" />
          </div>
          <div>
            <label htmlFor="ing-fr">{lbl(fr ? "Traduction française" : "French translation")}</label>
            <Input id="ing-fr" value={form.translationFr} onChange={(e) => setForm({ ...form, translationFr: e.target.value })} maxLength={500} className="h-11 border-sky-200" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ing-source">{lbl(fr ? "Source — qui l'a dit/écrit ? (obligatoire)" : "Source — who said/wrote it? (required)")}</label>
            <Input id="ing-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder={fr ? "ex. : dicté par ma grand-mère à Laikom, sept. 2026" : "e.g. dictated by my grandmother in Laikom, Sept 2026"} maxLength={300} required className="h-11 border-sky-200" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ing-notes">{lbl(fr ? "Notes (prononciation, contexte culturel, usage)" : "Notes (pronunciation, cultural context, usage)")}</label>
            <textarea id="ing-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} className="w-full rounded-lg border-2 border-sky-200 px-2 py-1.5 text-sm text-sky-950" />
          </div>
          <label htmlFor="ing-confirm" className="flex cursor-pointer items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900 sm:col-span-2">
            <input
              id="ing-confirm"
              type="checkbox"
              checked={confirmSubmit}
              onChange={(e) => { setConfirmSubmit(e.target.checked); setForm((f) => ({ ...f, nativeSpeakerConfirmed: e.target.checked })); }}
              className="mt-0.5 h-4 w-4"
              required
            />
            <span>
              {fr
                ? "Je confirme que ce contenu provient d'un LOCUTEUR NATIF de la langue choisie (moi-même ou une personne documentée) et que je cite ma source. Le contenu inventé ou non sourcé ne sera pas publié (Directive 9)."
                : "I confirm this content comes from a NATIVE SPEAKER of the chosen language (myself or a documented person) and I cite my source. Invented or unsourced content will not be published (Directive 9)."}
            </span>
          </label>
          {msg && (
            <p className={cn("sm:col-span-2 rounded-lg p-2 text-sm font-semibold", msg.kind === "ok" ? "bg-lime-50 text-lime-800" : "bg-red-50 text-red-700")} role="status">
              {msg.kind === "ok" ? "✅ " : "⚠️ "}{msg.text}
            </p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="h-12 w-full bg-sky-700 text-base font-extrabold hover:bg-sky-800">
              {busy ? "…" : `📥 ${fr ? "Envoyer pour vérification" : "Submit for review"}`}
            </Button>
          </div>
        </form>
      </section>

      {/* Published content */}
      <section className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-lime-900">✅ {fr ? "Contenu publié (validé)" : "Published (validated) content"} ({published.length})</h3>
        {loading ? (
          <p className="text-xs text-amber-600">…</p>
        ) : published.length === 0 ? (
          <p className="text-xs text-amber-600">
            {fr
              ? "Rien de publié pour l'instant — les premières salutations validées arriveront ici, avec le nom de leur contributeur et la source."
              : "Nothing published yet — the first validated greetings will appear here with contributor credit and source."}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {published.map((s) => (
              <li key={s.id} className="rounded-xl border-2 border-lime-100 bg-lime-50/60 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-lime-900">🇨🇲 {langName(s.lang)} · {TYPE_OPTIONS.find((tp) => tp.id === s.contentType)?.[fr ? "fr" : "en"] || s.contentType}</b>
                  <button
                    onClick={() => { playBadge(); void speak(s.nativeText, "kwe", s.lang); }}
                    className="min-h-[28px] rounded-full bg-lime-600 px-2 text-[10px] font-extrabold text-white hover:bg-lime-700"
                    aria-label={fr ? `Écouter : ${s.nativeText}` : `Listen: ${s.nativeText}`}
                  >
                    🔊 {fr ? "Écouter" : "Listen"}
                  </button>
                </div>
                <p className="mt-1 text-base font-extrabold text-lime-950">{s.nativeText}</p>
                {(s.translationEn || s.translationFr) && <p className="text-amber-800">{s.translationEn}{s.translationFr ? ` · ${s.translationFr}` : ""}</p>}
                <p className="mt-1 text-[10px] text-amber-600">👤 {s.contributorName} ({ROLE_OPTIONS.find((r) => r.id === s.contributorRole)?.[fr ? "fr" : "en"] || s.contributorRole})</p>
                <p className="text-[10px] italic text-amber-600">📚 {s.source}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Review queue (teachers + supervisors) */}
      {isReviewer && (
        <section className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-extrabold text-amber-900">🧑🏾‍🏫 {fr ? "File de vérification" : "Review queue"} ({pending.length})</h3>
          <p className="mb-3 text-[11px] text-amber-600">
            {fr
              ? "Vérifiez chaque entrée auprès d'un locuteur natif avant publication. Publier = le contenu apparaît sur la plateforme avec le crédit du contributeur."
              : "Verify each entry with a native speaker before publishing. Publish = the content appears platform-wide with contributor credit."}
          </p>
          {pending.length === 0 ? (
            <p className="text-xs text-amber-600">{fr ? "Aucune soumission en attente." : "No submissions waiting."}</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((s) => (
                <li key={s.id} className="rounded-xl border-2 border-amber-100 bg-amber-50/50 p-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b className="text-amber-900">{langName(s.lang)} · {TYPE_OPTIONS.find((tp) => tp.id === s.contentType)?.[fr ? "fr" : "en"] || s.contentType}</b>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase", SUBMISSION_STATUS[s.status]?.cls)}>{s.status.replace("_", " ")}</span>
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-amber-950">{s.nativeText}</p>
                  {(s.translationEn || s.translationFr) && <p className="text-amber-800">{s.translationEn}{s.translationFr ? ` · ${s.translationFr}` : ""}</p>}
                  <p className="mt-0.5 text-[10px] text-amber-700">👤 {s.contributorName} · 📚 {s.source} {s.nativeSpeakerConfirmed && "· ✅ native-speaker confirmed"}</p>
                  {s.notes && <p className="mt-0.5 text-[10px] italic text-amber-700">📝 {s.notes}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.status === "DRAFT" && (
                      <Button size="sm" className="h-8 bg-amber-500 text-white hover:bg-amber-600" onClick={() => review(s.id, "IN_REVIEW")}>
                        🔍 {fr ? "Mettre en vérification" : "Start review"}
                      </Button>
                    )}
                    <Button size="sm" className="h-8 bg-lime-600 text-white hover:bg-lime-700" onClick={() => review(s.id, "ACTIVE")}>
                      ✅ {fr ? "Publier" : "Publish"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-red-300 text-red-700" onClick={() => review(s.id, "REJECTED")}>
                      ✖ {fr ? "Rejeter" : "Reject"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* All submissions (transparency) */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-stone-800">🗂️ {fr ? "Toutes les soumissions" : "All submissions"} ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <p className="text-xs text-amber-600">{fr ? "Soyez le premier à contribuer !" : "Be the first contributor!"}</p>
        ) : (
          <ul className="space-y-1 text-[11px]">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-2 py-1.5">
                <span className="min-w-0 flex-1 truncate text-stone-700">
                  <b>{s.nativeText}</b> — {langName(s.lang)} · {s.contributorName}
                </span>
                <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase", SUBMISSION_STATUS[s.status]?.cls)}>{s.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
