"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  FileCheck2,
  PenLine,
  Receipt,
  Info,
} from "lucide-react";
import {
  useOrderStore,
  CLEARANCE_SPINE,
  clearanceSpineIndex,
  CLEARANCE_RELEASED,
  type ClearanceStep,
  type ClearanceSpineNode,
  type Order,
} from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SPINE_LABEL: Record<ClearanceSpineNode, string> = {
  pre: "order.clSpinePre",
  barpin: "order.clSpineBarpin",
  submit: "order.clSpineSubmit",
  bc: "order.clSpineBc",
  result: "order.clSpineResult",
};

const STEP_DESC: Record<ClearanceStep, string> = {
  "pre-clearance": "order.clDescPreClearance",
  "barpin-confirm": "order.clDescBarpinConfirm",
  submitted: "order.clDescSubmitted",
  "bc-review": "order.clDescBcReview",
  npd: "order.clDescNpd",
  sppb: "order.clDescSppb",
  sppbl: "order.clDescSppbl",
  sptnp: "order.clDescSptnp",
  reject: "order.clDescReject",
};

const RESULT_BADGE: Partial<Record<ClearanceStep, string>> = {
  sppb: "order.clResultSppb",
  sppbl: "order.clResultSppbl",
  sptnp: "order.clResultSptnp",
};

/**
 * Live clearance sub-flow, shown while the order is in the clearance phase.
 * Models the BFG import flow from the clearance MD: Pre-Clearance → Barpin
 * confirmation → submission → Bea Cukai review (with NPD rounds) → a final
 * result (SPPB / SPPBL / SPTNP / Reject). Some states need a customer action.
 */
export function ClearancePanel({ order }: { order: Order }) {
  const t = useT();
  const confirmBarpin = useOrderStore((s) => s.confirmBarpin);
  const requestBarpinRevision = useOrderStore((s) => s.requestBarpinRevision);
  const payClearanceTax = useOrderStore((s) => s.payClearanceTax);

  if (order.status !== "clearance") return null;

  const current = order.clearanceStep ?? "pre-clearance";
  const currentIdx = clearanceSpineIndex(current);
  const isReleased = CLEARANCE_RELEASED.includes(current);
  const blocked = current === "pre-clearance" && order.clearanceBlocked;
  const descKey = blocked ? "order.clDescBlocked" : STEP_DESC[current];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-brand/10 text-brand">
            <ShieldCheck className="size-3.5" />
          </span>
          {t("order.stepClearance")}
        </h2>
        {current === "npd" && (
          <Badge variant="warning">
            {t("order.clNpdRound")}
            {order.npdRound}
          </Badge>
        )}
        {isReleased && RESULT_BADGE[current] && (
          <Badge variant={current === "sptnp" ? "warning" : "success"}>
            {t(RESULT_BADGE[current]!)}
          </Badge>
        )}
      </div>

      {/* sub-stepper spine */}
      <div className="mt-4 flex items-start">
        {CLEARANCE_SPINE.map((node, i) => {
          const done = i < currentIdx;
          const currentNode = i === currentIdx;
          return (
            <div
              key={node}
              className={cn(
                "flex flex-1 flex-col items-center",
                i === 0 && "items-start",
                i === CLEARANCE_SPINE.length - 1 && "items-end",
              )}
            >
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === 0 && "bg-transparent",
                    i > 0 && (done || currentNode ? "bg-brand" : "bg-border"),
                  )}
                />
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2",
                    done && "border-brand bg-brand text-white",
                    currentNode && "border-brand bg-brand/10 text-brand",
                    !done &&
                      !currentNode &&
                      "border-border bg-surface-2 text-muted-2",
                  )}
                >
                  {done ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : currentNode ? (
                    <span className="size-1.5 rounded-full bg-brand" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === CLEARANCE_SPINE.length - 1 && "bg-transparent",
                    i < CLEARANCE_SPINE.length - 1 &&
                      (done || currentNode ? "bg-brand" : "bg-border"),
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-1.5 px-0.5 text-center text-[10px] leading-tight sm:text-[11px]",
                  currentNode && "font-semibold text-foreground",
                  done && "font-medium text-brand",
                  !done && !currentNode && "text-muted-2",
                )}
              >
                {t(SPINE_LABEL[node])}
              </p>
            </div>
          );
        })}
      </div>

      {/* current-state description */}
      <p
        className={cn(
          "mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm",
          blocked
            ? "bg-warning/10 text-warning"
            : "bg-surface-2 text-muted",
        )}
      >
        {blocked && <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
        <span>{t(descKey)}</span>
      </p>

      {/* Barpin confirmation — customer action */}
      {current === "barpin-confirm" && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => {
              confirmBarpin(order.id);
              toast.success(t("order.clConfirmBarpinToast"));
            }}
          >
            <FileCheck2 /> {t("order.clConfirmBarpinCta")}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              requestBarpinRevision(order.id);
              toast.info(t("order.clRequestRevisionToast"));
            }}
          >
            <PenLine /> {t("order.clRequestRevisionCta")}
          </Button>
        </div>
      )}
      {current === "submitted" && order.barpinConfirmedAt && (
        <p className="mt-2 text-xs text-muted-2">
          {t("order.clBarpinConfirmedNote")}
        </p>
      )}

      {/* SPTNP — customer pays tax before release */}
      {current === "sptnp" &&
        (order.taxPaidAt ? (
          <p className="mt-3 text-sm text-muted-2">{t("order.clTaxPaidNote")}</p>
        ) : (
          <Button
            className="mt-3"
            onClick={() => {
              payClearanceTax(order.id);
              toast.success(t("order.clPayTaxToast"));
            }}
          >
            <Receipt /> {t("order.clPayTaxCta")}
          </Button>
        ))}

      {/* supporting documents info (from the clearance MD) */}
      <div className="mt-4 rounded-lg border border-border p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <Info className="size-3.5" /> {t("order.clDocsTitle")}
        </p>
        <dl className="mt-2 space-y-2 text-xs">
          {(
            [
              ["order.clDocsSp3bp", "order.clDocsSp3bpDesc"],
              ["order.clDocsStatement", "order.clDocsStatementDesc"],
              ["order.clDocsSkp", "order.clDocsSkpDesc"],
            ] as const
          ).map(([term, desc]) => (
            <div key={term}>
              <dt className="font-semibold text-foreground">{t(term)}</dt>
              <dd className="text-muted">{t(desc)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
