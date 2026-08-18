"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PortraitPlaceholder } from "@/components/ui/portrait-placeholder";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n/LanguageProvider";
import { TESTIMONIALS, RATING_SCORE, type Testimonial } from "@/lib/data/testimonials";

/**
 * Google Reviews social proof. Quotes render verbatim (see lib/data/testimonials).
 * Stars are monochrome ink, not gold — the One-Voice system keeps lime for the
 * primary CTA, and a rating is carried by weight, not a second accent colour.
 */
function Stars({
  value,
  starClass = "size-3.5",
  label,
  tone = "ink",
}: {
  value: number;
  starClass?: string;
  label?: string;
  /** `light` for stars sitting on the ink hook card */
  tone?: "ink" | "light";
}) {
  const filled = Math.round(value);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={label ?? `${value}/5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            starClass,
            i < filled
              ? tone === "light"
                ? "fill-background text-background"
                : "fill-foreground text-foreground"
              : tone === "light"
                ? "fill-none text-background/30"
                : "fill-none text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Emphasise each `highlights` phrase found in the quote with a heavier font
 * weight. Phrases are exact substrings (longest first, so a longer phrase wins
 * over a shorter overlap), so the visible text is byte-for-byte the verbatim
 * quote — only presentation changes.
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
 * the card edge; on mobile it is the first, wider slide of the carousel with the
 * photo on top. Until a consented photo exists, PortraitPlaceholder holds the slot.
 */
function FeaturedTestimonial({
  item,
  className,
}: {
  item: Testimonial;
  className?: string;
}) {
  const t = useT();
  const { name, quote, origin, affiliation, highlights, photo } = item;
  return (
    <article
      className={cn(
        "testi-card grid overflow-hidden rounded-lg bg-foreground text-background sm:grid-cols-[minmax(0,45%)_1fr]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[18rem]">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            sizes="(min-width: 640px) 45vw, 85vw"
            // keep the person centred with headroom; the wall/sign may crop
            className="object-cover object-[68%_25%]"
          />
        ) : (
          <PortraitPlaceholder initial={name.trim().charAt(0).toUpperCase()} />
        )}
        {/* attribution lives on the photo, over a dark→transparent scrim
            (requested — the one gradient in the system, functional, on imagery only) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/45 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
          <cite className="block truncate text-sm font-medium not-italic">{name}</cite>
          {affiliation && (
            <p className="truncate text-xs text-background/70">
              {t(`testimonial.affiliations.${affiliation}`)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-8">
        <blockquote className="whitespace-pre-line text-sm leading-relaxed">
          {highlightQuote(quote, highlights)}
        </blockquote>
        {origin && (
          <p className="mt-auto pt-6 text-xs text-background/60">
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
  const rest = TESTIMONIALS.filter((x) => x !== featured);
  return (
    <section
      id="ulasan"
      className="border-t border-border bg-background"
      aria-labelledby="ulasan-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t("testimonial.eyebrow")}
          </p>
          <h2
            id="ulasan-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t("testimonial.heading")}
          </h2>
          <div className="mt-5 inline-flex items-center gap-2.5">
            <Stars
              value={RATING_SCORE}
              starClass="size-5"
              label={`${t("testimonial.ratingScore")} ${t("testimonial.ratingLabel")}`}
            />
            <span className="font-display text-2xl font-semibold leading-none text-foreground">
              {t("testimonial.ratingScore")}
            </span>
            <span className="text-sm text-muted">{t("testimonial.ratingLabel")}</span>
          </div>
        </div>

        {/* sm+: the hook sits full-width above the masonry */}
        <FeaturedTestimonial
          item={featured}
          className="mx-auto mt-12 hidden max-w-5xl sm:grid"
        />

        {/* mobile: a full-bleed swipe carousel — the hook is the first slide;
            every card is the same width and stretches to the tallest one
            (items-stretch), attribution pinned to the foot; the next card peeks
            to signal the swipe. sm and up: variable-length quotes pack cleanly
            in CSS columns (masonry) */}
        <div
          className="scroll-strip -mx-4 mt-12 flex snap-x snap-mandatory items-stretch scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:mx-auto sm:mt-6 sm:block sm:max-w-5xl sm:columns-2 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 lg:columns-3"
          tabIndex={0}
          role="group"
          aria-label={t("testimonial.heading")}
        >
          <FeaturedTestimonial
            item={featured}
            className="mb-4 w-[85%] shrink-0 snap-start sm:hidden"
          />
          {rest.map(({ name, quote, origin, affiliation, highlights }) => (
            <Card
              key={name}
              className="testi-card mb-4 flex w-[85%] shrink-0 snap-start break-inside-avoid flex-col p-5 transition-colors hover:border-border-strong sm:w-auto sm:shrink"
            >
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
      </div>
    </section>
  );
}
