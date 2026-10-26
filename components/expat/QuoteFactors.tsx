"use client";

import { ArrowRight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/lib/utils/currency";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

const FACTORS = ["route", "weight", "size", "type"] as const;

/** px per cm: every piece below is drawn to the same scale, so the box's
 *  bulk next to a suitcase is the lesson, not a decoration */
const S = 1.5;

/** three everyday pieces, front view, with their size weight worked out */
const PIECES = [
  { key: "cabin", l: 55, w: 40, h: 20, draw: "suitcase-s" },
  { key: "box", l: 60, w: 40, h: 40, draw: "box" },
  { key: "large", l: 75, w: 50, h: 30, draw: "suitcase-l" },
] as const;

const sizeWeight = (p: (typeof PIECES)[number]) => (p.l * p.w * p.h) / 5000;

/** a line drawing of one piece; ink hairlines, like the rest of the system */
function Piece({ draw }: { draw: (typeof PIECES)[number]["draw"] }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.25, vectorEffect: "non-scaling-stroke" as const };
  if (draw === "box") {
    // 60 wide × 40 tall face, flap seam and tape
    const w = 60 * S, h = 40 * S;
    return (
      <svg width={w + 2} height={h + 2} viewBox={`-1 -1 ${w + 2} ${h + 2}`} aria-hidden>
        <rect x="0" y="0" width={w} height={h} rx="2" {...stroke} />
        <line x1="0" y1={h * 0.28} x2={w} y2={h * 0.28} {...stroke} />
        <rect x={w / 2 - 7} y="0" width="14" height={h * 0.28} {...stroke} />
      </svg>
    );
  }
  // suitcases: face plus handle on top and wheels below
  const small = draw === "suitcase-s";
  const w = (small ? 40 : 50) * S;
  const h = (small ? 55 : 75) * S;
  const top = 16; // room for the handle
  const wheel = 5;
  return (
    <svg width={w + 2} height={h + top + wheel + 2} viewBox={`-1 ${-top - 1} ${w + 2} ${h + top + wheel + 2}`} aria-hidden>
      {small ? (
        // telescopic trolley handle
        <path d={`M${w * 0.35} 0 V${-top + 2} H${w * 0.65} V0`} {...stroke} />
      ) : (
        // carry handle
        <path d={`M${w * 0.35} 0 V-6 Q${w * 0.35} -9 ${w * 0.4} -9 H${w * 0.6} Q${w * 0.65} -9 ${w * 0.65} -6 V0`} {...stroke} />
      )}
      <rect x="0" y="0" width={w} height={h} rx="7" {...stroke} />
      {!small && (
        <>
          <line x1={w * 0.33} y1="8" x2={w * 0.33} y2={h - 8} {...stroke} />
          <line x1={w * 0.67} y1="8" x2={w * 0.67} y2={h - 8} {...stroke} />
        </>
      )}
      <circle cx={w * 0.18} cy={h + wheel / 2} r={wheel / 2} {...stroke} />
      <circle cx={w * 0.82} cy={h + wheel / 2} r={wheel / 2} {...stroke} />
    </svg>
  );
}

/**
 * Brief 05. People hesitate when a bulky piece is quoted high, so the cost
 * drivers come before the enquiry, in plain words: route, weight, size, type.
 * The one idea that surprises everyone, that a light box can cost like a heavy
 * one, gets a drawing instead of jargon. No published rates here: the
 * calculator behind "Get a quote" gives the estimate, and the final price is
 * only ever confirmed against the real shipment.
 */
export function QuoteFactors() {
  const { t, locale } = useLanguage();
  return (
    <section aria-labelledby="pricing-heading" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.pricing} className="mb-8" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div>
            <SectionHead
              id="pricing-heading"
              title={t("expat.pricing.heading")}
              subtitle={t("expat.pricing.subtitle")}
            />
            <dl className="mt-10 border-t border-border">
              {FACTORS.map((f) => (
                <div key={f} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="font-medium">{t(`expat.pricing.${f}Title`)}</dt>
                  <dd className="text-sm text-muted">{t(`expat.pricing.${f}Body`)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-lg font-medium">{t("expat.pricing.promise")}</p>
            <Button asChild variant="secondary" className="mt-5">
              <a href={EXPAT_QUOTE_URL}>
                {t("expat.cta")} <ArrowRight />
              </a>
            </Button>
          </div>

          <Card className="self-start rounded-lg px-6 py-7">
            <h3 className="font-display text-xl font-semibold tracking-tight">{t("expat.pricing.guideTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("expat.pricing.guideBody")}</p>

            <ul className="mt-8 grid grid-cols-3 gap-3">
              {PIECES.map((p) => (
                <li key={p.key} className="flex flex-col">
                  {/* one shared baseline, so heights compare honestly */}
                  <div className="flex h-36 items-end text-foreground">
                    <Piece draw={p.draw} />
                  </div>
                  <p className="mt-3 text-sm font-medium leading-snug">{t(`expat.pricing.${p.key}`)}</p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {p.l} × {p.w} × {p.h} cm
                  </p>
                  <p className="mt-1 text-xs font-medium">
                    {t("expat.pricing.bySize").replace("{kg}", formatNumber(sizeWeight(p), 1, locale))}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-7 flex items-start gap-2.5 rounded-md bg-surface-2 px-4 py-3 text-sm leading-relaxed">
              <Ruler aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
              {t("expat.pricing.tip")}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
