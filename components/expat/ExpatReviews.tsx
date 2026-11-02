"use client";

import * as React from "react";
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

/** past this many characters a quote opens folded, behind "Read more" */
const LONG = 600;

/**
 * Brief 02. People are handing their things to a company they may not know;
 * reviews with a route attached are the reason to ask for a quote anyway.
 * One is a real expat's, Leticia's, in full as she asked and without a photo,
 * also at her request: it opens on a few lines that trail off, and "Read
 * more" unfolds the rest in place. The others are placeholders: verbatim reviews
 * from Indonesians who moved home stand in until more expat customers send
 * theirs (EXPAT_REVIEWS), so there is no star rating and no Google link,
 * since no expat has reviewed us on Google yet. Name and route only, no
 * invented affiliations. The first review carries the customer's own photo
 * (a placeholder until a consented one exists) and, from sm, stands as a
 * tall card beside the other three stacked. The photo takes up whatever
 * height the stack adds, Leticia's unfolded review included, so it never
 * leaves its neighbours hollow. On phones the cards become the house swipe
 * strip (DESIGN.md, Card grid → scroll strip): supporting content, so the
 * peek is enough.
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

        {/* once a quote is unfolded, a phone's strip lets each card keep its
            own height, so its neighbours don't stretch into empty cards */}
        <div
          className="scroll-strip -mx-4 mt-10 flex snap-x snap-mandatory items-stretch max-sm:has-[[aria-expanded=true]]:items-start scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
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
                i === 0 && "sm:row-span-3",
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
                <ReviewQuote quote={quote} highlights={highlights} />
                {/* names and routes wrap, never truncate: a customer's full
                    name ("Leticia Marina Bevilaqua") outruns a phone's card */}
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-semibold"
                  >
                    {name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <cite className="block font-medium leading-snug not-italic">{name}</cite>
                    {origin && (
                      <p className="mt-0.5 text-xs text-muted-2">
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

/**
 * A quote past LONG opens on its first lines (eight on a phone's narrow card,
 * four from sm, about the same words) and trails off mid-sentence on an
 * ellipsis, so it reads as unfinished. While folded its paragraphs run
 * together, so the fold never lands on the blank line between two of them.
 * "Read more", in the page's link style, unfolds the rest in place,
 * paragraphs and all. Instant, no height animation: it is read once, and the
 * words are the point.
 */
function ReviewQuote({ quote, highlights }: { quote: string; highlights?: string[] }) {
  const t = useT();
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const long = quote.length > LONG;
  const folded = long && !open;
  return (
    <>
      <blockquote
        id={id}
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-foreground",
          folded && "line-clamp-8 sm:line-clamp-4",
        )}
      >
        {highlightQuote(folded ? quote.replace(/\s*\n+\s*/g, " ") : quote, highlights)}
      </blockquote>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="link-mark mt-2 self-start rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        >
          {t(open ? "expat.reviews.less" : "expat.reviews.more")}
        </button>
      )}
    </>
  );
}
