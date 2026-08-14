"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/lib/i18n/LanguageProvider";
import { TESTIMONIALS, RATING_SCORE } from "@/lib/data/testimonials";

/**
 * Google Reviews social proof. Quotes render verbatim (see lib/data/testimonials).
 * Stars are monochrome ink, not gold — the One-Voice system keeps lime for the
 * primary CTA, and a rating is carried by weight, not a second accent colour.
 */
function Stars({
  value,
  starClass = "size-3.5",
  label,
}: {
  value: number;
  starClass?: string;
  label?: string;
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
              ? "fill-foreground text-foreground"
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

export function TestimonialSection() {
  const t = useT();
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

        {/* mobile: a full-bleed swipe carousel — every card stretches to the
            tallest one (items-stretch), so short reviews carry white space at
            the bottom; the next card peeks to signal the swipe. sm and up:
            variable-length quotes pack cleanly in CSS columns (masonry) */}
        <div
          className="scroll-strip -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:mx-auto sm:block sm:max-w-5xl sm:columns-2 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 lg:columns-3"
          tabIndex={0}
          role="group"
          aria-label={t("testimonial.heading")}
        >
          {TESTIMONIALS.map(({ name, quote, origin, affiliation, highlights }) => (
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

              {/* attribution pinned to the card foot (mt-auto) — on the equal-
                  height mobile cards this leaves open space above it for imagery */}
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
