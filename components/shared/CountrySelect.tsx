"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Lock, Search } from "lucide-react";
import {
  ALL_COUNTRIES,
  COUNTRIES,
  INDONESIA,
  getCountry,
  type Country,
} from "@/lib/data/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flag } from "@/components/shared/Flag";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  /** when true, the field is pinned to Indonesia and cannot be changed */
  locked?: boolean;
  placeholder?: string;
  /** exclude a country code from the list (e.g. the other endpoint) */
  exclude?: string;
}

export function CountrySelect({
  value,
  onChange,
  locked,
  placeholder,
  exclude,
}: CountrySelectProps) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const selected = getCountry(locked ? INDONESIA.code : value);
  const ph = placeholder ?? t("country.placeholder");

  if (locked) {
    return (
      <div className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-surface-3/60 px-3 text-sm">
        <span className="flex items-center gap-2">
          <Flag code={INDONESIA.code} size={14} />
          <span className="font-medium">{INDONESIA.name}</span>
        </span>
        <Lock className="size-3.5 text-muted-2" />
      </div>
    );
  }

  const priority = COUNTRIES.filter((c) => c.priority && c.code !== exclude);
  const rest = ALL_COUNTRIES.filter(
    (c) => !c.priority && c.code !== exclude,
  );

  const renderItem = (c: Country) => (
    <Command.Item
      key={c.code}
      value={`${c.name} ${c.code}`}
      onSelect={() => {
        onChange(c.code);
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground",
        "data-[selected=true]:bg-surface-3 aria-selected:bg-surface-3",
      )}
    >
      <Flag code={c.code} size={14} />
      <span className="flex-1">{c.name}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-2">
        {t(`zone.${c.zone}`)}
      </span>
      {value === c.code && <Check className="size-4 text-brand" />}
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
            "flex h-11 w-full items-center justify-between rounded-md border border-border bg-surface-2 px-3 text-sm transition-colors",
            "hover:border-border-strong focus-visible:outline-none focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/25",
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <Flag code={selected.code} size={14} />
              <span className="font-medium">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-2">{ph}</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-muted-2" />
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
                {priority.map(renderItem)}
              </Command.Group>
            )}
            <Command.Group
              heading={t("country.all")}
              className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-2"
            >
              {rest.map(renderItem)}
            </Command.Group>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
