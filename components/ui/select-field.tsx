"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * A styled single-select that matches the app's other dropdowns (CountrySelect,
 * DialCodeSelect): the trigger is the standard field surface and its option list
 * is an app-styled popover — not the OS-native `<option>` list a bare `<select>`
 * would render. Keyboard nav + type-ahead come from cmdk. Set `searchable` for
 * long lists (e.g. currencies) to reveal a filter input.
 */
export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder,
  emptyText,
  ariaLabel,
  disabled,
  className,
  wrapperClassName,
  contentClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm transition-colors",
              "hover:border-border-strong focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                selected ? "text-foreground" : "text-muted-2",
              )}
            >
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0", contentClassName)}>
          <Command
            filter={(val, search) =>
              val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            {searchable ? (
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="size-4 text-muted-2" />
                <Command.Input
                  placeholder={searchPlaceholder}
                  className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-2 focus:outline-none"
                />
              </div>
            ) : (
              // keeps cmdk's keyboard nav + type-ahead without a visible field
              <Command.Input className="sr-only" />
            )}
            <Command.List className="scroll-thin max-h-64 overflow-y-auto p-1">
              {searchable && (
                <Command.Empty className="py-6 text-center text-sm text-muted-2">
                  {emptyText}
                </Command.Empty>
              )}
              {options.map((o) => (
                <Command.Item
                  key={o.value}
                  value={`${o.label} ${o.value}`}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-foreground",
                    "data-[selected=true]:bg-surface-3 aria-selected:bg-surface-3",
                  )}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {value === o.value && (
                    <Check className="size-4 shrink-0 text-foreground" />
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
