import type * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A sequence told as one rail, not a row of cards: a hairline above each step
 * that draws in as the step enters, the text rising under it (`.how-step` in
 * globals.css, DESIGN.md "The step rail"). `--i` offsets the scroll range so
 * on one row the steps arrive in the order they happen. Shared by the home
 * page's "Cara kerjanya" and the expat page's "How it works".
 */
export function StepRail({
  steps,
  className,
}: {
  steps: { title: string; body: string }[];
  /** the grid's column count per breakpoint, e.g. `sm:grid-cols-2 lg:grid-cols-4` */
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-x-6 gap-y-8", className)}>
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="how-step relative pt-5"
          style={{ "--i": i } as React.CSSProperties}
        >
          <span aria-hidden className="how-step-rail absolute inset-x-0 top-0 h-px bg-border-strong" />
          <div className="how-step-body">
            <span className="font-mono text-xs tabular-nums text-muted-2">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
