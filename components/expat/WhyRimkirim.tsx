"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

/** the brief's seven rows, in its order; packing is left out on purpose,
 *  since "How it works" covers it */
const ROWS = ["cost", "clearance", "paperwork", "door", "size", "tracking", "support"] as const;

/** a row lights up under the mouse, in the colour channel only, so the eye
 *  can follow one aspect across the table's width */
const LIGHT = "transition-colors duration-200";

/**
 * Brief 04b, "Why Rimkirim": visitors from a search are often weighing a
 * courier against a full relocation company, so a plain comparison shows
 * where Rimkirim sits between the two.
 *
 * Rimkirim is a lane laid across a ruled sheet: one continuous card in the
 * chapter's wash, from a deep-violet head carrying the white wordmark down
 * to "Check your rate" at its foot (from md; a phone keeps the button under
 * the list). It rises above the header rule and runs below the last row, so
 * it reads as the column laid on top, the one to take. Each Rimkirim answer
 * leads with a short headline in the display face, so the lane can be
 * skimmed as the pitch on its own; the typical options sit beside it as
 * wide as it is and in the same voice, plain on the desk. Honest by
 * construction: no competitor named, and no ticks or crosses to exaggerate
 * the gap (the brief rules them out). A real table from md; a phone reads
 * it down, row by row (DESIGN.md, The Real-Table Rule).
 * Copy is pending ops verification (`?review=1`).
 *
 * Set in four type sizes, seven steps of space and five colours, and
 * nothing else (DESIGN.md, Why Rimkirim's scales):
 *   20/28 display 600  a Rimkirim headline (16/24 on a phone, where 20
 *                      wrapped half of them)
 *   14/20              every answer, a row's name (medium), a column's name
 *   12/16              a column's note, the footnote
 *   4 8 12 16 24 32 48
 *   Ink, Muted, the lane's wash, the head's violet, lime for the button
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
  const last = ROWS.length - 1;
  return (
    <section aria-labelledby="compare-heading" data-tone="violet">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <ReviewNote note={REVIEW_NOTES.compare} className="mb-8" />
        <SectionHead
          id="compare-heading"
          eyebrow={t("expat.compare.eyebrow")}
          title={t("expat.compare.heading")}
          subtitle={t("expat.compare.subtitle")}
        />

        {/* a phone reads it down, row by row: what's compared, our answer
            on the lane's wash, then the typical one under it, so no cell is
            squeezed to two or three words a line. No head over it: there
            are no columns here for one to name, and the wash says which
            answer is ours */}
        <ul className="mt-8 divide-y divide-border border-y border-border md:hidden">
          {ROWS.map((key) => (
            <li key={key} className="py-4">
              <p className="text-sm font-medium text-muted">{t(`expat.compare.${key}`)}</p>
              <div className="mt-2 rounded-md bg-surface-2 px-4 py-3">
                <p className="font-display text-base font-semibold tracking-tight">{t(`expat.compare.${key}Lead`)}</p>
                <p className="mt-1 text-sm text-muted">{t(`expat.compare.${key}Ours`)}</p>
              </div>
              <p className="mt-3 text-sm text-muted">
                <span className="font-medium text-foreground">{t("expat.compare.typical")}:</span>{" "}
                {t(`expat.compare.${key}Typical`)}
              </p>
            </li>
          ))}
        </ul>

        {/* separate borders: only they let the lane's cells keep their
            rounded ends. From md, where three columns have room; the lane
            and the typical options split what the names leave, half each */}
        <table className="mt-12 hidden w-full table-fixed border-separate border-spacing-0 text-left text-sm md:table">
          <caption className="sr-only">{t("expat.compare.caption")}</caption>
          <colgroup>
            <col className="w-[9rem] lg:w-[12rem]" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <td className="border-b border-border-strong" />
              <th scope="col" className="rounded-t-lg bg-tone-ink px-4 pb-4 pt-6 align-bottom lg:px-6">
                <Image
                  src="/rimkirim-logo-white.png"
                  alt="Rimkirim"
                  width={1796}
                  height={618}
                  sizes="82px"
                  className="h-7 w-auto"
                />
              </th>
              <th scope="col" className="border-b border-border-strong px-4 pb-4 align-bottom font-normal lg:px-6">
                <span className="block font-medium">{t("expat.compare.typical")}</span>
                <span className="mt-1 block text-xs text-muted">{t("expat.compare.typicalNote")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((key, i) => (
              <tr key={key} className="group/row">
                <th
                  scope="row"
                  className={cn(
                    LIGHT,
                    // 24 down where the lane's headline is 16: 8 more puts
                    // the name on the headline's baseline, 20 on a 28 line
                    "pb-4 pr-4 pt-6 align-top font-medium text-muted",
                    i < last && "border-b border-border",
                    "pointer-fine:group-hover/row:text-tone-ink",
                  )}
                >
                  {t(`expat.compare.${key}`)}
                </th>
                {/* the lane: hairlines in white, so the rows read through it
                    without ruling it like the sheet underneath */}
                <td
                  className={cn(
                    "bg-surface-2 px-4 py-4 align-top lg:px-6",
                    i < last && "border-b border-background/80",
                  )}
                >
                  <p
                    className={cn(
                      LIGHT,
                      "font-display text-xl font-semibold tracking-tight",
                      "pointer-fine:group-hover/row:text-tone-ink",
                    )}
                  >
                    {t(`expat.compare.${key}Lead`)}
                  </p>
                  <p className="mt-1 text-muted">{t(`expat.compare.${key}Ours`)}</p>
                </td>
                <td
                  className={cn(
                    LIGHT,
                    "px-4 pb-4 pt-6 align-top text-muted lg:px-6",
                    i < last && "border-b border-border",
                    "pointer-fine:group-hover/row:text-foreground",
                  )}
                >
                  {t(`expat.compare.${key}Typical`)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* the lane ends on the way in */}
          <tfoot>
            <tr>
              <td />
              <td className="rounded-b-lg bg-surface-2 px-4 pb-6 pt-2 lg:px-6">
                <Button asChild size="lg">
                  <a href={EXPAT_QUOTE_URL}>
                    {t("expat.cta")} <ArrowRight />
                  </a>
                </Button>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 max-w-2xl text-xs text-muted">{t("expat.compare.footnote")}</p>
        <Button asChild size="lg" className="mt-8 w-full md:hidden">
          <a href={EXPAT_QUOTE_URL}>
            {t("expat.cta")} <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
