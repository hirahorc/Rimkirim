"use client";

import * as React from "react";
import {
  Ban,
  Banknote,
  BedDouble,
  Bomb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cigarette,
  CircleAlert,
  CookingPot,
  Flame,
  Gem,
  Lamp,
  MessageCircle,
  Puzzle,
  Shirt,
  SprayCan,
  Sprout,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { CollapseHeight } from "@/components/ui/disclosure";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { ShipArt, type ShipArtName } from "./ShipArt";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** what a card's details end on: the handling charges, or a word with the
 *  team on WhatsApp that already says what it's about */
type Action = "charges" | "wa";

/** the cards, in the order a household is packed: the boxes and suitcases
 *  everything travels in, what goes in them, then the things that need a
 *  word first. Each opens onto its facts, a label, the rule and why */
const CARDS: readonly { key: ShipArtName; facts: readonly string[]; action?: Action }[] = [
  { key: "boxes", facts: ["weight", "size", "packing"], action: "charges" },
  { key: "suitcases", facts: ["lock", "charge", "limits"], action: "charges" },
  { key: "belongings", facts: [] },
  { key: "electronics", facts: ["tell", "battery"], action: "wa" },
  { key: "gifts", facts: ["pack", "tax", "tell"] },
  { key: "large", facts: ["photos", "packing", "price"], action: "wa" },
];

/** what people send most, the belongings card's details; the same names as
 *  the quote form's item chips */
const GOODS = [
  { icon: Shirt, key: "clothes" },
  { icon: BookOpen, key: "books" },
  { icon: CookingPot, key: "kitchen" },
  { icon: BedDouble, key: "bedding" },
  { icon: Puzzle, key: "toys" },
  { icon: Lamp, key: "personal" },
] as const;

/** what can't travel on any route (the FAQ's "What can't I ship?") */
const BANNED = [
  { icon: Wine, key: "alcohol" },
  { icon: Cigarette, key: "tobacco" },
  { icon: Bomb, key: "weapons" },
  { icon: Flame, key: "flammable" },
  { icon: SprayCan, key: "liquids" },
  { icon: Banknote, key: "cash" },
  { icon: Gem, key: "jewellery" },
  { icon: Sprout, key: "plants" },
] as const;

/** the details' columns, one per fact, from a tablet up */
const FACT_COLS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

/**
 * Brief 03. Showing the right items lets the right visitors recognise the
 * service, and stops the wrong ones expecting a removal van. Set after
 * sendmybag.com's "What you can send": a card for each kind of thing, its
 * drawing (ShipArt), its name and a one-line answer that starts with the
 * verdict ("Yes.", "Yes, if you tell us first.", "Ask us first."), so a
 * glance down the grid answers "can I send this?". The details are behind
 * the card, named for what they hold ("Weight, size and packing", never
 * "Show more"), and open under the card's row as one panel across the grid,
 * a caret on the card that opened it: each fact a label, the rule itself in
 * a few words, and why, so the panel reads as a short spec, not a paragraph.
 * One card is open at a time. Right under the cards, what can't travel at
 * all, each with the no-entry sign, and the one thing that can only travel
 * declared (food and drink). Every rule here is a draft until Rimkirim's own
 * documents confirm it (REVIEW_NOTES.ship).
 */
export function WhatYouCanShip() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the cards in
  // reading order, then what can't travel
  const rootRef = useSectionReveal<HTMLElement>();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState<ShipArtName | null>(null);
  // a card opened beside the open one, in the same row: its details take
  // the open panel's place at once, as if one panel changed its words, and
  // the caret slides across to it, rather than one panel folding away as
  // another unfolds under it
  const [swap, setSwap] = React.useState(false);
  const caretAt = React.useRef<number | null>(null);

  const choose = (key: ShipArtName) => {
    if (open === key) {
      setSwap(false);
      setOpen(null);
      return;
    }
    const top = (k: ShipArtName) => gridRef.current?.querySelector<HTMLElement>(`[data-card="${k}"]`)?.offsetTop;
    setSwap(open !== null && top(open) === top(key));
    setOpen(key);
  };

  // the caret points at the open card's middle, wherever the grid has put
  // it; written onto that card's panel only, so a panel closing as another
  // opens keeps pointing at its own card
  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !open) return;
    const card = grid.querySelector<HTMLElement>(`[data-card="${open}"]`);
    const panel = document.getElementById(`ship-${open}`);
    if (!card || !panel) return;
    const place = () => {
      const g = grid.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      caretAt.current = c.left - g.left + c.width / 2;
      panel.style.setProperty("--caret", `${caretAt.current}px`);
    };
    panel.toggleAttribute("data-slide", false);
    if (swap && caretAt.current !== null) {
      // land where the last caret was, still, then slide from there
      // (globals.css, .ship-caret)
      panel.style.setProperty("--caret", `${caretAt.current}px`);
      void panel.offsetWidth;
      panel.toggleAttribute("data-slide", true);
    }
    place();
    const ro = new ResizeObserver(place);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [open, swap]);

  return (
    <section ref={rootRef} aria-labelledby="ship-heading" data-tone="sky">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.ship} className="mb-8" />
        <div className="jr-reveal" style={order(0)}>
          <SectionHead
            id="ship-heading"
            eyebrow={t("expat.ship.eyebrow")}
            title={t("expat.ship.heading")}
            subtitle={t("expat.ship.subtitle")}
          />
        </div>

        {/* each card's details follow it, across the whole grid; dense
            placement lifts the next cards back up beside it, so the details
            land under the card's own row at every column count. The rows'
            gap is each card's own foot, so a closed panel adds none */}
        <div ref={gridRef} className="mt-12 -mb-4 grid grid-flow-row-dense gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, facts, action }, i) => {
            const isOpen = open === key;
            const Chevron = isOpen ? ChevronUp : ChevronDown;
            const k = (path: string) => t(`expat.ship.${key}.${path}`);
            return (
              <React.Fragment key={key}>
                <div data-card={key} className="jr-reveal pb-4" style={order(1 + i)}>
                  <div
                    className={cn(
                      "ship-card relative flex h-full gap-4 rounded-lg border bg-surface p-5 transition-colors duration-200 sm:flex-col sm:gap-5 sm:p-6",
                      isOpen ? "border-(--tone)" : "border-border hover:bg-surface-2",
                    )}
                  >
                    <ShipArt name={key} className="h-16 w-24 shrink-0 sm:h-28 sm:w-42" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="font-display text-xl font-semibold tracking-tight">{k("title")}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        <strong className="font-semibold text-foreground">{k("verdict")}</strong> {k("answer")}
                      </p>
                      {/* the whole card is the toggle's hit area; the label
                          says what the details hold */}
                      <button
                        type="button"
                        id={`ship-${key}-toggle`}
                        aria-expanded={isOpen}
                        aria-controls={`ship-${key}`}
                        onClick={() => choose(key)}
                        className="mt-auto flex items-center gap-1.5 self-start pt-4 text-left text-sm font-medium after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-foreground/50"
                      >
                        {k("more")}
                        <Chevron aria-hidden className="size-4 text-muted-2" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <CollapseHeight open={isOpen} instant={swap} id={`ship-${key}`}>
                    <div className="pb-4 pt-2">
                      <div
                        role="region"
                        aria-labelledby={`ship-${key}-toggle`}
                        className="relative rounded-lg border border-(--tone) bg-background px-5 py-6 sm:px-6 lg:px-8 lg:py-7"
                      >
                        <span
                          aria-hidden
                          className="ship-caret absolute -top-[7px] left-[calc(var(--caret,50%)-6px)] size-3 rotate-45 border-l border-t border-(--tone) bg-background"
                        />
                        {key === "belongings" ? (
                          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                            {GOODS.map(({ icon: Icon, key: good }) => (
                              <li key={good} className="flex gap-3">
                                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-tone-ink" />
                                <div>
                                  <p className="font-medium">{t(`expat.items.${good}`)}</p>
                                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{k(good)}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <dl className={cn("grid gap-y-6", FACT_COLS[facts.length])}>
                            {facts.map((f, j) => (
                              <div key={f} className={cn(j > 0 && "border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0", j < facts.length - 1 && "md:pr-8")}>
                                <dt className="font-display text-xs font-medium uppercase tracking-[0.04em] text-tone-ink">
                                  {k(`${f}.label`)}
                                </dt>
                                <dd className="mt-2">
                                  <p className="font-display text-xl font-semibold tracking-tight">{k(`${f}.value`)}</p>
                                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{k(`${f}.body`)}</p>
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {action && (
                          <div className="mt-6 border-t border-border pt-4">
                            {action === "charges" ? (
                              // the same modal as the main site's calculator
                              <SurchargeInfoDialog>
                                <button type="button" className="link-mark tap-row text-sm">
                                  {t("expat.ship.charges")}
                                </button>
                              </SurchargeInfoDialog>
                            ) : (
                              // the message arrives already saying what it's
                              // about, so the team starts where the visitor is
                              <a
                                href={waLink(k("wa"))}
                                target="_blank"
                                rel="noreferrer"
                                className="link-mark tap-row relative inline-flex items-start gap-1.5 text-sm"
                              >
                                <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {k("cta")}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapseHeight>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* right under what can travel, what can't: the no-entry sign on
            each, and the one thing that travels only declared. On a phone
            it reads down (what, the list, the exception, then "ask us"); from
            lg the words hold the left column, "ask us" level with the
            exception */}
        <div
          className="jr-reveal mt-12 grid rounded-lg bg-surface-2 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-x-14 lg:p-10"
          style={order(1 + CARDS.length)}
        >
          <div>
            <h3 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
              <Ban aria-hidden className="size-5 text-danger" strokeWidth={2.25} />
              {t("expat.ship.notAllowed.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("expat.ship.notAllowed.body")}</p>
          </div>
          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:mt-0">
            {BANNED.map(({ icon, key }) => (
              <li key={key} className="flex items-center gap-3 text-sm font-medium">
                <NoEntry icon={icon} />
                {t(`expat.ship.notAllowed.${key}`)}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-3 border-t border-border-strong pt-5 text-sm leading-relaxed lg:col-start-2 lg:row-start-2">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-ink" />
            <span>
              <strong className="font-semibold">{t("expat.ship.notAllowed.restrictedTitle")}:</strong>{" "}
              <span className="text-muted">{t("expat.ship.notAllowed.restricted")}</span>
            </span>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted lg:col-start-1 lg:row-start-2 lg:mt-6 lg:self-end">
            {t("expat.ship.notAllowed.ask")}{" "}
            <a
              href={waLink(t("expat.ship.notAllowed.wa"))}
              target="_blank"
              rel="noreferrer"
              className="link-mark whitespace-nowrap"
            >
              {t("expat.ship.notAllowed.cta")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/** the thing, struck through by the no-entry sign */
function NoEntry({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden className="relative grid size-10 shrink-0 place-items-center rounded-full border-2 border-danger/75 bg-background">
      <Icon className="size-4.5" strokeWidth={1.75} />
      <span className="absolute inset-x-0.5 top-1/2 h-0.5 -translate-y-1/2 rotate-45 rounded-full bg-danger/75" />
    </span>
  );
}
