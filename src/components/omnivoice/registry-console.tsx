"use client";
// ============================================================================
// LANGUAGE REGISTRY CONSOLE (v3.0) — "Make provision for adding more
// dialects/local languages."
// Every registry-driven surface (landing picker, HUD chip, lesson hook
// switcher, Library Grassfields Wing, Supervisor audit matrix) derives from
// the registry — so a new dialect enters the platform in one step here:
//   DRAFT (community submission) → IN_REVIEW (native-speaker documentation)
//   → ACTIVE (ASR fine-tune + TTS voice + content library).
// ============================================================================
import React from "react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import {
  CONTENT_TARGETS, type LanguageStatus,
} from "@/lib/data/grassfields";
import { useLanguageRegistry } from "@/lib/use-language-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Draft {
  id: string; code: string; name: string; nativeName: string; iso: string;
  region: string; division: string; speakers: string; tones: string;
  priority: string; notes: string; status: string; createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-lime-600 text-white",
  ACTIVE_PLACEHOLDER: "bg-orange-500 text-white",
  PLANNED: "bg-stone-200 text-stone-600",
  DRAFT: "bg-sky-600 text-white",
  IN_REVIEW: "bg-amber-500 text-white",
};

export function statusLabel(status: string, fr: boolean): string {
  if (status === "ACTIVE") return fr ? "Active" : "Active";
  if (status === "ACTIVE_PLACEHOLDER") return fr ? "Nouvelle" : "New";
  if (status === "PLANNED") return fr ? "Planifiée" : "Planned";
  if (status === "IN_REVIEW") return fr ? "En révision" : "In review";
  return fr ? "Brouillon" : "Draft";
}

export function RegistryConsole() {
  const { lang } = useApp();
  const fr = lang === "fr";
  const reloadRegistry = useLanguageRegistry((s) => s.reload);
  const registryLanguages = useLanguageRegistry((s) => s.languages);
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ code: "", name: "", nativeName: "", region: "", division: "", speakers: "", tones: "", priority: "MEDIUM", notes: "" });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = React.useCallback(() => {
    setLoadError(null);
    fetch("/api/languages")
      .then((r) => {
        if (!r.ok) throw new Error(`registry unavailable (${r.status})`);
        return r.json();
      })
      .then((d) => setDrafts(d.drafts || []))
      .catch((e) => setLoadError(e instanceof Error ? e.message : "registry unavailable"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      trackEvent("language_registered", { code: form.code, name: form.name });
      setMsg({ kind: "ok", text: t("languageAdded", lang) });
      setForm({ code: "", name: "", nativeName: "", region: "", division: "", speakers: "", tones: "", priority: "MEDIUM", notes: "" });
      load();
      void reloadRegistry(); // propagate instantly to every picker (HUD, Landing, Profile, Teacher)
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Registration failed" });
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "h-10 w-full rounded-lg border-2 border-lime-300 bg-white px-2 text-sm font-semibold text-lime-900";
  const lbl = (s: string) => <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-lime-700">{s}</span>;

  return (
    <div className="space-y-4" role="tabpanel" aria-label={t("registryConsole", lang)}>
      {/* Intro + pipeline */}
      <section className="rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
        <h2 className="text-base font-extrabold text-sky-900">🧩 {t("registryConsole", lang)}</h2>
        <p className="mt-1 text-xs leading-relaxed text-sky-900/80">{t("registryIntro", lang)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
          <span className="rounded-full bg-sky-600 px-3 py-1 text-white">1. DRAFT</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-amber-500 px-3 py-1 text-white">2. IN_REVIEW — {fr ? "documentation par les natifs" : "native-speaker documentation"}</span>
          <span aria-hidden>→</span>
          <span className="rounded-full bg-lime-600 px-3 py-1 text-white">3. ACTIVE — ASR + TTS + {fr ? "contenu" : "content"}</span>
        </div>
      </section>

      {/* Add language form */}
      <section className="rounded-2xl border-2 border-lime-300 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold text-lime-900">➕ {t("addLanguage", lang)}</h3>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="lg-code">{lbl(fr ? "Code (3 lettres, ex. : bkm)" : "Code (3 letters, e.g. bkm)")}</label>
            <Input id="lg-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} maxLength={3} placeholder="e.g. ymb" className="h-10 border-lime-300" required />
          </div>
          <div>
            <label htmlFor="lg-name">{lbl(fr ? "Nom de la langue" : "Language name")}</label>
            <Input id="lg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={fr ? "ex. : Yambassa" : "e.g. Yambassa"} className="h-10 border-lime-300" required />
          </div>
          <div>
            <label htmlFor="lg-native">{lbl(fr ? "Endonyme (optionnel)" : "Native name (optional)")}</label>
            <Input id="lg-native" value={form.nativeName} onChange={(e) => setForm({ ...form, nativeName: e.target.value })} className="h-10 border-lime-300" />
          </div>
          <div>
            <label htmlFor="lg-region">{lbl(fr ? "Région" : "Region")}</label>
            <Input id="lg-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder={fr ? "ex. : Region du Centre" : "e.g. Centre Region"} className="h-10 border-lime-300" />
          </div>
          <div>
            <label htmlFor="lg-division">{lbl(fr ? "Département" : "Division")}</label>
            <Input id="lg-division" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className="h-10 border-lime-300" />
          </div>
          <div>
            <label htmlFor="lg-speakers">{lbl(fr ? "Locuteurs" : "Speakers")}</label>
            <Input id="lg-speakers" value={form.speakers} onChange={(e) => setForm({ ...form, speakers: e.target.value })} placeholder="~50,000" className="h-10 border-lime-300" />
          </div>
          <div>
            <label htmlFor="lg-tones">{lbl(fr ? "Système tonal" : "Tone system")}</label>
            <Input id="lg-tones" value={form.tones} onChange={(e) => setForm({ ...form, tones: e.target.value })} placeholder={fr ? "Tonal (à documenter)" : "Tonal (to be documented)"} className="h-10 border-lime-300" />
          </div>
          <div>
            <label htmlFor="lg-priority">{lbl(fr ? "Priorité" : "Priority")}</label>
            <select id="lg-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputCls}>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="lg-notes">{lbl(fr ? "Notes culturelles / linguistiques" : "Cultural / linguistic notes")}</label>
            <textarea id="lg-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} className="w-full rounded-lg border-2 border-lime-300 px-2 py-1.5 text-sm text-lime-900" />
          </div>
          {msg && (
            <p className={cn("sm:col-span-2 rounded-lg p-2 text-sm font-semibold", msg.kind === "ok" ? "bg-lime-50 text-lime-800" : "bg-red-50 text-red-700")} role="status">
              {msg.kind === "ok" ? "✅ " : "⚠️ "}{msg.text}
            </p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="h-12 w-full bg-lime-700 text-base font-extrabold hover:bg-lime-800">
              {busy ? "…" : `🪶 ${t("addLanguage", lang)}`}
            </Button>
          </div>
        </form>
      </section>

      {/* Registry matrix — static 8-language Grassfields matrix + community drafts */}
      <section className="rounded-2xl border-2 border-lime-200 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-extrabold text-lime-900">📋 {fr ? "Registre officiel (matrice corrigée v3.0)" : "Official registry (corrected v3.0 matrix)"}</h3>
        <p className="mb-3 text-[11px] text-amber-600">
          {fr ? "Kom et Lamnso' sont des langues distinctes · Bayangi ajouté en 8e position." : "Kom and Lamnso' are distinct languages · Bayangi added as the 8th entry."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              <tr className="border-b border-lime-200 text-[10px] uppercase text-lime-700">
                <th className="py-1.5 pr-2">#</th>
                <th className="py-1.5 pr-2">{fr ? "Langue" : "Language"}</th>
                <th className="py-1.5 pr-2">ISO</th>
                <th className="py-1.5 pr-2">{fr ? "Région" : "Region"}</th>
                <th className="py-1.5 pr-2">{fr ? "Locuteurs" : "Speakers"}</th>
                <th className="py-1.5 pr-2">{fr ? "Statut" : "Status"}</th>
                <th className="py-1.5">{fr ? "Priorité" : "Priority"}</th>
              </tr>
            </thead>
            <tbody>
              {registryLanguages.map((l, i) => (
                <tr key={l.code} className="border-b border-lime-50">
                  <td className="py-1.5 pr-2 font-bold text-amber-600">{i + 1}</td>
                  <td className="py-1.5 pr-2 font-extrabold text-lime-900">{l.flag} {l.name}{l.isDraft && <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-sky-700">community</span>}</td>
                  <td className="py-1.5 pr-2 font-mono text-amber-800">{l.iso}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{l.division || l.region}</td>
                  <td className="py-1.5 pr-2 text-amber-800">{l.speakers}</td>
                  <td className="py-1.5 pr-2">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase", STATUS_STYLE[l.status])}>
                      {statusLabel(l.status as LanguageStatus, fr)}
                    </span>
                  </td>
                  <td className={cn("py-1.5 font-extrabold", l.priority === "HIGH" ? "text-red-600" : l.priority === "MEDIUM" ? "text-amber-600" : "text-stone-500")}>{l.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Community drafts */}
      <section className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-sky-900">🗂️ {fr ? "Langues ajoutées par la communauté" : "Community-added languages"} ({drafts.length})</h3>
        {loadError ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-red-700" role="alert">⚠️ {fr ? "Registre indisponible" : "Registry unavailable"} — {loadError}</p>
            <Button size="sm" variant="outline" className="h-8 border-sky-300 text-sky-800" onClick={load}>
              🔄 {fr ? "Réessayer" : "Retry"}
            </Button>
          </div>
        ) : loading ? (
          <p className="text-xs text-amber-600">…</p>
        ) : drafts.length === 0 ? (
          <p className="text-xs text-amber-600">{fr ? "Aucune langue communautaire pour l'instant — utilisez le formulaire ci-dessus pour en ajouter une." : "No community languages yet — use the form above to add one."}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {drafts.map((d) => (
              <li key={d.id} className="rounded-xl border-2 border-sky-100 bg-sky-50/60 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-sky-900">🪶 {d.name} ({d.code})</b>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase", STATUS_STYLE[d.status] || "bg-sky-600 text-white")}>
                    {statusLabel(d.status, fr)}
                  </span>
                </div>
                {d.region && <p className="mt-0.5 text-amber-700">📍 {d.region}{d.division ? ` — ${d.division}` : ""}</p>}
                {d.speakers && <p className="text-amber-700">🗣️ {d.speakers}</p>}
                {d.notes && <p className="mt-1 leading-snug text-amber-800">{d.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pipeline checklist — what happens after registration */}
      <section className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-extrabold text-amber-900">🛠️ {fr ? "Pipeline d'intégration (automatique)" : "Integration pipeline (automatic)"}</h3>
        <ol className="grid gap-1.5 text-xs text-amber-900 sm:grid-cols-2">
          <li className="rounded-lg bg-amber-50 p-2">1. {fr ? "Le code apparaît immédiatement dans le menu déroulant des langues nationales (HUD, accueil, profil, enseignant)" : "The code instantly appears in the national-language dropdown menu (HUD, landing, profile, teacher)"}</li>
          <li className="rounded-lg bg-amber-50 p-2">2. {fr ? "Fiche profil dans l'Aile Grassfields de la bibliothèque" : "Profile card in the Library Grassfields Wing"}</li>
          <li className="rounded-lg bg-amber-50 p-2">3. {fr ? "Ligne dans la matrice du registre ci-dessus" : "Row in the registry matrix above"}</li>
          <li className="rounded-lg bg-amber-50 p-2">4. {fr ? "Inscrit au plan de collecte (cible CONTENT_TARGETS) — les contenus arrivent via 📥 Ingestion" : "Enrolled in the collection plan (CONTENT_TARGETS) — content arrives via 📥 Ingestion"}</li>
        </ol>
        <p className="mt-2 rounded-xl bg-sky-50 p-2.5 text-[11px] leading-relaxed text-sky-900">
          {fr
            ? "💬 Vous avez des mots, phrases ou salutations dans votre langue ? Ne vous contentez pas d'ajouter la langue — envoyez le contenu via l'onglet 📥 Ingestion de contenu : il sera vérifié puis publié avec votre nom."
            : "💬 Have words, phrases or greetings in your language? Don't just add the language — submit the content through the 📥 Content Ingestion tab: it will be reviewed and published with your name credited."}
        </p>
        <p className="mt-2 text-[11px] text-amber-600">
          {fr ? "Cibles de contenu par langue : " : "Per-language content targets: "}
          {CONTENT_TARGETS.slice(0, 4).map((c) => `${c.type} (${c.quantity})`).join(" · ")}
        </p>
      </section>
    </div>
  );
}
