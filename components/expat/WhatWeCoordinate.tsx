"use client";

import { Check } from "lucide-react";
import { CarrierLogos } from "@/components/landing/CarrierSection";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { PickupReel, PickupSheet, PickupSlices, usePickupLayout } from "./PickupPhotos";
import { ReviewNote } from "./ReviewNote";

const OURS = ["us1", "us2", "us3", "us4", "us5", "us6"] as const;
const YOURS = ["you1", "you2", "you3"] as const;

/**
 * Brief 04, "Why Rimkirim", answered as a division of labour instead of a
 * promise that shipping is easy: what we do, and the three things that stay
 * with the customer. Someone comparing providers can assess that, and sales
 * stops answering the same basic questions. Two de-boxed lists, not cards;
 * ours are ticked, theirs are numbered because they are a to-do. Then the
 * proof: real pickups for Rimkirim customers (PickupPhotos, in whichever
 * layout is picked), and the carriers who fly it close the band, proof for
 * "Air shipping" above, where as a section of their own they read as one
 * more stripe of the page.
 */
export function WhatWeCoordinate() {
  const t = useT();
  const layout = usePickupLayout();
  // A keeps the photos in the third column, beside the lists; B and C give
  // them a row of their own, so the lists take the width as two columns
  const sheet = layout === "a";
  return (
    <section aria-labelledby="coordinate-heading" data-tone="violet" className="band">
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.coordinate} className="mb-8" />
        <SectionHead
          id="coordinate-heading"
          eyebrow={t("expat.coordinate.eyebrow")}
          title={t("expat.coordinate.heading")}
          subtitle={t("expat.coordinate.subtitle")}
        />

        <div
          className={cn(
            "mt-12 grid gap-12 lg:gap-10",
            sheet ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,20rem)]" : "md:grid-cols-2",
          )}
        >
          <div>
            <h3 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
              {t("expat.coordinate.usTitle")}
            </h3>
            <ul className="mt-4 space-y-5">
              {OURS.map((k) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-tone-ink text-background">
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="font-medium">{t(`expat.coordinate.${k}Title`)}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{t(`expat.coordinate.${k}Body`)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(sheet ? "lg:border-l lg:pl-10" : "md:border-l md:pl-10", "border-border")}>
            <h3 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
              {t("expat.coordinate.youTitle")}
            </h3>
            <ol className="mt-4 space-y-5">
              {YOURS.map((k, i) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border-strong text-xs font-medium tabular-nums text-muted">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{t(`expat.coordinate.${k}Title`)}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{t(`expat.coordinate.${k}Body`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {sheet && <PickupSheet />}
        </div>
      </div>

      {/* outside the content column: the reel runs the band's full width */}
      {layout === "b" && <PickupReel className="mt-16" />}

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {layout === "c" && <PickupSlices className="mt-16" />}
        <div className="mt-16 border-t border-border-strong pt-12">
          <h3 className="text-center font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t("carrier.eyebrow")}
          </h3>
          <CarrierLogos className="mt-9" />
        </div>
      </div>
    </section>
  );
}
