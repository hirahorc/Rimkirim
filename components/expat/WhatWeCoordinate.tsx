"use client";

import { Check } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { PhotoSlot } from "./PhotoSlot";
import { ReviewNote } from "./ReviewNote";

const OURS = ["us1", "us2", "us3", "us4", "us5", "us6"] as const;
const YOURS = ["you1", "you2", "you3"] as const;

/**
 * Brief 04, "Why Rimkirim", answered as a division of labour instead of a
 * promise that shipping is easy: what we do, and the three things that stay
 * with the customer. Someone comparing providers can assess that, and sales
 * stops answering the same basic questions. Two de-boxed lists, not cards;
 * ours are ticked, theirs are numbered because they are a to-do.
 */
export function WhatWeCoordinate() {
  const t = useT();
  return (
    <section aria-labelledby="coordinate-heading" className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.coordinate} className="mb-8" />
        <SectionHead
          id="coordinate-heading"
          eyebrow={t("expat.coordinate.eyebrow")}
          title={t("expat.coordinate.heading")}
          subtitle={t("expat.coordinate.subtitle")}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,20rem)] lg:gap-10">
          <div>
            <h3 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
              {t("expat.coordinate.usTitle")}
            </h3>
            <ul className="mt-4 space-y-5">
              {OURS.map((k) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-background">
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

          <div className="lg:border-l lg:border-border lg:pl-10">
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

          <PhotoSlot
            shot={t("expat.photo.teamShot")}
            avoid={t("expat.photo.teamAvoid")}
            className="min-h-64 lg:min-h-0"
          />
        </div>
      </div>
    </section>
  );
}
