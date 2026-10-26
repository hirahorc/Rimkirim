"use client";

import { BookOpen, CookingPot, Luggage, Package, Shirt, Sofa, Sparkles } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { SectionHead } from "./SectionHead";
import { PhotoSlot } from "./PhotoSlot";
import { ReviewNote } from "./ReviewNote";

/** the brief's "common enquiries", each with the line that makes it concrete */
const ROWS = [
  { icon: Package, name: "expat.items.boxes", note: "expat.ship.boxes" },
  { icon: Luggage, name: "expat.items.suitcases", note: "expat.ship.suitcases" },
  { icon: Shirt, name: "expat.items.clothes", note: "expat.ship.clothes" },
  { icon: BookOpen, name: "expat.ship.books", note: "expat.ship.booksNote" },
  { icon: CookingPot, name: "expat.items.kitchen", note: "expat.ship.kitchen" },
  { icon: Sparkles, name: "expat.items.personal", note: "expat.ship.personal" },
] as const;

/**
 * Brief 03. Showing the right items lets the right visitors recognise the
 * service, and stops the wrong ones expecting a removal van. Set as a packing
 * list (hairline rows, one item each), Rimkirim's own artefact, rather than a
 * grid of cards; larger items get their own line so the screen-out reads as
 * "we check those separately", never as "no".
 */
export function WhatYouCanShip() {
  const t = useT();
  return (
    <section aria-labelledby="ship-heading" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.ship} className="mb-8" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div>
            <SectionHead id="ship-heading" title={t("expat.ship.heading")} subtitle={t("expat.ship.subtitle")} />

            <ul className="mt-10 border-t border-border">
              {ROWS.map(({ icon: Icon, name, note }) => (
                <li key={name} className="flex items-start gap-4 border-b border-border py-4">
                  <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" />
                  <div className="grid min-w-0 flex-1 gap-0.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                    <span className="font-medium">{t(name)}</span>
                    <span className="text-sm text-muted">{t(note)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-4 rounded-md bg-surface-2 px-5 py-4">
              <Sofa aria-hidden className="mt-0.5 size-5 shrink-0 text-foreground" />
              <div>
                <p className="font-medium">{t("expat.ship.largeTitle")}</p>
                <p className="mt-0.5 text-sm text-muted">{t("expat.ship.largeBody")}</p>
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
