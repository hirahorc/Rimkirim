"use client";

import * as React from "react";
import { ShieldCheck, DoorOpen, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/LanguageProvider";
import { testimonialAnchor } from "@/lib/data/testimonials";

/** Start delay + per-word step for the headline word cascade (seconds). */
const WORD_BASE = 0.12;
const WORD_STEP = 0.07;

/** Render a phrase as individually-animated words, continuing from `startIndex`. */
function Words({ text, startIndex }: { text: string; startIndex: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            className="hero-word"
            style={{ animationDelay: `${WORD_BASE + (startIndex + i) * WORD_STEP}s` }}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * The three verdicts that float beside the headline.
 *
 * The trust chips below the subtitle are promises in *our* voice; these are
 * what customers said back. Each one is our distillation of a real Google
 * review in `lib/data/testimonials.ts` — our words, not theirs, which is why
 * they are translated and why they are rendered WITHOUT quotation marks. They
 * are not a field on `Testimonial` for the same reason: putting an editorial
 * verdict in the review data would disguise our voice as the customer's.
 *
 * Each carries its reviewer and corridor, and links to that review's card in
 * #ulasan (via `testimonialAnchor(name)`) — a one-word verdict with no source
 * is a claim nobody can check, so every word is one click from its evidence.
 * `name` must match the testimonial's `name` field exactly or the anchor
 * misses its card.
 *
 * `side` places it in the page gutter; `top` was measured against the rendered
 * headline, subtitle and chip boxes so nothing ever overlaps them. `travel` is
 * the word's own scroll-parallax distance (`--verdict-travel`): three different
 * depths, all shorter than the hero text's 56px, so the three words read as
 * three sheets of glass at different distances rather than one moving layer.
 */
const VERDICTS = [
  // daelyn, Bristol: "everything arrived safely and was intact" — deepest
  { key: "hero.verdictIntact", name: "daelyn", origin: "testimonial.origins.bristol", side: "left", top: "9.5rem", travel: "14px" },
  // Elita Nuraeny, Adelaide: "very professional, attentive, and helpful" — nearest
  { key: "hero.verdictLookedAfter", name: "Elita Nuraeny", origin: "testimonial.origins.adelaide", side: "left", top: "22rem", travel: "46px" },
  // Ratna sari, Ceko: "in good condition and ontime" — middle
  { key: "hero.verdictOnTime", name: "Ratna sari", origin: "testimonial.origins.czechia", side: "right", top: "15rem", travel: "30px" },
] as const;

export function Hero() {
  const t = useT();
  const line = t("hero.titleLine");
  const highlight = t("hero.titleHighlight");
  const lineCount = line.split(" ").length;
  return (
    <section className="relative overflow-hidden">
      {/* the backdrop sits in an oversized box so it has room to drift without
          exposing an edge; the inner element keeps its own load-in fade */}
      <div className="hero-drift pointer-events-none absolute inset-x-0 -inset-y-12">
        <div className="grid-backdrop reveal-bg size-full" />
      </div>
      {/* Sibling of .hero-settle, not a child: each verdict gets its own,
          shorter parallax (14/30/46px against the hero's 56px) so the words
          lag behind the headline at three different depths.
          Gated at xl, not lg — at 1024px the gutter beside the max-w-4xl
          column is only 64px and "Tepat waktu" cannot sit there unbroken. */}
      {/* z-10: .hero-settle comes later in the DOM and would otherwise sit on
          top of this layer and swallow the verdicts' hover/click — the links
          were unreachable without it. Safe to raise: the layer itself is
          pointer-events-none, so the headline area stays fully interactive. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 mx-auto hidden max-w-[1180px] px-6 xl:block"
        aria-hidden={false}
      >
        <ul
          className="reveal relative size-full"
          style={{ animationDelay: "0.55s" }}
          aria-label={t("hero.verdictsLabel")}
        >
          {VERDICTS.map((v) => (
            /* the li carries the per-word parallax (transform), the inner div
               carries the idle float (translate) — two animations, an element
               each, same precedent as calc-rise/reveal-pop on the homepage */
            <li
              key={v.key}
              className={`hero-verdict-drift absolute max-w-[11rem] ${
                v.side === "left" ? "left-0 text-left" : "right-0 text-right"
              }`}
              style={{ top: v.top, "--verdict-travel": v.travel } as React.CSSProperties}
            >
              {/* The verdict is a deep link to its source review. States, all
                  in the colour channel ("Hover moves colour, not geometry"):
                  hover fills the hollow word with ink and steps the caption up
                  one grey; active pushes the caption to ink too; keyboard
                  focus gets the same ring idiom as the 4,9 rating link. The
                  parent layer is pointer-events-none, so only the word itself
                  is live — the empty gutter stays click-through. */}
              <a
                href={`#${testimonialAnchor(v.name)}`}
                aria-label={`${t(v.key)} — ${v.name}, ${t("hero.verdictCta")}`}
                className="group pointer-events-auto block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                <div className="hero-verdict-float">
                  {/* hollow display type: .hero-verdict-word swaps the muted fill
                      for a 1px ink stroke where text-stroke is supported, so the
                      grid backdrop shows through the letterforms. The clamp floor
                      is 32px at 1280 — "Didampingi" is one unbreakable word and
                      anything larger overruns the 192px gutter there. */}
                  {/* the ink fill on hover/active lives next to .hero-verdict-word
                      in globals.css — that rule is unlayered and outranks any
                      group-hover utility, so the state must live beside it.
                      The Tailwind fallbacks here only serve non-text-stroke
                      browsers. */}
                  <span className="hero-verdict-word block font-display text-[clamp(2rem,5vw_-_2rem,2.75rem)] font-bold leading-[0.95] tracking-tight text-muted transition-colors duration-200 group-hover:text-foreground group-active:text-foreground">
                    {t(v.key)}
                  </span>
                  {/* Label role, small and filled — the pairing against the big
                      hollow word above it is the point, and The Label-Ramp Rule
                      still separates parent and child. First name only: the full
                      name doesn't fit the gutter on one line, and it lives in
                      the aria-label and on the card this links to. */}
                  <span className="mt-2 block text-xs uppercase tracking-[0.04em] text-muted-2 transition-colors duration-200 group-hover:text-muted group-active:text-foreground">
                    {v.name.split(/\s+/)[0]} · {t(v.origin)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="hero-settle relative">
        <div className="reveal-stagger mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6 sm:pt-28">
        {/* neutral, not brand: the fold's lime budget belongs to the header CTA
            and the headline mark — a third lime pill (and an inert one, at that)
            makes the marker read as wallpaper. See DESIGN.md, The One-Voice Rule */}
        <Badge variant="neutral" className="mx-auto mb-5 sm:mb-6">
          {t("hero.badge")}
        </Badge>
        {/* display type runs 32px -> 76px; the 7.5vw slope keeps it fluid across
            the phone range (the old 38px floor pinned every phone to one heavy
            size and crowded the margins) while the ceiling holds desktop at 76px.
            Medium weight keeps it editorial rather than shouty at the large end */}
        <h1 className="hero-headline font-display text-[clamp(2rem,7.5vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          <Words text={line} startIndex={0} />
          <br />
          <span className="hero-mark">
            <Words text={highlight} startIndex={lineCount} />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-7 sm:text-xl">
          {t("hero.subtitle")}
        </p>
        {/* phones get a deliberate two-line pyramid: the long claim alone on
            top, the two short ones side by side under it. A plain 3-item wrap
            at 390px orphaned the LAST chip on its own centred line (read as a
            rendering fault), and the full trio doesn't fit one line (~414px in
            a 358px column even at 12px) — leading with the long chip makes the
            second line a pair, so the break reads as composition. `basis-full`
            forces the wrap after the first chip; sm+ resets to the single row. */}
        <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-2 sm:mt-8 sm:gap-x-6">
          <span className="flex basis-full items-center justify-center gap-1.5 sm:basis-auto">
            <ShieldCheck className="size-4 text-foreground" /> {t("hero.trustClearance")}
          </span>
          <span className="flex items-center gap-1.5">
            <DoorOpen className="size-4 text-foreground" /> {t("hero.trustDoorToDoor")}
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-4 text-foreground" /> {t("hero.trustPickup")}
          </span>
        </div>
        </div>
      </div>
    </section>
  );
}
