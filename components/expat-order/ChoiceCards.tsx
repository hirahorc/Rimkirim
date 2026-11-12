"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** the card both choices share: a wash well, as a field is, that turns to
 *  paper framed in Ink when chosen */
const card = (on: boolean) =>
  cn(
    "flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    on
      ? "bg-background font-medium shadow-[inset_0_0_0_2px_var(--foreground)]"
      : // pressed, the well dips at once: the answer itself only lands when
        // the finger lifts
        "bg-surface-2 hover:bg-surface-3 active:bg-surface-3",
  );

/**
 * One answer from a few, as cards (Q2, Q3 and its follow-ups, Q4): real radio
 * semantics (labelled by its question, arrows move the choice, roving
 * tabindex), the chosen card framed in Ink with its dot filled. Ink, not
 * lime: lime stays the page's one "press this".
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
  // the dot pops in for an answer just given, never for one a draft brought
  const [picked, setPicked] = React.useState(false);
  const pick = (v: T) => {
    setPicked(true);
    onChange(v);
  };
  const at = options.findIndex((o) => o.value === value);
  const move = (from: number, dir: 1 | -1) => {
    const next = (from + dir + options.length) % options.length;
    pick(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn(
        "grid grid-cols-1 gap-2",
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
            onClick={() => pick(o.value)}
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
              className={cn("grid size-5 shrink-0 place-items-center rounded-full", on ? "bg-foreground" : "bg-background")}
            >
              {on && <span className={cn("size-2 rounded-full bg-background", picked && "radio-check-in")} />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Any number of answers (Q1), as cards with a real checkbox each: the box
 * fills with Ink under a paper tick, the card frames in Ink.
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
  // as the radio's dot: only an answer just given pops in
  const [picked, setPicked] = React.useState(false);
  return (
    <div role="group" aria-labelledby={labelledBy} className={cn("grid grid-cols-1 gap-2", !single && "sm:grid-cols-2")}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => {
              setPicked(true);
              onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value]);
            }}
            className={card(on)}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-2xs",
                on ? "bg-foreground text-background" : "bg-background",
              )}
            >
              {on && <Check className={cn("size-3.5", picked && "radio-check-in")} strokeWidth={3} />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
