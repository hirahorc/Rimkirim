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
 * hero's, into the relocation calculator. Beside it, what that door leads
 * to, in the order the visitor will meet it (estimate, eligibility, details,
 * then our team on WhatsApp), because "and then what?" is the last doubt.
 */
export function ExpatClosing() {
  const t = useT();
  return (
    <section aria-labelledby="closing-heading" className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id="closing-heading"
              className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {t("expat.closing.heading")}
            </h2>
            <p className="mt-3 max-w-lg text-muted">{t("expat.closing.subtitle")}</p>
          </div>
          <Button asChild size="lg" className="self-start lg:self-auto">
            <a href={EXPAT_QUOTE_URL}>
              {t("expat.cta")} <ArrowRight />
            </a>
          </Button>
        </div>

        <h3 className="mt-12 font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
          {t("expat.closing.nextTitle")}
        </h3>
        {/* a sequence, so it rides the step rail like "How it works": the
            hairline draws and the step rises under it (globals.css) */}
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {NEXT.map((k, i) => (
            <li key={k} className="how-step relative pt-4" style={{ "--i": i } as React.CSSProperties}>
              <span aria-hidden className="how-step-rail absolute inset-x-0 top-0 h-px bg-border-strong" />
              <div className="how-step-body flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-medium tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-snug">{t(`expat.closing.${k}`)}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
