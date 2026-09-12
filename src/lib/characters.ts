// Voice Persona Design (Master Prompt v2.0 §4.3) — culturally authentic AI
// characters with per-character language matrices (Grassfields Expansion Pack).
export interface Character {
  id: "kwe" | "mbi" | "ngo" | "kong";
  name: string;
  emoji: string;
  role: { en: string; fr: string };
  traits: { en: string; fr: string };
  color: string;
  // §4.3 language matrix — "EN, FR, Kom, Lamnso'" etc.
  languages: string[];
  // TRUSTED-SOURCES POLICY: greetings ship in EN/FR only. Kom/Lamnso'/Ewondo
  // greetings were removed — none is attested in the ingested trusted sources;
  // they can only return via the Content Ingestion portal (native speakers).
  greeting: { en: string; fr: string };
}

export const CHARACTERS: Character[] = [
  {
    id: "kwe", name: "Kwe", emoji: "🦉",
    role: { en: "Wise Owl Guide", fr: "Hibou Sage Guide" },
    traits: { en: "Warm, patient, elder-like", fr: "Chaleureux, patient, ancien" },
    color: "#B45309", // warm brown
    languages: ["en", "fr", "bkm", "lns", "byv"], // §4.3: pan-Cameroonian wisdom keeper + v3.0 8-language pack
    greeting: {
      en: "Welcome, young scholar!", fr: "Bienvenue, jeune savant !",
    },
  },
  {
    id: "mbi", name: "Mbi", emoji: "🐒",
    role: { en: "Curious Monkey", fr: "Singe Curieux" },
    traits: { en: "Playful, energetic, child-like", fr: "Joueur, énergique, enfantin" },
    color: "#92400E",
    languages: ["en", "fr"], // §4.3: forest region (South/Centre)
    greeting: { en: "Let's play and learn!", fr: "Jouons et apprenons !" },
  },
  {
    id: "ngo", name: "Ngo", emoji: "👧🏾",
    role: { en: "Brave Girl", fr: "Fille Courageuse" },
    traits: { en: "Confident, encouraging, clear", fr: "Sûre, encourageante, claire" },
    color: "#9D174D",
    languages: ["en", "fr", "bkm", "lns", "byv"], // §4.3: Grassfields (West/Northwest/Southwest) + v3.0 8-language pack
    greeting: {
      en: "You can do this with me!", fr: "Tu peux le faire avec moi !",
    },
  },
  {
    id: "kong", name: "Kong", emoji: "👦🏾",
    role: { en: "Resourceful Boy", fr: "Garçon Débrouillard" },
    traits: { en: "Adventurous, questioning, friendly", fr: "Aventurier, curieux, aimable" },
    color: "#065F46",
    languages: ["en", "fr"], // §4.3: coastal region (Littoral/Southwest, Duala)
    greeting: { en: "Ready for an adventure?", fr: "Prêt pour une aventure ?" },
  },
];

export function getCharacter(id: string): Character {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

/** Character greeting in a specific voice language, falling back to EN/FR */
export function characterGreeting(c: Character, lang: string): string {
  const g = c.greeting as Record<string, string | undefined>;
  return g[lang] || (lang === "fr" ? g.fr : g.en) || g.en!;
}
