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
 * It arrives in tiers, each starting as the one before it settles, so the
 * eye is led instead of hit with everything at once (DESIGN.md, Motion,
 * Entrance): the message (the board, then the headline word by word), the
 * marked phrase taped on line by line as its words land (TapeMark), the subtitle,
 * the way in (the quote, then how it works), and last the proof, the photo
 * pile dealt back to front, then the message dropping in on it. TIERS holds
 * the times.
 */
/** when each tier starts, in seconds from load */
const TIERS = {
  words: 0.12,
  wordStep: 0.055,
  tape: 0.72,
  subtitle: 0.8,
  quote: 0.95,
  how: 1.03,
  deck: 1.05,
  notice: 1.75,
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
      className="hero-drop pointer-events-none absolute left-[9%] top-[9%] z-10 flex w-[min(82%,18rem)] items-start gap-2.5 rounded-md bg-background p-3 shadow-overlay lg:-left-20 lg:top-1 lg:w-[19.5rem]"
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
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:py-16">
        <ReviewNote note={REVIEW_NOTES.hero} className="mb-3" />
        <ReviewNote note={REVIEW_NOTES.cta} className="mb-6" />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
          <div>
            {/* the eyebrow is a departures board, origin flipping to IDN;
                how the route is travelled is the subtitle's to say */}
            <RouteBoard className="hero-in" style={at(0)} />
            {/* looser than the home hero's 1.05: here the tape runs over two
                lines, and tighter its strips would swallow the descenders
                above them. Capped at 52px so, beside the 30rem photo deck, the
                headline stays within four lines and the button stays above the
                fold. Words arrive one by one, the brand's hero entrance (as on
                the home page); the marked phrase is taped on behind them as
                they land, line by line (TapeMark; `relative` holds its strips) */}
            <h1 className="hero-headline relative mt-5 text-balance font-display text-[clamp(2.25rem,4.6vw,3.25rem)] font-medium leading-[1.18] tracking-[-0.02em]">
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
            <p className="hero-in mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={at(TIERS.subtitle)}>
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
                (ExpatHeader, data-hero-door), so two limes never show at once */}
            <div data-hero-door className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
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

          {/* one 5:4 pile at every width, dealt in after the way in, the
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
