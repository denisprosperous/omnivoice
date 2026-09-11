/**
 * OMNIVOICE v4.2 §6.2 — Kom Lexicon (Phase 1: 500 high-frequency entries,
 * Classes 1–3). Built from lexicon-concepts.ts + attested sources.
 *
 * SOURCES (attestation chain):
 *  - Hyman, L.M. (UC Berkeley) Tables 1–9 — 44 tone-marked words w/ noun classes
 *  - en.wiktionary.org Kom (Cameroon) translations — corroboration + additions
 *  - Master Prompt v2.0 §7.3 verbatim phrases — 4
 *  - Jones (2001) Provisional Kom–English Lexicon (225pp) — CLOUDFLARE-GATED;
 *    entries awaiting its content carry word: null + PENDING_NATIVE_REVIEW.
 *    The platform never fabricates Kom lexemes (Directive 9).
 */

import {
  CONCEPTS, ATTESTED_PHRASES, WIKTIONARY_EXTRA, ConceptTuple,
} from "@/lib/data/lexicon-concepts";
import { KOM_ATTESTED_VOCAB } from "@/lib/data/kom-resources";
import { analyzeKomTones } from "@/lib/kom-tone-engine";

export interface LexEntry {
  id: string;
  lang: "bkm";
  /** Kom form — null when awaiting native/lexicon-source gloss */
  word: string | null;
  glossEn: string;
  glossFr: string;
  pos: string;
  /** Surface tone pattern, e.g. "M-HL" (Hyman convention) — derived, null when unattested */
  tonePattern: string | null;
  nounClass: string | null;
  example: string | null;
  exampleEn: string | null;
  culturalNote: string;
  phase: 1 | 2 | 3;
  classBand: "1-2" | "3";
  ilt: string;
  attestation: "attested" | "awaiting";
  source: string | null;
  /** Directive 9: no synthetic Grassfields audio without native reference */
  audioStatus: string;
  reviewStatus: "VALIDATED" | "PENDING_NATIVE_REVIEW";
}

const HYMAN_SOURCE =
  "Hyman (UC Berkeley) — Initial Vowel and Prefix Tone in Kom, Tables 1–9";

const norm = (s: string) => s.toLowerCase().replace(/\s*\(.*\)\s*/g, "").trim();

/** Aliases so concept tuples don't duplicate attested glosses */
const ALIASES: Record<string, string> = {
  "fetch (water)": "water",
  "carving": "carve",
};

function buildAttestedMap(): Map<string, { kom: string; nounClass: string | null; source: string }> {
  const m = new Map<string, { kom: string; nounClass: string | null; source: string }>();
  for (const w of KOM_ATTESTED_VOCAB) {
    const key = norm(w.en);
    if (!m.has(key)) m.set(key, { kom: w.kom, nounClass: w.nounClass ?? null, source: HYMAN_SOURCE });
  }
  for (const w of WIKTIONARY_EXTRA) {
    const key = norm(w.en);
    if (!m.has(key)) m.set(key, { kom: w.kom, nounClass: null, source: w.source });
    else m.get(key)!.source += `; corroborated by ${w.source}`;
  }
  return m;
}

/** Derive the surface tone pattern (Hyman convention) from tone-marked orthography */
export function deriveTonePattern(word: string): string | null {
  const words = word.split(/\s+/).filter(Boolean);
  const parts: string[] = [];
  for (const w of words) {
    const tbus = analyzeKomTones(w);
    if (tbus.length === 0) return null;
    const pattern = tbus
      .map((t, i) => {
        if (t.tone === "F") return "HL"; // falling contour
        if (t.tone === "L") return "L";
        if (t.tone === "U") return i === 0 && tbus.length >= 2 ? "M" : "H";
        return "?";
      })
      .join("-");
    parts.push(pattern);
  }
  return parts.join(" / ");
}

const ILT_CULTURAL: Record<string, string> = {
  home: "Household life in Kom homes — compound living, shared chores, respect for elders.",
  village: "Village life in Boyo Division — farming, communal work, market days.",
  school: "Classroom practice — Kom medium instruction within the NACALCO/PROPELCA literacy tradition.",
  occupations: "Traditional and modern trades in Kom land — crafts carried with pride.",
  travelling: "Journeys between Kom villages and the Bamenda grassfields road network.",
  health: "Health practices blending the Fon's shrine, the clinic, and preventive care.",
  games: "Traditional games, music and dance of the Kom people.",
  communication: "Greetings and polite speech carry strong social value in Kom culture.",
};

const CULTURAL_OVERRIDES: Record<string, string> = {
  "kola nut": "Kola nuts (te-bìì) are presented to welcome visitors and seal engagements in Kom.",
  "porridge": "Corn porridge (aru) is a staple breakfast across Boyo Division.",
  "greeting": "Greeting elders in Kom is compulsory; skipping a greeting is disrespectful.",
  "chief": "The Fon of Laikom is the paramount chief of Kom; te-fôyn is the attested plural 'chiefs'.",
  "market": "e-wé — eight-day markets rotate across Kom villages.",
};

export function buildKomLexicon(): LexEntry[] {
  const attestedMap = buildAttestedMap();
  const entries: LexEntry[] = [];
  const TARGET = 500;

  // 1) Attested words first
  const usedKeys = new Set<string>();
  let id = 1;
  for (const [key, a] of attestedMap) {
    const pos = key === "with (comitative)" || key === "to (dative)" || key === "will (future marker)"
      ? "particle" : key === "fall" ? "verb" : "noun";
    entries.push({
      id: `KOM-${String(id).padStart(3, "0")}`,
      lang: "bkm",
      word: a.kom,
      glossEn: key,
      glossFr: "", // filled from concept tuples when available
      pos,
      tonePattern: deriveTonePattern(a.kom),
      nounClass: a.nounClass,
      example: null,
      exampleEn: null,
      culturalNote: CULTURAL_OVERRIDES[key] ?? ILT_CULTURAL.home,
      phase: 1,
      classBand: "1-2",
      ilt: "home",
      attestation: "attested",
      source: a.source,
      audioStatus: "tts-synthesizable (native reference audio pending — Directive 9)",
      reviewStatus: "VALIDATED",
    });
    usedKeys.add(key);
    id += 1;
  }

  // 2) Attested §7.3 phrases
  for (const p of ATTESTED_PHRASES) {
    entries.push({
      id: `KOM-${String(id).padStart(3, "0")}`,
      lang: "bkm",
      word: p.kom,
      glossEn: p.en,
      glossFr: p.fr,
      pos: "phrase",
      tonePattern: deriveTonePattern(p.kom),
      nounClass: null,
      example: p.kom,
      exampleEn: p.en,
      culturalNote: "Spec-attested classroom phrase (verbatim).",
      phase: 1,
      classBand: "1-2",
      ilt: p.ilt,
      attestation: "attested",
      source: p.source,
      audioStatus: "tts-synthesizable (native reference audio pending — Directive 9)",
      reviewStatus: "VALIDATED",
    });
    id += 1;
  }

  // 3) Curriculum concepts — attested glosses deduped, Kom form awaits lexicon source
  for (const tuple of CONCEPTS as ConceptTuple[]) {
    if (entries.length >= TARGET) break;
    const [en, fr, pos, ilt, band] = tuple;
    const key = norm(ALIASES[en] ?? en);
    if (usedKeys.has(key)) continue;
    const att = attestedMap.get(key);
    usedKeys.add(key);
    entries.push({
      id: `KOM-${String(id).padStart(3, "0")}`,
      lang: "bkm",
      word: att?.kom ?? null,
      glossEn: en,
      glossFr: fr,
      pos,
      tonePattern: att ? deriveTonePattern(att.kom) : null,
      nounClass: att?.nounClass ?? null,
      example: null,
      exampleEn: null,
      culturalNote: CULTURAL_OVERRIDES[norm(en)] ?? ILT_CULTURAL[ilt] ?? "Kom cultural context to be added with native review.",
      phase: 1,
      classBand: band as "1-2" | "3",
      ilt: ilt,
      attestation: att ? "attested" : "awaiting",
      source: att?.source ?? null,
      audioStatus: att ? "tts-synthesizable (native reference audio pending — Directive 9)" : "no audio (word awaiting native gloss)",
      reviewStatus: att ? "VALIDATED" : "PENDING_NATIVE_REVIEW",
    });
    id += 1;
  }

  return entries;
}

export const LEXICON_PHASES = [
  { phase: 1, name: "High-frequency", target: 500, classes: "1–3", status: "THIS RELEASE" },
  { phase: 2, name: "Curriculum", target: 1500, classes: "4–6", status: "planned" },
  { phase: 3, name: "Full", target: 3000, classes: "secondary", status: "planned" },
] as const;

export function lexiconStats(entries: LexEntry[]) {
  return {
    total: entries.length,
    attested: entries.filter((e) => e.attestation === "attested").length,
    awaiting: entries.filter((e) => e.attestation === "awaiting").length,
    withTonePattern: entries.filter((e) => e.tonePattern).length,
    byIlt: entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.ilt] = (acc[e.ilt] ?? 0) + 1;
      return acc;
    }, {}),
    unlock: "Jones (2001) Provisional Kom–English Lexicon — sil.org/system/files/reapdata/61/13/74/61137409511288881581803410609212027167/KomLexicon.pdf (Cloudflare-gated)",
  };
}
