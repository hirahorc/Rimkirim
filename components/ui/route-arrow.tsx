import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * The connector between an origin and a destination in a route line
 * (origin → destination). A single Lucide glyph so every corridor label reads
 * the same weight as the flags and place names it sits between; decorative, so
 * it's hidden from assistive tech — the reading order (origin then destination)
 * already carries the direction.
 */
export function RouteArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      className={cn("size-3.5 shrink-0 text-muted-2", className)}
    />
  );
}
