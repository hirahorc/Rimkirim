"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapseHeight } from "@/components/ui/disclosure";
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
 * the table). It rises above the header rule and runs below the last row, so
 * it reads as the column laid on top, the one to take. Each Rimkirim answer
 * leads with a short headline in the display face, so the lane can be
 * skimmed as the pitch on its own; the typical options sit beside it as
 * wide as it is and in the same voice, plain on the desk. Honest by
 * construction: no competitor named, and no ticks or crosses to exaggerate
 * the gap (the brief rules them out). A real table at every width: on a
 * phone two columns, ours and the typical options' side by side, each with
 * a headline, and the sentences behind a tap on the aspect (DESIGN.md, The
 * comparison lane).
 * Copy is pending ops verification (`?review=1`).
 *
 * Set in four type sizes, seven steps of space and five colours, and
 * nothing else (DESIGN.md, Why Rimkirim's scales):
 *   20/28 display 600  a Rimkirim headline (16/24 on a phone, where 20
 *                      wrapped half of them, and where the typical
 *                      options have one too)
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
  /** the aspects opened on a phone, to read both sides' sentences */
  const [open, setOpen] = React.useState<ReadonlySet<string>>(() => new Set());
  const toggle = (key: string) =>
    setOpen((was) => {
      const now = new Set(was);
      if (!now.delete(key)) now.add(key);
      return now;
    });
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

        {/* a phone keeps the two sides side by side, half the width each,
            as a table: each aspect's name across both, then each side's
            headline under its column's name, which stays in view under the
            page's header while the rows go by. The sentences would run
            seven or eight lines in a column this narrow, so they wait
            behind the aspect: a tap anywhere on it opens both at once */}
        <table className="mt-8 w-full table-fixed border-separate border-spacing-0 text-left text-sm md:hidden">
          <caption className="sr-only">{t("expat.compare.caption")}</caption>
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <thead>
            <tr>
              {/* the page's ground behind the head, so the rows passing
                  under it never show past its rounded corners. Both heads
                  one line, 44 tall, so what stays in view is no more than
                  it needs: the column's note is the subtitle's and the
                  footnote's already */}
              <th scope="col" className="sticky top-16 z-10 bg-background p-0 align-bottom">
                <span className="block rounded-t-lg bg-tone-ink p-3">
                  <Image
                    src="/rimkirim-logo-white.png"
                    alt="Rimkirim"
                    width={1796}
                    height={618}
                    sizes="64px"
                    className="h-5 w-auto"
                  />
                </span>
              </th>
              <th
                scope="col"
                className="sticky top-16 z-10 border-b border-border-strong bg-background p-3 align-bottom font-medium"
              >
                {t("expat.compare.typical")}
              </th>
            </tr>
          </thead>
          {ROWS.map((key, i) => {
            const isOpen = open.has(key);
            const id = `compare-${key}`;
            return (
              // the whole aspect takes the tap; the button is its control
              // for the keyboard and assistive tech, and its click bubbles
              // up here, so it toggles once
              <tbody key={key} onClick={() => toggle(key)} className="cursor-pointer">
                <tr>
                  {/* the lane runs on behind the name, through its half */}
                  <th
                    scope="rowgroup"
                    colSpan={2}
                    className="p-0 font-normal [background:linear-gradient(to_right,var(--surface-2)_50%,transparent_50%)]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-ours ${id}-typical`}
                      className="flex w-full items-center justify-between gap-3 rounded-sm px-3 pb-1 pt-4 text-left font-medium text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60"
                    >
                      {/* kept to the lane's half, so a long name wraps
                          there and never runs over the lane's edge */}
                      <span className="max-w-[calc(50%-0.75rem)]">{t(`expat.compare.${key}`)}</span>
                      {/* swap, never rotate: the shared disclosure idiom */}
                      {isOpen ? (
                        <ChevronUp aria-hidden className="size-4 shrink-0" />
                      ) : (
                        <ChevronDown aria-hidden className="size-4 shrink-0" />
                      )}
                    </button>
                  </th>
                </tr>
                <tr>
                  <td
                    className={cn(
                      "bg-surface-2 px-3 pb-4 align-top",
                      i < last ? "border-b border-background/80" : "rounded-b-lg",
                    )}
                  >
                    <p className="font-display text-base font-semibold tracking-tight">
                      {t(`expat.compare.${key}Lead`)}
                    </p>
                    <CollapseHeight open={isOpen} id={`${id}-ours`}>
                      <p className="pt-1 text-muted">{t(`expat.compare.${key}Ours`)}</p>
                    </CollapseHeight>
                  </td>
                  <td className={cn("px-3 pb-4 align-top", i < last && "border-b border-border")}>
                    <p className="font-display text-base font-semibold tracking-tight">
                      {t(`expat.compare.${key}TypicalLead`)}
                    </p>
                    <CollapseHeight open={isOpen} id={`${id}-typical`}>
                      <p className="pt-1 text-muted">{t(`expat.compare.${key}Typical`)}</p>
                    </CollapseHeight>
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>

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
