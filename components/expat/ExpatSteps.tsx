"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { JourneySteps } from "./JourneySteps";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

const STEPS = ["s1", "s2", "s3", "s4"] as const;

/**
 * Brief 06. People moving countries already have plenty to organise; four
 * steps show the next one and where Rimkirim takes over. Each step carries
 * an illustration of its moment; the section reveals itself, then plays the
 * steps 1 to 4 (JourneySteps), so the reader is walked through all four.
 */
export function ExpatSteps() {
  const t = useT();
  return (
    <section id="how-it-works" aria-labelledby="steps-heading" data-tone="magenta" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.steps} className="mb-8" />
        <JourneySteps
          head={
            <SectionHead
              id="steps-heading"
              eyebrow={t("expat.steps.eyebrow")}
              title={t("expat.steps.heading")}
              subtitle={t("expat.steps.subtitle")}
            />
          }
          steps={STEPS.map((s) => ({ title: t(`expat.steps.${s}Title`), body: t(`expat.steps.${s}Body`) }))}
          footer={
            <Button asChild size="lg">
              <a href={EXPAT_QUOTE_URL}>
                {t("expat.cta")} <ArrowRight />
              </a>
            </Button>
          }
        />
      </div>
    </section>
  );
}
