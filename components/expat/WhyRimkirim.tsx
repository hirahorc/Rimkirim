"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

/** the brief's seven rows, in its order; packing is left out on purpose,
 *  since "How it works" covers it */
const ROWS = ["cost", "clearance", "paperwork", "door", "size", "tracking", "support"] as const;

const CELL = "px-3 py-4 align-top md:px-6 md:py-5";

/**
 * Brief 04b, "Why Rimkirim": visitors from a search are often weighing a
 * courier against a full moving company, so a plain comparison shows where
 * Rimkirim sits between the two. One table at every width, in one bordered
 * sheet: the aspect, Rimkirim, then the typical options. Rimkirim's column
 * is tinted the chapter's panel under a header in its deep tone carrying the
 * wordmark, so it reads as "ours" at a glance. Honest by construction:
 * "typical options" covers both ends without naming anyone, and there are
 * no crosses or ticks to exaggerate the gap (the brief rules them out).
 * Copy is pending ops verification (`?review=1`).
 *
 * "Typical options" summarises what these providers publish, read on
 * 2026-10-29 (named here only, never on the page):
 * - https://www.excessluggage.co.uk/shipping-personal-effects-to-indonesia/
 *   and https://www.excessluggage.co.uk/: UK export customs handled, import
 *   clearance "the importer's own responsibility", air delivered to the
 *   arrival airport, the valued packing list the customer's, no furniture.
 * - https://www.sevenseasworldwide.com/en-us/: online itemised quote,
 *   boxes and bags to whole homes, a tracker for MoveCube only.
 * - https://www.dehaan.nl/en/moving-to-indonesia/ (with /quote/ and
 *   /services/customs-formalities/): a quote after a home or video survey,
 *   whole or part households, customs guided with partners, sometimes
 *   with the customer present.
 */
export function WhyRimkirim() {
  const t = useT();
  return (
    <section aria-labelledby="compare-heading" data-tone="violet">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.compare} className="mb-8" />
        <SectionHead
          id="compare-heading"
          eyebrow={t("expat.compare.eyebrow")}
          title={t("expat.compare.heading")}
          subtitle={t("expat.compare.subtitle")}
        />

        {/* the sheet clips the cells to its corners, the Rimkirim column's
            tint and header included */}
        <div className="mt-12 overflow-hidden rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-left text-[0.8125rem] md:text-sm">
            <caption className="sr-only">{t("expat.compare.caption")}</caption>
            <colgroup>
              <col className="w-[26%] md:w-[13rem]" />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <td />
                <th scope="col" className="bg-tone-ink px-3 py-4 align-bottom md:px-6 md:py-5">
                  <Image
                    src="/rimkirim-logo-white.png"
                    alt="Rimkirim"
                    width={1796}
                    height={618}
                    sizes="64px"
                    className="h-5 w-auto"
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 align-bottom font-display text-xs font-medium uppercase tracking-[0.04em] text-muted md:px-6 md:py-5"
                >
                  {t("expat.compare.typical")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((key) => (
                <tr key={key}>
                  <th scope="row" className={`${CELL} border-t border-border font-medium leading-snug md:leading-relaxed`}>
                    {t(`expat.compare.${key}`)}
                  </th>
                  <td className={`${CELL} border-t border-border-strong bg-surface-3 leading-snug md:leading-relaxed`}>
                    {t(`expat.compare.${key}Ours`)}
                  </td>
                  <td className={`${CELL} border-t border-border leading-snug text-muted md:leading-relaxed`}>
                    {t(`expat.compare.${key}Typical`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-muted-2">{t("expat.compare.footnote")}</p>
        <Button asChild size="lg" className="mt-8">
          <a href={EXPAT_QUOTE_URL}>
            {t("expat.cta")} <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
