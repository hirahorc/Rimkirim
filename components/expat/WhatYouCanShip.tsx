"use client";

import type * as React from "react";
import { BedDouble, BookOpen, CookingPot, Lamp, MessageCircle, Puzzle, Shirt, Sofa } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { openFaqItem } from "./ExpatFaq";
import { SceneStage } from "./SceneStage";
import { PackingScene } from "./SectionScenes";

/** the goods people send most, each with the line that makes it concrete;
 *  the same names as the quote form's item chips */
const ROWS = [
  { icon: Shirt, key: "clothes" },
  { icon: BookOpen, key: "books" },
  { icon: CookingPot, key: "kitchen" },
  { icon: BedDouble, key: "bedding" },
  { icon: Puzzle, key: "toys" },
  { icon: Lamp, key: "personal" },
] as const;

/**
 * Brief 03. Showing the right items lets the right visitors recognise the
 * service, and stops the wrong ones expecting a removal van. The list is the
 * goods, never the packaging: boxes and suitcases are what the goods travel
 * in, so they appear in the subtitle and the photo, not as rows. Set as a
 * packing list (hairline rows, one item each), Rimkirim's own artefact,
 * rather than a grid of cards; larger items get their own line so the
 * screen-out reads as "we check those separately", never as "no". Beside
 * it, the artefact itself: the commercial invoice and packing list for the
 * last of eight boxes, printed, the same goods going in row by row, the
 * shipper's signature and Rimkirim's "Checked" stamp last (PackingScene).
 * It holds still beside the list on a wide screen, so the list scrolls past
 * the sheet it fills.
 */
export function WhatYouCanShip() {
  const t = useT();
  return (
    <section aria-labelledby="ship-heading" data-tone="sky">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.ship} className="mb-8" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div>
            <SectionHead
              id="ship-heading"
              eyebrow={t("expat.ship.eyebrow")}
              title={t("expat.ship.heading")}
              subtitle={t("expat.ship.subtitle")}
            />

            {/* the goods go in row by row as the list scrolls in, the
                page's build (globals.css, .build-seq), as the CIPL beside
                it fills */}
            <ul className="build-seq mt-10 border-t border-border">
              {ROWS.map(({ icon: Icon, key }, i) => (
                <li
                  key={key}
                  className="build-row flex items-start gap-4 border-b border-border py-4"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-tone-ink" />
                  <div className="grid min-w-0 flex-1 gap-0.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                    <span className="font-medium">{t(`expat.items.${key}`)}</span>
                    <span className="text-sm text-muted">{t(`expat.ship.${key}`)}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* and what is not in it, after the list on a build of its own:
                on the list's timeline these would ride a container so tall
                that, on a phone, its rows would still be fading mid-screen */}
            <div className="build-seq mt-6">
              <div
                className="build-row flex items-start gap-4 rounded-md bg-surface-2 px-5 py-4"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <Sofa aria-hidden className="mt-0.5 size-5 shrink-0 text-tone-ink" />
                <div>
                  <p className="font-medium">{t("expat.ship.largeTitle")}</p>
                  <p className="mt-0.5 text-sm text-muted">{t("expat.ship.largeBody")}</p>
                  {/* the assessment happens with a person: the message arrives
                      already saying what it's about and asking for photos and
                      sizes, so sales starts where the visitor is. A link, not a
                      button: the lime is the header's "Get a quote" */}
                  <a
                    href={waLink(t("expat.ship.largeWa"))}
                    target="_blank"
                    rel="noreferrer"
                    className="link-mark tap-row relative mt-2 inline-flex items-start gap-1.5 text-sm font-medium"
                  >
                    {/* on the first line, should the label wrap on a narrow phone */}
                    <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {t("expat.ship.largeCta")}
                  </a>
                </div>
              </div>

              <p className="build-row mt-5 text-sm text-muted" style={{ "--i": 1 } as React.CSSProperties}>
                {t("expat.ship.banned")}{" "}
                {/* straight to the open answer, not the FAQ's top */}
                <a
                  href="#faq-cant-ship"
                  onClick={(e) => {
                    if (!openFaqItem("faq-cant-ship")) return;
                    e.preventDefault();
                    history.pushState(null, "", "#faq-cant-ship");
                  }}
                  className="link-mark"
                >
                  {t("expat.ship.bannedLink")}
                </a>
              </p>
            </div>
          </div>

          <SceneStage
            className="cipl-stack mx-auto aspect-[4/5] w-full max-w-[30rem] self-start sm:aspect-[6/7] lg:mx-0 lg:sticky lg:top-28 lg:mt-2"
            sceneClassName="text-[length:3.6cqw] @max-[24rem]:text-[length:4.2cqw]"
          >
            <PackingScene />
          </SceneStage>
        </div>
      </div>
    </section>
  );
}
