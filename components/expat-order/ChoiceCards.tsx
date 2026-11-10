"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** the card both choices share: a white plane that frames in Ink when chosen */
const card = (on: boolean) =>
  cn(
    // pressed, the plane dips to Panel 2 at once: the answer itself only
    // lands when the finger lifts
    "flex w-full items-center gap-3 rounded-md border bg-background px-4 py-3 text-left text-sm transition-colors active:bg-surface-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
    on
      ? "border-foreground font-medium text-foreground shadow-[inset_0_0_0_1px_var(--foreground)]"
      : "border-border-strong text-foreground hover:border-muted-2",
  );

/**
 * One answer from a few, as cards (Q2, Q3 and its follow-ups, Q4): real radio
 * semantics (labelled by its question, arrows move the choice, roving
 * tabindex), the chosen card framed in Ink with the stepper's lime core in
 * its dot. Not lime-filled: lime stays the page's one "press this".
 */
export function RadioCards<T extends string | boolean>({
  value,
  onChange,
  options,
  labelledBy,
  columns = 2,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  labelledBy: string;
  columns?: 2 | 3 | 4;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const at = options.findIndex((o) => o.value === value);
  const move = (from: number, dir: 1 | -1) => {
    const next = (from + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn(
        "grid gap-2",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {options.map((o, i) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={at === -1 ? (i === 0 ? 0 : -1) : on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(i, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(i, -1);
              }
            }}
            className={card(on)}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full",
                on ? "border-2 border-foreground" : "border border-border-strong bg-surface-2",
              )}
            >
              {on && <span className="size-2 rounded-full bg-brand" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Any number of answers (Q1), as cards with a real checkbox each: the box is
 * the system's checked state (lime with an Ink tick), the card frames in Ink.
 */
export function CheckCards<T extends string>({
  value,
  onChange,
  options,
  labelledBy,
  single = false,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string }[];
  labelledBy: string;
  /** one column at any width (the landing's picture of this question) */
  single?: boolean;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className={cn("grid gap-2", !single && "sm:grid-cols-2")}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={card(on)}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-[6px] border",
                on ? "border-brand bg-brand text-brand-ink" : "border-border-strong bg-surface-2",
              )}
            >
              {on && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
