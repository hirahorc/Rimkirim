"use client";

import type * as React from "react";
import { ArrowRight, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/lib/utils/currency";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";

const FACTORS = ["route", "weight", "size", "surcharge"] as const;

/** three everyday pieces, front view, with their size weight worked out */
const PIECES = [
  { key: "cabin", l: 55, w: 40, h: 20, draw: "suitcase-s", face: 40 },
  { key: "box", l: 60, w: 40, h: 40, draw: "box", face: 60 },
  { key: "large", l: 75, w: 50, h: 30, draw: "suitcase-l", face: 50 },
] as const;

const sizeWeight = (p: (typeof PIECES)[number]) => (p.l * p.w * p.h) / 5000;

/** an svg drawn in centimetres, rendered at the row's --cm px per cm, so all
 *  three pieces share one scale and the box's bulk next to a suitcase is the
 *  lesson, not a decoration */
const cmBox = (w: number, h: number): React.CSSProperties => ({
  width: `calc(var(--cm) * ${w})`,
  height: `calc(var(--cm) * ${h})`,
});

/** a line drawing of one piece; ink hairlines, like the rest of the system */
function Piece({ draw }: { draw: (typeof PIECES)[number]["draw"] }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.25, vectorEffect: "non-scaling-stroke" as const };
  if (draw === "box") {
    // 60 wide × 40 tall face, flap seam and tape
    const w = 60, h = 40;
    return (
      <svg viewBox={`-1 -1 ${w + 2} ${h + 2}`} style={cmBox(w + 2, h + 2)} aria-hidden>
        <rect x="0" y="0" width={w} height={h} rx="1.3" {...stroke} />
        <line x1="0" y1={h * 0.28} x2={w} y2={h * 0.28} {...stroke} />
        <rect x={w / 2 - 4.7} y="0" width="9.4" height={h * 0.28} {...stroke} />
      </svg>
    );
  }
  // suitcases: face plus handle on top and wheels below
  const small = draw === "suitcase-s";
  const w = small ? 40 : 50;
  const h = small ? 55 : 75;
  const top = 10.7; // room for the handle
  const wheel = 3.3;
  return (
    <svg viewBox={`-1 ${-top - 1} ${w + 2} ${h + top + wheel + 2}`} style={cmBox(w + 2, h + top + wheel + 2)} aria-hidden>
      {small ? (
        // telescopic trolley handle
        <path d={`M${w * 0.35} 0 V${-top + 1.3} H${w * 0.65} V0`} {...stroke} />
      ) : (
        // carry handle
        <path d={`M${w * 0.35} 0 V-4 Q${w * 0.35} -6 ${w * 0.4} -6 H${w * 0.6} Q${w * 0.65} -6 ${w * 0.65} -4 V0`} {...stroke} />
      )}
      <rect x="0" y="0" width={w} height={h} rx="4.7" {...stroke} />
      {!small && (
        <>
          <line x1={w * 0.33} y1="5.3" x2={w * 0.33} y2={h - 5.3} {...stroke} />
          <line x1={w * 0.67} y1="5.3" x2={w * 0.67} y2={h - 5.3} {...stroke} />
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
 * one, gets a drawing instead of jargon, and surcharges are named in plain
 * words (suitcases included, since they aren't cardboard) with the full
 * Surcharge Information modal one tap away. No per-kilo rates here: the
 * calculator behind "Get a quote" gives the estimate, and the final price is
 * only ever confirmed against the real shipment.
 */
export function QuoteFactors() {
  const { t, locale } = useLanguage();
  return (
    <section aria-labelledby="pricing-heading" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.pricing} className="mb-8" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div>
            <SectionHead
              id="pricing-heading"
              eyebrow={t("expat.pricing.eyebrow")}
              title={t("expat.pricing.heading")}
              subtitle={t("expat.pricing.subtitle")}
            />
            <dl className="mt-10 border-t border-border">
              {FACTORS.map((f) => (
                <div key={f} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="font-medium">{t(`expat.pricing.${f}Title`)}</dt>
                  <dd className="text-sm text-muted">
                    {t(`expat.pricing.${f}Body`)}
                    {/* the full breakdown, the same modal the main site's
                        calculator opens: per-carrier handling surcharges,
                        then the other logistic costs */}
                    {f === "surcharge" && (
                      <SurchargeInfoDialog>
                        <button type="button" className="link-mark mt-1.5 block text-left">
                          {t("expat.pricing.surchargeCta")}
                        </button>
                      </SurchargeInfoDialog>
                    )}
                  </dd>
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

            {/* justified: first piece on the left edge, last on the right,
                equal space between, so the row fills the card evenly
                whatever each drawing's width */}
            {/* 1.5px per cm; 1.2 on the narrowest phones, where three
                pieces at full scale would be wider than the card */}
            <ul className="mt-8 flex items-start justify-between gap-2 [--cm:1.2px] min-[360px]:gap-3 min-[360px]:[--cm:1.5px] sm:gap-4">
              {PIECES.map((p) => (
                // never narrower than its own drawing: on a tight phone the
                // labels wrap, the pieces keep their true scale
                <li key={p.key} className="flex flex-col" style={{ minWidth: `calc(var(--cm) * ${p.face + 2})` }}>
                  {/* one shared baseline, so heights compare honestly */}
                  <div className="flex items-end text-foreground" style={{ height: "calc(var(--cm) * 92)" }}>
                    <Piece draw={p.draw} />
                  </div>
                  {/* phones wrap "Cabin suitcase" but not "Moving box": two lines
                      reserved there keep the size rows level across the three */}
                  <p className="mt-3 min-h-[2.75em] text-sm font-medium leading-snug sm:min-h-0">
                    {t(`expat.pricing.${p.key}`)}
                  </p>
                  {/* compact and unbroken, so the three fit side by side on any
                      phone and the rows stay level */}
                  <p className="mt-0.5 whitespace-nowrap text-xs text-muted-2">
                    {p.l}×{p.w}×{p.h} cm
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
