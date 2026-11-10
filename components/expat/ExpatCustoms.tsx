"use client";

import * as React from "react";
import { ChevronDown, FileText, MessageCircle } from "lucide-react";
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
  { key: "pindahan", docs: ["doc1", "doc2", "doc3", "doc4", "doc5"] },
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
 * its duty and tax), the explanation, the documents it needs, and a note
 * pinned to the foot so the three feet share a line; under all three, that
 * customs may ask for more. Each card carries its own rules, as ops wrote
 * them (the timing, what isn't covered, the NPWP), so nothing under the
 * cards says them again. The one route with no exemption gets its rates under them,
 * one number big on each row, since that's the one a visitor has to work
 * out, then a way to ask. A band in the
 * magenta chapter, between How it works and the FAQ on the desk. Every
 * rule here is a draft until ops confirms it (REVIEW_NOTES.customs).
 */
/** a path's name as its title, the Indonesian term ("Barang Pindahan")
 *  on a quiet line of its own, in italic as a foreign term, so the three
 *  titles stay short and level */
function PathName({ name }: { name: string }) {
  const [title, local] = name.split(/\s*\((.+)\)\s*$/);
  return (
    <h3 className="font-display text-xl font-semibold tracking-tight">
      {title}
      {local && <span className="mt-0.5 block font-sans text-sm font-normal italic tracking-normal text-muted">{local}</span>}
    </h3>
  );
}

/** a document's name, and the help that comes with it ("we'll send you a
 *  template") on a quiet line under it, as PathName sets the Indonesian
 *  term, so the names read straight down the list. The order flow's
 *  CustomsPaths sets its documents the same way */
export function DocName({ doc }: { doc: string }) {
  const [name, help] = doc.split(/\s*\((.+)\)\s*$/);
  return (
    <span>
      {name}
      {help && <span className="mt-0.5 block text-muted first-letter:uppercase">{help}</span>}
    </span>
  );
}

/** one Customs Path's documents */
function DocList({ docs, k }: { docs: readonly string[]; k: (path: string) => string }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {docs.map((d) => (
        <li key={d} className="flex gap-2.5 text-sm">
          <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-2" />
          <DocName doc={k(d)} />
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
    <section ref={rootRef} aria-labelledby="customs-heading" data-tone="magenta" className="band">
      <div className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <ReviewNote note={REVIEW_NOTES.customs} className="mb-8" />
        <div className="jr-reveal" style={order(0)}>
          <SectionHead
            id="customs-heading"
            eyebrow={t("expat.customs.eyebrow")}
            title={t("expat.customs.heading")}
            subtitle={t("expat.customs.subtitle")}
          />
        </div>

        {/* from lg the three cards share their rows (a subgrid): a "For"
            that runs to two lines moves the other cards' rows down with it,
            so the three duty and tax answers, the explanations, the document
            lists and the notes each start on one line and read across */}
        <div className="mt-8 grid gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-y-0">
          {CUSTOMS_ROUTES.map(({ key, docs }, i) => {
            const k = (path: string) => t(`expat.customs.${key}.${path}`);
            return (
              <article
                key={key}
                className="jr-reveal flex flex-col rounded-lg bg-background px-5 py-7 sm:px-7 lg:row-span-6 lg:grid lg:grid-rows-subgrid"
                style={order(1 + i)}
              >
                {/* the path's name, then the same two facts on every card:
                    no glyph or colour ranks one path above another */}
                <PathName name={k("name")} />
                <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm lg:row-span-2 lg:grid-rows-subgrid lg:gap-y-0">
                  <div>
                    <dt className="text-muted">{t("expat.customs.forLabel")}</dt>
                    <dd className="mt-0.5 font-medium">{k("when")}</dd>
                  </div>
                  <div className="lg:mt-3">
                    <dt className="text-muted">{t("expat.customs.dutyLabel")}</dt>
                    <dd className="mt-0.5 font-medium">{k("verdict")}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed">{k("body")}</p>
                {/* the documents: from lg all three lists stand open, side by
                    side; a phone, where the cards stack, folds each behind
                    its label and count, so the three verdicts read close */}
                <div className="mt-6 border-t border-border pt-5">
                  <p className="hidden font-display text-sm font-semibold text-tone-ink lg:block">
                    {t("expat.customs.needed")}
                  </p>
                  <button
                    type="button"
                    aria-expanded={docsOpen.has(key)}
                    aria-controls={`customs-${key}-docs`}
                    onClick={() => toggleDocs(key)}
                    className="tap-row relative flex w-full items-center justify-between gap-3 text-left font-display text-sm font-semibold text-tone-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 lg:hidden"
                  >
                    <span>
                      {t("expat.customs.needed")} <span className="font-normal text-muted">· {docs.length}</span>
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn("size-4 text-muted-2 transition-transform", docsOpen.has(key) && "rotate-180")}
                    />
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
                {/* the foot of all three cards on one line, the subgrid's
                    last row */}
                <p className="pt-6 text-sm leading-relaxed text-muted">{k("note")}</p>
              </article>
            );
          })}
        </div>
        {/* once, for all three lists: they're what customs asks for, not
            all it ever may */}
        <p className="jr-reveal mt-4 text-sm leading-relaxed text-muted" style={order(4)}>
          {t("expat.customs.extraDocs")}
        </p>

        {/* the personal shipment's rates: what's inside, then its duty as
            the one big number on the row, then the tax on top. From lg the
            words take the left third and the table the rest, so its three
            columns sit close enough to read across. Under them, the rule
            over USD 1,500 and that the packing list review flags what's
            likely taxed; the card above already says customs sets the
            figure and the NPWP's part */}
        <div
          className="jr-reveal mt-8 grid gap-y-5 rounded-lg bg-background px-5 py-7 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-12"
          style={order(4)}
        >
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">{r("title")}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{r("subtitle")}</p>
            <p className="mt-4 hidden border-t border-border pt-4 text-sm leading-relaxed text-muted lg:block">{r("foot")}</p>
            <p className="mt-3 hidden text-sm leading-relaxed text-muted lg:block">{r("packing")}</p>
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border font-display text-sm text-tone-ink">
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
          <div className="space-y-3 border-t border-border pt-4 text-sm leading-relaxed text-muted lg:hidden">
            <p>{r("foot")}</p>
            <p>{r("packing")}</p>
          </div>
        </div>

        {/* the message arrives already asking the question, so the team
            starts where the visitor is */}
        <p className="jr-reveal mt-12 text-sm text-muted" style={order(5)}>
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
