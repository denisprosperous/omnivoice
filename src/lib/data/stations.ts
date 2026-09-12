/**
 * OMNIVOICE v4.2 §6.4 — Kom NT listening stations.
 *
 * Audio is the REAL recorded Kom NT (2004) streamed via the access points
 * harvested from find.bible (bible.is + Digital Bible Library). The platform
 * never synthesizes scripture narration (Directive 9 + licence), so each
 * station wires: external streaming link + comprehension + vocabulary
 * extraction (from the attested lexicon) + retelling.
 *
 * Licence note: bible.is / DBL streaming requires production licence
 * clearance — surfaced in the supervisor resource inventory.
 */

export interface StationQuestion {
  q: string;
  qFr: string;
  a: string;
}

export interface ListeningStation {
  id: string;
  titleKom: string;
  titleEn: string;
  passage: string; // book reference
  duration: string; // stipulated timings (§6.4)
  classBand: "5-6" | "6";
  audioSources: Array<{ label: string; url: string; kind: "streaming" | "app" | "library" }>;
  licenced: boolean;
  licenceNote: string;
  comprehension: StationQuestion[];
  vocabExtraction: { instruction: string; instructionFr: string; anchors: string[] };
  retelling: { prompt: string; promptFr: string };
  ilt: string;
}

export const LISTENING_STATIONS: ListeningStation[] = [
  {
    id: "LS-MRK-1",
    titleKom: "Mark 1 (title as printed in the Kom NT — pending ingestion)",
    titleEn: "Gospel of Mark, Chapter 1 — the voice in the wilderness",
    passage: "Mark 1:1–8",
    duration: "5:30",
    classBand: "5-6",
    audioSources: [
      { label: "bible.is — Kom (Itaŋikom) streaming", url: "https://live.bible.is/bible/BKMBSC/MRK/1", kind: "streaming" },
      { label: "Digital Bible Library record", url: "https://find.bible/bibles/BKMBSC", kind: "library" },
    ],
    licenced: false,
    licenceNote: "bible.is / DBL streaming requires production licence clearance before classroom rollout (documented in supervisor resource inventory).",
    comprehension: [
      { q: "Who speaks in the desert, and what does he call people to do?", qFr: "Qui parle dans le désert, et que demande-t-il aux gens ?", a: "John the Baptist calls people to repent and be baptized (Mark 1:4)." },
      { q: "Whose way is John preparing?", qFr: "De qui Jean prépare-t-il la voie ?", a: "The way of the Lord (Mark 1:2–3)." },
      { q: "What did people confess at the Jordan?", qFr: "Que confessait le peuple au Jourdain ?", a: "Their sins (Mark 1:5)." },
    ],
    vocabExtraction: {
      instruction: "While listening, note five Kom words you recognize; check them against the lexicon (tone marks included).",
      instructionFr: "En écoutant, note cinq mots kom reconnus ; vérifie-les dans le lexique (avec les tons).",
      anchors: ["wáyn", "muú", "ŋwàʼlɨ̀", "nè", "ká"],
    },
    retelling: {
      prompt: "Retell Mark 1:1–8 in five Kom sentences; mark the tone of every new word.",
      promptFr: "Raconte Marc 1:1–8 en cinq phrases kom ; marque le ton de chaque nouveau mot.",
    },
    ilt: "communication",
  },
  {
    id: "LS-LUK-15",
    titleKom: "Luke 15 (title as printed in the Kom NT — pending ingestion)",
    titleEn: "Gospel of Luke, Chapter 15 — the lost is found",
    passage: "Luke 15:1–10",
    duration: "4:45",
    classBand: "6",
    audioSources: [
      { label: "bible.is — Kom (Itaŋikom) streaming", url: "https://live.bible.is/bible/BKMBSC/LUK/15", kind: "streaming" },
      { label: "Digital Bible Library record", url: "https://find.bible/bibles/BKMBSC", kind: "library" },
    ],
    licenced: false,
    licenceNote: "bible.is / DBL streaming requires production licence clearance before classroom rollout.",
    comprehension: [
      { q: "What three lost things does this chapter describe?", qFr: "Quelles trois choses perdues ce chapitre décrit-il ?", a: "A lost sheep, a lost coin, and a lost son (Luke 15)." },
      { q: "What does the shepherd do when he finds the sheep?", qFr: "Que fait le berger quand il retrouve la brebis ?", a: "He calls his friends and neighbours to rejoice (Luke 15:6)." },
    ],
    vocabExtraction: {
      instruction: "Collect animal and family words from the passage; add noun-class prefixes you hear.",
      instructionFr: "Releve les mots d'animaux et de famille ; ajoute les préfixes de classe entendus.",
      anchors: ["wáyn", "ghóyn", "ŋgvɨ̀", "e-nyám", "e-ndo"],
    },
    retelling: {
      prompt: "Act the lost-sheep story in groups: narrator + shepherd + friends. Speak only Kom.",
      promptFr: "Jouez l'histoire de la brebis perdue : narrateur + berger + amis. Parlez uniquement kom.",
    },
    ilt: "communication",
  },
];
