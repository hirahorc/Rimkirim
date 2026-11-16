"use client";

import * as React from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/* ---- date maths on plain "YYYY-MM-DD" strings (local, no TZ drift) ---- */
const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s?: string) => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && toIso(a) === toIso(b);
/** Monday-first weekday index (Mon=0 … Sun=6) */
const dow = (d: Date) => (d.getDay() + 6) % 7;

/**
 * Field-shaped trigger + app-styled calendar popover, replacing the OS-native
 * `<input type="date">` (whose picker only opened from the tiny icon on
 * desktop and looked foreign on every platform). Value in/out is "YYYY-MM-DD"
 * so it slots into the existing form data. Weeks start on Monday.
 *
 * Keyboard: ←/→ ±1 day, ↑/↓ ±1 week, PgUp/PgDn ±1 month, Home/End week edges,
 * Enter/Space selects, Esc closes.
 *
 * `monthJump` makes the month's name a button that turns the days into the
 * year's twelve months, with the years either side, so a date years back is a
 * few presses away instead of a month at a time (an arrival date in Q2 of the
 * expat Eligibility Check). A month picks, and the days come back on it;
 * months and years past the bounds are off. The panel keeps its height.
 */
export function DatePicker({
  value,
  onChange,
  min,
  max,
  isDateDisabled,
  placeholder,
  ariaLabel,
  disabled,
  className,
  id,
  monthJump = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  /** inclusive bounds, "YYYY-MM-DD" */
  min?: string;
  max?: string;
  /** further days that can't be picked inside the bounds (e.g. weekends) */
  isDateDisabled?: (iso: string) => boolean;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** the month's name opens a month and year view (see above) */
  monthJump?: boolean;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const selected = fromIso(value);
  const minD = fromIso(min);
  const maxD = fromIso(max);
  // the month on display + the day that holds roving focus inside the grid
  const [view, setView] = React.useState<Date>(() => addMonths(selected ?? today(), 0));
  const [focusDay, setFocusDay] = React.useState<Date>(() => selected ?? today());
  const gridRef = React.useRef<HTMLDivElement>(null);
  const focusPending = React.useRef(false);
  // the days, or the year's months (monthJump)
  const [months, setMonths] = React.useState(false);

  const fmtLong = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );
  const fmtMonth = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const fmtMonthShort = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short" }), [locale]);
  const fmtWeekday = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );
  const fmtFull = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  // Monday 2024-01-01 → a week of labels in the active locale
  const weekdays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => fmtWeekday.format(new Date(2024, 0, 1 + i))),
    [fmtWeekday],
  );

  const outOfRange = (d: Date) =>
    (!!minD && d < minD) || (!!maxD && d > maxD) || !!isDateDisabled?.(toIso(d));

  const openTo = (d: Date) => {
    setView(addMonths(d, 0));
    setFocusDay(d);
  };

  // when the popover opens, start on the selected day (or today) and focus it
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      openTo(selected ?? today());
      setMonths(false);
      focusPending.current = true;
    }
  };

  // move DOM focus to the roving day whenever it changes via keyboard/open
  React.useEffect(() => {
    if (!open || !focusPending.current) return;
    focusPending.current = false;
    const el = gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]');
    el?.focus();
  }, [open, focusDay, view]);

  const moveFocus = (d: Date) => {
    setFocusDay(d);
    if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) {
      setView(addMonths(d, 0));
    }
    focusPending.current = true;
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      Home: () => addDays(focusDay, -dow(focusDay)),
      End: () => addDays(focusDay, 6 - dow(focusDay)),
      PageUp: () => {
        const m = addMonths(focusDay, -1);
        return new Date(m.getFullYear(), m.getMonth(), Math.min(focusDay.getDate(), 28));
      },
      PageDown: () => {
        const m = addMonths(focusDay, 1);
        return new Date(m.getFullYear(), m.getMonth(), Math.min(focusDay.getDate(), 28));
      },
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    moveFocus(fn());
  };

  const pick = (d: Date) => {
    if (outOfRange(d)) return;
    onChange(toIso(d));
    setOpen(false);
  };

  // 6 rows × 7 so the panel never changes height between months
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < dow(first); i++) cells.push(null);
  const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  while (cells.length < 42) cells.push(null);

  const now = today();
  const prevDisabled = !!minD && addMonths(view, 0) <= addMonths(minD, 0);
  const nextDisabled = !!maxD && addMonths(view, 1) > addMonths(maxD, 0);
  // the months view: a year a step, a month off when it's wholly past a bound
  const year = view.getFullYear();
  const prevYearDisabled = !!minD && year <= minD.getFullYear();
  const nextYearDisabled = !!maxD && year >= maxD.getFullYear();
  const monthOff = (m: number) =>
    (!!minD && new Date(year, m + 1, 0) < minD) || (!!maxD && new Date(year, m, 1) > maxD);
  const pickMonth = (m: number) => {
    const d = new Date(year, m, Math.min(focusDay.getDate(), 28));
    setView(new Date(year, m, 1));
    setFocusDay(d);
    setMonths(false);
    focusPending.current = true;
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={
            ariaLabel ??
            (selected ? `${t("date.field")}: ${fmtFull.format(selected)}` : t("date.field"))
          }
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm transition-colors",
            "hover:border-border-strong focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
            "data-[state=open]:border-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className={cn("truncate text-left", selected ? "text-foreground" : "text-muted-2")}>
            {selected ? fmtLong.format(selected) : (placeholder ?? t("date.placeholder"))}
          </span>
          <Calendar className="size-4 shrink-0 text-muted-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[19.5rem] min-w-0 p-3"
        // keep focus management to the grid (roving tabindex), not radix's default
        onOpenAutoFocus={(e) => e.preventDefault()}
        role="dialog"
        aria-label={t("date.field")}
      >
        {/* month header: in the months view the arrows step a year */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t(months ? "date.prevYear" : "date.prevMonth")}
            disabled={months ? prevYearDisabled : prevDisabled}
            onClick={() => setView(months ? new Date(year - 1, view.getMonth(), 1) : addMonths(view, -1))}
          >
            <ChevronLeft />
          </Button>
          {monthJump ? (
            <button
              type="button"
              aria-label={t(months ? "date.backToDays" : "date.chooseMonth")}
              aria-expanded={months}
              onClick={() => setMonths((m) => !m)}
              className="flex h-9 items-center gap-1 rounded-sm px-2 font-display text-sm font-semibold tracking-tight transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              <span aria-live="polite">{months ? year : fmtMonth.format(view)}</span>
              {months ? (
                <ChevronUp aria-hidden className="size-4 text-muted" />
              ) : (
                <ChevronDown aria-hidden className="size-4 text-muted" />
              )}
            </button>
          ) : (
            <div aria-live="polite" className="font-display text-sm font-semibold tracking-tight">
              {fmtMonth.format(view)}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t(months ? "date.nextYear" : "date.nextMonth")}
            disabled={months ? nextYearDisabled : nextDisabled}
            onClick={() => setView(months ? new Date(year + 1, view.getMonth(), 1) : addMonths(view, 1))}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* the year's months, in the days' place and at their height */}
        {months && (
          <div role="group" aria-label={String(year)} className="mt-2 grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, m) => {
              const off = monthOff(m);
              const isView = m === view.getMonth();
              const hasSel = !!selected && selected.getFullYear() === year && selected.getMonth() === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={off}
                  aria-pressed={hasSel}
                  onClick={() => pickMonth(m)}
                  className={cn(
                    "h-[3.875rem] rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
                    hasSel
                      ? "bg-brand font-semibold text-brand-ink hover:bg-brand-dim"
                      : off
                        ? "text-muted-2/50"
                        : "text-foreground hover:bg-surface-3",
                    isView && !hasSel && !off && "ring-1 ring-inset ring-border-strong",
                  )}
                >
                  {fmtMonthShort.format(new Date(year, m, 1))}
                </button>
              );
            })}
          </div>
        )}

        {/* weekday rule */}
        <div className={cn("mt-2 grid grid-cols-7", months && "hidden")} aria-hidden>
          {weekdays.map((w, i) => (
            <div
              key={w}
              className={cn(
                "py-1 text-center text-[10px] font-medium uppercase tracking-wide",
                i === 6 ? "text-danger/70" : "text-muted-2",
              )}
            >
              {w.replace(".", "")}
            </div>
          ))}
        </div>

        {/* day grid — roving tabindex, one tab stop */}
        <div
          ref={gridRef}
          role="grid"
          aria-label={fmtMonth.format(view)}
          onKeyDown={onGridKeyDown}
          className={cn("grid grid-cols-7 gap-y-0.5", months && "hidden")}
        >
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} role="gridcell" aria-hidden className="size-10" />;
            const isSel = sameDay(d, selected);
            const isToday = sameDay(d, now);
            const isFocus = sameDay(d, focusDay);
            const dis = outOfRange(d);
            return (
              <div key={toIso(d)} role="gridcell" className="grid place-items-center">
                <button
                  type="button"
                  tabIndex={isFocus ? 0 : -1}
                  data-focus={isFocus ? "true" : undefined}
                  aria-label={fmtFull.format(d)}
                  aria-pressed={isSel}
                  aria-disabled={dis || undefined}
                  disabled={dis}
                  onClick={() => pick(d)}
                  onFocus={() => setFocusDay(d)}
                  className={cn(
                    "relative grid size-10 place-items-center rounded-sm text-sm tabular-nums transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
                    isSel
                      ? "bg-brand font-semibold text-brand-ink hover:bg-brand-dim"
                      : dis
                        ? "text-muted-2/50"
                        : "text-foreground hover:bg-surface-3",
                    !isSel && dow(d) === 6 && !dis && "text-danger",
                  )}
                >
                  {d.getDate()}
                  {/* today: a dot under the number, so it reads even when another day is selected */}
                  {isToday && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                        isSel ? "bg-brand-ink" : "bg-foreground",
                      )}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* footer: jump to today / clear */}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <button
            type="button"
            onClick={() => (outOfRange(now) ? openTo(now) : pick(now))}
            className="rounded-sm px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            {t("date.today")}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-sm px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              {t("date.clear")}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** "YYYY-MM-DD" for today, local time — handy for `min`. */
export const todayIso = () => toIso(today());
