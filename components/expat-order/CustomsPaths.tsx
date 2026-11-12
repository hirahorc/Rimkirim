"use client";

import { FileText } from "lucide-react";
import { CUSTOMS_ROUTES, DocName } from "@/components/expat/ExpatCustoms";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { Fold, TYPE } from "./kit";

/**
 * The three Customs Paths inside the order flow, folded: each path's name,
 * who it's for and its duty and tax, then the documents it needs, read
 * from the same copy as the landing's Customs section and set as equals, as
 * there, ruled one from the next, with the landing's word that customs may
 * ask for more. The same for every
 * customer, never matched to their answers, so it can't give away the
 * internal Customs Category (docs/adr/0002). It ends on the promise that ops
 * recommends a path at review and the choice stays the customer's.
 */
export function CustomsPaths({
  id,
  title,
  edges = "both",
  className,
}: {
  id: string;
  title: string;
  /** its hairlines: both in a column of rows, top only as a card's last row */
  edges?: "both" | "top";
  className?: string;
}) {
  const t = useT();
  return (
    <Fold id={id} title={title} className={cn("border-t border-border", edges === "both" && "border-b", className)}>
      <p className="text-sm text-muted">{t("expatOrder.customs.lead")}</p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {CUSTOMS_ROUTES.map(({ key, docs }) => {
          const k = (path: string) => t(`expat.customs.${key}.${path}`);
          return (
            <li key={key} className="py-4">
              {/* as on the landing: the name, then the same two facts */}
              <p className={TYPE.subhead}>{k("name")}</p>
              <dl className="mt-1 text-sm">
                <div className="flex flex-wrap gap-x-1">
                  <dt className="text-muted">{t("expat.customs.forLabel")}:</dt>
                  <dd className="font-medium">{k("when")}</dd>
                </div>
                <div className="flex flex-wrap gap-x-1">
                  <dt className="text-muted">{t("expat.customs.dutyLabel")}:</dt>
                  <dd className="font-medium">{k("verdict")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-medium">{t("expatOrder.customs.needed")}</p>
              <ul className="mt-1 grid grid-cols-1 gap-1">
                {docs.map((d) => (
                  <li key={d} className="flex gap-2 text-sm">
                    <span className="flex h-5 shrink-0 items-center">
                      <FileText aria-hidden className="size-4 text-muted" />
                    </span>
                    <DocName doc={k(d)} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-muted">{t("expat.customs.extraDocs")}</p>
      <p className="mt-2 text-sm text-muted">{t("expatOrder.customs.close")}</p>
    </Fold>
  );
}
