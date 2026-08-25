"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Barcode,
  Check,
  FilePlus2,
  Package,
  Plane,
  ReceiptText,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

/** Event-type dot colours — the notification bell popover still renders events
 *  as compact dots; the timeline itself has moved to icon tiles below. */
export const EVENT_DOT: Record<TimelineEventType, string> = {
  created: "border-border bg-surface-2",
  submitted: "bg-brand",
  resubmitted: "bg-brand",
  quotation: "bg-brand",
  pickup: "bg-brand",
  "in-transit": "bg-brand",
  clearance: "bg-brand",
  delivery: "bg-brand",
  delivered: "bg-success",
  cancelled: "bg-danger",
  attention: "bg-warning",
  "attention-cleared": "bg-surface-3",
  awb: "bg-brand",
};

/* Each event renders as an icon tile on the rail plus an action-family badge
   (create / update / done / attention / cancelled) before its title. The
   families speak in status hues; the many "update" events stay info-blue so
   lime keeps its One-Voice budget elsewhere on the page. */
const EVENT_META: Record<
  TimelineEventType,
  { icon: LucideIcon; tile: string; badge: BadgeProps["variant"]; badgeKey: string }
> = {
  created: {
    icon: FilePlus2,
    tile: "border border-border bg-surface-2 text-muted",
    badge: "neutral",
    badgeKey: "order.tlBadgeCreated",
  },
  submitted: { icon: Send, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  resubmitted: { icon: RefreshCw, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  quotation: { icon: ReceiptText, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  pickup: { icon: Package, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  "in-transit": { icon: Plane, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  clearance: { icon: ShieldCheck, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  delivery: { icon: Truck, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  awb: { icon: Barcode, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  "attention-cleared": { icon: Check, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  delivered: { icon: Check, tile: "bg-success/15 text-success", badge: "success", badgeKey: "order.tlBadgeDone" },
  attention: { icon: AlertTriangle, tile: "bg-warning/15 text-warning", badge: "warning", badgeKey: "order.tlBadgeAttention" },
  cancelled: { icon: X, tile: "bg-danger/15 text-danger", badge: "danger", badgeKey: "order.tlBadgeCancelled" },
};

/* Phase milestones read a step heavier than housekeeping events (attention
   raised/cleared, AWB churn) so the log doubles as an achievement trail. */
const MILESTONE = new Set<TimelineEventType>([
  "submitted",
  "resubmitted",
  "quotation",
  "pickup",
  "in-transit",
  "clearance",
  "delivery",
  "delivered",
]);

/** Vertical activity log for an order — newest event on top. */
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  const t = useT();
  const { locale } = useLanguage();
  if (!events || events.length === 0) return null;

  const sorted = [...events].reverse(); // stored oldest→newest; show newest first
  // 24-hour in both locales: logistics timestamps read as clock time, not
  // conversation ("13:51 · 22 Okt 2026")
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    // de-boxed to match OrderSummary's Section language — the whole reference
    // zone reads as one document; the icon rail itself carries the shape.
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {t("order.tdTimeline")}
      </h2>
      <ol className="mt-4">
        {sorted.map((ev, i) => {
          const meta = EVENT_META[ev.type];
          return (
            <li key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* the rail: a hairline between this tile and the next */}
              {i < sorted.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[17px] top-9 w-px bg-border" />
              )}
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  meta.tile,
                )}
              >
                <meta.icon aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <Badge variant={meta.badge} className="uppercase tracking-wide">
                    {t(meta.badgeKey)}
                  </Badge>
                  <p
                    className={cn(
                      "text-sm",
                      MILESTONE.has(ev.type) ? "font-medium text-foreground" : "text-muted",
                    )}
                  >
                    {t(ev.messageKey)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-2">
                  {timeFmt.format(ev.at)} · {dateFmt.format(ev.at)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
