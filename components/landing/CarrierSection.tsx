"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Carrier partners logo cloud.
 *
 * Balance is by optical weight, not by equal height. In a horizontal strip a
 * 6:1 wordmark (DHL, Aramex) at the same height as a compact badge (UPS shield,
 * SF roundel) reads far heavier — the letters spread across ~150px while the
 * badge is a ~25px stamp. So height is set on a ramp keyed to each logo's aspect
 * ratio: wide marks sit shorter, compact marks sit taller, and every logo lands
 * at roughly equal presence. Tuned against a rendered comparison — see the
 * `logo-lab` pass; `RAMP.p` between ~0.30 (this) and ~0.45 trades wordmark
 * dominance for badge dominance.
 *
 * `capScale` corrects the ramp's one blind spot: it assumes a solid mark whose
 * box height *is* its optical size. Rayspeed is the only mixed-case wordmark, so
 * its ascenders/descenders (y, p) inflate the box — measured, its cap band is
 * only 225 of its 296-unit viewBox, ~24% shorter caps than the all-caps marks at
 * the same height. `capScale` lifts it back to the group's cap-height, letting
 * the descenders overhang the shared baseline the way a real lockup would.
 *
 * On mobile every logo shrinks uniformly via `--logo-scale`, so the whole strip
 * is lighter on a phone while the per-mark balance ratios are preserved exactly.
 *
 * Wrapping is deliberately locked, not left to the greedy default. Below `md` the
 * list is capped narrow enough that it can only ever be a centered 3 + 3 — aramex
 * can't creep up into row one, which is what made the mid-widths orphan a lone
 * logo. At `md` it becomes a single non-wrapping row with `justify-between`, so the
 * whitespace between adjacent marks is identical across the strip — the gap from
 * one logo's edge to the next is the same everywhere. (This relies on every logo
 * being cropped tight to its ink: a mark with transparent padding in its viewBox
 * would fake an uneven gap, which is exactly what the FedEx file did before it was
 * cropped to 0 0 2300 684.)
 *
 * Files live in /public/carriers. `sf-express.svg` ships in-repo; the rest are
 * dropped in with the filenames below. A new logo only needs its intrinsic aspect
 * ratio (width ÷ height of its viewBox) to slot in balanced.
 */
const RAMP = { k: 40, p: 0.3 } as const;
const heightFor = (aspect: number) => Math.round(RAMP.k / aspect ** RAMP.p);

type Carrier = { name: string; src: string; aspect: number; capScale?: number };

const CARRIERS: Carrier[] = [
  { name: "DHL", src: "/carriers/dhl.svg", aspect: 6.92 },
  { name: "FedEx", src: "/carriers/fedex.svg", aspect: 3.36 },
  { name: "UPS", src: "/carriers/ups.svg", aspect: 0.843 },
  { name: "Aramex", src: "/carriers/aramex.svg", aspect: 6.15 },
  { name: "SF Express", src: "/carriers/sf-express.svg", aspect: 1 },
  { name: "Rayspeed Asia", src: "/carriers/rayspeed.svg", aspect: 6.92, capScale: 1.27 },
];

export function CarrierSection() {
  const t = useT();
  return (
    <section
      id="carrier"
      className="border-t border-border bg-surface/40"
      aria-labelledby="carrier-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p
          id="carrier-heading"
          className="text-center font-display text-xs font-medium uppercase tracking-[0.14em] text-muted"
        >
          {t("carrier.eyebrow")}
        </p>
        <ul className="mx-auto mt-9 flex max-w-[340px] flex-wrap items-center justify-center gap-x-4 gap-y-6 [--logo-scale:0.78] md:max-w-none md:flex-nowrap md:justify-between md:gap-x-0 md:gap-y-0 md:[--logo-scale:0.9] lg:[--logo-scale:1]">
          {CARRIERS.map(({ name, src, aspect, capScale = 1 }) => (
            <li key={name} className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo dims
                  come from the file; height is set per aspect, width stays natural */}
              <img
                src={src}
                alt={name}
                loading="lazy"
                className="w-auto max-w-[200px] shrink-0 object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                style={{
                  height: `calc(${Math.round(heightFor(aspect) * capScale)}px * var(--logo-scale))`,
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
