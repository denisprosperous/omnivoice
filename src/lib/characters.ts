// Voice Persona Design (Master Prompt 3.3) — culturally authentic AI characters
export interface Character {
  id: "kwe" | "mbi" | "ngo" | "kong";
  name: string;
  emoji: string;
  role: { en: string; fr: string };
  traits: { en: string; fr: string };
  color: string;
  greeting: { en: string; fr: string; ewo: string };
}

export const CHARACTERS: Character[] = [
  {
    id: "kwe", name: "Kwe", emoji: "🦉",
    role: { en: "Wise Owl Guide", fr: "Hibou Sage Guide" },
    traits: { en: "Warm, patient, elder-like", fr: "Chaleureux, patient, ancien" },
    color: "#B45309", // warm brown
    greeting: { en: "Welcome, young scholar!", fr: "Bienvenue, jeune savant !", ewo: "Ndoge, mone sem!" },
  },
  {
    id: "mbi", name: "Mbi", emoji: "🐒",
    role: { en: "Curious Monkey", fr: "Singe Curieux" },
    traits: { en: "Playful, energetic, child-like", fr: "Joueur, énergique, enfantin" },
    color: "#92400E",
    greeting: { en: "Let's play and learn!", fr: "Jouons et apprenons !", ewo: "Minal me Dutu!" },
  },
  {
    id: "ngo", name: "Ngo", emoji: "👧🏾",
    role: { en: "Brave Girl", fr: "Fille Courageuse" },
    traits: { en: "Confident, encouraging, clear", fr: "Sûre, encourageante, claire" },
    color: "#9D174D",
    greeting: { en: "You can do this with me!", fr: "Tu peux le faire avec moi !", ewo: "Ñemed wo!" },
  },
  {
    id: "kong", name: "Kong", emoji: "👦🏾",
    role: { en: "Resourceful Boy", fr: "Garçon Débrouillard" },
    traits: { en: "Adventurous, questioning, friendly", fr: "Aventurier, curieux, aimable" },
    color: "#065F46",
    greeting: { en: "Ready for an adventure?", fr: "Prêt pour une aventure ?", ewo: "Bana mvetome?" },
  },
];

export function getCharacter(id: string): Character {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
