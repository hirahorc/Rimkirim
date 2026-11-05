"use client";

import { Check, FileText, MessageCircle, Receipt } from "lucide-react";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { SectionHead } from "./SectionHead";
import { ReviewNote } from "./ReviewNote";
import { revealOrder as order, useSectionReveal } from "./useSectionReveal";

/** the two ways belongings clear Indonesian customs: duty-free as
 *  relocation goods with the documents for it, or charged as a regular
 *  shipment without them */
const ROUTES = [
  { key: "pindahan", docs: ["doc1", "doc2", "doc3", "doc4", "doc5"], free: true },
  { key: "kiriman", docs: ["doc1", "doc2"], free: false },
] as const;

/** what catches people out, whichever route they take */
const GOOD = ["timing", "excluded", "blocked"] as const;

/**
 * What to expect at Indonesian customs, from ops' review (Kevin): the
 * question every relocating visitor has after the price, "will I pay import
 * duty?", answered on the page in plain words rather than in a guide. Two
 * cards side by side, the route that decides it named on each (with
 * relocation documents, or without), the verdict first, the customs name
 * under it, then what's usually needed, so the difference reads at a
 * glance. Then the three things that catch people out, as the item cards'
 * details are set (a label, the rule, why), and a way to ask. A band in the
 * magenta chapter, right after Pricing's violet band (DESIGN.md, The Band
 * Rule: two bands in a row stay two sheets). Every rule here is a draft
 * until ops confirms it (REVIEW_NOTES.customs).
 */
export function ExpatCustoms() {
  const t = useT();
  // the section reveals once, as the journey does: its head, the two
  // routes, what catches people out, then the way to ask
  const rootRef = useSectionReveal<HTMLElement>();
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

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {ROUTES.map(({ key, docs, free }, i) => {
            const k = (path: string) => t(`expat.customs.${key}.${path}`);
            const Glyph = free ? Check : Receipt;
            return (
              <article
                key={key}
                className="jr-reveal flex flex-col rounded-lg bg-background px-5 py-7 sm:px-7"
                style={order(1 + i)}
              >
                {/* what decides the route, then the verdict it brings */}
                <p className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">{k("when")}</p>
                <h3 className="mt-3 flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full",
                      free ? "bg-tone-ink text-background" : "bg-surface-3 text-muted",
                    )}
                  >
                    <Glyph aria-hidden className="size-4" strokeWidth={free ? 3 : 2} />
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
                {/* the foot of both cards on one line */}
                <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">{k("note")}</p>
              </article>
            );
          })}
        </div>

        <div className="jr-reveal mt-14" style={order(3)}>
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
        <p className="jr-reveal mt-12 text-sm text-muted" style={order(4)}>
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
