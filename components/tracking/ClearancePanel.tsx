"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, FileCheck2, PenLine, Receipt, Info } from "lucide-react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
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
import { AttentionStrip } from "@/components/tracking/AttentionStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StepRail } from "@/components/tracking/StatusStepper";
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
export function ClearancePanel({
  order,
  attention = null,
}: {
  order: Order;
  /** the order's attention state, worn as this card's head */
  attention?: string | null;
}) {
  const t = useT();
  const confirmBarpin = useOrderStore((s) => s.confirmBarpin);
  const requestBarpinRevision = useOrderStore((s) => s.requestBarpinRevision);
  const payClearanceTax = useOrderStore((s) => s.payClearanceTax);

  if (order.status !== "clearance") return null;

  // guard against any stale/unknown step value from older persisted state
  const current: ClearanceStep =
    order.clearanceStep && order.clearanceStep in STEP_DESC
      ? order.clearanceStep
      : "pre-clearance";
  const currentIdx = clearanceSpineIndex(current);
  const isReleased = CLEARANCE_RELEASED.includes(current);
  const blocked = current === "pre-clearance" && order.clearanceBlocked;
  const descKey = blocked ? "order.clDescBlocked" : STEP_DESC[current];

  return (
    <Card className="rounded-md p-5 sm:p-6">
      <AttentionStrip attention={attention} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
          <ShieldCheck className="size-4 text-foreground" />
          {t("order.stepClearance")}
        </h2>
        {current === "npd" && (
          <Badge variant="warning">
            {t("order.clNpdRound")}
            {order.npdRound}
          </Badge>
        )}
        {/* a tax bill waits on the customer: purple, not orange */}
        {isReleased && RESULT_BADGE[current] && (
          <Badge variant={current === "sptnp" ? "accent" : "success"}>
            {t(RESULT_BADGE[current]!)}
          </Badge>
        )}
      </div>

      {/* sub-stepper spine: the same rail as the order stepper, sized for a card */}
      <div className="mt-4">
        <StepRail
          size="sm"
          steps={CLEARANCE_SPINE.map((node) => ({ key: node, label: t(SPINE_LABEL[node]) }))}
          currentIdx={currentIdx}
          arrived={isReleased && current !== "sptnp"}
        />
      </div>

      {/* current-state description */}
      <p
        className={cn(
          "mt-4 flex items-start gap-2 rounded-sm px-3 py-2.5 text-sm",
          // words wear the ink, the glyph keeps the raw hue (Tint-15/25)
          blocked ? "bg-warning/10 text-warning-ink" : "bg-surface-2 text-muted",
        )}
      >
        {blocked && (
          <ExclamationTriangleIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
        )}
        <span>{t(descKey)}</span>
      </p>

      {/* Barpin confirmation — customer action */}
      {current === "barpin-confirm" && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {/* flex-1 only once the row is a row: in the column, a 0% basis
              lets the buttons collapse to their text height */}
          <Button
            className="sm:flex-1"
            onClick={() => {
              confirmBarpin(order.id);
              // guarded no-op outside barpin-confirm — toast only on effect
              const now = useOrderStore
                .getState()
                .orders.find((o) => o.id === order.id);
              if (now?.barpinConfirmedAt)
                toast.success(t("order.clConfirmBarpinToast"));
            }}
          >
            <FileCheck2 /> {t("order.clConfirmBarpinCta")}
          </Button>
          <Button
            variant="secondary"
            className="sm:flex-1"
            onClick={() => {
              requestBarpinRevision(order.id);
              const now = useOrderStore
                .getState()
                .orders.find((o) => o.id === order.id);
              if (now?.attention === "order.attClearanceBarpinRevision")
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
              const now = useOrderStore
                .getState()
                .orders.find((o) => o.id === order.id);
              if (now?.taxPaidAt) toast.success(t("order.clPayTaxToast"));
            }}
          >
            <Receipt /> {t("order.clPayTaxCta")}
          </Button>
        ))}

      {/* supporting documents info (from the clearance MD): a reference
          panel, so tone rather than outline (The Stroke Rule) */}
      <div className="mt-4 rounded-sm bg-surface-2 p-3">
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
