import { NextResponse } from "next/server";
import { LISTENING_STATIONS } from "@/lib/data/stations";

/**
 * GET /api/stations — Kom NT listening stations (v4.2 §6.4).
 * Real recorded audio via bible.is / Digital Bible Library access points;
 * comprehension + vocabulary extraction + retelling wired per station.
 */
export async function GET() {
  return NextResponse.json({
    total: LISTENING_STATIONS.length,
    licenceNote:
      "bible.is / Digital Bible Library streaming requires production licence clearance before classroom rollout (Directive: never synthesize scripture narration).",
    stations: LISTENING_STATIONS,
  });
}
