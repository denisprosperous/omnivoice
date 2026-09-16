"use client";
// ============================================================================
// useLanguageRegistry — DYNAMIC language registry (v4.2 trusted-sources build).
// Merges the static national-language matrix (grassfields.ts) with
// community-registered drafts (LanguageDraft DB model via /api/languages), so
// a language added in the Registry Console appears in EVERY picker — HUD,
// Landing, Profile, Teacher, Library — exactly as the console promises.
// ============================================================================
import { create } from "zustand";
import { GRASSFIELDS_LANGUAGES } from "@/lib/data/grassfields";

export interface RegistryLanguage {
  code: string;
  name: string;
  nativeName: string;
  iso: string;
  region: string;
  division: string;
  speakers: string;
  tones: string;
  priority: string;
  status: "ACTIVE" | "ACTIVE_PLACEHOLDER" | "PLANNED" | "DRAFT" | "IN_REVIEW";
  contentLibrary: { vocabulary: number; dialogues: number; songs: number; stories: number };
  flag: string;
  /** true when the entry comes from a community LanguageDraft (DB) */
  isDraft?: boolean;
}

interface RegistryState {
  languages: RegistryLanguage[];
  drafts: Array<Record<string, string>>;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const STATIC_LANGUAGES: RegistryLanguage[] = GRASSFIELDS_LANGUAGES.map((l) => ({
  code: l.code,
  name: l.name,
  nativeName: l.nativeName,
  iso: l.iso,
  region: l.region,
  division: l.division,
  speakers: l.speakers,
  tones: l.tones,
  priority: l.priority,
  status: l.status,
  contentLibrary: l.contentLibrary,
  flag: l.flag,
}));

export const useLanguageRegistry = create<RegistryState>()((set) => ({
  languages: STATIC_LANGUAGES,
  drafts: [],
  loaded: false,
  loading: false,
  error: null,
  reload: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/languages");
      if (!res.ok) throw new Error(`registry fetch failed (${res.status})`);
      const data = await res.json();
      const drafts = (data.drafts || []) as Array<Record<string, string>>;
      // Merge: static first (ACTIVE → planned), then community drafts.
      const draftLanguages: RegistryLanguage[] = drafts.map((d) => ({
        code: d.code,
        name: d.name || d.code,
        nativeName: d.nativeName || d.name || d.code,
        iso: d.iso || d.code,
        region: d.region || "",
        division: d.division || "",
        speakers: d.speakers || "",
        tones: d.tones || "Tonal (to be documented)",
        priority: d.priority || "MEDIUM",
        status: (d.status as RegistryLanguage["status"]) || "DRAFT",
        contentLibrary: { vocabulary: 0, dialogues: 0, songs: 0, stories: 0 },
        flag: "🪶",
        isDraft: true,
      }));
      set({
        languages: [...STATIC_LANGUAGES, ...draftLanguages.filter((d) => !STATIC_LANGUAGES.some((s) => s.code === d.code))],
        drafts,
        loaded: true,
        loading: false,
      });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : "registry fetch failed", loading: false, loaded: true });
    }
  },
}));
