import { NextRequest, NextResponse } from "next/server";
import { getZAI } from "@/lib/server/voice";

export const maxDuration = 60;

/**
 * POST /api/chat — LLM conversation (teacher assistant, STS text stage)
 * body: { messages: [{role, content}], system?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) return NextResponse.json({ error: "messages required" }, { status: 400 });
    const zai = await getZAI();
    const payload = body.system
      ? [{ role: "system", content: body.system }, ...messages]
      : messages;
    const completion = await zai.chat.completions.create({
      messages: payload,
      thinking: { type: "disabled" },
    });
    const reply = completion?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ reply });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Chat failed";
    console.error("Chat error:", msg);
    return NextResponse.json({ error: msg, reply: "" }, { status: 502 });
  }
}
