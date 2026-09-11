/**
 * OMNIVOICE v4.2 — KomToneEngine (§6.1 Resource Integration Spec)
 *
 * Implements Hyman (UC Berkeley) "Initial Vowel and Prefix Tone in Kom"
 * tone system for tone-aware pronunciation evaluation:
 *
 *   - 3-tone orthographic notation (GACL): H = unmarked vowel,
 *     L = grave (à), F = falling circumflex (â)
 *   - Scholarly-print conventions tolerated: acute (á) read as H,
 *     macron (ā) read as M (surface Mid), ring above (å) as L˚
 *   - HTS — High Tone Spreading: prefix H spreads onto a following L/LH
 *     stem, creating HL→F falling contours (Hyman: /fè-ghàm/ → fè-ghâm 'mat')
 *   - LTS — L Tone Spreading: a preceding L-toned word (e.g. nè 'with')
 *     spreads rightward and delinks prefixal H (nè fè-tám-fé 'with a fruit')
 *   - M-tone rule: prefixal H lowers to surface M late in the derivation
 *   - Pre-pausing L˚: level unreleased L before pause
 *
 * evaluate() returns the stipulated §6.1 shape:
 *   { tone_accuracy, segmental_accuracy, overall_accuracy (40/60),
 *     tone_feedback, tone_rules_applied }
 *
 * overall_accuracy = 40% segmental + 60% tonal (tone-first pedagogy).
 */

/**
 * Canonical comparison classes:
 *   U = unmarked (surface H or prefixal M — GACL writes both plain)
 *   L = low (grave)
 *   F = falling (circumflex)
 */
export type KomToneClass = "U" | "L" | "F";

export interface ToneBearingUnit {
  /** base vowel letter (a e ɛ i ɨ o ɔ u ʉ ə) */
  vowel: string;
  tone: KomToneClass;
  /** index of the vowel within its word */
  position: number;
  /** word index in the phrase */
  word: number;
}

/** Combining diacritics that map onto the Kom tone system */
const GRAVE = "\u0300";
const ACUTE = "\u0301";
const CIRCUMFLEX = "\u0302";
const MACRON = "\u0304";
const RING_ABOVE = "\u030A";

/** Kom vowel letters (GACL incl. ə ɛ ɨ ɔ ʉ) */
const KOM_VOWELS = /^[aɛeiɪɨoɔuʉəə̑]$/i;

function classifyTone(diacritics: string): KomToneClass {
  if (diacritics.includes(CIRCUMFLEX)) return "F";
  if (diacritics.includes(GRAVE) || diacritics.includes(RING_ABOVE)) return "L";
  if (diacritics.includes(MACRON)) return "U"; // scholarly M print → written unmarked in GACL
  if (diacritics.includes(ACUTE)) return "U";  // scholarly H print → written unmarked in GACL
  return "U"; // GACL: high is unmarked
}

/** Parse a Kom phrase into tone-bearing units (one per vowel nucleus) */
export function analyzeKomTones(text: string): ToneBearingUnit[] {
  const words = text.normalize("NFC").split(/\s+/).filter(Boolean);
  const tbus: ToneBearingUnit[] = [];
  words.forEach((word, wi) => {
    const decomposed = word.normalize("NFD");
    let position = -1;
    for (const ch of decomposed) {
      if (KOM_VOWELS.test(ch.normalize("NFC"))) {
        position += 1;
        tbus.push({ vowel: ch.normalize("NFC").toLowerCase(), tone: "U", position, word: wi });
      } else if (/[\u0300-\u036F]/.test(ch) && tbus.length > 0) {
        // diacritic attaches to the most recent vowel
        const extra = classifyTone(ch);
        const prev = tbus[tbus.length - 1];
        if (extra !== "U") prev.tone = extra;
        // acute/macron after another mark → keep the stronger (contour) mark
      }
    }
  });
  return tbus;
}

const TONE_LABEL: Record<KomToneClass, string> = {
  U: "high/mid (unmarked)",
  L: "low (à)",
  F: "falling (â)",
};

/** NFD → drop ALL combining marks → NFC → lowercase → unify separators/glottals */
function normalizeSegmental(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u02BC\u2019]/g, "\u0294") // ʼ → ʔ (glottal stop, contrastive — kept)
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface KomToneEvaluation {
  tone_accuracy: number;
  segmental_accuracy: number;
  overall_accuracy: number;
  tone_feedback: string[];
  tone_rules_applied: string[];
  tone_bearing_units: { target: ToneBearingUnit[]; heard: ToneBearingUnit[] };
  tone_errors: number;
  tone_total: number;
}

function levenshteinOps(a: string, b: string): Array<{ op: "match" | "sub" | "ins" | "del"; ai: number; bi: number }> {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  // backtrack
  const ops: Array<{ op: "match" | "sub" | "ins" | "del"; ai: number; bi: number }> = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      ops.push({ op: a[i - 1] === b[j - 1] ? "match" : "sub", ai: i - 1, bi: j - 1 });
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ op: "del", ai: i - 1, bi: j });
      i--;
    } else {
      ops.push({ op: "ins", ai: i, bi: j - 1 });
      j--;
    }
  }
  return ops.reverse();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}

export class KomToneEngine {
  /**
   * Derive the surface tone pattern of an orthographic target, listing which
   * Hyman rules account for it (HTS / LTS / M-tone / L˚).
   */
  deriveExpected(target: string): { tbus: ToneBearingUnit[]; rulesApplied: string[] } {
    const words = target.normalize("NFC").split(/\s+/).filter(Boolean);
    const tbus = analyzeKomTones(target);
    const rulesApplied: string[] = [];

    words.forEach((word, wi) => {
      const wTbus = tbus.filter((t) => t.word === wi);
      if (wTbus.length === 0) return;
      const [first, second] = wTbus;

      // HTS: prefix H + stem-initial L → falling contour on stem-initial TBU
      if (wTbus.length >= 2 && first.tone === "U" && second.tone === "F") {
        rulesApplied.push(`HTS (High Tone Spreading): ${word} — prefix H spreads onto the L stem, surface falling on TBU 2`);
      }
      // LTS: an L-toned function word (nè 'with', nɛ̀ 'and'…) delinks the H of the next word's prefix
      if (wi > 0) {
        const prevWord = tbus.filter((t) => t.word === wi - 1);
        const prevAllL = prevWord.length > 0 && prevWord.every((t) => t.tone === "L");
        if (prevAllL && first.tone === "U" && wTbus.length >= 2) {
          rulesApplied.push(`LTS (L Tone Spreading): preceding low word spreads into ${word}, delinking prefixal H`);
        }
      }
      // M-tone: prefixal H surfaces as M when no spreading context applies (unmarked in GACL print)
      if (wTbus.length >= 2 && first.tone === "U" && second.tone === "U") {
        rulesApplied.push(`M-tone rule: ${word} — prefixal H lowers to surface M (written unmarked)`);
      }
    });

    // Pre-pausing L˚ on final TBU
    const last = tbus[tbus.length - 1];
    if (last && last.tone === "L") {
      rulesApplied.push("Pre-pausing L˚: phrase-final low may surface unreleased before pause");
    }
    if (tbus.some((t) => t.tone === "F")) {
      rulesApplied.push("Surface contour inventory: falling (â) contours are robustly attested; rising (MH/LM) are marginal");
    }
    if (rulesApplied.length === 0) rulesApplied.push("Base realization: all-H pattern, no spreading context detected");
    return { tbus, rulesApplied };
  }

  /**
   * §6.1 evaluate() — tone-aware pronunciation evaluation for Kom.
   * overall_accuracy = 40% segmental + 60% tonal.
   */
  evaluate(transcription: string, target: string): KomToneEvaluation {
    const segA = normalizeSegmental(transcription);
    const segB = normalizeSegmental(target);
    const seg = levenshtein(segA, segB);
    const segLen = Math.max(segA.length, segB.length, 1);
    const segmental_accuracy = Math.round(Math.max(0, 1 - seg / segLen) * 100);

    const targetTbus = analyzeKomTones(target);
    const heardTbus = analyzeKomTones(transcription);

    // Align TBU sequences via vowel-string edit distance
    const tv = targetTbus.map((t) => t.vowel).join("");
    const hv = heardTbus.map((t) => t.vowel).join("");
    const ops = levenshteinOps(tv, hv);

    const toneFeedback: string[] = [];
    let toneMatches = 0;
    let toneComparisons = 0;
    let errorCount = 0;

    for (const o of ops) {
      if (o.op === "ins") {
        const h = heardTbus[o.bi];
        toneComparisons += 1;
        errorCount += 1;
        toneFeedback.push(`Extra tone-bearing unit heard: "${h.vowel}" (${TONE_LABEL[h.tone]}) — not in the target word.`);
        continue;
      }
      if (o.op === "del") {
        const t = targetTbus[o.ai];
        toneComparisons += 1;
        errorCount += 1;
        toneFeedback.push(`Missing tone-bearing unit: target "${t.vowel}" (${TONE_LABEL[t.tone]}) was not heard.`);
        continue;
      }
      const t = targetTbus[o.ai];
      const h = heardTbus[o.bi];
      toneComparisons += 1;
      // M-tone tolerance (Hyman): word-initial prefixal L surfaces as M —
      // an unmarked heard vowel on a multi-TBU word's first TBU is correct.
      if (t.position === 0 && t.tone === "L" && h.tone === "U") {
        toneMatches += 1;
        toneFeedback.push(`TBU 1 "${t.vowel}": prefixal low correctly realized mid (M-tone rule) — written unmarked.`);
        continue;
      }
      if (t.tone === h.tone) {
        toneMatches += 1;
        if (t.tone === "F") {
          toneFeedback.push(`TBU ${t.position + 1} "${t.vowel}": falling tone correct — HTS contour maintained.`);
        }
      } else {
        errorCount += 1;
        toneFeedback.push(
          `TBU ${t.position + 1} "${t.vowel}": expected ${TONE_LABEL[t.tone]}, heard ${TONE_LABEL[h.tone]}.`
        );
      }
    }

    const tone_accuracy = toneComparisons === 0 ? 0 : Math.round((toneMatches / toneComparisons) * 100);
    const overall_accuracy = Math.round(segmental_accuracy * 0.4 + tone_accuracy * 0.6);

    const { rulesApplied } = this.deriveExpected(target);

    if (tone_accuracy === 100 && segmental_accuracy >= 80) {
      toneFeedback.unshift("Excellent — all tone-bearing units match the target pattern (H/L/F all correct).");
    } else if (tone_accuracy >= 60) {
      toneFeedback.unshift("Good segmentals — focus on the marked tone positions listed below.");
    } else if (toneComparisons > 0) {
      toneFeedback.unshift("Listen again for the tone pattern: high = plain vowel, low = à, falling = â.");
    }

    return {
      tone_accuracy,
      segmental_accuracy,
      overall_accuracy,
      tone_feedback: toneFeedback,
      tone_rules_applied: rulesApplied,
      tone_bearing_units: { target: targetTbus, heard: heardTbus },
      tone_errors: errorCount,
      tone_total: toneComparisons,
    };
  }
}

export const komToneEngine = new KomToneEngine();
