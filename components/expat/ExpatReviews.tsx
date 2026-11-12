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
 * Each reviewer's initial on a colour of their own, the same one wherever
 * their name is: soft grounds with a deep initial from the page's own palette
 * (the three chapter hues, the closing ticket's dusk, the parcels' kraft),
 * never lime, which is the door, nor a status colour, which would say
 * something. Initials stay 4.5:1 or more on their ground.
 */
const AVATAR = {
  sky: { tone: "sky", className: "bg-(--tone-wash) text-tone-ink" },
  violet: { tone: "violet", className: "bg-(--tone-wash) text-tone-ink" },
  magenta: { tone: "magenta", className: "bg-(--tone-wash) text-tone-ink" },
  dusk: { tone: undefined, className: "bg-dusk-soft text-dusk" },
  kraft: { tone: undefined, className: "bg-[#f3e3cc] text-[#7a4f22]" },
} as const;
const AVATAR_ORDER = ["sky", "violet", "magenta", "dusk", "kraft"] as const;

/** a review's origin as a country: the expat page names every route by
 *  country ("Australia to Indonesia", never a city beside three countries);
 *  the home page keeps the cities its reviews name */
const ORIGIN_COUNTRY: Record<string, string> = {
  uk: "uk",
  england: "uk",
  bristol: "uk",
  adelaide: "australia",
  germany: "germany",
  czechia: "czechia",
  newYork: "usa",
};
/** a country's flag, on the reviewer's avatar */
const COUNTRY_FLAG: Record<string, string> = {
  uk: "gb",
  australia: "au",
  germany: "de",
  czechia: "cz",
  usa: "us",
};

/**
 * The reviewer's initial as a coin: their colour, a white rim, and the flag
 * of where they shipped from tucked on its corner, so the route reads before
 * the words do.
 */
function ReviewAvatar({ name, country }: { name: string; country?: string }) {
  const a = avatarFor(name);
  const flag = country ? COUNTRY_FLAG[country] : undefined;
  return (
    <span aria-hidden className="relative shrink-0">
      <span
        data-tone={a.tone}
        className={cn("grid size-10 place-items-center rounded-full text-sm font-semibold ring-2 ring-background", a.className)}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
      {flag && (
        // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, as in Flag
        <img
          src={`/flags/4x3/${flag}.svg`}
          alt=""
          className="absolute -bottom-0.5 -right-1 size-4 rounded-full object-cover ring-2 ring-background"
        />
      )}
    </span>
  );
}

/**
 * Where the pointer is over a card, from its centre, for the light that runs
 * round its edge (globals.css, .review-card). Mouse only.
 */
function followPointer(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mouse-x", `${(e.clientX - r.left - r.width / 2).toFixed(1)}px`);
  e.currentTarget.style.setProperty("--mouse-y", `${(e.clientY - r.top - r.height / 2).toFixed(1)}px`);
}

/** a name's colour, by a small hash of the name (FNV-1a); the seed is the
 *  one that gives the four reviews on the page four different colours */
function avatarFor(name: string) {
  let h = (2166136261 ^ 24) >>> 0;
  for (const c of name.trim().toLowerCase()) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return AVATAR[AVATAR_ORDER[h % AVATAR_ORDER.length]];
}

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
 * and, from sm, stands as a tall card beside the other three stacked. Until
 * a consented photo exists, the slot asking for it stands in its place, for
 * every visitor: the tall photo card is part of the design, and the slot
 * keeps it. The photo takes up whatever height the stack has at rest, so the
 * two columns end level; once a review
 * unfolds, the photo keeps the height it had folded and its card stops
 * stretching (globals.css, .reviews-grid), so the frame and its crop never
 * change and the unfolded card simply grows. On phones the cards become the house swipe
 * strip (DESIGN.md, Card grid → scroll strip): supporting content, so the
 * peek is enough.
 */
export function ExpatReviews() {
  const t = useT();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLElement>(null);

  const reviews = EXPAT_REVIEWS.flatMap(({ name, photo }) => {
    const review = TESTIMONIALS.find((r) => r.name === name);
    return review ? [{ ...review, photo }] : [];
  });
  const hasPhoto = reviews.some((r) => r.photo !== undefined);

  // the photo's height while every review is folded: what it keeps once one
  // unfolds (a frozen frame, not a stretched one)
  React.useEffect(() => {
    const grid = gridRef.current;
    const frame = grid?.querySelector<HTMLElement>(".review-photo");
    if (!grid || !frame) return;
    const record = () => {
      if (!grid.querySelector('[aria-expanded="true"]')) {
        grid.style.setProperty("--photo-rest", `${frame.offsetHeight}px`);
      }
    };
    const ro = new ResizeObserver(record);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [hasPhoto]);

  // the section's ground, its chapter's wash, comes up only once the reader
  // has scrolled off the hero and into the section, and goes again on the
  // way back up (globals.css, [data-ground]): "in" is the section across the
  // line 30% up the screen, or already above the screen
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        root.dataset.ground = e.isIntersecting || e.boundingClientRect.top < 0 ? "on" : "";
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="reviews"
      aria-labelledby="reviews-heading"
      data-tone="sky"
      data-ground=""
      className="scroll-mt-24"
    >
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <ReviewNote note={REVIEW_NOTES.reviews} className="mb-8" />
        {/* it has its eyebrow again, as every section in the frame does: it
            went without one while the section showed from the hero's own
            viewport as a band (2026-11-02), where the label read as stray;
            under its own line and a section's space it reads as the start
            of a part */}
        <SectionHead
          id="reviews-heading"
          eyebrow={t("expat.reviews.eyebrow")}
          title={t("expat.reviews.heading")}
          subtitle={t("expat.reviews.subtitle")}
        />

        {/* on a phone each slide keeps its own height, top-aligned: these
            reviews run from two lines to a photo and a page, so one shared
            height left the short ones hollow (DESIGN.md, Card grid → scroll
            strip, the one exception) */}
        <div
          ref={gridRef}
          className="reviews-grid scroll-strip -mx-2 mt-8 flex snap-x snap-mandatory items-start sm:items-stretch scroll-px-2 gap-4 overflow-x-auto px-2 pb-1 sm:mt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
          tabIndex={0}
          role="group"
          aria-label={`${reviews.length} ${t("testimonial.stripLabel")}`}
        >
          {reviews.map(({ name, quote, origin, highlights, photo }, i) => (
            <Card
              key={name}
              id={testimonialAnchor(name)}
              // under a mouse the card's face opens out a few pixels and a
              // 1px edge lights up round it, brightest where the pointer is
              // (globals.css, .review-card). The face and edge are layers,
              // so the card itself paints nothing and clips nothing
              onPointerMove={followPointer}
              className={cn(
                "review-card testi-card relative flex w-[78%] shrink-0 snap-start flex-col rounded-lg bg-transparent sm:w-auto",
                // only a card with a photo stands tall beside the other three;
                // without one, the four are an even two by two
                i === 0 && photo !== undefined && "sm:row-span-3",
                photo !== undefined && "review-photo-card",
              )}
            >
              <span aria-hidden className="review-edge">
                <span className="review-glow" />
              </span>
              <span aria-hidden className="review-face" />
              {/* 16:10 at every width, so on a phone the photo card is not a
                  screen taller than its neighbours; from sm the tall card
                  hands the height the stack has to the photo (flex-1). The
                  slot asking for a photo keeps 4:3 on a phone, room for its
                  brief */}
              {/* the photo sits inside its card like a print, inset 12px
                  (16px from sm) on every side but the one facing the quote,
                  its corner the card's 28px less the inset (16px, then 12px)
                  so the two curves run parallel. The slot waiting for it
                  takes the same place, with the dashed "not here yet" edge */}
              {photo === null && (
                <PhotoSlot
                  shot={t("expat.photo.customerShot")}
                  avoid={t("expat.photo.customerAvoid")}
                  // tighter on a phone's narrow card, so the brief fits the 4:3
                  className="review-photo m-3 mb-0 aspect-[4/3] shrink-0 px-4 py-4 sm:m-4 sm:mb-0 sm:aspect-[16/10] sm:flex-1 sm:rounded-[12px] sm:px-6 sm:py-6"
                />
              )}
              {photo && (
                <div className="review-photo relative m-3 mb-0 aspect-[16/10] shrink-0 overflow-hidden rounded-md sm:m-4 sm:mb-0 sm:flex-1 sm:rounded-[12px]">
                  {/* a customer photo is a portrait more often than not: the
                      crop keeps the upper third, where the face is */}
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="(min-width: 640px) 50vw, 78vw"
                    className="object-cover object-[50%_28%]"
                  />
                </div>
              )}
              <div className={cn("relative flex flex-1 flex-col px-6 py-6", photo !== undefined && "sm:flex-none")}>
                <ReviewQuote quote={quote} highlights={highlights} />
                {/* names and routes wrap, never truncate: a customer's full
                    name ("Leticia Marina Bevilaqua") outruns a phone's card */}
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <ReviewAvatar name={name} country={origin && ORIGIN_COUNTRY[origin]} />
                  <div className="min-w-0">
                    <cite className="block font-medium leading-snug not-italic">{name}</cite>
                    {origin && (
                      <p className="mt-0.5 text-xs text-muted-2">
                        {t(`testimonial.origins.${ORIGIN_COUNTRY[origin] ?? origin}`)} {t("testimonial.routeTo")}
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
 * A quote past LONG opens on its first lines (six on a phone's narrow card,
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
          folded && "line-clamp-6 sm:line-clamp-4",
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
          className="link-mark tap-row relative mt-2 self-start rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        >
          {t(open ? "expat.reviews.less" : "expat.reviews.more")}
        </button>
      )}
    </>
  );
}
