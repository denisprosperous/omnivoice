import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * GET /api/corpus — kom_training_corpus Knowledge-Base reader (spec Part 1/2.4).
 * Serves the corpus manifest and whitelisted corpus files to the platform UI.
 * Only files inside /kom_training_corpus are reachable; traversal is blocked.
 *
 * GET               → manifest summary (collections + counts + quality gates)
 * GET ?file=<path>  → parsed file content (json/jsonl → array)
 */
const CORPUS_ROOT = path.join(process.cwd(), "kom_training_corpus");

export async function GET(req: NextRequest) {
  try {
    const file = req.nextUrl.searchParams.get("file");
    if (!file) {
      const manifest = JSON.parse(await readFile(path.join(CORPUS_ROOT, "manifest.json"), "utf-8"));
      return NextResponse.json({ manifest });
    }
    const rel = path.normalize(file).replace(/^(\.\.[/\\])+/, "");
    if (!rel.endsWith(".json") && !rel.endsWith(".jsonl")) {
      return NextResponse.json({ error: "only .json/.jsonl corpus files are served" }, { status: 400 });
    }
    const full = path.join(CORPUS_ROOT, rel);
    if (!full.startsWith(CORPUS_ROOT)) {
      return NextResponse.json({ error: "path outside corpus" }, { status: 403 });
    }
    const raw = await readFile(full, "utf-8");
    if (rel.endsWith(".jsonl")) {
      const rows = raw.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
      return NextResponse.json({ file: rel, rows });
    }
    return NextResponse.json({ file: rel, data: JSON.parse(raw) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "corpus read failed";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
