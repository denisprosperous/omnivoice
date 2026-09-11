/**
 * v4.2 Task 2 — KomToneEngine unit check against Hyman's attested patterns.
 * Attested bisyllabic noun patterns (Hyman §2.2):
 *   M-HL  fe-ghâm 'mat'   |  M-HM fe-nywɨ́n 'bird'  |  M-H fe-búʔ 'gorilla' / fe-tám 'fruit'
 */
import { komToneEngine } from "../src/lib/kom-tone-engine";

const cases: Array<[string, string, string]> = [
  // [transcription, target, expectation]
  ["fe gham", "fè-ghâm", "prefix M-tone tolerance + missing falling → tone 50"],
  ["fe gham", "fe-gham", "target unmarked (H) vs heard unmarked → 100 tone"],
  ["fe ghâm", "fè-ghâm", "surface-realized: prefix tolerant + falling match → 100"],
  ["fe ghàm", "fè-ghâm", "TBU2 L heard vs F target → tone error on TBU2"],
  ["nè fè-tám-fé", "nè fè-tám-fé", "LTS context — identical → 100"],
  ["fe nywɨn", "fe-nywɨ́n", "scholarly acute print read as H → match"],
];

for (const [heard, target, note] of cases) {
  const r = komToneEngine.evaluate(heard, target);
  console.log(`heard="${heard}" target="${target}"`);
  console.log(`  tone=${r.tone_accuracy} seg=${r.segmental_accuracy} overall=${r.overall_accuracy} errors=${r.tone_errors}/${r.tone_total}`);
  console.log(`  rules: ${r.tone_rules_applied.length} | ${note}`);
}
// structural check of stipulated shape
const shape = komToneEngine.evaluate("fe gham", "fè-ghâm");
const stipulated = ["tone_accuracy", "segmental_accuracy", "overall_accuracy", "tone_feedback", "tone_rules_applied"];
console.log("stipulated §6.1 fields present:", stipulated.every((k) => k in shape));
