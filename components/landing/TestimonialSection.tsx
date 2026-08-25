"use client";

import * as React from "react";
import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PortraitPlaceholder } from "@/components/ui/portrait-placeholder";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  TESTIMONIALS,
  RATING_SCORE,
  GOOGLE_REVIEWS_URL,
  testimonialAnchor,
  type Testimonial,
} from "@/lib/data/testimonials";

/**
 * Google Reviews social proof. Quotes render verbatim (see lib/data/testimonials).
 * Stars are monochrome ink, not gold — the One-Voice system keeps lime for the
 * primary CTA, and a rating is carried by weight, not a second accent colour.
 */
function Stars({
  value,
  starClass = "size-3.5",
}: {
  value: number;
  starClass?: string;
}) {
  const filledClass = "fill-foreground text-foreground";
  const emptyClass = "fill-none text-border-strong";
  return (
    // inside the labelled rating link the stars are redundant to a screen reader
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        // a 4.9 must not draw as five solid marks — the fifth star carries the
        // remainder as a real partial fill, clipped from the left
        const fill = Math.min(Math.max(value - i, 0), 1);
        if (fill === 0 || fill === 1) {
          return (
            <Star
              key={i}
              strokeWidth={1.5}
              aria-hidden
              className={cn(starClass, fill === 1 ? filledClass : emptyClass)}
            />
          );
        }
        return (
          <span key={i} className="relative inline-flex" aria-hidden>
            <Star strokeWidth={1.5} className={cn(starClass, emptyClass)} />
            <span
              className="absolute bottom-0 left-0 top-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star strokeWidth={1.5} className={cn(starClass, filledClass)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Emphasise the quote's single strongest phrase with a heavier font weight.
 * Phrases are exact substrings (longest first, so a longer phrase wins over a
 * shorter overlap), so the visible text is byte-for-byte the verbatim quote —
 * only presentation changes.
 */
function highlightQuote(quote: string, highlights?: string[]) {
  if (!highlights?.length) return quote;
  const ordered = [...highlights].sort((a, b) => b.length - a.length);
  const pattern = ordered
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`(${pattern})`, "g");
  return quote.split(re).map((part, i) =>
    highlights.includes(part) ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * The hook: one pinned review on an ink card with the customer's photo. On
 * sm+ it spans the full column above the masonry, photo left (~45%) bleeding to
 * the card edge; on mobile it is the first slide of the carousel with the photo
 * on top. The quote carries display type — "featured" has to mean a louder
 * voice, not just a bigger box. Until a consented photo exists,
 * PortraitPlaceholder holds the slot.
 */
function FeaturedTestimonial({
  item,
  className,
  id,
}: {
  item: Testimonial;
  className?: string;
  /** deep-link anchor — set on ONE instance only (the card renders twice) */
  id?: string;
}) {
  const t = useT();
  const { name, quote, origin, affiliation, highlights, photo } = item;
  return (
    <article
      id={id}
      className={cn(
        // grid-cols-1 below sm: an implicit auto track sizes to its content and
        // overflowed the card's own 78% width by ~15px, so the truncate ellipsis
        // was computed outside the visible box
        "testi-card grid scroll-mt-24 grid-cols-1 overflow-hidden rounded-lg bg-foreground text-background sm:grid-cols-[minmax(0,45%)_1fr]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[20rem]">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(min-width: 640px) 45vw, 78vw"
            // keep the person centred with headroom; the wall/sign may crop.
            // the container is always wider-per-height than the 2:3 source, so
            // `cover` scales by width and only the vertical term does any work
            className="object-cover object-[50%_38%]"
          />
        ) : (
          <PortraitPlaceholder initial={name.trim().charAt(0).toUpperCase()} />
        )}
        {/* attribution lives on the photo, over a dark→transparent scrim
            (requested — the one gradient in the system, functional, on imagery
            only). The ramp is deep enough to hold 4.5:1 against the brightest
            patch of the photo, not just its average. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/95 via-foreground/70 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
          <cite className="block truncate text-sm font-medium not-italic">{name}</cite>
          {affiliation && (
            <p className="truncate text-xs text-background/80">
              {t(`testimonial.affiliations.${affiliation}`)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-8">
        {/* the quote is the loudest voice in the section: display type, tight
            leading, optically centred in the tall panel on sm+ */}
        <blockquote className="whitespace-pre-line font-display text-lg leading-snug sm:my-auto sm:max-w-[46ch] sm:text-2xl">
          {highlightQuote(quote, highlights)}
        </blockquote>
        {origin && (
          <p className="mt-auto pt-6 text-xs text-background/70">
            {t(`testimonial.origins.${origin}`)} {t("testimonial.routeTo")}
          </p>
        )}
      </div>
    </article>
  );
}

export function TestimonialSection() {
  const t = useT();
  const featured = TESTIMONIALS.find((x) => x.featured) ?? TESTIMONIALS[0];
  // longest quote first: source order was arbitrary, and the substantial
  // reviews (the one carrying a dated customs timeline) were landing last —
  // on mobile that meant behind ~1300px of horizontal scroll
  const rest = React.useMemo(
    () =>
      TESTIMONIALS.filter((x) => x !== featured).sort(
        (a, b) => b.quote.length - a.quote.length,
      ),
    [featured],
  );

  const stripRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const slideCount = rest.length + 1;

  // the strip scrolls ~5 viewports on a phone; without a position signal the
  // last slides are content most visitors never learn exists
  React.useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const slides = Array.from(strip.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(slides.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { root: strip, threshold: 0.6 },
    );
    slides.forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, []);

  const goToSlide = (i: number) => {
    const slide = stripRef.current?.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section
      id="ulasan"
      className="border-t border-border bg-background"
      aria-labelledby="ulasan-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t("testimonial.eyebrow")}
          </p>
          <h2
            id="ulasan-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t("testimonial.heading")}
          </h2>
          {/* the aggregate has to be checkable: an unlinked, uncounted score is
              the visual signature of an invented one.
              Hover is the arrow's nudge and nothing else. That is a deliberate
              exception to DESIGN.md's Motion rule ("everything else is a 0.2s
              colour/border transition") — the same kind of one-off as .nav-expat,
              and guarded the same way: motion-safe carries the travel, and
              motion-reduce falls back to colour so the hover still answers. */}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("testimonial.ratingScore")} ${t("testimonial.ratingLabel")} — ${t("testimonial.ratingLinkLabel")}`}
            className="group mt-5 inline-flex items-center gap-2.5 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            <Stars value={RATING_SCORE} starClass="size-5" />
            <span className="font-display text-2xl font-semibold leading-none text-foreground">
              {t("testimonial.ratingScore")}
            </span>
            <span className="text-sm text-muted">{t("testimonial.ratingLabel")}</span>
            <ArrowUpRight className="size-4 text-muted-2 motion-safe:transition-transform motion-safe:group-hover:-translate-y-px motion-safe:group-hover:translate-x-px motion-reduce:transition-colors motion-reduce:group-hover:text-foreground" />
          </a>
        </div>

        {/* sm+: the hook sits full-width above the masonry */}
        <FeaturedTestimonial
          item={featured}
          id={testimonialAnchor(featured.name)}
          className="mx-auto mt-12 hidden max-w-5xl sm:grid"
        />

        {/* mobile: a full-bleed swipe carousel — the hook is the first slide;
            every card shares one width and stretches to the tallest so the deck
            reads as one object while swiping, attribution pinned to the foot
            (mt-auto); the next card peeks to signal the swipe. sm and up:
            variable-length quotes pack cleanly in CSS columns (masonry) */}
        <div
          ref={stripRef}
          className="scroll-strip -mx-4 mt-12 flex snap-x snap-mandatory items-stretch scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 sm:mx-auto sm:mt-6 sm:block sm:max-w-5xl sm:columns-2 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0"
          tabIndex={0}
          role="group"
          aria-label={`${slideCount} ${t("testimonial.stripLabel")}`}
        >
          <FeaturedTestimonial
            item={featured}
            className="w-[78%] shrink-0 snap-start sm:hidden"
          />
          {rest.map(({ name, quote, origin, affiliation, highlights }) => (
            <Card
              key={name}
              id={testimonialAnchor(name)}
              className="testi-card flex w-[78%] shrink-0 snap-start scroll-mt-24 break-inside-avoid flex-col p-5 transition-colors hover:border-border-strong sm:mb-4 sm:w-auto sm:shrink"
            >
              {/* every card opens on the same line: quote first, then the
                  route. The slides are stretched to the tallest card, and the
                  slack is spent at the foot (mt-auto on the attribution) rather
                  than by re-centring each review — centring made the first line
                  land at a different height on every swipe. */}
              <blockquote className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {highlightQuote(quote, highlights)}
              </blockquote>

              {origin && (
                <p className="mt-4 text-xs text-muted-2">
                  {t(`testimonial.origins.${origin}`)} {t("testimonial.routeTo")}
                </p>
              )}

              {/* attribution pinned to the card foot (mt-auto) */}
              <div className="mt-auto flex items-center gap-3 pt-6">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-semibold text-foreground"
                >
                  {name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <cite className="block truncate font-medium not-italic text-foreground">
                    {name}
                  </cite>
                  {affiliation && (
                    <p className="truncate text-xs text-muted-2">
                      {t(`testimonial.affiliations.${affiliation}`)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* position signal for the strip. The dots read as one row, so the hit
            target is narrowed to 24px and kept 44px tall — 6px dots spaced 44px
            apart looked like six unrelated marks. 24×44 still clears the WCAG
            2.2 target-size minimum, and the targets sit flush with no dead gap. */}
        <div className="mt-2 flex justify-center sm:hidden">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`${t("testimonial.slideLabel")} ${i + 1}`}
              aria-current={i === active}
              className="grid h-11 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === active ? "bg-foreground" : "bg-border-strong",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
