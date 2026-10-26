"use client";

import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Stars, highlightQuote } from "@/components/landing/TestimonialSection";
import {
  GOOGLE_REVIEWS_URL,
  RATING_SCORE,
  TESTIMONIALS,
  testimonialAnchor,
} from "@/lib/data/testimonials";
import { EXPAT_REVIEW_NAMES, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 02. People are handing their things to a company they may not know;
 * three reviews with a route attached are the reason to ask for a quote
 * anyway. Verbatim Google reviews only, and no invented affiliations: name and
 * route are all the proof says. On phones the cards become the house swipe
 * strip (DESIGN.md, Card grid → scroll strip): supporting content, so the peek
 * is enough at three cards.
 */
export function ExpatReviews() {
  const t = useT();
  const reviews = EXPAT_REVIEW_NAMES.flatMap((n) => TESTIMONIALS.find((r) => r.name === n) ?? []);
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="scroll-mt-24 border-t border-border bg-surface/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.reviews} className="mb-8" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHead
            id="reviews-heading"
            title={t("expat.reviews.heading")}
            subtitle={t("expat.reviews.subtitle")}
          />
          {/* the aggregate is checkable, never a bare number */}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("testimonial.ratingScore")} ${t("testimonial.ratingLabel")}, ${t("testimonial.ratingLinkLabel")}`}
            className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 sm:self-auto"
          >
            <Stars value={RATING_SCORE} starClass="size-4" />
            <span className="font-display text-xl font-semibold leading-none">{t("testimonial.ratingScore")}</span>
            <span className="text-sm text-muted transition-colors group-hover:text-foreground">
              {t("testimonial.ratingLabel")}
            </span>
            <ArrowUpRight aria-hidden className="size-4 text-muted-2 transition-colors group-hover:text-foreground" />
          </a>
        </div>

        <div
          className="scroll-strip -mx-4 mt-10 flex snap-x snap-mandatory items-stretch scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
          tabIndex={0}
          role="group"
          aria-label={`${reviews.length} ${t("testimonial.stripLabel")}`}
        >
          {reviews.map(({ name, quote, origin, highlights }) => (
            <Card
              key={name}
              id={testimonialAnchor(name)}
              className="testi-card flex w-[78%] shrink-0 snap-start flex-col rounded-lg px-6 py-7 sm:w-auto"
            >
              <blockquote className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {highlightQuote(quote, highlights)}
              </blockquote>
              <div className="mt-auto flex items-center gap-3 pt-6">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-semibold"
                >
                  {name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <cite className="block truncate font-medium not-italic">{name}</cite>
                  {origin && (
                    <p className="truncate text-xs text-muted-2">
                      {t(`testimonial.origins.${origin}`)} {t("testimonial.routeTo")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
