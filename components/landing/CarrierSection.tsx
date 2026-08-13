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
 * Files live in /public/carriers. `sf-express.svg` ships in-repo; the raster
 * logos are dropped in with the filenames below. A new logo only needs its
 * intrinsic aspect ratio (width ÷ height of its viewBox) to slot in balanced.
 */
const RAMP = { k: 40, p: 0.3 } as const;
const heightFor = (aspect: number) => Math.round(RAMP.k / aspect ** RAMP.p);

const CARRIERS = [
  { name: "DHL", src: "/carriers/dhl.svg", aspect: 6.92 },
  { name: "FedEx", src: "/carriers/fedex.svg", aspect: 4.31 },
  { name: "UPS", src: "/carriers/ups.svg", aspect: 0.843 },
  { name: "Aramex", src: "/carriers/aramex.svg", aspect: 6.15 },
  { name: "SF Express", src: "/carriers/sf-express.svg", aspect: 1 },
  { name: "Rayspeed Asia", src: "/carriers/rayspeed.svg", aspect: 6.92 },
] as const;

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
          className="text-center text-xs font-medium uppercase tracking-[0.14em] text-muted"
        >
          {t("carrier.eyebrow")}
        </p>
        <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-16">
          {CARRIERS.map(({ name, src, aspect }) => (
            <li key={name} className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo dims
                  come from the file; height is set per aspect, width stays natural */}
              <img
                src={src}
                alt={name}
                loading="lazy"
                className="w-auto max-w-[200px] shrink-0 object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                style={{ height: heightFor(aspect) }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
