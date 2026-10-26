"use client";

import { ArrowDown, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/landing/TestimonialSection";
import { RATING_SCORE, TESTIMONIALS } from "@/lib/data/testimonials";
import { EXPAT_HERO_REVIEW, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { QuoteForm } from "./QuoteForm";
import { PhotoSlot } from "./PhotoSlot";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 01. Someone arriving from a search has to know within seconds that
 * this ships belongings to Indonesia, and what kind: the headline says where,
 * the subtitle says what and who does the hard parts, and the fit line
 * screens out full-house moves without sounding like a refusal. The quote
 * form sits beside it, not below a scroll, and one verbatim review stands in
 * for the trust a stranger has not given us yet (brief 02: "a short, genuine
 * review just below the hero").
 */
export function ExpatHero() {
  const t = useT();
  const review = TESTIMONIALS.find((r) => r.name === EXPAT_HERO_REVIEW.name);
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="grid-backdrop reveal-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:pb-20 lg:pt-16">
        <ReviewNote note={REVIEW_NOTES.hero} className="mb-3" />
        <ReviewNote note={REVIEW_NOTES.form} className="mb-6" />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
          <div className="reveal-stagger">
            <Badge variant="neutral">{t("expat.hero.eyebrow")}</Badge>
            {/* looser than the home hero's 1.05: here the mark runs over two
                lines, and at 1.05 its fill swallowed the descenders above it */}
            <h1 className="mt-5 text-balance font-display text-[clamp(2.25rem,5.4vw,3.75rem)] font-medium leading-[1.18] tracking-[-0.02em]">
              <span className="block">{t("expat.hero.title1")}</span>
              <span className="hero-mark">{t("expat.hero.title2")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t("expat.hero.subtitle")}
            </p>
            <p className="mt-5 flex max-w-xl items-start gap-2 text-sm text-foreground">
              <PackageCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
              {t("expat.hero.fit")}
            </p>

            {review && (
              <figure className="mt-8 max-w-xl border-l border-border-strong pl-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Stars value={RATING_SCORE} />
                  <span className="font-display text-sm font-semibold">{t("testimonial.ratingScore")}</span>
                  <span className="text-sm text-muted">{t("expat.hero.onGoogle")}</span>
                </div>
                {/* verbatim, lowercase and all: the customer's words are the
                    evidence (lib/data/testimonials.ts) */}
                <blockquote className="mt-2 text-sm text-foreground">
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

            <PhotoSlot
              shot={t("expat.photo.heroShot")}
              avoid={t("expat.photo.heroAvoid")}
              className="mt-10 hidden min-h-56 lg:flex"
            />
          </div>

          <div className="reveal-pop" style={{ animationDelay: "0.3s" }}>
            <QuoteForm id="quote" />
          </div>

          <PhotoSlot
            shot={t("expat.photo.heroShot")}
            avoid={t("expat.photo.heroAvoid")}
            className="min-h-56 lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
