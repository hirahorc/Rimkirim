"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepRail } from "@/components/landing/StepRail";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

const STEPS = ["s1", "s2", "s3", "s4"] as const;

/**
 * Brief 06. People moving countries already have plenty to organise; four
 * steps show the next one and where Rimkirim takes over. Same rail as the
 * home page's "Cara kerjanya", so the two pages tell a process the same way.
 */
export function ExpatSteps() {
  const t = useT();
  return (
    <section
      id="how-it-works"
      aria-labelledby="steps-heading"
      className="scroll-mt-24 border-t border-border bg-surface/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.steps} className="mb-8" />
        <SectionHead id="steps-heading" title={t("expat.steps.heading")} subtitle={t("expat.steps.subtitle")} />
        <StepRail
          steps={STEPS.map((s) => ({ title: t(`expat.steps.${s}Title`), body: t(`expat.steps.${s}Body`) }))}
          className="mt-12 sm:grid-cols-2 lg:grid-cols-4"
        />
        <Button asChild variant="secondary" className="mt-12">
          <a href="#quote">
            {t("expat.steps.cta")} <ArrowUp />
          </a>
        </Button>
      </div>
    </section>
  );
}
