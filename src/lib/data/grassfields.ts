// ============================================================================
// GRASSFIELDS LANGUAGES EXPANSION PACK — OmniVoice Edition v3.0
// (Preview Deployment & Live Demo Edition)
// Per Master Negentropic Prompt v2.0 §2.1–2.9 (Expansion Pack), §4.1 (speech
// stack), §6.4–6.5 (voice data model + tone-aware pipeline), §7.2 Directive 9
// (Grassfields Language Accuracy), §X (build audit + roadmap + metrics) and
// the v3.0 Preview Edition audit corrections:
//   • Correction 1 — Kom (bkm) and Lamnso' (lns) are DISTINCT languages and
//     are tracked as separate entries everywhere (ASR datasets, TTS voices,
//     content libraries, audit rows, success metrics).
//   • Correction 2 — Bayangi (byv) added as the 8th Grassfields language with
//     placeholder content + data collection plan (SIL Cameroon, Q2 2025).
//   • Correction 3 — corrected 8-language Grassfields matrix (§2.2 v3.0).
//
// GACL = General Alphabet of Cameroonian Languages (1979). All Grassfields
// content MUST be GACL-compliant with tone markings (Directive 9).
// ============================================================================

// ---------------------------------------------------------------------------
// §2.2 Target Languages — corrected 8-language Grassfields matrix (v3.0)
// # | Language | ISO | Region | Speakers | Status | Priority
// 1 Kom (Bikom) bkm Boyo, NW 233,000 Active HIGH
// 2 Lamnso' (Lamso) lns Nso, NW 125,000 Active HIGH
// 3 Bayangi (Banyangi) byv Manyu, SW 50,000 NEW HIGH
// 4 Bafut bfd Mezam, NW 105,000 Planned MEDIUM
// 5 Oku oku Bui, NW 40,000 Planned MEDIUM
// 6 Babanki bbk Mezam, NW 25,000 Planned LOW
// 7 Mankon mgo Mezam, NW 80,000 Planned MEDIUM
// 8 Ngie ngi Momo, NW 40,000 Planned LOW
// ---------------------------------------------------------------------------

export type GrassfieldsCode = "bkm" | "lns" | "byv" | "bfd" | "oku" | "bbk" | "mgo" | "ngi";

export type LanguageStatus = "ACTIVE" | "ACTIVE_PLACEHOLDER" | "PLANNED";

export interface GrassfieldsLanguage {
  code: GrassfieldsCode;
  name: string;
  nativeName: string; // endonym
  iso: string;
  alternateNames: string[];
  region: string;
  division: string;
  speakers: string;
  tones: string; // tone system summary
  toneNotation: { system: string; detail: string }; // v3.0 tone_notation
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: LanguageStatus; // v3.0 corrected matrix
  trainingHours: string; // fine-tuning data requirement (§4.1.1)
  greeting: string; // v3.0 data model — spec-attested or placeholder
  thankYou: string;
  howAreYou: string;
  asrModel: string | null; // v3.0: custom/<lang>-asr-v1 (null = pending data)
  ttsVoice: string | null; // v3.0: custom/<lang>-voice-v1 (null = pending data)
  contentLibrary: { vocabulary: number; dialogues: number; songs: number; stories: number }; // v3.0 content_library counts
  culturalContext?: string; // v3.0 — cultural notes (Bayangi: dances/masquerade)
  flag: string;
}

const PENDING = "[To be documented]"; // v3.0 placeholder — to be documented with native speakers

export const GRASSFIELDS_LANGUAGES: GrassfieldsLanguage[] = [
  {
    // CORRECTION 1 — Kom is tracked SEPARATELY from Lamnso' (ISO bkm vs lns,
    // Central Ring vs West Ring, distinct tone systems).
    code: "bkm", name: "Kom (Bikom)", nativeName: "Itaŋikom", iso: "bkm",
    alternateNames: ["Bamekon", "Bekom", "Itangikom", "Nkom", "Kong"],
    region: "North West Region", division: "Boyo Division",
    speakers: "~233,000 (2005)", tones: "3 tones — high (unmarked), falling (â), low (à)",
    toneNotation: { system: "Kom 3-tone", detail: "high: unmarked · falling: circumflex (â) · low: grave (à)" },
    priority: "HIGH", status: "ACTIVE", trainingHours: "500+ hours",
    greeting: "À bwɛ̀", thankYou: "Bɛ̀ŋ", howAreYou: "Nà wù dà?",
    asrModel: "custom/kom-asr-v1", ttsVoice: "custom/kom-voice-v1",
    contentLibrary: { vocabulary: 500, dialogues: 50, songs: 20, stories: 30 },
    flag: "🪶",
  },
  {
    // CORRECTION 1 — Lamnso' is tracked SEPARATELY from Kom. Unique among
    // African languages: no dialectal variations. Vowel length is distinctive
    // (sú "to wash" vs súü "to harvest completely").
    code: "lns", name: "Lamnso' (Lamso)", nativeName: "Lamnso'", iso: "lns",
    alternateNames: ["Banso", "Nso", "Nsaw", "Panso", "Nsho'"],
    region: "North West Region", division: "Nso Division",
    speakers: "~125,000 (1987)", tones: "Multiple tones · 6 short vowels /i e a o ə u/ · distinctive vowel length",
    toneNotation: { system: "GACL-compliant", detail: "multiple tones · distinctive vowel length (sú vs súü)" },
    priority: "HIGH", status: "ACTIVE", trainingHours: "500+ hours",
    greeting: "Mbi̶ vǝ̀", thankYou: "Bíŋ", howAreYou: "Wù yé dì?",
    asrModel: "custom/lamnso-asr-v1", ttsVoice: "custom/lamnso-voice-v1",
    contentLibrary: { vocabulary: 500, dialogues: 50, songs: 20, stories: 30 },
    flag: "🪶",
  },
  {
    // CORRECTION 2 — Bayangi (Banyangi), 8th Grassfields language. Placeholder
    // content for MVP; greetings/thank-you to be documented with native
    // speakers; data collection plan below (500h, SIL Cameroon, Q2 2025).
    code: "byv", name: "Bayangi (Banyangi)", nativeName: "Banyangi", iso: "byv",
    alternateNames: ["Banyangi", "Manyang", "Bayangi"],
    region: "South West Region (bordering North West)", division: "Manyu Division",
    speakers: "~50,000 (estimated)", tones: "Tonal (specific tone inventory to be documented)",
    toneNotation: { system: "GACL-compliant (pending)", detail: "Latin script with GACL modifications · tone inventory to be documented" },
    priority: "HIGH", status: "ACTIVE_PLACEHOLDER", trainingHours: "500+ hours (target)",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    culturalContext: "Known for traditional dances and masquerade traditions",
    flag: "🪶",
  },
  {
    code: "bfd", name: "Bafut", nativeName: "Bafut", iso: "bfd",
    alternateNames: ["Befe", "Bafut"],
    region: "North West Region", division: "Mezam Division",
    speakers: "~105,000", tones: "Tonal",
    toneNotation: { system: "GACL-compliant", detail: "tone inventory pending documentation" },
    priority: "MEDIUM", status: "PLANNED", trainingHours: "300+ hours",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    flag: "🪶",
  },
  {
    code: "oku", name: "Oku", nativeName: "Oku (Ebkuo)", iso: "oku",
    alternateNames: ["Oku", "Ebkuo"],
    region: "North West Region", division: "Bui Division",
    speakers: "~40,000", tones: "Tonal",
    toneNotation: { system: "GACL-compliant", detail: "tone inventory pending documentation" },
    priority: "MEDIUM", status: "PLANNED", trainingHours: "300+ hours",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    flag: "🪶",
  },
  {
    code: "bbk", name: "Babanki", nativeName: "Kejom", iso: "bbk",
    alternateNames: ["Kejom", "Kidzom"],
    region: "North West Region", division: "Mezam Division",
    speakers: "~25,000", tones: "Tonal",
    toneNotation: { system: "GACL-compliant", detail: "tone inventory pending documentation" },
    priority: "LOW", status: "PLANNED", trainingHours: "200+ hours",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    flag: "🪶",
  },
  {
    code: "mgo", name: "Mankon", nativeName: "Mankon", iso: "mgo",
    alternateNames: ["Mankon", "Moghamo"],
    region: "North West Region", division: "Mezam Division",
    speakers: "~80,000", tones: "Tonal",
    toneNotation: { system: "GACL-compliant", detail: "tone inventory pending documentation" },
    priority: "MEDIUM", status: "PLANNED", trainingHours: "300+ hours",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    flag: "🪶",
  },
  {
    code: "ngi", name: "Ngie", nativeName: "Ngie (Ngoshie)", iso: "ngi",
    alternateNames: ["Ngie", "Ngoshie"],
    region: "North West Region", division: "Momo Division",
    speakers: "~40,000", tones: "Tonal",
    toneNotation: { system: "GACL-compliant", detail: "tone inventory pending documentation" },
    priority: "LOW", status: "PLANNED", trainingHours: "200+ hours",
    greeting: PENDING, thankYou: PENDING, howAreYou: PENDING,
    asrModel: null, ttsVoice: null,
    contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
    flag: "🪶",
  },
];

// v3.0 Correction 2 — Bayangi data collection plan (spec §2.2 data_collection_plan)
export const BAYANGI_DATA_COLLECTION_PLAN = {
  targetHours: 500,
  partner: "SIL Cameroon / Local Community",
  timeline: "Q2 2025",
  steps: [
    "Recruit native-speaker contributors in Manyu Division (Mamfe area)",
    "Record 500h transcribed speech (greetings, dialogues, songs, folktales)",
    "Document tone inventory + GACL orthography conventions with linguists",
    "Fine-tune Simba-S ASR + clone F5-TTS voice from native reference audio",
    "Native-speaker validation (90% approval target) before graduation to ACTIVE",
  ],
} as const;

/** Placeholder marker — used by UI to render "to be documented" states (Directive 9 gate) */
export function isPlaceholderPhrase(text: string): boolean {
  return text === PENDING || /\[To be documented/.test(text);
}

export { PENDING as PLACEHOLDER_PHRASE };

// Classification notes (§2.3 / §2.4 / v3.0 Correction 2) — shown in the Library
export const LANGUAGE_CLASSIFICATION: Record<string, string> = {
  bkm: "Benue-Congo → Narrow Grassfields → Central Ring",
  lns: "Benue-Congo → Narrow Grassfields → Ring group → West ring (no dialectal variations)",
  byv: "Benue-Congo → Narrow Grassfields → Momo",
};

export const LANGUAGE_RESOURCES: Record<string, string[]> = {
  bkm: ["“Ghesìn̳à ye'i Itan̳ikom” (Let's learn Kom) — 1992", "Kom Dictionary App (Google Play)", "Kom Bible translation"],
  lns: ["“Binka wùn Wiyka 1” — 2003", "Nso Language Organisation (NLO) materials", "Lamnso' Bible translation"],
  byv: ["SIL Cameroon / Local Community (data collection, Q2 2025)", "Community recordings — traditional dances & masquerade traditions (planned)"],
  bfd: ["SIL Cameroon", "Local schools", "Primary textbooks"],
  oku: ["Oku Language Committee", "Community materials"],
  bbk: ["Kejom Language Committee", "Community materials"],
  mgo: ["Mankon Language Committee", "Community materials"],
  ngi: ["Ngie Language Committee", "Community materials"],
};

// ---------------------------------------------------------------------------
// §2.6 GACL Orthography Standards
// ---------------------------------------------------------------------------

export const GACL = {
  established: "1979",
  fullName: "General Alphabet of Cameroonian Languages (GACL/AGLC)",
  specialCharacters: ["ɛ", "ɔ", "ŋ", "ɨ", "ʉ", "ə"],
  digraphs: ["ny", "gh", "sh", "ch", "j", "ng"],
  prenasalized: ["mb", "nd", "ŋg", "nj"],
  labialized: ["pʷ", "fʷ", "sʷ", "kʷ"],
  palatalized: ["bʲ", "dʲ", "kʲ", "sʲ"],
  corePrinciples: [
    "Tones must be written on syllable centers — 2 lexical tones: mark 1; 3 lexical tones: mark 2; modulated tones: double vowels when possible",
    "Same sounds represented by same symbols across languages; digraphs preferred over rare phonetic symbols (ch for [tʃ], ng for [ŋg])",
    "Vowel length is written as vowel geminate (doubling) — e.g. Lamnso' sú “to wash” vs súü “to harvest completely”",
  ],
} as const;

// Kom tone system (§2.3): 3 tones — high [˥] unmarked, falling [˥˩] circumflex, low [˩] grave
export const KOM_TONES = [
  { tone: "High [˥]", mark: "(unmarked)", example: "bwɛ (high syllable)" },
  { tone: "Falling [˥˩]", mark: "circumflex â", example: "â" },
  { tone: "Low [˩]", mark: "grave à", example: "à bwɛ̀" },
] as const;

// Lamnso' special graphemes (§2.4)
export const LAMNSO_GRAPHEMES = [
  { phon: "[ɲ]", graph: "ny" },
  { phon: "[ʃ]", graph: "sh" },
  { phon: "[ɣ]", graph: "gh" },
  { phon: "[tʃ]", graph: "c" },
  { phon: "[dʒ]", graph: "j" },
  { phon: "[ʔ]", graph: "' (apostrophe)" },
] as const;

// ---------------------------------------------------------------------------
// §2.3 / §2.4 Sample Vocabulary — tone-marked, verbatim from the spec
// ---------------------------------------------------------------------------

export interface Phrase {
  en: string;
  bkm?: string;
  lns?: string;
  note?: string;
}

export const CORE_PHRASES: Phrase[] = [
  { en: "Good morning", bkm: "À bwɛ̀", lns: "Mbi̶ vǝ̀", note: "Tone-marked" },
  { en: "Thank you", bkm: "Bɛ̀ŋ", lns: "Bíŋ", note: "Tone-marked" },
  { en: "How are you?", bkm: "Nà wù dà?", lns: "Wù yé dì?", note: "Question form" },
  { en: "I am fine", bkm: "M̀ bɛ̀", lns: "Mǝ̀ yé", note: "Response" },
  { en: "What is your name?", bkm: "Nà wù yì ə?", lns: "Wù yé wǝ́?", note: "Question form" },
  { en: "My name is…", bkm: "Yì əm…", lns: "Yé mǝ…", note: "Response" },
];

// Kom orthography inventory (GACL-compliant) — phoneme practice set (§2.8 Phoneme Audio)
export const KOM_ORTHOGRAPHY_SET = {
  vowels: ["a", "ɛ", "e", "i", "ɨ", "o", "ɔ", "u", "ʉ", "ə"],
  consonants: ["b", "d", "f", "g", "gh", "j", "k", "m", "mb", "n", "nd", "ng", "ŋg", "ny", "nj", "ŋ", "p", "s", "sh", "ch", "t", "w", "y"],
  tones: KOM_TONES,
};

// ---------------------------------------------------------------------------
// §2.8 Grassfields Language Content Library — required content types
// ---------------------------------------------------------------------------

export const CONTENT_TARGETS = [
  { type: "Phoneme Audio", quantity: "All GACL phonemes", purpose: "Pronunciation practice" },
  { type: "Vocabulary", quantity: "500+ words per language", purpose: "Foundation" },
  { type: "Greetings/Dialogues", quantity: "50+ scenarios", purpose: "Oral language" },
  { type: "Songs/Rhymes", quantity: "20+ per language", purpose: "Cultural immersion" },
  { type: "Stories/Folktales", quantity: "30+ per language", purpose: "Reading practice" },
  { type: "Cultural Narratives", quantity: "10+ per language", purpose: "Cultural identity" },
  { type: "Curriculum Terminology", quantity: "All subject terms", purpose: "Academic language" },
] as const;

export const CONTENT_SOURCES = [
  "SIL Cameroon language archives",
  "Local community recordings",
  "Existing textbooks (digitized)",
  "Radio broadcasts (with permission)",
  "Church/Bible recordings",
] as const;

// ---------------------------------------------------------------------------
// §2.9 Language Learning Progression (CEFR-aligned)
// ---------------------------------------------------------------------------

export const CEFR_PROGRESSION = [
  { level: "KG", competency: "Listening, basic oral responses", cefr: "Pre-A1" },
  { level: "Class 1-2", competency: "Simple greetings, naming objects", cefr: "A1" },
  { level: "Class 3-4", competency: "Basic conversations, reading simple texts", cefr: "A1/A2" },
  { level: "Class 5-6", competency: "Extended conversations, writing", cefr: "A2" },
  { level: "Form 1-5", competency: "Fluent communication, literacy", cefr: "B1/B2" },
  { level: "High School", competency: "Academic proficiency", cefr: "B2/C1" },
] as const;

// ---------------------------------------------------------------------------
// §4.1.1 ASR model registry (African language models + fine-tuning plan)
// ---------------------------------------------------------------------------

export const ASR_MODELS = [
  { model: "Simba-S", architecture: "SeamlessM4T-v2", languages: "43 African languages", grassfields: "Limited", use: "Best overall ASR performance" },
  { model: "Simba-W", architecture: "Whisper-v3-large", languages: "43 African languages", grassfields: "Limited", use: "High accuracy transcription" },
  { model: "Simba-X", architecture: "Wav2Vec2-XLS-R-2b", languages: "43 African languages", grassfields: "Limited", use: "Self-supervised learning" },
  { model: "Simba-H", architecture: "Small model (94M params)", languages: "43 African languages", grassfields: "Limited", use: "On-device inference (offline)" },
] as const;

export const FINE_TUNING_PLAN = GRASSFIELDS_LANGUAGES.map((l) => ({
  language: `${l.name} (${l.iso})`,
  baseModel: "Simba-S",
  data: l.trainingHours,
  priority: l.priority,
}));

// §4.1.2 TTS solutions
export const TTS_MODELS = [
  { solution: "Edge-TTS", type: "Neural TTS", languages: "50+ languages", grassfields: "None", note: "Free, no API keys needed" },
  { solution: "Simba-TTS-afr", type: "MMS-TTS", languages: "7 African languages", grassfields: "None", note: "afr, asanti, akuapem, lin, sot, tsn, xho — no Grassfields" },
  { solution: "F5-TTS", type: "Zero-shot voice cloning", languages: "Multilingual", grassfields: "Potential", note: "5-10 second reference audio from native speakers" },
  { solution: "Lelapa AI Vulavula", type: "Commercial API", languages: "African languages", grassfields: "Limited", note: "Enterprise-grade" },
] as const;

// ---------------------------------------------------------------------------
// §4.4 Offline voice capabilities — compressed language packs (~50MB each)
// ---------------------------------------------------------------------------

export const LANGUAGE_PACKS: Record<string, { file: string; sizeMb: number; components: string[] }> = {
  bkm: { file: "kom_language_pack_50mb.zip", sizeMb: 50, components: ["asr_small_model", "voice_pack", "phoneme_audio", "vocabulary", "stories"] },
  lns: { file: "lamnso_language_pack_50mb.zip", sizeMb: 50, components: ["asr_small_model", "voice_pack", "phoneme_audio", "vocabulary", "stories"] },
  byv: { file: "bayangi_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack (pending data collection)", "vocabulary (placeholder)"] },
  bfd: { file: "bafut_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack", "vocabulary"] },
  oku: { file: "oku_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack", "vocabulary"] },
  bbk: { file: "babanki_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack", "vocabulary"] },
  mgo: { file: "mankon_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack", "vocabulary"] },
  ngi: { file: "ngie_language_pack_50mb.zip", sizeMb: 50, components: ["voice_pack", "vocabulary"] },
};

// ---------------------------------------------------------------------------
// §2.7 Voice model readiness — voice cloning pipeline status per language
// (Kom/Lamnso' = Phase 2 with native-speaker validation; others = Phase 4)
// ---------------------------------------------------------------------------

export const VOICE_MODEL_STATUS: Record<string, { asr: string; tts: string; phase: string }> = {
  bkm: { asr: "Fine-tune Simba-S — data sourcing (SIL Cameroon)", tts: "F5-TTS cloning from native speaker reference (5-10s)", phase: "Phase 2" },
  lns: { asr: "Fine-tune Simba-S — data sourcing (SIL Cameroon)", tts: "F5-TTS cloning from native speaker reference (5-10s)", phase: "Phase 2" },
  byv: { asr: "Data collection phase — 500h target (SIL Cameroon / Local Community, Q2 2025)", tts: "Pending tone inventory documentation → F5-TTS cloning", phase: "Phase 2 (NEW — placeholder)" },
  bfd: { asr: "Awaiting fine-tuning window", tts: "Awaiting voice cloning", phase: "Phase 4" },
  oku: { asr: "Awaiting fine-tuning window", tts: "Awaiting voice cloning", phase: "Phase 4" },
  bbk: { asr: "Awaiting fine-tuning window", tts: "Awaiting voice cloning", phase: "Phase 4" },
  mgo: { asr: "Awaiting fine-tuning window", tts: "Awaiting voice cloning", phase: "Phase 4" },
  ngi: { asr: "Awaiting fine-tuning window", tts: "Awaiting voice cloning", phase: "Phase 4" },
};

// ---------------------------------------------------------------------------
// Tone-aware text utilities (§6.5: calculate_tone_aware_similarity,
// calculate_tone_accuracy). Pure functions — safe on client and server.
// ---------------------------------------------------------------------------

const TONE_DIACRITICS = /[\u0300-\u036F\u0327\u0332]/g; // combining diacritics (tone marks)
const TONE_LETTERS = /[̀́̂̃̄̅̈̇]/g; // precomposed grave/acute/circumflex marks on letters

/** All supported voice/lesson languages: EN, FR + 8 Grassfields (+ Ewondo legacy) */
export const VOICE_LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧", status: "ACTIVE" as LanguageStatus },
  { id: "fr", label: "Français", flag: "🇫🇷", status: "ACTIVE" as LanguageStatus },
  ...GRASSFIELDS_LANGUAGES.map((l) => ({
    id: l.code as string,
    label: l.name,
    flag: "🪶",
    status: l.status,
    priority: l.priority,
  })),
] as const;

export const SUPPORTED_LANGUAGES_STANDARD = ["en", "fr", "bkm", "lns"] as const;

export function isGrassfields(lang: string): boolean {
  return GRASSFIELDS_LANGUAGES.some((l) => l.code === lang);
}

/** Tonal languages where tone is phonemically contrastive — tone-aware scoring applies.
 *  bkm: 3-tone system · lns: multiple tones · byv: tonal (inventory to be documented). */
export function isTonal(lang: string): boolean {
  return lang === "bkm" || lang === "lns" || lang === "byv";
}

/** Remove tone diacritics while preserving base GACL letters (ɛ ɔ ŋ ɨ ʉ ə stay) */
export function stripTones(text: string): string {
  return text.normalize("NFC").replace(TONE_DIACRITICS, "").normalize("NFC");
}

/** Extract the tone-mark sequence of a string (diacritics only, in order) */
export function extractToneSequence(text: string): string {
  const decomposed = text.normalize("NFD");
  return (decomposed.match(TONE_DIACRITICS) || []).join("");
}

/** Levenshtein distance on code points */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}

function ratio(a: string, b: string): number {
  if (!a && !b) return 0;
  const d = levenshtein(a, b);
  return Math.max(0, 1 - d / Math.max(a.length, b.length));
}

/**
 * calculate_tone_accuracy (§6.5) — % of syllable tone marks matching between
 * transcription and target. Tone-bearing units approximated by vowel nuclei.
 */
export function calculateToneAccuracy(transcription: string, target: string): number {
  const a = transcription.normalize("NFD").match(TONE_DIACRITICS) || [];
  const b = target.normalize("NFD").match(TONE_DIACRITICS) || [];
  if (b.length === 0) return a.length === 0 ? 100 : Math.max(0, 100 - a.length * 15);
  if (a.length === 0) return 0;
  const seqSim = ratio(a.join(""), b.join(""));
  return Math.round(seqSim * 100);
}

/**
 * calculate_tone_aware_similarity (§6.5) — for tonal Grassfields languages:
 * weighted blend of segmental similarity (tone-stripped) and tonal accuracy.
 */
export function toneAwareSimilarity(transcription: string, target: string): { accuracy: number; toneAccuracy: number } {
  const seg = ratio(stripTones(transcription).toLowerCase(), stripTones(target).toLowerCase());
  const tone = calculateToneAccuracy(transcription, target);
  const accuracy = Math.round(seg * 70 + tone * 30); // segmental 70% + tonal 30%
  return { accuracy, toneAccuracy: tone };
}

/** Simple similarity for non-tonal languages (tone-stripped comparison) */
export function plainSimilarity(transcription: string, target: string): number {
  return Math.round(ratio(stripTones(transcription).toLowerCase(), stripTones(target).toLowerCase()) * 100);
}

/**
 * apply_tone_rules (§2.7) — normalize text to the language's GACL tone
 * conventions before synthesis/evaluation.
 * - Kom: low tone marked with grave (à), falling with circumflex (â), high unmarked
 * - Lamnso': special graphemes ny/sh/gh/c/j; vowel length as gemination (súü)
 * - Bayangi: GACL Latin script; tone inventory to be documented — marks are
 *   preserved as written (no transformation) until documentation completes.
 */
export function applyToneRules(text: string, language: string): string {
  if (!isGrassfields(language)) return text;
  let out = text.normalize("NFC");
  if (language === "byv") {
    // Bayangi: documentation pending — preserve orthography exactly as provided.
    return out;
  }
  if (language === "bkm") {
    // Kom: ensure apostrophe-style glottal and combining marks are composed (NFC does most).
    // Guard: normalize double tone marks (e.g. à̀ → à) that some ASR outputs produce.
    out = out.normalize("NFD").replace(/([\u0300-\u036F])\1+/g, "$1").normalize("NFC");
  }
  if (language === "lns") {
    // Lamnso': normalize straight apostrophe to the right-quote glottal form used in sample vocab
    out = out.replace(/(?<=[nN])'(?=\s|$)/g, "\u0332'"); // keep orthographic stability
  }
  return out;
}
