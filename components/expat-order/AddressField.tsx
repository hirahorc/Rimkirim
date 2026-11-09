"use client";

import * as React from "react";
import { MapPin, X } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { searchPlaces, placeLine, type Place } from "@/lib/data/expat-places";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The Check Rate Address: a search field over map suggestions, as on the live
 * page. Only a picked suggestion counts, and only one with a postal code: a
 * whole city or area is refused with the live page's reason, so the rate can
 * be priced. ARIA combobox (the input owns the listbox, arrows move the active
 * option, Enter picks it, Escape closes); `Field` wires id and description.
 */
export function AddressField({
  country,
  value,
  onChange,
  invalid,
  ...wiring
}: {
  country: string;
  value: Place | null;
  onChange: (p: Place | null) => void;
  /** show the field's error state (the caller renders the message) */
  invalid?: boolean;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "id" | "aria-describedby">) {
  const t = useT();
  const listId = React.useId();
  const [query, setQuery] = React.useState(value ? placeLine(value) : "");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  // set when this field cleared its own value, so the sync below leaves
  // what's being typed alone
  const selfClear = React.useRef(false);
  const clear = () => {
    selfClear.current = true;
    onChange(null);
  };

  // a value set from outside (a restored draft, a new country) fills or
  // empties the field
  React.useEffect(() => {
    if (selfClear.current) {
      selfClear.current = false;
      return;
    }
    setQuery(value ? placeLine(value) : "");
  }, [value]);

  const results = React.useMemo(() => (country ? searchPlaces(country, query) : []), [country, query]);
  const showList = open && !!country && query.trim().length >= 2 && (!value || placeLine(value) !== query);

  const pick = (p: Place) => {
    onChange(p);
    setQuery(placeLine(p));
    setOpen(false);
  };

  return (
    <Popover open={showList} onOpenChange={(o) => !o && setOpen(false)}>
      <PopoverAnchor asChild>
        <div className="relative">
          <MapPin aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <Input
            {...wiring}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            disabled={!country}
            placeholder={country ? t("expatOrder.rates.addressPh") : t("expatOrder.rates.addressCountryFirst")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
              // typing again un-picks the Address: only a pick counts
              if (value) clear();
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!showList) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                pick(results[active]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={cn("pl-9 pr-9", invalid && "border-danger")}
          />
          {query && country && (
            <button
              type="button"
              aria-label={t("expatOrder.rates.addressClear")}
              onClick={() => {
                setQuery("");
                if (value) clear();
              }}
              className="tap-target absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-2 hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        // the input keeps focus while the list is open
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if ((e.target as HTMLElement).closest?.("[role=combobox]")) e.preventDefault();
        }}
        className="max-h-72 overflow-y-auto"
      >
        <ul id={listId} role="listbox" aria-label={t("expatOrder.rates.address")}>
          {results.length === 0 ? (
            <li className="px-2.5 py-2 text-sm text-muted">{t("expatOrder.rates.addressNoResults")}</li>
          ) : (
            results.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown, so the pick lands before the input's blur
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-sm px-2.5 py-2 text-sm",
                  i === active && "bg-surface-3",
                )}
              >
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-2" />
                <span className="min-w-0">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block truncate text-xs text-muted">{p.detail}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
