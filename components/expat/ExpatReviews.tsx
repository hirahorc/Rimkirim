"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { highlightQuote } from "@/components/landing/TestimonialSection";
import { TESTIMONIALS, testimonialAnchor } from "@/lib/data/testimonials";
import { EXPAT_REVIEWS, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { PhotoSlot } from "./PhotoSlot";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 02. People are handing their things to a company they may not know;
 * three reviews with a route attached are the reason to ask for a quote
 * anyway. Placeholders for now: verbatim reviews from Indonesians who moved
 * home stand in until the expat customers being approached send theirs
 * (EXPAT_REVIEWS), so there is no star rating and no Google link, since
 * no expat has reviewed us on Google yet. Name and route only, no invented
 * affiliations. The first review carries the customer's own photo (a
 * placeholder until a consented one exists) and, from sm, stands as a tall
 * card beside the other two stacked, so the photo never leaves its
 * neighbours hollow. On phones the cards become the house swipe
 * strip (DESIGN.md, Card grid → scroll strip): supporting content, so the peek
 * is enough at three cards.
 */
export function ExpatReviews() {
  const t = useT();
  const reviews = EXPAT_REVIEWS.flatMap(({ name, photo }) => {
    const review = TESTIMONIALS.find((r) => r.name === name);
    return review ? [{ ...review, photo }] : [];
  });
  return (
    <section id="reviews" aria-labelledby="reviews-heading" data-tone="sky" className="band scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.reviews} className="mb-8" />
        <SectionHead
          id="reviews-heading"
          title={t("expat.reviews.heading")}
          subtitle={t("expat.reviews.subtitle")}
        />

        <div
          className="scroll-strip -mx-4 mt-10 flex snap-x snap-mandatory items-stretch scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
          tabIndex={0}
          role="group"
          aria-label={`${reviews.length} ${t("testimonial.stripLabel")}`}
        >
          {reviews.map(({ name, quote, origin, highlights, photo }, i) => (
            <Card
              key={name}
              id={testimonialAnchor(name)}
              className={cn(
                "testi-card flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-lg sm:w-auto",
                i === 0 && "sm:row-span-2",
              )}
            >
              {/* 4:3 on phones, 16:10 from sm. Both ratios are floors: the
                  placeholder sits in flow, so on a card too narrow for its
                  brief it grows instead of clipping, and from sm the tall card
                  hands any height the stacked pair adds to the photo (flex-1),
                  never to a gap between the quote and its name */}
              {/* white like its card: at the slot's own Panel 2 it melted into
                  the band and the card lost its top edge. The dashed foot is
                  the slot's "not here yet" mark, where its border would be;
                  px-6 puts its words on the quote's left edge */}
              {photo === null && (
                <PhotoSlot
                  bleed
                  shot={t("expat.photo.customerShot")}
                  avoid={t("expat.photo.customerAvoid")}
                  className="aspect-[4/3] w-full shrink-0 border-b border-dashed border-border-strong bg-background px-6 sm:aspect-[16/10] sm:flex-1"
                />
              )}
              {photo && (
                <div className="relative aspect-[4/3] w-full shrink-0 sm:aspect-[16/10] sm:flex-1">
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="(min-width: 640px) 50vw, 78vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className={cn("flex flex-1 flex-col px-6 py-7", photo !== undefined && "sm:flex-none")}>
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
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
