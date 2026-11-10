"use client";

import * as React from "react";
import {
  ArrowRight,
  Ban,
  Banknote,
  Bomb,
  ChevronDown,
  ChevronUp,
  Cigarette,
  CircleAlert,
  Flame,
  Gem,
  Laptop,
  MessageCircle,
  Pill,
  ShieldAlert,
  Sofa,
  SprayCan,
  Sprout,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { CollapseHeight, Disclosure } from "@/components/ui/disclosure";
import { EXPAT_QUOTE_URL, REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { ShipArt } from "./ShipArt";
import { SceneStage } from "./SceneStage";
import { AsksPicture, BooksStat, HomePicture, PackedPicture, RulerPicture } from "./ShipTiles";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** what a card's details end on: the price check, or a word with the team
 *  on WhatsApp that already says what it's about */
type Action = "price" | "wa";

/** a tile's picture, one kind per tile (ShipTiles): the hero's package, the
 *  one number, the things drawn, the rule measured, the questions asked */
type Picture = "packed" | "stat" | "home" | "ruler" | "asks";

const PICTURES: Record<Exclude<Picture, "stat">, () => React.ReactNode> = {
  packed: PackedPicture,
  home: HomePicture,
  ruler: RulerPicture,
  asks: AsksPicture,
};

type CardKey = "clothes" | "books" | "home" | "hobby" | "other";

/** what our customers send most, in ops' order, the one that needs a word
 *  first last. Each opens onto its facts, a label, the rule and why. A
 *  bento, hero and strip: clothes, what's sent most, takes two columns,
 *  and no tile sits beside or over one of its own kind at three across or
 *  at two (the hero over the stat and the drawing, the stat over the
 *  measure, the drawing over the questions) */
const CARDS: readonly { key: CardKey; facts: readonly string[]; action: Action; picture: Picture }[] = [
  { key: "clothes", facts: ["packing", "inside", "customs"], action: "price", picture: "packed" },
  { key: "books", facts: ["price", "packing", "duty"], action: "price", picture: "stat" },
  { key: "home", facts: ["wrap", "fill", "label"], action: "price", picture: "home" },
  { key: "hobby", facts: ["packing", "size", "battery"], action: "price", picture: "ruler" },
  { key: "other", facts: ["rules"], action: "wa", picture: "asks" },
];

/** what it all travels in, each piece priced the same way */
const PACKS = ["suitcases", "boxes", "special"] as const;

/** furniture, packed by the customer, in ops' order: ready, apart,
 *  protected, packed, measured, labelled */
const FURNITURE = ["prep", "apart", "protect", "pack", "measure", "label"] as const;

/** what can go only once the team has checked it */
const CHECK = [
  { icon: Laptop, key: "electronics" },
  { icon: Pill, key: "food" },
  { icon: SprayCan, key: "cosmetics" },
] as const;

/** what can't travel on any route (the FAQ's "What can't I ship?") */
const BANNED = [
  { icon: Wine, key: "alcohol" },
  { icon: Cigarette, key: "tobacco" },
  { icon: Bomb, key: "weapons" },
  { icon: Flame, key: "flammable" },
  { icon: Banknote, key: "cash" },
  { icon: Gem, key: "jewellery" },
  { icon: Sprout, key: "plants" },
] as const;

/** the details' columns, one per fact, from a tablet up */
const FACT_COLS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

/**
 * Brief 03. Showing the right items lets the right visitors recognise the
 * service, and stops the wrong ones expecting a removal van. Ops' own
 * outline, in three parts that answer a household's questions in the order
 * it asks them. What can I send: a card for each kind of thing our
 * customers send most, its drawing (ShipArt), its name and one line that
 * says what's in it, after sendmybag.com's "What you can send". The details
 * are behind the card, named for what they hold ("Weight, packing and
 * duty", never "Show more"), and open under the card's row as one panel
 * across the grid, a caret on the card that opened it: each fact a label,
 * the rule itself in a few words, and why, so the panel reads as a short
 * spec, not a paragraph. One card is open at a time. What do I pack it in:
 * the three things it all travels in, open on the desk, under the one rule
 * that prices every piece. What do I check before I send: what can go once
 * the team has looked, beside what can't go at all. Every rule here is a
 * draft until ops confirms it (REVIEW_NOTES.ship).
 */
export function WhatYouCanShip() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the cards in
  // reading order, what it all travels in, then what to check
  const rootRef = useSectionReveal<HTMLElement>();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState<CardKey | null>(null);
  // a card opened beside the open one, in the same row: its details take
  // the open panel's place at once, as if one panel changed its words, and
  // the caret slides across to it, rather than one panel folding away as
  // another unfolds under it
  const [swap, setSwap] = React.useState(false);
  const caretAt = React.useRef<number | null>(null);

  const choose = (key: CardKey) => {
    if (open === key) {
      setSwap(false);
      setOpen(null);
      return;
    }
    const top = (k: CardKey) => gridRef.current?.querySelector<HTMLElement>(`[data-card="${k}"]`)?.offsetTop;
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
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
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
            gap is each card's own foot, so a closed panel adds none. The
            tiles share one frame, their words at the foot, and one ground,
            the chapter's Panel 3, filled, so each reads as a tile off the
            desk without a hairline; what differs is the picture over them.
            Anything else, the one that asks rather than tells, is set apart
            on the chapter's wash: it has no drawing, so nothing in it is
            drawn in the wash and lost */}
        <div
          ref={gridRef}
          data-ship-grid
          className="mt-8 -mb-4 grid sm:mt-12 grid-flow-row-dense gap-x-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CARDS.map(({ key, facts, action, picture }, i) => {
            const isOpen = open === key;
            const Chevron = isOpen ? ChevronUp : ChevronDown;
            const k = (path: string) => t(`expat.ship.${key}.${path}`);
            const hero = picture === "packed";
            const apart = picture === "asks";
            const Picture = picture === "stat" ? null : PICTURES[picture];
            return (
              <React.Fragment key={key}>
                <div data-card={key} className={cn("jr-reveal pb-4", hero && "sm:col-span-2")} style={order(1 + i)}>
                  <div
                    className={cn(
                      "ship-card relative flex h-full flex-col overflow-hidden rounded-lg border transition-colors duration-200",
                      apart
                        ? "bg-(--tone-wash) hover:bg-[color-mix(in_oklab,var(--tone-wash),var(--tone)_10%)]"
                        : "bg-surface-3 hover:bg-[color-mix(in_oklab,var(--surface-3),var(--tone-ink)_6%)]",
                      isOpen ? "border-(--tone)" : "border-transparent",
                      hero && "md:min-h-[22rem] md:justify-end",
                    )}
                  >
                    {/* the picture over the words; the hero's, from md,
                        behind them, hung off the tile's right edge */}
                    {Picture ? (
                      <div className={cn("relative min-h-44 flex-1 sm:min-h-50", hero && "min-h-70 sm:min-h-70 md:absolute md:inset-0")}>
                        <SceneStage
                          ground="none"
                          buildWith="[data-ship-grid]"
                          delay={i * 110}
                          className={cn(
                            "pointer-events-none absolute inset-0",
                            // stacked over its words, the hero's package
                            // fades out at the picture's foot, over the
                            // rows still to fill, never over a listed one
                            hero && "max-md:[mask-image:linear-gradient(to_bottom,black_76%,transparent)]",
                          )}
                        >
                          <Picture />
                        </SceneStage>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <BooksStat />
                      </div>
                    )}
                    <div className={cn("flex min-w-0 flex-col px-6 pb-6", !Picture && "pt-6", hero && "md:max-w-[19rem]")}>
                      <h3 className="font-display text-xl font-semibold tracking-tight">{k("title")}</h3>
                      {/* two lines held from sm, so a row's titles share a line */}
                      <p className="mt-1.5 text-sm leading-relaxed text-muted sm:min-h-[2lh]">{k("answer")}</p>
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
                        <div className="mt-6 border-t border-border pt-4">
                          {action === "price" ? (
                            <a href={EXPAT_QUOTE_URL} className="link-mark tap-row relative inline-flex items-center gap-1.5 text-sm">
                              {t("expat.ship.price")} <ArrowRight aria-hidden className="size-4 shrink-0" />
                            </a>
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
                      </div>
                    </div>
                  </CollapseHeight>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* the packing guide, which the order flow links to (#packing): who
            packs, then what it all travels in, open on the desk, not cards,
            since none of it opens, and drawn smaller than the cards' things,
            since it's what they travel in, not what you send; the rule that
            prices every piece over them. Each reads as a fact in the cards'
            details does: its name the label, its own rule the title, why
            under it, so no two lines in a column speak at the same level.
            On a phone each reads as a card does, drawing beside the words */}
        <div
          id="packing"
          className="jr-reveal mt-12 scroll-mt-24 border-t border-border pt-10 sm:mt-16 sm:pt-12"
          style={order(1 + CARDS.length)}
        >
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("expat.ship.pack.title")}</h3>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{t("expat.ship.pack.lead")}</p>
          <p className="mt-2 text-sm">
            {/* the same modal as the main site's calculator */}
            <SurchargeInfoDialog>
              <button type="button" className="link-mark tap-row">
                {t("expat.ship.charges")}
              </button>
            </SurchargeInfoDialog>
          </p>
          <ul className="mt-8 grid gap-y-6 md:grid-cols-3">
            {PACKS.map((p, j) => (
              <li
                key={p}
                className={cn(
                  "flex gap-4 md:flex-col",
                  j > 0 && "border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0",
                  j < PACKS.length - 1 && "md:pr-8",
                )}
              >
                <ShipArt name={p} className="h-16 w-24 shrink-0 md:h-20 md:w-30" />
                <div className="min-w-0">
                  <h4 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-tone-ink">
                    {t(`expat.ship.pack.${p}.title`)}
                  </h4>
                  <p className="mt-2 font-display text-lg font-semibold tracking-tight sm:text-xl">{t(`expat.ship.pack.${p}.rule`)}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`expat.ship.pack.${p}.body`)}</p>
                </div>
              </li>
            ))}
          </ul>
          {/* why the guide matters, in ops' own terms: nothing is turned
              away at pickup, but a damage claim on a piece packed any other
              way isn't paid at its declared value */}
          <p className="mt-8 flex gap-2 text-sm leading-relaxed">
            <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-tone-ink" />
            {t("expat.ship.pack.claim")}
          </p>
          {/* furniture's own guide, closed until it's wanted: most visitors
              send boxes and suitcases, and the six steps are for the few
              who don't. A tile, not a ruled row, so it reads as something
              to open: the thing, what it holds, the chevron in its ring.
              Still a <details>, so the order flow's #packing-furniture
              opens it (ExpatFaq, openFaqItem). Numbered as How it works
              numbers its steps */}
          <div className="mt-8">
            <Disclosure
              id="packing-furniture"
              tile
              question={
                <span className="flex items-center gap-4">
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-sm bg-background text-tone-ink">
                    <Sofa className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold tracking-tight">
                      {t("expat.ship.pack.furniture.title")}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{t("expat.ship.pack.furniture.hint")}</span>
                  </span>
                </span>
              }
            >
              <p className="max-w-2xl text-sm leading-relaxed text-muted">{t("expat.ship.pack.furniture.lead")}</p>
              <ol className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {FURNITURE.map((step, n) => (
                  <li key={step} className="flex gap-3">
                    <span
                      aria-hidden
                      className="grid h-8 w-7 shrink-0 place-items-center rounded-2xs bg-background font-mono text-sm font-medium tabular-nums text-tone-ink shadow-[inset_0_0_0_1px_var(--tone-ink)]"
                    >
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t(`expat.ship.pack.furniture.${step}.title`)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{t(`expat.ship.pack.furniture.${step}.body`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Disclosure>
          </div>
        </div>

        {/* before anything ships: what can go once we've looked, beside what
            can't go at all, each thing in its ring (amber to ask about, the
            no-entry sign for never). On a phone it reads down, the asking
            first; from lg the two sit side by side over one way to ask */}
        <div className="jr-reveal mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12" style={order(2 + CARDS.length)}>
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("expat.ship.before.title")}</h3>
          {/* de-boxed on the desk: no tinted panel, so nothing in the sky
              chapter stacks against the violet band that follows */}
          <div className="mt-6 grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="lg:pr-12">
              <h4 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
                <CircleAlert aria-hidden className="size-5 text-warning-ink" strokeWidth={2.25} />
                {t("expat.ship.before.check.title")}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("expat.ship.before.check.body")}</p>
              <ul className="mt-6 grid gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-1">
                {CHECK.map(({ icon, key }) => (
                  <li key={key} className="flex items-center gap-3 text-sm font-medium">
                    <Ring icon={icon} />
                    {t(`expat.ship.before.check.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-border pt-7 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <h4 className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
                <Ban aria-hidden className="size-5 text-danger" strokeWidth={2.25} />
                {t("expat.ship.before.banned.title")}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("expat.ship.before.banned.body")}</p>
              {/* seven things as four and three: down two columns on a phone
                  and beside the asking from lg, so the three read as a column
                  that ends, not a row with one left over; across four between */}
              <ul className="mt-6 grid grid-flow-col grid-cols-2 grid-rows-4 gap-x-4 gap-y-4 sm:grid-flow-row sm:grid-cols-4 sm:grid-rows-none lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-4">
                {BANNED.map(({ icon, key }) => (
                  <li key={key} className="flex items-center gap-3 text-sm font-medium">
                    <Ring icon={icon} banned />
                    {t(`expat.ship.before.banned.${key}`)}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 border-t border-border pt-5 text-sm leading-relaxed text-muted lg:col-span-2">
              {t("expat.ship.before.ask")}{" "}
              <a
                href={waLink(t("expat.ship.before.wa"))}
                target="_blank"
                rel="noreferrer"
                className="link-mark whitespace-nowrap"
              >
                {t("expat.ship.before.cta")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** the thing in its ring: amber to ask about first, or struck through by
 *  the no-entry sign */
function Ring({ icon: Icon, banned = false }: { icon: LucideIcon; banned?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-full border-2 bg-background",
        banned ? "border-danger/75" : "border-warning/75",
      )}
    >
      <Icon className="size-4.5" strokeWidth={1.75} />
      {banned && <span className="absolute inset-x-0.5 top-1/2 h-0.5 -translate-y-1/2 rotate-45 rounded-full bg-danger/75" />}
    </span>
  );
}
