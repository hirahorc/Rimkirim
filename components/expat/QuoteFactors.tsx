"use client";

import { ArrowRight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { SceneStage } from "./SceneStage";
import { SizeScene } from "./SectionScenes";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

const FACTORS = ["route", "weight", "size", "surcharge"] as const;

/**
 * Brief 05. People hesitate when a bulky piece is quoted high, so the cost
 * drivers come before the enquiry, in plain words: route, weight, size, type.
 * The one idea that surprises everyone, that a light box can cost like a heavy
 * one, is shown as the warehouse weighs it rather than in jargon: a light box
 * charged by its size beside a heavy suitcase charged by its weight
 * (SectionScenes, SizeScene). Surcharges are named in plain
 * words (suitcases included, since they aren't cardboard) with the full
 * Surcharge Information modal one tap away. No per-kilo rates here: Check
 * Rate, behind "Check your rate", gives the estimate, and the final price
 * comes on the invoice, once the packages are weighed again at the warehouse.
 */
export function QuoteFactors() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the
  // weighing, then the factors in the order a price is built from them,
  // the promise and the way in
  const rootRef = useSectionReveal<HTMLElement>();
  return (
    <section ref={rootRef} aria-labelledby="pricing-heading" data-tone="violet" className="band">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.pricing} className="mb-8" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div>
            <div className="jr-reveal" style={order(0)}>
              <SectionHead
                id="pricing-heading"
                eyebrow={t("expat.pricing.eyebrow")}
                title={t("expat.pricing.heading")}
                subtitle={t("expat.pricing.subtitle")}
              />
            </div>
            {/* the quote is built from its inputs, so they arrive in that
                order */}
            <dl className="mt-10 border-t border-border">
              {FACTORS.map((f, i) => (
                <div
                  key={f}
                  className="jr-reveal grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                  style={order(2 + i)}
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
            <p className="jr-reveal mt-6 max-w-lg font-medium" style={order(2 + FACTORS.length)}>
              {t("expat.pricing.promise")}
            </p>
            {/* the button rises inside a wrapper, so the reveal never holds
                the button's own press */}
            <div className="jr-reveal mt-5 w-fit" style={order(3 + FACTORS.length)}>
              <Button asChild size="lg">
                <a href={EXPAT_QUOTE_URL}>
                  {t("expat.cta")} <ArrowRight />
                </a>
              </Button>
            </div>
          </div>

          {/* the calculator weighing two pieces, built once in view; the
              rule itself is real text under it. It rises right after the
              head, as the journey's stage does */}
          <figure className="jr-reveal self-start" style={order(1)}>
            <SceneStage
              glint
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
