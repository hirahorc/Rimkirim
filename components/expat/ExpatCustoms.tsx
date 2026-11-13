"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, FileText, MessageCircle } from "lucide-react";
import { CollapseHeight } from "@/components/ui/disclosure";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** the three ways belongings clear Indonesian customs, from ops' import
 *  summary: relocation goods, passenger goods sent separately, and a
 *  personal shipment. Set as equals: nothing on a card marks one as better
 *  than another, since ops recommends the path at review and the customer
 *  decides (docs/adr/0002). The order flow lists the same three
 *  (CustomsPaths), so the two can never tell a customer different things */
export const CUSTOMS_ROUTES: readonly { key: string; docs: readonly string[] }[] = [
  { key: "pindahan", docs: ["doc1", "doc2", "doc3", "doc4"] },
  { key: "penumpang", docs: ["doc1", "doc2", "doc3"] },
  { key: "kiriman", docs: ["doc1", "doc2"] },
];

/** what a personal shipment pays, by what's inside (the CN flat rates) */
const RATES = ["general", "books", "regulated", "apparel"] as const;

/**
 * What to expect at Indonesian customs, from ops' import summary, the
 * source of truth for the service: the question every relocating visitor
 * has once they've seen how a shipment runs, "will I pay import duty?",
 * answered on the page in plain words rather than in a guide. Three cards
 * side by side, built the same way so none reads as the better one: the
 * path's name, then two facts under the same two labels (who it's for, and
 * its duty and tax, which is the answer to the heading and so set as large
 * as the name), the explanation with its small print under it, and last the
 * documents it needs, so a shorter list ends a card early and leaves no gap
 * inside it; under all three, that customs may ask for more. Each card carries its own rules, as ops wrote
 * them (the timing, what isn't covered, the NPWP), so nothing under the
 * cards says them again. The one route with no exemption gets its rates under them,
 * one number big on each row, since that's the one a visitor has to work
 * out, then a way to ask. On the desk in the
 * magenta chapter, between How it works and the FAQ on the desk. Every
 * rule here is a draft until ops confirms it (REVIEW_NOTES.customs).
 *
 * The four cards are set in three type sizes and five steps of space, and
 * nothing else (DESIGN.md, The customs cards):
 *   20/28 display 600  a card's title and its answer (a path's duty and
 *                      tax, a rate)
 *   14/20              what's read, a paragraph on a looser line; medium
 *                      for a value and a row's name
 *   12/16              a label (medium), a count, a help line, small print
 *   4   a label and its value, a name and the line under it
 *   8   one list item and the next, a paragraph and its small print
 *   12  a table row's top and bottom, a label and the list under it
 *   16  one fact and the next, a rule and what's under it, a card's sides
 *       on a phone, one card and the next
 *   24  one group and the next, a card's padding
 */
/** a path's name as its title, the Indonesian term ("Barang Pindahan")
 *  on a quiet line of its own, in italic as a foreign term, so the three
 *  titles stay short and level */
function PathName({ name }: { name: string }) {
  const [title, local] = name.split(/\s*\((.+)\)\s*$/);
  return (
    <h3 className="font-display text-xl font-semibold tracking-tight">
      {title}
      {local && <span className="mt-1 block font-sans text-sm font-normal italic tracking-normal text-muted">{local}</span>}
    </h3>
  );
}

/** a document's name, and the help that comes with it ("we'll send you a
 *  template") on a quiet line under it, as PathName sets the Indonesian
 *  term, so the names read straight down the list. The order flow's
 *  CustomsPaths sets its documents the same way; `helpClassName` is how a
 *  page sets the help line in its own small print */
export function DocName({ doc, helpClassName }: { doc: string; helpClassName?: string }) {
  const [name, help] = doc.split(/\s*\((.+)\)\s*$/);
  return (
    <span>
      {name}
      {help && <span className={cn("mt-0.5 block text-muted first-letter:uppercase", helpClassName)}>{help}</span>}
    </span>
  );
}

/** one Customs Path's documents */
function DocList({ docs, k }: { docs: readonly string[]; k: (path: string) => string }) {
  return (
    <ul className="mt-3 space-y-2">
      {docs.map((d) => (
        <li key={d} className="flex gap-2 text-sm">
          <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-2" />
          <DocName doc={k(d)} helpClassName="mt-1 text-xs" />
        </li>
      ))}
    </ul>
  );
}

export function ExpatCustoms() {
  const t = useT();
  const [docsOpen, setDocsOpen] = React.useState<Set<string>>(() => new Set());
  const toggleDocs = (key: string) =>
    setDocsOpen((open) => {
      const next = new Set(open);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  // the section reveals once, as the journey does: its head, the three
  // routes, the rates, then the way to ask
  const rootRef = useSectionReveal<HTMLElement>();
  const r = (path: string) => t(`expat.customs.rates.${path}`);
  return (
    <section ref={rootRef} aria-labelledby="customs-heading" data-tone="magenta">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <ReviewNote note={REVIEW_NOTES.customs} className="mb-8" />
        <div className="jr-reveal" style={order(0)}>
          <SectionHead
            id="customs-heading"
            eyebrow={t("expat.customs.eyebrow")}
            title={t("expat.customs.heading")}
            subtitle={t("expat.customs.subtitle")}
          />
        </div>

        {/* the three ways in are solid on the chapter's deep (.deep-panel),
            no outline, their titles white; the personal shipment's rates
            under them are a white card with an outline. A card reads from
            the top in three groups, 24px apart: what it's called, who it's
            for and what it pays; why, with its small print; the documents.
            From lg the three cards share their rows (a subgrid): a "For"
            that runs to two lines moves the other cards' rows down with it,
            so the three duty and tax answers, the explanations and the
            document lists each start on one line and read across */}
        <div className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-y-0">
          {CUSTOMS_ROUTES.map(({ key, docs }, i) => {
            const k = (path: string) => t(`expat.customs.${key}.${path}`);
            // swapped, never rotated, as every disclosure on the page is
            // (DESIGN.md, Motion, The disclosure open)
            const Chevron = docsOpen.has(key) ? ChevronUp : ChevronDown;
            const count = <span className="font-normal text-muted">· {docs.length}</span>;
            return (
              <article
                key={key}
                className="deep-panel jr-reveal flex flex-col rounded-lg px-4 py-6 sm:px-6 lg:row-span-5 lg:grid lg:grid-rows-subgrid"
                style={order(1 + i)}
              >
                {/* the path's name, then the same two facts on every card:
                    no glyph or colour ranks one path above another. The
                    duty and tax is the card's answer, as large as its name */}
                <PathName name={k("name")} />
                <dl className="mt-4 grid gap-4 border-t border-border pt-4 lg:row-span-2 lg:grid-rows-subgrid lg:gap-y-0">
                  <div>
                    <dt className="text-xs font-medium text-muted">{t("expat.customs.forLabel")}</dt>
                    <dd className="mt-1 text-sm font-medium">{k("when")}</dd>
                  </div>
                  <div className="lg:mt-4">
                    <dt className="text-xs font-medium text-muted">{t("expat.customs.dutyLabel")}</dt>
                    <dd className="mt-1 text-balance font-display text-xl font-semibold tracking-tight">
                      {k("verdict")}
                    </dd>
                  </div>
                </dl>
                {/* one row of the subgrid, so the small print stays 8px
                    under its paragraph however long the card beside runs */}
                <div className="mt-6">
                  <p className="text-sm leading-relaxed">{k("body")}</p>
                  <p className="mt-2 text-xs text-muted">{k("note")}</p>
                </div>
                {/* the documents, last, each list under its count: from lg
                    all three stand open, side by side; a phone, where the
                    cards stack, folds each behind its label, so the three
                    answers read close */}
                <div className="mt-6 border-t border-border pt-4">
                  <p className="hidden text-xs font-medium text-muted lg:block">
                    {t("expat.customs.needed")} {count}
                  </p>
                  <button
                    type="button"
                    aria-expanded={docsOpen.has(key)}
                    aria-controls={`customs-${key}-docs`}
                    onClick={() => toggleDocs(key)}
                    className="tap-row relative flex w-full items-center justify-between gap-3 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 lg:hidden"
                  >
                    <span>
                      {t("expat.customs.needed")} {count}
                    </span>
                    <Chevron aria-hidden className="size-4 text-muted-2" />
                  </button>
                  <div className="lg:hidden">
                    <CollapseHeight open={docsOpen.has(key)} id={`customs-${key}-docs`}>
                      <DocList docs={docs} k={k} />
                    </CollapseHeight>
                  </div>
                  <div className="hidden lg:block">
                    <DocList docs={docs} k={k} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {/* once, for all three lists: they're what customs asks for, not
            all it ever may */}
        <p className="jr-reveal mt-4 text-sm leading-relaxed text-muted" style={order(4)}>
          {t("expat.customs.extraDocs")}
        </p>

        {/* the personal shipment's rates: its title, the flat rates up to
            USD 1,500, and under a line what applies over it and that every
            item is listed with its value; then what's inside, its duty as
            the one big number on the row, the tax on top. From xl the words
            take the left third and the table the rest, so its three columns
            sit close enough to read across (from lg, where two thirds is
            too narrow for the tax, the words stand over the table). Below
            lg a list, as the comparison does on a phone: a name and its
            duty share the first line, and what's under the name has the
            whole width. The column names are the chapter's ink; a rate sits
            on its name's baseline (on its own 28px line it sat 6px under) */}
        <div
          className="jr-reveal mt-6 grid gap-y-6 rounded-lg border border-border-strong bg-background px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] xl:gap-x-12"
          style={order(4)}
        >
          <div>
            <h3 className="text-balance font-display text-xl font-semibold tracking-tight">{r("title")}</h3>
            {/* a currency stays on the line of its amount */}
            <p className="mt-2 text-sm leading-relaxed text-muted">{r("subtitle").replaceAll("USD ", "USD\u00a0")}</p>
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted">
              {r("foot").replaceAll("USD ", "USD\u00a0")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{r("packing")}</p>
          </div>

          <div className="lg:hidden">
            {/* the columns' names, for the eye: each rate says its own to a
                screen reader */}
            <p aria-hidden className="flex justify-between gap-4 border-b border-border pb-3 font-display text-sm font-medium text-tone-ink">
              <span>{r("what")}</span>
              <span>{r("duty")}</span>
            </p>
            <ul className="divide-y divide-border text-sm">
              {RATES.map((row) => (
                <li key={row} className="py-3">
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{r(`${row}.label`)}</span>
                    <span className="shrink-0 font-display text-xl leading-5 font-semibold tracking-tight tabular-nums">
                      <span className="sr-only">{r("duty")}: </span>
                      {r(`${row}.duty`)}
                    </span>
                  </p>
                  {row === "general" && <p className="mt-0.5 text-muted">{r("general.hint")}</p>}
                  <p className="mt-1 text-muted">
                    {r("tax")}: {r(`${row}.tax`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <table className="hidden w-full border-collapse text-left text-sm lg:table">
            <thead>
              <tr className="border-b border-border font-display text-sm text-tone-ink">
                <th scope="col" className="pb-3 pr-4 font-medium">
                  {r("what")}
                </th>
                <th scope="col" className="whitespace-nowrap pb-3 pr-4 font-medium">
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
                  <th scope="row" className="py-3 pr-4 align-top font-medium">
                    {r(`${row}.label`)}
                    {row === "general" && (
                      <span className="mt-0.5 block font-normal text-muted">{r("general.hint")}</span>
                    )}
                  </th>
                  <td className="whitespace-nowrap py-3 pr-4 align-top font-display text-xl leading-5 font-semibold tracking-tight tabular-nums">
                    {r(`${row}.duty`)}
                  </td>
                  {/* a tax that wraps breaks into two even lines, never
                      leaving "(PPh)" alone */}
                  <td className="text-balance py-3 align-top text-muted">{r(`${row}.tax`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* the message arrives already asking the question, so the team
            starts where the visitor is */}
        <p className="jr-reveal mt-12 text-sm text-muted" style={order(5)}>
          {t("expat.customs.ask")}{" "}
          <a
            href={waLink(t("expat.customs.wa"))}
            target="_blank"
            rel="noreferrer"
            className="link-mark tap-row relative inline-flex items-start gap-2"
          >
            <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {t("expat.customs.cta")}
          </a>
        </p>
      </div>
    </section>
  );
}
