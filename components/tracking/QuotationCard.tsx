"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ReceiptText,
  CheckCircle2,
  MessageCircle,
  PenLine,
  Clock3,
  Check,
  Info,
  Warehouse,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useOrderStore, type Order } from "@/lib/store/useOrderStore";
import { CollapseHeight } from "@/components/ui/disclosure";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { AttentionStrip } from "@/components/tracking/AttentionStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { formatCurrency } from "@/lib/data/currencies";
import { cn } from "@/lib/utils/cn";
import { RevisionDialog } from "./RevisionDialog";
import { WA_URL } from "@/lib/contact";

/** The ops-issued quotation with approve / contact-support / revise actions. */
export function QuotationCard({
  order,
  attention = null,
}: {
  order: Order;
  /** the order's attention state, worn as this card's head */
  attention?: string | null;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const approveQuotation = useOrderStore((s) => s.approveQuotation);
  const [revOpen, setRevOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [approveError, setApproveError] = React.useState(false);
  // breakdown open while approval is the live decision; once the quotation is
  // archive material the card shrinks to header + total so it stops towering
  // over the panel that actually needs the customer
  const [breakdownOpen, setBreakdownOpen] = React.useState(
    order.status === "quotation",
  );
  // hooks stay above the early return
  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  if (!order.quotation) return null;
  const qu = order.quotation;
  // only packages that actually triggered a surcharge earn a breakdown row
  const surchargePkgs = (qu.packages ?? []).filter((p) => p.triggered.length > 0);
  const pendingApproval = order.status === "quotation";
  // past validUntil the lime Approve would be a lie next to a dead date:
  // the card switches to warning ink and routes to support instead
  const expired = pendingApproval && qu.validUntil < Date.now();
  // the WA composer opens pre-filled so nobody has to memorise the booking
  // number mid-thumb-scroll
  const waUrl = `${WA_URL}?text=${encodeURIComponent(
    `${t("order.quWaText")} ${order.bookingNumber ?? ""}`.trim(),
  )}`;
  const approved = [
    "pickup",
    "in-transit",
    "clearance",
    "delivery",
    "delivered",
  ].includes(order.status);

  return (
    <>
      <Card className="rounded-md p-5 sm:p-6">
        <AttentionStrip attention={attention} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
            <ReceiptText className="size-4 text-foreground" />
            {t("order.tdQuotationSection")}
          </h2>
          {expired ? (
            // the badge must not say "awaiting approval" beside a dead date
            <Badge variant="warning">{t("order.quExpired")}</Badge>
          ) : pendingApproval ? (
            // purple, not brand: a quotation waits on the customer, and that
            // is the "your move" voice the status badge and the list speak
            // (The Whose-Move Rule); lime belongs to the Approve CTA alone
            <Badge variant="accent">
              <Clock3 className="size-3" /> {t("order.quPending")}
            </Badge>
          ) : approved ? (
            <Badge variant="success">
              <CheckCircle2 className="size-3" /> {t("order.quApproved")}
            </Badge>
          ) : order.status === "cancelled" ? (
            // a cancelled order's quotation is neither pending nor in revision —
            // claiming "in revision" beside the cancellation notice would lie
            <Badge variant="neutral">{t("order.statusCancelled")}</Badge>
          ) : (
            <Badge variant="warning">{t("order.quInRevision")}</Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-2">{t("order.quTotal")}</p>
            <p className="mt-0.5 font-mono text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {formatIDR(qu.total)}
            </p>
          </div>
          {/* only while the decision is live: an approved card headlining a
              stale "valid until" date would just sow doubt */}
          {pendingApproval && (
            // the deadline is the one number this phase turns on: a clock is
            // time pressure, so it keeps the hold hue (orange glyph, ink words)
            // even though the card itself is "your move"
            <p className="flex items-center gap-1.5 text-sm font-medium text-warning-ink">
              <Clock3 className="size-4 text-warning" aria-hidden />
              {expired ? t("order.quExpired") : t("order.quValidUntil")}:{" "}
              {dateFmt.format(qu.validUntil)}
            </p>
          )}
        </div>
        {expired && (
          <p className="mt-2 text-sm font-medium text-warning-ink">
            {t("order.quExpiredHint")}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-2">
          <span className="font-mono tabular-nums">{formatIDR(qu.perKg)}</span> /{" "}
          {t("order.tdPerKg")} · {formatNumber(qu.chargeableKg, 1, locale)} kg ·{" "}
          {t("order.quIssued")} {dateFmt.format(qu.issuedAt)}
        </p>

        {/* Breakdown — what is billed: base rate + the one charged surcharge per package.
            Collapsible (open by default) so the long detail can be tidied away; the big
            Total above stays visible either way. */}
        <div className="mt-5">
          {/* py-3.5 grows the 16px text row to a 44px hit area; the negative
              margin gives the space right back so the layout doesn't move */}
          <button
            type="button"
            onClick={() => setBreakdownOpen((v) => !v)}
            aria-expanded={breakdownOpen}
            aria-controls="quotation-breakdown"
            className="-my-3.5 flex w-full items-center justify-between gap-2 py-3.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            {t("order.quSecBreakdown")}
            {/* swap, never rotate — the shared disclosure idiom */}
            {breakdownOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {/* the shared disclosure motion (auto-duration height), not a snap —
              the same idiom every state-driven collapsible on the page speaks */}
          <CollapseHeight open={breakdownOpen}>
          {/* pt, not mt: a top margin escapes the collapsible's scrollHeight
              measurement and the open animation ends on a 12px snap */}
          <div id="quotation-breakdown" className="pt-3 space-y-3">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted">
                {t("order.tdBaseRate")}{" "}
                <span className="text-muted-2">
                  (<span className="font-mono tabular-nums">{formatIDR(qu.perKg)}</span>
                  {" × "}
                  {formatNumber(qu.chargeableKg, 1, locale)} kg)
                </span>
              </span>
              <span className="shrink-0 font-mono font-medium tabular-nums">
                {formatIDR(qu.baseRate)}
              </span>
            </div>

            {/* per-package surcharges: every triggered line shown; the charged one
                carries a check, the rest are struck through (only the highest counts) */}
            {surchargePkgs.map((pkg) => (
              <div key={pkg.index} className="rounded-sm bg-surface-2 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground">
                    {t("order.quPackage")} {pkg.index}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-muted-2">
                    {formatNumber(pkg.weightKg, 1, locale)}kg ·{" "}
                    {formatNumber(pkg.length, 1, locale)}×
                    {formatNumber(pkg.width, 1, locale)}×
                    {formatNumber(pkg.height, 1, locale)}
                  </p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {pkg.triggered.map((s) => (
                    <li
                      key={s.code}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span
                        className={cn(
                          "flex items-start gap-1.5",
                          s.applied ? "text-foreground" : "text-muted-2 line-through",
                        )}
                      >
                        {s.applied ? (
                          <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} />
                        ) : (
                          <span className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        )}
                        {/* line-through is invisible to screen readers, which
                            would happily read a struck fee as a charge */}
                        {!s.applied && (
                          <span className="sr-only">
                            ({t("order.quNotCharged")}){" "}
                          </span>
                        )}
                        {s.label}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 font-mono tabular-nums",
                          s.applied
                            ? "font-medium text-foreground"
                            : "text-muted-2 line-through",
                        )}
                      >
                        {formatIDR(s.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {surchargePkgs.length > 0 && (
              <p className="text-xs text-muted-2">
                {t("order.quSurchargeNote")}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{t("order.quSurcharge")}</span>
              <span
                className={cn(
                  "shrink-0 font-mono tabular-nums",
                  qu.surchargeTotal > 0 ? "font-medium text-foreground" : "text-muted-2",
                )}
              >
                {formatIDR(qu.surchargeTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-semibold">
              <span>{t("order.quTotal")}</span>
              <span className="font-mono tabular-nums">{formatIDR(qu.total)}</span>
            </div>
          </div>
          </CollapseHeight>
        </div>

        {/* Information — shown for transparency but NOT part of the payable total */}
        <div className="mt-6 border-t border-dashed border-border pt-5">
          <p className="flex items-center gap-1.5 font-display text-xs font-medium uppercase tracking-wide text-muted-2">
            <Info className="size-3.5" />
            {t("order.quSecInfo")}
          </p>

          {/* Potential tax — always zero here; Indonesian Customs sets the final figure */}
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-foreground">{t("order.quSecTax")}</h3>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">{t("order.quTaxEstimatedValue")}</span>
                <span className="shrink-0 font-mono tabular-nums text-foreground">
                  {formatCurrency(qu.declaredValue, qu.declaredCurrency)}
                </span>
              </div>
              {/* the three tax lines always render, zeros included: the full
                  schedule spelled out is part of the receipt's honesty
                  (deliberate call, reverted from a one-line collapse) */}
              {(
                [
                  ["order.quTaxImportDuty", qu.taxes.importDuty],
                  ["order.quTaxVat", qu.taxes.vat],
                  ["order.quTaxIncomeTax", qu.taxes.incomeTax],
                ] as const
              ).map(([key, amount]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted">{t(key)}</span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-2">
                    {formatIDR(amount)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-2">
              {t("order.quTaxCaption")}
            </p>
          </div>

          {/* Warehouse fee — only accrues past the free window; never in the total */}
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Warehouse className="size-3.5" />
              {t("order.quSecWarehouse")}
            </h3>
            <p className="mt-1 text-sm text-muted">
              <span className="font-mono tabular-nums">
                {formatIDR(qu.warehousePerKgPerDay)}
              </span>
              {t("order.quWarehousePerKgDay")} · {t("order.quWarehouseFreeNote")}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {t("order.quWarehouseFromDay")}{" "}
              <span className="font-mono font-medium tabular-nums text-foreground">
                {formatIDR(qu.warehousePerDay)}
              </span>
              {t("order.quWarehousePerDay")}
            </p>
          </div>
        </div>

        {pendingApproval && (
          <div className="mt-4 space-y-2">
            {/* a multi-million-rupiah commitment is never one tap: the button
                opens a confirm sheet that restates what is being agreed to.
                Expired quotes hide it — the hint beside the total routes to
                support instead */}
            {!expired && (
              <Button className="w-full" onClick={() => setApproveOpen(true)}>
                <CheckCircle2 /> {t("order.quApprove")}
              </Button>
            )}
            <Button asChild variant="secondary" className="w-full">
              <a href={waUrl} target="_blank" rel="noreferrer">
                <MessageCircle /> {t("order.quContact")}
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setRevOpen(true)}
            >
              <PenLine /> {t("order.quRevise")}
            </Button>
          </div>
        )}
      </Card>

      <Dialog
        open={approveOpen}
        onOpenChange={(next) => {
          setApproveOpen(next);
          if (!next) setApproveError(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("order.quApproveConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("order.quApproveConfirmBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="rounded-sm bg-surface-2 p-3.5">
              <p className="text-xs text-muted-2">{t("order.quTotal")}</p>
              <p className="mt-0.5 font-mono text-2xl font-bold tracking-tight tabular-nums text-foreground">
                {formatIDR(qu.total)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-2">
                <Clock3 className="size-3.5" />
                {t("order.quValidUntil")}: {dateFmt.format(qu.validUntil)}
              </p>
            </div>
            {approveError && (
              <p className="mt-3 text-sm font-medium text-danger-ink" role="alert">
                {t("order.quApproveFailed")}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>
              {t("order.baCancel")}
            </Button>
            <Button
              onClick={() => {
                approveQuotation(order.id);
                // the store action is a guarded no-op outside `quotation` —
                // only celebrate if the approval actually landed
                const now = useOrderStore
                  .getState()
                  .orders.find((o) => o.id === order.id);
                if (now?.status === "pickup") {
                  setApproveOpen(false);
                  setApproveError(false);
                  toast.success(t("order.quApprovedToast"));
                } else {
                  // failure keeps the dialog open with the error inline:
                  // the recovery (try again) belongs to the dialog that just
                  // took the commitment, not to the user via a page reload
                  setApproveError(true);
                }
              }}
            >
              <CheckCircle2 /> {t("order.quApproveConfirmCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RevisionDialog
        orderId={order.id}
        open={revOpen}
        onOpenChange={setRevOpen}
      />
    </>
  );
}
