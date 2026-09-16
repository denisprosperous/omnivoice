// Strips the invented "ewo" UI strings from i18n.ts (trusted-sources policy:
// those Ewondo words were never attested by an ingested trusted source).
// Keeps Lang = "en" | "fr"; t() falls back to English.
const fs = require("fs");
const path = "/home/z/my-project/src/lib/i18n.ts";
let src = fs.readFileSync(path, "utf8");

// Remove `, ewo: "..."` occurrences (values contain no double quotes; they may contain accents/!/?).
const before = (src.match(/, ewo: "[^"]*"/g) || []).length;
src = src.replace(/, ewo: "[^"]*"/g, "");

// Retype the strings table + Lang union + t()
src = src.replace(
  'export const STRINGS: Record<string, { en: string; fr: string; ewo: string }> = {',
  'export const STRINGS: Record<string, { en: string; fr: string }> = {'
);
src = src.replace('export type Lang = "en" | "fr" | "ewo";', 'export type Lang = "en" | "fr";');
src = src.replace(
  'if (lang === "fr") return entry.fr;\n  if (lang === "ewo") return entry.ewo;\n  return entry.en;',
  'if (lang === "fr") return entry.fr;\n  return entry.en;'
);
src = src.replace(
  '// i18n — English / Français / Ewondo (national language) UI strings\n// Language Support per Master Prompt 5.3: English, French, National Languages',
  '// i18n — English / Français UI strings.\n// TRUSTED-SOURCES POLICY: the interface ships in English and French only.\n// National languages (Kom, Ewondo, Lamnso\', …) are selected as the LEARNING\n// (voice) language via the national-language dropdown — see grassfields.ts.\n// Invented Ewondo UI strings were removed; Ewondo phrases can only enter\n// through the Content Ingestion portal from native speakers.'
);
fs.writeFileSync(path, src);
console.log(`Removed ${before} ewo strings. Lang union + t() updated.`);
