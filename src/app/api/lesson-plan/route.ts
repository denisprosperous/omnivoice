import { NextRequest, NextResponse } from "next/server";
import { getZAI } from "@/lib/server/voice";
import { db } from "@/lib/db";
import { GRASSFIELDS_LANGUAGES } from "@/lib/data/grassfields";

export const maxDuration = 120;

const STAGE_LABELS: Record<string, string> = {
  kg: "Kindergarten (KG, ages 3-5, ISCED 0)", class1: "Class 1", class2: "Class 2", class3: "Class 3",
  class4: "Class 4", class5: "Class 5", class6: "Class 6", form1: "Form 1", form2: "Form 2",
  form3: "Form 3", form4: "Form 4", form5: "Form 5", "lower-sixth": "Lower Sixth", "upper-sixth": "Upper Sixth",
};

/**
 * POST /api/lesson-plan — Lesson Plan Generator (Core MVP Feature, Master v2.0 §5.3)
 * Generates a Voice-Enabled Gamified Lesson Plan in the exact §7.3 v2.0 JSON
 * format for ANY level KG→High School, aligned to the Cameroon curriculum +
 * CEFR/IB, with multilingual voice assets (en/fr/bkm/lns), GACL-compliant
 * Grassfields content (Directive 9), tone-aware ASR criteria and offline
 * Grassfields language packs.
 * body: { subject, stage, iltId?, week?, language }
 * returns: { lesson_plan: <§7.3 v2.0 format> }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subject: string = body.subject || "english";
    const stage: string = body.stage || "class3";
    const week: number = Number(body.week) || 1;
    const language: string = body.language || "en";

    const subjectRow = await db.subject.findUnique({ where: { id: subject } });
    const scheme = await db.schemeWeek.findFirst({ where: { subjectId: subject, stage: "class3", week } });
    const ilt = await db.iLT.findFirst({ where: { id: body.iltId || "the-home" } });

    const schemeInfo = scheme
      ? `Reference scheme of work (Class 3, Month 1, Week ${week}): components=${scheme.components}; contents=${scheme.contents}; expected learning outcomes=${scheme.outcomes}.`
      : "";
    const subjectName = subjectRow?.nameEn || subject;
    const komInfo = GRASSFIELDS_LANGUAGES.find((l) => l.code === "bkm");
    const lamnsoInfo = GRASSFIELDS_LANGUAGES.find((l) => l.code === "lns");

    const system = `You are an Expert Educational Technologist, Curriculum Developer, Gamification Designer, Voice Experience Architect, and Grassfields Language Specialist specializing in the Cameroon Primary Education System (Competence-Based Approach, MINEDUB) and international frameworks (IB PYP/MYP/DP, Cambridge, CEFR). Generate a Voice-Enabled Gamified Lesson Plan rooted in Cameroonian culture (names, foods, regions, proverbs — Bikutsi, Makossa, Balafon, Talking Drum). Respond ONLY with valid JSON, no markdown fences, matching this TypeScript type (Master Prompt v2.0 §7.3 format):
{ lesson_plan: {
  subject: string, level: string, isced_level: number, integrated_learning_theme: string, sub_theme: string, week: number,
  cefr_alignment: string, ib_learner_profile: string[], supported_languages: string[] (use ["en","fr","bkm","lns"]),
  expected_learning_outcomes: string[], teaching_strategies: string[],
  didactic_materials: { physical: string[], digital: string[] },
  voice_assets: {
    hook: { character: 'kwe'|'mbi'|'ngo'|'kong', text: string (English), textFr: string, textBkm: string, textLns: string, languages: ["en","fr","bkm","lns"] },
    instruction: { text: string, textFr: string, textBkm: string, textLns: string },
    learn_content: { title: string, titleFr: string, lines: string[], linesFr: string[], visual: string },
    practice_prompts: Array<{ prompt: string, promptFr: string, promptBkm?: string, promptLns?: string, target: string, targetBkm?: string, targetLns?: string, evaluation: string, kind?: 'repeat'|'answer'|'count'|'open' }>,
    feedback: { correct: string, incorrect: string, encouragement: string },
    celebration: { character: string, text: string, textFr: string },
    background_music: string },
  voice_interactions: Array<{ type: string, prompt: string, asr_target: string, evaluation_criteria: string[] }>,
  sts_scenario: { description: string, descriptionFr: string, character: string, opener: string },
  gamification: { mechanics: string[] (at least 2), xp_points: number, badge_name: string, badge_code: string, voice_challenge: { description: string, descriptionFr: string, descriptionBkm: string, descriptionLns: string, evaluation: string } },
  activities: Array<{ phase: 'Voice Hook'|'Listen & Learn'|'Speak & Practice'|'Apply & Create'|'Celebrate', duration: string, description: string, descriptionFr: string }>,
  assessment: { criteria: string[] (include 'Tone accuracy (Grassfields)' when Grassfields practice present), methods: string[] },
  offline_capability: { downloadable: boolean, size_mb: number, components: string[], grassfields_language_packs: { bkm: string, lns: string } },
  differentiation: string[], cultural_notes: string, cultural_notesFr: string,
  native_speaker_review: string (one of 'validated' | 'pending' — Grassfields text requires native-speaker validation per Directive 9) } }
Rules:
1. 3-5 practice_prompts with simple ASR targets. For any Grassfields prompt use ONLY well-attested GACL-compliant phrases (letters ɛ ɔ ŋ ɨ ʉ ə, tone diacritics on syllable centers: Kom low tone à, falling â, high unmarked; vowel length as gemination). Common anchors: Kom "À bwɛ̀" (good morning), "Bɛ̀ŋ" (thank you), "Nà wù dà?" (how are you?), "M̀ bɛ̀" (I am fine); Lamnso' "Mbi̶ vǝ̀" (good morning), "Bíŋ" (thank you), "Wù yé dì?" (how are you?), "Mǝ̀ yé" (I am fine). If unsure of a translation, omit the bkm/lns fields rather than invent.
2. Every Grassfields interaction must list "tone_accuracy" in evaluation_criteria.
3. offline_capability.grassfields_language_packs: bkm="kom_language_pack_50mb.zip", lns="lamnso_language_pack_50mb.zip".
4. ${language === "fr" ? "Write learner-facing text in French; keep English where the subject is English." : "Write learner-facing text in simple English; keep French translations in the Fr fields."} Age-appropriate for the requested level. Cultural examples from Cameroon (Douala, Yaoundé, Wouri river, Bamenda, Garoua, egusi, fufu, achu, calabashes, markets) and North West Grassfields contexts for language content.
5. Reference metadata: Kom (${komInfo?.division}, ${komInfo?.speakers}); Lamnso' (${lamnsoInfo?.division}, ${lamnsoInfo?.speakers}).`;

    const user = `Create a lesson plan for: subject=${subjectName}; level=${STAGE_LABELS[stage] || stage}; integrated_learning_theme=${ilt?.nameEn || "The Home"}; week=${week}. ${schemeInfo} The plan must directly implement the curriculum contents and expected learning outcomes listed.`;

    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      thinking: { type: "disabled" },
    });

    let raw: string = completion?.choices?.[0]?.message?.content || "";
    raw = raw.replace(/```json|```/g, "").trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lesson plan generation failed";
    console.error("Lesson plan error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
