// ============================================================================
// DIY PRACTICAL LEARNING — OMNIVOICE v4.0 (Master Prompt v4.0 §III)
// §3.1 Philosophy: every lesson carries a hands-on "DIY Practical" built from
// locally available materials — digital lessons are reinforced by physical
// making. §3.2 framework, §3.3 lesson template (flagship verbatim), §3.4
// per-ILT content library, §3.5 component contract (DIYLessonCard).
// Each DIY lesson gamification: +30 XP, a craft badge, photo challenge.
// ============================================================================

// ---------------------------------------------------------------------------
// §3.2 DIY Learning Framework — lesson type → DIY component → materials → time
// ---------------------------------------------------------------------------
export const DIY_FRAMEWORK: Array<{ lessonType: string; diyComponent: string; materials: string; duration: string }> = [
  { lessonType: "Language", diyComponent: "Role-play scripts, puppet making", materials: "Paper, sticks, markers", duration: "15-20 min" },
  { lessonType: "Mathematics", diyComponent: "Counting aids, shape models", materials: "Bottle caps, sticks, clay", duration: "15-20 min" },
  { lessonType: "Science", diyComponent: "Simple experiments, nature journals", materials: "Local plants, water, containers", duration: "20-30 min" },
  { lessonType: "Social Studies", diyComponent: "Map making, cultural artifacts", materials: "Paper, clay, natural dyes", duration: "20-30 min" },
  { lessonType: "Vocational", diyComponent: "Tool making, planting, crafts", materials: "Local materials", duration: "30-45 min" },
  { lessonType: "Arts", diyComponent: "Drawing, painting, music", materials: "Natural pigments, instruments", duration: "20-30 min" },
  { lessonType: "PES", diyComponent: "Traditional games, obstacle courses", materials: "Found objects", duration: "20-30 min" },
  { lessonType: "ICT", diyComponent: "Unplugged coding, logic games", materials: "Cards, stones, string", duration: "15-20 min" },
];

// ---------------------------------------------------------------------------
// §3.5 component contract — DIYLessonCard interfaces (spec verbatim shape)
// ---------------------------------------------------------------------------
export interface DIYStep {
  step: number;
  instruction: string;
  instructionFr: string;
  voice_guide: string;
  voice_guideFr: string;
  duration: string;
}

export interface DIYDialogue {
  child?: string;
  childFr?: string;
  adult?: string;
  adultFr?: string;
}

export interface DIYLesson {
  id: string; // diy lesson_id (e.g. eng_class3_home_w1_diy)
  title: string;
  titleFr: string;
  linkedLessonId: string;
  learning_objective: string;
  learning_objectiveFr: string;
  materials: {
    required: string[];
    requiredFr: string[];
    optional: string[];
    optionalFr: string[];
  };
  steps: DIYStep[];
  dialogue_script?: Record<string, DIYDialogue>;
  assessment: { criteria: string[]; criteriaFr: string[]; method: string };
  extension: string;
  extensionFr: string;
  gamification: {
    xp_points: number; // 30 per §3.3
    badge_name: string;
    badge_code: string;
    photo_challenge: string;
    photo_challengeFr: string;
  };
}

// ---------------------------------------------------------------------------
// §3.3 DIY Lesson Template — flagship carried VERBATIM from the spec
// ("Greeting Puppet Theater", linked to eng_class3_home_w1), bilingualized
// for the EN/FR platform; all other lessons follow the same template.
// ---------------------------------------------------------------------------
function step(n: number, instruction: string, instructionFr: string, voice_guide: string, voice_guideFr: string, duration: string): DIYStep {
  return { step: n, instruction, instructionFr, voice_guide, voice_guideFr, duration };
}

export const DIY_LESSONS: DIYLesson[] = [
  {
    // §3.3 verbatim flagship DIY lesson
    id: "eng_class3_home_w1_diy",
    title: "Greeting Puppet Theater",
    titleFr: "Théâtre de Marionnettes des Salutations",
    linkedLessonId: "eng_class3_home_w1",
    learning_objective: "Practice greetings at different times of day through role-play",
    learning_objectiveFr: "Pratiquer les salutations de la journée par le jeu de rôle",
    materials: {
      required: ["Paper or cardboard", "Sticks or pencils", "Markers or crayons", "Scissors (with adult supervision)"],
      requiredFr: ["Papier ou carton", "Bâtons ou crayons", "Feutres ou crayons de couleur", "Ciseaux (avec un adulte)"],
      optional: ["Fabric scraps", "Googly eyes", "Yarn for hair"],
      optionalFr: ["Chutes de tissu", "Yeux mobiles", "Laine pour les cheveux"],
    },
    steps: [
      step(1, "Draw two characters on paper: one adult, one child",
        "Dessine deux personnages sur le papier : un adulte, un enfant",
        "Let's draw our puppet friends! Draw a big person and a small person.",
        "Dessinons nos marionnettes ! Dessine une grande personne et une petite personne.",
        "5 min"),
      step(2, "Color and cut out your characters",
        "Colorie et découpe tes personnages",
        "Now add colors! Make them bright and beautiful.",
        "Maintenant, ajoute des couleurs ! Rends-les brillants et beaux.",
        "5 min"),
      step(3, "Tape or glue sticks to the back of each character",
        "Colle un bâton au dos de chaque personnage",
        "Attach the sticks so you can hold your puppets.",
        "Attache les bâtons pour pouvoir tenir tes marionnettes.",
        "3 min"),
      step(4, "Practice the greeting dialogue with your puppets",
        "Pratique le dialogue de salutations avec tes marionnettes",
        "Now let's play! Say 'Good morning!' with your puppet.",
        "Maintenant, jouons ! Dis « Good morning ! » avec ta marionnette.",
        "7 min"),
    ],
    dialogue_script: {
      morning: { child: "Good morning, Mama!", childFr: "Bonjour, Maman ! (Good morning, Mama!)", adult: "Good morning, my dear!", adultFr: "Good morning, my dear !" },
      afternoon: { child: "Good afternoon, Papa!", childFr: "Bon après-midi, Papa ! (Good afternoon, Papa!)", adult: "Good afternoon, my child!", adultFr: "Good afternoon, my child !" },
      night: { child: "Good night, Mama!", childFr: "Bonne nuit, Maman ! (Good night, Mama!)", adult: "Good night, sleep well!", adultFr: "Good night, sleep well !" },
    },
    assessment: {
      criteria: ["Correct greeting for time of day", "Clear pronunciation", "Engagement in role-play"],
      criteriaFr: ["Salutation correcte pour le moment de la journée", "Prononciation claire", "Participation au jeu de rôle"],
      method: "Parent/teacher observation",
    },
    extension: "Perform the puppet show for family members",
    extensionFr: "Joue le spectacle de marionnettes pour ta famille",
    gamification: {
      xp_points: 30,
      badge_name: "Puppet Master",
      badge_code: "puppet-master",
      photo_challenge: "Take a photo of your puppet show!",
      photo_challengeFr: "Prends une photo de ton spectacle de marionnettes !",
    },
  },

  {
    // eng_w2 — Nouns around the house (§3.4 The Home/English: Family portrait with labels)
    id: "eng_class3_home_w2_diy",
    title: "Family Portrait with Noun Labels",
    titleFr: "Portrait de Famille avec Étiquettes de Noms",
    linkedLessonId: "eng_class3_home_w2",
    learning_objective: "Label a family portrait using common, proper and concrete nouns",
    learning_objectiveFr: "Étiqueter un portrait de famille avec des noms communs, propres et concrets",
    materials: {
      required: ["Paper", "Crayons or markers", "Small pieces of paper for labels"],
      requiredFr: ["Papier", "Crayons de couleur ou feutres", "Petits papiers pour les étiquettes"],
      optional: ["Family photos", "Glue"],
      optionalFr: ["Photos de famille", "Colle"],
    },
    steps: [
      step(1, "Draw your family doing one activity at home",
        "Dessine ta famille en train de faire une activité à la maison",
        "Draw the people who live in your home — one big picture!",
        "Dessine les gens qui vivent avec toi — une grande image !",
        "6 min"),
      step(2, "Write a noun label for each person and object",
        "Écris une étiquette-nom pour chaque personne et objet",
        "Name them! 'Mama' is a common noun. 'Ngo' is a proper noun — capital letter!",
        "Nomme-les ! « Mama » est un nom commun. « Ngo » est un nom propre — majuscule !",
        "6 min"),
      step(3, "Circle the concrete nouns — things you can touch",
        "Entoure les noms concrets — les choses qu'on peut toucher",
        "Touch your drawing: pot, mat, radio. Those are concrete nouns!",
        "Touche ton dessin : marmite, natte, radio. Ce sont des noms concrets !",
        "4 min"),
      step(4, "Sing the sitting-room song while pointing at your labels",
        "Chante la chanson du salon en montrant tes étiquettes",
        "Clap, clap, clap your hands — and sing each label out loud!",
        "Tape, tape, tape des mains — et chante chaque étiquette !",
        "4 min"),
    ],
    dialogue_script: {
      label_game: { child: "This is my radio. Radio is a concrete noun!", childFr: "Ceci est ma radio. Radio est un nom concret !", adult: "Yes! And is 'Douala' a common or proper noun?", adultFr: "Oui ! Et « Douala » est un nom commun ou propre ?" },
    },
    assessment: {
      criteria: ["Correct noun type on each label", "Capital letters on proper nouns", "Clear labeling"],
      criteriaFr: ["Type de nom correct sur chaque étiquette", "Majuscules aux noms propres", "Étiquetage clair"],
      method: "Parent/teacher observation",
    },
    extension: "Add proper nouns of your town and family names to the portrait",
    extensionFr: "Ajoute les noms propres de ta ville et de ta famille au portrait",
    gamification: {
      xp_points: 30,
      badge_name: "Label Legend",
      badge_code: "label-legend",
      photo_challenge: "Photograph your labelled family portrait!",
      photo_challengeFr: "Photographie ton portrait de famille étiqueté !",
    },
  },

  {
    // mat_w1 — Numbers everywhere at home (§3.4 The Home/Mathematics: Kitchen item counting)
    id: "mat_class3_home_w1_diy",
    title: "Kitchen Item Counting",
    titleFr: "Comptage des Ustensiles de Cuisine",
    linkedLessonId: "mat_class3_home_w1",
    learning_objective: "Count household objects 1-20 and write the total",
    learning_objectiveFr: "Compter les objets de la maison de 1 à 20 et écrire le total",
    materials: {
      required: ["Pots, spoons and cups from the kitchen", "Paper and pencil"],
      requiredFr: ["Marmites, cuillères et tasses de la cuisine", "Papier et crayon"],
      optional: ["Bottle caps as counters", "Small basket"],
      optionalFr: ["Bouchons comme jetons", "Petit panier"],
    },
    steps: [
      step(1, "Collect 20 kitchen items: pots, spoons, cups",
        "Rassemble 20 ustensiles : marmites, cuillères, tasses",
        "Let's go to the kitchen! Collect spoons and cups — count as you pick: 1, 2, 3…",
        "Allons à la cuisine ! Ramasse des cuillères et des tasses — compte : 1, 2, 3…",
        "5 min"),
      step(2, "Line them up and count aloud from 1 to 20",
        "Aligne-les et compte à voix haute de 1 à 20",
        "Point and count out loud! Every number gets one touch.",
        "Montre et compte à voix haute ! Chaque chiffre reçoit un toucher.",
        "5 min"),
      step(3, "Group items into piles of 5 and count each pile",
        "Groupe les objets en tas de 5 et compte chaque tas",
        "Make little families of 5! 5 spoons, 5 caps — counting is easier in groups.",
        "Fais des petites familles de 5 ! 5 cuillères, 5 bouchons — compter en groupes, c'est plus facile.",
        "5 min"),
      step(4, "Write your counts on paper and read them to a grown-up",
        "Écris tes totaux sur le papier et lis-les à un adulte",
        "Write the numbers, then tell me: how many spoons? How many cups?",
        "Écris les chiffres, puis dis-moi : combien de cuillères ? Combien de tasses ?",
        "5 min"),
    ],
    dialogue_script: {
      counting: { child: "One, two, three, four, five spoons!", childFr: "Un, deux, trois, quatre, cinq cuillères !", adult: "Great counting! How many cups do you have?", adultFr: "Bravo ! Combien de tasses as-tu ?" },
    },
    assessment: {
      criteria: ["Counts 1-20 without skipping", "One-to-one matching while counting", "Writes totals correctly"],
      criteriaFr: ["Compte de 1 à 20 sans sauter", "Correspondance un à un en comptant", "Écrit correctement les totaux"],
      method: "Parent/teacher observation",
    },
    extension: "Count the same items in tens and compare the piles",
    extensionFr: "Compte les mêmes objets par dizaines et compare les tas",
    gamification: {
      xp_points: 30,
      badge_name: "Kitchen Counter",
      badge_code: "kitchen-counter",
      photo_challenge: "Photograph your lined-up kitchen count!",
      photo_challengeFr: "Photographie ta ligne d'ustensiles comptés !",
    },
  },

  {
    // sci_w1 — Parts of the body (§3.2 Science: simple experiments with local materials)
    id: "sci_class3_home_w1_diy",
    title: "Bendable Body Machine",
    titleFr: "La Machine du Corps Souple",
    linkedLessonId: "sci_class3_home_w1",
    learning_objective: "Build a jointed model that shows how body parts move like a machine",
    learning_objectiveFr: "Construire un modèle articulé qui montre comment le corps bouge comme une machine",
    materials: {
      required: ["Sticks or rolled paper straws", "String or rubber bands", "Clay or soft dough"],
      requiredFr: ["Bâtons ou pailles en papier roulées", "Ficelle ou élastiques", "Argile ou pâte molle"],
      optional: ["Bottle caps for joints", "Paper and pencil for labels"],
      optionalFr: ["Bouchons pour les articulations", "Papier et crayon pour les étiquettes"],
    },
    steps: [
      step(1, "Lay out two sticks to make an arm: upper arm and lower arm",
        "Pose deux bâtons pour faire un bras : haut et avant-bras",
        "Our body is a machine! These sticks are the bones of the arm.",
        "Notre corps est une machine ! Ces bâtons sont les os du bras.",
        "5 min"),
      step(2, "Tie the sticks together with string — that is the elbow joint",
        "Noue les bâtons avec la ficelle — voilà le coude",
        "Tie them gently. Can they bend? Joints let our body bend!",
        "Noue-les doucement. Ils peuvent plier ? Les articulations font plier le corps !",
        "5 min"),
      step(3, "Add a clay hand with five finger sticks",
        "Ajoute une main en argile avec cinq doigts",
        "Five fingers, one hand — count them while you stick them in!",
        "Cinq doigts, une main — compte-les en les plantant !",
        "5 min"),
      step(4, "Move your real arm beside the model and label the parts",
        "Bouge ton vrai bras à côté du modèle et étiquette les parties",
        "Now move YOUR arm — shoulder, elbow, wrist! Say each part out loud.",
        "Bouge TON bras — épaule, coude, poignet ! Dis chaque partie à voix haute.",
        "5 min"),
    ],
    assessment: {
      criteria: ["Model bends at the joint like a real elbow", "Body parts named aloud correctly", "Careful assembly"],
      criteriaFr: ["Le modèle plie comme un vrai coude", "Les parties du corps sont bien nommées", "Assemblage soigné"],
      method: "Parent/teacher observation",
    },
    extension: "Build a second model leg and compare how joints bend",
    extensionFr: "Construis une jambe en modèle et compare comment les articulations plient",
    gamification: {
      xp_points: 30,
      badge_name: "Body Engineer",
      badge_code: "body-engineer",
      photo_challenge: "Photograph your body machine bending!",
      photo_challengeFr: "Photographie ta machine du corps qui plie !",
    },
  },

  {
    // fra_w1 — Saluer au salon (§3.2 Language: role-play scripts, puppet making)
    id: "fra_class3_home_w1_diy",
    title: "Salon de Salutations — Marionnettes",
    titleFr: "Salon de Salutations — Marionnettes",
    linkedLessonId: "fra_class3_home_w1",
    learning_objective: "Pratiquer les salutations françaises du matin, de l'après-midi et du soir en jeu de rôle",
    learning_objectiveFr: "Pratiquer les salutations françaises du matin, de l'après-midi et du soir en jeu de rôle",
    materials: {
      required: ["Papier ou carton", "Bâtons ou crayons", "Feutres ou crayons de couleur"],
      requiredFr: ["Papier ou carton", "Bâtons ou crayons", "Feutres ou crayons de couleur"],
      optional: ["Chutes de tissu", "Laine pour les cheveux"],
      optionalFr: ["Chutes de tissu", "Laine pour les cheveux"],
    },
    steps: [
      step(1, "Dessine deux personnages : un adulte et un enfant",
        "Dessine deux personnages : un adulte et un enfant",
        "Dessinons nos amis du salon ! Une grande personne et une petite.",
        "Dessinons nos amis du salon ! Une grande personne et une petite.",
        "5 min"),
      step(2, "Colorie et découpe tes personnages",
        "Colorie et découpe tes personnages",
        "De belles couleurs vives, comme les pagnes du marché !",
        "De belles couleurs vives, comme les pagnes du marché !",
        "5 min"),
      step(3, "Colle un bâton au dos de chaque personnage",
        "Colle un bâton au dos de chaque personnage",
        "Attache bien les bâtons pour tenir tes marionnettes.",
        "Attache bien les bâtons pour tenir tes marionnettes.",
        "3 min"),
      step(4, "Joue le dialogue des salutations : matin, après-midi, soir",
        "Joue le dialogue des salutations : matin, après-midi, soir",
        "Dis « Bonjour ! » le matin, « Bon après-midi ! », puis « Bonne nuit ! » — trois scènes !",
        "Dis « Bonjour ! » le matin, « Bon après-midi ! », puis « Bonne nuit ! » — trois scènes !",
        "7 min"),
    ],
    dialogue_script: {
      morning: { child: "Bonjour, Maman !", childFr: "Bonjour, Maman !", adult: "Bonjour, mon chéri ! Comment ça va ?", adultFr: "Bonjour, mon chéri ! Comment ça va ?" },
      afternoon: { child: "Bon après-midi, Papa !", childFr: "Bon après-midi, Papa !", adult: "Bon après-midi, mon enfant !", adultFr: "Bon après-midi, mon enfant !" },
      night: { child: "Bonne nuit, Maman !", childFr: "Bonne nuit, Maman !", adult: "Bonne nuit, dors bien !", adultFr: "Bonne nuit, dors bien !" },
    },
    assessment: {
      criteria: ["Salutation correcte pour le moment de la journée", "Prononciation claire en français", "Participation au jeu de rôle"],
      criteriaFr: ["Salutation correcte pour le moment de la journée", "Prononciation claire en français", "Participation au jeu de rôle"],
      method: "Parent/teacher observation",
    },
    extension: "Joue le spectacle pour toute la famille après le dîner",
    extensionFr: "Joue le spectacle pour toute la famille après le dîner",
    gamification: {
      xp_points: 30,
      badge_name: "Star Puppet",
      badge_code: "star-puppet",
      photo_challenge: "Prends une photo de ton théâtre de salutations !",
      photo_challengeFr: "Prends une photo de ton théâtre de salutations !",
    },
  },

  {
    // soc_w1 — The National emblems (§3.2 Social Studies: map making, cultural artifacts)
    id: "soc_class3_home_w1_diy",
    title: "Flag and Emblem Craft Corner",
    titleFr: "Atelier Drapeau et Emblèmes",
    linkedLessonId: "soc_class3_home_w1",
    learning_objective: "Recreate the Cameroon flag and explain what each colour and star means",
    learning_objectiveFr: "Reconstituer le drapeau du Cameroun et expliquer la signification des couleurs et de l'étoile",
    materials: {
      required: ["Paper", "Green, red and yellow colours (crayons or natural dyes)", "Scissors (with adult supervision)"],
      requiredFr: ["Papier", "Couleurs verte, rouge et jaune (crayons ou teintures naturelles)", "Ciseaux (avec un adulte)"],
      optional: ["Stick for the flag pole", "Star cut-out"],
      optionalFr: ["Bâton pour le mât", "Étoile découpée"],
    },
    steps: [
      step(1, "Fold or rule the paper into three equal vertical bands",
        "Plie ou trace le papier en trois bandes verticales égales",
        "Three bands, side by side — green, red, yellow. That is our flag!",
        "Trois bandes côte à côte — verte, rouge, jaune. Voilà notre drapeau !",
        "5 min"),
      step(2, "Colour the bands: green, red, yellow",
        "Colorie les bandes : verte, rouge, jaune",
        "Green for the forests of the South, red for unity, yellow for the sun of the North!",
        "Le vert pour les forêts du Sud, le rouge pour l'unité, le jaune pour le soleil du Nord !",
        "5 min"),
      step(3, "Cut a small yellow star and place it on the red band",
        "Découpe une petite étoile jaune et pose-la sur la bande rouge",
        "One yellow star shining in the middle — the star of unity!",
        "Une étoile jaune qui brille au milieu — l'étoile de l'unité !",
        "5 min"),
      step(4, "Raise your flag and say what each colour means",
        "Lève ton drapeau et dis ce que signifie chaque couleur",
        "Wave your flag and tell me: what does green mean? And red? And yellow?",
        "Agite ton drapeau et dis-moi : que veut dire le vert ? Et le rouge ? Et le jaune ?",
        "5 min"),
    ],
    dialogue_script: {
      recital: { child: "Green, red, yellow — one star, one Cameroon!", childFr: "Vert, rouge, jaune — une étoile, un Cameroun !", adult: "Proud of you! What does the star stand for?", adultFr: "Je suis fier de toi ! Que représente l'étoile ?" },
    },
    assessment: {
      criteria: ["Correct colours in the correct order", "Star placed on the red band", "Explains the meaning of each colour"],
      criteriaFr: ["Couleurs correctes dans le bon ordre", "Étoile posée sur la bande rouge", "Explique la signification de chaque couleur"],
      method: "Parent/teacher observation",
    },
    extension: "Draw your region's map beside the flag with natural dyes",
    extensionFr: "Dessine la carte de ta région à côté du drapeau avec des teintures naturelles",
    gamification: {
      xp_points: 30,
      badge_name: "Flag Keeper",
      badge_code: "flag-keeper",
      photo_challenge: "Photograph you raising your handmade flag!",
      photo_challengeFr: "Photographie-toi en train de lever ton drapeau !",
    },
  },

  {
    // nat_w1 — attested Kom word families (§3.2 Language; TRUSTED-SOURCES POLICY:
    // every Kom word below is Hyman-attested. The greeting-puppet activity that
    // used invented greetings was replaced by user directive).
    id: "nat_class3_home_w1_diy",
    title: "Kom Word Family Poster",
    titleFr: "Affiche des Familles de Mots Kom",
    linkedLessonId: "nat_class3_home_w1",
    learning_objective: "Group attested Kom words by noun class and mark every tone",
    learning_objectiveFr: "Classer des mots kom attestés par classe nominale et marquer chaque ton",
    materials: {
      required: ["Paper", "Markers", "Old magazines or drawings"],
      requiredFr: ["Papier", "Feutres", "Vieux magazines ou dessins"],
      optional: ["Sticks and string to hang the poster in the compound"],
      optionalFr: ["Bâtons et ficelle pour accrocher l'affiche dans la concession"],
    },
    steps: [
      step(1, "Draw three columns: people, animals, things",
        "Dessine trois colonnes : personnes, animaux, choses",
        "Our poster has three homes for words — people, animals and things.",
        "Notre affiche a trois maisons pour les mots — personnes, animaux et choses.",
        "4 min"),
      step(2, "Write the Kom words: wáyn (child) · bì (dog) · muú (water)",
        "Écris les mots kom : wáyn (enfant) · bì (chien) · muú (eau)",
        "Copy the tone marks carefully — grave à falls down, acute ú climbs up!",
        "Copie bien les marques de tons — l'accent grave à descend, l'accent aigu ú monte !",
        "5 min"),
      step(3, "Add the plural pairs: ghóyn (children) and bì-se (dogs)",
        "Ajoute les paires de pluriel : ghóyn (enfants) et bì-se (chiens)",
        "One child, many children — in Kom the word itself changes: wáyn becomes ghóyn!",
        "Un enfant, beaucoup d'enfants — en kom le mot change : wáyn devient ghóyn !",
        "5 min"),
      step(4, "Cut out pictures and glue each one under its Kom word",
        "Découpe des images et colle chacune sous son mot kom",
        "Say each word aloud as you glue it — hear the tone while your hands work!",
        "Dis chaque mot à voix haute en le collant — entends le ton pendant que tes mains travaillent !",
        "6 min"),
      step(5, "Ask a Kom speaker at home for ONE greeting and write it on a star",
        "Demande UNE salutation à un locuteur kom de ta maison et écris-la sur une étoile",
        "Greetings are precious — they must come from a real speaker. Bring the star to class; your teacher can submit it to the Content Ingestion portal so every school learns the true greeting!",
        "Les salutations sont précieuses — elles doivent venir d'un vrai locuteur. Apporte l'étoile en classe ; ton enseignant pourra l'envoyer sur le portail d'ingestion pour que toutes les écoles apprennent la vraie salutation !",
        "5 min"),
    ],
    assessment: {
      criteria: ["Words written with correct GACL tone marks", "Each picture under the right word", "Plural pairs correct (wáyn→ghóyn, bì→bì-se)"],
      criteriaFr: ["Mots écrits avec les tons GACL corrects", "Chaque image sous le bon mot", "Paires de pluriel correctes (wáyn→ghóyn, bì→bì-se)"],
      method: "Parent/teacher observation",
    },
    extension: "Add fe-tám (fruit), fe-ghâm (mat) and e-ndo (house) — words that carry a class prefix or an initial vowel",
    extensionFr: "Ajoute fe-tám (fruit), fe-ghâm (natte) et e-ndo (maison) — des mots à préfixe de classe ou à voyelle initiale",
    gamification: {
      xp_points: 30,
      badge_name: "Tone Keeper",
      badge_code: "tone-keeper",
      photo_challenge: "Photograph your word-family poster with the greeting star!",
      photo_challengeFr: "Photographie ton affiche de mots avec l'étoile de salutation !",
    },
  },

  {
    // art_w1 — Painting materials + Bamenda dance (§3.4 The Home/Arts: Traditional house model)
    id: "art_class3_home_w1_diy",
    title: "Traditional House Model with Natural Pigments",
    titleFr: "Maquette de Maison Traditionnelle aux Pigments Naturels",
    linkedLessonId: "art_class3_home_w1",
    learning_objective: "Build a Grassfields house model and paint it with natural pigments",
    learning_objectiveFr: "Construire une maquette de maison des Grassfields et la peindre avec des pigments naturels",
    materials: {
      required: ["Clay or wet mud", "Sticks", "Grass or straw for the roof"],
      requiredFr: ["Argile ou boue humide", "Bâtons", "Herbe ou paille pour le toit"],
      optional: ["Natural pigments (soil, charcoal, flower juice)", "Small stones for the compound"],
      optionalFr: ["Pigments naturels (terre, charbon, jus de fleurs)", "Petites pierres pour la concession"],
    },
    steps: [
      step(1, "Mould the clay into square walls",
        "Modele l'argile en murs carrés",
        "Press the clay gently — walls first, like the houses of the North West!",
        "Presse l'argile doucement — d'abord les murs, comme les maisons du Nord-Ouest !",
        "7 min"),
      step(2, "Stand the sticks inside for the frame",
        "Plante les bâtons dedans pour la charpente",
        "The sticks hold the roof, just like wooden posts hold real houses.",
        "Les bâtons soutiennent le toit, comme les poteaux soutiennent les vraies maisons.",
        "5 min"),
      step(3, "Lay the grass roof on top",
        "Pose le toit d'herbe par-dessus",
        "Layer the grass downwards so the rain slides off!",
        "Dispose l'herbe vers le bas pour que la pluie glisse !",
        "6 min"),
      step(4, "Paint patterns with natural pigments and add dance figures",
        "Peins des motifs avec les pigments naturels et ajoute des danseurs",
        "Paint like the Bamenda dancers move — bold and beautiful!",
        "Peins comme dansent les danseurs de Bamenda — fort et beau !",
        "7 min"),
    ],
    assessment: {
      criteria: ["Stable walls and roof", "Roof thatch layered to shed rain", "Creative traditional patterns"],
      criteriaFr: ["Murs et toit stables", "Chaume disposé pour évacuer la pluie", "Motifs traditionnels créatifs"],
      method: "Parent/teacher observation",
    },
    extension: "Add the compound: kitchen, granary and family figures",
    extensionFr: "Ajoute la concession : cuisine, grenier et figurines de la famille",
    gamification: {
      xp_points: 30,
      badge_name: "Master Builder",
      badge_code: "master-builder",
      photo_challenge: "Photograph your finished traditional house model!",
      photo_challengeFr: "Photographie ta maquette de maison traditionnelle finie !",
    },
  },

  {
    // pe_w1 — Relay, sprint, balance (§3.2 PES: traditional games, obstacle courses)
    id: "pe_class3_home_w1_diy",
    title: "Compound Obstacle Course",
    titleFr: "Parcours d'Obstacles de la Concession",
    linkedLessonId: "pe_class3_home_w1",
    learning_objective: "Design and run a relay obstacle course practising sprint, balance and teamwork",
    learning_objectiveFr: "Concevoir et courir un parcours de relais avec sprint, équilibre et esprit d'équipe",
    materials: {
      required: ["Found objects (stones, bottles, ropes)", "Open space in the compound"],
      requiredFr: ["Objets trouvés (pierres, bouteilles, cordes)", "Espace libre dans la concession"],
      optional: ["Bottle-cap batons for the relay", "Drum or clapping for the start signal"],
      optionalFr: ["Bâtons de relais en bouchons", "Tambour ou claquements pour le départ"],
    },
    steps: [
      step(1, "Place 4 stations: sprint line, stone zigzag, bottle balance, rope jump",
        "Place 4 stations : ligne de sprint, zigzag de pierres, équilibre de bouteilles, saut de corde",
        "Design your course like a hero's trail — run, dodge, balance, jump!",
        "Dessine ton parcours comme un sentier de héros — cours, esquive, équilibre, saute !",
        "7 min"),
      step(2, "Warm up: jog on the spot and stretch your arms and legs",
        "Échauffe-toi : trottine sur place et étire bras et jambes",
        "Ready bodies are safe bodies! Stretch tall, then touch your toes.",
        "Un corps prêt est un corps en sécurité ! Étire-toi grand, puis touche tes orteils.",
        "4 min"),
      step(3, "Run the relay with family or friends — pass the baton",
        "Cours le relais avec ta famille ou tes amis — passe le témoin",
        "Sprint to the zigzag, balance at the bottle, jump the rope — pass the baton!",
        "Sprint jusqu'au zigzag, équilibre à la bouteille, saute la corde — passe le témoin !",
        "9 min"),
      step(4, "Count your wins and try to beat your own time",
        "Compte tes victoires et essaie de battre ton propre temps",
        "How fast were you? Say the count out loud — now beat it!",
        "Quel était ton temps ? Dis-le à voix haute — bats-le maintenant !",
        "5 min"),
    ],
    assessment: {
      criteria: ["Completes all four stations", "Balances without falling", "Encourages teammates"],
      criteriaFr: ["Termine les quatre stations", "Garde l'équilibre sans tomber", "Encourage les coéquipiers"],
      method: "Parent/teacher observation",
    },
    extension: "Invent a traditional game rule and teach it to a friend",
    extensionFr: "Invente une règle de jeu traditionnel et apprends-la à un ami",
    gamification: {
      xp_points: 30,
      badge_name: "Course Champion",
      badge_code: "course-champion",
      photo_challenge: "Photograph your obstacle course and your best jump!",
      photo_challengeFr: "Photographie ton parcours et ton meilleur saut !",
    },
  },

  {
    // ict_w1 — Keyboard, mouse and friends (§3.2 ICT: unplugged coding, logic games)
    id: "ict_class3_home_w1_diy",
    title: "Unplugged Paper Keyboard & Logic Game",
    titleFr: "Clavier en Papier & Jeu de Logique Débranché",
    linkedLessonId: "ict_class3_home_w1",
    learning_objective: "Build a paper keyboard and follow step-by-step instructions like a computer",
    learning_objectiveFr: "Construire un clavier en papier et suivre des instructions étape par étape comme un ordinateur",
    materials: {
      required: ["Cards or paper squares", "Stones or bottle caps", "String"],
      requiredFr: ["Cartes ou carrés de papier", "Pierres ou bouchons", "Ficelle"],
      optional: ["Crayon to draw the mouse", "Small box as the computer case"],
      optionalFr: ["Crayon pour dessiner la souris", "Petite boîte comme unité centrale"],
    },
    steps: [
      step(1, "Write one letter on each card and lay them in rows",
        "Écris une lettre par carte et aligne-les en rangées",
        "A real keyboard has rows of keys. Make yours — Q W E R T Y!",
        "Un vrai clavier a des rangées de touches. Fais le tien — Q W E R T Y !",
        "6 min"),
      step(2, "Draw a mouse on paper and link it with a string cable",
        "Dessine une souris sur papier et relie-la avec une ficelle",
        "The string is the cable! The mouse tells the computer where to point.",
        "La ficelle, c'est le câble ! La souris dit à l'ordinateur où pointer.",
        "5 min"),
      step(3, "Play the robot game: give step-by-step commands to a helper",
        "Joue au robot : donne des commandes étape par étape à un ami",
        "Computers obey exact instructions! Say: 'Step forward. Pick the stone. Turn left.'",
        "Les ordinateurs obéissent exactement ! Dis : « Avance. Prends la pierre. Tourne à gauche. »",
        "5 min"),
      step(4, "Type your name by pressing the paper keys one by one",
        "Écris ton nom en pressant les touches en papier une par une",
        "Press each letter of your name out loud — you are typing, unplugged!",
        "Presse chaque lettre de ton nom à voix haute — tu tapes, sans ordinateur !",
        "4 min"),
    ],
    assessment: {
      criteria: ["Keyboard letters in correct order", "Precise step-by-step commands", "Names all parts: keyboard, mouse, cable"],
      criteriaFr: ["Lettres du clavier dans le bon ordre", "Commandes précises étape par étape", "Nomme toutes les parties : clavier, souris, câble"],
      method: "Parent/teacher observation",
    },
    extension: "Hide a 'treasure' stone and write instructions for a friend to find it",
    extensionFr: "Cache une « pierre au trésor » et écris les instructions pour la retrouver",
    gamification: {
      xp_points: 30,
      badge_name: "Code Crafter",
      badge_code: "code-crafter",
      photo_challenge: "Photograph your paper keyboard and robot game!",
      photo_challengeFr: "Photographie ton clavier en papier et ton jeu de robot !",
    },
  },

  {
    // eng_w3 — Songs and possessive apostrophes (The Bedroom)
    id: "eng_class3_home_w3_diy",
    title: "Bedroom Puppet Concert & Possession Labels",
    titleFr: "Concert de Marionnettes & Étiquettes de Possession",
    linkedLessonId: "eng_class3_home_w3",
    learning_objective: "Sing a traditional song with puppets and label possessions with apostrophes",
    learning_objectiveFr: "Chanter une chanson traditionnelle avec des marionnettes et étiqueter les possessions avec l'apostrophe",
    materials: {
      required: ["Paper", "Sticks", "Markers"],
      requiredFr: ["Papier", "Bâtons", "Feutres"],
      optional: ["Small cloth curtain for the stage", "Clapping rhythm"],
      optionalFr: ["Petit rideau en tissu pour la scène", "Rythme de claquements"],
    },
    steps: [
      step(1, "Make one bedroom puppet — it will be the singer",
        "Fabrique une marionnette de la chambre — ce sera le chanteur",
        "Meet your star singer! Give it a name — 'Mbi's puppet' needs an apostrophe!",
        "Voici ta vedette ! Donne-lui un nom — « la marionnette de Mbi » a besoin d'une apostrophe !",
        "6 min"),
      step(2, "Build a mini stage from a box and cloth",
        "Construis une mini-scène avec une boîte et un tissu",
        "Every star needs a stage! Set it in the bedroom corner.",
        "Chaque vedette a besoin d'une scène ! Installe-la dans un coin de la chambre.",
        "6 min"),
      step(3, "Write possession labels: 'Ngo's mat', 'Papa's chair'",
        "Écris des étiquettes de possession : « le tapis de Ngo », « la chaise de Papa »",
        "The apostrophe-s shows who owns what — Ngo's mat belongs to Ngo!",
        "L'apostrophe-s montre à qui appartient chaque chose — le tapis de Ngo appartient à Ngo !",
        "5 min"),
      step(4, "Perform the song with your puppet, pointing at each label",
        "Joue la chanson avec ta marionnette en montrant chaque étiquette",
        "Sing loud and proud! Point to 'Mbi's mat' when the song names it.",
        "Chante fort et fier ! Montre « le tapis de Mbi » quand la chanson le nomme.",
        "6 min"),
    ],
    dialogue_script: {
      song: { child: "This is Ngo's mat, and this is Papa's chair!", childFr: "Ceci est le tapis de Ngo, et ceci est la chaise de Papa !", adult: "Wonderful singing! Whose chair is it?", adultFr: "Quel beau chant ! À qui est cette chaise ?" },
    },
    assessment: {
      criteria: ["Correct apostrophe on each label", "Sings with rhythm and pride", "Matches labels to real objects"],
      criteriaFr: ["Apostrophe correcte sur chaque étiquette", "Chante avec rythme et fierté", "Associe les étiquettes aux vrais objets"],
      method: "Parent/teacher observation",
    },
    extension: "Perform the concert for family members at bedtime",
    extensionFr: "Donne le concert à ta famille à l'heure du coucher",
    gamification: {
      xp_points: 30,
      badge_name: "Song Maker",
      badge_code: "song-maker",
      photo_challenge: "Photograph your puppet on stage with the labels!",
      photo_challengeFr: "Photographie ta marionnette sur scène avec les étiquettes !",
    },
  },

  {
    // mat_w2 — Sets, elements and months (§3.2 Mathematics: counting aids, bottle caps)
    id: "mat_class3_home_w2_diy",
    title: "Family Shelf Set Sorting",
    titleFr: "Rangement en Ensembles de l'Étagère Familiale",
    linkedLessonId: "mat_class3_home_w2",
    learning_objective: "Sort household objects into sets and name the elements of each set",
    learning_objectiveFr: "Trier les objets de la maison en ensembles et nommer les éléments de chaque ensemble",
    materials: {
      required: ["Bottle caps", "Stones and leaves", "String or chalk for set circles"],
      requiredFr: ["Bouchons", "Pierres et feuilles", "Ficelle ou craie pour les cercles"],
      optional: ["Paper labels for each set name"],
      optionalFr: ["Étiquettes de papier pour le nom de chaque ensemble"],
    },
    steps: [
      step(1, "Draw two big circles on the ground with chalk or string",
        "Trace deux grands cercles au sol avec la craie ou la ficelle",
        "These circles are SETS — each one is a home for matching things.",
        "Ces cercles sont des ENSEMBLES — chacun est une maison pour des objets qui vont ensemble.",
        "4 min"),
      step(2, "Sort caps into one set and stones into the other",
        "Range les bouchons dans un ensemble et les pierres dans l'autre",
        "Every cap belongs to the caps set. Every element finds its home!",
        "Chaque bouchon appartient à l'ensemble des bouchons. Chaque élément trouve sa maison !",
        "5 min"),
      step(3, "Count and say the elements: 'The set of caps has 6 elements'",
        "Compte et dis les éléments : « L'ensemble des bouchons a 6 éléments »",
        "Say it like a mathematician: 'The set of caps has 6 elements!'",
        "Dis-le comme un mathématicien : « L'ensemble des bouchons a 6 éléments ! »",
        "5 min"),
      step(4, "Sort the months: which months belong to the dry season set?",
        "Classe les mois : quels mois appartiennent à l'ensemble de la saison sèche ?",
        "Now sort the months! November to March — the dry season set. Name each month aloud.",
        "Maintenant classe les mois ! Novembre à mars — l'ensemble de la saison sèche. Nomme chaque mois à voix haute.",
        "6 min"),
    ],
    dialogue_script: {
      sorting: { child: "The set of caps has 6 elements!", childFr: "L'ensemble des bouchons a 6 éléments !", adult: "Well sorted! And how many elements in the stones set?", adultFr: "Bien rangé ! Et combien d'éléments dans l'ensemble des pierres ?" },
    },
    assessment: {
      criteria: ["Correctly sorts objects into sets", "Counts and names the elements", "Sorts months by season"],
      criteriaFr: ["Trie correctement les objets en ensembles", "Compte et nomme les éléments", "Classe les mois par saison"],
      method: "Parent/teacher observation",
    },
    extension: "Create a third set where one object belongs to two sets at once",
    extensionFr: "Crée un troisième ensemble où un objet appartient à deux ensembles à la fois",
    gamification: {
      xp_points: 30,
      badge_name: "Set Sorter",
      badge_code: "set-sorter",
      photo_challenge: "Photograph your sorted sets with their labels!",
      photo_challengeFr: "Photographie tes ensembles rangés avec leurs étiquettes !",
    },
  },
];

/** §3.5 lookup — DIY lesson linked to a digital lesson id */
export function diyForLesson(lessonId: string): DIYLesson | undefined {
  return DIY_LESSONS.find((d) => d.linkedLessonId === lessonId);
}

// ---------------------------------------------------------------------------
// §3.4 DIY Content Library (per ILT) — verbatim tables for the Library wing
// ---------------------------------------------------------------------------
export const DIY_LIBRARY: Array<{
  ilt: string; iltFr: string;
  rows: Array<{ subject: string; subjectFr: string; activity: string; activityFr: string; materials: string; materialsFr: string; objective: string; objectiveFr: string }>;
}> = [
  {
    ilt: "The Home (ILT 1)",
    iltFr: "La Maison (ILT 1)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Family portrait with labels", activityFr: "Portrait de famille avec étiquettes", materials: "Paper, crayons", materialsFr: "Papier, crayons", objective: "Name family members", objectiveFr: "Nommer les membres de la famille" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Kitchen item counting", activityFr: "Comptage des ustensiles de cuisine", materials: "Pots, spoons, cups", materialsFr: "Marmites, cuillères, tasses", objective: "Count 1-20", objectiveFr: "Compter de 1 à 20" },
      { subject: "Science", subjectFr: "Sciences", activity: "Water filtration experiment", activityFr: "Expérience de filtration de l'eau", materials: "Sand, gravel, cloth, bottles", materialsFr: "Sable, gravier, tissu, bouteilles", objective: "Understand clean water", objectiveFr: "Comprendre l'eau propre" },
      { subject: "Vocational", subjectFr: "Vocational", activity: "Bedroom organization chart", activityFr: "Tableau d'organisation de la chambre", materials: "Paper, markers", materialsFr: "Papier, feutres", objective: "Home management", objectiveFr: "Gestion de la maison" },
      { subject: "Arts", subjectFr: "Arts", activity: "Traditional house model", activityFr: "Maquette de maison traditionnelle", materials: "Clay, sticks, grass", materialsFr: "Argile, bâtons, herbe", objective: "Cultural architecture", objectiveFr: "Architecture culturelle" },
    ],
  },
  {
    ilt: "The Village/Town (ILT 2)",
    iltFr: "Le Village/La Ville (ILT 2)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Market dialogue script", activityFr: "Scénario de dialogue au marché", materials: "Paper, props", materialsFr: "Papier, accessoires", objective: "Transactional language", objectiveFr: "Langage transactionnel" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Market stall money game", activityFr: "Jeu d'argent du stand de marché", materials: "Bottle caps, leaves", materialsFr: "Bouchons, feuilles", objective: "Money calculations", objectiveFr: "Calculs d'argent" },
      { subject: "Science", subjectFr: "Sciences", activity: "Local plant identification", activityFr: "Identification des plantes locales", materials: "Leaves, notebook", materialsFr: "Feuilles, cahier", objective: "Environmental awareness", objectiveFr: "Sensibilisation environnementale" },
      { subject: "Social Studies", subjectFr: "Études Sociales", activity: "Village map creation", activityFr: "Création d'une carte du village", materials: "Paper, natural dyes", materialsFr: "Papier, teintures naturelles", objective: "Map reading skills", objectiveFr: "Lecture de cartes" },
      { subject: "Vocational", subjectFr: "Vocational", activity: "Basket weaving", activityFr: "Tressage de paniers", materials: "Palm fronds, grass", materialsFr: "Feuilles de palmier, herbe", objective: "Traditional craft", objectiveFr: "Artisanat traditionnel" },
    ],
  },
  {
    ilt: "The School (ILT 3)",
    iltFr: "L'École (ILT 3)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Classroom objects flashcards", activityFr: "Cartes-éclair des objets de la classe", materials: "Paper, markers", materialsFr: "Papier, feutres", objective: "Vocabulary building", objectiveFr: "Enrichissement du vocabulaire" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Abacus from bottle caps", activityFr: "Boulier en bouchons", materials: "String, caps, stick", materialsFr: "Ficelle, bouchons, bâton", objective: "Counting and operations", objectiveFr: "Comptage et opérations" },
      { subject: "Science", subjectFr: "Sciences", activity: "Shadow clock", activityFr: "Horloge à ombre", materials: "Stick, stones, ground", materialsFr: "Bâton, pierres, sol", objective: "Time measurement", objectiveFr: "Mesure du temps" },
      { subject: "Social Studies", subjectFr: "Études Sociales", activity: "School rules poster", activityFr: "Affiche des règles de l'école", materials: "Paper, crayons", materialsFr: "Papier, crayons", objective: "Citizenship values", objectiveFr: "Valeurs citoyennes" },
      { subject: "Arts", subjectFr: "Arts", activity: "School song composition", activityFr: "Composition d'une chanson d'école", materials: "Voice, clapping", materialsFr: "Voix, claquements", objective: "Musical creativity", objectiveFr: "Créativité musicale" },
    ],
  },
  {
    ilt: "Occupations (ILT 4)",
    iltFr: "Les Métiers (ILT 4)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Job interview role-play", activityFr: "Jeu de rôle d'entretien d'embauche", materials: "Paper, props", materialsFr: "Papier, accessoires", objective: "Speaking practice", objectiveFr: "Pratique orale" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Farming yield calculations", activityFr: "Calculs de récolte agricole", materials: "Seeds, containers", materialsFr: "Graines, contenants", objective: "Multiplication", objectiveFr: "Multiplication" },
      { subject: "Science", subjectFr: "Sciences", activity: "Seed germination experiment", activityFr: "Expérience de germination", materials: "Beans, cotton, water", materialsFr: "Haricots, coton, eau", objective: "Plant life cycle", objectiveFr: "Cycle de vie des plantes" },
      { subject: "Vocational", subjectFr: "Vocational", activity: "Tool making (toy hammer)", activityFr: "Fabrication d'outils (marteau-jouet)", materials: "Wood, string", materialsFr: "Bois, ficelle", objective: "Craft skills", objectiveFr: "Compétences artisanales" },
      { subject: "Social Studies", subjectFr: "Études Sociales", activity: "Community helpers chart", activityFr: "Tableau des métiers communautaires", materials: "Paper, markers", materialsFr: "Papier, feutres", objective: "Civic awareness", objectiveFr: "Sens civique" },
    ],
  },
  {
    ilt: "Travelling (ILT 5)",
    iltFr: "Les Déplacements (ILT 5)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Travel dialogue script", activityFr: "Scénario de dialogue de voyage", materials: "Paper, props", materialsFr: "Papier, accessoires", objective: "Conversational language", objectiveFr: "Langage conversationnel" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Distance measurement", activityFr: "Mesure de distances", materials: "String, ruler", materialsFr: "Ficelle, règle", objective: "Units of length", objectiveFr: "Unités de longueur" },
      { subject: "Science", subjectFr: "Sciences", activity: "Weather observation journal", activityFr: "Journal d'observation météo", materials: "Notebook, pencil", materialsFr: "Cahier, crayon", objective: "Weather patterns", objectiveFr: "Modèles météorologiques" },
      { subject: "Social Studies", subjectFr: "Études Sociales", activity: "Transportation timeline", activityFr: "Frise des transports", materials: "Paper, drawings", materialsFr: "Papier, dessins", objective: "Historical changes", objectiveFr: "Évolutions historiques" },
      { subject: "Arts", subjectFr: "Arts", activity: "Vehicle models", activityFr: "Maquettes de véhicules", materials: "Clay, sticks, leaves", materialsFr: "Argile, bâtons, feuilles", objective: "Creative construction", objectiveFr: "Construction créative" },
    ],
  },
  {
    ilt: "Health (ILT 6)",
    iltFr: "La Santé (ILT 6)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Doctor-patient dialogue", activityFr: "Dialogue médecin-patient", materials: "Paper, props", materialsFr: "Papier, accessoires", objective: "Health vocabulary", objectiveFr: "Vocabulaire de la santé" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Growth chart", activityFr: "Courbe de croissance", materials: "String, markers", materialsFr: "Ficelle, feutres", objective: "Measurement", objectiveFr: "Mesure" },
      { subject: "Science", subjectFr: "Sciences", activity: "Handwashing experiment", activityFr: "Expérience de lavage des mains", materials: "Water, soap, pepper", materialsFr: "Eau, savon, poivre", objective: "Hygiene practice", objectiveFr: "Pratique d'hygiène" },
      { subject: "Vocational", subjectFr: "Vocational", activity: "First aid kit assembly", activityFr: "Assemblage d'une trousse de secours", materials: "Box, cloth, sticks", materialsFr: "Boîte, tissu, bâtons", objective: "Emergency response", objectiveFr: "Réponse d'urgence" },
      { subject: "PES", subjectFr: "EPS", activity: "Exercise routine creation", activityFr: "Création d'une routine d'exercices", materials: "Body, space", materialsFr: "Corps, espace", objective: "Physical fitness", objectiveFr: "Forme physique" },
    ],
  },
  {
    ilt: "Games (ILT 7)",
    iltFr: "Les Jeux (ILT 7)",
    rows: [
      { subject: "English", subjectFr: "Anglais", activity: "Game rules writing", activityFr: "Rédaction des règles du jeu", materials: "Paper, pencil", materialsFr: "Papier, crayon", objective: "Instructional language", objectiveFr: "Langage instructif" },
      { subject: "Mathematics", subjectFr: "Mathématiques", activity: "Traditional game scoring", activityFr: "Comptage des points d'un jeu traditionnel", materials: "Stones, sticks", materialsFr: "Pierres, bâtons", objective: "Addition and counting", objectiveFr: "Addition et comptage" },
      { subject: "Science", subjectFr: "Sciences", activity: "Ball bounce experiment", activityFr: "Expérience de rebond de balle", materials: "Various balls", materialsFr: "Diverses balles", objective: "Physics concepts", objectiveFr: "Notions de physique" },
      { subject: "Social Studies", subjectFr: "Études Sociales", activity: "Game origins research", activityFr: "Recherche sur l'origine des jeux", materials: "Interviews", materialsFr: "Entretiens", objective: "Cultural heritage", objectiveFr: "Patrimoine culturel" },
      { subject: "Arts", subjectFr: "Arts", activity: "Game song and dance", activityFr: "Chanson et danse du jeu", materials: "Voice, body", materialsFr: "Voix, corps", objective: "Performance arts", objectiveFr: "Arts de la scène" },
    ],
  },
];
