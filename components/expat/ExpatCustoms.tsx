"use client";

import { Check, FileText, MessageCircle, Receipt, type LucideIcon } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** how much of a route's duty is waived, which sets its verdict's coin */
type Relief = "full" | "part" | "none";

/** the three ways belongings clear Indonesian customs, from ops' import
 *  summary, most relief first: duty-free as relocation goods, free up to
 *  USD 500 as passenger goods sent separately, or charged as a personal
 *  shipment */
const ROUTES: readonly { key: string; docs: readonly string[]; relief: Relief }[] = [
  { key: "pindahan", docs: ["doc1", "doc2", "doc3", "doc4", "doc5"], relief: "full" },
  { key: "penumpang", docs: ["doc1", "doc2", "doc3"], relief: "part" },
  { key: "kiriman", docs: ["doc1", "doc2"], relief: "none" },
];

/** each verdict's coin: the chapter's ink, solid, for duty-free; its ring
 *  for free up to a limit; a quiet receipt for charged (charged is not an
 *  error, so never Stop Red) */
const COIN: Record<Relief, { glyph: LucideIcon; className: string }> = {
  full: { glyph: Check, className: "bg-tone-ink text-background" },
  part: { glyph: Check, className: "border-2 border-tone-ink text-tone-ink" },
  none: { glyph: Receipt, className: "bg-surface-3 text-muted" },
};

/** what a personal shipment pays, by what's inside (the CN flat rates) */
const RATES = ["general", "books", "regulated", "apparel"] as const;

/** what catches people out, whichever route they take */
const GOOD = ["timing", "excluded", "blocked"] as const;

/**
 * What to expect at Indonesian customs, from ops' import summary, the
 * source of truth for the service: the question every relocating visitor
 * has once they've seen how a shipment runs, "will I pay import duty?",
 * answered on the page in plain words rather than in a guide. Three cards
 * side by side, most relief first, each opening on who it's for in a brand
 * label (a work or study ITAS, flying in with things sent separately,
 * anyone), then the verdict beside its coin, the customs name under it,
 * what's usually needed, and a note pinned to the foot so the three feet
 * share a line. The one route with no exemption gets its rates under them,
 * one number big on each row, since that's the one a visitor has to work
 * out. Then the three things that catch people out, as the item cards'
 * details are set (a label, the rule, why), and a way to ask. A band in the
 * magenta chapter, between How it works and the FAQ on the desk. Every
 * rule here is a draft until ops confirms it (REVIEW_NOTES.customs).
 */
export function ExpatCustoms() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the three
  // routes, the rates, what catches people out, then the way to ask
  const rootRef = useSectionReveal<HTMLElement>();
  const r = (path: string) => t(`expat.customs.rates.${path}`);
  return (
    <section ref={rootRef} aria-labelledby="customs-heading" data-tone="magenta" className="band">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ReviewNote note={REVIEW_NOTES.customs} className="mb-8" />
        <div className="jr-reveal" style={order(0)}>
          <SectionHead
            id="customs-heading"
            eyebrow={t("expat.customs.eyebrow")}
            title={t("expat.customs.heading")}
            subtitle={t("expat.customs.subtitle")}
          />
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {ROUTES.map(({ key, docs, relief }, i) => {
            const k = (path: string) => t(`expat.customs.${key}.${path}`);
            const { glyph: Glyph, className: coin } = COIN[relief];
            return (
              <article
                key={key}
                className="jr-reveal flex flex-col rounded-lg bg-background px-5 py-7 sm:px-7"
                style={order(1 + i)}
              >
                {/* who it's for, then the verdict it brings */}
                <p className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">{k("when")}</p>
                <h3 className="mt-3 flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", coin)}>
                    <Glyph aria-hidden className="size-4" strokeWidth={relief === "none" ? 2 : 3} />
                  </span>
                  {k("verdict")}
                </h3>
                <p className="mt-2 text-sm font-medium text-muted">{k("name")}</p>
                <p className="mt-4 leading-relaxed">{k("body")}</p>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-display text-xs font-medium uppercase tracking-[0.04em] text-tone-ink">
                    {t("expat.customs.needed")}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {docs.map((d) => (
                      <li key={d} className="flex gap-2.5 text-sm">
                        <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-2" />
                        {k(d)}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* the foot of all three cards on one line */}
                <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">{k("note")}</p>
              </article>
            );
          })}
        </div>

        {/* the personal shipment's rates: what's inside, then its duty as
            the one big number on the row, then the tax on top. From lg the
            words take the left third and the table the rest, so its three
            columns sit close enough to read across */}
        <div
          className="jr-reveal mt-4 grid gap-y-5 rounded-lg bg-background px-5 py-7 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-12"
          style={order(4)}
        >
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">{r("title")}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{r("subtitle")}</p>
            <p className="mt-4 hidden border-t border-border pt-4 text-sm leading-relaxed text-muted lg:block">{r("foot")}</p>
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border font-display text-xs uppercase tracking-[0.04em] text-tone-ink">
                <th scope="col" className="pb-3 pr-4 font-medium">
                  {r("what")}
                </th>
                <th scope="col" className="pb-3 pr-4 font-medium">
                  {r("duty")}
                </th>
                <th scope="col" className="pb-3 font-medium">
                  {r("tax")}
                </th>
              </tr>
            </thead>
            <tbody>
              {RATES.map((row) => (
                <tr key={row} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-3.5 pr-4 align-top font-medium">
                    {r(`${row}.label`)}
                    {row === "general" && (
                      <span className="mt-0.5 block font-normal text-muted">{r("general.hint")}</span>
                    )}
                  </th>
                  <td className="whitespace-nowrap py-3.5 pr-4 align-top font-display text-xl font-semibold tracking-tight tabular-nums">
                    {r(`${row}.duty`)}
                  </td>
                  <td className="py-3.5 align-top text-muted">{r(`${row}.tax`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted lg:hidden">{r("foot")}</p>
        </div>

        <div className="jr-reveal mt-14" style={order(5)}>
          <h3 className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
            {t("expat.customs.goodTitle")}
          </h3>
          <dl className="mt-5 grid gap-y-6 md:grid-cols-3">
            {GOOD.map((g, j) => (
              <div
                key={g}
                className={cn(
                  j > 0 && "border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0",
                  j < GOOD.length - 1 && "md:pr-8",
                )}
              >
                <dt className="font-display text-xs font-medium uppercase tracking-[0.04em] text-tone-ink">
                  {t(`expat.customs.${g}.label`)}
                </dt>
                <dd className="mt-2">
                  <p className="font-display text-base font-semibold tracking-tight">{t(`expat.customs.${g}.value`)}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`expat.customs.${g}.body`)}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the message arrives already asking the question, so the team
            starts where the visitor is */}
        <p className="jr-reveal mt-12 text-sm text-muted" style={order(6)}>
          {t("expat.customs.ask")}{" "}
          <a
            href={waLink(t("expat.customs.wa"))}
            target="_blank"
            rel="noreferrer"
            className="link-mark tap-row relative inline-flex items-start gap-1.5"
          >
            <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {t("expat.customs.cta")}
          </a>
        </p>
      </div>
    </section>
  );
}
