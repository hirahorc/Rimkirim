"use client";

import * as React from "react";
import Link from "next/link";
import { Wrench, ArrowRight, Eye, BellRing } from "lucide-react";
import {
  useOrderStore,
  type Order,
  type OrderStatus,
} from "@/lib/store/useOrderStore";
import { PHASE_STEPS } from "./StatusStepper";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

const ALL_STATES: OrderStatus[] = [...PHASE_STEPS, "cancelled"];

/** Preset attention overlays the ops panel can set on an order to demo the banner. */
const ATTENTION_PRESETS: { key: string; labelKey: string }[] = [
  { key: "order.attQuotationReady", labelKey: "ops.attQuotation" },
  { key: "order.attRevision", labelKey: "ops.attRevision" },
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

  const currentIdx = PHASE_STEPS.indexOf(order.status as (typeof PHASE_STEPS)[number]);
  const next = currentIdx >= 0 && currentIdx < PHASE_STEPS.length - 1
    ? PHASE_STEPS[currentIdx + 1]
    : null;

  const identifier = order.status === "draft" ? order.bookingNumber : order.trackingNumber;

  return (
    <Card className="border-info/40 bg-info/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-info">
            <Wrench className="size-3.5" /> {t("ops.title")}
          </p>
          <Link
            href={`/pesanan/${order.id}`}
            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-brand transition-colors hover:text-brand-dim"
          >
            {identifier ?? "—"} <Eye className="size-3.5" />
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted">{order.ownerEmail}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-2">{t("ops.advance")}</p>
          <Button
            size="sm"
            variant="secondary"
            disabled={!next}
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
            variant={order.attention ? "outline" : "secondary"}
            onClick={() => setOrderAttention(order.id, null)}
          >
            {t("ops.attNone")}
          </Button>
          {ATTENTION_PRESETS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={order.attention === p.key ? "danger" : "outline"}
              onClick={() => setOrderAttention(order.id, p.key)}
              className={cn(order.attention === p.key && "!border-danger/40")}
            >
              {t(p.labelKey)}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/** "in-transit" → "InTransit" for the `order.status*` i18n keys. */
function capitalize(s: OrderStatus): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
