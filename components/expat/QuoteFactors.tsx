"use client";

import * as React from "react";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { SceneStage } from "./SceneStage";
import { ChargeableScene, RateScene, SumScene, SurchargeScene } from "./PricingScenes";
import { useMedia } from "./useMedia";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** `frame`: the picture's shape where the steps are stacked, as tall as what
 *  it holds and no taller; side by side they share one */
const STEPS = [
  { key: "step1", Scene: ChargeableScene, frame: "aspect-[4/3]" },
  { key: "step2", Scene: SumScene, frame: "aspect-[3/2]" },
  { key: "step3", Scene: RateScene, frame: "aspect-[4/3]" },
  { key: "step4", Scene: SurchargeScene, frame: "aspect-[4/3]" },
] as const;

/** when each picture's turn comes, ms into the relay: as the one before
 *  lands the figure it hands over (PricingScenes) */
const TURN = [0, 2400, 4300, 6800];
/** the four cards come up together, this far apart, and wait their turn */
const ARRIVE_MS = 120;

/** idle: not on screen yet · playing · paused: by the control · done:
 *  every picture that was playing has landed */
type Mode = "idle" | "playing" | "paused" | "done";

/**
 * Brief 05. People hesitate when a bulky piece is quoted high, so how the
 * price is worked out comes before the enquiry. It was a list of what
 * affects the price (route, weight, dimension, surcharges), which left the
 * reader to work out how they combine; it is now the sum itself, said once
 * under the heading and then step by step in the order it's done: each
 * piece's chargeable weight, rounded up to the next whole kilo (ops' rule:
 * a piece at a time, before they're added), the pieces added up, times the
 * rate per kilo, plus a handling surcharge where a piece needs one. The words are the
 * carriers' and the main site's: actual, volumetric and chargeable weight.
 * No per-kilo rates and no surcharge amounts here: Check Rate, behind
 * "Check your rate", gives the rate, the Surcharge Information modal is one
 * tap from step 4, and the final price comes on the invoice.
 *
 * Each step has its own picture over its words (PricingScenes), a short
 * motion graphic working the sum on one example. Four in a row from xl
 * (below it a quarter of the page is too narrow for a picture's type), they
 * play once as a relay, each taking its turn as the one before lands
 * the figure it hands over, about ten seconds in all; so the row has a
 * control that pauses, resumes and replays (content that moves on its own
 * for more than five seconds has to be pausable), and it holds off screen
 * and in a hidden tab. Two by two and stacked, each plays as it comes into
 * view and none runs past four seconds, so there is no control. A click on
 * a picture plays that one again, at once. Under reduced motion nothing
 * plays: every picture stands as it ends, with no control and nothing to
 * click. DESIGN.md, Motion, "The section scenes".
 */
export function QuoteFactors() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the steps in
  // the order the sum is done, the promise and the way in
  const rootRef = useSectionReveal<HTMLElement>();
  const railRef = React.useRef<HTMLOListElement>(null);
  const row = useMedia("(min-width: 1280px)");
  const still = useMedia("(prefers-reduced-motion: reduce)");
  const relay = row && !still;
  const [mode, setMode] = React.useState<Mode>("idle");
  // bumping a picture's `n` plays it again; `alone` is one played by a
  // click, at once and out of the relay
  const [plays, setPlays] = React.useState(() => STEPS.map(() => ({ n: 0, alone: false })));
  /** the pictures still playing */
  const running = React.useRef(new Set<number>());

  // off screen and in a hidden tab the relay holds (globals.css, [data-hold])
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const hold = { view: false, tab: document.hidden };
    const apply = () => rail.toggleAttribute("data-hold", hold.view || hold.tab);
    const io = new IntersectionObserver(([e]) => {
      hold.view = !e.isIntersecting;
      apply();
    });
    io.observe(rail);
    const onVisibility = () => {
      hold.tab = document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const built = (i: number) => {
    running.current.add(i);
    setMode("playing");
  };
  /** a picture's last piece has landed (PricingScenes, data-scene-end) */
  const landed = (e: React.AnimationEvent<HTMLOListElement>) => {
    const piece = e.target as HTMLElement;
    if (!piece.hasAttribute("data-scene-end")) return;
    running.current.delete(Number(piece.closest<HTMLElement>("[data-step]")?.dataset.step));
    if (running.current.size === 0) setMode("done");
  };
  const again = (i: number) => {
    setPlays((p) => p.map((x, j) => (j === i ? { n: x.n + 1, alone: true } : x)));
    setMode("playing");
  };
  const control = () => {
    if (mode === "playing") setMode("paused");
    else if (mode === "paused") setMode("playing");
    else {
      running.current.clear();
      setPlays((p) => p.map((x) => ({ n: x.n + 1, alone: false })));
    }
  };

  return (
    // one of the two sections with a ground of its own, so the page isn't
    // white from the reviews to the ticket: its chapter's wash, always there
    // (globals.css, [data-ground])
    <section ref={rootRef} aria-labelledby="pricing-heading" data-tone="violet" data-ground="on">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <ReviewNote note={REVIEW_NOTES.pricing} className="mb-8" />
        <div className="jr-reveal flex items-end justify-between gap-6" style={order(0)}>
          <SectionHead
            id="pricing-heading"
            eyebrow={t("expat.pricing.eyebrow")}
            title={t("expat.pricing.heading")}
            subtitle={t("expat.pricing.subtitle")}
          />
          {/* pause, play, replay: only where the pictures play as one run */}
          {relay && mode !== "idle" && (
            <button
              type="button"
              onClick={control}
              aria-label={t(`expat.pricing.${mode === "playing" ? "pause" : mode === "done" ? "replay" : "play"}`)}
              className="tap-target relative grid size-10 shrink-0 place-items-center rounded-full bg-background text-foreground transition-colors hover:text-tone-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60"
            >
              {mode === "playing" ? (
                <Pause className="size-3.5 fill-current" />
              ) : mode === "done" ? (
                <RotateCcw className="size-4" />
              ) : (
                <Play className="ml-0.5 size-3.5 fill-current" />
              )}
            </button>
          )}
        </div>

        {/* the sum, a step a column, numbered because the order is the
            point: each one's picture, then its words. In the row of four, a
            step's picture, title and words are rows shared with the other
            three (subgrid), so the titles and the words under them each
            start on one line however each wraps; two by two the words
            follow their own title, where a shared row left a blank line
            under the shorter one */}
        <ol
          ref={railRef}
          data-relay
          data-paused={mode === "paused" || undefined}
          onAnimationEnd={landed}
          className="mt-8 grid gap-x-6 gap-y-8 sm:mt-12 sm:grid-cols-2 xl:grid-cols-4"
        >
          {STEPS.map(({ key, Scene, frame }, i) => {
            const { n, alone } = plays[i];
            const inRelay = relay && !alone;
            return (
              <li
                key={key}
                data-step={i}
                className="jr-reveal max-w-[24rem] xl:row-span-3 xl:grid xl:grid-rows-subgrid xl:gap-y-0"
                style={order(1 + i)}
              >
                <div className="relative">
                  <SceneStage
                    // a new run is a new stage: it builds again from nothing
                    key={`${inRelay ? "relay" : "alone"}-${n}`}
                    buildWith={inRelay ? "[data-relay]" : undefined}
                    onBuild={() => built(i)}
                    // a little taller in the row, where the pictures are
                    // narrowest and their type a bigger share of them
                    className={cn(frame, "sm:aspect-[5/4] xl:aspect-[10/9]")}
                    sceneClassName="text-[length:5.3cqw] @min-[17rem]:text-[length:4.7cqw] @min-[21rem]:text-[length:4.2cqw]"
                  >
                    <Scene start={inRelay ? TURN[i] : 0} arrive={inRelay ? i * ARRIVE_MS : 0} />
                  </SceneStage>
                  {/* the picture itself is the way to see its step again;
                      laid over it, since the stage is out of the
                      accessibility tree */}
                  {!still && (
                    <button
                      type="button"
                      onClick={() => again(i)}
                      aria-label={t("expat.pricing.replayStep").replace("{n}", String(i + 1))}
                      className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60"
                    />
                  )}
                </div>
                {/* the number leads the title at its size, in the chapter's
                    ink, so the words keep the picture's left edge */}
                <h3 className="mt-4 text-balance font-display text-xl font-semibold tracking-tight">
                  <span className="mr-2 tabular-nums text-tone-ink">{i + 1}</span>
                  {t(`expat.pricing.${key}Title`)}
                </h3>
                <div className="mt-1">
                  <p className="text-sm text-muted">{t(`expat.pricing.${key}Body`)}</p>
                  {/* the full breakdown, the same modal the main site's
                      calculator opens: per-carrier handling surcharges,
                      then the other logistic costs */}
                  {key === "step4" && (
                    <SurchargeInfoDialog>
                      <button type="button" className="link-mark tap-target relative mt-2 block w-fit text-left text-sm">
                        {t("expat.pricing.surchargeCta")}
                      </button>
                    </SurchargeInfoDialog>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* the way in, a step further from the steps than they are from
            each other, so it never reads as a fifth: what checking gives
            and when the price is final, in plain body type, then the button */}
        <p className="jr-reveal mt-12 max-w-xl" style={order(1 + STEPS.length)}>
          {t("expat.pricing.promise")}
        </p>
        {/* the button rises inside a wrapper, so the reveal never holds
            the button's own press */}
        <div className="jr-reveal mt-6 sm:w-fit" style={order(2 + STEPS.length)}>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={EXPAT_QUOTE_URL}>
              {t("expat.cta")} <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
