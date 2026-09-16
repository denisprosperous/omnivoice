import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_VOICES, voicesForLang } from "@/lib/data/voices";

/**
 * GET /api/voices — platform voice registry (voice-selection feature).
 * Returns every available voice/speaker: recorded native audio (Kom NT
 * narrator + community slots) and Kokoro-82M synthetic voices for the EN/FR
 * interface. Grassfields languages are recorded-audio-only (Directive 9).
 *
 * `?lang=bkm` filters to voices that can speak that language.
 */
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang");
  const voices = lang ? voicesForLang(lang) : PLATFORM_VOICES;
  return NextResponse.json({
    registryVersion: "4.4",
    directive9:
      "No synthetic Grassfields speech: Kom/Lamnso'/Bayangi (+ other Grassfields and Ewondo) content plays REAL recorded audio only. Synthetic Kokoro voices serve the EN/FR interface and story characters.",
    total: voices.length,
    voices,
  });
}
