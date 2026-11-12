"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { SceneStage } from "./SceneStage";
import { SizeScene } from "./SectionScenes";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

/**
 * Brief 05. People hesitate when a bulky piece is quoted high, so how the
 * price is worked out comes before the enquiry. It was a list of what
 * affects the price (route, weight, dimension, surcharges), which left the
 * reader to work out how they combine; it is now the sum itself, said once
 * under the heading and then step by step in the order it's done: each
 * piece's chargeable weight, the pieces added up, times the rate per kilo,
 * plus a handling surcharge where a piece needs one. Beside it the same sum
 * on an example, a light box charged on its volumetric weight and a heavy
 * suitcase charged on its actual weight, which adds a surcharge
 * (SectionScenes, SizeScene). The words are the carriers' and the main
 * site's: actual, volumetric and chargeable weight. No per-kilo rates and
 * no surcharge amounts here: Check Rate, behind "Check your rate", gives the
 * rate, the Surcharge Information modal is one tap from step 4, and the
 * final price comes on the invoice.
 */
export function QuoteFactors() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the example,
  // then the steps in the order the sum is done, the promise and the way in
  const rootRef = useSectionReveal<HTMLElement>();
  return (
    <section ref={rootRef} aria-labelledby="pricing-heading" data-tone="violet" className="band">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
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
            {/* the sum, a step a row, numbered because the order is the
                point; they arrive in it */}
            <ol className="mt-10 border-t border-border">
              {STEPS.map((s, i) => (
                <li key={s} className="jr-reveal flex gap-3 border-b border-border py-4" style={order(2 + i)}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border-strong text-xs font-medium tabular-nums text-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-balance font-medium">{t(`expat.pricing.${s}Title`)}</h3>
                    <p className="mt-1 text-sm text-muted">{t(`expat.pricing.${s}Body`)}</p>
                    {/* the full breakdown, the same modal the main site's
                        calculator opens: per-carrier handling surcharges,
                        then the other logistic costs */}
                    {s === "step4" && (
                      <SurchargeInfoDialog>
                        <button type="button" className="link-mark tap-target relative mt-1.5 block w-fit text-left text-sm">
                          {t("expat.pricing.surchargeCta")}
                        </button>
                      </SurchargeInfoDialog>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="jr-reveal mt-6 max-w-lg font-medium" style={order(2 + STEPS.length)}>
              {t("expat.pricing.promise")}
            </p>
            {/* the button rises inside a wrapper, so the reveal never holds
                the button's own press */}
            <div className="jr-reveal mt-5 sm:w-fit" style={order(3 + STEPS.length)}>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={EXPAT_QUOTE_URL}>
                  {t("expat.cta")} <ArrowRight />
                </a>
              </Button>
            </div>
          </div>

          {/* the same sum on an example, built once in view. It has no
              caption: the rule is step 1 and what brings a surcharge is step
              4, so nothing is said twice. It rises right after the head, as
              the journey's stage does; beside the steps it holds still as
              they scroll past, and below lg it sits in the middle, both as
              the phone in "Who does what" does. Tall enough for the whole
              sum, down to the surcharge's line */}
          <div className="jr-reveal self-start lg:sticky lg:top-28" style={order(1)}>
            <SceneStage
              glint
              className="mx-auto aspect-[5/7] w-full max-w-[30rem] sm:aspect-[6/7] lg:mx-0"
              sceneClassName="text-[length:3.3cqw] @max-[30rem]:text-[length:4.3cqw]"
            >
              <SizeScene />
            </SceneStage>
          </div>
        </div>
      </div>
    </section>
  );
}
