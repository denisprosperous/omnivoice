// ============================================================================
// VOICE-ENABLED GAMIFIED LESSON PLANS — exact JSON schema per Master Prompt 6.3
// Each lesson: voice_assets (hook/instruction/practice/feedback/celebration/BGM),
// voice_interactions (ASR targets), gamification (≥2 mechanics per lesson),
// 5-phase activities (Voice Hook → Listen & Learn → Speak & Practice →
// Apply & Create → Celebrate), assessment criteria, offline capability.
// Scope: Class 3, Month 1 (ILT: The Home) — complete, per roadmap Phase 2.
// ============================================================================

export interface PracticePrompt {
  prompt: string;
  promptFr?: string;
  target: string;
  evaluation: string;
  kind?: "repeat" | "answer" | "count" | "open";
}

export interface LessonPlan {
  lesson_id: string;
  subject: string;
  level: string;
  isced_level: number;
  integrated_learning_theme: string;
  sub_theme: string;
  week: number;
  month: number;
  cefr_alignment: string;
  ib_learner_profile: string[];
  expected_learning_outcomes: string[];
  teaching_strategies: string[];
  didactic_materials: { physical: string[]; digital: string[] };
  voice_assets: {
    hook: { character: string; text: string; textFr: string; languages: string[] };
    instruction: { text: string; textFr: string };
    learn_content: { title: string; titleFr: string; lines: string[]; linesFr: string[]; visual: string };
    practice_prompts: PracticePrompt[];
    feedback: { correct: string; incorrect: string; encouragement: string };
    celebration: { character: string; text: string; textFr: string };
    background_music: string;
  };
  voice_interactions: Array<{
    type: string;
    prompt: string;
    asr_target?: string;
    expected_answer?: string;
    evaluation_criteria: string[];
  }>;
  sts_scenario?: { description: string; descriptionFr: string; character: string; opener: string };
  gamification: {
    mechanics: string[];
    xp_points: number;
    badge_name: string;
    badge_code: string;
    voice_challenge: { description: string; descriptionFr: string; evaluation: string };
  };
  activities: Array<{
    phase: string;
    duration: string;
    description: string;
    descriptionFr: string;
  }>;
  assessment: {
    criteria: string[];
    methods: string[];
  };
  offline_capability: {
    downloadable: boolean;
    size_mb: number;
    components: string[];
  };
  differentiation: string[];
  cultural_notes: string;
  cultural_notesFr: string;
}

const FEEDBACK_DEFAULT = {
  correct: "balafon_positive.wav", // cheerful balafon riff, 2-3 ascending notes
  incorrect: "djembe_try_again.wav", // gentle talking drum pattern (supportive)
  encouragement: "kwe_encouraging.wav",
};

function plan(p: Partial<LessonPlan> & Pick<LessonPlan, "lesson_id" | "subject" | "week" | "sub_theme" | "voice_assets">): LessonPlan {
  return {
    level: "Class 3",
    isced_level: 1,
    integrated_learning_theme: "The Home",
    month: 1,
    cefr_alignment: "A1",
    ib_learner_profile: ["Communicators", "Inquirers"],
    expected_learning_outcomes: [],
    teaching_strategies: ["Role-play", "Demonstration", "Questions and answers"],
    didactic_materials: { physical: ["Flashcards", "Real objects"], digital: ["Audio player", "Recording device"] },
    voice_interactions: (p.voice_assets?.practice_prompts || []).map((pp) => ({
      type: pp.kind === "answer" ? "listening_comprehension" : "speaking_practice",
      prompt: pp.prompt,
      asr_target: pp.target,
      evaluation_criteria: pp.evaluation === "comprehension" ? ["correctness"] : ["pronunciation", "fluency"],
    })),
    sts_scenario: undefined,
    gamification: {
      mechanics: ["Points", "Badge"],
      xp_points: 50,
      badge_name: "",
      badge_code: "",
      voice_challenge: { description: "", descriptionFr: "", evaluation: "asr_completion" },
    },
    activities: [],
    assessment: {
      criteria: ["Fluency in speaking", "Audibility", "Willingness to take turns"],
      methods: ["Observation checklist", "ASR accuracy score", "Voice recording portfolio"],
    },
    offline_capability: { downloadable: true, size_mb: 15, components: ["audio_files", "visual_slides", "asr_small_model"] },
    differentiation: [],
    cultural_notes: "",
    cultural_notesFr: "",
    ...p,
  } as LessonPlan;
}

export const LESSONS: LessonPlan[] = [
  // ================= ENGLISH — Week 1: Greetings (flagship per 6.4) =================
  plan({
    lesson_id: "eng_class3_home_w1",
    subject: "english",
    week: 1,
    sub_theme: "The Kitchen — Greetings",
    cefr_alignment: "A1",
    ib_learner_profile: ["Communicators", "Inquirers"],
    expected_learning_outcomes: [
      "Greet people and respond to greetings appropriately at different periods of the day",
      "Read words (sight words)",
      "Appropriate use of auxiliary verbs",
    ],
    teaching_strategies: ["Role-play", "Demonstration", "Questions and answers"],
    didactic_materials: { physical: ["Flashcards", "Real objects (clock, pictures)"], digital: ["Audio player", "Recording device"] },
    voice_assets: {
      hook: {
        character: "kwe",
        text: "Good morning, young one! Can you help me greet my friends?",
        textFr: "Bonjour, jeune ami ! Peux-tu m'aider à saluer mes amis ?",
        languages: ["en", "fr", "ewo"],
      },
      instruction: {
        text: "Listen carefully and repeat after me.",
        textFr: "Écoute bien et répète après moi.",
      },
      learn_content: {
        title: "Greetings all day long",
        titleFr: "Des salutations toute la journée",
        lines: [
          "In the MORNING we say: Good morning!",
          "In the AFTERNOON we say: Good afternoon!",
          "At NIGHT we say: Good evening / Good night!",
          "When someone greets you, answer: 'Good morning, sir!' or 'Good afternoon, ma!'",
          "Auxiliary verbs help us: I AM awake, you ARE sleeping, he IS cooking.",
        ],
        linesFr: [
          "Le MATIN on dit : Good morning!",
          "L'APRÈS-MIDI on dit : Good afternoon!",
          "Le SOIR on dit : Good evening / Good night!",
          "Quand on te salue, réponds : 'Good morning, sir!' ou 'Good afternoon, ma!'",
          "Les verbes auxiliaires aident : I AM, you ARE, he IS.",
        ],
        visual: "greetings-scene", // morning kitchen, afternoon market, night compound
      },
      practice_prompts: [
        { prompt: "Say: Good morning!", target: "good morning", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Say: Good afternoon!", target: "good afternoon", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "What do you say at night?", target: "good night", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: I am fine, thank you!", target: "i am fine thank you", evaluation: "pronunciation_accuracy", kind: "repeat" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "kwe",
        text: "Wonderful! You are a Polite Speaker now. Cameroon is proud of you!",
        textFr: "Formidable ! Tu es maintenant un Parleur Poli. Le Cameroun est fier de toi !",
      },
      background_music: "village_morning_loop.wav", // warm kalimba + family sounds (ILT: The Home)
    },
    sts_scenario: {
      description: "Greet Kwe at different times of day — he will answer and ask how you are",
      descriptionFr: "Salue Kwe à différents moments de la journée — il répondra et te demandera comment tu vas",
      character: "kwe",
      opener: "Good morning, my friend! How are you today?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 50,
      badge_name: "Polite Speaker",
      badge_code: "polite-speaker",
      voice_challenge: {
        description: "Record yourself greeting 3 different people (morning, afternoon, night)",
        descriptionFr: "Enregistre-toi en train de saluer 3 personnes différentes (matin, après-midi, soir)",
        evaluation: "asr_completion",
      },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kwe appears and asks for help greeting friends in the kitchen", descriptionFr: "Kwe demande de l'aide pour saluer ses amis dans la cuisine" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Slides show morning, afternoon and night scenes with greetings", descriptionFr: "Diapositives : scènes du matin, de l'après-midi et du soir avec salutations" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Learner records greetings; ASR evaluates pronunciation", descriptionFr: "L'apprenant enregistre les salutations ; l'ASR évalue la prononciation" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Role-play with Kwe using speech-to-speech at different times of day", descriptionFr: "Jeu de rôle avec Kwe (synthèse vocale) à différents moments de la journée" },
      { phase: "Celebrate", duration: "1 min", description: "Kwe congratulates; Polite Speaker badge awarded with makossa jingle", descriptionFr: "Kwe félicite ; badge Parleur Poli avec le jingle makossa" },
    ],
    assessment: {
      criteria: ["Fluency in speaking", "Audibility", "Willingness to take turns", "Correct greeting for the time of day"],
      methods: ["Observation checklist", "ASR accuracy score", "Voice recording portfolio"],
    },
    differentiation: [
      "Shy learners may whisper to the mic first, then speak louder",
      "Advanced learners add 'How was your night?' to their greetings",
      "Audio-only instructions for learners with reading difficulty",
    ],
    cultural_notes: "In Cameroon, children greet elders with both hands or a slight bow. Greetings change with the time of day and are never skipped — politeness is the first subject of the day!",
    cultural_notesFr: "Au Cameroun, les enfants saluent les aînés avec les deux mains ou une petite révérence. Les salutations changent selon le moment de la journée et ne se sautent jamais — la politesse est la première leçon de la journée !",
  }),

  // ================= ENGLISH — Week 2: Songs, multisyllabic words, nouns =================
  plan({
    lesson_id: "eng_class3_home_w2",
    subject: "english",
    week: 2,
    sub_theme: "The Sitting Room — Songs and Nouns",
    expected_learning_outcomes: [
      "Sing songs using correct tones and melody",
      "Read short texts audibly",
      "Identify and use nouns (common, proper, concrete) in simple sentences",
    ],
    teaching_strategies: ["Song and rhythm", "Picture reading", "Guided discovery"],
    voice_assets: {
      hook: {
        character: "mbi",
        text: "Hello hello! Mbi found a song in the sitting room! Clap with me!",
        textFr: "Bonjour bonjour ! Mbi a trouvé une chanson dans le salon ! Tape des mains avec moi !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Listen to the song, then sing it back to me.", textFr: "Écoute la chanson, puis chante-la pour moi." },
      learn_content: {
        title: "Nouns around the house",
        titleFr: "Les noms dans la maison",
        lines: [
          "A NOUN names a person, a place or a thing.",
          "Common noun: chair, table, radio (any one).",
          "Proper noun: Douala, Ngo, Cameroon (special name — capital letter!)",
          "Concrete noun: pot, spoon, mat (things we can touch).",
          "Song: 'Clap, clap, clap your hands, in the sitting room we stand!'",
        ],
        linesFr: [
          "Un NOM désigne une personne, un lieu ou une chose.",
          "Nom commun : chaise, table, radio.",
          "Nom propre : Douala, Ngo, Cameroun (majuscule !)",
          "Nom concret : marmite, cuillère, natte (qu'on peut toucher).",
          "Chanson : 'Clap, clap, clap your hands!'",
        ],
        visual: "sitting-room-scene",
      },
      practice_prompts: [
        { prompt: "Sing: Clap clap clap your hands!", target: "clap clap clap your hands", evaluation: "fluency", kind: "repeat" },
        { prompt: "Is 'Douala' a common noun or a proper noun? Say your answer.", target: "proper noun", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say a concrete noun you can see at home: a ...", target: "pot", evaluation: "vocabulary", kind: "open" },
        { prompt: "Say: Mbi is on the mat.", target: "mbi is on the mat", evaluation: "pronunciation_accuracy", kind: "repeat" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "mbi",
        text: "You sing like a Littoral star! Reading Star badge for you!",
        textFr: "Tu chantes comme une étoile du Littoral ! Badge Étoile de Lecture pour toi !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Mbi names objects; learner answers whether each is a common, proper or concrete noun",
      descriptionFr: "Mbi nomme des objets ; l'apprenant dit si c'est un nom commun, propre ou concret",
      character: "mbi",
      opener: "I see a radio! Tell me, is radio a common noun or a proper noun?",
    },
    gamification: {
      mechanics: ["Points", "Voice Challenge", "Choice"],
      xp_points: 50,
      badge_name: "Reading Star",
      badge_code: "reading-star",
      voice_challenge: { description: "Sing the sitting-room song and record it", descriptionFr: "Chante la chanson du salon et enregistre-la", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Mbi discovers a song in the sitting room", descriptionFr: "Mbi découvre une chanson dans le salon" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Song audio + noun types with sitting-room pictures", descriptionFr: "Chanson + types de noms avec images du salon" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Sing back; ASR checks fluency; answer noun questions by voice", descriptionFr: "Chanter ; l'ASR vérifie la fluidité ; répondre aux questions par la voix" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Voice game: classify nouns Mbi calls out", descriptionFr: "Jeu vocal : classer les noms que Mbi annonce" },
      { phase: "Celebrate", duration: "1 min", description: "Reading Star badge with bikutsi clapping", descriptionFr: "Badge Étoile de Lecture avec applaudements bikutsi" },
    ],
    assessment: { criteria: ["Correct tones and melody", "Noun identification", "Audibility"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Learners who cannot read yet follow the highlighted karaoke words", "Fast finishers write two proper nouns in their Project Book"],
    cultural_notes: "Singing is how Cameroonians pass on language. Call-and-response songs from Makossa and Bikutsi traditions make new words stick.",
    cultural_notesFr: "Le chant est la façon dont les Camerounais transmettent la langue. Les chansons en appel-réponse du makossa et du bikutsi font mémoriser les nouveaux mots.",
  }),

  // ================= MATH — Week 1: Numbers up to 100 =================
  plan({
    lesson_id: "mat_class3_home_w1",
    subject: "mathematics",
    week: 1,
    sub_theme: "Counting the Family Compound",
    ib_learner_profile: ["Thinkers", "Knowledgeable"],
    expected_learning_outcomes: [
      "Count numbers up to 100",
      "Distinguish set symbols",
      "Name days of the week",
      "Identify and draw shapes",
      "Collection of data on given statistics",
    ],
    teaching_strategies: ["Oral counting", "Demonstration", "Games and puzzles"],
    didactic_materials: { physical: ["Counters", "Calendar", "Flash cards"], digital: ["Audio player", "ASR counter"] },
    voice_assets: {
      hook: {
        character: "ngo",
        text: "My mother sent me to count the pots in the kitchen! Will you count with me up to 100?",
        textFr: "Ma mère m'envoie compter les marmites dans la cuisine ! Tu comptes avec moi jusqu'à 100 ?",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Count aloud with Ngo. The AI is listening — speak clearly!", textFr: "Compte à voix haute avec Ngo. L'IA écoute — parle clairement !" },
      learn_content: {
        title: "Numbers everywhere at home",
        titleFr: "Les nombres partout à la maison",
        lines: [
          "Count in tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100!",
          "A SET is a group: {spoon, fork, cup} — the symbol ∈ means 'belongs to'.",
          "Days of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
          "Shapes at home: the pot is a cylinder, the ball is a sphere, the box is a cube.",
          "Data: How many cups? 4. How many plates? 6 — that is collecting data!",
        ],
        linesFr: [
          "Compte par dizaines : 10, 20, 30, ..., 100 !",
          "Un ENSEMBLE est un groupe : {cuillère, fourchette, tasse} — ∈ signifie 'appartient à'.",
          "Les jours de la semaine : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.",
          "Les formes à la maison : la marmite est un cylindre, le ballon une sphère, la boîte un cube.",
          "Données : combien de tasses ? 4. Combien d'assiettes ? 6 — voilà collecter des données !",
        ],
        visual: "kitchen-numbers",
      },
      practice_prompts: [
        { prompt: "Count aloud from 1 to 10!", target: "1 2 3 4 5 6 7 8 9 10", evaluation: "fluency", kind: "count" },
        { prompt: "Count by tens: 10, 20, ... up to 100!", target: "10 20 30 40 50 60 70 80 90 100", evaluation: "fluency", kind: "count" },
        { prompt: "Say the first day of the week.", target: "monday", evaluation: "comprehension", kind: "answer" },
        { prompt: "What shape is a ball? Say it!", target: "sphere", evaluation: "comprehension", kind: "answer" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "ngo",
        text: "You counted like a champion! Counter Champion badge unlocked!",
        textFr: "Tu as compté comme un champion ! Badge Champion du Comptage débloqué !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Ngo asks mental-math questions aloud; learner answers verbally",
      descriptionFr: "Ngo pose des questions de calcul mental à voix haute ; l'apprenant répond oralement",
      character: "ngo",
      opener: "I have 3 pots and mother brings 2 more. How many pots now?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 60,
      badge_name: "Counter Champion",
      badge_code: "counter-champion",
      voice_challenge: { description: "Count from 1 to 20 aloud in one breath — ASR will verify every number!", descriptionFr: "Compte de 1 à 20 à voix haute en un souffle — l'ASR vérifiera chaque nombre !", evaluation: "asr_accuracy" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Ngo needs help counting pots in the kitchen", descriptionFr: "Ngo a besoin d'aide pour compter les marmites" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Counting by tens, set symbols, days, 3D shapes at home", descriptionFr: "Comptage par dizaines, ensembles, jours, formes 3D" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Oral counting with ASR verification of each number", descriptionFr: "Comptage oral avec vérification ASR de chaque nombre" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Mental math STS game with Ngo about the family compound", descriptionFr: "Jeu de calcul mental avec Ngo sur la concession" },
      { phase: "Celebrate", duration: "1 min", description: "Counter Champion badge + makossa level-up beat", descriptionFr: "Badge Champion du Comptage + beat makossa" },
    ],
    assessment: { criteria: ["Correct number sequence", "Audibility", "Speed of recall"], methods: ["ASR accuracy score", "Mental math record"] },
    differentiation: ["Number line visible for learners who need support", "Challenge: count backwards from 30 for advanced learners"],
    cultural_notes: "Counting is everywhere in Cameroonian life — counting eggs at the market, cups of water for the fufu, goats in the compound. Market women count in tens: dix, vingt, trente!",
    cultural_notesFr: "On compte partout dans la vie camerounaise — les œufs au marché, les tasses d'eau pour le fufu, les chèvres dans la concession. Les vendeuses comptent par dizaines !",
  }),

  // ================= SCIENCE — Week 1: Parts of the body =================
  plan({
    lesson_id: "sci_class3_home_w1",
    subject: "science",
    week: 1,
    sub_theme: "My Body, My First Machine",
    ib_learner_profile: ["Inquirers", "Caring"],
    expected_learning_outcomes: [
      "Identify various parts of the body",
      "Identify different tools in the locality",
      "Identify and name the components of the home",
    ],
    teaching_strategies: ["Observation", "Demonstration", "Questions and answers"],
    voice_assets: {
      hook: {
        character: "kong",
        text: "Kwe says our body is like a machine! Touch your head, then say HEAD loudly!",
        textFr: "Kwe dit que notre corps est une machine ! Touche ta tête, puis dis HEAD fort !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Touch the body part and say its name into the microphone.", textFr: "Touche la partie du corps et dis son nom dans le micro." },
      learn_content: {
        title: "Parts of the body",
        titleFr: "Les parties du corps",
        lines: [
          "HEAD, EYES, EARS, NOSE, MOUTH — I see, I hear, I smell, I taste!",
          "SHOULDERS, ARMS, HANDS — my hands carry water and clap for friends.",
          "LEGS, KNEES, FEET — my feet take me to school.",
          "Tools at home: the machete (farming), the hammer (carpenter), the spear (hunting).",
          "The components of the home: kitchen, sitting room, bedroom, compound.",
        ],
        linesFr: [
          "HEAD, EYES, EARS, NOSE, MOUTH — je vois, j'entends, je sens, je goûte !",
          "SHOULDERS, ARMS, HANDS — mes mains portent l'eau et applaudissent.",
          "LEGS, KNEES, FEET — mes pieds m'emmènent à l'école.",
          "Outils à la maison : la machette (agriculture), le marteau (charpente), la lance (chasse).",
          "Les composantes de la maison : cuisine, salon, chambre, concession.",
        ],
        visual: "body-diagram",
      },
      practice_prompts: [
        { prompt: "Touch your head and say: HEAD!", target: "head", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Which body part do you hear with? Say it!", target: "ears", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: I wash my hands before I eat.", target: "i wash my hands before i eat", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "What tool does the farmer use? Say it!", target: "machete", evaluation: "comprehension", kind: "answer" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "kong",
        text: "Science Explorer badge earned! Your body machine is amazing!",
        textFr: "Badge Explorateur des Sciences gagné ! Ta machine-corps est incroyable !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kong describes a body function; learner names the body part",
      descriptionFr: "Kong décrit une fonction ; l'apprenant nomme la partie du corps",
      character: "kong",
      opener: "I use this part to listen to the radio. What is it?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Challenge"],
      xp_points: 50,
      badge_name: "Science Explorer",
      badge_code: "science-explorer",
      voice_challenge: { description: "Name 5 body parts in 20 seconds!", descriptionFr: "Nomme 5 parties du corps en 20 secondes !", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kong presents the body as a wonderful machine", descriptionFr: "Kong présente le corps comme une machine merveilleuse" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Body diagram with narration; tools and home components", descriptionFr: "Schéma du corps avec narration ; outils et composantes" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Touch-and-say game with ASR evaluation", descriptionFr: "Jeu touche-et-dis avec évaluation ASR" },
      { phase: "Apply & Create", duration: "2-3 min", description: "STS riddles: Kong describes, learner names the part", descriptionFr: "Devinettes vocales : Kong décrit, l'apprenant nomme" },
      { phase: "Celebrate", duration: "1 min", description: "Science Explorer badge + celebration ensemble", descriptionFr: "Badge Explorateur des Sciences + ensemble de célébration" },
    ],
    assessment: { criteria: ["Correct identification", "Clear pronunciation", "Participation"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Physical movement keeps kinesthetic learners engaged", "Body part names also given in Ewondo for cultural identity"],
    cultural_notes: "Cameroonian proverbs teach through the body: 'The eye that sees the road will not lead you astray.' Traditional tools like the machete are honoured as the farmer's companion.",
    cultural_notesFr: "Les proverbes camerounais enseignent par le corps : « L'œil qui voit la route ne t'égarera pas. » La machette est honorée comme la compagne du cultivateur.",
  }),

  // ================= FRANÇAIS — Semaine 1 : Les salutations =================
  plan({
    lesson_id: "fra_class3_home_w1",
    subject: "francais",
    week: 1,
    sub_theme: "Le Salon — Les salutations",
    expected_learning_outcomes: [
      "Saluer, se présenter et présenter quelqu'un",
      "Lire des mots et des phrases",
      "Utiliser le dictionnaire bilingue",
    ],
    teaching_strategies: ["Jeux de rôle", "Dramatisation", "Systématisation"],
    voice_assets: {
      hook: {
        character: "ngo",
        text: "Bonjour ! Je suis Ngo. Sais-tu saluer en français ? Essayons ensemble !",
        textFr: "Bonjour ! Je suis Ngo. Sais-tu saluer en français ? Essayons ensemble !",
        languages: ["fr", "en", "ewo"],
      },
      instruction: { text: "Écoute, puis répète après moi avec une belle voix.", textFr: "Écoute, puis répète après moi avec une belle voix." },
      learn_content: {
        title: "Saluer au salon",
        titleFr: "Saluer au salon",
        lines: [
          "Le matin, on dit : « Bonjour ! » — Entre amis : « Salut ! »",
          "Le soir, on dit : « Bonsoir ! »",
          "Pour se présenter : « Je m'appelle Ngo. Et toi ? »",
          "Présenter quelqu'un : « Voici mon frère Kong. »",
          "Le groupe nominal : « le canapé », « la télévision », « un fauteuil ».",
        ],
        linesFr: [
          "Le matin, on dit : « Bonjour ! » — Entre amis : « Salut ! »",
          "Le soir, on dit : « Bonsoir ! »",
          "Pour se présenter : « Je m'appelle Ngo. Et toi ? »",
          "Présenter quelqu'un : « Voici mon frère Kong. »",
          "Le groupe nominal : « le canapé », « la télévision », « un fauteuil ».",
        ],
        visual: "salon-francais",
      },
      practice_prompts: [
        { prompt: "Dis : Bonjour !", target: "bonjour", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Dis : Salut, ça va ?", target: "salut ca va", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Comment dis-tu bonsoir ?", target: "bonsoir", evaluation: "comprehension", kind: "answer" },
        { prompt: "Présente-toi : Je m'appelle ...", target: "je m'appelle", evaluation: "fluency", kind: "open" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "ngo",
        text: "Bravo ! Tu es une Étoile Francophone ! Continues comme ça !",
        textFr: "Bravo ! Tu es une Étoile Francophone ! Continues comme ça !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Conversation en français avec Ngo dans le salon : se saluer et se présenter",
      descriptionFr: "Conversation en français avec Ngo : saluer et se présenter",
      character: "ngo",
      opener: "Bonjour ! Comment tu t'appelles ? Moi, c'est Ngo !",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 50,
      badge_name: "Francophone Star",
      badge_code: "francophone-star",
      voice_challenge: { description: "Enregistre-toi en train de saluer et de te présenter en 3 phrases", descriptionFr: "Enregistre-toi en train de saluer et de te présenter en 3 phrases", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Ngo arrive au salon et demande : sais-tu saluer en français ?", descriptionFr: "Ngo demande : sais-tu saluer en français ?" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Salutations du matin et du soir, se présenter, groupe nominal", descriptionFr: "Salutations, présentation, groupe nominal" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Répétition avec évaluation ASR de la prononciation française", descriptionFr: "Répétition avec évaluation ASR" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Jeu de rôle STS : saluer et présenter son frère à Ngo", descriptionFr: "Jeu de rôle STS avec Ngo" },
      { phase: "Celebrate", duration: "1 min", description: "Badge Étoile Francophone + jingle makossa", descriptionFr: "Badge Étoile Francophone + jingle makossa" },
    ],
    assessment: { criteria: ["Prononciation claire", "Formule adaptée au moment de la journée", "Audibilité"], methods: ["Score ASR", "Grille d'observation"] },
    differentiation: ["Les apprenants timides commencent par chuchoter au micro", "Paires avancées : dialoguer avec le dictionnaire bilingue"],
    cultural_notes: "Au Cameroun bilingue, saluer en français ouvre la porte du voisin francophone. On serre la main ou on applaudit les poings entre amis : « Bonjour ! Ça va ? »",
    cultural_notesFr: "Au Cameroun bilingue, saluer en français ouvre la porte du voisin francophone.",
  }),

  // ================= SOCIAL STUDIES — Week 1: National emblems + greetings =================
  plan({
    lesson_id: "soc_class3_home_w1",
    subject: "social-studies",
    week: 1,
    sub_theme: "Our Flag, Our Greetings",
    ib_learner_profile: ["Principled", "Open-minded"],
    expected_learning_outcomes: [
      "Define and name the various types of history",
      "Define and state reasons for studying geography",
      "Define and explain the importance of the four National emblems",
      "Practice simple etiquettes (how to greet)",
    ],
    teaching_strategies: ["Storytelling", "Discussion", "Recitation"],
    voice_assets: {
      hook: {
        character: "kwe",
        text: "Do you know why the flag has green, red and yellow? Come, let me tell you a story of our country!",
        textFr: "Sais-tu pourquoi le drapeau a du vert, du rouge et du jaune ? Viens, je te raconte l'histoire de notre pays !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Listen to the story, then answer with your clear voice.", textFr: "Écoute l'histoire, puis réponds avec ta voix claire." },
      learn_content: {
        title: "The National emblems",
        titleFr: "Les emblèmes nationaux",
        lines: [
          "The GREEN band remembers the forests of the South and East.",
          "The RED star stands for unity — one star, ten regions, one Cameroon.",
          "The YELLOW is the sun of the North and the savannas.",
          "Our motto: Peace — Work — Fatherland. (Paix — Travail — Patrie)",
          "History is the story of our past; geography is the study of our land. Both live in our home village!",
        ],
        linesFr: [
          "La bande VERTE rappelle les forêts du Sud et de l'Est.",
          "L'étoile ROUGE symbolise l'unité — une étoile, dix régions, un Cameroun.",
          "Le JAUNE est le soleil du Nord et des savanes.",
          "Notre devise : Paix — Travail — Patrie.",
          "L'histoire est le récit de notre passé ; la géographie étudie notre terre.",
        ],
        visual: "cameroon-flag",
      },
      practice_prompts: [
        { prompt: "Say the motto: Peace, Work, Fatherland!", target: "peace work fatherland", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "What colour is the star on the flag? Say it!", target: "red", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: I love my country Cameroon.", target: "i love my country cameroon", evaluation: "fluency", kind: "repeat" },
        { prompt: "How many regions are in Cameroon? Say the number!", target: "ten", evaluation: "comprehension", kind: "answer" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "kwe",
        text: "You are a true Young Patriot! Stand tall like the flag!",
        textFr: "Tu es un vrai Jeune Patriote ! Dresse-toi comme le drapeau !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kwe asks civic questions; learner recites motto and anthem lines",
      descriptionFr: "Kwe pose des questions civiques ; l'apprenant récite la devise",
      character: "kwe",
      opener: "Tell me, young patriot: what is the motto of Cameroon?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 55,
      badge_name: "Young Patriot",
      badge_code: "patriot",
      voice_challenge: { description: "Recite the motto and greet like at the flag ceremony", descriptionFr: "Récite la devise et salue comme à la cérémonie du drapeau", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kwe tells the story of the flag colours", descriptionFr: "Kwe raconte l'histoire des couleurs du drapeau" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "The three emblems, motto, history and geography definitions", descriptionFr: "Les trois emblèmes, la devise, histoire et géographie" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Recite motto; answer civic questions by voice", descriptionFr: "Réciter la devise ; répondre aux questions par la voix" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Flag ceremony role-play with Kwe", descriptionFr: "Jeu de rôle cérémonie du drapeau avec Kwe" },
      { phase: "Celebrate", duration: "1 min", description: "Young Patriot badge + anthem-style celebration", descriptionFr: "Badge Jeune Patriote + célébration" },
    ],
    assessment: { criteria: ["Respectful posture", "Correct recitation", "Audibility"], methods: ["Observation checklist", "ASR accuracy score"] },
    differentiation: ["Learners may recite in pairs for confidence", "Advanced learners add the second verse of the anthem"],
    cultural_notes: "Every Monday morning, Cameroonians raise the flag and sing the anthem. The motto 'Peace — Work — Fatherland' begins every school day.",
    cultural_notesFr: "Chaque lundi matin, on hisse le drapeau et on chante l'hymne. La devise « Paix — Travail — Patrie » ouvre chaque journée d'école.",
  }),

  // ================= NATIONAL LANGUAGES — Week 1: Ewondo greetings =================
  plan({
    lesson_id: "nat_class3_home_w1",
    subject: "national-languages",
    week: 1,
    sub_theme: "Mfam — Greetings in Ewondo",
    ib_learner_profile: ["Open-minded", "Communicators"],
    expected_learning_outcomes: [
      "Greet people in Ewondo at different periods of the day",
      "Distinguish high and low tones in Ewondo words",
      "Name family members in Ewondo",
    ],
    teaching_strategies: ["Native speaker modelling", "Tone practice", "Call and response"],
    voice_assets: {
      hook: {
        character: "kwe",
        text: "Ndoge! Mood ñemed! (Good morning!) Let us greet the way our grandparents do!",
        textFr: "Ndoge ! Mood ñemed ! (Bonjour !) Saluons comme nos grands-parents !",
        languages: ["ewo", "en", "fr"],
      },
      instruction: { text: "Listen to the tone, then repeat exactly — high tone rises, low tone stays.", textFr: "Écoute le ton, puis répète exactement — ton haut monte, ton bas reste." },
      learn_content: {
        title: "Ewondo greetings and family",
        titleFr: "Salutations et famille en ewondo",
        lines: [
          "Mood ñemed! — Good morning! (ntónde = morning)",
          "Mus ma! — Good afternoon!",
          "Ndoge! — Hello / greeting call",
          "Mame — my mother · Mtala — my father · Nyaa — grandmother",
          "Tone matters: ñém (to refuse) vs ñém (to be sweet) — the tone changes the meaning! (GACL marked)",
        ],
        linesFr: [
          "Mood ñemed ! — Bonjour ! (ntónde = matin)",
          "Mus ma ! — Bon après-midi !",
          "Ndoge ! — Salut / appel de salutation",
          "Mame — ma mère · Mtala — mon père · Nyaa — grand-mère",
          "Le ton compte : le ton change le sens ! (orthographe GACL)",
        ],
        visual: "ewondo-family",
      },
      practice_prompts: [
        { prompt: "Say: Mood ñemed!", target: "mood nemed", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Say: Mus ma!", target: "mus ma", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Say: Ndoge!", target: "ndoge", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "How do you say 'my mother' in Ewondo? Say it!", target: "mame", evaluation: "comprehension", kind: "answer" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: {
        character: "kwe",
        text: "Ayeba! (Well done!) You carry our language forward — Culture Keeper!",
        textFr: "Ayeba ! (Bien joué !) Tu fais vivre notre langue — Gardien de la Culture !",
      },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kwe converses in simple Ewondo greetings; learner responds",
      descriptionFr: "Kwe converse en ewondo simple ; l'apprenant répond",
      character: "kwe",
      opener: "Ndoge! Mood ñemed? (Hello! Did you wake well?)",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge", "Choice"],
      xp_points: 60,
      badge_name: "Culture Keeper",
      badge_code: "culture-keeper",
      voice_challenge: { description: "Record all three Ewondo greetings in one clip", descriptionFr: "Enregistre les trois salutations ewondo en une fois", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kwe opens with a real Ewondo greeting call", descriptionFr: "Kwe ouvre avec une vraie salutation ewondo" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Greetings, family words, tone pairs (GACL orthography)", descriptionFr: "Salutations, mots de la famille, paires tonales (GACL)" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Repeat with tone awareness; ASR compares", descriptionFr: "Répéter avec attention aux tons ; comparaison ASR" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Greet Kwe in Ewondo, choose morning or afternoon", descriptionFr: "Salue Kwe en ewondo, matin ou après-midi" },
      { phase: "Celebrate", duration: "1 min", description: "Culture Keeper badge + mvet string celebration", descriptionFr: "Badge Gardien de la Culture + célébration mvet" },
    ],
    assessment: { criteria: ["Tone accuracy", "Pronunciation", "Willingness to speak a national language"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Tone visualised as rising/falling arrows for hearing support", "Learners from other regions may share greetings in their own national language"],
    cultural_notes: "Ewondo is spoken in the Centre, South and East regions. Tone is phonemically contrastive in Ewondo — a high tone and a low tone can make two different words, exactly as marked in the General Alphabet of Cameroonian Languages (GACL).",
    cultural_notesFr: "L'ewondo se parle au Centre, au Sud et à l'Est. Le ton y est distinctif — un ton haut et un ton bas peuvent faire deux mots différents, comme marqué dans l'Alphabet Général des Langues Camerounaises (AGLC).",
  }),

  // ================= ARTS — Week 1: Painting materials + NW dance =================
  plan({
    lesson_id: "art_class3_home_w1",
    subject: "arts",
    week: 1,
    sub_theme: "Colours and Steps of the North West",
    expected_learning_outcomes: ["Identify painting materials", "Reproduce dance steps from the North West Region"],
    teaching_strategies: ["Demonstration", "Imitation", "Practice"],
    voice_assets: {
      hook: {
        character: "mbi",
        text: "Ngo's mother paints calabashes! Can you name what she needs? Then we dance the North West way!",
        textFr: "La mère de Ngo peint des calebasses ! Peux-tu nommer ce dont elle a besoin ? Ensuite on danse comme au Nord-Ouest !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Say each material after me, then clap the rhythm.", textFr: "Répète chaque matériel après moi, puis tape le rythme." },
      learn_content: {
        title: "Painting materials and Bamenda dance",
        titleFr: "Matériaux de peinture et danse de Bamenda",
        lines: [
          "Painting materials: brush, colour (dye), water pot, calabash, sponge.",
          "In the North West, dancers step to the sound of the gong and flute.",
          "The basic step: stamp right, stamp left, lift the shoulders, turn!",
          "Colours from nature: red clay, black soot, white kaolin.",
        ],
        linesFr: [
          "Matériaux : pinceau, couleur (teinture), calebasse, éponge.",
          "Au Nord-Ouest, les danseurs marchent au son du gong et de la flûte.",
          "Le pas de base : pied droit, pied gauche, épaules, tourne !",
          "Couleurs naturelles : argile rouge, suie noire, kaolin blanc.",
        ],
        visual: "calabash-painting",
      },
      practice_prompts: [
        { prompt: "Say: brush!", target: "brush", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Say: calabash!", target: "calabash", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "What do we use to put colour on the calabash? Say it!", target: "brush", evaluation: "comprehension", kind: "answer" },
        { prompt: "Clap and count the beat: one, two, three, four!", target: "1 2 3 4", evaluation: "fluency", kind: "count" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: { character: "mbi", text: "What rhythm! Rising Artist badge for the dancer in you!", textFr: "Quel rythme ! Badge Artiste Montant pour toi !" },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Mbi calls a colour or tool; learner names it and claps the beat",
      descriptionFr: "Mbi annonce une couleur ou un outil ; l'apprenant nomme et tape le rythme",
      character: "mbi",
      opener: "I dip the brush in red clay! What am I holding?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Choice"],
      xp_points: 45,
      badge_name: "Rising Artist",
      badge_code: "artist",
      voice_challenge: { description: "Record the beat: count 1-8 like a dance leader", descriptionFr: "Enregistre le rythme : compte 1-8 comme un chef de danse", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Mbi shows the painted calabashes", descriptionFr: "Mbi montre les calebasses peintes" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Materials + North West dance culture with audio", descriptionFr: "Matériaux + culture de danse du Nord-Ouest" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Name materials by voice; clap rhythm", descriptionFr: "Nommer les matériaux ; taper le rythme" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Dance-break game: follow Mbi's spoken steps", descriptionFr: "Jeu de danse : suivre les étapes dictées par Mbi" },
      { phase: "Celebrate", duration: "1 min", description: "Rising Artist badge + gong celebration", descriptionFr: "Badge Artiste Montant + gong" },
    ],
    assessment: { criteria: ["Correct material names", "Rhythm accuracy", "Enthusiasm"], methods: ["Observation checklist", "ASR accuracy score"] },
    differentiation: ["Seated learners do the shoulder and arm movements", "Learners may draw their favourite material after the lesson"],
    cultural_notes: "The North West grassfields dance with gongs and flutes; Bamileke patterns inspired the colours of this very app!",
    cultural_notesFr: "Dans les grassfields du Nord-Ouest, on danse avec gongs et flûtes ; les motifs bamileke ont inspiré les couleurs de cette application !",
  }),

  // ================= P.E — Week 1: Relays, sprints, balancing =================
  plan({
    lesson_id: "pe_class3_home_w1",
    subject: "pe",
    week: 1,
    sub_theme: "The Compound Relay",
    expected_learning_outcomes: ["Define relays and types of relays", "Define sprints and types of sprints", "Definition of balancing and types of balancing"],
    teaching_strategies: ["Demonstration", "Practice", "Observation"],
    voice_assets: {
      hook: {
        character: "kong",
        text: "On your marks, get set... GO! Today we run like the athletes of the Mount Cameroon race!",
        textFr: "À vos marques, prêts... PARTEZ ! Aujourd'hui nous courons comme les athlètes de la course du Mont Cameroun !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Listen to the definition, then say it back while you march!", textFr: "Écoute la définition, puis répète-la en marchant !" },
      learn_content: {
        title: "Relay, sprint, balance",
        titleFr: "Relais, sprint, équilibre",
        lines: [
          "A RELAY: a team race where runners pass the baton one after another.",
          "A SPRINT: running very fast over a short distance, like 50 metres.",
          "BALANCING: keeping your body steady — on one foot like a heron!",
          "Safety first: look where you run, warm up your legs, drink water.",
        ],
        linesFr: [
          "Le RELAIS : course d'équipe où l'on passe le témoin à tour de rôle.",
          "Le SPRINT : courir très vite sur une courte distance, comme 50 mètres.",
          "L'ÉQUILIBRE : garder son corps stable — sur un pied comme un héron !",
          "Sécurité : regarder où l'on court, s'échauffer, boire de l'eau.",
        ],
        visual: "relay-track",
      },
      practice_prompts: [
        { prompt: "Say: On your marks, get set, go!", target: "on your marks get set go", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "What race passes a baton? Say it!", target: "relay", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: I run fast, I balance well!", target: "i run fast i balance well", evaluation: "fluency", kind: "repeat" },
        { prompt: "March on the spot and count 1 to 8 like a coach!", target: "1 2 3 4 5 6 7 8", evaluation: "fluency", kind: "count" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: { character: "kong", text: "Gold-medal voice! Little Athlete badge is yours!", textFr: "Voix médaillée d'or ! Le badge Petit Athlète est à toi !" },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kong coaches the learner through a spoken warm-up drill",
      descriptionFr: "Kong dirige un échauffement parlé",
      character: "kong",
      opener: "Coach Kong here! Give me 4 marching steps — count them out loud!",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Challenge"],
      xp_points: 45,
      badge_name: "Little Athlete",
      badge_code: "athlete",
      voice_challenge: { description: "Count your marching steps 1-8 in one strong voice", descriptionFr: "Compte tes pas 1-8 d'une voix forte", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kong starts the compound relay", descriptionFr: "Kong lance le relais de la concession" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Definitions with pictures of relays, sprints, balancing", descriptionFr: "Définitions avec images" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Say definitions while marching; ASR listens", descriptionFr: "Répéter en marchant ; l'ASR écoute" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Coach game: learner becomes the coach and counts", descriptionFr: "Jeu de coach : l'apprenant compte les mouvements" },
      { phase: "Celebrate", duration: "1 min", description: "Little Athlete badge + drum fanfare", descriptionFr: "Badge Petit Athlète + fanfare" },
    ],
    assessment: { criteria: ["Correct definitions", "Loud and clear voice", "Movement participation"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Movements adapted for wheelchair users: arm sprints and clapping relays", "Slower tempo counting for learners who need time"],
    cultural_notes: "The Mount Cameroon Race of Hope is Africa's toughest mountain race — 4,095 metres of running up an active volcano!",
    cultural_notesFr: "La Course de l'Espoir du Mont Cameroun est la course de montagne la plus dure d'Afrique — 4 095 mètres sur un volcan actif !",
  }),

  // ================= ICT — Week 1: Components of a computer =================
  plan({
    lesson_id: "ict_class3_home_w1",
    subject: "ict",
    week: 1,
    sub_theme: "The Talking Computer",
    expected_learning_outcomes: ["Describe the role of each component and explain its importance"],
    teaching_strategies: ["Demonstration", "Voice commands", "Questions and answers"],
    voice_assets: {
      hook: {
        character: "kwe",
        text: "You are talking to me through a computer right now! Can you name its parts?",
        textFr: "Tu me parles à travers un ordinateur ! Peux-tu nommer ses parties ?",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Look at the picture, then say the name of each part.", textFr: "Regarde l'image, puis dis le nom de chaque partie." },
      learn_content: {
        title: "Keyboard, mouse and friends",
        titleFr: "Clavier, souris et compagnie",
        lines: [
          "KEYBOARD: we type letters and numbers — like speaking with our fingers!",
          "MOUSE: we point and click — it is the computer's little pointer.",
          "CPU: the brain of the computer (Central Processing Unit).",
          "MONITOR: the screen that shows us the work.",
          "Voice commands are a kind way to use technology — politely, like greeting a friend.",
        ],
        linesFr: [
          "CLAVIER : taper lettres et chiffres — parler avec les doigts !",
          "SOURIS : pointer et cliquer — la flèche de l'ordinateur.",
          "CPU : le cerveau de l'ordinateur (unité centrale).",
          "MONITEUR : l'écran qui montre le travail.",
          "Les commandes vocales sont une façon polie d'utiliser la technologie.",
        ],
        visual: "computer-parts",
      },
      practice_prompts: [
        { prompt: "Say: keyboard!", target: "keyboard", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Say: mouse!", target: "mouse", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Which part is the brain of the computer? Say it!", target: "cpu", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: I use technology politely.", target: "i use technology politely", evaluation: "fluency", kind: "repeat" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: { character: "kwe", text: "Digital Explorer badge unlocked! You and computers will be good friends!", textFr: "Badge Explorateur Numérique débloqué ! Toi et l'ordinateur serez bons amis !" },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kwe gives a clue about a computer part; learner names it",
      descriptionFr: "Kwe donne un indice sur une partie de l'ordinateur ; l'apprenant la nomme",
      character: "kwe",
      opener: "I click with this little helper that has a tail. What is it?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 45,
      badge_name: "Digital Explorer",
      badge_code: "digital-explorer",
      voice_challenge: { description: "Name 3 computer parts in 15 seconds", descriptionFr: "Nomme 3 parties de l'ordinateur en 15 secondes", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kwe reveals that the learner is using a computer now", descriptionFr: "Kwe révèle que l'apprenant utilise un ordinateur" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Components with pictures and spoken roles", descriptionFr: "Composantes avec images et rôles parlés" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Say part names; ASR verifies", descriptionFr: "Dire les noms ; l'ASR vérifie" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Voice-command practice: polite voice requests", descriptionFr: "Commandes vocales polies" },
      { phase: "Celebrate", duration: "1 min", description: "Digital Explorer badge + digital balafon", descriptionFr: "Badge Explorateur Numérique + balafon numérique" },
    ],
    assessment: { criteria: ["Correct part names", "Role explanation", "Responsible use attitude"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Real keyboard/mouse to touch while naming", "Voice commands as alternative for learners with motor challenges"],
    cultural_notes: "Voice-first technology honours oral tradition — Cameroon's griots passed history by voice for centuries, and now learners speak to their own AI elder, Kwe.",
    cultural_notesFr: "La technologie vocale honore la tradition orale — les griots ont transmis l'histoire par la voix pendant des siècles.",
  }),

  // ================= ENGLISH — Week 3: Traditional songs + nouns review =================
  plan({
    lesson_id: "eng_class3_home_w3",
    subject: "english",
    week: 3,
    sub_theme: "The Bedroom — Traditional Songs",
    expected_learning_outcomes: [
      "Sing songs using correct tones and melody",
      "Show love for reading",
      "Write sentences with apostrophe s' correctly",
      "Identify and use nouns in simple sentences",
    ],
    voice_assets: {
      hook: {
        character: "ngo",
        text: "Grandmother sings while we fold the mats! This song is from her grandmother too. Sing it with me!",
        textFr: "Grand-mère chante en pliant les nattes ! Cette chanson vient de sa grand-mère aussi. Chante avec moi !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Listen to grandma's song, then sing it back.", textFr: "Écoute la chanson de grand-mère, puis chante-la." },
      learn_content: {
        title: "Songs and possessive apostrophes",
        titleFr: "Chansons et apostrophes de possession",
        lines: [
          "Traditional song: 'Ole ole, we wash our clothes and play!'",
          "Apostrophe s' shows who owns what: 'Mama's pot' = the pot of mama.",
          "Plural owners put the apostrophe after the s: 'my friends' books'.",
          "Nouns in the bedroom: mat, blanket, pillow, mosquito net.",
          "Read: 'Ngo's blanket is red. Kong's mat is green.'",
        ],
        linesFr: [
          "Chanson traditionnelle : « Ole ole, on lave nos habits ! »",
          "L'apostrophe s' montre la possession : « Mama's pot » = la marmite de mama.",
          "Pour plusieurs possesseurs : « my friends' books ».",
          "Les noms dans la chambre : natte, couverture, oreiller, moustiquaire.",
        ],
        visual: "bedroom-scene",
      },
      practice_prompts: [
        { prompt: "Sing: Ole ole, we wash our clothes!", target: "ole ole we wash our clothes", evaluation: "fluency", kind: "repeat" },
        { prompt: "Say: Mama's pot is hot!", target: "mama's pot is hot", evaluation: "pronunciation_accuracy", kind: "repeat" },
        { prompt: "Whose blanket is red? Answer: It is ...", target: "ngo's", evaluation: "comprehension", kind: "answer" },
        { prompt: "Say: This is my friend's book.", target: "this is my friend's book", evaluation: "pronunciation_accuracy", kind: "repeat" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: { character: "ngo", text: "Grandmother would be proud! Storyteller badge for you!", textFr: "Grand-mère serait fière ! Badge Conteur pour toi !" },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Learner and Ngo sing call-and-response, then quiz each other on possessives",
      descriptionFr: "L'apprenant et Ngo chantent en appel-réponse puis se quizent sur la possession",
      character: "ngo",
      opener: "I sing a line, you sing the next! Ready? Ole, ole...",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 50,
      badge_name: "Storyteller",
      badge_code: "storyteller",
      voice_challenge: { description: "Sing one verse and say two possessive sentences", descriptionFr: "Chante un couplet et dis deux phrases de possession", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Ngo shares grandmother's bedtime song", descriptionFr: "Ngo partage la chanson de grand-mère" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Song + apostrophe rules with bedroom nouns", descriptionFr: "Chanson + règles des apostrophes" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Sing and speak possessives; ASR checks", descriptionFr: "Chanter et parler ; vérification ASR" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Call-and-response duet with Ngo", descriptionFr: "Duo en appel-réponse avec Ngo" },
      { phase: "Celebrate", duration: "1 min", description: "Storyteller badge + soft kalimba ending", descriptionFr: "Badge Conteur + kalimba douce" },
    ],
    assessment: { criteria: ["Melody and tones", "Correct apostrophe use", "Audibility"], methods: ["ASR accuracy score", "Voice portfolio"] },
    differentiation: ["Song lyrics displayed with highlight-tracking", "Learners write their own possessive sentence in the Project Book"],
    cultural_notes: "Bedtime songs (lullabies) carry the wisdom of grandmothers in every region — from the Coast to the Grassfields.",
    cultural_notesFr: "Les berceuses portent la sagesse des grands-mères dans toutes les régions — de la Côte aux Grassfields.",
  }),

  // ================= MATH — Week 2: Sets, elements, months =================
  plan({
    lesson_id: "mat_class3_home_w2",
    subject: "mathematics",
    week: 2,
    sub_theme: "Sets on the Family Shelf",
    ib_learner_profile: ["Thinkers", "Balanced"],
    expected_learning_outcomes: [
      "Write numbers up to 100",
      "Arrange belongings in an orderly manner",
      "Name months of the year and describe the 13 lunar months",
      "Construct 4 dimensional shapes using natural and recycled materials",
      "Present data on graph",
    ],
    voice_assets: {
      hook: {
        character: "kwe",
        text: "Time to arrange the shelf! Cups with cups, spoons with spoons — that is a SET!",
        textFr: "Rangons l'étagère ! Les tasses avec les tasses, les cuillères avec les cuillères — voilà un ENSEMBLE !",
        languages: ["en", "fr", "ewo"],
      },
      instruction: { text: "Answer Kwe's questions with a loud, clear voice.", textFr: "Réponds aux questions de Kwe d'une voix forte et claire." },
      learn_content: {
        title: "Sets, elements and months",
        titleFr: "Ensembles, éléments et mois",
        lines: [
          "A SET groups things that belong together: {cup, cup, cup}.",
          "∈ means 'is an element of': the spoon ∈ the kitchen set.",
          "∉ means 'is NOT an element of': the goat ∉ the cup set!",
          "Months of the year: January to December — twelve months.",
          "The 13 lunar months: some traditional calendars count the moon 13 times!",
        ],
        linesFr: [
          "Un ENSEMBLE regroupe ce qui va ensemble : {tasse, tasse, tasse}.",
          "∈ signifie 'est un élément de' : la cuillère ∈ l'ensemble cuisine.",
          "∉ signifie 'n'est pas un élément de' : la chèvre ∉ l'ensemble tasses !",
          "Les mois de l'année : janvier à décembre — douze mois.",
          "Les 13 mois lunaires : certains calendriers traditionnels comptent la lune 13 fois !",
        ],
        visual: "shelf-sets",
      },
      practice_prompts: [
        { prompt: "Say: the cup is an element of the set!", target: "the cup is an element of the set", evaluation: "fluency", kind: "repeat" },
        { prompt: "Name a month that comes after June. Say it!", target: "july", evaluation: "comprehension", kind: "answer" },
        { prompt: "How many months in the lunar calendar? Say the number!", target: "13", evaluation: "comprehension", kind: "answer" },
        { prompt: "Count: 11, 12, 13, 14, 15!", target: "11 12 13 14 15", evaluation: "fluency", kind: "count" },
      ],
      feedback: FEEDBACK_DEFAULT,
      celebration: { character: "kwe", text: "Shape Master and Math Wizard energy! Beautifully arranged!", textFr: "Esprit Sorcier des Maths ! Magnifiquement rangé !" },
      background_music: "village_morning_loop.wav",
    },
    sts_scenario: {
      description: "Kwe names objects; learner says ∈ or ∉ aloud ('in' or 'not in')",
      descriptionFr: "Kwe nomme des objets ; l'apprenant répond 'in' ou 'not in'",
      character: "kwe",
      opener: "The pot... is it in the set of kitchen tools, or not in?",
    },
    gamification: {
      mechanics: ["Points", "Badge", "Voice Challenge"],
      xp_points: 55,
      badge_name: "Math Wizard",
      badge_code: "math-wizard",
      voice_challenge: { description: "Say 4 objects that belong in the kitchen set", descriptionFr: "Dis 4 objets de l'ensemble cuisine", evaluation: "asr_completion" },
    },
    activities: [
      { phase: "Voice Hook", duration: "1 min", description: "Kwe needs the family shelf arranged into sets", descriptionFr: "Kwe veut ranger l'étagère en ensembles" },
      { phase: "Listen & Learn", duration: "2-3 min", description: "Set symbols, elements, months and lunar calendar", descriptionFr: "Symboles d'ensembles, éléments, mois" },
      { phase: "Speak & Practice", duration: "2-3 min", description: "Voice answers: in/not-in game with ASR", descriptionFr: "Réponses vocales : jeu in/not-in avec ASR" },
      { phase: "Apply & Create", duration: "2-3 min", description: "Build a shape from recycled materials and describe it aloud", descriptionFr: "Construire une forme et la décrire à voix haute" },
      { phase: "Celebrate", duration: "1 min", description: "Math Wizard badge + ascending balafon run", descriptionFr: "Badge Sorcier des Maths + montée de balafon" },
    ],
    assessment: { criteria: ["Correct use of set language", "Logical grouping", "Audibility"], methods: ["ASR accuracy score", "Observation checklist"] },
    differentiation: ["Physical counters to touch while grouping", "Advanced learners compare equal vs equivalent sets"],
    cultural_notes: "Traditional calendars in Cameroon follow the moon — some communities count thirteen moons in a year, connecting math to cultural identity.",
    cultural_notesFr: "Les calendriers traditionnels au Cameroun suivent la lune — certaines communautés comptent treize lunes par an.",
  }),
];
