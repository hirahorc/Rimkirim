"use client";

import { Card } from "@/components/ui/card";
import { REVIEW_NOTES, SHIPMENT_EXAMPLES } from "@/lib/data/expat";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote, useReviewMode } from "./ReviewNote";

const countryName = (code: string, locale: string) =>
  new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;

/**
 * Brief 07, optional: real shipments with a route, what was sent and a short
 * comment. The brief keeps it "only if there is proof worth showing", so with
 * no approved examples the section does not exist; in review mode its slot
 * says so instead of disappearing silently. Once it has proof it is a band
 * after the steps' desk; the FAQ after it is a band too, so when this ships
 * the page's desk/band order needs one more pass (DESIGN.md, The Band Rule).
 */
export function ShipmentExamples() {
  const { t, locale } = useLanguage();
  const review = useReviewMode();
  if (SHIPMENT_EXAMPLES.length === 0) {
    return review ? (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.examples} />
      </div>
    ) : null;
  }
  return (
    <section aria-labelledby="examples-heading" data-tone="magenta">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHead
          id="examples-heading"
          title={t("expat.examples.heading")}
          subtitle={t("expat.examples.subtitle")}
        />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {SHIPMENT_EXAMPLES.map((e) => (
            <li key={`${e.customer}-${e.origin}`}>
              <Card className="h-full rounded-lg px-6 py-6">
                <p className="text-xs text-muted-2">
                  {countryName(e.origin, locale)} {t("testimonial.routeTo")}
                </p>
                <p className="mt-2 font-medium">{e.sent[locale]}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{e.comment[locale]}</p>
                <p className="mt-4 text-sm">{e.customer}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
