"use client";

import type * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Words } from "@/components/landing/Hero";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { DoorButton } from "./DoorButton";
import { PhotoDeck } from "./PhotoDeck";
import { TapeMark } from "./TapeMark";
import { RouteBoard } from "./RouteBoard";
import { ReviewNote } from "./ReviewNote";

/**
 * Brief 01. Someone arriving from a search has to know within seconds that
 * this ships belongings to Indonesia, and what kind: the headline says where,
 * and the subtitle, the brief's own line, says what ships, how (door to
 * door, by air) and that we help coordinate the journey. The one
 * action is "Check your rate", which opens the order flow's first step
 * (Check Rate, then eligibility, details and the booking summary); "see how it works" serves whoever
 * wants the steps first. The reviews section follows straight after, so the
 * hero carries no review of its own (brief 02's "a short, genuine review
 * just below the hero" is that section). The right-hand column, as on the
 * live page, is a pile of real shipment photos the visitor can flip through
 * (PhotoDeck), with one satellite: a WhatsApp message from Rimkirim saying
 * "your boxes" have cleared customs and the next stop is your door. The
 * photos are the start of the trip, boxes ready for pickup; the message is
 * its end. It speaks to the visitor, never about the shipment in a photo, so
 * no claim rides on a real picture (ClearedNotice).
 *
 * It arrives in tiers, so the eye is led instead of hit with everything at
 * once (DESIGN.md, Motion, Entrance), but the way in never waits for the
 * rest of it: the top photo stands from the first paint, and "Check your
 * rate" is up while the headline is still landing (the board, then the
 * words one by one). Then the subtitle, the two prints behind the top one
 * dealt out from under it, the marked phrase taped on line by line as its
 * words land (TapeMark), and last the message dropping onto the pile.
 * TIERS holds the times; the last piece has landed by 1.6s.
 */
/** when each tier starts, in seconds from load */
const TIERS = {
  words: 0.12,
  wordStep: 0.055,
  quote: 0.3,
  how: 0.38,
  subtitle: 0.45,
  deck: 0.55,
  tape: 0.72,
  notice: 1.05,
};

const at = (s: number) => ({ "--at": `${s}s` }) as React.CSSProperties;

/**
 * The satellite on the photo pile, at a notification's true scale: the
 * page's chat card in small (SceneParts, ChatHead), Rimkirim's app icon as
 * its picture, one message. On a wide screen it hangs off the top print's
 * top-left corner, a little under half outside, over the gap to the copy;
 * below `lg`, where the pile fills the column, it sits inside the top print
 * like a banner on a lock screen. Decorative and still once it lands; it
 * never takes a click from the pile under it.
 */
function ClearedNotice({ style }: { style?: React.CSSProperties }) {
  const t = useT();
  return (
    <div
      aria-hidden
      className="hero-drop pointer-events-none absolute left-[9%] top-[9%] z-10 flex w-[min(82%,18rem)] items-start gap-2 rounded-md bg-background p-3 shadow-overlay lg:-left-20 lg:top-1 lg:w-[19.5rem]"
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a 96px still, as in SceneParts */}
      <img src="/expat/journey/rimkirim-avatar.png" alt="" className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold leading-tight">Rimkirim</span>
          <span className="shrink-0 text-xs leading-tight text-muted-2">{t("expat.hero.noticeMeta")}</span>
        </div>
        <p className="mt-0.5 text-pretty text-sm leading-snug">{t("expat.hero.noticeBody")}</p>
      </div>
    </div>
  );
}
export function ExpatHero() {
  const t = useT();
  const title1 = t("expat.hero.title1");
  return (
    // from lg the hero owns the first screen: it fills the viewport under
    // the bar, less a 1.5rem peek of the reviews' sheet, so the page opens
    // on one picture with the next one only hinted (capped for tall screens)
    <section
      data-tone="sky"
      className="relative overflow-hidden lg:flex lg:min-h-[min(calc(100svh-5.5rem),56rem)] lg:items-center"
    >
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:py-16">
        <ReviewNote note={REVIEW_NOTES.hero} className="mb-3" />
        <ReviewNote note={REVIEW_NOTES.cta} className="mb-6" />
        {/* the deck's column is 26rem until xl: at lg's narrow end a 30rem
            deck left the copy 440px, where "belongings with you." broke
            onto a fifth line and a third strip of tape */}
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
          <div>
            {/* the eyebrow is a departures board, origin flipping to IDN;
                how the route is travelled is the subtitle's to say */}
            <RouteBoard className="hero-in" style={at(0)} />
            {/* looser than the home hero's 1.05: here the tape runs over two
                lines, and tighter its strips would swallow the descenders
                above them. Capped at 52px so, beside the photo deck, the
                headline stays within four lines and the button stays above the
                fold. Words arrive one by one, the brand's hero entrance (as on
                the home page); the marked phrase is taped on behind them as
                they land, line by line (TapeMark; `relative` holds its strips).
                Beside the deck its measure is held to 10.75em, wide enough
                for "belongings with you." (9.74em) and too narrow for
                "Relocating to Indonesia?" on one line (11.52em): in the
                wider column the 26rem deck leaves, that line ran out under
                the message hanging off the pile */}
            <h1 className="hero-headline relative mt-4 text-balance font-display text-heading lg:text-display font-medium leading-[1.18] tracking-[-0.02em] lg:max-w-[10.75em]">
              <span className="block">
                <Words text={title1} startIndex={0} base={TIERS.words} step={TIERS.wordStep} />
              </span>
              <TapeMark start={TIERS.tape}>
                <Words
                  text={t("expat.hero.title2")}
                  startIndex={title1.split(" ").length}
                  base={TIERS.words}
                  step={TIERS.wordStep}
                />
              </TapeMark>
            </h1>
            <p className="hero-in mt-4 max-w-xl text-base leading-relaxed text-muted" style={at(TIERS.subtitle)}>
              {t("expat.hero.subtitle")}
            </p>

            {/* the one lime door, answering a mouse in three small layers
                (DoorButton), and beside it the bordered
                alternative (DESIGN.md, One-Role-One-Variant) for whoever
                wants the steps first, drawn in ink rather than the chapter's
                tinted panel so lime stays the one colour in the row. On a
                phone, where the pair won't fit one row, they stack at full
                width, the door on top */}
            {/* the bar's own button waits until this pair has scrolled away
                (ExpatHeader, data-door), so two limes never show at once */}
            <div data-door className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
              <DoorButton href={EXPAT_QUOTE_URL} className="hero-in" style={at(TIERS.quote)}>
                {t("expat.cta")}
              </DoorButton>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="hero-in border-foreground bg-transparent hover:bg-foreground/5"
                style={at(TIERS.how)}
              >
                <a href="#how-it-works">
                  {t("expat.hero.how")} <ArrowDown />
                </a>
              </Button>
            </div>
          </div>

          {/* one 5:4 pile at every width: its top print there from the
              start, the two behind it dealt out once the way in is up, the
              message landing on it last */}
          <div className="relative">
            <PhotoDeck dealAt={TIERS.deck} />
            <ClearedNotice style={at(TIERS.notice)} />
          </div>
        </div>
      </div>
    </section>
  );
}
