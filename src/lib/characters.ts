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
  greeting: { en: string; fr: string; ewo: string; bkm?: string; lns?: string };
}

export const CHARACTERS: Character[] = [
  {
    id: "kwe", name: "Kwe", emoji: "🦉",
    role: { en: "Wise Owl Guide", fr: "Hibou Sage Guide" },
    traits: { en: "Warm, patient, elder-like", fr: "Chaleureux, patient, ancien" },
    color: "#B45309", // warm brown
    languages: ["en", "fr", "bkm", "lns"], // §4.3: pan-Cameroonian wisdom keeper
    greeting: {
      en: "Welcome, young scholar!", fr: "Bienvenue, jeune savant !", ewo: "Ndoge, mone sem!",
      bkm: "À bwɛ̀, mwɛ̀n!", // §2.3 Good morning, child!
      lns: "Mbi̶ vǝ̀, wòn!", // §2.4 Good morning, dear!
    },
  },
  {
    id: "mbi", name: "Mbi", emoji: "🐒",
    role: { en: "Curious Monkey", fr: "Singe Curieux" },
    traits: { en: "Playful, energetic, child-like", fr: "Joueur, énergique, enfantin" },
    color: "#92400E",
    languages: ["en", "fr", "ewo"], // §4.3: forest region (South/Centre)
    greeting: { en: "Let's play and learn!", fr: "Jouons et apprenons !", ewo: "Minal me Dutu!" },
  },
  {
    id: "ngo", name: "Ngo", emoji: "👧🏾",
    role: { en: "Brave Girl", fr: "Fille Courageuse" },
    traits: { en: "Confident, encouraging, clear", fr: "Sûre, encourageante, claire" },
    color: "#9D174D",
    languages: ["en", "fr", "bkm", "lns"], // §4.3: Grassfields (West/Northwest)
    greeting: {
      en: "You can do this with me!", fr: "Tu peux le faire avec moi !", ewo: "Ñemed wo!",
      bkm: "À bwɛ̀! M̀ bɛ̀!", // Good morning! I am fine!
      lns: "Mbi̶ vǝ̀! Mǝ̀ yé!", // Good morning! I am fine!
    },
  },
  {
    id: "kong", name: "Kong", emoji: "👦🏾",
    role: { en: "Resourceful Boy", fr: "Garçon Débrouillard" },
    traits: { en: "Adventurous, questioning, friendly", fr: "Aventurier, curieux, aimable" },
    color: "#065F46",
    languages: ["en", "fr", "dla"], // §4.3: coastal region (Littoral/Southwest, Duala)
    greeting: { en: "Ready for an adventure?", fr: "Prêt pour une aventure ?", ewo: "Bana mvetome?" },
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
