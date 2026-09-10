import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/server/voice";

export const maxDuration = 60;

/**
 * POST /api/stt — Speech-to-Text (Master Prompt 3.1.1)
 * body: { audioBase64: string (WAV) }
 * returns: { text }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body.audioBase64 || "";
    if (!audio) return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    const clean = audio.includes(",") ? audio.split(",")[1] : audio;
    const text = await transcribeAudio(clean);
    return NextResponse.json({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "STT failed";
    console.error("STT error:", msg);
    return NextResponse.json({ error: msg, text: "" }, { status: 502 });
  }
}
