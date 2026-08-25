"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Wrench,
  ArrowRight,
  Eye,
  BellRing,
  ReceiptText,
  AlertCircle,
  CalendarCheck,
  Truck,
  ShieldCheck,
  PenLine,
} from "lucide-react";
import {
  useOrderStore,
  MAX_NPD_ROUNDS,
  CLEARANCE_RELEASED,
  type Order,
  type OrderStatus,
  type PickupFailCause,
  type ModuleId,
} from "@/lib/store/useOrderStore";
import { PHASE_STEPS } from "./StatusStepper";
import { MODULE_META } from "@/components/order/module-meta";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

const ALL_STATES: OrderStatus[] = [...PHASE_STEPS, "cancelled"];

/** Preset attention overlays the ops panel can set on an order to demo the banner. */
const ATTENTION_PRESETS: { key: string; labelKey: string }[] = [
  { key: "order.attQuotationReady", labelKey: "ops.attQuotation" },
  { key: "order.attPickupFailed", labelKey: "ops.attPickup" },
];

/**
 * Ops control plane — the single mechanism to demo transitions. Simulates what
 * the operations team would do (advance phases, raise attention flags); every
 * change shows up instantly on the customer tracking page via the shared store.
 */
export function OpsSimulator({ order }: { order: Order }) {
  const t = useT();
  const setOrderStatus = useOrderStore((s) => s.setOrderStatus);
  const setOrderAttention = useOrderStore((s) => s.setOrderAttention);
  const issueQuotation = useOrderStore((s) => s.issueQuotation);
  const bookPickup = useOrderStore((s) => s.bookPickup);
  const recordPickupFail = useOrderStore((s) => s.recordPickupFail);
  const expireDropOff = useOrderStore((s) => s.expireDropOff);
  const issueNewAwb = useOrderStore((s) => s.issueNewAwb);
  const confirmDroppedOff = useOrderStore((s) => s.confirmDroppedOff);
  const setClearanceStep = useOrderStore((s) => s.setClearanceStep);
  const setClearanceBlocked = useOrderStore((s) => s.setClearanceBlocked);
  const raiseNpd = useOrderStore((s) => s.raiseNpd);
  const resubmitClearance = useOrderStore((s) => s.resubmitClearance);
  const resolveClearance = useOrderStore((s) => s.resolveClearance);
  const requestRevision = useOrderStore((s) => s.requestRevision);

  const [revModule, setRevModule] = React.useState<ModuleId>(
    MODULE_META[0].id as ModuleId,
  );
  const [revNote, setRevNote] = React.useState("");
  const canRevise = order.status === "review" || order.status === "quotation";

  const customerFails = order.pickupFails.filter(
    (f) => f.cause === "customer",
  ).length;
  const carrierFails = order.pickupFails.filter(
    (f) => f.cause === "carrier",
  ).length;
  const clStep = order.status === "clearance" ? order.clearanceStep : null;
  const canComplete =
    clStep != null &&
    CLEARANCE_RELEASED.includes(clStep) &&
    (clStep !== "sptnp" || order.taxPaidAt != null);

  const currentIdx = PHASE_STEPS.indexOf(order.status as (typeof PHASE_STEPS)[number]);
  const next = currentIdx >= 0 && currentIdx < PHASE_STEPS.length - 1
    ? PHASE_STEPS[currentIdx + 1]
    : null;

  const identifier = order.bookingNumber;

  return (
    <Card className="border-info/40 bg-info/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-wide text-info">
            <Wrench className="size-3.5" /> {t("ops.title")}
          </p>
          <Link
            href={`/pesanan/${order.id}`}
            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground transition-colors hover:text-foreground"
          >
            {identifier ?? "–"} <Eye className="size-3.5" />
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">
            {maskEmail(order.ownerEmail)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.opsNotice && (
        <div className="mt-4 rounded-md border border-info/40 bg-info/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-info" />
              <p className="text-sm font-medium text-foreground">
                {t(order.opsNotice.messageKey)}
              </p>
            </div>
            {order.opsNotice.action === "book-pickup" && (
              <Button
                size="sm"
                onClick={() => {
                  bookPickup(order.id);
                  toast.success(t("ops.pickupBookedToast"));
                }}
              >
                <CalendarCheck /> {t("ops.bookPickup")}
              </Button>
            )}
            {order.opsNotice.action === "issue-awb" && (
              <Button
                size="sm"
                onClick={() => {
                  issueNewAwb(order.id);
                  toast.success(t("ops.awbIssuedToast"));
                }}
              >
                <ReceiptText /> {t("ops.pickIssueAwb")}
              </Button>
            )}
            {order.opsNotice.action === "confirm-drop-off" && (
              <Button
                size="sm"
                onClick={() => {
                  confirmDroppedOff(order.id);
                  toast.success(t("ops.dropOffConfirmedToast"));
                }}
              >
                <Truck /> {t("ops.pickConfirmDropOff")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-2">{t("ops.advance")}</p>
          <Button
            size="sm"
            variant="secondary"
            disabled={!next || order.status === "clearance"}
            onClick={() => next && setOrderStatus(order.id, next)}
            className="w-full"
          >
            <ArrowRight />
            {next ? (
              <>
                {t("ops.advanceCta")}: {t(`order.status${capitalize(next)}`)}
              </>
            ) : (
              t("ops.terminalNote")
            )}
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-2">{t("ops.setTo")}</p>
          <Select
            value={order.status}
            onChange={(e) => setOrderStatus(order.id, e.target.value as OrderStatus)}
          >
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>
                {t(`order.status${capitalize(s)}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 border-t border-info/20 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <BellRing className="size-3.5" /> {t("ops.attention")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOrderAttention(order.id, null)}
          >
            {t("ops.attNone")}
          </Button>
          {ATTENTION_PRESETS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={order.attention === p.key ? "danger" : "secondary"}
              onClick={() => setOrderAttention(order.id, p.key)}
              className={cn(order.attention === p.key && "!border-danger/40")}
            >
              {t(p.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-info/20 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <PenLine className="size-3.5" /> {t("ops.revise")}
        </p>
        {!canRevise ? (
          <p className="mt-2 text-xs text-muted-2">{t("ops.reviseInactive")}</p>
        ) : (
          <div className="mt-2 space-y-2">
            <Select
              value={revModule}
              onChange={(e) => setRevModule(e.target.value as ModuleId)}
            >
              {MODULE_META.map((m) => (
                <option key={m.id} value={m.id}>
                  {t(m.titleKey)}
                </option>
              ))}
            </Select>
            <Input
              value={revNote}
              onChange={(e) => setRevNote(e.target.value)}
              placeholder={t("ops.reviseNotePlaceholder")}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                requestRevision(order.id, revModule, revNote);
                setRevNote("");
                toast.info(t("ops.reviseToast"));
              }}
            >
              <PenLine /> {t("ops.reviseCta")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-info/20 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <ReceiptText className="size-3.5" /> {t("ops.quotation")}
        </p>
        {order.quotation ? (
          <p className="mt-2 text-xs text-muted">{t("ops.quotationIssued")}</p>
        ) : (
          <div className="mt-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={order.status === "draft"}
              onClick={() => issueQuotation(order.id)}
            >
              <ReceiptText /> {t("ops.issueQuotation")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-info/20 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <Truck className="size-3.5" /> {t("ops.pickup")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>{t("ops.awbLabel")}:</span>
          <span className="font-mono font-medium text-foreground">
            {order.awb ?? "–"}
          </span>
          {(customerFails > 0 || carrierFails > 0) && (
            <span className="text-muted-2">
              · {customerFails}× {t("ops.failCustomer")} · {carrierFails}×{" "}
              {t("ops.failFedEx")}
            </span>
          )}
        </div>
        {order.status === "pickup" && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => recordPickupFail(order.id, "customer" as PickupFailCause)}
            >
              {t("ops.failCtaCustomer")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => recordPickupFail(order.id, "carrier" as PickupFailCause)}
            >
              {t("ops.failCtaFedEx")}
            </Button>
            {order.dropOff &&
              !order.dropOff.expired &&
              !order.dropOff.fulfilledAt && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => expireDropOff(order.id)}
                >
                  {t("ops.dropOffExpire")}
                </Button>
              )}
          </div>
        )}
        {order.pickupChoicePending && (
          <p className="mt-2 text-xs text-muted-2">{t("ops.waitingChoice")}</p>
        )}
        {order.dropOff && (
          <p className="mt-2 text-xs text-muted-2">
            {order.dropOff.expired
              ? t("ops.dropOffExpired")
              : order.dropOff.fulfilledAt
                ? t("ops.dropOffFulfilled")
                : t("ops.dropOffPending")}
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-info/20 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
          <ShieldCheck className="size-3.5" /> {t("ops.clearance")}
        </p>
        {clStep == null ? (
          <p className="mt-2 text-xs text-muted-2">{t("ops.clearanceInactive")}</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {clStep === "pre-clearance" && (
              <>
                <Button
                  size="sm"
                  variant={order.clearanceBlocked ? "danger" : "secondary"}
                  onClick={() =>
                    setClearanceBlocked(order.id, !order.clearanceBlocked)
                  }
                >
                  {order.clearanceBlocked ? t("ops.clUnblock") : t("ops.clBlock")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={order.clearanceBlocked}
                  onClick={() => setClearanceStep(order.id, "barpin-confirm")}
                >
                  {t("ops.clToBarpin")}
                </Button>
              </>
            )}
            {clStep === "barpin-confirm" && (
              <p className="text-xs text-muted-2">{t("ops.clAwaitBarpin")}</p>
            )}
            {clStep === "submitted" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setClearanceStep(order.id, "bc-review")}
              >
                {t("ops.clToBcReview")}
              </Button>
            )}
            {(clStep === "bc-review" || clStep === "npd") && (
              <>
                {clStep === "npd" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => resubmitClearance(order.id)}
                  >
                    {t("ops.clResubmit")}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={order.npdRound >= MAX_NPD_ROUNDS}
                  onClick={() => raiseNpd(order.id)}
                >
                  {order.npdRound >= MAX_NPD_ROUNDS
                    ? t("ops.clNpdMax")
                    : t("ops.clRaiseNpd")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolveClearance(order.id, "sppb")}
                >
                  {t("ops.clResolveSppb")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolveClearance(order.id, "sppbl")}
                >
                  {t("ops.clResolveSppbl")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolveClearance(order.id, "sptnp")}
                >
                  {t("ops.clResolveSptnp")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => resolveClearance(order.id, "reject")}
                >
                  {t("ops.clReject")}
                </Button>
              </>
            )}
            {clStep === "sptnp" && !order.taxPaidAt && (
              <p className="text-xs text-muted-2">{t("ops.clAwaitTax")}</p>
            )}
            {canComplete && (
              <Button
                size="sm"
                onClick={() => {
                  setOrderStatus(order.id, "delivery");
                  toast.success(t("ops.clearanceCompleteToast"));
                }}
              >
                {t("ops.clearanceComplete")}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/** Mask an owner email on the shared ops view: "marketing@rimkirim.com" → "m****@rimkirim.com". */
function maskEmail(email: string | null): string {
  if (!email) return "–";
  const [local, domain] = email.split("@");
  if (!domain) return "–";
  const head = local.slice(0, 1);
  return `${head}${"*".repeat(Math.max(1, local.length - 1))}@${domain}`;
}

/** "in-transit" → "InTransit" for the `order.status*` i18n keys. */
function capitalize(s: OrderStatus): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
