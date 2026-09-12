"use client";
// ============================================================================
// NationalLanguageSelect — the national-language DROPDOWN MENU (user directive:
// "The National languages should appear as a drop down menu. Kom, Ewondo as
// well as others should be here."). Registry-driven: static matrix + community
// drafts via useLanguageRegistry, with honest status badges. Built on the
// shadcn Select for keyboard + mobile accessibility.
// ============================================================================
import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguageRegistry } from "@/lib/use-language-registry";
import { cn } from "@/lib/utils";

export function statusChip(status: string): { label: string; cls: string } {
  if (status === "ACTIVE") return { label: "Active", cls: "bg-lime-600 text-white" };
  if (status === "ACTIVE_PLACEHOLDER") return { label: "New", cls: "bg-orange-500 text-white" };
  if (status === "IN_REVIEW") return { label: "In review", cls: "bg-amber-500 text-white" };
  if (status === "DRAFT") return { label: "Draft", cls: "bg-sky-600 text-white" };
  return { label: "Planned", cls: "bg-stone-200 text-stone-600" };
}

export function NationalLanguageSelect({
  value,
  onChange,
  lang = "en",
  id,
  className,
  compact = false,
  includeInterfaceLanguages = false,
  allowPlaceholder = true,
}: {
  value: string;
  onChange: (code: string) => void;
  lang?: string;
  id?: string;
  className?: string;
  compact?: boolean;
  /** include English/Français at the top (used when the dropdown doubles as lesson language) */
  includeInterfaceLanguages?: boolean;
  /** render "(pending ingestion)" hint for languages with no content */
  allowPlaceholder?: boolean;
}) {
  const { languages, reload, loaded } = useLanguageRegistry();
  React.useEffect(() => { if (!loaded) void reload(); }, [loaded, reload]);

  const fr = lang === "fr";
  const interfaceLangs = [
    { id: "en", label: "English", flag: "🇬🇧", status: "ACTIVE" },
    { id: "fr", label: "Français", flag: "🇫🇷", status: "ACTIVE" },
  ];
  const active = languages.filter((l) => l.status === "ACTIVE" || l.status === "ACTIVE_PLACEHOLDER");
  const planned = languages.filter((l) => l.status === "PLANNED" || l.status === "DRAFT" || l.status === "IN_REVIEW");

  const renderLang = (l: { value: string; label: string; flag: string; status: string }) => {
    const chip = statusChip(l.status);
    return (
      <SelectItem key={l.value} value={l.value} className="py-2">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden>{l.flag}</span>
          <span className="truncate font-semibold">{l.label}</span>
          <span className={cn("ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase", chip.cls)}>{chip.label}</span>
        </span>
      </SelectItem>
    );
  };

  const toItem = (l: { code?: string; id?: string; name?: string; label?: string; flag: string; status: string }) => ({
    value: l.code ?? l.id ?? "",
    label: l.label ?? l.name ?? "",
    flag: l.flag,
    status: l.status,
  });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className={cn(
          "w-full rounded-xl border-2 border-lime-300 bg-white font-bold text-lime-950 hover:border-lime-500",
          compact ? "h-9 min-h-[36px] text-xs" : "h-12 min-h-[44px] text-sm",
          className
        )}
        aria-label={fr ? "Choisis la langue nationale" : "Choose the national language"}
      >
        <SelectValue placeholder={fr ? "Choisis une langue…" : "Choose a language…"} />
      </SelectTrigger>
      <SelectContent className="max-h-80 w-[min(20rem,80vw)] border-2 border-lime-300 bg-white">
        {includeInterfaceLanguages && (
          <SelectGroup>
            <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-amber-600">
              {fr ? "Langues d'interface" : "Interface languages"}
            </SelectLabel>
            {interfaceLangs.map((l) => renderLang(toItem(l)))}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-lime-700">
            🇨🇲 {fr ? "Langues nationales — prêtes" : "National languages — ready"}
          </SelectLabel>
          {active.map((l) => renderLang(toItem(l)))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-[10px] font-extrabold uppercase tracking-wide text-stone-500">
            {fr ? "En cours de documentation" : "Being documented"}
          </SelectLabel>
          {planned.map((l) => renderLang(toItem(l)))}
          {planned.length === 0 && (
            <div className="px-2 py-1.5 text-[11px] text-stone-500">{fr ? "Toutes les langues sont actives !" : "All languages are active!"}</div>
          )}
        </SelectGroup>
        {allowPlaceholder && (
          <p className="border-t border-lime-100 px-3 py-2 text-[10px] leading-snug text-stone-500">
            {fr
              ? "Les langues « en cours » apparaissent dès qu'une langue est ajoutée dans la Console du Registre ou qu'un contenu est validé."
              : "\"Being documented\" languages join as soon as they are added in the Registry Console or trusted content is approved."}
          </p>
        )}
      </SelectContent>
    </Select>
  );
}
