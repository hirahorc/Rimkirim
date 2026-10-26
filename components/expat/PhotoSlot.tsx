"use client";

import { Camera } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Where a real photo goes once Rimkirim has one. The brief asks for genuine
 * shipment and team photography, never stock, so until then the slot names
 * the shot it needs and the shot it must avoid. The dashed hairline is the
 * system's "not here yet" mark (DESIGN.md, Buttons: Dashed), the same one the
 * upload dropzone wears.
 */
export function PhotoSlot({
  shot,
  avoid,
  bleed = false,
  className,
}: {
  shot: string;
  avoid?: string;
  /** the slot is the top of a card that frames and clips it: no border or
   *  corner of its own, tighter padding */
  bleed?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <figure
      className={cn(
        "relative flex flex-col justify-between bg-surface-2",
        bleed
          ? // the host card clips the corners; no overflow of its own, so an
            // aspect ratio set by the host stays a floor the brief can grow past
            "p-5"
          : // md, one step under the lg media frame: a tighter corner reads as
            // a photo's edge rather than a card's (requested 2026-10-26)
            "overflow-hidden rounded-md border border-dashed border-border-strong px-6 py-7",
        className,
      )}
    >
      <div aria-hidden className="grid-backdrop absolute inset-0" />
      <Camera aria-hidden className="relative size-6 shrink-0 text-muted-2" />
      <figcaption className={cn("relative", bleed ? "mt-3" : "mt-6")}>
        <p className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
          {t("expat.photo.label")}
        </p>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-foreground">{shot}</p>
        {avoid && (
          <p className="mt-1 text-xs text-muted-2">
            {t("expat.photo.avoid")}: {avoid}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
