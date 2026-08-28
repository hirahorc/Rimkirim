"use client";

import type { OrderStatus } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { Badge } from "@/components/ui/badge";

const STATUS_META: Record<
  OrderStatus,
  { labelKey: string; variant: "neutral" | "brand" | "warning" | "info" | "success" | "danger" }
> = {
  draft: { labelKey: "order.statusDraft", variant: "neutral" },
  review: { labelKey: "order.statusReview", variant: "neutral" },
  // quotation asks something of the customer (approve it), so it speaks the
  // ask-colour, not the brand lime: lime an inch from an amber attention row
  // read as two different verdicts about the same order
  quotation: { labelKey: "order.statusQuotation", variant: "warning" },
  // routine progress speaks info-blue; warning is reserved for states that
  // actually ask something of the customer (attention banners, missing docs)
  pickup: { labelKey: "order.statusPickup", variant: "info" },
  "in-transit": { labelKey: "order.statusInTransit", variant: "info" },
  clearance: { labelKey: "order.statusClearance", variant: "info" },
  delivery: { labelKey: "order.statusDelivery", variant: "info" },
  delivered: { labelKey: "order.statusDelivered", variant: "success" },
  cancelled: { labelKey: "order.statusCancelled", variant: "danger" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{t(meta.labelKey)}</Badge>;
}
