"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export type FlowStep = "eligibility" | "details" | "packing";

const STEPS: { key: FlowStep; href: string }[] = [
  { key: "eligibility", href: "/expat-relocation/plan" },
  { key: "details", href: "/expat-relocation/plan?step=details" },
  { key: "packing", href: "/expat-relocation/plan?step=packing" },
];

/** a step's dot and its word: the word under the dot on a phone, beside it
 *  from sm */
const PAIR = "flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2";

/**
 * The plan's three steps, in the status stepper's encoding (DESIGN.md,
 * Status stepper): a step behind you is a lime dot with an Ink check and
 * links back to itself, the current one is framed in Ink with a lime core,
 * the ones ahead are Hairline on Panel 2. The track is lime up to where you
 * are. Check Rate comes before the plan and isn't one of its steps. Every
 * step keeps its word at every width: on a phone the three stand in columns,
 * each word under its dot, so what's done and what's next can be read.
 */
export function FlowStepper({ current, className }: { current: FlowStep; className?: string }) {
  const t = useT();
  const at = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label={t("expatOrder.stepper.label")} className={className}>
      <ol className="grid grid-cols-[1fr_1fr_auto] sm:flex sm:items-center sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < at;
          const here = i === at;
          const label = t(`expatOrder.stepper.${s.key}`);
          const dot = (
            <span
              aria-hidden
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                done && "bg-brand text-brand-ink",
                here && "border-2 border-foreground bg-background",
                !done && !here && "border border-border-strong bg-surface-2",
              )}
            >
              {done && <Check className="size-3.5" strokeWidth={3} />}
              {here && <span className="size-2 rounded-full bg-brand" />}
            </span>
          );
          const text = (
            <span
              className={cn(
                "whitespace-nowrap text-xs sm:text-sm",
                here ? "font-semibold text-foreground" : "text-muted",
              )}
            >
              {label}
              {done && <span className="sr-only"> ({t("expatOrder.stepper.done")})</span>}
            </span>
          );
          return (
            <li key={s.key} className="relative min-w-0 sm:flex sm:items-center sm:gap-2">
              {done ? (
                <Link
                  href={s.href}
                  // its own height, not .tap-row: that centres a column's
                  // children, and the dot stays flush left over its word
                  className={cn(
                    PAIR,
                    "rounded-sm transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 pointer-coarse:min-h-11",
                  )}
                >
                  {dot}
                  {text}
                </Link>
              ) : (
                <span className={PAIR} aria-current={here ? "step" : undefined}>
                  {dot}
                  {text}
                </span>
              )}
              {/* the track to the next step: along the dots' row on a phone,
                  a gap clear of each dot; in the line from sm */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-8 right-2 top-3 h-0.5 -translate-y-1/2 rounded-full sm:static sm:w-10 sm:shrink-0 sm:translate-y-0",
                    i < at ? "bg-brand" : "bg-border-strong",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
