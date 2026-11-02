"use client";

import type * as React from "react";
import { ArrowRight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { SceneStage } from "./SceneStage";
import { SizeScene } from "./SectionScenes";

const FACTORS = ["route", "weight", "size", "surcharge"] as const;

/**
 * Brief 05. People hesitate when a bulky piece is quoted high, so the cost
 * drivers come before the enquiry, in plain words: route, weight, size, type.
 * The one idea that surprises everyone, that a light box can cost like a heavy
 * one, is shown in the calculator itself rather than in jargon: a light box
 * charged by its size beside a heavy suitcase charged by its weight
 * (SectionScenes, SizeScene). Surcharges are named in plain
 * words (suitcases included, since they aren't cardboard) with the full
 * Surcharge Information modal one tap away. No per-kilo rates here: the
 * calculator behind "Get a quote" gives the estimate, and the final price is
 * only ever confirmed against the real shipment.
 */
export function QuoteFactors() {
  const t = useT();
  return (
    <section aria-labelledby="pricing-heading" data-tone="violet" className="band">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.pricing} className="mb-8" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div>
            <SectionHead
              id="pricing-heading"
              eyebrow={t("expat.pricing.eyebrow")}
              title={t("expat.pricing.heading")}
              subtitle={t("expat.pricing.subtitle")}
            />
            {/* the quote builds from its inputs, so they arrive in that
                order (globals.css, the build) */}
            <dl className="build-seq mt-10 border-t border-border">
              {FACTORS.map((f, i) => (
                <div
                  key={f}
                  className="build-row grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <dt className="font-medium">{t(`expat.pricing.${f}Title`)}</dt>
                  <dd className="text-sm text-muted">
                    {t(`expat.pricing.${f}Body`)}
                    {/* the full breakdown, the same modal the main site's
                        calculator opens: per-carrier handling surcharges,
                        then the other logistic costs */}
                    {f === "surcharge" && (
                      <SurchargeInfoDialog>
                        <button type="button" className="link-mark mt-1.5 block text-left">
                          {t("expat.pricing.surchargeCta")}
                        </button>
                      </SurchargeInfoDialog>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-lg font-medium">{t("expat.pricing.promise")}</p>
            <Button asChild size="lg" className="mt-5">
              <a href={EXPAT_QUOTE_URL}>
                {t("expat.cta")} <ArrowRight />
              </a>
            </Button>
          </div>

          {/* the calculator weighing two pieces, built once in view; the
              rule itself is real text under it */}
          <figure className="self-start">
            <SceneStage
              className="aspect-[4/5] w-full max-w-[30rem] sm:aspect-[30/31]"
              sceneClassName="text-[length:3.3cqw] @max-[30rem]:text-[length:4.3cqw]"
            >
              <SizeScene />
            </SceneStage>
            <figcaption className="mt-6 max-w-[30rem]">
              <h3 className="font-display text-xl font-semibold tracking-tight">{t("expat.pricing.guideTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("expat.pricing.guideBody")}</p>
              <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed">
                <Ruler aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
                {t("expat.pricing.tip")}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
