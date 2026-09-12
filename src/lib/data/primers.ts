/**
 * OMNIVOICE v4.2 §6.3 — Graded Kom reading library (primer ladder).
 *
 *   Stage 1  Ghesɨ̀nà Yeʼi Itaŋikom 1 (alphabet)   — SIL 90620 / 33384
 *   Stage 2  Ghesɨ̀nà Yeʼi Itaŋikom 2 (dialogues)  — SIL 33002
 *   Stage 3  Yêm Woyn Kom 1 (pre-primer tales)    — SIL 99662
 *   Stage 4  Ŋwàʼlɨ̀ àkòyn 1 (numeracy/proverbs)   — SIL 33013
 *   Stage 5  Kom New Testament (narratives)       — find.bible BKMBSC
 *
 * HONESTY: reading text appears ONLY where attested (GACL orthography +
 * §7.3 verbatim phrases + Hyman vocabulary). Units whose printed pages are
 * gated/unavailable carry textKom: null + reviewStatus AWAITING_CONTENT —
 * never fabricated. Audio follows Directive 9 (native reference pending).
 */

export interface PrimerActivity {
  type: "comprehension" | "vocab" | "retelling" | "tracing" | "counting" | "tone";
  prompt: string;
  promptFr: string;
}

export interface PrimerPassage {
  id: string;
  stage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  titleKom: string;
  titleEn: string;
  source: string;
  textKom: string | null;
  textEn: string | null;
  activities: PrimerActivity[];
  audioStatus: string;
  reviewStatus: "VALIDATED" | "AWAITING_CONTENT";
  classBand: string;
  ilt: string;
}

const STAGES = {
  1: "Stage 1 — Alphabet (Ghesɨ̀nà 1, Classes 1–2)",
  2: "Stage 2 — Dialogues (Ghesɨ̀nà 2, Class 2)",
  3: "Stage 3 — Folk tales (Yêm Woyn Kom 1, Class 3)",
  4: "Stage 4 — Numeracy & proverbs (Ŋwàʼlɨ̀ àkòyn 1, Class 3–4)",
  5: "Stage 5 — Narratives (Kom NT, Classes 5–6)",
} as const;

const AUDIO_PENDING = "tts-synthesizable (native reference audio pending — Directive 9)";

export const PRIMER_PASSAGES: PrimerPassage[] = [
  // ---------------- Stage 1 — Alphabet (real GACL content) ----------------
  {
    id: "PR-S1-U1",
    stage: 1, stageName: STAGES[1],
    titleKom: "Mɨ̀ghɔ̀m mɨ̀ e-mwààtɨ̀m", titleEn: "The five vowels",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 1 (Chia & Ngong Mbeh, 1996), NACALCO/PROPELCA — SIL 90620",
    textKom: "a · e · i · o · u\nə · ɛ · ɨ · ɔ",
    textEn: "The Kom vowel set: five basic vowels a e i o u, plus the reduced and open-mid vowels ə ɛ ɨ ɔ of the GACL alphabet.",
    activities: [
      { type: "tracing", prompt: "Trace each vowel while saying its sound.", promptFr: "Retrace chaque voyelle en prononçant son son." },
      { type: "tone", prompt: "Say each vowel plain (high), then with à (low), then â (falling).", promptFr: "Prononce chaque voyelle haute, puis à (basse), puis â (descendante)." },
    ],
    audioStatus: AUDIO_PENDING, reviewStatus: "VALIDATED", classBand: "1-2", ilt: "school",
  },
  {
    id: "PR-S1-U2",
    stage: 1, stageName: STAGES[1],
    titleKom: "Njàng e-mwààtɨ̀m mɨ̀ Kòm", titleEn: "Special Kom letters",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 1 (1996); GACL orthography (1979); example words attested in Hyman (UC Berkeley) Tables 1–9",
    // Example words are Hyman-attested ONLY (trusted-sources policy):
    //   ŋwàʼlɨ̀ (book, SIL primer title) · ghesɨ̀nà (reading, primer title) ·
    //   nè 'with' (ɛ + low tone) · e-ndo 'house' · a-tâʔ 'snail' (glottal ʔ)
    // No attested Kom word with ɔ was ingested → ɔ example awaits the primer pages.
    textKom: "ŋ — as in ŋwàʼlɨ̀ (book)\nɨ — as in ŋwàʼlɨ̀, ghesɨ̀nà\nɛ — as in nè (with)\nɔ — printed example awaits the primer pages (ingest via the portal)\nʼ — glottal, as in a-tâʔ (snail)",
    textEn: "Kom adds ŋ, ɨ, ɛ, ɔ and the glottal stop marker ʼ to the Latin alphabet. Every example word is attested: ŋwàʼlɨ̀, ghesɨ̀nà, nè, e-ndo, a-tâʔ (Hyman, UC Berkeley / SIL titles).",
    activities: [
      { type: "tracing", prompt: "Trace ŋ and ɨ five times each.", promptFr: "Retrace ŋ et ɨ cinq fois chacun." },
      { type: "vocab", prompt: "Find ɨ in: ŋwàʼlɨ̀, ghesɨ̀nà, itaŋikom.", promptFr: "Trouve ɨ dans : ŋwàʼlɨ̀, ghesɨ̀nà, itaŋikom." },
    ],
    audioStatus: AUDIO_PENDING, reviewStatus: "VALIDATED", classBand: "1-2", ilt: "school",
  },
  {
    id: "PR-S1-U3",
    stage: 1, stageName: STAGES[1],
    titleKom: "È-sɨ̀mɨ̀ e-mɨ̀ nàŋghà", titleEn: "Reading two-syllable words",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 1 (1996); vocabulary attested in Hyman (UC Berkeley)",
    textKom: "wáyn (child) · ghóyn (children)\nfe-ghâm (mat) · fe-tám (fruit)\nfe-búʔ (gorilla) · fe-nywɨ́n (bird)",
    textEn: "Blend the noun-class prefix with the stem. The prefix vowel is usually mid (M); stems carry high, low or falling tone.",
    activities: [
      { type: "tone", prompt: "Clap once for each syllable and raise your hands on the falling tone â.", promptFr: "Frappe des mains à chaque syllabe et lève les mains sur le ton descendant â." },
      { type: "vocab", prompt: "Which words start with the class-19 prefix fe-?", promptFr: "Quels mots commencent par le préfixe de classe 19 fe- ?" },
    ],
    audioStatus: AUDIO_PENDING, reviewStatus: "VALIDATED", classBand: "1-2", ilt: "school",
  },
  {
    id: "PR-S1-U4",
    stage: 1, stageName: STAGES[1],
    titleKom: "È-sɨ̀mɨ̀ e-mɨ̀ a-ŋwàʼlɨ̀ àkòyn", titleEn: "Reading number words",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 1 (1996) + Ŋwàʼlɨ̀ àkòyn 1 (1993)",
    textKom: "Text pages to be typed from the printed primer — awaiting content clearance.",
    textEn: "Number words 1–10 as printed in the Kom primer; awaiting page content.",
    activities: [
      { type: "counting", prompt: "Count ten bottle caps into two groups.", promptFr: "Compte dix bouchons en deux groupes." },
    ],
    audioStatus: "no audio (text awaiting clearance)", reviewStatus: "AWAITING_CONTENT", classBand: "1-2", ilt: "school",
  },

  // ---------------- Stage 2 — Dialogues ----------------
  // TRUSTED-SOURCES POLICY: the greeting/classroom dialogues previously printed
  // here were platform-invented and were removed by user directive. The printed
  // dialogue pages of Ghesɨ̀nà Yeʼi Itaŋikom 2 (SIL 33002) are not yet digitized,
  // so Kom text stays null until native speakers ingest the real dialogues.
  {
    id: "PR-S2-U1",
    stage: 2, stageName: STAGES[2],
    titleKom: "Ghesɨ̀nà yeʼi itaŋikom 2", titleEn: "Reading dialogues — greetings unit",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 2 — SIL 33002 (record only; pages not yet digitized)",
    textKom: null,
    textEn: "Greeting dialogues as printed in Ghesɨ̀nà 2. The Kom text awaits page clearance — ingest it from the printed primer via the Content Ingestion portal (Library → 📥 Content Ingestion).",
    activities: [
      { type: "comprehension", prompt: "Which greetings do you use at home? Say them in your language.", promptFr: "Quelles salutations utilises-tu à la maison ? Dis-les dans ta langue." },
      { type: "retelling", prompt: "Ask a Kom speaker to record the real greeting dialogue and submit it to the platform.", promptFr: "Demande à un locuteur kom d'enregistrer le vrai dialogue de salutation et de l'envoyer sur la plateforme." },
    ],
    audioStatus: "no audio (text awaiting native-speaker ingestion)", reviewStatus: "AWAITING_CONTENT", classBand: "1-2", ilt: "communication",
  },
  {
    id: "PR-S2-U2",
    stage: 2, stageName: STAGES[2],
    titleKom: "Ghesɨ̀nà yeʼi itaŋikom 2", titleEn: "Reading dialogues — classroom unit",
    source: "Ghesɨ̀nà Yeʼi Itaŋikom 2 — SIL 33002 (record only; pages not yet digitized)",
    textKom: null,
    textEn: "Classroom dialogues as printed in Ghesɨ̀nà 2. The Kom text awaits page clearance — no phrase is shown until it comes from a trusted source.",
    activities: [
      { type: "tone", prompt: "Point to every grave accent (à) you can find in your printed primer page and say the word aloud.", promptFr: "Pointe chaque accent grave (à) de ta page imprimée et dis le mot à voix haute." },
    ],
    audioStatus: "no audio (text awaiting native-speaker ingestion)", reviewStatus: "AWAITING_CONTENT", classBand: "1-2", ilt: "school",
  },
  {
    id: "PR-S2-U3",
    stage: 2, stageName: STAGES[2],
    titleKom: "Nè fè-tám-fé", titleEn: "With a fruit — LTS reading",
    source: "Hyman (UC Berkeley) — LTS example nè fè-tám-fé 'with a fruit'",
    textKom: "nè fè-tám-fé",
    textEn: "A low-toned word like nè ('with') spreads its low tone into the next word — listen how the fruit's prefix lowers.",
    activities: [
      { type: "tone", prompt: "Say fe-tám alone, then nè fè-tám-fé. What changes?", promptFr: "Dis fe-tám seul, puis nè fè-tám-fé. Qu'est-ce qui change ?" },
    ],
    audioStatus: AUDIO_PENDING, reviewStatus: "VALIDATED", classBand: "3", ilt: "school",
  },

  // ---------------- Stage 3 — Folk tales (Yêm Woyn Kom 1) ----------------
  {
    id: "PR-S3-U1",
    stage: 3, stageName: STAGES[3],
    titleKom: "Yêm Woyn Kom", titleEn: "Awakening Kom children — pre-primer orientation",
    source: "Yêm Woyn Kom 1 (2010, 49pp), English-guided pre-primer — SIL 99662",
    textKom: null,
    textEn: null,
    activities: [
      { type: "vocab", prompt: "Name five picture words you expect in a children's pre-primer.", promptFr: "Nomme cinq mots d'image attendus dans un pré-primer." },
    ],
    audioStatus: "no audio (print pages pending clearance)", reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "school",
  },
  {
    id: "PR-S3-U2",
    stage: 3, stageName: STAGES[3],
    titleKom: "Wáyn nè bì", titleEn: "The child and the dog (word-family reading)",
    source: "Constructed from Hyman-attested vocabulary only (wáyn, bì, bì-se, ghóyn)",
    textKom: "wáyn · bì · bì-se\nghóyn · ŋgvɨ̀ · muú",
    textEn: "Word families for story reading: child, dog, dogs, children, hen, water. The story text from the printed pre-primer is added once the pages are cleared.",
    activities: [
      { type: "vocab", prompt: "Sort the words: one for people, animals, things, drink.", promptFr: "Classe les mots : personnes, animaux, choses, boisson." },
    ],
    audioStatus: AUDIO_PENDING, reviewStatus: "VALIDATED", classBand: "3", ilt: "school",
  },
  {
    id: "PR-S3-U3",
    stage: 3, stageName: STAGES[3],
    titleKom: "Kɨtɨ̂ Woyn Kom", titleEn: "Enlightening Kom children (reader 2.1 bridge)",
    source: "Kɨtɨ̂ Woyn Kom 2.1 (2009, 157pp) — SIL 99663; adapted into Bafut and Oku",
    textKom: null,
    textEn: null,
    activities: [
      { type: "retelling", prompt: "Retell a folktale you know at home in Kom, one sentence at a time.", promptFr: "Raconte en kom un conte que tu connais, phrase par phrase." },
    ],
    audioStatus: "no audio (print pages pending clearance)", reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "school",
  },

  // ---------------- Stage 4 — Numeracy & proverbs ----------------
  {
    id: "PR-S4-U1",
    stage: 4, stageName: STAGES[4],
    titleKom: "Ŋwàʼlɨ̀ àkòyn 1", titleEn: "Kom arithmetic book 1 — counting",
    source: "Ŋwàʼlɨ̀ àkòyn 1 (1993, 80pp) — SIL 33013",
    textKom: null,
    textEn: null,
    activities: [
      { type: "counting", prompt: "Count seeds 1–10 in Kom during the school-garden DIY.", promptFr: "Compte des graines de 1 à 10 en kom au jardin scolaire." },
    ],
    audioStatus: "no audio (print pages pending clearance)", reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "school",
  },
  {
    id: "PR-S4-U2",
    stage: 4, stageName: STAGES[4],
    titleKom: "Mɨ̀ŋwè mɨ̀ Kòm", titleEn: "Kom proverbs — proverb corner",
    source: "Proverb corpus pending — awaiting printed collection clearance",
    textKom: null,
    textEn: null,
    activities: [
      { type: "retelling", prompt: "Ask a grandparent for one Kom proverb and its meaning; bring it to class.", promptFr: "Demande un proverbe kom à tes grands-parents et son sens ; apporte-le en classe." },
    ],
    audioStatus: "no audio", reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "communication",
  },

  // ---------------- Stage 5 — NT narratives ----------------
  {
    id: "PR-S5-U1",
    stage: 5, stageName: STAGES[5],
    titleKom: "Mark 1 — Ŋwàʼlɨ̀ mɨ̀ Mark", titleEn: "Mark 1 — the voice in the wilderness",
    source: "Kom New Testament (2004) — find.bible BKMBSC; audio: bible.is / Digital Bible Library",
    textKom: null,
    textEn: null,
    activities: [
      { type: "comprehension", prompt: "Listen to Mark 1 at the listening station, then answer: who speaks in the desert?", promptFr: "Écoute Marc 1 à la station d'écoute : qui parle dans le désert ?" },
      { type: "vocab", prompt: "Extract five Kom words you recognized from the reading.", promptFr: "Note cinq mots kom reconnus à la lecture." },
      { type: "retelling", prompt: "Retell Mark 1:1–8 in five Kom sentences.", promptFr: "Raconte Marc 1:1–8 en cinq phrases kom." },
    ],
    audioStatus: "streaming audio via bible.is / Digital Bible Library (licence check in supervisor panel)",
    reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "communication",
  },
  {
    id: "PR-S5-U2",
    stage: 5, stageName: STAGES[5],
    titleKom: "Luke 15 — e-ghɔ̀ mɨ̀ nywɨ̀n", titleEn: "Luke 15 — the lost is found",
    source: "Kom New Testament (2004) — find.bible BKMBSC",
    textKom: null,
    textEn: null,
    activities: [
      { type: "comprehension", prompt: "Listen to Luke 15. What three things were lost?", promptFr: "Écoute Luc 15. Quelles trois choses étaient perdues ?" },
      { type: "retelling", prompt: "Act the story of the lost sheep with your group.", promptFr: "Jouez l'histoire de la brebis perdue en groupe." },
    ],
    audioStatus: "streaming audio via bible.is / Digital Bible Library",
    reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "communication",
  },
  {
    id: "PR-S5-U3",
    stage: 5, stageName: STAGES[5],
    titleKom: "John 3:16", titleEn: "John 3:16 — memory verse",
    source: "Kom New Testament (2004) — find.bible BKMBSC",
    textKom: null,
    textEn: null,
    activities: [
      { type: "comprehension", prompt: "Copy John 3:16 from the reading link and mark every tone mark.", promptFr: "Copie Jean 3:16 depuis le lien et entoure chaque tonème." },
    ],
    audioStatus: "streaming audio via bible.is / Digital Bible Library",
    reviewStatus: "AWAITING_CONTENT", classBand: "3", ilt: "communication",
  },
];

export const PRIMER_LADDER = [
  { stage: 1, book: "Ghesɨ̀nà Yeʼi Itaŋikom 1", focus: "Alphabet", sil: "90620 / 33384" },
  { stage: 2, book: "Ghesɨ̀nà Yeʼi Itaŋikom 2", focus: "Dialogues", sil: "33002" },
  { stage: 3, book: "Yêm Woyn Kom 1", focus: "Folk tales", sil: "99662" },
  { stage: 4, book: "Ŋwàʼlɨ̀ àkòyn 1", focus: "Proverbs & numeracy", sil: "33013" },
  { stage: 5, book: "Kom New Testament", focus: "Narratives", sil: "BKMBSC (find.bible)" },
] as const;
