"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/lib/store/useOrderStore";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const DOT: Record<TimelineEventType, string> = {
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
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-brand/10 text-brand">
          <Activity className="size-3.5" />
        </span>
        {t("order.tdTimeline")}
      </h2>
      <ol className="mt-4">
        {sorted.map((ev, i) => (
          <li key={ev.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < sorted.length - 1 && (
              <span className="absolute left-[5px] top-3.5 h-full w-px bg-border" />
            )}
            <span
              className={cn(
                "relative mt-1.5 size-3 shrink-0 rounded-full border",
                DOT[ev.type],
              )}
            />
            <div>
              <p className="text-sm">{t(ev.messageKey)}</p>
              <p className="mt-0.5 text-xs text-muted-2">
                {timeFmt.format(ev.at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
