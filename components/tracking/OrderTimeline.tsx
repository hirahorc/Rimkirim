"use client";

import * as React from "react";
// solid glyphs: a 36px tile on the rail is an anchor, and a filled shape
// reads as one from across the room where a 2px line reads as a diagram
import {
  ArrowPathIcon,
  CheckIcon,
  CubeIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
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
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    tile: string;
    badge: BadgeProps["variant"];
    badgeKey: string;
  }
> = {
  created: {
    icon: DocumentPlusIcon,
    tile: "bg-surface-2 text-muted",
    badge: "neutral",
    badgeKey: "order.tlBadgeCreated",
  },
  submitted: { icon: PaperAirplaneIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  resubmitted: { icon: ArrowPathIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  quotation: { icon: ReceiptPercentIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  pickup: { icon: CubeIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  "in-transit": { icon: PaperAirplaneIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  clearance: { icon: ShieldCheckIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  delivery: { icon: TruckIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  awb: { icon: QrCodeIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  "attention-cleared": { icon: CheckIcon, tile: "bg-info/15 text-info", badge: "info", badgeKey: "order.tlBadgeUpdate" },
  delivered: { icon: CheckIcon, tile: "bg-success/15 text-success", badge: "success", badgeKey: "order.tlBadgeDone" },
  attention: { icon: ExclamationTriangleIcon, tile: "bg-warning/15 text-warning", badge: "warning", badgeKey: "order.tlBadgeAttention" },
  cancelled: { icon: XMarkIcon, tile: "bg-danger/15 text-danger", badge: "danger", badgeKey: "order.tlBadgeCancelled" },
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
  // 24-hour in both locales: logistics timestamps read as clock time, not
  // conversation ("13:51 · 22 Okt 2026"); built once per locale, not per render
  const timeFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }),
    [locale],
  );
  const dateFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );
  if (!events || events.length === 0) return null;

  const sorted = [...events].reverse(); // stored oldest→newest; show newest first

  return (
    // de-boxed to match OrderSummary's Section language — the whole reference
    // zone reads as one document; the icon rail itself carries the shape.
    <section>
      {/* h3 like the record's SectionTitle: sections under the "Detail
          Pesanan" tier h2 */}
      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {t("order.tdTimeline")}
      </h3>
      <ol className="mt-4">
        {sorted.map((ev, i) => {
          const meta = EVENT_META[ev.type];
          return (
            <li key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* the rail: a hairline between this tile and the next */}
              {i < sorted.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[1.125rem] top-9 w-px -translate-x-1/2 bg-border" />
              )}
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full",
                  meta.tile,
                )}
              >
                <meta.icon aria-hidden className="size-[1.125rem]" />
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
