"use client";

import { BedDouble, BookOpen, CookingPot, Lamp, MessageCircle, Puzzle, Shirt, Sofa } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { PhotoSlot } from "./PhotoSlot";
import { ReviewNote } from "./ReviewNote";

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
 * screen-out reads as "we check those separately", never as "no".
 */
export function WhatYouCanShip() {
  const t = useT();
  return (
    <section aria-labelledby="ship-heading" className="border-t border-border">
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

            <ul className="mt-10 border-t border-border">
              {ROWS.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-start gap-4 border-b border-border py-4">
                  <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" />
                  <div className="grid min-w-0 flex-1 gap-0.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                    <span className="font-medium">{t(`expat.items.${key}`)}</span>
                    <span className="text-sm text-muted">{t(`expat.ship.${key}`)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-4 rounded-md bg-surface-2 px-5 py-4">
              <Sofa aria-hidden className="mt-0.5 size-5 shrink-0 text-foreground" />
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

            <p className="mt-5 text-sm text-muted">
              {t("expat.ship.banned")}{" "}
              <a href="#faq" className="link-mark">
                {t("expat.ship.bannedLink")}
              </a>
            </p>
          </div>

          <PhotoSlot
            shot={t("expat.photo.shipShot")}
            avoid={t("expat.photo.shipAvoid")}
            className="min-h-72 lg:mt-2"
          />
        </div>
      </div>
    </section>
  );
}
