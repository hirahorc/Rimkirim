"use client";

import { Check } from "lucide-react";
import { CarrierLogos } from "@/components/landing/CarrierSection";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { PickupPhotos } from "./PickupPhotos";
import { ReviewNote } from "./ReviewNote";
import { SceneStage } from "./SceneStage";
import { ThreadScene } from "./SectionScenes";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

const OURS = ["us1", "us2", "us3", "us4", "us5", "us6"] as const;
const YOURS = ["you1", "you2", "you3"] as const;

/**
 * Brief 04, "Who does what" ("Why Rimkirim" in the brief, now the
 * comparison after it), answered as a division of labour instead of a
 * promise that shipping is easy: what we do, and the three things that stay
 * with the customer. Someone comparing providers can assess that, and sales
 * stops answering the same basic questions. Two de-boxed lists, not cards;
 * ours are ticked, theirs are numbered because they are a to-do, and beside
 * them the team on WhatsApp walking a customer through all three, on the
 * customer's iPhone (ThreadScene), which is how "One team on WhatsApp"
 * works. Then the
 * proof: real pickups for Rimkirim customers (PickupPhotos, a row of
 * slices), and the carriers who fly it close the band, proof for
 * "Air shipping" above, where as a section of their own they read as one
 * more stripe of the page.
 */
export function WhatWeCoordinate() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the phone, then
  // the lists piece by piece
  const rootRef = useSectionReveal<HTMLElement>();

  return (
    <section ref={rootRef} aria-labelledby="coordinate-heading" data-tone="violet" className="band">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <ReviewNote note={REVIEW_NOTES.coordinate} className="mb-8" />
        <div className="jr-reveal" style={order(0)}>
          <SectionHead
            id="coordinate-heading"
            eyebrow={t("expat.coordinate.eyebrow")}
            title={t("expat.coordinate.heading")}
            subtitle={t("expat.coordinate.subtitle")}
          />
        </div>

        {/* the lists one above the other and the phone beside them, held
            still as they scroll past it (the CIPL's arrangement in "What you
            can ship"); side by side, the lists left the phone a column of
            its own twice as tall as theirs */}
        <div className="mt-8 grid gap-12 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
          <div>
            <h3
              className="jr-reveal font-display text-lg font-semibold tracking-tight"
              style={order(2)}
            >
              {t("expat.coordinate.usTitle")}
            </h3>
            <ul className="mt-4 space-y-5">
              {OURS.map((k, i) => (
                <li key={k} className="jr-reveal flex gap-3" style={order(3 + i)}>
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

            <h3
              className="jr-reveal mt-10 border-t border-border pt-10 font-display text-lg font-semibold tracking-tight"
              style={order(3 + OURS.length)}
            >
              {t("expat.coordinate.youTitle")}
            </h3>
            <ol className="mt-4 space-y-5">
              {YOURS.map((k, i) => (
                <li key={k} className="jr-reveal flex gap-3" style={order(4 + OURS.length + i)}>
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

          {/* the phone right after the head, as the journey's stage is; the
              wrapper rises and holds still, the stage builds inside it */}
          <div className="jr-reveal self-start lg:sticky lg:top-28" style={order(1)}>
            <SceneStage
              glint
              // portrait, as tall as the phone's top down to "Pickup booked"
              // and a little wallpaper under it: 4/5 on a phone, where the
              // phone is nearly the stage's width, 8/9 wherever the stage is
              // wide (ThreadScene, PHONE_EM)
              className="mx-auto aspect-[4/5] w-full max-w-[32rem] sm:aspect-[8/9] lg:mx-0"
              sceneClassName="text-[length:3.3cqw] @max-[24rem]:text-[length:4.4cqw]"
            >
              <ThreadScene />
            </SceneStage>
          </div>
        </div>

        <PickupPhotos className="mt-16" />

        {/* the carriers who fly it close the band in one line: named beside
            the marks from lg, over them below, and set from the left in the
            pickups' own label, since both are proof of the same promise.
            Rayspeed isn't a partner on the expat routes */}
        <div className="mt-16 grid gap-y-7 border-t border-border-strong pt-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:items-center lg:gap-x-16">
          <h3 className="font-display text-sm font-semibold text-muted">
            {t("carrier.eyebrow")}
          </h3>
          <CarrierLogos align="start" omit={["Rayspeed Asia"]} />
        </div>
      </div>
    </section>
  );
}
