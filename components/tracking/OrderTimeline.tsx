"use client";

import type { TimelineEvent, TimelineEventType } from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** Event-type dot colours — shared with the notification bell so an event
 *  reads the same in the log and in the popover. */
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
  const timeFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    // de-boxed to match OrderSummary's Section language — the whole reference
    // zone reads as one document; the dotted timeline itself carries the shape.
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {t("order.tdTimeline")}
      </h2>
      <ol className="mt-3">
        {sorted.map((ev, i) => (
          <li key={ev.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < sorted.length - 1 && (
              <span className="absolute left-[5px] top-3.5 h-full w-px bg-border" />
            )}
            <span
              className={cn(
                "relative mt-1.5 size-3 shrink-0 rounded-full border",
                EVENT_DOT[ev.type],
              )}
            />
            <div>
              <p
                className={cn(
                  "text-sm",
                  MILESTONE.has(ev.type)
                    ? "font-medium text-foreground"
                    : "text-muted",
                )}
              >
                {t(ev.messageKey)}
              </p>
              <p className="mt-0.5 text-xs text-muted-2">
                {timeFmt.format(ev.at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
