"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export type FlowStep = "rate" | "eligibility" | "details";

const STEPS: { key: FlowStep; href: string }[] = [
  { key: "rate", href: "/expat-relocation/rates" },
  { key: "eligibility", href: "/expat-relocation/plan" },
  { key: "details", href: "/expat-relocation/plan?step=details" },
];

/**
 * The booking's three steps, in the status stepper's encoding (DESIGN.md,
 * Status stepper): a step behind you is a lime dot with an Ink check and
 * links back to itself, the current one is framed in Ink with a lime core,
 * the ones ahead are Hairline on Panel 2. The track is lime up to where you
 * are. Rate always reads done once you're planning, so only two steps remain.
 */
export function FlowStepper({ current, className }: { current: FlowStep; className?: string }) {
  const t = useT();
  const at = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label={t("expatOrder.stepper.label")} className={className}>
      <ol className="flex items-center gap-2">
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
                "whitespace-nowrap text-sm",
                here ? "font-semibold text-foreground" : "text-muted",
                // on a phone only the current step keeps its word
                !here && "hidden sm:inline",
              )}
            >
              {label}
              {done && <span className="sr-only"> ({t("expatOrder.stepper.done")})</span>}
            </span>
          );
          return (
            <li key={s.key} className="flex min-w-0 items-center gap-2">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn("h-0.5 w-6 shrink-0 rounded-full sm:w-10", i <= at ? "bg-brand" : "bg-border-strong")}
                />
              )}
              {done ? (
                <Link
                  href={s.href}
                  className="tap-row relative flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
                >
                  {dot}
                  {text}
                </Link>
              ) : (
                <span className="flex items-center gap-2" aria-current={here ? "step" : undefined}>
                  {dot}
                  {text}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
