"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { ALL_COUNTRIES, COUNTRIES, getCountry } from "@/lib/data/countries";
import { DIAL_BY_ISO, dialCodeFor } from "@/lib/data/dial-codes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flag } from "@/components/shared/Flag";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Compact country-dialing-code picker for phone fields. Stores the ISO country
 * code (so the flag + exact country stay unambiguous even when dial codes are
 * shared, e.g. +1); the caller derives the dial string via `dialCodeFor`.
 */
export function DialCodeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const selected = getCountry(value);
  const dial = dialCodeFor(value);

  // Only countries that have a known dial code, priority markets first.
  const priority = COUNTRIES.filter((c) => c.priority && DIAL_BY_ISO[c.code]);
  const rest = ALL_COUNTRIES.filter((c) => !c.priority && DIAL_BY_ISO[c.code]);

  const renderItem = (code: string, name: string) => (
    <Command.Item
      key={code}
      value={`${name} ${code} ${DIAL_BY_ISO[code]}`}
      onSelect={() => {
        onChange(code);
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground",
        "data-[selected=true]:bg-surface-3 aria-selected:bg-surface-3",
      )}
    >
      <Flag code={code} size={14} />
      <span className="flex-1 truncate">{name}</span>
      <span className="tabular-nums text-muted-2">{DIAL_BY_ISO[code]}</span>
      {value === code && <Check className="size-4 text-foreground" />}
    </Command.Item>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-1 rounded-md border border-border bg-surface-2 px-2.5 text-sm transition-colors",
            "hover:border-border-strong focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Flag code={selected?.code} size={14} />
            <span className="tabular-nums text-foreground">{dial ?? "–"}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command
          className="w-full"
          filter={(val, search) =>
            val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted-2" />
            <Command.Input
              placeholder={t("country.search")}
              className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-2 focus:outline-none"
            />
          </div>
          <Command.List className="scroll-thin max-h-64 overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-2">
              {t("country.empty")}
            </Command.Empty>
            {priority.length > 0 && (
              <Command.Group
                heading={t("country.popular")}
                className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-2"
              >
                {priority.map((c) => renderItem(c.code, c.name))}
              </Command.Group>
            )}
            <Command.Group
              heading={t("country.all")}
              className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-2"
            >
              {rest.map((c) => renderItem(c.code, c.name))}
            </Command.Group>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
