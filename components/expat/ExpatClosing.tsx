"use client";

import type * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPAT_QUOTE_URL } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";

const NEXT = ["next1", "next2", "next3"] as const;

/**
 * Brief 09. After reading this far nobody should have to scroll back up for
 * the way in, so the page ends on it: "Get a quote", the same door as the
 * hero's, into the relocation calculator. Below it, what that door leads
 * to, in the order the visitor will meet it (estimate, eligibility, details,
 * then our team on WhatsApp), because "and then what?" is the last doubt.
 *
 * Set as a ticket, the page's one dark surface (DESIGN.md, The dusk
 * ticket): the ask above a tear line, what happens next on the stub. Dusk,
 * the deep end of the route the page walks from sky through violet to
 * magenta, so arriving here reads as landing; and dark because the last ask
 * should not look like one more section. Lime, violet's near-complement, is
 * at its loudest on it.
 */
export function ExpatClosing() {
  const t = useT();
  return (
    // on the desk after the FAQ's band, with the same space above as below,
    // so the ticket stands on its own
    <section aria-labelledby="closing-heading" className="mx-auto max-w-6xl px-3 py-16 sm:px-6 sm:py-20">
      <div className="rounded-lg bg-dusk text-background">
        <div className="flex flex-col gap-8 px-5 pb-10 pt-10 sm:px-10 sm:pt-12 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:pt-14">
          <div className="max-w-2xl">
            <h2
              id="closing-heading"
              className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("expat.closing.heading")}
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-dusk-soft sm:text-lg">{t("expat.closing.subtitle")}</p>
          </div>
          {/* the house ring is ink with a white offset: on the ticket it
              turns over, a white ring with a dusk gap */}
          <Button
            asChild
            size="lg"
            className="self-start focus-visible:ring-background focus-visible:ring-offset-dusk lg:self-auto"
          >
            <a href={EXPAT_QUOTE_URL}>
              {t("expat.cta")} <ArrowRight />
            </a>
          </Button>
        </div>

        {/* the tear line: dashes inset to the text, a notch punched out of
            each edge where the desk shows through. It draws left to right
            as it arrives, the way the hero's route does, just before the
            stub's rails (globals.css, .ticket-tear) */}
        <div aria-hidden className="ticket-tear relative">
          <div className="ticket-tear-line mx-5 border-t border-dashed border-background/25 sm:mx-10 lg:mx-14" />
          <span className="absolute left-0 top-0 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute right-0 top-0 size-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-background" />
        </div>

        <div className="px-5 pb-10 pt-8 sm:px-10 lg:px-14 lg:pb-14">
          <h3 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-dusk-soft">
            {t("expat.closing.nextTitle")}
          </h3>
          {/* a sequence, so it rides the step rail like "How it works": the
              hairline draws and the step rises under it (globals.css) */}
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {NEXT.map((k, i) => (
              <li key={k} className="how-step relative pt-4" style={{ "--i": i } as React.CSSProperties}>
                <span aria-hidden className="how-step-rail absolute inset-x-0 top-0 h-px bg-background/20" />
                <div className="how-step-body flex items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-background/10 text-xs font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <span className="leading-snug text-background/90">{t(`expat.closing.${k}`)}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
