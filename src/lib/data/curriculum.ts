// ============================================================================
// CURRICULUM SEED DATA — Cameroon Primary Education AI Platform (OmniVoice)
// Sources (verbatim alignment):
//   1. Cameroon Primary School Curriculum (Level I: Class 1 & Class 2) — 2018
//   2. Regional Monthly Integrated Learning Plan, Level Two (Class 3), Littoral
//   3. National Core Skills Framework + 1998 Law to Lay Down Guidelines
// MVP content scope per Master Prompt roadmap: Class 3, Month 1 COMPLETE
// across all subjects + full ISCED 0-3 level ladder + 8 ILTs.
// ============================================================================

export const ILTS = [
  {
    id: "the-home",
    nameEn: "The Home",
    nameFr: "La Maison",
    nameEw: "Mfam", // Ewondo
    order: 1,
    months: [1, 2],
    mood: "home", // warm, cosy — soft kalimba, family sounds
    storyEn:
      "Kwe the wise owl flies to Ngo's compound in a quiet village near Douala. Morning smoke rises from the kitchen as Mbi the monkey swings by to help fetch water. Every room has a story to tell — and a quest to begin!",
    storyFr:
      "Kwe, le hibou sage, s'envole vers la concession de Ngo dans un village paisible près de Douala. La fumée du matin s'élève de la cuisine pendant que Mbi, le singe curieux, arrive pour aider à porter de l'eau. Chaque pièce raconte une histoire — et commence une quête !",
    stageScope: "primary",
  },
  {
    id: "the-village-town",
    nameEn: "The Village/Town",
    nameFr: "Le Village et la Ville",
    nameEw: "Alomba me Megulu",
    order: 2,
    months: [2, 3],
    mood: "village", // vibrant, busy — market sounds, balafon
    storyEn:
      "Kong the resourceful boy leads the way from the village square to the busy market of Douala. Horns honk, traders call out in three languages, and the balafon plays. Maps, money, manners — the town is a giant quest board!",
    storyFr:
      "Kong, le garçon débrouillard, guide le chemin de la place du village jusqu'au marché animé de Douala. Les klaxons résonnent, les commerçants crient en trois langues, et le balafon joue. Cartes, argent, politesse — la ville est un immense plateau de quêtes !",
    stageScope: "primary",
  },
  {
    id: "the-school",
    nameEn: "The School",
    nameFr: "L'École",
    nameEw: "Dutu",
    order: 3,
    months: [3, 4],
    mood: "school", // cheerful, structured — children's voices, light percussion
    storyEn:
      "The school bell rings! Ngo shows her friends the classroom, the chalkboard and the reading corner. Kwe hides a word-treasure in every corner of the school. Learning together is the greatest adventure of all.",
    storyFr:
      "La cloche de l'école sonne ! Ngo fait découvrir la salle de classe, l'ardoise et le coin lecture à ses amis. Kwe cache un trésor de mots dans chaque coin de l'école. Apprendre ensemble est la plus belle des aventures.",
    stageScope: "primary",
  },
  {
    id: "occupations",
    nameEn: "Occupations",
    nameFr: "Les Métiers",
    nameEw: "Bewulu",
    order: 4,
    months: [4, 5],
    mood: "work", // rhythmic, purposeful — work songs, rhythmic tools
    storyEn:
      "Mbi wants to know: what will I be when I grow up? A fisherman at the Wouri river, a tailor, a doctor, a farmer in the West? Kong's uncle the carpenter shows everyone how tools sing their own work songs.",
    storyFr:
      "Mbi veut savoir : que serai-je quand je serai grand ? Pêcheur sur le fleuve Wouri, tailleur, médecin, ou cultivateur dans l'Ouest ? L'oncle charpentier de Kong montre à tous comment les outils chantent leurs propres chansons de travail.",
    stageScope: "primary",
  },
  {
    id: "travelling",
    nameEn: "Travelling",
    nameFr: "Les Voyages",
    nameEw: "Mvetome",
    order: 5,
    months: [5, 6],
    mood: "travel", // adventurous, moving — travel rhythms, vehicle sounds
    storyEn:
      "All aboard! The team travels from Douala to Yaoundé, over rivers and hills. Kong counts buses, Ngo reads the road signs, and Mbi asks a hundred questions. Every kilometre is a new lesson.",
    storyFr:
      "En route ! L'équipe voyage de Douala à Yaoundé, au-dessus des fleuves et des collines. Kong compte les bus, Ngo lit les panneaux, et Mbi pose cent questions. Chaque kilomètre est une nouvelle leçon.",
    stageScope: "primary",
  },
  {
    id: "health",
    nameEn: "Health",
    nameFr: "La Santé",
    nameEw: "Beyem",
    order: 6,
    months: [6, 7],
    mood: "health", // calm, caring — gentle melodies, water sounds
    storyEn:
      "Ngo washes her hands at the village pump while Kwe explains why clean water keeps us strong. The clinic, the market fruits, morning exercises — a healthy body is a hero's instrument!",
    storyFr:
      "Ngo se lave les mains à la pompe du village pendant que Kwe explique pourquoi l'eau propre nous rend forts. Le dispensaire, les fruits du marché, la gym du matin — un corps sain est l'instrument d'un héros !",
    stageScope: "primary",
  },
  {
    id: "games",
    nameEn: "Games",
    nameFr: "Les Jeux",
    nameEw: "Minal",
    order: 7,
    months: [7, 8],
    mood: "games", // playful, energetic — upbeat bikutsi, clapping
    storyEn:
      "Bikutsi drums fill the air! The friends play wrestling, awalé, skipping rope and football. Kwe referees the great numbers game — every score needs counting, every team needs a name.",
    storyFr:
      "Les tambours bikutsi emplissent l'air ! Les amis jouent à la lutte, à l'awalé, à la corde à sauter et au football. Kwe arbitre le grand jeu des nombres — chaque point se compte, chaque équipe a un nom.",
    stageScope: "primary",
  },
  {
    id: "communication",
    nameEn: "Communication",
    nameFr: "La Communication",
    nameEw: "Atsi",
    order: 8,
    months: [8, 8],
    mood: "communication", // curious, connected — gentle techno-balafon
    storyEn:
      "A letter arrives for Kwe from a friend in Garoua! The team discovers telephones, letters, radio and the internet. Kong learns that a message can fly across Cameroon in a second — and that listening is the first language skill.",
    storyFr:
      "Une lettre arrive pour Kwe, envoyée par un ami de Garoua ! L'équipe découvre le téléphone, les lettres, la radio et l'internet. Kong apprend qu'un message peut traverser le Cameroun en une seconde — et que écouter est la première compétence langagière.",
    stageScope: "primary",
  },
];

// Secondary & High School ILTs per Master Prompt 2.4
export const SECONDARY_ILTS = [
  { id: "scientific-inquiry", nameEn: "Scientific Inquiry", nameFr: "Démarche Scientifique", stageScope: "secondary" },
  { id: "global-citizenship", nameEn: "Global Citizenship", nameFr: "Citoyenneté Mondiale", stageScope: "secondary" },
  { id: "economic-systems", nameEn: "Economic Systems", nameFr: "Systèmes Économiques", stageScope: "secondary" },
  { id: "research-methods", nameEn: "Research Methods", nameFr: "Méthodologie de Recherche", stageScope: "highschool" },
  { id: "career-pathways", nameEn: "Career Pathways", nameFr: "Parcours de Carrière", stageScope: "highschool" },
  { id: "civic-responsibility", nameEn: "Civic Responsibility", nameFr: "Responsabilité Civique", stageScope: "highschool" },
];

export const SUBJECTS = [
  // Domain 1: Basic Knowledge — 60%
  { id: "english", nameEn: "English Language", nameFr: "Langue Anglaise", domain: "Basic Knowledge", weighting: 60, color: "amber", icon: "book-open", order: 1 },
  { id: "mathematics", nameEn: "Mathematics", nameFr: "Mathématiques", domain: "Basic Knowledge", weighting: 60, color: "green", icon: "calculator", order: 2 },
  { id: "science", nameEn: "Science and Technology", nameFr: "Sciences et Technologie", domain: "Basic Knowledge", weighting: 60, color: "lime", icon: "flask-conical", order: 3 },
  { id: "francais", nameEn: "Français", nameFr: "Français", domain: "Basic Knowledge", weighting: 60, color: "rose", icon: "languages", order: 4 },
  // Domain 2: Communal Life and National Integration — 5%
  { id: "social-studies", nameEn: "Social Studies", nameFr: "Études Sociales", domain: "Communal Life", weighting: 5, color: "orange", icon: "landmark", order: 5 },
  // Domain 3: Vocational and Life Skills — 20%
  { id: "arts", nameEn: "Arts", nameFr: "Arts", domain: "Vocational & Life Skills", weighting: 20, color: "purple", icon: "palette", order: 6 },
  { id: "pe", nameEn: "Physical Education & Sports", nameFr: "Éducation Physique et Sportive", domain: "Vocational & Life Skills", weighting: 20, color: "red", icon: "dumbbell", order: 7 },
  // Domain 4: Cultural Identity — 5%
  { id: "national-languages", nameEn: "National Languages and Cultures", nameFr: "Langues Nationales et Cultures", domain: "Cultural Identity", weighting: 5, color: "yellow", icon: "drum", order: 8 },
  // Domain 5: Digital Literacy — 10%
  { id: "ict", nameEn: "Information and Communication Technologies", nameFr: "Technologies de l'Information et de la Communication", domain: "Digital Literacy", weighting: 10, color: "teal", icon: "monitor", order: 9 },
];

// ISCED 0-3 full ladder — KG to High School (Master Prompt 1.4 / 2.1)
export const LEVELS = [
  { id: "kg", nameEn: "Kindergarten", nameFr: "Maternelle", isced: 0, ages: "3-5", focus: "Play-based learning, oral language, motor skills" },
  { id: "class1", nameEn: "Class 1", nameFr: "Classe 1", isced: 1, ages: "5-6", focus: "Foundational literacy, numeracy, curiosity" },
  { id: "class2", nameEn: "Class 2", nameFr: "Classe 2", isced: 1, ages: "6-7", focus: "Reading fluency, number sense, inquiry" },
  { id: "class3", nameEn: "Class 3", nameFr: "Classe 3", isced: 1, ages: "7-8", focus: "Consolidated literacy, operations, observation" },
  { id: "class4", nameEn: "Class 4", nameFr: "Classe 4", isced: 1, ages: "8-9", focus: "Extended literacy, fractions, experiments" },
  { id: "class5", nameEn: "Class 5", nameFr: "Classe 5", isced: 1, ages: "9-10", focus: "Analysis, research skills, composition" },
  { id: "class6", nameEn: "Class 6", nameFr: "Classe 6", isced: 1, ages: "10-11", focus: "FESO preparation, mastery, autonomy" },
  { id: "form1", nameEn: "Form 1", nameFr: "6ème", isced: 2, ages: "11-12", focus: "Subject specialization begins" },
  { id: "form2", nameEn: "Form 2", nameFr: "5ème", isced: 2, ages: "12-13", focus: "Critical thinking, lab skills" },
  { id: "form3", nameEn: "Form 3", nameFr: "4ème", isced: 2, ages: "13-14", focus: "Applied sciences, argumentation" },
  { id: "form4", nameEn: "Form 4", nameFr: "3ème", isced: 2, ages: "14-15", focus: "BEPC/GCE O-Level foundations" },
  { id: "form5", nameEn: "Form 5", nameFr: "2nde", isced: 2, ages: "15-16", focus: "Specialization, exam readiness" },
  { id: "lower-sixth", nameEn: "Lower Sixth", nameFr: "1ère", isced: 3, ages: "16-17", focus: "A-Level Part 1, career exploration" },
  { id: "upper-sixth", nameEn: "Upper Sixth", nameFr: "Terminale", isced: 3, ages: "17-18", focus: "A-Level/Baccalauréat, career readiness" },
];

export const STAGES = LEVELS.map((l) => l.id);

// ============================================================================
// CLASS 3 — MONTH 1 — ILT: THE HOME (verbatim from Regional Monthly Scheme)
// ============================================================================

export const SCHEME_WEEKS = [
  // ---- ENGLISH LANGUAGE — Month 1: THE HOME ----
  {
    id: "eng-class3-m1w1",
    subjectId: "english",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Speaking and listening", "Reading", "Writing", "Grammar and vocabulary", "Literature"],
    contents: ["Greetings: morning, afternoon, night", "Sight word", "Upright joint script", "Verbs: Auxiliary verbs", "Adventure"],
    outcomes: [
      "Greet people and respond to greetings appropriately at different periods of the day",
      "Read words",
      "Copy out short texts of at least five different sentences several times legibly and consistently",
      "Appropriate use of Auxiliary verbs",
      "Read pictures, adventure stories",
    ],
    resources: ["Flashcards", "Magazines", "Pens", "Charts", "Adventure stories"],
  },
  {
    id: "eng-class3-m1w2",
    subjectId: "english",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Speaking and listening", "Reading", "Writing", "Grammar and vocabulary", "Literature"],
    contents: ["Songs/words", "Multisyllabic words", "Spelling and dictation - words with apostrophes", "Kinds of nouns: Common, Proper, Concrete", "Stories"],
    outcomes: [
      "Sing songs using correct tones and melody",
      "Read short texts audibly",
      "Write sentences with apostrophes correctly",
      "Identify and use nouns in simple sentences",
      "Read picture adventure stories",
    ],
    resources: ["Telephone", "Cartoons", "Simplified dictionaries", "Charts", "Adventure stories"],
  },
  {
    id: "eng-class3-m1w3",
    subjectId: "english",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Speaking and listening", "Reading", "Writing", "Grammar and vocabulary", "Literature"],
    contents: ["Songs – popular (traditional)", "Pictures", "Words with apostrophe s'", "Kinds of nouns: common, proper, concrete", "Stories"],
    outcomes: [
      "Sing songs using correct tones and melody",
      "Show love for reading",
      "Write sentences with apostrophe s' correctly",
      "Identify and use nouns in simple sentences",
      "Read stories with short texts",
    ],
    resources: ["Telephone", "Radio", "Pictures", "Related textbooks", "Relevant charts", "Story books"],
  },
  {
    id: "eng-class3-m1w4",
    subjectId: "english",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Integration", "Assessment", "Remediation"],
    contents: ["Integration activities, Assessment and remediation"],
    outcomes: ["Use knowledge, skills and attitudes acquired to apply in daily life situations"],
    resources: ["Checklist", "Observation grill", "Tests, quiz", "Portfolios, broadsheets"],
  },

  // ---- MATHEMATICS — Month 1: THE HOME (components taught within the week per MINEDUB) ----
  {
    id: "mat-class3-m1w1",
    subjectId: "mathematics",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Numbers and operations", "Sets and logic", "Measurement and size", "Geometry and space", "Statistics and graphs"],
    contents: ["Numbers", "Symbols", "Calendar (days of the week)", "Shapes (3 dimensional)", "Collection of data"],
    outcomes: [
      "Count numbers up to 100",
      "Distinguish set symbols",
      "Name days of the week",
      "Identify and draw shapes",
      "Collection of data on given statistics",
    ],
    resources: ["Counters", "Books, pens", "Calendar", "Charts", "Flash cards"],
  },
  {
    id: "mat-class3-m1w2",
    subjectId: "mathematics",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Numbers and operations", "Sets and logic", "Measurement and size", "Geometry and space", "Statistics and graphs"],
    contents: ["Numbers", "Elements of a set", "Months of the year and the 13 lunar months", "Shapes (4 dimensional)", "Presentation"],
    outcomes: [
      "Write numbers up to 100",
      "Arrange belongings in an orderly manner",
      "Name months of the year and describe the 13 lunar months",
      "Construct 4 dimensional shapes using natural and recycled materials",
      "Present data on graph",
    ],
    resources: ["Books", "Charts", "Calendar", "Papers, cartons", "Scissors", "Ruler"],
  },
  {
    id: "mat-class3-m1w3",
    subjectId: "mathematics",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Numbers and operations", "Sets and logic", "Measurement and size", "Geometry and space", "Statistics and graphs"],
    contents: ["Count and write numbers from 101 to 500", "Equal and equivalent sets", "Ordinary/leap year", "Shapes", "Ranking"],
    outcomes: [
      "Count and write numbers from 101 to 500",
      "Differentiate between equal and equivalent sets",
      "Distinguish ordinary year from a leap year",
      "Manipulate shapes on puzzle",
      "Arrange numbers in ascending order",
    ],
    resources: ["Chart", "Flash cards", "Sets", "Calendar", "Puzzle games"],
  },
  {
    id: "mat-class3-m1w4",
    subjectId: "mathematics",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Integration", "Assessment", "Remediation"],
    contents: ["Integration activities, assessment and remediation"],
    outcomes: ["Apply knowledge, skills and attitudes to daily life situations"],
    resources: ["Tests", "Quiz", "Portfolios"],
  },

  // ---- SCIENCE AND TECHNOLOGY — Month 1: HOME ----
  {
    id: "sci-class3-m1w1",
    subjectId: "science",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Health Education", "Technology and Engineering", "Environmental Education"],
    contents: ["Parts of the body", "Tools (carpenter, farming, hunting)", "Immediate Environment"],
    outcomes: ["Identify various parts of the body", "Identify different tools in the locality", "Identify and name the components of the home"],
    resources: ["Drawings", "Charts", "Real objects"],
  },
  {
    id: "sci-class3-m1w2",
    subjectId: "science",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Health Education", "Technology and Engineering", "Environmental Education"],
    contents: ["Functions of the parts of the body", "Uses of tools", "The school"],
    outcomes: ["Discuss ways to care for the various parts of the body", "Identify different tools in the locality", "Identify and name the components of the school"],
    resources: ["Charts", "Pictures", "Real objects", "Drawings"],
  },
  {
    id: "sci-class3-m1w3",
    subjectId: "science",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Health Education", "Technology and Engineering", "Environmental Education"],
    contents: ["Personal hygiene (care of the body)", "Uses of tools", "The community"],
    outcomes: ["Discuss more ways to care for the body parts", "Demonstrate the use of the different tools", "Locate places in the community"],
    resources: ["Charts", "Pictures", "Real objects"],
  },
  {
    id: "sci-class3-m1w4",
    subjectId: "science",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Health Education", "Technology and Engineering", "Environmental Education"],
    contents: ["Machines (sewing, grinding, etc.)", "The community", "Integration activities, assessment and remediation"],
    outcomes: ["Identify different types of machines in the locality", "Locate places and services in a community", "Apply knowledge, skills and attitude to daily life situations"],
    resources: ["Pictures", "Portfolios", "Broadsheets"],
  },

  // ---- FRANÇAIS — Mois 1 : LA MAISON (Contexte: le salon) ----
  {
    id: "fra-class3-m1w1",
    subjectId: "francais",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Compréhension et expression orale (CEO)", "Compréhension écrite (lecture)", "Vocabulaire", "Orthographe", "Grammaire et conjugaison"],
    contents: ["Présentation lexique", "Lecture des mots et des phrases", "Le dictionnaire bilingue", "Marques morphologiques", "Groupe nominal", "Les salutations (bonjour, salut, bonsoir)"],
    outcomes: [
      "Saluer, se présenter et présenter quelqu'un",
      "Lire des mots et des phrases",
      "Utiliser le dictionnaire bilingue, développer le goût de la lecture",
      "Utiliser les signes morphologiques",
      "Identifier le groupe nominal",
    ],
    resources: ["Jeux de rôle", "Dramatisation", "Systématisation", "Illustrations"],
  },
  {
    id: "fra-class3-m1w2",
    subjectId: "francais",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Compréhension et expression orale (CEO)", "Compréhension écrite (lecture)", "Vocabulaire", "Orthographe", "Grammaire et conjugaison"],
    contents: ["Les mots et les phrases relatifs au centre d'intérêt", "Lexique en relation avec le centre d'intérêt (majuscule, virgule)", "Le nom (nom, déterminants)"],
    outcomes: ["Se présenter et présenter les membres de sa famille", "Lire un court passage à haute voix", "Utiliser les majuscules et les virgules", "Identifier le nom et ses déterminants"],
    resources: ["Images", "Dictionnaire bilingue", "Cartes mentales"],
  },
  {
    id: "fra-class3-m1w3",
    subjectId: "francais",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Compréhension et expression orale (CEO)", "Compréhension écrite (lecture)", "Vocabulaire", "Orthographe", "Grammaire et conjugaison"],
    contents: ["Dialogue au salon", "Lecture silencieuse", "Champ lexical de la maison", "Phrase simple"],
    outcomes: ["Tenir un court dialogue au salon", "Lire silencieusement et répondre aux questions", "Utiliser le champ lexical de la maison", "Construire une phrase simple"],
    resources: ["Dialogues", "Textes", "Images"],
  },
  {
    id: "fra-class3-m1w4",
    subjectId: "francais",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Intégration", "Évaluation", "Remédiation"],
    contents: ["Activités d'intégration, évaluation et remédiation"],
    outcomes: ["Réinvestir les connaissances, compétences et attitudes dans des situations de vie quotidienne"],
    resources: ["Fiches d'évaluation", "Portfolios"],
  },

  // ---- SOCIAL STUDIES — Month 1: HOME ----
  {
    id: "soc-class3-m1w1",
    subjectId: "social-studies",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["History", "Geography", "Citizenship (civics)", "Moral education"],
    contents: ["Definition and types of history", "Definition of geography", "The National emblems (flag)", "Greetings"],
    outcomes: [
      "Define and name the various types of history",
      "Define and state reasons for studying geography",
      "Define and explain the importance of the four National emblems",
      "Practice simple etiquettes (how to greet)",
    ],
    resources: ["Stories", "Pictures, flag, chart"],
  },
  {
    id: "soc-class3-m1w2",
    subjectId: "social-studies",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["History", "Geography: Physical", "Citizenship (civics and morals)"],
    contents: ["Sources of history (Newspapers, magazines)", "Physical features: Mountains", "The National Anthem", "Apologies"],
    outcomes: [
      "Describe the sources of history",
      "Identify mountains in Cameroon and locate places in their immediate environment",
      "Sing the national anthem correctly",
      "Name the colours and standing position when the flag is hoisted",
      "Say how to greet and promote ethical values",
    ],
    resources: ["Relevant charts", "Newspapers", "Maps, magazines"],
  },
  {
    id: "soc-class3-m1w3",
    subjectId: "social-studies",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["History", "Geography", "Citizenship (civics, human right)"],
    contents: ["Sources of history: (letters and diaries)", "Physical features: Hills", "Administrative Ruler", "Children's rights"],
    outcomes: [
      "Describe sources of history from letters and diaries",
      "Identify hills in Cameroon and locate them",
      "Explain the role of administrative rulers",
      "State children's rights",
    ],
    resources: ["Maps, charts, pictures", "Textbooks"],
  },
  {
    id: "soc-class3-m1w4",
    subjectId: "social-studies",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Integration", "Assessment", "Remediation"],
    contents: ["Integration activities, assessment and remediation"],
    outcomes: ["Apply knowledge, skills and attitudes to daily life situations"],
    resources: ["Tests", "Portfolios"],
  },

  // ---- ARTS — Month 1 ----
  {
    id: "art-class3-m1w1",
    subjectId: "arts",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Visual Arts", "Performing Arts"],
    contents: ["Painting Materials", "Dance steps"],
    outcomes: ["Identify painting materials", "Reproduce dance steps from the North West Region"],
    resources: ["Audio-visual aids", "Videos"],
  },
  {
    id: "art-class3-m1w2",
    subjectId: "arts",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Visual Arts", "Performing Arts"],
    contents: ["Painting Materials", "Dance steps"],
    outcomes: ["Identify painting materials", "Reproduce dance steps from the Littoral Region"],
    resources: ["Videos", "Visual aids"],
  },
  {
    id: "art-class3-m1w3",
    subjectId: "arts",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Performing Arts"],
    contents: ["Dance steps", "Rhythms"],
    outcomes: ["Dance following the customs and tradition of the people"],
    resources: ["Whistle", "Gong", "Drum"],
  },
  {
    id: "art-class3-m1w4",
    subjectId: "arts",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Visual Arts", "Performing Arts"],
    contents: ["Rhythms, melodies and parts", "Dance steps", "Revision, assessment and remediation"],
    outcomes: ["Sing respecting pitch and intonation", "Reproduce dance steps from the northern regions", "Apply K.S.A to daily life activities"],
    resources: ["Trumpet", "Piano", "Flutes", "Local guitars"],
  },

  // ---- P.E & SPORTS — Month 1: THE HOME ----
  {
    id: "pe-class3-m1w1",
    subjectId: "pe",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Movements", "Relays", "Sprints", "Balancing"],
    contents: ["Relays", "Sprints", "Balancing"],
    outcomes: [
      "Define relays and types of relays",
      "Define sprints and types of sprints",
      "Definition of balancing and types of balancing",
    ],
    resources: ["Flash cards", "Timers"],
  },
  {
    id: "pe-class3-m1w2",
    subjectId: "pe",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Jump", "Throws", "Team sports", "Gymnastics"],
    contents: ["Jump", "Throws", "Team sports", "Gymnastics"],
    outcomes: ["Define jump and types of jumps", "Define throws and types of throws", "Define team sports and types", "Define gymnastics and types"],
    resources: ["Flash cards", "Flip charts"],
  },
  {
    id: "pe-class3-m1w3",
    subjectId: "pe",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Movements", "Relays", "Sprints", "Gymnastics"],
    contents: ["Importance of balancing", "Importance of relays", "Postures"],
    outcomes: ["State the importance of balancing", "State the importance of relays", "Run faster over a given distance"],
    resources: ["Clappers", "Whistles", "Wood ash"],
  },
  {
    id: "pe-class3-m1w4",
    subjectId: "pe",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Integration", "Assessment", "Remediation"],
    contents: ["Integration activities, assessment and remediation"],
    outcomes: ["Apply knowledge, skills and attitudes to daily life situations"],
    resources: ["Timers", "Whistles"],
  },

  // ---- ICT — Month 1 ----
  {
    id: "ict-class3-m1w1",
    subjectId: "ict",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Basic knowledge of computer and ICT tools"],
    contents: ["Components of a computer (keyboard and mouse)"],
    outcomes: ["Describe the role of each component and explain its importance"],
    resources: ["Keyboard", "Mouse", "CPU"],
  },
  {
    id: "ict-class3-m1w2",
    subjectId: "ict",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Basic knowledge of computer and ICT tools"],
    contents: ["Components of a computer (scanner and printer)"],
    outcomes: ["Describe the role of a scanner, a printer and their importance"],
    resources: ["Scanner", "Printer"],
  },
  {
    id: "ict-class3-m1w3",
    subjectId: "ict",
    stage: "class3",
    month: 1,
    week: 3,
    iltId: "the-home",
    components: ["Basic knowledge of computer and ICT tools"],
    contents: ["Components of a computer (monitor and speakers)"],
    outcomes: ["Describe the role of the monitor and speaker and their importance"],
    resources: ["Monitor", "Speaker"],
  },
  {
    id: "ict-class3-m1w4",
    subjectId: "ict",
    stage: "class3",
    month: 1,
    week: 4,
    iltId: "the-home",
    components: ["Basic knowledge of computer and ICT tools"],
    contents: ["External drives", "Assessment and remediation"],
    outcomes: ["Define and list external drives of a computer", "Use KSA to solve daily life problems"],
    resources: ["Flash drives", "External drives"],
  },

  // ---- NATIONAL LANGUAGES & CULTURES — Month 1 (GACL orthography + Cultural Identity domain) ----
  {
    id: "nat-class3-m1w1",
    subjectId: "national-languages",
    stage: "class3",
    month: 1,
    week: 1,
    iltId: "the-home",
    components: ["Oral expression", "Tone practice", "Cultural stories"],
    contents: ["Greetings in a national language (Ewondo)", "Tone contrasts (GACL orthography)", "Family words in Ewondo"],
    outcomes: [
      "Greet people in Ewondo at different periods of the day",
      "Distinguish high and low tones in Ewondo words",
      "Name family members in Ewondo",
      "Recite a short Ewondo traditional song",
    ],
    resources: ["Native speaker audio", "GACL charts", "Story books"],
  },
  {
    id: "nat-class3-m1w2",
    subjectId: "national-languages",
    stage: "class3",
    month: 1,
    week: 2,
    iltId: "the-home",
    components: ["Oral expression", "Tone practice", "Cultural stories"],
    contents: ["Parts of the house in Ewondo (mfam, nkol, nsisim)", "Counting 1-10 in Ewondo", "Proverb of the week"],
    outcomes: ["Name parts of the house in Ewondo", "Count objects 1-10 in Ewondo", "Explain the meaning of a traditional proverb"],
    resources: ["Native speaker audio", "GACL charts", "Proverb cards"],
  },
];

// ============================================================================
// BADGES CATALOG (gamification engine)
// ============================================================================

export const BADGES = [
  { code: "polite-speaker", nameEn: "Polite Speaker", nameFr: "Parleur Poli", descEn: "Mastered greetings at different times of the day", icon: "👋", category: "language", rarity: "common" },
  { code: "reading-star", nameEn: "Reading Star", nameFr: "Étoile de Lecture", descEn: "Read words and short texts aloud with confidence", icon: "⭐", category: "language", rarity: "common" },
  { code: "storyteller", nameEn: "Storyteller", nameFr: "Conteur", descEn: "Completed an adventure story quest", icon: "📖", category: "language", rarity: "rare" },
  { code: "francophone-star", nameEn: "Francophone Star", nameFr: "Étoile Francophone", descEn: "Greeted and presented in French", icon: "🗼", category: "language", rarity: "common" },
  { code: "culture-keeper", nameEn: "Culture Keeper", nameFr: "Gardien de la Culture", descEn: "Practiced a national language with correct tones", icon: "🥁", category: "culture", rarity: "rare" },
  { code: "counter-champion", nameEn: "Counter Champion", nameFr: "Champion du Comptage", descEn: "Counted aloud up to 100 without stopping", icon: "🔢", category: "math", rarity: "common" },
  { code: "math-wizard", nameEn: "Math Wizard", nameFr: "Sorcier des Maths", descEn: "Solved mental math challenges by speaking", icon: "🧙", category: "math", rarity: "rare" },
  { code: "shape-master", nameEn: "Shape Master", nameFr: "Maître des Formes", descEn: "Identified and drew geometric shapes", icon: "🔷", category: "math", rarity: "common" },
  { code: "science-explorer", nameEn: "Science Explorer", nameFr: "Explorateur des Sciences", descEn: "Discovered the parts of the body and tools", icon: "🔬", category: "science", rarity: "common" },
  { code: "hygiene-hero", nameEn: "Hygiene Hero", nameFr: "Héros de l'Hygiène", descEn: "Learned to care for the body", icon: "🧼", category: "science", rarity: "common" },
  { code: "patriot", nameEn: "Young Patriot", nameFr: "Jeune Patriote", descEn: "Sang the anthem and explained the national emblems", icon: "🇨🇲", category: "culture", rarity: "rare" },
  { code: "artist", nameEn: "Rising Artist", nameFr: "Artiste Montant", descEn: "Identified painting materials and danced traditional steps", icon: "🎨", category: "culture", rarity: "common" },
  { code: "athlete", nameEn: "Little Athlete", nameFr: "Petit Athlète", descEn: "Defined and practised relays, sprints and balancing", icon: "🏃", category: "culture", rarity: "common" },
  { code: "digital-explorer", nameEn: "Digital Explorer", nameFr: "Explorateur Numérique", descEn: "Named the components of a computer", icon: "💻", category: "digital", rarity: "common" },
  { code: "project-master", nameEn: "Project Master", nameFr: "Maître du Projet", descEn: "Completed all three phases of a monthly project", icon: "🏆", category: "project", rarity: "epic" },
  { code: "voice-master", nameEn: "Voice Master", nameFr: "Maître de la Voix", descEn: "Completed 10 speaking practice activities", icon: "🎤", category: "language", rarity: "epic" },
  { code: "streak-7", nameEn: "7-Day Flame", nameFr: "Flamme de 7 Jours", descEn: "Learned every day for a week", icon: "🔥", category: "streak", rarity: "rare" },
  { code: "level-5", nameEn: "Level 5 Achiever", nameFr: "Niveau 5 Atteint", descEn: "Reached level 5 of wisdom", icon: "🎖️", category: "level", rarity: "epic" },
];

// ============================================================================
// SKILL TREE (per subject domain — learner profile)
// ============================================================================

export const SKILL_TREE = [
  { code: "speaking", nameEn: "Speaking & Listening", nameFr: "Parler et Écouter", domain: "english" },
  { code: "reading", nameEn: "Reading", nameFr: "Lecture", domain: "english" },
  { code: "writing", nameEn: "Writing", nameFr: "Écriture", domain: "english" },
  { code: "grammar", nameEn: "Grammar & Vocabulary", nameFr: "Grammaire et Vocabulaire", domain: "english" },
  { code: "numbers", nameEn: "Numbers & Operations", nameFr: "Nombres et Opérations", domain: "mathematics" },
  { code: "sets", nameEn: "Sets & Logic", nameFr: "Ensembles et Logique", domain: "mathematics" },
  { code: "measurement", nameEn: "Measurement & Size", nameFr: "Mesure et Grandeur", domain: "mathematics" },
  { code: "geometry", nameEn: "Geometry & Space", nameFr: "Géométrie et Espace", domain: "mathematics" },
  { code: "statistics", nameEn: "Statistics & Graphs", nameFr: "Statistiques et Graphiques", domain: "mathematics" },
  { code: "health-ed", nameEn: "Health Education", nameFr: "Éducation Sanitaire", domain: "science" },
  { code: "tech-eng", nameEn: "Technology & Engineering", nameFr: "Technologie et Ingénierie", domain: "science" },
  { code: "env-ed", nameEn: "Environmental Education", nameFr: "Éducation Environnementale", domain: "science" },
  { code: "ceo-fr", nameEn: "Expression Orale", nameFr: "Expression Orale", domain: "francais" },
  { code: "ce-fr", nameEn: "Lecture (FR)", nameFr: "Lecture", domain: "francais" },
  { code: "history", nameEn: "History", nameFr: "Histoire", domain: "social-studies" },
  { code: "geography", nameEn: "Geography", nameFr: "Géographie", domain: "social-studies" },
  { code: "civics", nameEn: "Citizenship & Morals", nameFr: "Citoyenneté et Morale", domain: "social-studies" },
  { code: "visual-arts", nameEn: "Visual Arts", nameFr: "Arts Visuels", domain: "arts" },
  { code: "performing-arts", nameEn: "Performing Arts", nameFr: "Arts du Spectacle", domain: "arts" },
  { code: "movement", nameEn: "Movement & Balance", nameFr: "Mouvement et Équilibre", domain: "pe" },
  { code: "team-sports", nameEn: "Team Sports", nameFr: "Sports Collectifs", domain: "pe" },
  { code: "nat-lang", nameEn: "National Language (Ewondo)", nameFr: "Langue Nationale (Ewondo)", domain: "national-languages" },
  { code: "ict-tools", nameEn: "ICT Tools", nameFr: "Outils TIC", domain: "ict" },
];
