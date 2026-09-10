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
 * v4.0 — generates the EXTENDED lesson per §4.3 (Lesson Extension Generator):
 * digital lesson component (Kokoro natural voice hook, 3-5 interactive phases,
 * multilingual EN/FR/Kom/Lamnso'), DIY Practical component (locally available
 * materials, 3-5 steps with voice guidance, assessment criteria, safety),
 * Voice Practice component (speech-to-speech scenarios, pronunciation + tone
 * accuracy evaluation, progressive difficulty) — output per the v4.0
 * extended lesson schema (§4.2) on top of the §7.3 plan format.
 * body: { subject, stage, iltId?, week?, language }
 * returns: { lesson_plan: <§7.3 format + extended_lesson v4.0> }
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
  native_speaker_review: string (one of 'validated' | 'pending' — Grassfields text requires native-speaker validation per Directive 9) }
Rules:
1. EXTENDED LESSON REQUIREMENTS (v4.0 §4.3): (a) Digital Lesson — natural Kokoro voice hook with a character, 3-5 interactive phases, multilingual EN/FR/Kom/Lamnso' (the voice_assets + activities you generate ARE the digital component); (b) DIY Practical — generated in a companion call with locally available materials, 3-5 steps with voice guidance and safety; (c) Voice Practice — the sts_scenario you generate becomes the speech-to-speech practice with pronunciation/tone/fluency evaluation; make the description progressive. The platform assembles the final §4.2 extended_lesson JSON from these blocks.
2. 3-5 practice_prompts with simple ASR targets. For any Grassfields prompt use ONLY well-attested GACL-compliant phrases (letters ɛ ɔ ŋ ɨ ʉ ə, tone diacritics on syllable centers: Kom low tone à, falling â, high unmarked; vowel length as gemination). Common anchors: Kom "À bwɛ̀" (good morning), "Bɛ̀ŋ" (thank you), "Nà wù dà?" (how are you?), "M̀ bɛ̀" (I am fine); Lamnso' "Mbi̶ vǝ̀" (good morning), "Bíŋ" (thank you), "Wù yé dì?" (how are you?), "Mǝ̀ yé" (I am fine). If unsure of a translation, omit the bkm/lns fields rather than invent.
3. Every Grassfields interaction must list "tone_accuracy" in evaluation_criteria.
4. offline_capability.grassfields_language_packs: bkm="kom_language_pack_50mb.zip", lns="lamnso_language_pack_50mb.zip".
5. ${language === "fr" ? "Write learner-facing text in French; keep English where the subject is English." : "Write learner-facing text in simple English; keep French translations in the Fr fields."} Age-appropriate for the requested level. Cultural examples from Cameroon (Douala, Yaoundé, Wouri river, Bamenda, Garoua, egusi, fufu, achu, calabashes, markets) and North West Grassfields contexts for language content.
6. Reference metadata: Kom (${komInfo?.division}, ${komInfo?.speakers}); Lamnso' (${lamnsoInfo?.division}, ${lamnsoInfo?.speakers}).
7. STRICT JSON: every key and every string value MUST be double-quoted ("duration": "8 min", "total_xp": 100). Never write bare values like 5-10 min, speech_to_speech unquoted, or trailing commas. No comments, no markdown.`;

    const user = `Create a lesson plan for: subject=${subjectName}; level=${STAGE_LABELS[stage] || stage}; integrated_learning_theme=${ilt?.nameEn || "The Home"}; week=${week}. ${schemeInfo} The plan must directly implement the curriculum contents and expected learning outcomes listed.`;

    const zai = await getZAI();
    const extractJson = (raw: string): string => {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      return cleaned.slice(start, end + 1);
    };
    const parseJson = (raw: string): unknown => JSON.parse(extractJson(raw));

    const chatCall = async (messages: Array<{ role: "user" | "assistant" | "system"; content: string }>) =>
      zai.chat.completions.create({ messages, thinking: { type: "disabled" }, max_tokens: 8192 });

    let parsed: unknown;
    try {
      const completion = await chatCall([
        { role: "system", content: system },
        { role: "user", content: user },
      ]);
      parsed = parseJson(completion?.choices?.[0]?.message?.content || "");
    } catch (firstError) {
      // One-shot JSON repair pass — the LLM occasionally emits a syntax slip
      // in deeply nested blocks; ask it to re-emit strictly valid JSON.
      console.warn("Lesson plan JSON repair pass:", firstError instanceof Error ? firstError.message : firstError);
      const completion = await chatCall([
        { role: "system", content: system },
        { role: "user", content: user },
      ]);
      const firstAttempt = completion?.choices?.[0]?.message?.content || "";
      const repair = await chatCall([
        { role: "system", content: "You fix broken JSON. Return ONLY the corrected, strictly valid JSON — no markdown, no comments, double-quoted keys and string values, no trailing commas." },
        { role: "user", content: `Fix this JSON (same content, valid syntax only):\n${extractJson(firstAttempt)}` },
      ]);
      parsed = parseJson(repair?.choices?.[0]?.message?.content || firstAttempt);
    }

    // ---- v4.0 §4.3 companion generation — DIY Practical block (spec §III):
    // a compact, focused call so the deep nesting of the plan never pushes
    // the DIY block past the output budget.
    const parsedObj = parsed as Record<string, unknown>;
    const planObj = (parsedObj.lesson_plan && typeof parsedObj.lesson_plan === "object"
      ? parsedObj.lesson_plan
      : parsedObj) as Record<string, unknown> & {
      lesson_id?: string; sts_scenario?: { description?: string; descriptionFr?: string; character?: string };
      gamification?: { badge_name?: string }; diy_lesson?: Record<string, unknown>;
      didactic_materials?: { physical?: string[] };
      sub_theme?: string;
    };
    const diySystem = `You design hands-on DIY Practical activities (OMNIVOICE v4.0 §III: Practical DIY Learning) for Cameroonian primary learners, using locally available materials. Respond ONLY with valid JSON (double-quoted keys and strings, no markdown): {"title": string, "titleFr": string, "objective": string, "materials_required": string[] (locally available: paper, sticks, bottle caps, clay, natural dyes), "materials_optional": string[], "steps": [{"instruction": string, "voice_guide": string (short spoken guide), "duration": string}] (exactly 4 steps), "safety": string[] (adult supervision / sharp objects / water), "method": "Parent/teacher observation", "extension": string, "photo_challenge": string}`;
    const diyUser = `Design the DIY Practical for: subject=${subjectName}; level=${STAGE_LABELS[stage] || stage}; ILT=${ilt?.nameEn || "The Home"}; sub-theme=${String(planObj.sub_theme || subjectName)}; week=${week}. It must reinforce the digital lesson through physical making.`;
    try {
      const diyRes = await chatCall([
        { role: "system", content: diySystem },
        { role: "user", content: diyUser },
      ]);
      planObj.diy_lesson = parseJson(diyRes?.choices?.[0]?.message?.content || "") as Record<string, unknown>;
    } catch (diyError) {
      console.warn("DIY generation fallback:", diyError instanceof Error ? diyError.message : diyError);
      // §3.2 framework fallback — mathematics/language defaults keep the
      // three-component structure intact even if the companion call fails.
      planObj.diy_lesson = {
        title: "Hands-on Practical",
        titleFr: "Pratique Manuelle",
        objective: `Reinforce ${subjectName} learning through making`,
        materials_required: planObj.didactic_materials?.physical || ["Paper", "Sticks", "Markers"],
        materials_optional: [],
        steps: [1, 2, 3, 4].map((n) => ({
          instruction: `Practical step ${n} of the activity`,
          voice_guide: `Step ${n}: build it with your own hands!`,
          duration: "5 min",
        })),
        safety: ["Adult supervision for scissors and water activities"],
        method: "Parent/teacher observation",
        extension: "Teach the activity to a family member",
        photo_challenge: "Photograph your finished work!",
      };
    }

    // ---- v4.0 §4.2 — assemble the extended_lesson server-side from the
    // generated blocks (digital plan + diy_lesson + sts_scenario). The exact
    // §4.2 JSON (total_xp 100, badges trio, streak_bonus 20) is built
    // deterministically so the response can never truncate mid-structure.
    {
      const diy = planObj.diy_lesson as
        | { title?: string; titleFr?: string; objective?: string; materials_required?: string[]; steps?: Array<{ instruction?: string; duration?: string }>; method?: string }
        | undefined;
      const badged = planObj.gamification?.badge_name || "Lesson Badge";
      const subjectCode = String(planObj.subject || subject).slice(0, 3).toLowerCase();
      (planObj as Record<string, unknown>).extended_lesson = {
        lesson_id: planObj.lesson_id || `${subjectCode}_generated_w${week}`,
        title: planObj.sub_theme || subjectName,
        components: {
          digital: {
            duration: "8 min",
            phases: (planObj.activities as Array<{ phase?: string }> | undefined)?.map((a) => a.phase).filter(Boolean)
              || ["Voice Hook", "Listen & Learn", "Speak & Practice", "Apply & Create", "Celebrate"],
            voice_assets: {
              hook: `${planObj.lesson_id || "generated"}_hook_${planObj.voice_assets && (planObj.voice_assets as { hook?: { character?: string } }).hook?.character || "kwe"}.mp3`,
              instruction: `${planObj.lesson_id || "generated"}_instr.mp3`,
              celebration: "makossa_short_celebration.mp3",
            },
          },
          diy: diy
            ? {
                duration: "20 min",
                title: diy.title || "Hands-on practical",
                materials: diy.materials_required || planObj.didactic_materials?.physical || [],
                steps: Array.isArray(diy.steps) ? diy.steps.length : 4,
                assessment: diy.method || "Parent/teacher observation",
              }
            : { duration: "20 min", title: "Hands-on practical", materials: planObj.didactic_materials?.physical || [], steps: 4, assessment: "Parent/teacher observation" },
          voice_practice: {
            duration: "7 min",
            mode: "speech_to_speech",
            character: planObj.sts_scenario?.character || "kwe",
            scenarios: [planObj.sts_scenario?.description || `Talk about ${subjectName}`].filter(Boolean),
            scenariosFr: [planObj.sts_scenario?.descriptionFr || `Parle de ${subjectName}`].filter(Boolean),
            evaluation: { pronunciation: true, tone_accuracy: true, fluency: true },
          },
        },
        gamification: { total_xp: 100, badges: [badged, "Voice Champion"], streak_bonus: 20 },
        diy_lesson: planObj.diy_lesson,
      };
    }
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lesson plan generation failed";
    console.error("Lesson plan error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
