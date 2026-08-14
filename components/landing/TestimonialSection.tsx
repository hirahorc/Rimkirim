"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Flag } from "@/components/shared/Flag";
import { RouteArrow } from "@/components/ui/route-arrow";
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

        {/* variable-length quotes pack cleanly in CSS columns (masonry) — no
            ragged grid rows, no JS; on a phone it collapses to one column */}
        <div className="mx-auto mt-12 max-w-5xl columns-1 gap-4 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map(({ name, rating, quote, route }) => (
            <Card
              key={name}
              className="testi-card mb-4 break-inside-avoid p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-3">
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
                  <Stars value={rating} label={`${rating}/5`} />
                </div>
              </div>

              <blockquote className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {quote}
              </blockquote>

              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-2">
                <span>{t("testimonial.source")}</span>
                {route && (
                  <span className="inline-flex items-center gap-1.5">
                    <Flag code={route.code} size={13} />
                    <span>{route.label}</span>
                    <RouteArrow className="size-3" />
                    <Flag code="ID" size={13} />
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
