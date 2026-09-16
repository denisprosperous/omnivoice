/**
 * OMNIVOICE — Platform Voice Registry (voice-selection feature).
 *
 * Exposes every voice/speaker available on the platform as ONE list so the UI
 * can offer a real voice picker:
 *
 *   kind "recorded" — REAL human audio hosted in the platform (Directive-9
 *   compliant: no synthetic Grassfields speech is ever generated).
 *   kind "tts"      — Kokoro-82M synthetic voices (EN/FR interface speech).
 *   kind "persona"  — the 4 story characters (Kwe/Mbi/Ngo/Kong) mapped onto
 *   Kokoro voices (v4.0 §2.3 profiles).
 *
 * Grassfields languages have NO synthetic voices — recorded sources only, and
 * community-recorded speakers appear here once ingested via the Content
 * Ingestion portal and approved (DRAFT → IN_REVIEW → ACTIVE).
 */

export interface PlatformVoice {
  id: string;
  name: string;
  nameFr: string;
  kind: "recorded" | "tts" | "persona";
  /** languages this voice can speak */
  langs: string[];
  langLabel: string;
  gender: "male" | "female";
  engine: "native-recording" | "kokoro-82m";
  /** Kokoro voice id for tts/persona kinds */
  kokoroVoice?: string;
  speed?: number;
  available: boolean;
  note: string;
  noteFr: string;
  source: string;
  /** sample text used by the preview button */
  sampleText: string;
  sampleLang: string;
  /** for recorded voices: real-audio clip played by the preview button */
  sampleAudioPath?: string;
}

export const PLATFORM_VOICES: PlatformVoice[] = [
  {
    id: "bkm_nt_narrator",
    name: "Kom NT Narrator",
    nameFr: "Narrateur du NT kom",
    kind: "recorded",
    langs: ["bkm"],
    langLabel: "Kom (Itaŋikom)",
    gender: "male",
    engine: "native-recording",
    available: true,
    note: "Real recorded voice — narrates the 28 chapters of Matthew (Ŋwàʼlɨ̀ àkòyn). Used by the Audio Bible listening stations.",
    noteFr: "Voix réellement enregistrée — narre les 28 chapitres de Matìyo. Utilisée par la station « Audio Bible ».",
    source: "Bible.is BKMBSCN2DA · Audio ℗ 2007 Hosanna / Faith Comes By Hearing · Text © 2004 The Bible Society of Cameroon",
    sampleText: "Akeynà nɨn ghɨ àzɨyn a ghɨ̀bo Jisos Christ.",
    sampleLang: "bkm",
    sampleAudioPath: "/audio/bkm/matthew/mat_01_sample_10s.mp3",
  },
  {
    id: "bkm_community_recordings",
    name: "Community speakers (pending)",
    nameFr: "Locuteurs communautaires (en attente)",
    kind: "recorded",
    langs: ["bkm"],
    langLabel: "Kom (Itaŋikom)",
    gender: "male",
    engine: "native-recording",
    available: false,
    note: "Slots reserved for tutor / parent / authority recordings submitted through the Content Ingestion portal. Each appears here once a moderator approves it (Directive 9).",
    noteFr: "Emplacements réservés aux enregistrements des tuteurs / parents / autorités soumis via le portail d'ingestion. Chacun apparaîtra après validation (Directive 9).",
    source: "Content Ingestion portal → moderator approval",
    sampleText: "",
    sampleLang: "bkm",
  },
  {
    id: "voice_kwe",
    name: "Kwe — wise owl guide",
    nameFr: "Kwe — le hibou sage",
    kind: "persona",
    langs: ["en"],
    langLabel: "English (interface)",
    gender: "male",
    engine: "kokoro-82m",
    kokoroVoice: "am_michael",
    speed: 0.9,
    available: true,
    note: "Story character voice for interface speech (EN). Synthetic — never used for Kom national-language content.",
    noteFr: "Voix de personnage pour l'interface (EN). Synthétique — jamais utilisée pour le contenu kom.",
    source: "Kokoro-82M · am_michael",
    sampleText: "Welcome back, learner! Ready to speak Kom today?",
    sampleLang: "en",
  },
  {
    id: "voice_mbi",
    name: "Mbi — curious monkey",
    nameFr: "Mbi — le singe curieux",
    kind: "persona",
    langs: ["en"],
    langLabel: "English (interface)",
    gender: "female",
    engine: "kokoro-82m",
    kokoroVoice: "af_bella",
    speed: 1.05,
    available: true,
    note: "Playful character voice (EN). Synthetic — never used for Kom national-language content.",
    noteFr: "Voix de personnage espiègle (EN). Synthétique — jamais utilisée pour le contenu kom.",
    source: "Kokoro-82M · af_bella",
    sampleText: "Ooh ooh! Let's learn five new Kom words!",
    sampleLang: "en",
  },
  {
    id: "voice_ngo",
    name: "Ngo — brave girl",
    nameFr: "Ngo — la fille courageuse",
    kind: "persona",
    langs: ["en"],
    langLabel: "English (interface)",
    gender: "female",
    engine: "kokoro-82m",
    kokoroVoice: "af_nicole",
    speed: 1.0,
    available: true,
    note: "Clear character voice (EN). Synthetic — never used for Kom national-language content.",
    noteFr: "Voix claire de personnage (EN). Synthétique — jamais utilisée pour le contenu kom.",
    source: "Kokoro-82M · af_nicole",
    sampleText: "Listen carefully, then repeat after the narrator.",
    sampleLang: "en",
  },
  {
    id: "voice_kong",
    name: "Kong — resourceful boy",
    nameFr: "Kong — le garçon débrouillard",
    kind: "persona",
    langs: ["en"],
    langLabel: "English (interface)",
    gender: "male",
    engine: "kokoro-82m",
    kokoroVoice: "am_liam",
    speed: 0.95,
    available: true,
    note: "Friendly character voice (EN). Synthetic — never used for Kom national-language content.",
    noteFr: "Voix amicale de personnage (EN). Synthétique — jamais utilisée pour le contenu kom.",
    source: "Kokoro-82M · am_liam",
    sampleText: "Great job! Your tone accuracy is improving.",
    sampleLang: "en",
  },
  {
    id: "voice_ff_siwis",
    name: "French narrator (Siwis)",
    nameFr: "Narratrice française (Siwis)",
    kind: "tts",
    langs: ["fr"],
    langLabel: "Français (interface)",
    gender: "female",
    engine: "kokoro-82m",
    kokoroVoice: "ff_siwis",
    speed: 0.95,
    available: true,
    note: "French interface voice (FR). Synthetic — never used for Kom national-language content.",
    noteFr: "Voix d'interface française (FR). Synthétique — jamais utilisée pour le contenu kom.",
    source: "Kokoro-82M · ff_siwis",
    sampleText: "Bienvenue ! Aujourd'hui, nous écoutons la Bible en kom.",
    sampleLang: "fr",
  },
];

/** Voices available for a given language code (falls back to [] honestly). */
export function voicesForLang(code: string): PlatformVoice[] {
  return PLATFORM_VOICES.filter((v) => v.available && v.langs.includes(code));
}

/** The default recorded voice for Kom scripture playback. */
export function defaultScriptureVoice(lang: string): PlatformVoice | undefined {
  return voicesForLang(lang).find((v) => v.kind === "recorded");
}
