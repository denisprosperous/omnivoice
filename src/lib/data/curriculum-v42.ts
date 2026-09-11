/**
 * OMNIVOICE v4.2 — Cameroon Primary Curriculum Framework (§3).
 * Sources: National Curriculum Level I (2018), Regional Monthly ILP Level II
 * Class 3 (Littoral), National Core Skills Framework, 1998 Law of Guidelines
 * on Education, GACL (1979), ISCED 0-3, IB PYP/MYP/DP, Cambridge, CEFR A1-C2.
 */

// §3.1 Structure
export const CURRICULUM_STRUCTURE = [
  { level: "I", classes: [1, 2], ages: "5–7", document: "Cameroon Primary School Curriculum Level I (2018)" },
  { level: "II", classes: [3, 4], ages: "7–9", document: "Regional Monthly Integrated Learning Plan Level II — Littoral Region" },
  { level: "III", classes: [5, 6], ages: "9–11", document: "Level III Curriculum" },
] as const;

// §3.2 Domains & weighting
export const DOMAINS = [
  { domain: "Basic Knowledge", weight: 60, subjects: ["English", "Maths", "Science & Tech", "Français"] },
  { domain: "Communal Life & National Integration", weight: 5, subjects: ["Social Studies"] },
  { domain: "Vocational & Life Skills", weight: 20, subjects: ["Vocational Studies", "Arts", "PES"] },
  { domain: "Cultural Identity", weight: 5, subjects: ["National Languages & Cultures"] },
  { domain: "Digital Literacy", weight: 10, subjects: ["ICTs"] },
] as const;

// §3.3 Seven National Core Skills
export const CORE_SKILLS = [
  { n: 1, skill: "Communication", detail: "Express oneself in English, French and at least one Cameroonian national language" },
  { n: 2, skill: "Basic Maths, Science & Tech notions", detail: "Apply numeracy, scientific reasoning and technology in daily life" },
  { n: 3, skill: "Social & citizenship values", detail: "Live shared civic values: tolerance, patriotism, harmonious living" },
  { n: 4, skill: "Autonomy, initiative, creativity, entrepreneurship", detail: "Initiate and complete personal and group projects" },
  { n: 5, skill: "Basic ICT concepts & tools", detail: "Use digital equipment safely and productively" },
  { n: 6, skill: "Lifelong learning", detail: "Learn how to learn — curiosity, reflection, self-improvement" },
  { n: 7, skill: "Physical, sports & artistic activities", detail: "Sustain body and mind through sport and artistic expression" },
] as const;

// §3.4 Four Broad-Based Competences
export const COMPETENCES = [
  { name: "Intellectual", nameFr: "Intellectuelle", detail: "Mobilise knowledge to solve problems" },
  { name: "Methodological", nameFr: "Méthodologique", detail: "Organise work, choose tools, evaluate oneself" },
  { name: "Personal & Interpersonal", nameFr: "Personnelle et Interpersonnelle", detail: "Self-esteem, cooperation, responsibility" },
  { name: "Communication", nameFr: "Communicationnelle", detail: "Convey and receive meaning across languages and media" },
] as const;

// §3.5 Integrated Learning Themes
export const ILT_LEVELS_1_2 = [
  "Home", "Village/Town", "School", "Occupations", "Travelling", "Health", "Games", "Communication",
] as const;

export const ILT_LEVEL_3 = [
  "Nature", "Village/Town", "School", "Occupations", "Travelling", "Health", "Sports & Leisure", "Universe & Space",
] as const;

// §3.6 Pedagogy & Assessment
export const PEDAGOGY = {
  approach: "Competence-Based Approach (CBA)",
  vehicles: ["Project-Based Learning", "Integrated Theme Learning", "Cooperative Learning"],
  assessment: ["diagnostic", "formative", "summative"],
  forms: ["oral", "written", "practical"],
} as const;

// §3.7 Level I (Class 1–2) — key terminal outcomes per subject (verbatim)
export const LEVEL1_OUTCOMES: Array<{ subject: string; outcomes: string[] }> = [
  { subject: "English", outcomes: ["Listen and interpret simple messages", "Communicate orally with confidence", "Read with interest", "Write with interest"] },
  { subject: "Maths", outcomes: ["Sort and describe sets", "Count and use numbers", "Measure length, mass, capacity, time", "Identify shapes", "Read simple graphs", "Apply maths to daily life"] },
  { subject: "Science & Tech", outcomes: ["Discover the human body", "Observe the environment", "Use simple scientific tools", "Build simple models"] },
  { subject: "Français", outcomes: ["Écouter des messages simples", "Lire des mots et des phrases", "Écrire 1–3 phrases correctes"] },
  { subject: "Social Studies (Citizenship only)", outcomes: ["Practise tolerance", "Show patriotism", "Live harmoniously with others"] },
  { subject: "Vocational Studies", outcomes: ["Produce simple objects with local materials"] },
  { subject: "Arts", outcomes: ["Create drawings and models", "Perform songs and dances"] },
  { subject: "PES", outcomes: ["Discover one's body through movement", "Develop social skills through play", "Build a healthy body"] },
  { subject: "National Languages", outcomes: ["Produce at least 5 simple sentences orally", "Sing national-language songs", "Perform cultural routines", "Read and write basic words"] },
  { subject: "ICTs", outcomes: ["Use ICT equipment safely", "Show beginning computational thinking"] },
];

// §3.8 Level II (Class 3) — monthly ILTs & envisaged projects (stipulated)
export const LEVEL2_MONTHS = [
  { month: 1, ilt: "Home", project: "Model of ideal home" },
  { month: 2, ilt: "Village/Town", project: "Village map" },
  { month: 3, ilt: "School", project: "School garden" },
  { month: 4, ilt: "Occupations", project: "Career day" },
  { month: 5, ilt: "Travelling", project: "Travel journal" },
  { month: 6, ilt: "Health", project: "Health fair" },
  { month: 7, ilt: "Games", project: "Sports day" },
  { month: 8, ilt: "Communication", project: "Communication museum" },
] as const;

// §3.9 Level III (Class 5–6) — expectations per subject (stipulated summary)
export const LEVEL3_EXPECTATIONS: Array<{ subject: string; expectations: string[] }> = [
  { subject: "English", expectations: ["Extended reading of narratives and informational texts", "Structured essay writing", "Functional oral presentations"] },
  { subject: "Maths", expectations: ["Operations up to 1,000,000", "Fractions, decimals, percentages", "Measurement, geometry and data handling"] },
  { subject: "Science & Tech", expectations: ["Body systems", "Matter and energy", "Environment and simple machines"] },
  { subject: "Français", expectations: ["Lecture suivie", "Production écrite de textes structurés", "Expression orale fluide"] },
  { subject: "Social Studies", expectations: ["Cameroon history and geography", "Civics and national institutions"] },
  { subject: "Vocational Studies", expectations: ["Advanced Home Economics", "Agriculture", "Crafts with local materials"] },
  { subject: "Arts", expectations: ["Original artistic works", "Performance and exhibition"] },
  { subject: "PES", expectations: ["Advanced motor skills", "Team play and rules", "Physical fitness routines"] },
  { subject: "National Languages", expectations: ["Fluent communication in a national language", "Cultural performance and literacy"] },
  { subject: "ICTs", expectations: ["Productivity software", "Computational thinking projects"] },
];

// §3.10 Weekly time allocation — Level I single shift (verbatim, incl. stipulated total)
export const TIME_ALLOCATION_LEVEL1 = [
  { subject: "English (EN)", hours: 7.5 },
  { subject: "Mathematics", hours: 3 },
  { subject: "Science & Tech", hours: 3 },
  { subject: "Français (FR)", hours: 4.5 },
  { subject: "Social Studies", hours: 1.5 },
  { subject: "Vocational Studies", hours: 3 },
  { subject: "Arts", hours: 1.5 },
  { subject: "PES", hours: 1.5 },
  { subject: "National Languages", hours: 1.5 },
  { subject: "ICTs", hours: 3 },
] as const;
export const TIME_ALLOCATION_TOTAL = "39.8h (as stipulated)";

/** Subjects per class level — 10 subjects × 3 levels (§3.8 lists all ten for Level II) */
export const TEN_SUBJECTS = [
  "English", "Mathematics", "Science & Technology", "Français", "Social Studies",
  "Vocational Studies", "Arts", "PES", "National Languages", "ICTs",
] as const;

export const CLASS_LEVEL_MAP: Record<string, { level: "I" | "II" | "III"; classes: string[] }> = {
  I: { level: "I", classes: ["class1", "class2"] },
  II: { level: "II", classes: ["class3", "class4"] },
  III: { level: "III", classes: ["class5", "class6"] },
};

export function curriculumCoverage() {
  return {
    levels: 3,
    classes: ["class1", "class2", "class3", "class4", "class5", "class6"],
    subjectsPerLevel: TEN_SUBJECTS.length,
    seededFullLessonPlans: ["class3 (Month 1 — all subjects, 12 extended plans)"],
    lessonGeneration: "AI lesson-plan generator covers Class 1–6 in the §7.3 format with DIY + voice practice",
  };
}
