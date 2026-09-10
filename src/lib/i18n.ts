// i18n — English / Français / Ewondo (national language) UI strings
// Language Support per Master Prompt 5.3: English, French, National Languages
export type Lang = "en" | "fr" | "ewo";

export const STRINGS: Record<string, { en: string; fr: string; ewo: string }> = {
  appName: { en: "OmniVoice Academy", fr: "Académie OmniVoice", ewo: "Dutu OmniVoice" },
  tagline: { en: "Every lesson is a quest. Every voice is heard.", fr: "Chaque leçon est une quête. Chaque voix est écoutée.", ewo: "Atsi woñ me njii." },
  chooseRole: { en: "Who is learning today?", fr: "Qui apprend aujourd'hui ?", ewo: "Añan a ma lad?" },
  learner: { en: "Learner", fr: "Apprenant", ewo: "Mone Dutu" },
  teacher: { en: "Teacher", fr: "Enseignant", ewo: "Nsombol" },
  parent: { en: "Parent / Guardian", fr: "Parent / Tuteur", ewo: "Nkumb" },
  supervisor: { en: "Pedagogic Supervisor", fr: "Encadreur Pédagogique", ewo: "Nkol Me Dutu" },
  yourName: { en: "Your name", fr: "Ton nom", ewo: "Nan wo" },
  chooseLevel: { en: "Choose your level (KG to High School)", fr: "Choisis ton niveau (Maternelle au Lycée)", ewo: "Tsañ dutu wo" },
  chooseLanguage: { en: "Language", fr: "Langue", ewo: "Atsi" },
  start: { en: "Start the Adventure", fr: "Commencer l'Aventure", ewo: "Tal me mvetome" },
  dashboard: { en: "Curriculum Navigator", fr: "Navigateur de Programme", ewo: "Dutu mbembol" },
  quests: { en: "Quests", fr: "Quêtes", ewo: "Mvetome" },
  projects: { en: "Projects", fr: "Projets", ewo: "Bewulu" },
  profile: { en: "My Profile", fr: "Mon Profil", ewo: "Nkul wo" },
  library: { en: "Content Library", fr: "Bibliothèque", ewo: "Nkol Asev" },
  level: { en: "Level", fr: "Niveau", ewo: "Nkol" },
  xp: { en: "XP", fr: "XP", ewo: "XP" },
  streak: { en: "Day Streak", fr: "Jours de Suite", ewo: "Mboa" },
  badges: { en: "Badges", fr: "Badges", ewo: "Mbembol" },
  skillTree: { en: "Skill Tree", fr: "Arbre de Compétences", ewo: "Nkol Besem" },
  hook: { en: "Voice Hook", fr: "Accroche Vocale", ewo: "Atsi" },
  listen: { en: "Listen & Learn", fr: "Écouter & Apprendre", ewo: "Wõ & Dutu" },
  speak: { en: "Speak & Practice", fr: "Parler & S'exercer", ewo: "Kaa & Dutu" },
  apply: { en: "Apply & Create", fr: "Appliquer & Créer", ewo: "Tal & Weng" },
  celebrate: { en: "Celebrate", fr: "Célébrer", ewo: "Lomb" },
  holdToTalk: { en: "Hold to talk", fr: "Appuie pour parler", ewo: "Kaa nde" },
  listening: { en: "Listening...", fr: "J'écoute...", ewo: "Ma wõ..." },
  speakNow: { en: "Speak now!", fr: "Parle maintenant !", ewo: "Kaa bele!" },
  correct: { en: "Correct!", fr: "Correct !", ewo: "Ñemed !" },
  tryAgain: { en: "Try again — you can do it!", fr: "Essaie encore — tu peux le faire !", ewo: "Yõl abe !" },
  wellDone: { en: "Well done!", fr: "Bien joué !", ewo: "Ayeba !" },
  complete: { en: "Complete", fr: "Terminer", ewo: "Ful" },
  next: { en: "Next", fr: "Suivant", ewo: "Nkol" },
  back: { en: "Back", fr: "Retour", ewo: "Buluk" },
  month: { en: "Month 1 — The Home", fr: "Mois 1 — La Maison", ewo: "Mboa 1 — Mfam" },
  offline: { en: "Offline mode — cached content", fr: "Mode hors ligne — contenu en cache", ewo: "Offline" },
  online: { en: "Online", fr: "En ligne", ewo: "Online" },
  progressReport: { en: "Progress Report", fr: "Rapport de Progrès", ewo: "Nkol wo" },
  lessonPlans: { en: "Lesson Plan Generator", fr: "Générateur de Leçons", ewo: "Weng Besen" },
  monitor: { en: "Monitoring & Quality", fr: "Suivi & Qualité", ewo: "Nkol" },
  voiceNotes: { en: "Project Book Voice Notes", fr: "Notes Vocales du Projet", ewo: "Atsi Bewulu" },
  record: { en: "Record", fr: "Enregistrer", ewo: "Kaa" },
  stop: { en: "Stop", fr: "Arrêter", ewo: "Ful" },
  play: { en: "Play", fr: "Écouter", ewo: "Wõ" },
  save: { en: "Save", fr: "Enregistrer", ewo: "Kem" },
  generate: { en: "Generate Lesson Plan", fr: "Générer la Leçon", ewo: "Weng Besen" },
  subjects: { en: "Subjects", fr: "Matières", ewo: "Besen" },
  domains: { en: "Domains & Weighting", fr: "Domaines & Coefficients", ewo: "Bedom" },
  speakingQuest: { en: "Speaking Quest", fr: "Quête Orale", ewo: "Mvetome Atsi" },
  greetKwe: { en: "Talk with", fr: "Parler avec", ewo: "Kaa na" },
  avgScore: { en: "Average Score", fr: "Score Moyen", ewo: "Nkol Weng" },
  learners: { en: "Learners", fr: "Apprenants", ewo: "Bemon Dutu" },
  assessments: { en: "Assessments", fr: "Évaluations", ewo: "Beweng" },
  voiceShare: { en: "Voice Interaction Share", fr: "Part Vocale", ewo: "Atsi" },
};

export function t(key: string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  if (lang === "fr") return entry.fr;
  if (lang === "ewo") return entry.ewo;
  return entry.en;
}
