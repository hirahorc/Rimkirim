"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
 * chapter's wash, from a deep-violet head carrying the white wordmark and
 * the page's "door to door, by air" in a lime brand badge, down to "Get a
 * quote" at its foot (from md; a phone keeps the button under the table).
 * It rises above the header rule and runs below the last row, so it reads
 * as the column laid on top, the one to take. Each Rimkirim answer leads
 * with a short headline in the display face, so the lane can be skimmed as
 * the pitch on its own; the typical options sit plain and muted on the
 * desk beside it. Honest by construction: no competitor named, and no
 * ticks or crosses to exaggerate the gap (the brief rules them out).
 * A real table at every width (DESIGN.md, The Real-Table Rule).
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
  const last = ROWS.length - 1;
  return (
    <section aria-labelledby="compare-heading" data-tone="violet">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <ReviewNote note={REVIEW_NOTES.compare} className="mb-8" />
        <SectionHead
          id="compare-heading"
          eyebrow={t("expat.compare.eyebrow")}
          title={t("expat.compare.heading")}
          subtitle={t("expat.compare.subtitle")}
        />

        {/* a phone reads it down, row by row: what's compared, our answer on
            the lane's pale tint, then the typical one under it, so no cell
            is squeezed to two or three words a line */}
        <div className="mt-8 md:hidden">
          <div className="flex items-center justify-between gap-3 rounded-t-lg bg-tone-ink px-4 py-3.5">
            <Image
              src="/rimkirim-logo-white.png"
              alt="Rimkirim"
              width={1796}
              height={618}
              sizes="58px"
              className="h-5 w-auto"
            />
            <span className="text-xs font-medium text-background/80">{t("expat.compare.caption")}</span>
          </div>
          <ul className="divide-y divide-border border-b border-border">
            {ROWS.map((key) => (
              <li key={key} className="py-5">
                <p className="text-sm font-medium text-muted">{t(`expat.compare.${key}`)}</p>
                <div className="mt-2 rounded-md bg-surface-2 px-4 py-3">
                  <p className="font-display text-base font-semibold leading-snug tracking-tight">
                    {t(`expat.compare.${key}Lead`)}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted">{t(`expat.compare.${key}Ours`)}</p>
                </div>
                <p className="mt-3 text-sm leading-snug text-muted-2">
                  <span className="font-medium text-muted">{t("expat.compare.typical")}:</span>{" "}
                  {t(`expat.compare.${key}Typical`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* separate borders: only they let the lane's cells keep their
            rounded ends. From md, where three columns have room */}
        <table className="mt-12 hidden w-full table-fixed border-separate border-spacing-0 text-left md:table">
          <caption className="sr-only">{t("expat.compare.caption")}</caption>
          <colgroup>
            <col className="w-[24%] md:w-[11rem] lg:w-[13rem]" />
            <col className="w-[42%] md:w-[46%]" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <td className="border-b border-border-strong" />
              <th
                scope="col"
                className="rounded-t-lg bg-tone-ink px-3 pb-5 pt-6 align-bottom md:px-7 md:pb-6 md:pt-9"
              >
                <Image
                  src="/rimkirim-logo-white.png"
                  alt="Rimkirim"
                  width={1796}
                  height={618}
                  sizes="(min-width: 768px) 82px, 58px"
                  className="h-5 w-auto md:h-7"
                />
                <Badge variant="brand" className="mt-4 hidden md:inline-flex">
                  {t("expat.hero.boardLabel")}
                </Badge>
              </th>
              <th
                scope="col"
                className="border-b border-border-strong px-3 pb-5 align-bottom font-normal md:px-7 md:pb-6"
              >
                <span className="block font-display text-sm font-semibold text-muted">{t("expat.compare.typical")}</span>
                <span className="mt-1 hidden text-xs leading-snug text-muted-2 md:block">
                  {t("expat.compare.typicalNote")}
                </span>
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
                    "py-5 pr-3 align-top text-sm font-medium leading-snug md:py-7 md:pr-6 md:text-base",
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
                    "bg-surface-2 px-3 py-5 align-top md:px-7 md:py-7",
                    i < last ? "border-b border-background/80" : "rounded-b-lg md:rounded-b-none",
                  )}
                >
                  <p
                    className={cn(
                      LIGHT,
                      "font-display text-sm font-semibold leading-snug tracking-tight md:text-lg",
                      "pointer-fine:group-hover/row:text-tone-ink",
                    )}
                  >
                    {t(`expat.compare.${key}Lead`)}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted md:mt-1.5 md:text-sm md:leading-relaxed">
                    {t(`expat.compare.${key}Ours`)}
                  </p>
                </td>
                <td
                  className={cn(
                    LIGHT,
                    "px-3 py-5 align-top text-sm leading-snug text-muted-2 md:px-7 md:py-7 md:text-sm md:leading-relaxed",
                    i < last && "border-b border-border",
                    "pointer-fine:group-hover/row:text-foreground",
                  )}
                >
                  {t(`expat.compare.${key}Typical`)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* the lane ends on the way in, from md where the column is wide
              enough to hold the button */}
          <tfoot className="hidden md:table-footer-group">
            <tr>
              <td />
              <td className="rounded-b-lg bg-surface-2 px-7 pb-8 pt-1">
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

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-2">{t("expat.compare.footnote")}</p>
        <Button asChild size="lg" className="mt-8 w-full md:hidden">
          <a href={EXPAT_QUOTE_URL}>
            {t("expat.cta")} <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
