import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        // lg: cards wear the big corner again (DESIGN.md, Shapes). The curve
        // costs clearance — square-edged content pays for it with generous
        // vertical padding (The Clearance Rule), while a concentric edge
        // (pill/badge/circle on top, a button at the bottom) may sit closer
        // because it echoes the curve.
        // inside the field (data-field, the app pages on Panel 2) globals.css
        // re-points --card-surface / --card-border so a card is a white plane
        // with no outline (The Stroke Rule). Read through variables rather
        // than a variant so a caller's own bg-*/border-* still wins the merge.
        "rounded-lg border border-[var(--card-border,var(--border))] bg-[var(--card-surface,var(--surface))] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}
