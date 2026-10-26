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
  className,
}: {
  shot: string;
  avoid?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <figure
      className={cn(
        // md, one step under the lg media frame: a tighter corner reads as a
        // photo's edge rather than a card's (requested 2026-10-26)
        "relative flex flex-col justify-between overflow-hidden rounded-md border border-dashed border-border-strong bg-surface-2 px-6 py-7",
        className,
      )}
    >
      <div aria-hidden className="grid-backdrop absolute inset-0" />
      <Camera aria-hidden className="relative size-6 text-muted-2" />
      <figcaption className="relative mt-6">
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
