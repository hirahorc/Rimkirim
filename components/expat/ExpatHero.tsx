"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Words } from "@/components/landing/Hero";
import { TESTIMONIALS } from "@/lib/data/testimonials";
import { EXPAT_HERO_REVIEW, EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { PhotoDeck } from "./PhotoDeck";
import { RouteBoard } from "./RouteBoard";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 01. Someone arriving from a search has to know within seconds that
 * this ships belongings to Indonesia, and what kind: the headline says where,
 * and the subtitle, the brief's own line, says what ships and that we help
 * coordinate the journey. The one
 * action is "Get a quote", which opens the relocation calculator (estimate,
 * eligibility, details, then WhatsApp); "see how it works" serves whoever
 * wants the steps first. One verbatim review stands in for the trust a
 * stranger has not given us yet (brief 02: "a short, genuine review just
 * below the hero"). The right-hand column, as on the live page, is a pile
 * of real shipment photos the visitor can flip through (PhotoDeck).
 */
export function ExpatHero() {
  const t = useT();
  const title1 = t("expat.hero.title1");
  const review = TESTIMONIALS.find((r) => r.name === EXPAT_HERO_REVIEW.name);
  return (
    <section data-tone="sky" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:pb-20 lg:pt-16">
        <ReviewNote note={REVIEW_NOTES.hero} className="mb-3" />
        <ReviewNote note={REVIEW_NOTES.cta} className="mb-6" />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div className="reveal-stagger">
            {/* the eyebrow is a departures board, origin flipping to IDN;
                the label beside it says how the route is travelled */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <RouteBoard />
              <span className="font-display text-xs font-medium uppercase tracking-[0.14em] text-tone-ink">
                {t("expat.hero.boardLabel")}
              </span>
            </div>
            {/* looser than the home hero's 1.05: here the mark runs over two
                lines, and at 1.05 its fill swallowed the descenders above it.
                Capped at 52px so, beside the 30rem photo deck, the headline
                stays within four lines and the button stays above the fold. Words
                arrive one by one, the brand's hero entrance (as on the home
                page), while the lime mark sits ready behind them */}
            <h1 className="hero-headline mt-5 text-balance font-display text-[clamp(2.25rem,4.6vw,3.25rem)] font-medium leading-[1.18] tracking-[-0.02em]">
              <span className="block">
                <Words text={title1} startIndex={0} />
              </span>
              <span className="hero-mark">
                <Words text={t("expat.hero.title2")} startIndex={title1.split(" ").length} />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t("expat.hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button asChild size="lg">
                <a href={EXPAT_QUOTE_URL}>
                  {t("expat.cta")} <ArrowRight />
                </a>
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-md py-1 font-display text-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                {t("expat.hero.how")} <ArrowDown aria-hidden className="size-4" />
              </a>
            </div>

            {review && (
              // no star rating: there are no expat reviews on Google yet, and
              // the main site's 4.9 is not this page's to claim
              <figure className="mt-10 max-w-xl border-l border-border-strong pl-4">
                {/* verbatim, lowercase and all: the customer's words are the
                    evidence (lib/data/testimonials.ts) */}
                <blockquote className="text-sm text-foreground">
                  “…{EXPAT_HERO_REVIEW.excerpt}”
                </blockquote>
                <figcaption className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-2">
                  <span>
                    {review.name}, {review.origin && t(`testimonial.origins.${review.origin}`)}{" "}
                    {t("testimonial.routeTo")}
                  </span>
                  <a href="#reviews" className="link-mark inline-flex items-center gap-1">
                    {t("expat.hero.readReviews")} <ArrowDown aria-hidden className="size-3.5" />
                  </a>
                </figcaption>
              </figure>
            )}
          </div>

          {/* one 5:4 pile at every width, popping in after the copy */}
          <div className="reveal-pop" style={{ animationDelay: "0.3s" }}>
            <PhotoDeck />
          </div>
        </div>
      </div>
    </section>
  );
}
