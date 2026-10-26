"use client";

import { WA_URL } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { QuoteForm } from "./QuoteForm";

const NEXT = ["next1", "next2", "next3"] as const;

/**
 * Brief 09. After reading this far nobody should have to scroll back up to
 * find the form, so the form is here too: the same one, sharing its state
 * with the hero's, still asking what and how much before who. What happens
 * after sending sits beside it, because "and then what?" is the last doubt.
 */
export function ExpatClosing() {
  const t = useT();
  return (
    <section aria-labelledby="closing-heading" className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
        <div className="lg:pt-6">
          <h2
            id="closing-heading"
            className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t("expat.closing.heading")}
          </h2>
          <p className="mt-3 max-w-lg text-muted">{t("expat.closing.subtitle")}</p>

          <h3 className="mt-10 font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
            {t("expat.closing.nextTitle")}
          </h3>
          <ol className="mt-4 space-y-3">
            {NEXT.map((k, i) => (
              <li key={k} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-medium tabular-nums">
                  {i + 1}
                </span>
                <span>{t(`expat.closing.${k}`)}</span>
              </li>
            ))}
          </ol>

          <p className="mt-10">
            <a href={WA_URL} target="_blank" rel="noreferrer" className="link-mark text-sm">
              {t("expat.closing.wa")}
            </a>
          </p>
        </div>

        <QuoteForm />
      </div>
    </section>
  );
}
