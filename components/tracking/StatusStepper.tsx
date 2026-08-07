"use client";

import { Check, X } from "lucide-react";
import type { OrderPhase } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** Linear phases a shipment moves through (terminal: delivered / cancelled). */
export const PHASE_STEPS: OrderPhase[] = [
  "review",
  "quotation",
  "pickup",
  "in-transit",
  "clearance",
  "delivery",
  "delivered",
];

const STEP_LABEL_KEYS: Record<OrderPhase, string> = {
  review: "order.statusReview",
  quotation: "order.statusQuotation",
  pickup: "order.statusPickup",
  "in-transit": "order.statusInTransit",
  clearance: "order.statusClearance",
  delivery: "order.statusDelivery",
  delivered: "order.statusDelivered",
  cancelled: "order.statusCancelled",
};

/**
 * Linear status stepper: completed steps check-marked, the current phase
 * highlighted, upcoming ones muted. `cancelled` renders every step dimmed with
 * a terminal marker — the order is no longer moving forward.
 */
export function StatusStepper({ status }: { status: OrderPhase }) {
  const t = useT();
  const cancelled = status === "cancelled";
  const currentIdx = cancelled ? -1 : PHASE_STEPS.indexOf(status);

  return (
    <div className="flex items-start">
      {PHASE_STEPS.map((phase, i) => {
        const done = !cancelled && currentIdx > -1 && i < currentIdx;
        const current = i === currentIdx;
        return (
          <div
            key={phase}
            className="flex flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 && "bg-transparent",
                  i > 0 && (done || current ? "bg-brand" : "bg-border"),
                )}
              />
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2",
                  done && "border-brand bg-brand text-white",
                  current && "border-brand bg-brand/10 text-brand",
                  !done && !current && "border-border bg-surface-2 text-muted-2",
                  cancelled && "border-border bg-surface-2 text-muted-2",
                )}
              >
                {done ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : cancelled ? (
                  <X className="size-3.5" />
                ) : current ? (
                  <span className="size-2 rounded-full bg-brand" />
                ) : null}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === PHASE_STEPS.length - 1 && "bg-transparent",
                  i < PHASE_STEPS.length - 1 &&
                    (done || current ? "bg-brand" : "bg-border"),
                )}
              />
            </div>
            <p
              className={cn(
                "mt-1.5 px-0.5 text-center text-[10px] leading-tight sm:text-[11px]",
                current && "font-semibold text-foreground",
                done && "font-medium text-brand",
                !done && !current && "text-muted-2",
                cancelled && "text-muted-2",
              )}
            >
              {t(STEP_LABEL_KEYS[phase])}
            </p>
          </div>
        );
      })}
    </div>
  );
}
