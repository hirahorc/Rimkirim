"use client";

import { FileText } from "lucide-react";
import { Disclosure } from "@/components/ui/disclosure";
import { COIN, CUSTOMS_ROUTES } from "@/components/expat/ExpatCustoms";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The three Customs Paths inside the order flow, folded: who each is for, its
 * verdict beside the landing's coin, and the documents it usually needs, read
 * from the same copy as the landing's Customs section. The same for every
 * customer, never matched to their answers, so it can't give away the
 * internal Customs Category (docs/adr/0002). It ends on the promise that ops
 * recommends a path at review and the choice stays the customer's.
 */
export function CustomsPaths({
  id,
  title,
  wide = false,
  edges = "both",
}: {
  id: string;
  title: string;
  /** three across from lg, where the column is wide enough; stacked beside
   *  the plan's Selected Service and in the Booking Summary's side card */
  wide?: boolean;
  /** its hairlines: both in a column of rows, top only as a card's last row */
  edges?: "both" | "top";
}) {
  const t = useT();
  return (
    <div className={cn("border-t border-border", edges === "both" && "border-b")}>
      <Disclosure id={id} question={title}>
        <p className="text-sm text-muted">{t("expatOrder.customs.lead")}</p>
        <ul className={cn("mt-4 grid gap-3", wide && "lg:grid-cols-3")}>
          {CUSTOMS_ROUTES.map(({ key, docs, relief }) => {
            const k = (path: string) => t(`expat.customs.${key}.${path}`);
            const { glyph: Glyph, className: coin } = COIN[relief];
            return (
              <li key={key} className="rounded-md bg-surface-2 px-4 py-4">
                <p className="text-xs font-medium text-muted">{k("when")}</p>
                <p className="mt-2 flex items-center gap-2 font-display text-base font-semibold tracking-tight">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", coin)}>
                    <Glyph aria-hidden className="size-3.5" strokeWidth={relief === "none" ? 2 : 3} />
                  </span>
                  {k("verdict")}
                </p>
                <p className="mt-1 text-xs text-muted">{k("name")}</p>
                <p className="mt-3 text-xs font-medium text-muted">
                  {t("expatOrder.customs.needed")}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {docs.map((d) => (
                    <li key={d} className="flex gap-2 text-sm">
                      <FileText aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-2" />
                      {k(d)}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">{t("expatOrder.customs.close")}</p>
      </Disclosure>
    </div>
  );
}
